import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useQuery } from '@realm/react';
import { ApiHandler } from 'src/services/handler/apiHandler';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import {
  InvoiceMode,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import Toast from 'src/components/Toast';

type Params = {
  assetId: string;
  amount: string | number;
  invoiceExpiry: number;
  invoiceType: InvoiceMode;
  useWatchTower: boolean;
  /**
   * Called when errors should exit the screen (mirrors existing behavior in ReceiveAssetScreen).
   */
  onFatalErrorGoBack: () => void;
  /**
   * Localized strings needed for specific error messages.
   */
  strings: {
    assetsInsufficientSats: string;
    assetsAssetProcessErrorMsg: string;
    walletFailedToCreateUTXO: string;
  };
  formatString: (template: string, params: Record<string, any>) => string;
};

export function useReceiveAssetInvoiceFlow({
  assetId,
  amount,
  invoiceExpiry,
  invoiceType,
  useWatchTower,
  onFatalErrorGoBack,
  strings,
  formatString,
}: Params) {
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];

  const { mutate, isLoading: receiveLoading, error: receiveError } = useMutation(
    ApiHandler.receiveAsset,
  );
  const {
    mutate: createUtxos,
    error: createUtxoError,
    data: createUtxoData,
    reset: createUtxoReset,
    isLoading: createUtxosLoading,
  } = useMutation(ApiHandler.createUtxos);
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);

  const lastRequestKeyRef = useRef<string>('');
  const [displayedInvoice, setDisplayedInvoice] = useState<string>('');
  const awaitingInvoiceRef = useRef(false);
  const reqSeqRef = useRef(0);

  const unspent: RgbUnspent[] = useMemo(
    () =>
      rgbWallet.utxos.map((u: any) => (typeof u === 'string' ? JSON.parse(u) : u)),
    [rgbWallet.utxos],
  );
  const colorable = useMemo(
    () =>
      unspent.filter(
        utxo =>
          utxo.utxo.colorable === true &&
          utxo.rgbAllocations?.length === 0 &&
          ((utxo as any).pendingBlinded ?? 0) === 0,
      ),
    [unspent],
  );

  const requestInvoice = useCallback(() => {
    reqSeqRef.current += 1;
    const normalizedAssetId = assetId ?? '';
    const normalizedAmount = amount ?? 0;

    const key = JSON.stringify({
      normalizedAssetId,
      normalizedAmount: normalizedAmount?.toString(),
      invoiceExpiry,
      invoiceType,
      useWatchTower,
      appType: app?.appType,
      colorable: colorable.length,
      // NOTE: Lightning toggle intentionally not used in new flow.
    });
    if (key === lastRequestKeyRef.current) {
      return;
    }
    lastRequestKeyRef.current = key;

    // Clear the currently displayed QR immediately so stale invoices never show
    // while a new invoice is being generated (or if generation fails).
    setDisplayedInvoice('');
    awaitingInvoiceRef.current = true;

    const blinded = invoiceType === InvoiceMode.Blinded;

    if (app.appType !== AppType.ON_CHAIN) {
      // Non-onchain apps: always request RGB invoice (lightning toggle is hidden/not in use).
      if (invoiceType === InvoiceMode.Witness || colorable.length > 0) {
        mutate({
          assetId: normalizedAssetId,
          amount: normalizedAmount,
          linkedAsset: '',
          linkedAmount: 0,
          expiry: invoiceExpiry,
          blinded,
          useWatchTower,
        });
      } else {
        createUtxos();
      }
      return;
    }

    // On-chain flow preserves linked-asset behavior from existing screen.
    if (invoiceType === InvoiceMode.Witness || colorable.length > 0) {
      mutate({
        assetId: normalizedAssetId,
        amount: normalizedAmount,
        linkedAsset: normalizedAssetId,
        linkedAmount: normalizedAmount,
        expiry: invoiceExpiry,
        blinded,
        useWatchTower,
      });
    } else {
      createUtxos();
    }
  }, [
    amount,
    app?.appType,
    assetId,
    colorable.length,
    createUtxos,
    invoiceExpiry,
    invoiceType,
    mutate,
    useWatchTower,
  ]);

  useEffect(() => {
    if (!awaitingInvoiceRef.current) return;
    const inv = rgbWallet?.receiveData?.invoice;
    if (!inv) return;
    setDisplayedInvoice(inv);
    awaitingInvoiceRef.current = false;
  }, [rgbWallet?.receiveData?.invoice]);

  useEffect(() => {
    // Keep UI in sync with Realm updates, but avoid resurfacing a stale invoice
    // while we are actively awaiting a newly requested invoice.
    if (awaitingInvoiceRef.current) return;
    const inv = rgbWallet?.receiveData?.invoice ?? '';
    if (!inv) return;
    setDisplayedInvoice(inv);
  }, [rgbWallet?.receiveData?.invoice]);

  useEffect(() => {
    // Handles errors similarly to existing ReceiveAssetScreen.
    if (!receiveError) return;
    const err: any = receiveError;
    const message =
      err?.message || err?.toString?.() || 'An unknown error occurred';
    if (message === 'Insufficient sats for RGB') {
      createUtxos();
      return;
    }

    if (err?.code === 'AssetNotFound') {
      setTimeout(() => {
        mutate({
          assetId: '',
          amount: 0,
          linkedAsset: assetId,
          linkedAmount: amount,
          expiry: invoiceExpiry,
          blinded: invoiceType === InvoiceMode.Blinded,
          useWatchTower,
        });
      }, 100);
      return;
    }

    Toast(message, true);
    awaitingInvoiceRef.current = false;
    onFatalErrorGoBack();
  }, [
    amount,
    assetId,
    createUtxos,
    invoiceExpiry,
    invoiceType,
    mutate,
    onFatalErrorGoBack,
    receiveError,
    useWatchTower,
  ]);

  useEffect(() => {
    if (createUtxoData) {
      lastRequestKeyRef.current = '';
      const blinded = invoiceType === InvoiceMode.Blinded;
      const normalizedAssetId = assetId ?? '';
      const normalizedAmount = amount ?? 0;
      const isOnChain = app?.appType === AppType.ON_CHAIN;
      mutate({
        assetId: normalizedAssetId,
        amount: normalizedAmount,
        linkedAsset: isOnChain ? normalizedAssetId : '',
        linkedAmount: isOnChain ? normalizedAmount : 0,
        expiry: invoiceExpiry,
        blinded,
        useWatchTower,
      });
      return;
    }

    if (createUtxoError) {
      createUtxoReset();
      fetchUTXOs();
      refreshRgbWallet.mutate();
      awaitingInvoiceRef.current = false;
      onFatalErrorGoBack();

      const errStr = createUtxoError.toString?.() ?? `${createUtxoError}`;
      if (errStr.includes('Insufficient sats for RGB')) {
        Toast(formatString(strings.assetsInsufficientSats, { amount: 2000 }), true);
      } else {
        Toast(strings.assetsAssetProcessErrorMsg, true);
      }
      return;
    }

    if (createUtxoData === false) {
      Toast(strings.walletFailedToCreateUTXO, true);
      awaitingInvoiceRef.current = false;
      onFatalErrorGoBack();
    }
  }, [
    createUtxoData,
    createUtxoError,
  ]);

  const loading = receiveLoading || createUtxosLoading;

  const qrValue = displayedInvoice;

  const clearInvoice = useCallback(() => {
    awaitingInvoiceRef.current = false;
    setDisplayedInvoice('');
  }, []);

  const setLocalInvoice = useCallback((invoice: string) => {
    awaitingInvoiceRef.current = false;
    setDisplayedInvoice(invoice ?? '');
  }, []);

  return {
    rgbWallet,
    app,
    colorableCount: colorable.length,
    loading,
    qrValue,
    requestInvoice,
    clearInvoice,
    setLocalInvoice,
    error: receiveError || createUtxoError,
  };
}


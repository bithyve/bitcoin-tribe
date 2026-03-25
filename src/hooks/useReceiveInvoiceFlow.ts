import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import AppType from 'src/models/enums/AppType';
import {
  InvoiceMode,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import useRgbWallets from 'src/hooks/useRgbWallets';

export type ReceiveInvoiceSelectedType = 'bitcoin' | 'lightning';

export type UseReceiveInvoiceFlowArgs = {
  appType: AppType;
  assetId: string;
  amountBaseUnits: number;
  invoiceExpiry: number;
  invoiceType: InvoiceMode;
  useWatchTower: boolean;
  selectedType: ReceiveInvoiceSelectedType;
  onInvoiceCreated?: () => void;
  formatString: (
    template: string,
    vars: Record<string, string | number>,
  ) => string;
  insufficientSatsTemplate: string;
  assetProcessErrorMsg: string;
  failedToCreateUTXOMsg: string;
  invoiceErrorTitle: string;
};

function getErrorMessage(err: unknown, depth = 0): string {
  if (err == null) {
    return 'An unknown error occurred';
  }
  if (typeof err === 'string') {
    return err;
  }
  const chunks: string[] = [];
  if (err instanceof Error && err.message) {
    chunks.push(err.message);
  }
  chunks.push(String(err));
  if (
    depth < 2 &&
    typeof err === 'object' &&
    err !== null &&
    'cause' in err &&
    (err as { cause?: unknown }).cause != null
  ) {
    chunks.push(getErrorMessage((err as { cause?: unknown }).cause, depth + 1));
  }
  return chunks.filter(Boolean).join(' ');
}

/** RGB needs fresh UTXOs when existing colorable outputs have no free allocation slots. */
function isInsufficientAllocationSlotsError(message: string): boolean {
  return /InsufficientAllocationSlots/i.test(message);
}

export function useReceiveInvoiceFlow({
  appType,
  assetId,
  amountBaseUnits,
  invoiceExpiry,
  invoiceType,
  useWatchTower,
  selectedType,
  onInvoiceCreated,
  formatString,
  insufficientSatsTemplate,
  assetProcessErrorMsg,
  failedToCreateUTXOMsg,
  invoiceErrorTitle,
}: UseReceiveInvoiceFlowArgs) {
  const rgbWallet: RGBWallet | undefined = useRgbWallets({}).wallets[0];

  const unspent: RgbUnspent[] = useMemo(() => {
    const raw = (rgbWallet?.utxos ?? []) as unknown as string[];
    return raw.map(utxoStr => JSON.parse(utxoStr));
  }, [rgbWallet?.utxos]);

  const colorable = useMemo(
    () =>
      unspent.filter(
        utxo =>
          utxo.utxo.colorable === true &&
          utxo.rgbAllocations?.length === 0,
      ),
    [unspent],
  );

  const colorableLenRef = useRef(0);
  colorableLenRef.current = colorable.length;

  /** After createUtxos succeeded once, always chain to receive (do not call createUtxos again on regenerate). */
  const fundingReceiveSetupDoneRef = useRef(false);

  const optsRef = useRef({
    appType,
    assetId,
    amountBaseUnits,
    invoiceExpiry,
    invoiceType,
    useWatchTower,
  });
  optsRef.current = {
    appType,
    assetId,
    amountBaseUnits,
    invoiceExpiry,
    invoiceType,
    useWatchTower,
  };

  const [lightningInvoice, setLightningInvoice] = useState('');
  const [invoiceGenerationFailed, setInvoiceGenerationFailed] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
    title: string;
  }>({ visible: false, message: '', title: '' });

  const dismissErrorModal = useCallback(() => {
    setErrorModal(prev => ({ ...prev, visible: false }));
  }, []);

  const showTerminalError = useCallback(
    (message: string) => {
      setInvoiceGenerationFailed(true);
      setErrorModal({
        visible: true,
        message,
        title: invoiceErrorTitle,
      });
    },
    [invoiceErrorTitle],
  );

  const showTerminalErrorRef = useRef(showTerminalError);
  showTerminalErrorRef.current = showTerminalError;
  const formatStringRef = useRef(formatString);
  formatStringRef.current = formatString;
  const insufficientSatsTemplateRef = useRef(insufficientSatsTemplate);
  insufficientSatsTemplateRef.current = insufficientSatsTemplate;
  const assetProcessErrorMsgRef = useRef(assetProcessErrorMsg);
  assetProcessErrorMsgRef.current = assetProcessErrorMsg;
  const failedToCreateUTXOMsgRef = useRef(failedToCreateUTXOMsg);
  failedToCreateUTXOMsgRef.current = failedToCreateUTXOMsg;

  const onInvoiceScreenFocused = useCallback(() => {
    fundingReceiveSetupDoneRef.current = false;
  }, []);

  const {
    mutate: receiveMutate,
    isLoading: receiveLoading,
    error: receiveError,
    reset: receiveReset,
  } = useMutation(ApiHandler.receiveAsset, {
    onSuccess: () => {
      setInvoiceGenerationFailed(false);
      onInvoiceCreated?.();
    },
  });

  const generateLNInvoiceMutation = useMutation(ApiHandler.receiveAssetOnLN, {
    onSuccess: data => {
      if (data?.invoice) {
        setLightningInvoice(data.invoice);
        setInvoiceGenerationFailed(false);
        onInvoiceCreated?.();
      }
    },
  });

  const {
    mutate: createUtxos,
    error: createUtxoError,
    data: createUtxoData,
    reset: createUtxoReset,
    isLoading: createUtxosLoading,
  } = useMutation(ApiHandler.createUtxos);

  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);

  const receiveMutateRef = useRef(receiveMutate);
  receiveMutateRef.current = receiveMutate;
  const createUtxosRef = useRef(createUtxos);
  createUtxosRef.current = createUtxos;

  const executeInitialBranch = useCallback(() => {
    const o = optsRef.current;
    const cLen = colorableLenRef.current;

    if (o.appType !== AppType.ON_CHAIN) {
      if (o.assetId === '') {
        if (o.invoiceType === InvoiceMode.Witness || cLen > 0) {
          receiveMutateRef.current({
            assetId: o.assetId,
            amount: o.amountBaseUnits,
            linkedAsset: '',
            linkedAmount: 0,
            expiry: o.invoiceExpiry,
            blinded: o.invoiceType === InvoiceMode.Blinded,
          });
        } else if (fundingReceiveSetupDoneRef.current) {
          receiveMutateRef.current({
            assetId: o.assetId,
            amount: o.amountBaseUnits,
            linkedAsset: '',
            linkedAmount: 0,
            expiry: o.invoiceExpiry,
            blinded: o.invoiceType === InvoiceMode.Blinded,
          });
        } else {
          createUtxosRef.current();
        }
      } else {
        generateLNInvoiceMutation.mutate({
          amount: Number(o.amountBaseUnits),
          assetId: o.assetId,
          expiry: o.invoiceExpiry,
        });
      }
    } else {
      if (o.invoiceType === InvoiceMode.Witness || cLen > 0) {
        receiveMutateRef.current({
          assetId: o.assetId,
          amount: o.amountBaseUnits,
          linkedAsset: o.assetId,
          linkedAmount: o.amountBaseUnits,
          expiry: o.invoiceExpiry,
          blinded: o.invoiceType === InvoiceMode.Blinded,
          useWatchTower: o.useWatchTower,
        });
      } else if (fundingReceiveSetupDoneRef.current) {
        receiveMutateRef.current({
          assetId: o.assetId,
          amount: o.amountBaseUnits,
          linkedAsset: '',
          linkedAmount: 0,
          expiry: o.invoiceExpiry,
          blinded: o.invoiceType === InvoiceMode.Blinded,
          useWatchTower: o.useWatchTower,
        });
      } else {
        createUtxosRef.current();
      }
    }
  }, [generateLNInvoiceMutation]);

  const runInvoiceGeneration = useCallback(() => {
    receiveReset();
    generateLNInvoiceMutation.reset();
    createUtxoReset();
    setLightningInvoice('');
    setErrorModal(prev => ({ ...prev, visible: false }));
    executeInitialBranch();
  }, [
    createUtxoReset,
    executeInitialBranch,
    generateLNInvoiceMutation,
    receiveReset,
  ]);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (hasMountedRef.current) {
      return;
    }
    hasMountedRef.current = true;
    executeInitialBranch();
    // Intentionally once on mount; branch reads latest opts/colorable via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!receiveError) {
      return;
    }
    const err = receiveError as Error & { code?: string };
    const errorMessage = getErrorMessage(receiveError);

    if (errorMessage === 'Insufficient sats for RGB') {
      fundingReceiveSetupDoneRef.current = false;
      receiveReset();
      createUtxoReset();
      createUtxos();
      return;
    }
    if (isInsufficientAllocationSlotsError(errorMessage)) {
      fundingReceiveSetupDoneRef.current = false;
      receiveReset();
      createUtxoReset();
      createUtxos();
      return;
    }
    if (err.code === 'AssetNotFound') {
      const o = optsRef.current;
      setTimeout(() => {
        receiveMutate({
          assetId: '',
          amount: 0,
          linkedAsset: o.assetId,
          linkedAmount: o.amountBaseUnits,
          expiry: o.invoiceExpiry,
          blinded: o.invoiceType === InvoiceMode.Blinded,
        });
      }, 100);
      receiveReset();
      return;
    }

    showTerminalErrorRef.current(errorMessage);
    receiveReset();
  }, [
    receiveError,
    createUtxos,
    createUtxoReset,
    receiveMutate,
    receiveReset,
  ]);

  const lnError = generateLNInvoiceMutation.error;
  const lnResetRef = useRef(generateLNInvoiceMutation.reset);
  lnResetRef.current = generateLNInvoiceMutation.reset;
  useEffect(() => {
    if (!lnError) {
      return;
    }
    let errorMessage: string;
    if (lnError instanceof Error) {
      errorMessage = lnError.message;
    } else if (typeof lnError === 'string') {
      errorMessage = lnError;
    } else {
      errorMessage = 'An unexpected error occurred. Please try again.';
    }
    showTerminalErrorRef.current(errorMessage);
    lnResetRef.current();
  }, [lnError]);

  useEffect(() => {
    if (!createUtxoData) {
      return;
    }
    fundingReceiveSetupDoneRef.current = true;
    const o = optsRef.current;
    receiveMutateRef.current({
      assetId: o.assetId,
      amount: o.amountBaseUnits,
      linkedAsset: '',
      linkedAmount: 0,
      expiry: o.invoiceExpiry,
      blinded: o.invoiceType === InvoiceMode.Blinded,
      useWatchTower: o.useWatchTower,
    });
  }, [createUtxoData]);

  useEffect(() => {
    if (!createUtxoError) {
      return;
    }
    createUtxoReset();
    fetchUTXOs();
    refreshRgbWallet.mutate();
    const msg = createUtxoError.toString().includes('Insufficient sats for RGB')
      ? formatStringRef.current(insufficientSatsTemplateRef.current, {
          amount: 2000,
        })
      : assetProcessErrorMsgRef.current;
    showTerminalErrorRef.current(msg);
  }, [
    createUtxoError,
    createUtxoReset,
    fetchUTXOs,
    refreshRgbWallet,
  ]);

  useEffect(() => {
    if (createUtxoData !== false) {
      return;
    }
    showTerminalErrorRef.current(failedToCreateUTXOMsgRef.current);
  }, [createUtxoData]);

  const invoiceLoading = useMemo(
    () =>
      receiveLoading ||
      createUtxosLoading ||
      generateLNInvoiceMutation.isLoading,
    [
      receiveLoading,
      createUtxosLoading,
      generateLNInvoiceMutation.isLoading,
    ],
  );

  const qrValue = useMemo(() => {
    if (selectedType === 'bitcoin') {
      return rgbWallet?.receiveData?.invoice ?? '';
    }
    return lightningInvoice;
  }, [selectedType, rgbWallet?.receiveData?.invoice, lightningInvoice]);

  const showInvoiceQr =
    !invoiceLoading &&
    !invoiceGenerationFailed &&
    Boolean(qrValue && String(qrValue).length > 0);

  return {
    runInvoiceGeneration,
    invoiceLoading,
    invoiceGenerationFailed,
    errorModal,
    dismissErrorModal,
    qrValue,
    showInvoiceQr,
    lightningInvoice,
    onInvoiceScreenFocused,
  };
}

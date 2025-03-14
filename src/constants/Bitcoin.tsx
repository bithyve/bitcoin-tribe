import Scale from 'src/components/Scale';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import BTC from 'src/assets/images/icon_btc.svg';
import { View } from 'react-native';
import Text from 'src/components/AppText';
import React from 'react';
import Colors from 'src/theme/Colors';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import FiatCurrencies from 'src/loc/availableCurrency';

export const SATOSHIS_IN_BTC = 1e8;

export const BtcToSats = (amountInBtc: number) => {
  if (amountInBtc !== 0) {
    return (amountInBtc * SATOSHIS_IN_BTC).toFixed(0);
  }
  return amountInBtc;
};

export const SatsToBtc = (amountInSats: number) => {
  if (amountInSats !== 0) {
    if (amountInSats > 99) {
      return amountInSats / SATOSHIS_IN_BTC;
    }
    return (amountInSats / SATOSHIS_IN_BTC).toFixed(6);
  }
  return amountInSats;
};

export const ConvertSatsToFiat = (
  satsAmount: number,
  exchangeRates,
  currencyCode,
) => {
  const exchangeRate = exchangeRates[currencyCode]?.last;
  return (satsAmount / SATOSHIS_IN_BTC) * exchangeRate;
};

export const getAmount = (amountInSats: number, satsEnabled = false) => {
  // config.NETWORK_TYPE === NetworkType.MAINNET    disable sats mode

  if (satsEnabled === false && amountInSats !== 0) {
    if (amountInSats > 99) {
      return amountInSats / SATOSHIS_IN_BTC;
    }
    return (amountInSats / SATOSHIS_IN_BTC).toFixed(6);
  }
  return numberWithCommas(amountInSats);
};

const numberWithCommas = x =>
  x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;

export const getAmt = (
  amountInSats: number,
  exchangeRates,
  currencyCode,
  currentCurrency,
  satsEnabled = false,
) => {
  if (currentCurrency === CurrencyKind.BITCOIN) {
    return getAmount(amountInSats, satsEnabled);
  }
  if (exchangeRates && exchangeRates[currencyCode] && !satsEnabled) {
    const result =
      (exchangeRates[currencyCode].last / SATOSHIS_IN_BTC) * amountInSats;
    return result.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return numberWithCommas(amountInSats);
};

export const getConvertedAmt = (
  amount: number,
  exchangeRates,
  currencyCode,
  currentCurrency,
  satsEnabled = false,
) => {
  if (amount) {
    if (currentCurrency === CurrencyKind.BITCOIN) {
      if (satsEnabled) {
        return (
          (SATOSHIS_IN_BTC / exchangeRates[currencyCode].last) *
          amount
        ).toFixed(2);
      }
      return (amount / exchangeRates[currencyCode].last).toFixed(5);
    }
    if (exchangeRates && exchangeRates[currencyCode]) {
      if (satsEnabled) {
        return (
          (amount / SATOSHIS_IN_BTC) *
          exchangeRates[currencyCode].last
        ).toFixed(2);
      }
      return (exchangeRates[currencyCode].last * amount).toFixed(2);
    }
    return numberWithCommas(amount);
  }
  return null;
};

export const NetworkAmount = (
  amountInSats: number,
  exchangeRates,
  currencyCode,
  currentCurrency,
  textStyles = [{}],
  scale = 1,
) => {
  let text: string;
  if (isTestnet()) {
    text = `${amountInSats}`;
  } else {
    text = (amountInSats / SATOSHIS_IN_BTC).toFixed(4);
  }
  text = getAmt(amountInSats, exchangeRates, currencyCode, currentCurrency);
  return (
    <View style={{ alignItems: 'center' }}>
      {!isTestnet() ? (
        <Scale scale={scale}>
          {getCurrencyImageByRegion(
            currencyCode,
            'light',
            currentCurrency,
            BTC,
          )}
        </Scale>
      ) : null}
      <Text style={[textStyles, { color: 'white' }]}>
        {text}
        <Text style={{ fontSize: 12 }}> {getUnit(currentCurrency)}</Text>
      </Text>
    </View>
  );
};

export const getUnit = (currentCurrency, satsEnabled = false) => {
  const isBitcoin = currentCurrency === CurrencyKind.BITCOIN;
  // disable sats mode
  if (isBitcoin && config.NETWORK_TYPE === NetworkType.TESTNET && satsEnabled) {
    return 'sats';
  }
  return '';
};

export const isTestnet = () => {
  if (config.NETWORK_TYPE === NetworkType.TESTNET) {
    return true;
  }
  return false;
};
export function CurrencyIcon({ symbol, styles = {}, size = 14 }) {
  return (
    <Text
      style={{
        ...styles,
        fontSize: size,
        letterSpacing: 0.5,
        fontWeight: '900',
      }}>
      {symbol}
    </Text>
  );
}

export const getCurrencyImageByRegion = (
  currencyCode: string,
  type: 'light' | 'yellow' | 'dark' | 'grey' | 'dimGray',
  currentCurrency: CurrencyKind,
  BTCIcon: any,
  size?: number,
) => {
  const styles = {} as any;
  switch (type) {
    case 'light':
      styles.color = Colors.Black;
      break;
    case 'yellow':
      styles.color = Colors.Golden;
      break;
    case 'dark':
      styles.color = Colors.White;
      break;
    case 'grey':
      styles.color = Colors.White;
      styles.opacity = 0.7;
      break;
    case 'dimGray':
      styles.color = Colors.DimGray;
      break;
    default:
      styles.color = Colors.White;
  }
  if (currentCurrency !== CurrencyKind.BITCOIN) {
    const currency = FiatCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      return (
        <CurrencyIcon styles={styles} symbol={currency.symbol} size={size} />
      );
    }
    return null;
  }
  return <BTCIcon style={{ color: styles.color }} />;
};

export const getFiatIcon = (
  currencyCode: string,
  type: 'light' | 'yellow' | 'dark' | 'grey',
) => {
  const currency = FiatCurrencies.find(c => c.code === currencyCode);
  const styles = {} as any;
  switch (type) {
    case 'light':
      styles.color = Colors.White;
      break;
    case 'yellow':
      styles.color = Colors.Golden;
      break;
    case 'dark':
      styles.color = Colors.White;
      break;
    case 'grey':
      styles.color = Colors.White;
      styles.opacity = 0.7;
      break;
    default:
      styles.color = Colors.White;
  }
  if (currency) {
    return <CurrencyIcon styles={styles} symbol={currency.symbol} />;
  }
  return null;
};

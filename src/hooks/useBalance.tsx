import { useMMKVString } from 'react-native-mmkv';
import {
  getAmt,
  getConvertedAmt,
  getCurrencyImageByRegion,
  getFiatIcon,
  getUnit,
} from 'src/constants/Bitcoin';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';

const useBalance = () => {
  const [exchangeRates] = useMMKVString(Keys.EXCHANGE_RATES);
  const [currencyCode] = useMMKVString(Keys.APP_CURRENCY);
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialExchangeRates = exchangeRates || null;
  const satsEnabled = currentCurrencyMode === CurrencyKind.SATS;

  const getBalance = (balance: number) =>
    getAmt(
      balance,
      JSON.parse(initialExchangeRates),
      currencyCode,
      currentCurrencyMode,
      satsEnabled,
    );

  const getConvertedBalance = (balance: number) =>
    getConvertedAmt(
      balance,
      exchangeRates,
      currencyCode,
      currentCurrencyMode,
      satsEnabled,
    );

  const getSatUnit = () => getUnit(currentCurrencyMode, satsEnabled);

  const getCurrencyIcon = (
    Icon: any,
    variation: 'light' | 'green' | 'dark' | 'grey' | 'slateGreen',
    size: number = 14,
  ) =>
    getCurrencyImageByRegion(
      currencyCode,
      variation,
      currentCurrencyMode,
      Icon,
      size,
    );

  const getFiatCurrencyIcon = (
    variation: 'light' | 'green' | 'dark' | 'grey',
  ) => getFiatIcon(currencyCode, variation);

  return {
    getBalance,
    getSatUnit,
    getCurrencyIcon,
    getFiatCurrencyIcon,
    getConvertedBalance,
  };
};

export default useBalance;

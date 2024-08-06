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
  const [exchangeRates, setExchangeRates] = useMMKVString(Keys.EXCHANGE_RATES);
  const [currencyCode, setCurrencyCode] = useMMKVString(Keys.APP_CURRENCY);
  const [currentCurrencyMode, setCurrentCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );
  const satsEnabled = currentCurrencyMode === CurrencyKind.SATS;
  // console.log('exchangeRates', exchangeRates);
  // console.log('currencyCode', currencyCode);
  // console.log('currentCurrencyMode', currentCurrencyMode);
  const getBalance = (balance: number) =>
    getAmt(
      balance,
      exchangeRates,
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
  ) =>
    getCurrencyImageByRegion(
      currencyCode,
      variation,
      currentCurrencyMode,
      Icon,
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

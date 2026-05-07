import { getRgbErrorMessage } from '../src/utils/errorUtils';

const common = {
  errorInvalidIndexer:
    'Your wallet is currently offline. Please check your internet connection or wallet settings.',
  errorInsufficientBitcoins:
    'Insufficient bitcoin. Please add more sats to your wallet and try again.',
  errorInsufficientAllocationSlots:
    'Creating new UTXOs for RGB transactions. Please wait a moment and try again.',
  errorAssetNotFound:
    'Asset not found. Please check the asset details and try again.',
  errorNetworkFailed:
    'Network request failed. Please check your internet connection and try again.',
  errorGenericRgb: 'A wallet error occurred. Please try again.',
  errorUnknown: 'An unexpected error occurred. Please try again.',
};

describe('getRgbErrorMessage', () => {
  describe('InvalidIndexer / offline errors', () => {
    it('matches error.code === InvalidIndexer', () => {
      const err = { code: 'InvalidIndexer', message: 'some raw message' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorInvalidIndexer);
    });

    it('matches message containing InvalidIndexer', () => {
      const err = new Error(
        'tribe.RgbLibError.InvalidIndexer(details: "not a valid electrum nor esplora server")',
      );
      expect(getRgbErrorMessage(err, common)).toBe(common.errorInvalidIndexer);
    });

    it('matches "not a valid electrum" in message', () => {
      const err = { message: 'not a valid electrum server' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorInvalidIndexer);
    });

    it('matches "electrum" in message', () => {
      const err = { message: 'failed to connect to electrum' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorInvalidIndexer);
    });
  });

  describe('InsufficientBitcoins errors', () => {
    it('matches error.code === InsufficientBitcoins', () => {
      const err = { code: 'InsufficientBitcoins', message: 'raw' };
      expect(getRgbErrorMessage(err, common)).toBe(
        common.errorInsufficientBitcoins,
      );
    });

    it('matches "needed=" pattern', () => {
      const err = { message: 'Failed: needed=2000, available=0' };
      expect(getRgbErrorMessage(err, common)).toBe(
        common.errorInsufficientBitcoins,
      );
    });

    it('matches "available=0" pattern', () => {
      const err = { message: 'available=0' };
      expect(getRgbErrorMessage(err, common)).toBe(
        common.errorInsufficientBitcoins,
      );
    });

    it('matches "Insufficient sats for RGB"', () => {
      const err = { message: 'Insufficient sats for RGB' };
      expect(getRgbErrorMessage(err, common)).toBe(
        common.errorInsufficientBitcoins,
      );
    });
  });

  describe('InsufficientAllocationSlots errors', () => {
    it('matches error.code === InsufficientAllocationSlots', () => {
      const err = { code: 'InsufficientAllocationSlots', message: 'raw' };
      expect(getRgbErrorMessage(err, common)).toBe(
        common.errorInsufficientAllocationSlots,
      );
    });

    it('matches message containing InsufficientAllocationSlots', () => {
      const err = { message: 'InsufficientAllocationSlots in wallet' };
      expect(getRgbErrorMessage(err, common)).toBe(
        common.errorInsufficientAllocationSlots,
      );
    });

    it('matches error.code === NoAvailableUtxos', () => {
      const err = { code: 'NoAvailableUtxos', message: 'raw' };
      expect(getRgbErrorMessage(err, common)).toBe(
        common.errorInsufficientAllocationSlots,
      );
    });
  });

  describe('AssetNotFound errors', () => {
    it('matches error.code === AssetNotFound', () => {
      const err = { code: 'AssetNotFound', message: 'raw' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorAssetNotFound);
    });

    it('matches message containing AssetNotFound', () => {
      const err = { message: 'AssetNotFound for id xyz' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorAssetNotFound);
    });
  });

  describe('Network errors', () => {
    it('matches "Network request failed"', () => {
      const err = { message: 'Network request failed' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorNetworkFailed);
    });

    it('matches timeout', () => {
      const err = { message: 'connection timeout' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorNetworkFailed);
    });
  });

  describe('Generic RgbLibError', () => {
    it('matches message containing RgbLibError', () => {
      const err = {
        message:
          'tribe.RgbLibError.SomeOtherError(details: "something went wrong")',
      };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorGenericRgb);
    });

    it('matches message containing tribe.RgbLib', () => {
      const err = { message: 'tribe.RgbLib internal failure' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorGenericRgb);
    });
  });

  describe('Unknown / fallback', () => {
    it('returns errorUnknown for unrecognised error object', () => {
      const err = { message: 'something completely unrelated' };
      expect(getRgbErrorMessage(err, common)).toBe(common.errorUnknown);
    });

    it('handles string errors', () => {
      const err = 'completely unknown failure';
      expect(getRgbErrorMessage(err, common)).toBe(common.errorUnknown);
    });

    it('handles null gracefully', () => {
      expect(getRgbErrorMessage(null, common)).toBe(common.errorUnknown);
    });

    it('handles undefined gracefully', () => {
      expect(getRgbErrorMessage(undefined, common)).toBe(common.errorUnknown);
    });

    it('falls back to raw message when translation key is missing', () => {
      const emptyCommon = {};
      const err = { code: 'InvalidIndexer', message: 'raw detail' };
      expect(getRgbErrorMessage(err, emptyCommon)).toBe('raw detail');
    });
  });
});

import {
  ASSET_CARD_AMOUNT_MAX_WIDTH,
  ASSET_CARD_AMOUNT_TEXT_LAYOUT,
  ASSET_CARD_NAME_CONTAINER_LAYOUT,
  ASSET_CARD_NAME_TEXT_LAYOUT,
} from '../src/components/assetCardLayout';

describe('AssetCard long-name layout protections', () => {
  it('keeps name text in a single shrinkable line', () => {
    expect(ASSET_CARD_NAME_TEXT_LAYOUT).toMatchObject({
      flex: 1,
    });
  });

  it('keeps amount text in a separate constrained column', () => {
    expect(ASSET_CARD_NAME_CONTAINER_LAYOUT).toMatchObject({
      minWidth: 0,
      alignItems: 'center',
    });

    expect(ASSET_CARD_AMOUNT_TEXT_LAYOUT).toMatchObject({
      flex: 0,
      flexShrink: 0,
      maxWidth: ASSET_CARD_AMOUNT_MAX_WIDTH,
    });
  });
});

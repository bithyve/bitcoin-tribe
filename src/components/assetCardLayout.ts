export const ASSET_CARD_AMOUNT_MAX_WIDTH = '45%';

export const ASSET_CARD_NAME_TEXT_LAYOUT = {
  flex: 1,
} as const;

export const ASSET_CARD_NAME_CONTAINER_LAYOUT = {
  alignItems: 'center',
  minWidth: 0,
} as const;

export const ASSET_CARD_AMOUNT_TEXT_LAYOUT = {
  flex: 0,
  flexShrink: 0,
  maxWidth: ASSET_CARD_AMOUNT_MAX_WIDTH,
} as const;

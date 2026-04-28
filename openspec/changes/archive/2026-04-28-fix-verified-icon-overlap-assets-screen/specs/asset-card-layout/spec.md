## ADDED Requirements

### Requirement: Verified icon placement in asset cards
The verified badge icon MUST appear immediately after the asset name/ticker text, MUST NOT overlap it, and MUST NOT overlap the amount value.

#### Scenario: Long asset name with verified badge
- **GIVEN** an RGB asset with a long name that would overflow the card width
- **WHEN** the asset card is rendered in the Assets screen list
- **THEN** the asset name SHALL be truncated with an ellipsis, the verified icon SHALL be visible immediately after the truncated name, and the amount value SHALL be fully visible on the right

#### Scenario: Short asset name with verified badge
- **GIVEN** an RGB asset with a short name and a verified badge
- **WHEN** the asset card is rendered
- **THEN** the asset name SHALL be shown in full, the verified icon SHALL appear 4–6 px after the name, and the amount value SHALL be right-aligned without overlap

#### Scenario: Unverified asset
- **GIVEN** an RGB asset without a verified badge
- **WHEN** the asset card is rendered
- **THEN** the name SHALL occupy the left portion and the amount SHALL be right-aligned, with no icon present

#### Scenario: CoinAssetCard long ticker
- **GIVEN** a coin asset with a long ticker symbol
- **WHEN** the CoinAssetCard is rendered in a list
- **THEN** the ticker text SHALL shrink/truncate to avoid overflowing into the amount badge column

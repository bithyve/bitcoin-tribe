## ADDED Requirements

### Requirement: Verified icon placement in asset cards
The verified badge icon must appear immediately after the asset name/ticker text, never overlap it, and never overlap the amount value.

#### Scenario: Long asset name with verified badge
- **GIVEN** an RGB asset with a long name that would overflow the card width
- **WHEN** the asset card is rendered in the Assets screen list
- **THEN** the asset name is truncated with an ellipsis, the verified icon is visible immediately after the truncated name, and the amount value is fully visible on the right

#### Scenario: Short asset name with verified badge
- **GIVEN** an RGB asset with a short name and a verified badge
- **WHEN** the asset card is rendered
- **THEN** the asset name is shown in full, the verified icon appears 4–6 px after the name, and the amount value is right-aligned without overlap

#### Scenario: Unverified asset
- **GIVEN** an RGB asset without a verified badge
- **WHEN** the asset card is rendered
- **THEN** the name occupies the left portion and the amount is right-aligned, with no icon present

#### Scenario: CoinAssetCard long ticker
- **GIVEN** a coin asset with a long ticker symbol
- **WHEN** the CoinAssetCard is rendered in a list
- **THEN** the ticker text shrinks/truncates to avoid overflowing into the amount badge column

# Wallet Specification — Delta: show-multiple-xpubs

## MODIFIED Requirements

### Requirement: Account xPub Export

WHEN `appType` is `ON_CHAIN`, the system MUST allow the user to view and copy
both the vanilla wallet xPub and the colored wallet xPub. The system MUST display
them with clear labeling via a segmented selector, with the vanilla xPub shown first.

#### Scenario: Vanilla xPub displayed by default

- GIVEN `appType` is `ON_CHAIN`
- WHEN the user opens Wallet Settings and selects "Show xPub"
- THEN the "Vanilla Wallet" tab is selected by default
- AND the vanilla wallet xPub is displayed as a QR code and a copyable string

#### Scenario: User switches to Colored xPub

- GIVEN the user is on the Show xPub screen with "Vanilla Wallet" selected
- WHEN the user taps the "Colored Wallet" segment
- THEN the colored wallet xPub MUST be displayed as a QR code and a copyable string
- AND the "Colored Wallet" tab appears active

#### Scenario: User switches back to Vanilla xPub

- GIVEN the user is on the Show xPub screen with "Colored Wallet" selected
- WHEN the user taps the "Vanilla Wallet" segment
- THEN the vanilla wallet xPub MUST be displayed again

#### Scenario: Both XPUBs available

- GIVEN the `RgbWallet` Realm object has non-empty `accountXpubVanilla` and
  `accountXpubColored` fields
- WHEN the Show xPub screen renders
- THEN both segments MUST be visible and each SHALL display its respective xPub

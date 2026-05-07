## Why

Several dark-mode surfaces suffer from contrast ratios below the WCAG AA threshold (4.5:1 for normal text), producing grey-on-grey readability problems, dim metadata labels, unclear disabled states, and nearly invisible body text. This negatively impacts accessibility and usability for users who operate the app in dark mode at low screen brightness.

## What Changes

- Raise `secondaryHeadingColor` in `CombinedDarkTheme` from `Colors.SonicSilver` (116,116,116) to `Colors.QuickSilver` (162,162,162), achieving ≥7:1 contrast against all dark card backgrounds.
- Raise `bodyColor` in `CombinedDarkTheme` from `Colors.Quartz` (75,75,75) to `Colors.QuickSilver` (162,162,162) for consistency with the corrected secondary text tone.
- Raise `mutedTab` in `CombinedDarkTheme` from `Colors.Gray48` (120,120,120) to `Colors.SpanishGray` (153,153,153), meeting ≥6.5:1 contrast against black.
- Replace hard-coded `#808080` meta-text colour in `MessageItem` (community/chat) with a theme-aware value (`theme.dark ? Colors.DarkGray : '#808080'`) that achieves ≥4.9:1 against both sender and receiver bubble backgrounds in dark mode.

## Capabilities

### New Capabilities
- `dark-mode-contrast`: WCAG-compliant dark-mode colour tokens and component overrides for text contrast across asset details, wallet settings, transaction history, community/chat, and backup & recovery screens.

### Modified Capabilities
<!-- No existing spec-level requirements are changing — this is a new capability. -->

## Impact

- **`src/theme/index.ts`** — three token values changed in `CombinedDarkTheme`.
- **`src/screens/community/components/MessageItem.tsx`** — meta-text colours updated.
- No Realm schema changes.
- No changes to `src/services/messaging/` or `src/bare/`.
- No Maestro flow changes; colour-only visual changes are outside E2E flow scope.

## Non-goals

- Light-mode contrast (already acceptable).
- Changing accent/CTA colours or brand palette.
- Redesigning layouts or adding new UI elements.
- Fixing contrast on the onboarding screens (out of scope for this issue).

## Assumptions

- `Colors.Quartz` (75,75,75) is not surfaced to the user as body text in any currently rendered component (confirmed: `bodyColor` has no consumer in component files), but it is corrected proactively.
- Disabled-state tokens (`disablePrimaryCTAText: Colors.SonicSilver`) are intentionally low-contrast to signal inactivity and are left unchanged.
- The `#808080` hard-code in `MessageItem.tsx` was chosen before dark-mode bubble backgrounds were finalized; the fix maintains the same hue family at a higher luminance.

## Rollback plan

Not applicable — no persistent storage or auth changes. Reverting is a single-commit revert of `src/theme/index.ts` and `src/screens/community/components/MessageItem.tsx`.

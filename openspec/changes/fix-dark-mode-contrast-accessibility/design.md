## Context

`yarn bare-pack` not required — no messaging/bare changes.
Realm schema not changed.

The project's dark theme is defined in `src/theme/index.ts` as `CombinedDarkTheme`. Colour primitives live in `src/theme/Colors.ts`. All component styles reference theme tokens via `useTheme()` from `react-native-paper`. No CSS-in-JS is used.

Three semantic tokens drive the majority of secondary text across every audited screen:
- `secondaryHeadingColor` — dates, subtitles, meta labels (172 consumer call-sites).
- `bodyColor` — declared but currently has zero direct consumers in components; kept in sync.
- `mutedTab` — bottom-tab inactive labels.

One component (`MessageItem.tsx`) hard-codes `#808080` for chat bubble meta-text instead of using a theme token, bypassing the theming system entirely.

## Goals / Non-Goals

**Goals:**
- All secondary text in dark mode achieves ≥4.5:1 contrast ratio (WCAG AA) against the darkest card background used in the app (`EerieBlack`, 26,26,26).
- Bottom tab inactive labels achieve ≥4.5:1 against the primary background (`Black`, 0,0,0).
- Chat bubble meta-text achieves ≥4.5:1 against both bubble background colours.

**Non-Goals:**
- Light theme changes.
- Accent / CTA / brand colour changes.
- Disabled-state tokens (intentionally dim to signal inactivity).
- New layout, new components, or new screen additions.

## Decisions

### D1 — Raise `secondaryHeadingColor` from SonicSilver → QuickSilver

`Colors.SonicSilver` (116, 116, 116) achieves only 3.98:1 against `Colors.EerieBlack` (26, 26, 26), the card gradient used on most content cards in dark mode. This fails WCAG AA.

`Colors.QuickSilver` (162, 162, 162) achieves 7.24:1 against `EerieBlack` and 11.3:1 against `Black` — comfortably WCAG AA for all dark surfaces.

Alternatives considered:
- `Colors.SpanishGray` (153): 6.59:1 against EerieBlack — sufficient but closer to the boundary; QuickSilver leaves more headroom.
- `Colors.DarkGray` (170): 7.7:1 — valid; QuickSilver is marginally lighter and already present in the palette.

### D2 — Raise `bodyColor` from Quartz → QuickSilver

Although `bodyColor` has no current consumers in component code, it sits at (75, 75, 75) — less than 2:1 against any dark surface. Correcting it preventively avoids a future regression if it is consumed by a new component. The same target value as D1 is used for token consistency.

### D3 — Raise `mutedTab` from Gray48 → SpanishGray

`Colors.Gray48` (120, 120, 120) achieves 4.6:1 against `Black` — borderline. Small rendering antialiasing or sub-pixel hinting on lower-resolution devices may push the effective contrast below 4.5:1. `Colors.SpanishGray` (153, 153, 153) achieves 6.6:1, providing a comfortable margin.

### D4 — Fix hard-coded `#808080` in MessageItem.tsx

The meta-text colour `#808080` (128, 128, 128) is hard-coded in four style rules (`textSenderName`, `textTimeSender`, `textTimeReceiver`, `textDay`, `systemMessageText`). Against the sender bubble `#353B44` (53, 59, 68) the ratio is only 2.86:1. The fix replaces the hard-codes with `theme.dark ? Colors.DarkGray : '#808080'`. `Colors.DarkGray` (170, 170, 170) achieves 4.9:1 against `#353B44` and 8.4:1 against `#111111`.

The import of `Colors` from `src/theme/Colors` is added to `MessageItem.tsx`.

## Files to be Modified

| File | Change |
|------|--------|
| `src/theme/index.ts` | `secondaryHeadingColor`, `bodyColor`, `mutedTab` in `CombinedDarkTheme` |
| `src/screens/community/components/MessageItem.tsx` | Meta-text `#808080` → theme-aware value |

## Risks / Trade-offs

- [Brightening `secondaryHeadingColor`] Secondary text becomes noticeably lighter than before. Users accustomed to the current UI will see a visual change, but legibility is strictly improved. → Accept; no design-language deviation.
- [172 consumers of `secondaryHeadingColor`] A single token change fans out to many screens. → Risk is low because raising contrast never hides content; snapshot tests will confirm rendered output matches expectations.

## Migration Plan

1. Edit `src/theme/index.ts` — update three dark-theme token values.
2. Edit `src/screens/community/components/MessageItem.tsx` — replace `#808080` literals.
3. Run `yarn test` to confirm no snapshot or unit regressions.
4. PR review — visual spot-check on asset details, wallet settings, transaction history, community, and backup screens in dark mode.

No data migration, no Realm schema change, no `yarn bare-pack` required.

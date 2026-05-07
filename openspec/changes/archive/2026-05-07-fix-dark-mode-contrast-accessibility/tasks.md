## Analysis

**Files:** `src/theme/index.ts`, `src/screens/community/components/MessageItem.tsx`
**Realm schema:** No change
**`yarn bare-pack`:** Not required
**Maestro flows:** Not affected

Root causes:
1. `CombinedDarkTheme.secondaryHeadingColor` = `Colors.SonicSilver` (116,116,116) → 3.98:1 on card surfaces (fails WCAG AA)
2. `CombinedDarkTheme.bodyColor` = `Colors.Quartz` (75,75,75) → ~2:1 on all dark surfaces
3. `CombinedDarkTheme.mutedTab` = `Colors.Gray48` (120,120,120) → 4.6:1 on black (borderline)
4. `MessageItem.tsx` hard-codes `#808080` → 2.86:1 on `#353B44` sender bubble (fails)

## 1. Theme Token Fixes

- [x] 1.1 In `src/theme/index.ts`, inside `CombinedDarkTheme.colors`, change `secondaryHeadingColor` from `Colors.SonicSilver` to `Colors.QuickSilver`
- [x] 1.2 In `src/theme/index.ts`, inside `CombinedDarkTheme.colors`, change `bodyColor` from `Colors.Quartz` to `Colors.QuickSilver`
- [x] 1.3 In `src/theme/index.ts`, inside `CombinedDarkTheme.colors`, change `mutedTab` from `Colors.Gray48` to `Colors.SpanishGray`

## 2. MessageItem Meta-text Fix

- [x] 2.1 In `src/screens/community/components/MessageItem.tsx`, add `import Colors from 'src/theme/Colors'` at the top
- [x] 2.2 In `src/screens/community/components/MessageItem.tsx`, replace all five `#808080` hard-coded colour literals with `theme.dark ? Colors.DarkGray : '#808080'`

## 3. Verification

- [x] 3.1 Run `yarn test` and confirm all tests pass

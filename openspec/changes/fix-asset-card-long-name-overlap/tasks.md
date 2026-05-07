## 1. Asset card layout fix

- [ ] 1.1 Update `src/components/AssetCard.tsx` row/name styles so long asset names can shrink and truncate with ellipsis without overlapping balance/value text.
- [ ] 1.2 Verify verified-badge alignment and balance text alignment remain unchanged for typical name lengths.

## 2. Regression coverage and validation

- [ ] 2.1 Add or update focused Jest coverage for `AssetCard` long-name truncation behavior.
- [ ] 2.2 Run targeted Jest tests for the asset card component.
- [ ] 2.3 Run `yarn test --runInBand` and `yarn lint` for final verification.

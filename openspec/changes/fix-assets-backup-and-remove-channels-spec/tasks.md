## 1. Assets Specification Updates

- [x] 1.1 Re-verify and update `appType` gating text in `openspec/specs/assets/spec.md` where it currently includes `SUPPORTED_RLN` for production behavior.
- [x] 1.2 Update campaign claim requirements in `openspec/specs/assets/spec.md` so witness campaigns do not require sats and blinded campaigns require sats.

## 2. Backup Specification Updates

- [x] 2.1 Update seed backup confirmation flow in `openspec/specs/backup/spec.md` to require one random mnemonic word entry.
- [x] 2.2 Remove cloud RGB backup requirement section from `openspec/specs/backup/spec.md`.
- [x] 2.3 Update relay backup requirement text in `openspec/specs/backup/spec.md` to require automatic encrypted upload and state timestamp update.

## 3. Channels Removal and Cross-Reference Cleanup

- [x] 3.1 Remove `openspec/specs/channels/spec.md` from canonical specs.
- [x] 3.2 Search OpenSpec specs/docs and remove or adjust any references to the removed channels capability.

## 4. Validation

- [x] 4.1 Verify updated specs maintain clear Given/When/Then scenario format and internal consistency across assets and backup capabilities.
- [x] 4.2 Verify no mirror files under `docs/open-specs/` require sync updates.
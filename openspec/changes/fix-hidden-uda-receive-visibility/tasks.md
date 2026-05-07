## 1. Baseline and code-path analysis

- [ ] 1.1 Run existing lint/test commands to capture baseline repository state before changes.
- [ ] 1.2 Trace UDA sync/persistence logic to locate where hidden visibility is retained after re-receive.

## 2. Implement hidden UDA restore behavior

- [ ] 2.1 Apply a minimal change in RGB asset persistence/sync flow to unhide a UDA when that same UDA is received.
- [ ] 2.2 Ensure the change does not alter existing manual hide behavior for assets that are not re-received.

## 3. Verification

- [ ] 3.1 Add or update focused Jest tests for hidden UDA receive/unhide behavior.
- [ ] 3.2 Run targeted Jest tests covering changed logic.
- [ ] 3.3 Run `yarn test`.

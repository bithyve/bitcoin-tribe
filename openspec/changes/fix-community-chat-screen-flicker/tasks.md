## 1. Investigate and baseline

- [ ] 1.1 Inspect community chat message list rendering path and identify minimal list-level stabilization points
- [ ] 1.2 Run baseline lint/test commands to confirm pre-change repository state

## 2. Implement chat rendering stabilization

- [ ] 2.1 Update `src/screens/community/components/MessageList.tsx` to reduce avoidable re-renders and stabilize item keys/callbacks
- [ ] 2.2 Verify message ordering/inverted behavior remains unchanged after the rendering fix

## 3. Add and run focused verification

- [ ] 3.1 Add or update focused Jest tests for community message list rendering stability wiring
- [ ] 3.2 Run targeted Jest tests for community message list changes
- [ ] 3.3 Run repo lint (`yarn lint`) and regression Jest check (`yarn test --runInBand`) for final verification

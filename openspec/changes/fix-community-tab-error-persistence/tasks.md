## 1. Chat.tsx — Mounted-ref guard

- [ ] 1.1 Add `isMountedRef` (`useRef<boolean>(true)`) and a cleanup `useEffect` that sets `isMountedRef.current = false` on unmount in `Chat.tsx`
- [ ] 1.2 Guard the `loginToRoom` catch-block Toast with `if (isMountedRef.current)` in `Chat.tsx`
- [ ] 1.3 Guard the `joinWaitTimeoutRef` timeout Toast with `if (isMountedRef.current)` in `Chat.tsx`
- [ ] 1.4 Guard the `loadPeers` catch-block Toast with `if (isMountedRef.current)` in `Chat.tsx`

## 2. CreateGroup.tsx — Mounted-ref guard

- [ ] 2.1 Add `isMountedRef` (`useRef<boolean>(true)`) and a cleanup `useEffect` that sets `isMountedRef.current = false` on unmount in `CreateGroup.tsx`
- [ ] 2.2 Guard the `joinRoom` catch-block Toast with `if (isMountedRef.current)` in `CreateGroup.tsx`

## 1. Chat.tsx — Mounted-ref guard

- [x] 1.1 Add `isMountedRef` (`useRef<boolean>(true)`) and a cleanup `useEffect` that sets `isMountedRef.current = false` on unmount in `Chat.tsx`
- [x] 1.2 Guard the `loginToRoom` catch-block Toast with `if (isMountedRef.current)` in `Chat.tsx`
- [x] 1.3 Guard the `joinWaitTimeoutRef` timeout Toast with `if (isMountedRef.current)` in `Chat.tsx`
- [x] 1.4 Guard the `loadPeers` catch-block Toast with `if (isMountedRef.current)` in `Chat.tsx`

## 2. CreateGroup.tsx — Mounted-ref guard

- [x] 2.1 Add `isMountedRef` (`useRef<boolean>(true)`) and a cleanup `useEffect` that sets `isMountedRef.current = false` on unmount in `CreateGroup.tsx`
- [x] 2.2 Guard the `joinRoom` catch-block Toast with `if (isMountedRef.current)` in `CreateGroup.tsx`

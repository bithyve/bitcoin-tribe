## Analysis

The app performs PIN/biometric authentication only on cold start. Once authenticated, the
in-memory encryption key in AppContext persists indefinitely and the session never expires.
The fix records a background timestamp in MMKV when the app goes to background, and on
foreground-resume checks if the elapsed time exceeds the 5-minute threshold. If so, it
clears the key and redirects to the login screen.

## Tasks

### 1. Storage — add BACKGROUND_TIMESTAMP key
- [x] 1.1 In `src/storage/index.ts`, add `BACKGROUND_TIMESTAMP = 'BACKGROUND_TIMESTAMP'`
       to the `Keys` enum.

### 2. Session utility module
- [x] 2.1 Create `src/utils/sessionUtils.ts` with:
       - `SESSION_TIMEOUT_MS` constant set to `300_000` (5 minutes).
       - `isSessionExpired(backgroundTs: number): boolean` — returns `true` when
         `Date.now() - backgroundTs >= SESSION_TIMEOUT_MS`.
       - `shouldEnforceSessionLock(pinMethod: string | undefined): boolean` — returns
         `true` when `pinMethod === PinMethod.PIN || pinMethod === PinMethod.BIOMETRIC`.

### 3. Navigator — AppState listener and session-lock logic
- [x] 3.1 In `src/navigation/Navigator.tsx`, import and create a
       `navigationRef` via `createNavigationContainerRef<AppStackParams>()`.
- [x] 3.2 Pass `ref={navigationRef}` to `<NavigationContainer>`.
- [x] 3.3 In the `Navigator` component, read `pinMethod` from MMKV
       (`useMMKVString(Keys.PIN_METHOD)`) and `setKey` from `AppContext`.
- [x] 3.4 Add a `useEffect` in `Navigator` that:
       a. On `AppState` change to `background` or `inactive`:
          - If `shouldEnforceSessionLock(pinMethod)`, write `Date.now()` to MMKV
            `BACKGROUND_TIMESTAMP`.
       b. On `AppState` change to `active`:
          - Read `BACKGROUND_TIMESTAMP` from MMKV.
          - If present and `isSessionExpired(ts)`:
            - Call `setKey(null)` to clear the in-memory key.
            - Call `navigationRef.current?.reset(...)` to navigate to
              `LOGINSTACK → LOGIN`.
          - Clear `BACKGROUND_TIMESTAMP` from MMKV regardless.
       c. Remove the event listener on cleanup.

### 4. Unit tests
- [x] 4.1 Create `__tests__/sessionUtils.test.ts` with Jest tests covering:
       - `isSessionExpired` returns `false` when elapsed < 5 minutes.
       - `isSessionExpired` returns `true` when elapsed >= 5 minutes.
       - `shouldEnforceSessionLock` returns `false` for `PinMethod.DEFAULT` and
         `undefined`.
       - `shouldEnforceSessionLock` returns `true` for `PinMethod.PIN` and
         `PinMethod.BIOMETRIC`.

### 5. Verification
- [x] 5.1 Run `yarn test --runInBand` — all existing tests pass and new tests pass.

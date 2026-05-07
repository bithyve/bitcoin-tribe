# session-timeout Specification

## Purpose
TBD - created by archiving change fix-session-expiry-on-inactivity. Update Purpose after archive.
## Requirements
### Requirement: Automatic Session Lock on Inactivity
The system MUST lock the session when the app returns to the foreground after spending
5 minutes or more in the background, provided a PIN or biometric authentication method
is active (`PinMethod.PIN` or `PinMethod.BIOMETRIC`). Upon locking, the in-memory
encryption key MUST be cleared and the user MUST be redirected to the login screen.

#### Scenario: App resumes after exceeding inactivity threshold
- GIVEN the user has authenticated with their PIN or biometric
- AND the app has been in the background for 5 minutes or more
- WHEN the user brings the app back to the foreground
- THEN the in-memory encryption key is cleared
- AND the user is navigated to the PIN/biometric login screen
- AND the user cannot access any wallet screen without re-authenticating

#### Scenario: App resumes before inactivity threshold is reached
- GIVEN the user has authenticated with their PIN or biometric
- AND the app has been in the background for less than 5 minutes
- WHEN the user brings the app back to the foreground
- THEN the session remains active
- AND the user is taken directly back to the screen they left

#### Scenario: No PIN method configured (DEFAULT)
- GIVEN the user has not configured a PIN (`PinMethod.DEFAULT`)
- AND the app has been in the background for any duration
- WHEN the user brings the app back to the foreground
- THEN no session lock is triggered
- AND the existing auto-login behaviour is preserved

#### Scenario: Background timestamp recorded on app backgrounding
- GIVEN the user is authenticated and the app is in the foreground
- WHEN the app transitions to the background (or inactive on iOS)
- THEN the current timestamp is persisted in MMKV under `BACKGROUND_TIMESTAMP`

#### Scenario: Timestamp cleared after non-expiring resume
- GIVEN the app has been in the background for less than 5 minutes
- WHEN the app returns to the foreground without triggering a session lock
- THEN the `BACKGROUND_TIMESTAMP` MMKV key is cleared

#### Scenario: Re-authentication restores full wallet access
- GIVEN the session was locked due to inactivity
- WHEN the user successfully authenticates via PIN or biometric on the login screen
- THEN the in-memory encryption key is restored
- AND the user is navigated to the main app interface


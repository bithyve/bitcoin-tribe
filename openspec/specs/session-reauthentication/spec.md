# session-reauthentication Specification

## Purpose
Define required wallet relocking behavior so users must re-authenticate with their configured PIN/biometric method after inactivity before accessing authenticated screens.
## Requirements
### Requirement: Re-authentication after inactivity
The wallet application MUST require user re-authentication before entering the authenticated AppStack when the app has been inactive longer than the configured session timeout.

#### Scenario: Session remains valid under timeout
- **GIVEN** the user has already authenticated and entered AppStack
- **WHEN** the app returns to the foreground before the inactivity timeout elapses
- **THEN** the app SHALL keep the current authenticated session and remain in AppStack without another auth prompt

#### Scenario: Session expires after inactivity timeout
- **GIVEN** the user has already authenticated and entered AppStack
- **WHEN** the app returns to the foreground after the inactivity timeout has elapsed
- **THEN** the app SHALL navigate to the login flow and require PIN or biometric verification before AppStack is accessible

#### Scenario: Re-authentication failure keeps wallet locked
- **GIVEN** the app has expired the current session due to inactivity
- **WHEN** the user provides an invalid PIN or biometric auth fails
- **THEN** the app SHALL keep the wallet locked and SHALL NOT navigate to AppStack

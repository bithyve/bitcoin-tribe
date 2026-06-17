## ADDED Requirements

### Requirement: Error Feedback During Room Joining
The system MUST only display error toasts from the Chat and CreateGroup screens while those screens are still visible (mounted). After the user navigates away, any in-flight async errors SHALL be silently discarded — they MUST NOT surface on unrelated screens.

#### Scenario: Failed to join room — user still on Chat screen
- GIVEN the user has opened a Chat room
- WHEN the `joinRoom` async operation fails
- AND the Chat screen is still visible (mounted)
- THEN an error toast "Failed to join room" is shown

#### Scenario: Failed to join room — user has navigated away
- GIVEN the user opened a Chat room
- WHEN the `joinRoom` async operation fails
- AND the user has already navigated away from the Chat screen (screen is unmounted)
- THEN no toast is shown on the current screen

#### Scenario: Join-wait timeout — user still on Chat screen
- GIVEN the root peer has not connected within the timeout window
- AND the Chat screen is still visible (mounted)
- THEN a timeout toast is shown

#### Scenario: Join-wait timeout — user has navigated away
- GIVEN the root peer has not connected within the timeout window
- AND the Chat screen is unmounted
- THEN no timeout toast is shown on the current screen

#### Scenario: Failed to load peers — user still on Chat screen
- GIVEN the user has opened a Chat room
- WHEN peer loading fails
- AND the Chat screen is still mounted
- THEN an error toast "Failed to load peers" is shown

#### Scenario: Failed to load peers — user has navigated away
- GIVEN the user opened a Chat room
- WHEN peer loading fails after the user navigated away
- THEN no toast is shown on the current screen

#### Scenario: Create Group — failed to join room — user still on CreateGroup screen
- GIVEN the user is on the Create Group screen
- WHEN the room-join after creation fails
- AND the CreateGroup screen is still mounted
- THEN an error toast is shown

#### Scenario: Create Group — failed to join room — user has navigated away
- GIVEN the user was on the Create Group screen
- WHEN the room-join completes with an error after navigation away
- THEN no toast is shown on the current screen

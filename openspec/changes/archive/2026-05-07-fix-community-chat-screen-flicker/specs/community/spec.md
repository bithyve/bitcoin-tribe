## MODIFIED Requirements

### Requirement: Open a Chat
The system MUST allow the user to open any room and exchange text messages in
real time, and chat rendering MUST remain visually stable while rapidly scrolling
through text and image messages.

#### Scenario: Chat opened
- **GIVEN** a room exists in the room list
- **WHEN** the user taps on it
- **THEN** the chat screen opens and historical messages are displayed in chronological order

#### Scenario: Join wait on chat open
- **GIVEN** the user opens a room and the P2P join is in progress
- **WHEN** more than 20 seconds elapse without successfully joining
- **THEN** a timeout is handled gracefully and the user remains on the chat screen

#### Scenario: Message sent
- **GIVEN** the user is in a chat and the room is joined
- **WHEN** the user types a message and sends it
- **THEN** the message appears in the chat immediately
- **AND** is broadcast to all other peers in the room

#### Scenario: Failed to join room
- **GIVEN** the room cannot be joined due to a network error
- **WHEN** the error occurs
- **THEN** an error toast is shown

#### Scenario: Stable rendering during rapid scroll
- **GIVEN** a chat contains many text and image messages
- **WHEN** the user rapidly scrolls up and down in the message list
- **THEN** previously rendered rows remain stable without visible flicker or repeated remount artifacts

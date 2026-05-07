# Community Specification

## Purpose
The community domain provides peer-to-peer messaging between users of the app. It
covers direct messages (DMs) between two users, group chat rooms, and contact sharing. All messaging is transported over a
decentralised P2P network; the app connects to a root relay peer at startup to
discover and receive incoming messages. Community is available across all appTypes.

---
## Requirements
### Requirement: P2P Service Initialisation
The system MUST initialise the P2P messaging service before the community screen
becomes interactive.

#### Scenario: Service ready
- GIVEN the user navigates to the Community tab
- WHEN the P2P service finishes initialising
- THEN the room list is displayed and the user can create or open rooms

#### Scenario: Initialisation in progress
- GIVEN the P2P service is still initialising
- WHEN the Community screen is visible
- THEN a loading indicator is shown and the room list is not yet interactive

#### Scenario: Root peer connection error
- GIVEN the P2P service encounters an error during initialisation
- WHEN the error is raised
- THEN an error toast is shown to the user

---

### Requirement: Room List
The system MUST display a list of all active rooms (direct messages and groups),
sorted by most-recently-active first.

#### Scenario: Rooms shown
- GIVEN the user has at least one DM or group room
- WHEN the Community screen loads
- THEN all rooms are listed with their name, last message preview, and timestamp

#### Scenario: Empty state
- GIVEN the user has no rooms
- WHEN the Community screen loads
- THEN an empty state illustration is shown with a prompt to start a conversation

#### Scenario: Rooms reload on screen focus
- GIVEN the user returns to the Community tab after navigating away
- WHEN the screen regains focus
- THEN the room list is refreshed to reflect any new messages or rooms

---

### Requirement: Inbox Auto-Sync
The system MUST automatically sync the user's inbox once per session when the root
peer connects, to deliver any pending DM invitations received while offline.

#### Scenario: Auto-sync on first connection
- GIVEN the root peer has just connected for the first time in this session
- WHEN the Community screen is active
- THEN the inbox is synced and any newly delivered DM invitations appear as rooms
  in the list

---

### Requirement: Pull-to-Refresh
The system MUST allow the user to manually trigger a network refresh from the room list.

#### Scenario: Refresh while connected
- GIVEN the root peer is connected
- WHEN the user pulls down on the room list
- THEN the room list reloads and the inbox syncs for new messages

#### Scenario: Refresh while disconnected
- GIVEN the root peer is disconnected
- WHEN the user pulls down on the room list
- THEN the app attempts to reconnect to the root peer before reloading rooms
- AND an error toast is shown if reconnection fails

---

### Requirement: User Contact Sharing
The system MUST provide the user with a shareable contact link and QR code that
others can use to initiate a DM.

#### Scenario: Contact QR displayed
- GIVEN the user is on the Community screen
- WHEN the user opens the "My QR" panel
- THEN a QR code encoding the user's contact deep link is displayed

#### Scenario: Contact link copied
- GIVEN the QR panel is open
- WHEN the user taps Copy
- THEN the contact deep link is copied to the clipboard and a confirmation toast is shown

#### Scenario: Contact link shared
- GIVEN the QR panel is open
- WHEN the user taps Share
- THEN the device share sheet opens with the contact link pre-populated

---

### Requirement: Start a Direct Message
The system MUST allow the user to initiate a DM with another user by scanning their
contact QR code or pasting their contact link.

#### Scenario: DM started via QR scan
- GIVEN the user opens the Start DM modal and scans a valid contact QR code
- WHEN the QR code is decoded and contains a valid peer public key
- THEN a DM invitation is sent to that peer
- AND the user is navigated to the new DM chat screen

#### Scenario: DM started via pasted link
- GIVEN the user opens the Start DM modal and pastes a contact link
- WHEN the link contains a valid peer public key
- THEN a DM invitation is sent and the user is navigated to the DM chat

#### Scenario: Invalid QR code
- GIVEN the user scans a QR code in the Start DM modal
- WHEN the code does not contain a valid contact deep link
- THEN an error toast is shown and the scanner remains active

#### Scenario: Self-DM prevented
- GIVEN the user scans or pastes their own contact link
- WHEN the public key matches the user's own key
- THEN an error toast is shown and no DM is created

---

### Requirement: Receiving a DM Invitation
The system MUST deliver incoming DM invitations to the user and create a
corresponding room so the conversation can begin.

#### Scenario: DM invitation received
- GIVEN another user has sent a DM invitation to this user's public key
- WHEN the inbox syncs (on connection or manual refresh)
- THEN the new DM appears in the room list
- AND the user can open it and begin chatting

---

### Requirement: Join a Group Room
The system MUST allow the user to join a group room via a QR code or deep link
shared by a current group member.

#### Scenario: Join via QR scan on create/join screen
- GIVEN the user opens Create/Join Group and selects the Join tab
- WHEN the user scans a valid group QR code
- THEN the app joins the group room
- AND the user is navigated to the group chat

#### Scenario: Join via deep link
- GIVEN the user taps a group invite deep link from outside the app
- WHEN the app processes the link
- THEN the Create/Join Group screen opens pre-filled with the group details
- AND the join is attempted automatically once the P2P service is ready

#### Scenario: Invalid group link
- GIVEN the user scans or opens a link with no room type
- WHEN the link is parsed
- THEN an error toast "Invalid group link" is shown and no room is created

---

### Requirement: Create a Group Room
The system MUST allow the user to create a new group room with a name, description,
and optional image.

#### Scenario: Group created
- GIVEN the user has filled in a group name, description, and image on the Create tab
- WHEN the user submits the form
- THEN the group room is created
- AND the user is navigated to the new group chat

#### Scenario: Create button disabled with incomplete fields
- GIVEN the user is on the Create Group screen
- WHEN any of name, description, or image is missing
- THEN the create button is disabled

---

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

### Requirement: Peer Identity Display
The system MUST display each peer's name and avatar (if available) alongside their
messages in a chat.

#### Scenario: Peer with profile shown
- GIVEN a peer has shared their identity (name and image) in the room
- WHEN their messages are rendered
- THEN their display name and avatar are shown

#### Scenario: Peer without profile
- GIVEN a peer has not shared profile information
- WHEN their messages are rendered
- THEN a placeholder initial avatar and truncated peer ID are shown

---

### Requirement: Group Info
The system MUST allow the user to view information about a group room, including its
name, description, and current member list.

#### Scenario: Group info opened
- GIVEN the user is in a group chat
- WHEN the user taps the info icon
- THEN the group info screen shows the group name, description, and list of members with names and avatars

#### Scenario: Group QR shared from info screen
- GIVEN the user is viewing group info
- WHEN the user taps the QR icon
- THEN the group's invite QR screen is displayed

#### Scenario: Group info not available for DMs
- GIVEN the user is in a DM chat
- WHEN the user attempts to open group info
- THEN an error toast is shown indicating group info is not available for DMs

---

### Requirement: Group QR Code
The system MUST allow a group member to share the group invite QR code and link so
others can join.

#### Scenario: Group QR displayed
- GIVEN the user navigates to the Group QR screen
- WHEN the screen loads
- THEN a QR code encoding the group's invite deep link is displayed with the group name

#### Scenario: Group link copied
- GIVEN the Group QR screen is open
- WHEN the user taps Copy
- THEN the group invite deep link is copied to the clipboard

#### Scenario: Group QR shared
- GIVEN the Group QR screen is open
- WHEN the user taps Share
- THEN the device share sheet opens with the link and a screenshot of the QR code

---

### Requirement: Edit Group
The system MUST allow the group creator to edit the group name, description, and image.

#### Scenario: Group updated
- GIVEN the user has changed the group name, description, or image
- WHEN the user saves the changes
- THEN the group room reflects the updated details

#### Scenario: Save disabled with incomplete fields
- GIVEN the user is on the Edit Group screen
- WHEN name, description, or image is missing
- THEN the save button is disabled

---

### Requirement: Profile Info (Own Contact Card)
The system MUST display the user's own contact information — including their public
key as a QR code — so they can share it with others.

#### Scenario: Profile info screen opened
- GIVEN the user navigates to their profile info
- WHEN the screen loads
- THEN their public key is shown as a QR code along with copy, share, and scan options

#### Scenario: Scan another user's QR from profile info
- GIVEN the profile info screen is open
- WHEN the user taps Scan
- THEN the QR scanner opens to read another user's contact QR


# Channels Specification

## Purpose
This domain is responsible for managing RGB Lightning Network payment channels, Lightning payments (send and receive), and the RGB node that underlies them. It covers opening and closing channels with RGB asset allocations, generating Lightning invoices, sending Lightning payments against a decoded invoice, and viewing node identity and operational status. All functionality in this domain requires `appType` to be `SUPPORTED_RLN`.

---

## Requirements

### Requirement: Channel List
WHEN appType is `SUPPORTED_RLN`, the system MUST display a list of all Lightning channels associated with the node. Each channel entry MUST show the associated RGB asset name, the local (outbound) asset balance, the remote (inbound) asset balance, the local balance in millisatoshis, and the channel capacity in satoshis. The list MUST refresh automatically each time the screen comes into focus. While the channel data is loading, the system MUST display a loading indicator in place of the list.

#### Scenario: Channels present
- GIVEN the node has at least one channel
- WHEN the user navigates to the channels screen
- THEN the system MUST display each channel with its asset name, local balance, remote balance, capacity, and local millisatoshi balance
- AND the header MUST show the total number of channels

#### Scenario: No channels yet
- GIVEN the node has no channels
- WHEN the user navigates to the channels screen
- THEN the system MUST display an empty state with a prompt to open the first channel

---

### Requirement: Channel Detail
WHEN appType is `SUPPORTED_RLN`, the system MUST allow the user to view the full detail of a selected channel. The detail view MUST display: channel status, local asset amount, short channel ID, capacity in satoshis, local balance in millisatoshis, outbound balance in millisatoshis, inbound balance in millisatoshis, next outbound HTLC limit and minimum in millisatoshis, peer alias, readiness flag, usability flag, public flag, channel ID, funding transaction ID, peer public key, and the RGB asset ID.

The system MUST allow the user to close the channel from this screen. Before executing closure, the system MUST present a confirmation prompt. On successful closure, the system MUST navigate back to the channel list and display a success notification. On failure, the system MUST display an error notification.

#### Scenario: Viewing channel detail
- GIVEN the user taps a channel in the list
- WHEN the detail screen loads
- THEN the system MUST display all channel fields listed above

#### Scenario: Closing a channel
- GIVEN the user is on a channel detail screen
- WHEN the user taps close channel and confirms the prompt
- THEN the system MUST submit the close-channel request
- AND navigate back to the channel list on success with a success notification

#### Scenario: Channel closure failure
- GIVEN the user confirms channel closure
- WHEN the closure request fails
- THEN the system MUST display an error notification and remain on the detail screen

---

### Requirement: Open RGB Channel
WHEN appType is `SUPPORTED_RLN`, the system MUST allow the user to open a new Lightning channel with an RGB asset allocation by providing: a peer public key and network address, a channel capacity in satoshis, a push amount in millisatoshis, a selected RGB asset (coin or collectible), and an asset amount to allocate. The open button MUST be disabled until all fields are provided.

The system MUST display a progress indicator during channel creation. The user MUST be able to paste the peer address from the clipboard. If the selected asset's spendable balance is zero or less than the entered amount, the system MUST display an inline validation error. On success, the system MUST navigate back to the channel list and display a success notification.

#### Scenario: Successful channel opening
- GIVEN the user has provided all required fields and the asset has sufficient spendable balance
- WHEN the user confirms channel opening
- THEN the system MUST submit the open-channel request
- AND display a progress indicator while the channel is being negotiated
- AND navigate back to the channel list with a success notification on completion

#### Scenario: Asset amount exceeds spendable balance
- GIVEN the user enters an asset amount greater than the selected asset's spendable balance
- WHEN the amount field is validated
- THEN the system MUST display an inline error showing the available spendable balance

#### Scenario: Open channel failure
- GIVEN the user submits a valid open-channel request
- WHEN the node returns an error
- THEN the system MUST display the error message and remain on the open-channel screen

---

### Requirement: Lightning Receive
WHEN appType is `SUPPORTED_RLN`, the system MUST allow the user to generate a Lightning invoice to receive a payment. The system MUST automatically generate a default invoice on screen load. The invoice MUST be presented as a scannable QR code alongside the invoice string. The user MUST be able to specify a custom amount to embed in the invoice.

#### Scenario: Generating a default Lightning invoice
- GIVEN the user navigates to the Lightning receive screen
- WHEN the screen loads
- THEN the system MUST automatically generate a Lightning invoice and display it as a QR code

#### Scenario: Adding a custom amount
- GIVEN the Lightning receive screen is showing the generated invoice
- WHEN the user opens the add-amount modal and enters an amount
- THEN the system MUST generate a new invoice embedding that amount and update the displayed QR code

#### Scenario: Invoice generation failure
- GIVEN the screen loads but the node cannot generate an invoice
- WHEN the error is returned
- THEN the system MUST display an error notification

---

### Requirement: Lightning Send
WHEN appType is `SUPPORTED_RLN`, the system MUST allow the user to send a Lightning payment by providing a Lightning invoice string. The system MUST decode the invoice and display the decoded details — including the invoice string, RGB asset ID (if present), asset amount, and payment hash — before the user confirms the payment. The user MUST be able to review all decoded details prior to sending. On success, the system MUST display a success confirmation. On failure, the system MUST display an error notification.

#### Scenario: Successful Lightning payment
- GIVEN the user provides a valid Lightning invoice
- WHEN the decoded details are displayed and the user confirms
- THEN the system MUST submit the payment
- AND display a success confirmation when the payment status is Pending or confirmed

#### Scenario: Invoice decode failure
- GIVEN the user provides a malformed or unresolvable invoice
- WHEN decoding fails
- THEN the system MUST display an error notification and navigate back

#### Scenario: Payment failure
- GIVEN the user confirms a valid decoded invoice
- WHEN the payment submission fails
- THEN the system MUST display an error notification

---

### Requirement: Generate RGB Asset Invoice
WHEN appType is `SUPPORTED_RLN` or `NODE_CONNECT`, the system MUST allow the user to generate a receive invoice for a specific RGB asset. The user MUST be able to select an asset from their existing coins and collectibles or enter an asset ID manually. The user MUST be able to choose the invoice type: blinded UTXO or witness output. The user MAY specify an optional amount. The user MAY set an invoice expiry duration. The system MUST verify that the node has a positive BTC balance before generating the invoice; if not, the system MUST display a balance-insufficient warning and block generation.

#### Scenario: Generating a blinded invoice for a coin
- GIVEN the user selects an RGB coin and chooses the blinded invoice type
- WHEN the user confirms with or without an amount
- THEN the system MUST generate an RGB invoice and display it as a QR code

#### Scenario: Generating a witness invoice
- GIVEN the user selects a witness invoice type
- WHEN the user confirms
- THEN the system MUST generate a witness-output invoice and display it as a QR code

#### Scenario: Insufficient node BTC balance
- GIVEN the node BTC balance is zero
- WHEN the user attempts to generate an invoice
- THEN the system MUST display an error indicating insufficient balance and prevent generation

---

### Requirement: Node Information
WHEN appType is `SUPPORTED_RLN` or `NODE_CONNECT`, the system MUST display the node's operational details including: node ID, public key (when available), API URL, peer URL (public key combined with peer DNS address), on-chain public key (for `NODE_CONNECT` only), RGB HTLC minimum millisatoshis, RGB channel capacity minimum satoshis, and channel capacity minimum satoshis. The screen MUST show the current node status (e.g., Running, Starting, Paused, Destroyed) with a distinct colour per status. The system MUST allow the user to unlock the node when it is in a locked state.

The system MUST provide a footer with controls to restart or sync the node when the node exists and is not destroyed. On successful sync, the system MUST display a success notification. On failed sync, the system MUST display a descriptive error notification.

#### Scenario: Viewing node info when running
- GIVEN the node is in a Running state
- WHEN the user opens the node info screen
- THEN the system MUST display all available node fields with the status highlighted in green

#### Scenario: Unlocking a locked node
- GIVEN the node is in a locked state (public key not available)
- WHEN the user taps the unlock control
- THEN the system MUST attempt to unlock the node
- AND display a success notification and update the online indicator on success
- AND display a descriptive error notification on failure

#### Scenario: Syncing the node
- GIVEN the node is running
- WHEN the user triggers a sync from the footer
- THEN the system MUST sync the node
- AND display a success notification on completion or an error notification on failure

#### Scenario: Node not found
- GIVEN the node status returns as Destroyed or cannot be determined
- WHEN the screen loads
- THEN the system MUST display a "node not found" state with explanatory text

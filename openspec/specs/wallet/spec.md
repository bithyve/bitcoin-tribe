# Wallet Specification

## Purpose
The wallet domain manages the user's on-chain Bitcoin balance, addresses, and
transactions. It is responsible for displaying confirmed and unconfirmed balances,
generating receive addresses, sending BTC to external addresses, viewing transaction
history, managing UTXOs, and exporting the account xPub. In `NODE_CONNECT` and
`SUPPORTED_RLN` modes the wallet also tracks a reserved sats balance that is
allocated to RGB UTXOs and cannot be spent as regular BTC.

---
## Requirements
### Requirement: Balance Display
The system MUST display the wallet's confirmed and unconfirmed on-chain BTC balance.

#### Scenario: Confirmed balance shown
- GIVEN the wallet has been synced at least once
- WHEN the user opens the wallet home screen
- THEN the confirmed balance is displayed
- AND the unconfirmed (pending) balance is displayed separately when non-zero

#### Scenario: Balance after refresh
- GIVEN the wallet is online
- WHEN the user performs a pull-to-refresh
- THEN the wallet syncs with the network
- AND the displayed balance reflects the latest confirmed and unconfirmed amounts

---

### Requirement: Reserved Sats Display
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST display a
reserved sats amount distinct from the spendable balance.

#### Scenario: Reserved sats shown on transaction list
- GIVEN the user has colorable UTXOs allocated for RGB assets
- WHEN the user views the transaction list screen
- THEN a reserved sats indicator is shown with the total amount locked in colorable UTXOs
- AND tapping the indicator navigates to the unspent UTXO list

---

### Requirement: Transaction History
The system MUST display a list of past on-chain transactions for the wallet.

#### Scenario: Transaction list rendered
- GIVEN the wallet has at least one transaction
- WHEN the user opens the wallet details screen
- THEN the transactions are listed in reverse chronological order
- AND each entry shows the transaction type (Sent / Received), amount, and date

#### Scenario: View all transactions
- GIVEN the wallet has more transactions than the home screen shows
- WHEN the user taps "View all transactions"
- THEN all transactions are shown on a dedicated screen
- AND the reserved sats indicator is also visible on that screen

---

### Requirement: Transaction Detail
The system MUST allow the user to view the full details of a single transaction.

#### Scenario: Transaction detail opened
- GIVEN a transaction is visible in the list
- WHEN the user taps on it
- THEN a detail screen is shown with the transaction ID, amount, fee, confirmations, and date

#### Scenario: Transaction not found
- GIVEN a transaction ID that no longer exists in the local store
- WHEN the detail screen attempts to load it
- THEN an error toast is shown
- AND the user is returned to the previous screen

#### Scenario: Amount display in node modes
- GIVEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`
- WHEN a transaction detail is shown
- THEN the amount displayed is the `received` value from the node

---

### Requirement: Receive On-Chain BTC
The system MUST allow the user to generate and share a Bitcoin receive address.

#### Scenario: Address generated (ON_CHAIN)
- GIVEN appType is `ON_CHAIN`
- WHEN the user opens the receive screen
- THEN a fresh unused external address is derived and displayed as both a QR code and a copyable string

#### Scenario: Address generated (NODE_CONNECT / SUPPORTED_RLN)
- GIVEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`
- WHEN the user opens the receive screen
- THEN the node's current on-chain BTC address is fetched and displayed as a QR code and copyable string

#### Scenario: Node address fetch failure
- GIVEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`
- WHEN the node address fetch fails
- THEN an error toast is shown
- AND the user is returned to the previous screen

#### Scenario: Amount-encoded payment URI
- GIVEN a receive address is displayed
- WHEN the user enters an optional amount
- THEN the QR code and address update to a BIP-21 payment URI encoding that amount

#### Scenario: Backup phrase reminder
- GIVEN the user has not yet backed up their seed phrase
- WHEN the receive screen is opened
- THEN a backup reminder prompt is shown before the address is displayed

---

### Requirement: Send On-Chain BTC (ON_CHAIN)
WHEN appType is `ON_CHAIN`, the system MUST allow the user to send BTC to a Bitcoin
address by scanning a QR code or entering an address manually.

#### Scenario: Send via QR scan
- GIVEN the user opens the send screen
- WHEN the user scans a QR code containing a valid Bitcoin address or BIP-21 URI
- THEN the address and optional amount are pre-filled on the confirmation screen

#### Scenario: Send via manual entry
- GIVEN the user opens the send screen
- WHEN the user taps the manual entry option
- THEN an address input field is presented

#### Scenario: Invalid address scanned
- GIVEN the user opens the send screen
- WHEN the user scans a QR code that is not a valid Bitcoin address or payment URI
- THEN an error toast is shown
- AND the scanner remains active

#### Scenario: Amount entry and fee selection
- GIVEN a valid recipient address has been entered
- WHEN the user proceeds to the send confirmation screen
- THEN the user can enter an amount in sats, BTC, or the selected fiat currency
- AND the user can choose a fee priority (low / medium / high / custom)

#### Scenario: Transaction broadcast
- GIVEN the amount and fee have been confirmed
- WHEN the user authorises the send
- THEN the transaction is signed and broadcast to the network
- AND a success confirmation is displayed

---

### Requirement: Send On-Chain BTC (NODE_CONNECT / SUPPORTED_RLN)
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user
to send BTC to a Bitcoin address via the connected node.

#### Scenario: Send routed through node
- GIVEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`
- WHEN the user initiates a BTC send and confirms the transaction
- THEN the payment is submitted through the node's on-chain send endpoint

---

### Requirement: Lightning Send
WHEN appType is `SUPPORTED_RLN`, the system MUST allow the user to pay a Lightning
invoice.

#### Scenario: Invoice decoded and confirmed
- GIVEN appType is `SUPPORTED_RLN`
- WHEN the user scans or pastes a Lightning invoice
- THEN the invoice is decoded and the amount and recipient description are shown for confirmation

#### Scenario: Payment sent
- GIVEN a valid Lightning invoice is displayed
- WHEN the user confirms payment
- THEN the payment is submitted and a pending status is shown

#### Scenario: Invalid invoice
- GIVEN the user scans a QR code
- WHEN the scanned value is not a valid Lightning invoice
- THEN an error toast is shown and the user can retry

---

### Requirement: Lightning Receive
WHEN appType is `SUPPORTED_RLN`, the system MUST allow the user to generate a
Lightning invoice to receive BTC.

#### Scenario: Invoice generated
- GIVEN appType is `SUPPORTED_RLN`
- WHEN the user opens the Lightning receive screen
- THEN a Lightning invoice is generated automatically and displayed as a QR code

#### Scenario: Invoice generation failure
- GIVEN the node is unreachable
- WHEN the Lightning receive screen loads
- THEN an error toast is shown

---

### Requirement: Buy BTC via Ramp
The system SHOULD allow the user to purchase BTC using an external on-ramp service.

#### Scenario: Ramp URL opened
- GIVEN the user opens the Buy BTC screen
- WHEN the user taps the buy button
- THEN the app generates a Ramp URL pre-filled with the user's current receive address
- AND the URL is opened in the device browser

#### Scenario: Ramp URL failure
- GIVEN the Ramp URL cannot be generated
- WHEN the user taps the buy button
- THEN an error toast is shown

---

### Requirement: UTXO Inspection
The system MUST allow the user to view their unspent transaction outputs (UTXOs).

#### Scenario: UTXO list shown
- GIVEN the wallet has one or more UTXOs
- WHEN the user navigates to the unspent UTXO screen
- THEN all UTXOs are listed with their value, txid/vout reference, and colorable status

---

### Requirement: Account xPub Export
WHEN appType is `ON_CHAIN`, the system MUST allow the user to view and copy the
wallet's extended public key (xPub).

#### Scenario: xPub displayed
- GIVEN appType is `ON_CHAIN`
- WHEN the user opens Wallet Settings and selects "Show xPub"
- THEN the account xPub is displayed as both a QR code and a copyable string

---

### Requirement: Wallet Profile
The system MUST allow the user to edit the wallet's display name and profile picture.

#### Scenario: Name updated
- GIVEN the user has opened Edit Wallet Profile
- WHEN the user changes the name and saves
- THEN the new name is persisted and a success toast is shown

#### Scenario: Profile picture updated
- GIVEN the user has opened Edit Wallet Profile
- WHEN the user selects a new image from their photo library and saves
- THEN the profile picture is updated

#### Scenario: Profile picture removed
- GIVEN the user has a profile picture set
- WHEN the user removes it
- THEN the profile picture is cleared and a confirmation toast is shown

#### Scenario: Save disabled with no changes
- GIVEN the user has opened Edit Wallet Profile
- WHEN no changes have been made to the name or image
- THEN the save action is disabled

---

### Requirement: Currency Display Mode
The system MUST allow the user to toggle the balance and amount display between
sats, BTC, and the selected fiat currency.

#### Scenario: Toggle on send screen
- GIVEN the user is on the send amount entry screen
- WHEN the user taps the currency toggle
- THEN the amount input switches between sats/BTC and the selected fiat currency

---

### Requirement: Wallet Refresh on Focus
The system MUST automatically sync wallet on-chain balances and transactions when the wallet screen regains focus after navigation actions that may have changed confirmation state.

#### Scenario: Auto-refresh after send
- **GIVEN** the user has just completed a send transaction
- **WHEN** they return to the wallet details screen
- **THEN** the wallet balance and transaction list are refreshed automatically

#### Scenario: Pending transaction updates to confirmed without manual refresh
- **GIVEN** an on-chain transaction is shown as pending in the wallet transaction list
- **AND** the transaction receives a blockchain confirmation while the app is active
- **WHEN** the wallet details screen is focused with auto-refresh enabled
- **THEN** the wallet refresh flow runs automatically
- **AND** the transaction status updates from pending to confirmed without manual pull-to-refresh or app restart

#### Scenario: RGB transaction views remain unchanged
- **GIVEN** the user is viewing RGB asset transaction history
- **WHEN** this wallet focus auto-refresh logic runs
- **THEN** the existing RGB transaction refresh behavior remains unchanged


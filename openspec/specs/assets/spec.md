# Assets Specification

## Purpose
The assets domain covers all RGB asset types held in the wallet: Coins (fungible tokens), Inflatable Fungible Assets (IFAs), Collectibles (media-bearing fungible assets), Unique Digital Assets (UDAs, non-fungible), and Collections (curated groups of UDAs). It encompasses viewing asset details and transaction history, sending and receiving assets via RGB invoices, campaign reward claims, issuer identity verification via Twitter and domain ownership, collection gallery browsing, and asset visibility management. All functionality requires `appType` to be `NODE_CONNECT`.

## Requirements

### Requirement: Coin and IFA Detail View
WHEN appType is `NODE_CONNECT`, the system MUST display an asset's name, ticker, icon, and balance (spendable, settled, future) when the user opens a Coin or IFA detail screen.

#### Scenario: Viewing a coin
- GIVEN the user has a Coin in their wallet
- WHEN the user opens the detail screen
- THEN the name, ticker, icon, and all balance components are shown
- AND recent transactions appear below the balance

---

### Requirement: Collectible Detail View
WHEN appType is `NODE_CONNECT`, the system MUST display a Collectible's image, name, ticker, balance (spendable, settled, future), and recent transactions when the user opens the collectible's detail screen.

#### Scenario: Viewing a collectible
- GIVEN the user holds a Collectible
- WHEN the user opens the detail screen
- THEN the associated image, name, ticker, and all balance fields are shown
- AND recent transfers are listed below the balance

---

### Requirement: UDA Detail View
WHEN appType is `NODE_CONNECT`, the system MUST display a UDA's full-screen image, name, asset ID, and transfer history when the user opens the UDA detail screen.

#### Scenario: Viewing a UDA
- GIVEN the user holds a UDA
- WHEN the user opens its detail screen
- THEN a full-screen zoomable image is shown
- AND the user may toggle between image-only view and an info view showing name, asset ID, and transactions

#### Scenario: UDA with no spendable balance
- GIVEN the user's spendable balance for the UDA is zero
- WHEN the user views the detail screen
- THEN the send action is hidden or disabled

---

### Requirement: Transaction History
WHEN appType is `NODE_CONNECT`, the system MUST allow the user to view the complete transfer history for any asset, showing kind (send, receive, or issuance), amount, status, and timestamp per entry.

#### Scenario: Viewing full history
- GIVEN an asset has recorded transfers
- WHEN the user navigates to the full transaction list
- THEN all transfers are displayed in reverse chronological order

#### Scenario: No transfers yet
- GIVEN the asset has no transfers
- WHEN the user views the transaction list
- THEN an empty state is shown

---

### Requirement: Send Fungible Asset
WHEN appType is `NODE_CONNECT`, the system MUST allow the user to send any Coin, IFA, or Collectible with a positive spendable balance to a valid RGB invoice.

#### Scenario: Successful send
- GIVEN the user has sufficient spendable balance and the wallet is online
- WHEN the user enters a valid RGB invoice, specifies an amount within the asset's decimal precision, and confirms
- THEN the system initiates the transfer and displays a success confirmation with transaction details

#### Scenario: Insufficient balance
- GIVEN the requested amount exceeds the user's spendable balance
- WHEN the user attempts to confirm the send
- THEN the system shows an error indicating the balance shortfall

#### Scenario: Insufficient Bitcoin for RGB fees
- GIVEN the user lacks sufficient Bitcoin UTXOs to cover RGB protocol fees
- WHEN the user attempts to send
- THEN the system prompts the user to create additional UTXOs

#### Scenario: Wallet offline
- GIVEN the wallet is in an error or connecting state
- WHEN the user opens the send screen
- THEN the send action is disabled and a wallet status message is shown

---

### Requirement: Send UDA
WHEN appType is `NODE_CONNECT`, the system MUST allow the user to send a UDA with a spendable balance of at least one to a valid RGB invoice. The transfer amount is always one.

#### Scenario: Successful send
- GIVEN the UDA has a spendable balance of at least one and the wallet is online
- WHEN the user enters a valid RGB invoice and confirms
- THEN the system initiates the transfer for exactly one unit and shows a success confirmation

---

### Requirement: Gas-Free Transfer
WHEN appType is `NODE_CONNECT`, the system MAY offer a gas-free transfer option for Coin assets with six decimal places of precision.

#### Scenario: Gas-free send accepted
- GIVEN the asset supports gas-free transfers and the user selects that option
- WHEN the user requests a quote and confirms before it expires
- THEN the transfer completes without the user paying a Bitcoin fee

---

### Requirement: Receive Asset
WHEN appType is `NODE_CONNECT`, the system MUST allow the user to generate a Blinded or Witness RGB invoice for receiving any asset type, displaying it as a QR code with copy and share options.

#### Scenario: Blinded invoice generation
- GIVEN the user selects Blinded invoice type and has sufficient Bitcoin
- WHEN the user generates the invoice
- THEN a UTXO is reserved and the QR code is shown with expiry duration

#### Scenario: Witness invoice generation
- GIVEN the user selects Witness invoice type
- WHEN the user generates the invoice
- THEN the QR code is shown without requiring UTXO reservation

#### Scenario: Insufficient Bitcoin for Blinded mode
- GIVEN the user's Bitcoin balance is below the minimum for a colorable UTXO
- WHEN the user attempts to generate a Blinded invoice
- THEN the system informs the user to add a small amount of Bitcoin first

---

### Requirement: QR Invoice Scanning
WHEN appType is `NODE_CONNECT`, the system MUST allow the user to scan or paste an RGB invoice QR code to initiate a send.

#### Scenario: Valid invoice scanned
- GIVEN the user opens the scanner
- WHEN a valid RGB invoice QR code is detected
- THEN the send screen opens pre-filled with the invoice

#### Scenario: Invalid invoice scanned
- GIVEN the scanned or pasted value is not a valid RGB invoice
- WHEN parsing completes
- THEN an error message is shown

---

### Requirement: Transfer Detail
WHEN appType is `NODE_CONNECT`, the system MUST display full details of an individual transfer including amount, status, timestamp, and transaction ID.

#### Scenario: Cancel pending issuance
- GIVEN a transfer is in a pending state and is an issuance transaction
- WHEN the user taps the cancel action
- THEN the transfer is cancelled and its status is updated

---

### Requirement: Campaign Reward Claim
WHEN appType is `NODE_CONNECT`, the system MAY present a claim button on a Coin detail screen when the coin has an active campaign and the user is eligible.

#### Scenario: Successful witness campaign claim
- GIVEN the coin has an active witness campaign and the user meets eligibility criteria
- WHEN the user taps the claim button
- THEN the system initiates a reward transfer without requiring sats balance for claim preconditions

#### Scenario: Successful blinded campaign claim
- GIVEN the coin has an active blinded campaign, the user meets eligibility criteria, and the user has sufficient sats for claim prerequisites
- WHEN the user taps the claim button
- THEN the system initiates a reward transfer

#### Scenario: Insufficient sats for blinded campaign
- GIVEN the campaign type is blinded and the user has insufficient sats
- WHEN the user attempts to claim
- THEN the system instructs the user to add Bitcoin to their wallet

---

### Requirement: Collection Gallery View
WHEN appType is `NODE_CONNECT`, the system MUST display a collection's banner, icon, name, description, issued item count, total supply (or unlimited indicator), and a scrollable grid of its UDA thumbnails.

#### Scenario: Browsing a collection
- GIVEN the user opens a collection detail screen
- WHEN the collection has items
- THEN all UDA thumbnails are shown in a two-column grid
- AND tapping any thumbnail opens the fullscreen swipeable gallery at that item

---

### Requirement: Collection UDA Gallery (Swiper)
WHEN appType is `NODE_CONNECT`, the system MUST provide a fullscreen paging gallery for a collection's UDAs, allowing the user to swipe between items and view details or perform actions for each.

#### Scenario: Navigating the gallery
- GIVEN the user opens the swiper from a collection
- WHEN the user swipes left or right
- THEN the adjacent UDA's full-screen image is shown
- AND a bottom thumbnail strip scrolls to center the active item

#### Scenario: Actions in the gallery
- GIVEN the user is viewing a UDA in the swiper
- WHEN the user reveals the action bar
- THEN the user may send the UDA, copy or share the asset ID, share or download the image, and toggle info mode

---

### Requirement: Add Item to Collection
WHEN appType is `NODE_CONNECT`, the system MUST allow the collection issuer to add new UDA items to an existing collection they issued.

#### Scenario: Issuer adds a new item
- GIVEN the user has an issuance transaction for the collection
- WHEN the user taps "Add New" on the collection detail screen
- THEN the system navigates to the item issuance flow
- AND the new item appears in the collection gallery after issuance completes

---

### Requirement: Issuer Twitter Verification
WHEN appType is `NODE_CONNECT`, the system MUST allow the asset or collection issuer to verify their Twitter (X) identity via OAuth, and MUST reflect the verified status on the asset detail screen.

#### Scenario: Successful verification
- GIVEN the issuer enters a valid Twitter handle (4–15 alphanumeric characters or underscores)
- WHEN the issuer completes the OAuth authorization flow
- THEN the Twitter account is shown as verified on the asset

#### Scenario: Invalid handle format
- GIVEN the issuer enters a handle with disallowed characters or incorrect length
- WHEN the issuer submits
- THEN a format error message is shown

---

### Requirement: Issuer Domain Verification
WHEN appType is `NODE_CONNECT`, the system MUST allow the asset or collection issuer to verify domain ownership by adding a DNS TXT record and confirming it through the app.

#### Scenario: Successful verification
- GIVEN the issuer has placed the provided TXT record in their domain's DNS
- WHEN the issuer triggers verification
- THEN the domain is marked as verified on the asset detail screen

#### Scenario: Invalid domain format
- GIVEN the issuer enters a malformed domain
- WHEN the issuer submits
- THEN an error message is shown without proceeding

---

### Requirement: Import Twitter Post
WHEN appType is `NODE_CONNECT`, the system MUST allow the asset issuer to link a public tweet to the asset by providing a valid tweet URL.

#### Scenario: Successful import
- GIVEN the issuer provides a valid x.com or twitter.com tweet URL
- WHEN the issuer confirms
- THEN the tweet is linked to the asset and displayed on the detail screen

#### Scenario: Rate limited
- GIVEN too many import attempts have occurred in a short window
- WHEN the issuer attempts another import
- THEN a rate-limit message and a 15-minute countdown timer are shown

---

### Requirement: Asset Visibility Management
The system MUST allow the user to hide any RGB asset (Coin, Collectible, UDA, IFA) from main asset lists, and MUST provide a dedicated hidden-assets screen where all hidden assets can be viewed and restored.

#### Scenario: Restoring a hidden asset
- GIVEN one or more assets are hidden
- WHEN the user opens the hidden assets screen and taps an asset
- THEN the asset is restored to the main asset lists

---

### Requirement: Asset Registry Link
WHEN appType is `NODE_CONNECT`, the system SHOULD allow the user to view an asset's public registry page from the asset detail screen when a registry entry exists.

#### Scenario: Opening registry entry
- GIVEN the asset has been added to the registry
- WHEN the user taps the registry link
- THEN the registry page for that asset is displayed

---

### Requirement: Node Availability Gate
WHEN appType is `NODE_CONNECT`, the system MUST block all send and receive actions while the node is initializing, and display a status notice to the user.

#### Scenario: Node initializing
- GIVEN the node is in the process of initializing
- WHEN the user attempts to send or receive an asset
- THEN the action is blocked and a "Connecting to node" notice is shown

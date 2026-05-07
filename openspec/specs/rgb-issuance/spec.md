# RGB Issuance Specification

## Purpose
This domain is responsible for creating new RGB assets on the user's node: fungible coins (NIA), collectibles and unique digital assets (CFA / UDA), grouped collections, inflatable fungible assets (IFA), and the on-chain RGB UTXO slots required to hold those assets. It also covers the management of pending asset-receive invoices and the inspection of existing unspent outputs. All issuance functionality requires an active RGB node connection.

---
## Requirements
### Requirement: Issuance Access Control
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user to issue RGB assets. The issuance entry point MUST be disabled and all issuance forms MUST be inaccessible when the wallet is offline or a node synchronisation is in progress.

#### Scenario: Issuance blocked while offline
- GIVEN the wallet is offline or node sync is in progress
- WHEN the user attempts to open an issuance form
- THEN the issue button MUST be disabled and the user MUST NOT be able to submit the form

#### Scenario: Issuance available when online
- GIVEN the wallet is online and appType is `NODE_CONNECT` or `SUPPORTED_RLN`
- WHEN the user navigates to the issuance section
- THEN all issuance options (coin, collectible, collection, IFA) MUST be accessible

---

### Requirement: Issue Fungible Coin (NIA)
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user to create a new fungible RGB coin by supplying a name, ticker symbol, total supply, and decimal precision.

The total supply MUST be capped at 2^64 − 1 supply units. Precision MUST be adjustable between 0 and 8 decimal places. The issue action MUST be disabled until name, ticker, and total supply are all provided.

#### Scenario: Successful coin creation
- GIVEN the user has provided a valid name, ticker, total supply, and precision
- WHEN the user confirms issuance
- THEN the system MUST create the coin on the RGB network
- AND display a success notification
- AND navigate the user to the asset registry or coin detail screen
- AND trigger an automatic backup

#### Scenario: Insufficient RGB allocation slots
- GIVEN the user confirms issuance but no colorable UTXOs are available
- WHEN the system detects a lack of allocation slots
- THEN the system MUST automatically create the required RGB UTXOs and retry issuance
- AND notify the user if UTXO creation itself fails

#### Scenario: Validation error
- GIVEN the user submits the form with a missing name, ticker, or total supply
- WHEN the form is submitted
- THEN the system MUST display an inline validation error for each missing field and prevent submission

---

### Requirement: Issue Collectible or Unique Digital Asset (CFA / UDA)
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user to create a new collectible (fungible CFA with a supply greater than one) or a unique digital asset (UDA, supply of one). The user MUST be able to toggle between collectible type and UDA type before submitting.

Both types MUST require a name, description, and a primary media image. A collectible MUST additionally require a ticker and total supply. A UDA MUST require a ticker and MAY include additional attachment files.

#### Scenario: Successful collectible creation
- GIVEN the user provides a valid name, ticker, description, image, and total supply with collectible type selected
- WHEN the user confirms issuance
- THEN the system MUST create the collectible on the RGB network
- AND display a success notification
- AND navigate the user to the asset registry or collectible detail screen
- AND trigger an automatic backup

#### Scenario: Successful UDA creation
- GIVEN the user provides a valid name, ticker, description, and media image with UDA type selected
- WHEN the user confirms issuance
- THEN the system MUST create a unique digital asset on the RGB network
- AND display a success notification
- AND navigate the user to the asset registry or UDA detail screen
- AND trigger an automatic backup

#### Scenario: Insufficient RGB allocation slots
- GIVEN the user confirms issuance but no colorable UTXOs are available
- WHEN the system detects a lack of allocation slots
- THEN the system MUST automatically create the required RGB UTXOs and retry issuance

---

### Requirement: Issue Collection
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user to create a named collection that groups multiple UDA items. The user MUST provide a collection name, description, a landscape banner image, and a square collection logo. The user MUST be able to choose between a fixed total supply or an open (unlimited) supply for the collection.

The system MUST collect and process a service fee before completing collection creation. If the user opts into issuer verification at creation time, an additional verification fee MUST be added to the total. The system MUST block creation and display an error if the wallet balance is insufficient to cover the combined service fee and any required UTXO funding.

#### Scenario: Successful collection creation with fixed supply
- GIVEN the user provides a valid name, description, banner image, collection logo, and fixed supply amount
- WHEN the user confirms and the service fee is successfully paid
- THEN the system MUST create the collection on the RGB network
- AND display a success confirmation
- AND trigger an automatic backup

#### Scenario: Successful collection creation with open supply
- GIVEN the user provides a valid name, description, banner image, and collection logo with open supply selected
- WHEN the user confirms and the service fee is successfully paid
- THEN the system MUST create the collection without a supply cap

#### Scenario: Insufficient balance for service fee
- GIVEN the wallet balance is below the required service fee
- WHEN the user attempts to proceed
- THEN the system MUST display an error message stating the minimum required amount and prevent collection creation

#### Scenario: Insufficient RGB allocation slots during collection creation
- GIVEN no colorable UTXOs exist at the time of issuance
- WHEN the system detects insufficient allocation slots
- THEN the system MUST automatically create the required RGB UTXOs and retry issuance

---

### Requirement: Add Item to Collection
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user to mint a new UDA item within an existing collection by providing a name, ticker, description, and primary media image. The item MAY include additional attachment files. A service fee MAY be required.

Each minted item MUST be associated with its parent collection and MUST embed a deep-link reference that allows the item to be discovered and verified as a collection member.

#### Scenario: Successful item creation
- GIVEN the user selects a collection and provides a valid name, ticker, description, and image
- WHEN the user confirms and any applicable service fee is paid
- THEN the system MUST mint the UDA item within the collection
- AND display a success notification
- AND trigger an automatic backup

#### Scenario: Insufficient RGB allocation slots
- GIVEN no colorable UTXOs exist at the time of minting
- WHEN the system detects insufficient allocation slots
- THEN the system MUST automatically create the required RGB UTXOs before proceeding

---

### Requirement: Issue Inflatable Fungible Asset (IFA)
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user to create a new inflatable fungible asset by providing a name, ticker, total supply, decimal precision, and a number of replace rights. The issue action MUST be disabled until all required fields are provided with valid values.

The IFA total supply MUST be strictly greater than zero. Replace rights (amendments) MUST accept zero or a positive integer. The system MUST show an explicit validation error message for invalid numeric values and MUST NOT show blank error states when submission is blocked.

#### Scenario: Successful IFA creation
- **GIVEN** the user is online and appType is `NODE_CONNECT` or `SUPPORTED_RLN`
- **WHEN** the user provides a valid name, ticker, total supply greater than zero, precision, and replace rights number (zero or greater) and confirms issuance
- **THEN** the system MUST create the IFA on the RGB network
- **AND** display a success notification
- **AND** navigate the user to the asset registry or IFA detail screen
- **AND** trigger an automatic backup

#### Scenario: Invalid zero total supply
- **GIVEN** the user enters `0` as IFA total supply
- **WHEN** the user attempts to proceed
- **THEN** the system MUST prevent submission
- **AND** display a non-empty inline validation error for total supply

#### Scenario: Zero amendments accepted
- **GIVEN** the user enters `0` as replace rights (amendments) and enters a valid total supply greater than zero
- **WHEN** the user attempts to proceed
- **THEN** the amendments field MUST be considered valid
- **AND** the system MUST proceed only if all other required fields are valid

#### Scenario: Invalid blank amendments
- **GIVEN** the user leaves replace rights (amendments) empty
- **WHEN** the user attempts to proceed
- **THEN** the system MUST prevent submission
- **AND** display a non-empty inline validation error for amendments

### Requirement: Create RGB UTXOs
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST allow the user to manually create a batch of RGB-colorable UTXOs to serve as asset allocation slots. The system MUST display a confirmation screen showing the number of UTXOs to be created, the satoshi amount per UTXO, the estimated transaction fee, and the total cost before the user commits.

#### Scenario: Successful UTXO creation
- GIVEN the user reviews and confirms the UTXO creation summary
- WHEN the on-chain transaction is broadcast
- THEN the system MUST display a success confirmation
- AND the new UTXOs MUST become available as colorable allocation slots

#### Scenario: Failed UTXO creation
- GIVEN the user confirms UTXO creation but the transaction fails
- WHEN the failure is detected
- THEN the system MUST display an error notification and leave the user on the previous screen

---

### Requirement: View Unspent Outputs
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST display the user's RGB unspent outputs categorised into two tabs: colored (UTXOs that carry asset allocations) and colorable (UTXOs that are available for future allocations). The user MUST be able to pull-to-refresh to reload the UTXO list. Tapping a UTXO MUST open the corresponding transaction in a block explorer, except on regtest networks where the explorer is unavailable.

#### Scenario: Viewing colored UTXOs
- GIVEN the user opens the unspent outputs screen
- WHEN the user selects the colored tab
- THEN the system MUST list all UTXOs that currently hold asset allocations

#### Scenario: Viewing colorable UTXOs
- GIVEN the user opens the unspent outputs screen
- WHEN the user selects the colorable tab
- THEN the system MUST list all UTXOs that are available as empty allocation slots

#### Scenario: Block explorer unavailable on regtest
- GIVEN the device is connected to a regtest network
- WHEN the user taps a UTXO
- THEN the system MUST display a notification that the explorer is not available

---

### Requirement: Invoice Management
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST provide a consolidated list of all pending asset-receive invoices across all asset types (coins, collectibles, UDAs, collections, IFAs). Each invoice entry MUST display the invoice string, recipient identifier, expiration date and time, and invoice type (blinded or witness). The user MUST be able to copy an invoice to the clipboard by tapping it. The user MUST be able to cancel any invoice that was generated as a default (non-payment-channel) invoice.

#### Scenario: Copying an invoice
- GIVEN the user opens the invoices screen and at least one invoice is listed
- WHEN the user taps an invoice
- THEN the invoice string MUST be copied to the clipboard

#### Scenario: Cancelling a default invoice
- GIVEN a default invoice is listed
- WHEN the user cancels it
- THEN the invoice MUST be removed from the active list

#### Scenario: Empty invoice list
- GIVEN no pending invoices exist
- WHEN the user opens the invoices screen
- THEN the system MUST display an empty state indicator

---

### Requirement: Asset Metadata View
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, after issuing an asset the system MUST display a metadata screen showing the asset's on-chain details including name, ticker, total supply, precision, and issuance timestamp. The screen MUST show the asset's current issuer verification status (unverified, domain-verified, or X-verified). The user MUST be able to hide the asset from the main list and SHOULD be able to share the issuance event via a post on X (Twitter).

#### Scenario: Viewing newly issued coin metadata
- GIVEN the user has successfully issued a coin and is navigated to the metadata screen
- WHEN the screen loads
- THEN the system MUST display name, ticker, total supply, precision, and issuance timestamp

#### Scenario: Sharing issuance on X
- GIVEN the user opens the metadata screen for a newly issued asset
- WHEN the user selects the option to post on X
- THEN the system MUST present a post composition modal pre-filled with issuance details

#### Scenario: Hiding an asset
- GIVEN the user opens the metadata screen for any issued asset
- WHEN the user activates the hide option
- THEN the asset MUST no longer appear in the main asset list


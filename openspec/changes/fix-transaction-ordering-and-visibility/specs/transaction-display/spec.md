# Capability: transaction-display

Governs how RGB asset transactions are ordered and surfaced in the "Recent Transactions" section and the "View All" transaction list on asset detail screens.

---

## Scenarios

### 1. Recent Transactions section — latest transaction visible (non-NodeConnect)

**Given** a Collectible or IFA asset has one or more transactions stored in Realm (newest-first order)  
**When** the user views the asset detail screen  
**Then** the "Recent Transactions" section shows the most-recent transaction at the top  
**And** older transactions appear below it in descending chronological order

---

### 2. Recent Transactions section — latest transaction visible (NodeConnect / SUPPORTED_RLN)

**Given** a Collectible or IFA asset has transactions in Realm and the user is in NODE_CONNECT or SUPPORTED_RLN mode  
**When** the user views the asset detail screen  
**Then** merged payment+transaction data is sorted newest-first  
**And** the most-recent entry appears at the top of the list

---

### 3. View All transactions screen — newest-first ordering

**Given** an RGB asset has multiple transactions  
**When** the user navigates to the "View All" transactions screen (CoinAllTransaction)  
**Then** transactions are displayed with the most-recent at the top  
**And** each subsequent row is progressively older

---

### 4. TransactionsList component — independent of input order

**Given** the `TransactionsList` component receives a transactions array in any order  
**When** the component renders  
**Then** it internally sorts by `createdAt` descending  
**And** the most-recent transaction always appears first

---

### 5. IFADetails — Recent Transactions not empty

**Given** an IFA asset with at least one transaction  
**When** the user views the IFA detail screen  
**Then** the "Recent Transactions" section is populated (not empty / undefined)  
**And** transactions are shown newest-first

---

### 6. Row limiting via limitToVisibleRows

**Given** `TransactionsList` is rendered with `limitToVisibleRows` enabled  
**When** there are more transactions than the computed visible row cap  
**Then** only the top N (newest) transactions are shown  
**And** no oldest-first clipping occurs

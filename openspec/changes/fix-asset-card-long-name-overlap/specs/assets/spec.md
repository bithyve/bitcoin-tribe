## ADDED Requirements

### Requirement: Asset Card Name Truncation
WHEN appType is `NODE_CONNECT` or `SUPPORTED_RLN`, the system MUST render asset names in list cards without overlapping the balance/value area, and MUST truncate long names with ellipsis within the name column.

#### Scenario: Long RGB asset name in list card
- **GIVEN** an RGB asset with a name longer than the available card title width
- **WHEN** the asset is rendered in the Assets list card row
- **THEN** the name is limited to one line and displayed with ellipsis
- **AND** the balance/value text remains visible in its own non-overlapping column

#### Scenario: Short RGB asset name in list card
- **GIVEN** an RGB asset with a short name
- **WHEN** the asset is rendered in the Assets list card row
- **THEN** the name is shown fully without truncation artifacts
- **AND** existing spacing and alignment with the verified badge remains unchanged

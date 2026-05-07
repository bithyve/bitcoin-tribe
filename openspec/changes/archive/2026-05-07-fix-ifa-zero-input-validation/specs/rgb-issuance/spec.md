## MODIFIED Requirements

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

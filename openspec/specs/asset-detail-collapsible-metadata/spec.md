# asset-detail-collapsible-metadata Specification

## Purpose
TBD - created by archiving change improve-asset-detail-screen. Update Purpose after archive.
## Requirements
### Requirement: REQ-1: Collapsible metadata sections on UDA detail screen

The UDA detail info view MUST organize metadata into collapsible sections. Users SHALL be able to expand and collapse each section independently.

#### Scenario: SC-1: Sections render on initial render

**Given** the user opens the UDA detail info view (imageView = false)  
**When** the screen renders  
**Then** the Issuer accordion section MUST be rendered in an expanded (open) state by default  
**And** the Asset Info and Activity & Registry sections SHALL be rendered in a collapsed state  
**And** only the section header (title row with chevron icon) of collapsed sections SHALL be visible  

#### Scenario: SC-2: Tapping a section header expands it

**Given** a section is in collapsed state  
**When** the user taps the section header  
**Then** the section body MUST become visible  
**And** the chevron icon SHALL rotate to indicate the open state  

#### Scenario: SC-3: Tapping an expanded section header collapses it

**Given** a section is expanded  
**When** the user taps its header  
**Then** the section body MUST be hidden  
**And** the chevron icon SHALL rotate back to the closed position  

#### Scenario: SC-4: Multiple sections can be open simultaneously

**Given** two or more sections exist on screen  
**When** the user opens Section A and then opens Section B  
**Then** both Section A and Section B MUST be expanded  
**And** each section SHALL be independently togglable  

#### Scenario: SC-5: Issuer section shows verification status

**Given** the Issuer section is expanded  
**When** the asset has a verified issuer (twitter or domain verification)  
**Then** a prominently styled verification badge SHALL be shown inside the section  
**And** the badge MUST be visually distinct from the label/value text  

#### Scenario: SC-6 (edge): Conditional section hidden when empty

**Given** a section has no content to display (e.g., Activity & Registry section when asset is not in registry and has no issuance transaction and no transactions)  
**When** the screen renders  
**Then** that section MUST NOT be rendered  

#### Scenario: SC-7 (edge): Scroll position preserved on toggle

**Given** the user has scrolled partway down the info view  
**When** they toggle a collapsible section  
**Then** the ScrollView MUST NOT jump back to the top


# Spec: Asset Detail Collapsible Metadata

## Overview

Metadata items on the UDA detail screen are grouped into collapsible accordion sections so users can scan the screen efficiently and expand only the information they need.

---

## Scenarios

### SC-1: Sections render collapsed by default

**Given** the user opens the UDA detail info view (imageView = false)  
**When** the screen renders  
**Then** all accordion sections (Issuer, Asset Info, Registry & Actions) are rendered in a collapsed state  
**And** only the section header (title row with chevron icon) is visible  

### SC-2: Tapping a section header expands it

**Given** a section is in collapsed state  
**When** the user taps the section header  
**Then** the section body animates open and becomes visible  
**And** the chevron icon rotates to indicate the open state  

### SC-3: Tapping an expanded section header collapses it

**Given** a section is expanded  
**When** the user taps its header  
**Then** the section body animates closed  
**And** the chevron icon rotates back to the closed position  

### SC-4: Multiple sections can be open simultaneously

**Given** two or more sections exist on screen  
**When** the user opens Section A and then opens Section B  
**Then** both Section A and Section B are expanded  
**And** each section is independently togglable  

### SC-5: Issuer section shows verification status

**Given** the Issuer section is expanded  
**When** the asset has a verified issuer (twitter or domain verification)  
**Then** a prominently styled verification badge (icon + label) is shown inside the section  
**And** the badge is visually distinct from the label/value text (larger icon, accent color)  

### SC-6 (edge): Empty section hides itself

**Given** a section has no content to display (e.g., Registry section when asset is not in registry and has no issuance transaction)  
**When** the screen renders  
**Then** that section header is not rendered  

### SC-7 (edge): Scroll position preserved on toggle

**Given** the user has scrolled partway down the info view  
**When** they toggle a collapsible section  
**Then** the ScrollView does not jump back to the top  

# Spec: Asset Detail Sticky CTA

## Overview

A persistent, sticky bottom action bar that is always visible on asset detail screens, giving users immediate access to the primary Send action without scrolling.

---

## Scenarios

### SC-1: Sticky CTA visible on initial render

**Given** the user opens a UDA, Collectible, or Coin detail screen  
**When** the screen renders  
**Then** a sticky bottom bar is visible at the bottom of the viewport containing at least the Send button  
**And** the bar is offset by the device's safe-area bottom inset so it does not overlap the home indicator  

### SC-2: Send CTA is disabled when balance is zero

**Given** the user is on any asset detail screen  
**When** the asset's spendable balance is 0  
**Then** the Send button inside the sticky bar is displayed in a disabled/greyed state  
**And** tapping the button has no effect  

### SC-3: Send CTA navigates to scan screen

**Given** the sticky CTA bar is visible  
**And** the asset has a spendable balance greater than 0  
**When** the user taps Send  
**Then** the app navigates to `NavigationRoutes.SCANASSET` with the correct `assetId`, `rgbInvoice: ''`, and `wallet` params  

### SC-4: Node init in progress — Send is blocked

**Given** the app context has `isNodeInitInProgress === true`  
**When** the user taps the Send button in the sticky bar  
**Then** a toast message is displayed with the node-connecting message  
**And** navigation does not occur  

### SC-5: Sticky bar does not obscure scrollable content

**Given** the sticky CTA bar is rendered at the bottom  
**When** the user scrolls to the bottom of the screen  
**Then** scrollable content does not end hidden behind the sticky bar  
**And** the scroll area has sufficient bottom padding to clear the bar height  

### SC-6 (edge): UDA image-view mode — bar remains visible

**Given** the UDA detail screen is in image-view mode (full-screen image)  
**When** the sticky bar is rendered  
**Then** the sticky bar remains visible above the image  
**And** the Send button reflects the correct disabled/enabled state based on balance  

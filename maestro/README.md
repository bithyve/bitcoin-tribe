# Maestro E2E Automation

This directory contains end-to-end UI automation flows for the Tribe app using Maestro.

## Instructions

Use these flows to validate onboarding, wallet, RGB assets, settings, backup, and recovery journeys on development builds.

Before running tests:
- Make sure the app is built and installed on your target device/emulator.
- Use the dev app id expected by flows: `com.bithyve.tribe.dev`.
- Keep test data/environment stable (network: Regtest, deterministic app state when required).
- Run from repository root unless noted otherwise.

## Installation

### Prerequisites

- Node.js `>=20`
- Android emulator or iOS simulator (or physical device)
- Tribe app installed with dev flavor

### Install Maestro CLI

Use one of the following:

```bash
brew install maestro
```

or

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Verify installation:

```bash
maestro --version
```

## How To Use

### 1. Start your device and app

From repo root, run one of:

```bash
npm run androidDevDebug
```

or

```bash
npm run ios
```

### 2. Run a full regression flow

```bash
npm run maestro:test:regression-dev
```

### 3. Run a single flow directly

```bash
maestro test maestro/flows/backup/backup.yaml
```

### 4. Run with verbose logs (useful for debugging)

```bash
maestro test --verbose maestro/flows/regression/dev-regression.yaml
```

## Folder Structure

```text
maestro/
├── README.md
├── assets/
└── flows/
	├── onboarding/   # wallet creation bootstrap
	├── home/         # home screen and profile checks
	├── wallet/       # on-chain wallet and send flows
	├── rgb/          # asset issue/receive/send/register flows
	├── settings/     # settings and app info checks
	├── backup/       # wallet backup and recovery flows
	└── regression/   # composed end-to-end test suites
```

## Commands

### Existing npm script

```bash
npm run maestro:test:regression-dev
```

Runs:

```bash
maestro test maestro/flows/regression/dev-regression.yaml
```

### Useful direct commands

Run onboarding only:

```bash
maestro test maestro/flows/onboarding/setup.yaml
```

Run backup only:

```bash
maestro test maestro/flows/backup/backup.yaml
```

Run recover only:

```bash
maestro test maestro/flows/backup/recover.yaml
```

Run asset flows:

```bash
maestro test maestro/flows/rgb/issue-coin.yaml
maestro test maestro/flows/rgb/receive.yaml
```

## Notes

- Some flows are platform-specific (for example media selection flows under `home/` and `rgb/`).
- The regression flow passes backup words (`W1` to `W12`) into recovery via flow `env`.
- While creating or updating flows, make sure each flow starts on the Home screen and ends on the Home screen.
- If tests fail due to timing, retry with `--verbose` and inspect the exact step that failed.

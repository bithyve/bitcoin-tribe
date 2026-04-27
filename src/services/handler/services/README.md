# Handler Service Layer

This folder contains domain-focused services extracted from `apiHandler.ts`.

## Services

- `networkService.ts`
  - Bitcoin network and Electrum URL resolution.
  - GitHub release note fetching.

- `authService.ts`
  - PIN lifecycle (`createPin`, `changePin`, `verifyPin`).
  - Local app reset (`resetApp`).

- `appLifecycleService.ts`
  - FCM topic subscriptions.
  - Version history checks.
  - FCM token sync.

- `profileService.ts`
  - Wallet profile updates and picture removal.

- `backupService.ts`
  - Cloud backup/restore orchestration.
  - App image backup + restore.
  - Backup history records and backup requirement checks.

## Migration Strategy

`apiHandler.ts` remains a compatibility facade for screen-level call sites.
It delegates selected concerns to these services to keep public APIs stable while
reducing monolithic complexity and enabling gradual migration.

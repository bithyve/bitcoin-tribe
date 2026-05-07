## ADDED Requirements

### Requirement: Secondary text contrast in dark mode
All secondary/body text rendered via `theme.colors.secondaryHeadingColor` in dark mode must achieve a contrast ratio of at least 4.5:1 against the darkest card background in the app.

#### Scenario: Secondary text on EerieBlack card background
- **GIVEN** the app is in dark mode
- **WHEN** a screen renders secondary text (dates, subtitles, labels) using `theme.colors.secondaryHeadingColor`
- **THEN** the contrast ratio of that text against `Colors.EerieBlack` (26,26,26) is ≥ 4.5:1

#### Scenario: Secondary text on Black primary background
- **GIVEN** the app is in dark mode
- **WHEN** secondary text appears directly on the primary background
- **THEN** the contrast ratio against `Colors.Black` (0,0,0) is ≥ 4.5:1

#### Scenario: Secondary text fails — SonicSilver on EerieBlack (regression guard)
- **GIVEN** `secondaryHeadingColor` is set to `Colors.SonicSilver` (116,116,116) in `CombinedDarkTheme`
- **WHEN** rendered on `Colors.EerieBlack` card background
- **THEN** the contrast ratio is only 3.98:1, which is below the 4.5:1 WCAG AA threshold (this scenario must NOT occur after the fix)

---

### Requirement: Muted tab label contrast in dark mode
The inactive bottom-tab label colour must achieve ≥ 4.5:1 contrast against the primary background in dark mode.

#### Scenario: Inactive tab label readability
- **GIVEN** the app is in dark mode
- **WHEN** a bottom-tab item is inactive
- **THEN** its label colour (`theme.colors.mutedTab`) achieves ≥ 4.5:1 contrast against `Colors.Black`

---

### Requirement: Chat bubble meta-text contrast in dark mode
Sender-name, timestamp, and date-separator labels in `MessageItem` must achieve ≥ 4.5:1 contrast against both sender and receiver bubble backgrounds in dark mode.

#### Scenario: Meta-text on sender bubble
- **GIVEN** the app is in dark mode
- **WHEN** a chat message sent by the current user is displayed
- **THEN** the timestamp and sender-name text colour achieves ≥ 4.5:1 contrast against the sender bubble background (`#353B44`)

#### Scenario: Meta-text on receiver bubble
- **GIVEN** the app is in dark mode
- **WHEN** a chat message received from another user is displayed
- **THEN** the timestamp text colour achieves ≥ 4.5:1 contrast against the receiver bubble background (`#111111`)

#### Scenario: Date separator text contrast
- **GIVEN** the app is in dark mode
- **WHEN** the date separator between chat messages is rendered
- **THEN** the separator text colour achieves ≥ 4.5:1 contrast against the screen background

#### Scenario: System message text contrast
- **GIVEN** the app is in dark mode
- **WHEN** a system message (e.g. "User joined") is displayed
- **THEN** the text colour achieves ≥ 4.5:1 contrast against its background

---

### Requirement: Body colour token correctness
The `bodyColor` theme token in dark mode must be set to a value that passes WCAG AA contrast when used against any dark surface in the app.

#### Scenario: Body colour token value
- **GIVEN** `CombinedDarkTheme` is active
- **WHEN** the `bodyColor` token is read
- **THEN** its value has a luminance equivalent to at least `Colors.QuickSilver` (162,162,162), ensuring ≥ 7:1 contrast against `Colors.EerieBlack`

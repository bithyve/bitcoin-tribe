fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### upload_to_slack

```sh
[bundle exec] fastlane upload_to_slack
```

Upload the APK to Slack channel

### bump_version_code

```sh
[bundle exec] fastlane bump_version_code
```



----


## Android

### android dev

```sh
[bundle exec] fastlane android dev
```

Push a new dev build to Slack

### android github_actions_live

```sh
[bundle exec] fastlane android github_actions_live
```

Push a new live build from github actions to internal track on Play Store

### android github_actions_dev

```sh
[bundle exec] fastlane android github_actions_dev
```

Push a new dev build from github actions to internal track on Play Store

### android live

```sh
[bundle exec] fastlane android live
```

Push a new live build to Slack and internal track on Play Store

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).

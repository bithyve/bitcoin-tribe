# Bitcoin Tribe - Your Digital Assets on RGB/Lightning

[![Playstore](https://bitcoinkeeper.app/wp-content/uploads/2023/05/gpbtn.png)](https://play.google.com/store/apps/details?id=com.bithyve.tribe)
[![Appstore](https://bitcoinkeeper.app/wp-content/uploads/2023/05/applebtn.png)](https://apps.apple.com/us/app/tribe-rgb/id6667112050)
[![PGP_APK](https://github.com/bithyve/bitcoin-keeper/assets/50690016/67693cf0-a059-4391-8b48-a9d46a55e71c)](https://github.com/bithyve/tribe/releases)

Explore the future of digital assets with Bitcoin Tribe. Manage your Bitcoin and RGB assets with top-notch security and seamless backups. Bitcoin Tribe offers a cutting-edge platform for decentralized finance, featuring a Bitcoin wallet, community gifting, and Friends & Family options. Join the Tribe and take control of your digital wealth today!

## Prerequisites

Before getting started, make sure you have a proper [React Native development environment](https://reactnative.dev/docs/environment-setup) on your machine.

- **Node.js ≥18**
- **Yarn 3.x** is the preferred package manager.
- Create `.env` and `.env.production` files in the project root with the required keys **before running `yarn install`**.

## Getting Started

1. Clone this repository to your local machine:

   ```shell
   git clone https://github.com/bithyve/bitcoin-tribe.git
   ```

2. Navigate to the project directory:
   ```shell
   cd bitcoin-tribe
   ```
3. Install the project dependencies using Yarn:
   The prepare scripts will automatically install pods and nodify crypto-related packages for react-native
   ```shell
   yarn install
   ```

## Build and Run

### Varients

The project has testnet and mainnet variants. The development variant is configured to use testnet and the production variant to use mainnet.

Start metro metro

```bash
yarn start
```

#### Development

To run the development app on a connected device or emulator:

**Android**

```bash
yarn androidDevelopmentDebug
```

**iOS**

Extract the latest release of rgb_libFFI.xcframework.zip from [rgb-lib-swift/releases](https://github.com/RGB-Tools/rgb-lib-swift/releases) in `ios/rgb` folder

```bash
yarn ios --scheme=tribe-dev
```

## Verify Authenticity of Android APK

Please download an [APK](https://github.com/bithyve/bitcoin-tribe/releases) and keep all these files in the same directory: `Android APK file, SHA256SUM.asc, KEEPER_DETACHED_SIGN.sign`. Make a copy of `Android APK file` and rename it as `Android APK clone`.

Get the public PGP key for `hexa@bithyve.com` (Hexa Team's PGP key) using

```
gpg --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

or

```
gpg --keyserver hkps://keys.openpgp.org --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

**Verify APK certificate**

Rename `Android APK clone.apk` to `Android APK clone.zip` and extract the following file: `/META-INF/HEXAWALL.RSA`. Verify the certificate using `keytool`:

```
keytool -printcert -file HEXAWALLET.RSA
Certificate fingerprints:
	 ...
	 MD5:  5E:92:30:9B:88:F4:A1:17:08:D1:DB:C3:2A:BF:4D:5A
	 SHA1: 38:55:07:26:F4:C6:C4:3E:A2:87:CF:16:11:7C:E6:A5:66:E1:CB:C1
	 SHA256: 77:82:54:70:5D:C4:DA:83:2C:F8:39:96:49:69:FE:AF:63:BD:79:EF:00:0A:34:43:86:0C:7C:AD:A2:55:1C:95
	 Signature algorithm name: SHA256withRSA
	 Version: 3
```

**Verify APK checksum**

Verify the checksum against the APK using:

```
shasum -a 256 --check SHA256SUM.asc
```

Output should contain the name of the APK file followed by **OK** as shown below:

```
Tribe_v1.0.0.apk: OK
```

**Verify that the signed checksum is from hexa@bithyve.com**

```
gpg --verify SHA256SUM.asc
```

Output should show Hexa's PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

```
using RSA key 389F4CADA0785AC0E28A0C181BEBDE261DC3CF62
issuer "hexa@bithyve.com"
Good signature from "Hexa Team (Hexa Bitcoin Wallet) <hexa@bithyve.com>"
```

**Alternate method for verifying PGP signature**

Verify the detached signature against the APK file:

```
gpg --verify TRIBE_DETACHED_SIGN.sign Tribe_v1.0.0.apk
```

Output should show PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

```
using RSA key 389F4CADA0785AC0E28A0C181BEBDE261DC3CF62
issuer "hexa@bithyve.com"
Good signature from "Hexa Team (Hexa Bitcoin Wallet) <hexa@bithyve.com>"
```

## License

This project is licensed under the **MIT License.**

## Community

- Follow us on [Twitter](https://twitter.com/BitcoinTribe_)
- Join our [Telegram](https://t.me/BitcoinTribeSupport)

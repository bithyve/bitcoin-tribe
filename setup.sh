# ios dependency installation
cd ios && RCT_NEW_ARCH_ENABLED=0 pod install

# android SDK location configuration
cd ../android && touch local.properties && echo "sdk.dir = /Users/$(whoami)/Library/Android/sdk" >local.properties

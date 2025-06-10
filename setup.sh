#!/bin/bash

# enabling node core modules
# adding node core modules support in react-native
rn-nodeify --install buffer,events,process,stream,inherits,path,assert,crypto,constants --hack --yarn

# ios dependency installation
cd ios && RCT_NEW_ARCH_ENABLED=0 pod install

# android SDK location configuration
cd ../android

# Determine Android SDK path. Prefer an argument, then ANDROID_HOME, then the
# default macOS location.
if [ -n "$1" ]; then
  SDK_PATH="$1"
elif [ -n "$ANDROID_HOME" ]; then
  SDK_PATH="$ANDROID_HOME"
else
  SDK_PATH="/Users/$(whoami)/Library/Android/sdk"
fi

touch local.properties
echo "sdk.dir = $SDK_PATH" > local.properties

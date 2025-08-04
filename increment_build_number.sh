#!/bin/bash

# Script to increment build number by 1 in all Android and iOS files
# This script updates versionCode in Android build.gradle and CFBundleVersion in iOS Info.plist files

set -e  # Exit on any error

echo "Incrementing build numbers..."

# Function to increment version code in Android build.gradle
increment_android_version() {
    local file="$1"
    echo "Updating Android version in: $file"
    
    # Find current versionCode and increment it
    current_version=$(grep -o 'versionCode [0-9]*' "$file" | awk '{print $2}')
    if [ -n "$current_version" ]; then
        new_version=$((current_version + 1))
        echo "   Current versionCode: $current_version -> New versionCode: $new_version"
        
        # Replace versionCode with new value
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/versionCode $current_version/versionCode $new_version/" "$file"
        else
            # Linux
            sed -i "s/versionCode $current_version/versionCode $new_version/" "$file"
        fi
    else
        echo "   WARNING: No versionCode found in $file"
    fi
}

# Function to increment CFBundleVersion in iOS Info.plist files
increment_ios_version() {
    local file="$1"
    echo "Updating iOS version in: $file"
    
    # Find current CFBundleVersion and increment it
    current_version=$(grep -A1 '<key>CFBundleVersion</key>' "$file" | grep '<string>' | sed 's/.*<string>\([0-9]*\)<\/string>.*/\1/')
    if [ -n "$current_version" ]; then
        new_version=$((current_version + 1))
        echo "   Current CFBundleVersion: $current_version -> New CFBundleVersion: $new_version"
        
        # Replace CFBundleVersion with new value
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/<string>$current_version<\/string>/<string>$new_version<\/string>/" "$file"
        else
            # Linux
            sed -i "s/<string>$current_version<\/string>/<string>$new_version<\/string>/" "$file"
        fi
    else
        echo "   WARNING: No CFBundleVersion found in $file"
    fi
}

# Function to increment CURRENT_PROJECT_VERSION in iOS project.pbxproj
increment_ios_project_version() {
    local file="$1"
    echo "Updating iOS project version in: $file"
    
    # Find all CURRENT_PROJECT_VERSION entries and increment them
    current_versions=$(grep -o 'CURRENT_PROJECT_VERSION = [0-9]*;' "$file" | awk '{print $3}' | sed 's/;//' | sort -u)
    
    if [ -n "$current_versions" ]; then
        for current_version in $current_versions; do
            new_version=$((current_version + 1))
            echo "   Current CURRENT_PROJECT_VERSION: $current_version -> New CURRENT_PROJECT_VERSION: $new_version"
            
            # Replace CURRENT_PROJECT_VERSION with new value
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/CURRENT_PROJECT_VERSION = $current_version;/CURRENT_PROJECT_VERSION = $new_version;/g" "$file"
            else
                # Linux
                sed -i "s/CURRENT_PROJECT_VERSION = $current_version;/CURRENT_PROJECT_VERSION = $new_version;/g" "$file"
            fi
        done
    else
        echo "   WARNING: No CURRENT_PROJECT_VERSION found in $file"
    fi
}

# Update Android build.gradle
if [ -f "android/app/build.gradle" ]; then
    increment_android_version "android/app/build.gradle"
else
    echo "ERROR: Android build.gradle not found at android/app/build.gradle"
fi

# Update iOS Info.plist files
ios_files=(
    "ios/tribe/Info.plist"
    "ios/tribe-dev-Info.plist"
)

for file in "${ios_files[@]}"; do
    if [ -f "$file" ]; then
        increment_ios_version "$file"
    else
        echo "ERROR: iOS Info.plist not found at $file"
    fi
done

# Update iOS project.pbxproj
if [ -f "ios/tribe.xcodeproj/project.pbxproj" ]; then
    increment_ios_project_version "ios/tribe.xcodeproj/project.pbxproj"
else
    echo "ERROR: iOS project.pbxproj not found at ios/tribe.xcodeproj/project.pbxproj"
fi

echo ""
echo "Build number increment completed!"
echo ""
echo "Summary of changes:"
echo "   Android: versionCode incremented in android/app/build.gradle"
echo "   iOS: CFBundleVersion incremented in:"
for file in "${ios_files[@]}" "ios/tribe.xcodeproj/project.pbxproj"; do
    if [ -f "$file" ]; then
        echo "     - $file"
    fi
done
echo ""
echo "Adding updated files to git..."

# Add all modified files to git
modified_files=(
    "android/app/build.gradle"
    "ios/tribe/Info.plist"
    "ios/tribe-dev-Info.plist"
    "ios/tribe.xcodeproj/project.pbxproj"
)

for file in "${modified_files[@]}"; do
    if [ -f "$file" ]; then
        if git add "$file" 2>/dev/null; then
            echo "   SUCCESS: Added $file to git"
        else
            echo "   WARNING: Failed to add $file to git (file may not be tracked)"
        fi
    fi
done

echo ""
echo "Ready for build! Files have been added to git staging area."

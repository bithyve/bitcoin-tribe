pluginManagement {
    includeBuild("../node_modules/@react-native/gradle-plugin")
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

plugins {
    id("com.facebook.react.settings")
}

extensions.configure<com.facebook.react.ReactSettingsExtension>("reactSettings") {
    autolinkLibrariesFromCommand()
}

dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "tribe"
include(":app")
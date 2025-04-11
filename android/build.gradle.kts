buildscript {
    val buildToolsVersion by extra("35.0.0")
    val minSdkVersion by extra(24)
    val compileSdkVersion by extra(35)
    val targetSdkVersion by extra(35)
    val ndkVersion by extra("27.1.12297006")
    val kotlinVersion by extra("2.0.21")
    val reactNativeGradlePluginVersion by extra("0.79.0")

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:8.2.2")
        // classpath("com.facebook.react:react-native-gradle-plugin:$reactNativeGradlePluginVersion")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
        classpath("com.google.gms:google-services:4.3.14")
    }
}

// apply(plugin = "com.facebook.react.rootproject")
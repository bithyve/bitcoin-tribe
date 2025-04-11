plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
    id("com.google.gms.google-services")
}

apply(from = File(project(":react-native-config").projectDir, "dotenv.gradle"))
apply(
    from = File(
        listOf("node", "--print", "require.resolve('@sentry/react-native/package.json')").run {
            ProcessBuilder(this).start().inputStream.bufferedReader().readText().trim()
        },
        "../sentry.gradle"
    )
)

val enableProguardInReleaseBuilds = false
val jscFlavor = "io.github.react-native-community:jsc-android:2026004.+"

react {
    autolinkLibrariesWithApp()
}

android {
    namespace = "com.bithyve.tribe"
    compileSdk = rootProject.extra["compileSdkVersion"] as Int
    ndkVersion = rootProject.extra["ndkVersion"] as String
    buildToolsVersion = rootProject.extra["buildToolsVersion"] as String

    defaultConfig {
        applicationId = "com.bithyve.tribe"
        minSdk = rootProject.extra["minSdkVersion"] as Int
        targetSdk = rootProject.extra["targetSdkVersion"] as Int
        versionCode = 111
        versionName = "0.3.1"
        missingDimensionStrategy("react-native-camera", "general")
        manifestPlaceholders["appAuthRedirectScheme"] = "tribe"
    }

    signingConfigs {
    getByName("debug") {
        storeFile = file("debug.keystore")
        storePassword = "android"
        keyAlias = "androiddebugkey"
        keyPassword = "android"
    }
    create("release") {
        if (project.hasProperty("MYAPP_RELEASE_STORE_FILE")) {
            storeFile = file(project.property("MYAPP_RELEASE_STORE_FILE") as String)
            storePassword = project.property("MYAPP_RELEASE_STORE_PASSWORD") as String
            keyAlias = project.property("MYAPP_RELEASE_KEY_ALIAS") as String
            keyPassword = project.property("MYAPP_RELEASE_KEY_PASSWORD") as String
        }
    }
}

    buildTypes {
        getByName("debug") {
            signingConfig = signingConfigs.getByName("debug")
        }
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = enableProguardInReleaseBuilds
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
        }
    }

    flavorDimensions += "default"
    productFlavors {
        create("production") {
            applicationId = "com.bithyve.tribe"
            resValue("string", "build_config_package", "com.bithyve.tribe")
        }
        create("dev") {
            applicationId = "com.bithyve.tribe.dev"
            resValue("string", "build_config_package", "com.bithyve.tribe.dev")
        }
    }
}

afterEvaluate {
    tasks.register("installDebug") {
        dependsOn("installDevDebug")
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    implementation("org.rgbtools:rgb-lib-android:0.3.0-alpha.9.1")
    implementation("com.google.code.gson:gson:2.9.0")
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    implementation("com.google.android.gms:play-services-drive:17.0.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("com.facebook.fresco:fresco:3.1.3")
    implementation("com.facebook.fresco:animated-gif:3.1.3")
    implementation("com.google.mlkit:barcode-scanning:17.0.2")

    implementation("com.google.api-client:google-api-client-android:2.2.0") {
        exclude(group = "org.apache.httpcomponents")
        exclude(module = "guava-jdk5")
    }

    implementation("com.google.apis:google-api-services-drive:v3-rev20230822-2.0.0") {
        exclude(group = "org.apache.httpcomponents")
        exclude(module = "guava-jdk5")
    }

    if ((project.findProperty("hermesEnabled")?.toString().toBoolean() == true)) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation(jscFlavor)
    }
}
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "dev.ezan.notiflogger"
    compileSdk = 35
    defaultConfig {
        applicationId = "dev.ezan.notiflogger"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
        testInstrumentationRunner = "dev.ezan.notiflogger.LoggerSmokeInstrumentation"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    lint {
        warningsAsErrors = true
        // Lab APK, not a Play release. Keep the API 35 measurement baseline fixed;
        // SDK packages preinstalled on a runner must not change the lint result.
        disable += "OldTargetApi"
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}

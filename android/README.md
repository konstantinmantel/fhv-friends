# FHV Friends Android wrapper

Native Android WebView wrapper for https://konstantinmantel.github.io/fhv-friends/.

The app has a launcher icon, no address bar, Android back navigation, a system
photo picker and an offline retry screen. Website updates appear automatically.
No third-party wrapper service, subscription, trackers or advertising SDKs.

The GitHub workflow **Android URL wrapper** builds a signed **test/debug APK**.
Download `FHV-Friends-Android` from the successful run's Artifacts section and
extract `app-debug.apk`. This is for direct testing, not a Google Play release.
A CI-generated debug key can change between builds; installing a new test build
may require uninstalling an earlier one, which clears its local demo data.

For local builds: JDK 17, Android SDK 35, Build Tools 35.0.0 and Gradle 8.11.1.
Run `gradle -p android assembleDebug`. No Gradle binary is checked into Git.

Only the exact HTTPS app origin/path is navigated within the WebView. External
links open in the system browser after a user gesture. No JavaScript/native
bridge is exposed; mixed content and local file access are disabled. Photos
must be explicitly selected with Android's system picker. The calendar file
export currently requires opening the web app in a regular browser.

For iPhone/iPad use Safari → Share → Add to Home Screen. The existing PWA opens
without the Safari address bar; no paid Apple developer account is needed for
that installation method.

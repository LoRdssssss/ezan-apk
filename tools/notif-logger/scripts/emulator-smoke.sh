#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
package=dev.ezan.notiflogger
mkdir -p evidence
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell cmd notification allow_listener "$package/.NotificationLoggerService"
if (( $(adb shell getprop ro.build.version.sdk | tr -d '\r') >= 33 )); then
  adb shell pm grant "$package" android.permission.POST_NOTIFICATIONS
fi
adb shell am instrument -w "$package.test/$package.LoggerSmokeInstrumentation" | tee evidence/instrumentation.txt
# am instrument can return exit code 0 even when the test itself fails.
grep -F 'OK (notification smoke test)' evidence/instrumentation.txt
for name in notification.csv notification.png result.txt; do
  adb exec-out run-as "$package" cat "files/evidence/$name" > "evidence/$name"
done
cat evidence/result.txt

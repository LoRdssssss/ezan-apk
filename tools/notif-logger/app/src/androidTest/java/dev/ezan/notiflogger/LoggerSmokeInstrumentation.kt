package dev.ezan.notiflogger

import android.app.Activity
import android.app.Instrumentation
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Bundle
import android.os.SystemClock
import java.io.File
import java.util.concurrent.TimeUnit

/** Platform instrumentation: exercises the real listener and CSV, without a test SDK in the APK. */
class LoggerSmokeInstrumentation : Instrumentation() {
    override fun onCreate(arguments: Bundle?) { super.onCreate(arguments); start() }

    override fun onStart() {
        val result = Bundle()
        val app = targetContext.applicationContext as LoggerApp
        try {
            @Suppress("DEPRECATION")
            val permissions = targetContext.packageManager.getPackageInfo(targetContext.packageName, PackageManager.GET_PERMISSIONS).requestedPermissions.orEmpty()
            check("android.permission.INTERNET" !in permissions)
            check("android.permission.ACCESS_NETWORK_STATE" !in permissions)
            app.io.submit { app.store.clear() }.get(5, TimeUnit.SECONDS)
            app.recording = true
            val activity = startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) as MainActivity
            await("notification listener connected") { app.listenerConnected }
            var title = ""
            val before = System.currentTimeMillis()
            runOnMainSync { title = activity.postTestNotification() }
            await("test notification in CSV") {
                app.message.contains(title)
            }
            val after = System.currentTimeMillis()
            val manager = targetContext.getSystemService(NotificationManager::class.java)
            val posted = manager.activeNotifications.single { it.id == 2 }
            val file = File(app.filesDir, "notifications.csv")
            val csv = file.readText()
            val row = csv.lineSequence().single { it.contains(title) }
            // The synthetic test title contains no quotes, commas or newlines.
            val cells = row.trim().removeSurrounding("\"").split("\",\"")
            check(cells.size == Csv.header.size)
            check(cells[0] == "notification")
            check(cells[1] == targetContext.packageName)
            check(cells[3].toLong() == posted.postTime) { "CSV postTime differs from system notification" }
            val deviceTime = cells[4].toLong()
            check(deviceTime in before..after) { "Callback timestamp outside send/observe window" }
            check(deviceTime >= posted.postTime && deviceTime - posted.postTime < 5000)
            check(cells[5] == formatTime(deviceTime, cells[7]))
            check(cells[8] == MainActivity.TEST_CHANNEL)
            val channel = manager.getNotificationChannel(MainActivity.TEST_CHANNEL)
            check(cells[10] == channel.sound?.toString().orEmpty())
            check(cells[11] == channel.shouldVibrate().toString())
            check(cells[13] == channel.importance.toString())
            val evidence = File(app.filesDir, "evidence").apply { mkdirs() }
            File(evidence, "notification.csv").writeText(csv)
            val timing = "CONFIRMED emulator: postTime=${posted.postTime}, deviceTime=$deviceTime, deltaMs=${deviceTime - posted.postTime}, before=$before, after=$after"
            File(evidence, "result.txt").writeText(timing + "\n")
            // Bring the result into view before capturing the actual emulator screen.
            runOnMainSync {
                val scroll = activity.findViewById<android.view.ViewGroup>(android.R.id.content).getChildAt(0) as android.widget.ScrollView
                scroll.fullScroll(android.view.View.FOCUS_DOWN)
            }
            SystemClock.sleep(1000)
            val screenshot = checkNotNull(uiAutomation.takeScreenshot())
            File(evidence, "notification.png").outputStream().use {
                check(screenshot.compress(Bitmap.CompressFormat.PNG, 100, it))
            }
            screenshot.recycle()
            result.putString("stream", "\nOK (notification smoke test)\n$timing\n")
            app.recording = false
            finish(Activity.RESULT_OK, result)
        } catch (error: Throwable) {
            result.putString("stream", "\nFAILURES!!!\n${error.stackTraceToString()}\n")
            app.recording = false
            finish(Activity.RESULT_CANCELED, result)
        } finally { app.recording = false }
    }

    private fun await(label: String, predicate: () -> Boolean) {
        val deadline = SystemClock.elapsedRealtime() + 15000
        while (!predicate()) {
            check(SystemClock.elapsedRealtime() < deadline) { "Timed out: $label" }
            SystemClock.sleep(100)
        }
    }
}

package dev.ezan.notiflogger

import android.app.Notification
import android.os.SystemClock
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import java.time.ZoneId

class NotificationLoggerService : NotificationListenerService() {
    private val app get() = application as LoggerApp

    override fun onListenerConnected() { app.listenerConnected = true }
    override fun onListenerDisconnected() { app.listenerConnected = false }
    override fun onDestroy() { app.listenerConnected = false; super.onDestroy() }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (!app.recording) return
        val now = System.currentTimeMillis()
        val elapsed = SystemClock.elapsedRealtime()
        val notification = sbn.notification
        val channel = try {
            getNotificationChannels(sbn.packageName, sbn.user)
                .firstOrNull { it.id == notification.channelId }
        } catch (_: RuntimeException) { null }
        app.append(LogEntry(
            event = "notification",
            packageName = sbn.packageName,
            title = notification.extras?.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty(),
            postTimeMs = sbn.postTime,
            deviceTimeMs = now,
            elapsedRealtimeMs = elapsed,
            zoneId = ZoneId.systemDefault().id,
            channelId = notification.channelId.orEmpty(),
            notificationKey = sbn.key,
            soundUri = if (channel == null) "unknown" else channel.sound?.toString().orEmpty(),
            vibrationEnabled = channel?.shouldVibrate()?.toString() ?: "unknown",
            vibrationPatternMs = channel?.vibrationPattern?.joinToString(";").orEmpty(),
            channelImportance = channel?.importance?.toString() ?: "unknown",
        ))
    }
}

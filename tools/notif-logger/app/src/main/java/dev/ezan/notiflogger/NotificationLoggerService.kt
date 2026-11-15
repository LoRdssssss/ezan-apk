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

    override fun onNotificationPosted(sbn: StatusBarNotification, rankingMap: RankingMap) {
        if (!app.recording) return
        val now = System.currentTimeMillis()
        val elapsed = SystemClock.elapsedRealtime()
        val notification = sbn.notification
        // Ranking carries the delivered notification's channel for ordinary listeners.
        // getNotificationChannels(pkg, user) additionally requires companion-device access.
        val ranking = Ranking()
        val channel = if (rankingMap.getRanking(sbn.key, ranking)) ranking.channel else null
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

package dev.ezan.notiflogger

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/** Wall clock and monotonic clock are captured at the callback, before disk I/O. */
data class LogEntry(
    val event: String,
    val packageName: String = "",
    val title: String = "",
    val postTimeMs: Long? = null,
    val deviceTimeMs: Long,
    val elapsedRealtimeMs: Long,
    val zoneId: String,
    val channelId: String = "",
    val notificationKey: String = "",
    val soundUri: String = "",
    val vibrationEnabled: String = "unknown",
    val vibrationPatternMs: String = "",
    val channelImportance: String = "",
    val peakDbfs: Double? = null,
    val thresholdDbfs: Double? = null,
) {
    fun cells(): List<String> = listOf(
        event, Csv.text(packageName), Csv.text(title), postTimeMs?.toString().orEmpty(),
        deviceTimeMs.toString(), formatTime(deviceTimeMs, zoneId), elapsedRealtimeMs.toString(),
        zoneId, Csv.text(channelId), Csv.text(notificationKey), Csv.text(soundUri),
        vibrationEnabled, vibrationPatternMs, channelImportance,
        peakDbfs?.toString().orEmpty(), thresholdDbfs?.toString().orEmpty(),
    )
}

fun formatTime(epochMs: Long, zoneId: String): String =
    DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(Instant.ofEpochMilli(epochMs).atZone(ZoneId.of(zoneId)))

object Csv {
    val header = listOf(
        "event", "package_name", "title", "post_time_ms", "device_time_ms", "device_time_iso",
        "elapsed_realtime_ms", "zone_id", "channel_id", "notification_key", "sound_uri",
        "vibration_enabled", "vibration_pattern_ms", "channel_importance", "peak_dbfs", "threshold_dbfs",
    )

    // CSV quoting alone does not prevent spreadsheet formulas in notification text.
    fun text(value: String): String = if (
        value.trimStart().firstOrNull() in listOf('=', '+', '-', '@') ||
        value.firstOrNull() in listOf('\t', '\r', '\n')
    ) "'$value" else value

    fun row(cells: List<String>): String =
        cells.joinToString(",") { "\"${it.replace("\"", "\"\"")}\"" } + "\r\n"
}

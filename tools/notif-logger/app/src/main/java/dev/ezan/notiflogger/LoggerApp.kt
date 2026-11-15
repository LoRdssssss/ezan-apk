package dev.ezan.notiflogger

import android.app.Application
import java.io.File
import java.util.concurrent.Executors

class LoggerApp : Application() {
    val io = Executors.newSingleThreadExecutor()
    val store by lazy { CsvStore(File(filesDir, "notifications.csv")) }
    private val preferences by lazy { getSharedPreferences("logger", MODE_PRIVATE) }
    var recording: Boolean
        get() = preferences.getBoolean("recording", false)
        set(value) { preferences.edit().putBoolean("recording", value).apply() }
    @Volatile var listenerConnected = false
    @Volatile var message = "Henüz kayıt yok."

    fun append(entry: LogEntry) {
        io.execute {
            try {
                store.append(entry)
                message = "${entry.event}: ${entry.title}\npostTime=${entry.postTimeMs ?: "—"}\n" +
                    "cihaz=${entry.deviceTimeMs}\n${formatTime(entry.deviceTimeMs, entry.zoneId)}"
            } catch (error: Exception) {
                message = "CSV yazılamadı: ${error.javaClass.simpleName}"
            }
        }
    }
}

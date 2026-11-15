package dev.ezan.notiflogger

import java.io.File
import java.io.OutputStream

class CsvStore(private val file: File) {
    @Synchronized
    fun append(entry: LogEntry) {
        initialize()
        file.appendText(Csv.row(entry.cells()), Charsets.UTF_8)
    }

    @Synchronized
    fun exportTo(output: OutputStream) {
        initialize()
        file.inputStream().use { it.copyTo(output) }
    }

    @Synchronized
    fun clear() {
        file.writeText(Csv.row(Csv.header), Charsets.UTF_8)
    }

    private fun initialize() {
        file.parentFile?.mkdirs()
        if (!file.exists() || file.length() == 0L) clear()
    }
}

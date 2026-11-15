package dev.ezan.notiflogger

import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class CsvStoreTest {
    @get:Rule val temporary = TemporaryFolder()
    private fun entry(title: String = "Test") = LogEntry(
        event = "notification", packageName = "dev.ezan.notiflogger", title = title,
        postTimeMs = 1793534400123, deviceTimeMs = 1793534400456,
        elapsedRealtimeMs = 123456, zoneId = "Europe/Istanbul",
    )

    @Test fun quotesCommasNewlinesAndUnicode() {
        assertEquals("\"a,b\",\"başlık \"\"x\"\"\r\ny\",\"\"\r\n", Csv.row(listOf("a,b", "başlık \"x\"\r\ny", "")))
    }

    @Test fun neutralizesSpreadsheetFormulasWithoutChangingNumericTimestamps() {
        for (text in listOf("=1+1", "+cmd", "-cmd", "@SUM(A1)", "  =1", "\t1", "\n1")) {
            assertEquals("'$text", Csv.text(text))
        }
        assertEquals("Test", Csv.text("Test"))
        assertEquals("1793534400123", entry().cells()[3])
    }

    @Test fun preservesMillisAndTimeZoneIndependentlyOfDefaultLocale() {
        assertEquals("1970-01-01T02:00:00.123+02:00", formatTime(123, "Europe/Istanbul"))
        assertEquals("1970-01-01T00:00:00.123Z", formatTime(123, "UTC"))
        assertEquals("2024-03-31T01:59:59.999+01:00", formatTime(1711846799999, "Europe/Berlin"))
        assertEquals("2024-03-31T03:00:00+02:00", formatTime(1711846800000, "Europe/Berlin"))
        assertEquals(Csv.header.size, entry().cells().size)
        assertEquals("1793534400456", entry().cells()[4])
    }

    @Test fun appendsOneHeaderAcrossReopenAndExportsExactUtf8() {
        val file = File(temporary.root, "sub/notifications.csv")
        CsvStore(file).append(entry("ilk"))
        CsvStore(file).append(entry("ikinci"))
        val output = ByteArrayOutputStream()
        CsvStore(file).exportTo(output)
        assertEquals(Csv.row(Csv.header) + Csv.row(entry("ilk").cells()) + Csv.row(entry("ikinci").cells()), output.toString("UTF-8"))
        CsvStore(file).clear()
        assertEquals(Csv.row(Csv.header), file.readText())
    }

    @Test fun emptyExportHasHeaderAndConcurrentProducersDoNotInterleave() {
        val store = CsvStore(File(temporary.root, "notifications.csv"))
        val empty = ByteArrayOutputStream()
        store.exportTo(empty)
        assertEquals(Csv.row(Csv.header), empty.toString("UTF-8"))
        val workers = Executors.newFixedThreadPool(4)
        repeat(100) { i -> workers.execute { store.append(entry("row$i")) } }
        workers.shutdown()
        assertTrue(workers.awaitTermination(10, TimeUnit.SECONDS))
        val output = ByteArrayOutputStream()
        store.exportTo(output)
        val csv = output.toString("UTF-8")
        assertEquals(101, csv.split("\r\n").filter { it.isNotEmpty() }.size)
        repeat(100) { i -> assertTrue(csv.contains(Csv.row(entry("row$i").cells()))) }
    }

    @Test fun diskFailureIsReportedToCaller() {
        val file = temporary.newFolder("directory-not-file")
        assertThrows(java.io.IOException::class.java) { CsvStore(file).append(entry()) }
    }
}

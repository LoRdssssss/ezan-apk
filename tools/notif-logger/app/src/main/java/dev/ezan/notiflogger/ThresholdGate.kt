package dev.ezan.notiflogger

import kotlin.math.abs
import kotlin.math.log10

class ThresholdGate(private val threshold: Double, private val cooldownMs: Long = 1000) {
    private var above = false
    private var lastEvent: Long? = null

    fun accept(dbfs: Double, elapsedMs: Long): Boolean {
        val crossed = dbfs >= threshold && !above
        above = dbfs >= threshold
        if (!crossed || lastEvent?.let { elapsedMs - it < cooldownMs } == true) return false
        lastEvent = elapsedMs
        return true
    }

    companion object {
        fun peakDbfs(samples: ShortArray, count: Int): Double {
            val peak = (0 until count).maxOfOrNull { abs(samples[it].toInt()) } ?: 0
            return if (peak == 0) -96.0 else 20 * log10(peak / 32768.0)
        }
    }
}

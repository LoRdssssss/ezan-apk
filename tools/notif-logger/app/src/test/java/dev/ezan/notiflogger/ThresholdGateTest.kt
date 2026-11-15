package dev.ezan.notiflogger

import org.junit.Assert.*
import org.junit.Test

class ThresholdGateTest {
    @Test fun countsOnlyRisingEdgesAndUsesMonotonicCooldown() {
        val gate = ThresholdGate(-20.0)
        assertFalse(gate.accept(-40.0, 0))
        assertTrue(gate.accept(-20.0, 10))
        assertFalse(gate.accept(-10.0, 1100))
        assertFalse(gate.accept(-40.0, 1200))
        assertTrue(gate.accept(-10.0, 1300))
        assertFalse(gate.accept(-40.0, 1400))
        assertFalse(gate.accept(-10.0, 1500))
        assertFalse(gate.accept(-40.0, 2500))
        assertTrue(gate.accept(-10.0, 2600))
    }

    @Test fun computesPcmPeakIncludingShortMinAndSilence() {
        assertEquals(-96.0, ThresholdGate.peakDbfs(shortArrayOf(0, 0), 2), 0.001)
        assertEquals(0.0, ThresholdGate.peakDbfs(shortArrayOf(Short.MIN_VALUE), 1), 0.001)
        assertEquals(-6.0206, ThresholdGate.peakDbfs(shortArrayOf(16384, Short.MAX_VALUE), 1), 0.001)
    }
}

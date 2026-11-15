package dev.ezan.notiflogger

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.SystemClock
import java.time.ZoneId
import java.util.concurrent.atomic.AtomicReference

/** Only runs while the activity is visible. PCM exists in RAM only. */
class AudioMonitor(private val app: LoggerApp) {
    private val active = AtomicReference<AudioRecord?>()
    val running get() = active.get() != null

    fun start(threshold: Double) {
        if (running) return
        if (app.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            throw SecurityException("Mikrofon izni verilmedi")
        }
        val size = AudioRecord.getMinBufferSize(16000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
        check(size > 0) { "Mikrofon biçimi desteklenmiyor" }
        val recorder = AudioRecord(
            MediaRecorder.AudioSource.MIC, 16000, AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT, maxOf(size, 4096),
        )
        try {
            check(recorder.state == AudioRecord.STATE_INITIALIZED) { "Mikrofon açılamadı" }
            recorder.startRecording()
            check(recorder.recordingState == AudioRecord.RECORDSTATE_RECORDING) { "Mikrofon başlamadı" }
        } catch (error: Exception) {
            recorder.release()
            throw error
        }
        active.set(recorder)
        Thread({
            val samples = ShortArray(1024)
            val gate = ThresholdGate(threshold)
            try {
                while (active.get() === recorder) {
                    val count = recorder.read(samples, 0, samples.size)
                    if (active.get() !== recorder) break
                    check(count > 0) { "Mikrofon okuma hatası: $count" }
                    val now = System.currentTimeMillis()
                    val elapsed = SystemClock.elapsedRealtime()
                    val peak = ThresholdGate.peakDbfs(samples, count)
                    if (gate.accept(peak, elapsed)) app.append(LogEntry(
                        event = "audio_threshold", deviceTimeMs = now, elapsedRealtimeMs = elapsed,
                        zoneId = ZoneId.systemDefault().id, peakDbfs = peak, thresholdDbfs = threshold,
                    ))
                }
            } catch (error: Exception) {
                if (active.get() === recorder) app.message = "Mikrofon durdu: ${error.message}"
            } finally {
                active.compareAndSet(recorder, null)
                recorder.release()
            }
        }, "audio-threshold").start()
    }

    fun stop() {
        active.getAndSet(null)?.let {
            try { it.stop() } catch (_: IllegalStateException) { /* Reader releases the recorder. */ }
        }
    }
}

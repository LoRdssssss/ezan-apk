package dev.ezan.notiflogger

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import java.time.Instant

class MainActivity : Activity() {
    private val app get() = application as LoggerApp
    private lateinit var audio: AudioMonitor
    private lateinit var status: TextView
    private lateinit var recordingButton: Button
    private lateinit var audioButton: Button
    private lateinit var threshold: EditText
    private val handler = Handler(Looper.getMainLooper())
    private val refresh = object : Runnable {
        override fun run() {
            status.text = getString(
                R.string.status_format,
                getString(if (app.listenerConnected) R.string.connected else R.string.disconnected),
                getString(if (app.recording) R.string.enabled else R.string.disabled),
                getString(if (audio.running) R.string.enabled else R.string.disabled),
                app.message,
            )
            recordingButton.text = if (app.recording) "Bildirim kaydını durdur" else "Bildirim kaydını başlat"
            if (audio.running) window.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            else window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            audioButton.text = if (audio.running) "Ses ölçümünü durdur" else "Ses ölçümünü başlat"
            handler.postDelayed(this, 500)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        audio = AudioMonitor(app)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val padding = (16 * resources.displayMetrics.density).toInt()
            setPadding(padding, padding, padding, padding)
        }
        val scroll = ScrollView(this).apply { addView(layout) }
        setContentView(scroll)
        scroll.setOnApplyWindowInsetsListener { view, insets ->
            @Suppress("DEPRECATION")
            view.setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop,
                insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
            insets
        }
        fun text(value: String) = TextView(this).also {
            it.text = value
            it.textSize = 16f
            layout.addView(it)
        }
        fun button(label: String, action: () -> Unit) = Button(this).also {
            it.text = label
            it.setOnClickListener { action() }
            layout.addView(it, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        text("Bildirim Kaydedici").textSize = 24f
        text("Yalnızca kendi test cihazınızda kullanın. Bildirim başlıkları özel veri içerebilir. " +
            "CSV uygulama içinde saklanır; otomatik aktarım ve yedekleme yoktur. " +
            "Dışa aktarımda cihazdaki yerel bir klasörü seçin.")
        button("Bildirim erişimini aç") { startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
        recordingButton = button("Bildirim kaydını başlat") { app.recording = !app.recording }
        button("Test bildirimi gönder") { requestTestNotification() }
        button("CSV dışa aktar") {
            startActivityForResult(Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "text/csv"
                putExtra(Intent.EXTRA_TITLE, "notif-logger-${Instant.now().toEpochMilli()}.csv")
            }, EXPORT)
        }
        text("Ses modu ikinci telefonda, bu ekran açıkken çalışır. Ham ses saklanmaz. " +
            "Eşik geçişi sesi algılar; ezan tanıma veya kalibre edilmiş desibel ölçümü değildir.")
        threshold = EditText(this).apply {
            hint = "Eşik (dBFS, -90 ile 0)"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or
                android.text.InputType.TYPE_NUMBER_FLAG_SIGNED or android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
            setText(R.string.threshold_default)
            layout.addView(this)
        }
        audioButton = button("Ses ölçümünü başlat") {
            if (audio.running) audio.stop()
            else if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), MICROPHONE)
            } else startAudio()
        }
        status = text("").apply { setTextIsSelectable(true) }
        button("Kayıtları sil") {
            AlertDialog.Builder(this).setMessage("Tüm yerel CSV kayıtları silinsin mi?")
                .setNegativeButton("Vazgeç", null)
                .setPositiveButton("Sil") { _, _ ->
                    app.io.execute {
                        try { app.store.clear(); app.message = "Kayıtlar silindi." }
                        catch (error: Exception) { app.message = "Silinemedi: ${error.javaClass.simpleName}" }
                    }
                }.show()
        }
    }

    override fun onResume() { super.onResume(); handler.post(refresh) }
    override fun onPause() { handler.removeCallbacks(refresh); super.onPause() }
    override fun onStop() {
        audio.stop()
        window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        super.onStop()
    }

    private fun startAudio() {
        val value = threshold.text.toString().toDoubleOrNull()
        if (value == null || !value.isFinite() || value !in -90.0..0.0) {
            toast("-90 ile 0 arasında bir eşik girin.")
            return
        }
        try { audio.start(value) }
        catch (error: Exception) { toast("Mikrofon başlatılamadı: ${error.message}") }
    }

    private fun requestTestNotification() {
        if (!app.recording || !app.listenerConnected) {
            toast("Önce bildirim erişimini ve bildirim kaydını açın.")
            return
        }
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), NOTIFICATIONS)
        } else postTestNotification()
    }

    fun postTestNotification(): String {
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            throw SecurityException("Bildirim izni verilmedi")
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(TEST_CHANNEL, "Kaydedici testi", NotificationManager.IMPORTANCE_DEFAULT))
        val title = "G-002 test ${System.currentTimeMillis()}"
        manager.notify(2, Notification.Builder(this, TEST_CHANNEL)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText("Yalnızca kendi test bildirimi; postTime CSV ile karşılaştırılır.")
            .setAutoCancel(true).build())
        return title
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (grantResults.firstOrNull() != PackageManager.PERMISSION_GRANTED) {
            toast("İzin verilmedi; ilgili ölçüm başlatılmadı.")
            return
        }
        // Microphone always requires another explicit tap, even after permission is granted.
        if (requestCode == NOTIFICATIONS) postTestNotification()
        if (requestCode == MICROPHONE) toast("İzin verildi. Başlatmak için ses ölçümü düğmesine dokunun.")
    }

    @Deprecated("Platform activity result API")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        val uri = data?.data
        if (requestCode != EXPORT || resultCode != RESULT_OK || uri == null) return
        app.io.execute {
            try {
                val output = contentResolver.openOutputStream(uri, "wt") ?: error("Dosya açılamadı")
                output.use { app.store.exportTo(it) }
                app.message = "CSV seçtiğiniz konuma aktarıldı."
            } catch (error: Exception) {
                app.message = "Dışa aktarılamadı: ${error.javaClass.simpleName}"
            }
        }
    }

    private fun toast(message: String) { Toast.makeText(this, message, Toast.LENGTH_LONG).show() }

    companion object {
        const val TEST_CHANNEL = "notif_logger_test"
        private const val EXPORT = 10
        private const val MICROPHONE = 11
        private const val NOTIFICATIONS = 12
    }
}

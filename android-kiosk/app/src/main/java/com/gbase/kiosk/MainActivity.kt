package com.gbase.kiosk

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.Button
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : AppCompatActivity() {

    companion object {
        // GBase Bot Configuration
        private const val BOT_URL = "https://gbase.ai/bot/a182ac3e-0552-4fc0-aced-cd995e5f91c2"
        private const val IDLE_TIMEOUT_MS = 120_000L // 2 minutes
        private const val IDLE_WARNING_MS = 15_000L  // 15 seconds warning
    }

    private lateinit var webView: WebView
    private lateinit var overlayPanel: LinearLayout
    private lateinit var toggleButton: Button
    private lateinit var promptContainer: LinearLayout

    private val handler = Handler(Looper.getMainLooper())
    private var idleRunnable: Runnable? = null
    private var currentZoneIndex = 0

    // Zone definitions
    data class Zone(
        val icon: String,
        val label: String,
        val color: Int,
        val prompts: List<String>
    )

    private val zones = listOf(
        Zone("🎫", "総合案内", 0xFF3B82F6.toInt(), listOf(
            "営業時間を教えて",
            "今日のイベントは？",
            "駐車場はありますか？",
            "ベビーカーを借りたい"
        )),
        Zone("🗺️", "フロアナビ", 0xFFF97316.toInt(), listOf(
            "スターバックスはどこ？",
            "トイレに行きたい",
            "ATMはありますか？",
            "ユニクロへの行き方"
        )),
        Zone("🛍️", "店舗検索", 0xFFEC4899.toInt(), listOf(
            "カフェを探して",
            "レストランのおすすめ",
            "子供服のお店",
            "お土産を買いたい"
        )),
        Zone("🌍", "多言語", 0xFF22C55E.toInt(), listOf(
            "Where is the restroom?",
            "免税柜台在哪里？",
            "화장실이 어디에요?",
            "ห้องน้ำอยู่ที่ไหน?"
        )),
        Zone("❓", "その他", 0xFF8B5CF6.toInt(), listOf(
            "Wi-Fiはありますか？",
            "コインロッカーの場所",
            "車椅子の貸し出し",
            "忘れ物をしました"
        ))
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Full screen immersive mode
        hideSystemUI()

        // Keep screen on
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        setContentView(R.layout.activity_main)

        initViews()
        setupWebView()
        setupOverlay()
        startIdleTimer()
    }

    private fun hideSystemUI() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).let { controller ->
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        overlayPanel = findViewById(R.id.overlayPanel)
        toggleButton = findViewById(R.id.toggleButton)
        promptContainer = findViewById(R.id.promptContainer)

        toggleButton.setOnClickListener {
            showOverlay()
            resetIdleTimer()
        }

        // Click outside overlay to close
        findViewById<View>(R.id.rootLayout).setOnClickListener {
            if (overlayPanel.visibility == View.VISIBLE) {
                hideOverlay()
            }
            resetIdleTimer()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            mediaPlaybackRequiresUserGesture = false
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Page loaded successfully
            }
        }

        webView.webChromeClient = WebChromeClient()

        // Load the bot page
        webView.loadUrl(BOT_URL)
    }

    private fun setupOverlay() {
        // Create zone buttons
        val zoneContainer = findViewById<GridLayout>(R.id.zoneContainer)

        zones.forEachIndexed { index, zone ->
            val button = layoutInflater.inflate(R.layout.zone_button, zoneContainer, false) as Button
            button.text = "${zone.icon}\n${zone.label}"
            button.setOnClickListener {
                selectZone(index)
                resetIdleTimer()
            }
            if (index == 0) {
                button.isSelected = true
            }

            // Set GridLayout params for 2-column layout
            val params = GridLayout.LayoutParams()
            params.width = 0
            params.height = GridLayout.LayoutParams.WRAP_CONTENT
            params.columnSpec = GridLayout.spec(index % 2, 1f)
            params.rowSpec = GridLayout.spec(index / 2)
            params.setMargins(4, 4, 4, 4)
            button.layoutParams = params

            zoneContainer.addView(button)
        }

        // Load initial prompts
        loadPrompts(0)
    }

    private fun selectZone(index: Int) {
        currentZoneIndex = index

        // Update zone button states
        val zoneContainer = findViewById<GridLayout>(R.id.zoneContainer)
        for (i in 0 until zoneContainer.childCount) {
            zoneContainer.getChildAt(i).isSelected = (i == index)
        }

        loadPrompts(index)
    }

    private fun loadPrompts(zoneIndex: Int) {
        promptContainer.removeAllViews()

        val zone = zones[zoneIndex]
        zone.prompts.forEach { prompt ->
            val button = layoutInflater.inflate(R.layout.prompt_button, promptContainer, false) as Button
            button.text = prompt
            button.setOnClickListener {
                sendMessage(prompt)
                resetIdleTimer()
            }
            promptContainer.addView(button)
        }
    }

    private fun sendMessage(message: String) {
        // JavaScript to fill input and click send
        val js = """
            (function() {
                // Find the textbox
                var textbox = document.querySelector('textarea[placeholder*="メッセージを入力"]');
                if (!textbox) {
                    textbox = document.querySelector('textarea');
                }

                if (textbox) {
                    // Set value using native setter to trigger React state update
                    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                    nativeInputValueSetter.call(textbox, '$message');

                    // Dispatch input event
                    var inputEvent = new Event('input', { bubbles: true });
                    textbox.dispatchEvent(inputEvent);

                    // Wait a bit then click send
                    setTimeout(function() {
                        var buttons = document.querySelectorAll('button');
                        for (var i = 0; i < buttons.length; i++) {
                            var btn = buttons[i];
                            if (btn.querySelector('svg') || btn.querySelector('img')) {
                                // Find the send button (usually has an icon)
                                var rect = btn.getBoundingClientRect();
                                if (rect.right > window.innerWidth - 200) {
                                    btn.click();
                                    break;
                                }
                            }
                        }
                    }, 200);
                }
            })();
        """.trimIndent()

        webView.evaluateJavascript(js) { result ->
            // Hide overlay after sending
            handler.postDelayed({
                hideOverlay()
            }, 500)
        }

        Toast.makeText(this, "送信中: $message", Toast.LENGTH_SHORT).show()
    }

    private fun showOverlay() {
        overlayPanel.visibility = View.VISIBLE
        toggleButton.visibility = View.GONE
        overlayPanel.animate()
            .translationX(0f)
            .setDuration(200)
            .start()
    }

    private fun hideOverlay() {
        overlayPanel.animate()
            .translationX(-overlayPanel.width.toFloat())
            .setDuration(200)
            .withEndAction {
                overlayPanel.visibility = View.GONE
                toggleButton.visibility = View.VISIBLE
            }
            .start()
    }

    private fun startIdleTimer() {
        resetIdleTimer()
    }

    private fun resetIdleTimer() {
        idleRunnable?.let { handler.removeCallbacks(it) }

        idleRunnable = Runnable {
            // Reset the app
            webView.loadUrl(BOT_URL)
            showOverlay()
            selectZone(0)
        }

        handler.postDelayed(idleRunnable!!, IDLE_TIMEOUT_MS)
    }

    override fun onResume() {
        super.onResume()
        hideSystemUI()
        resetIdleTimer()
    }

    override fun onPause() {
        super.onPause()
        idleRunnable?.let { handler.removeCallbacks(it) }
    }

    override fun onBackPressed() {
        // Disable back button in kiosk mode
        // Or optionally: if (overlayPanel.visibility == View.VISIBLE) hideOverlay()
    }
}

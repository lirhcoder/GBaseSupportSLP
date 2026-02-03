# GBase Kiosk ProGuard Rules
# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Kotlin metadata
-keep class kotlin.Metadata { *; }

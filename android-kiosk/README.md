# GBase Kiosk - Android 11

Android Kiosk应用，用于在大型触摸屏上展示GBase AI Bot。

## 功能特点

- **全屏Kiosk模式** - 隐藏系统UI，禁用返回键
- **WebView集成** - 加载GBase Bot网页，支持Canvas地图显示
- **浮动菜单** - 左侧半透明浮动面板，不遮挡Bot内容
- **分类问题卡片** - 5个分类（総合案内、フロアナビ、店舗検索、多言語、その他）
- **JavaScript注入** - 自动填写并发送预设问题
- **自动重置** - 2分钟无操作后自动重置
- **Home Launcher** - 可设置为设备默认启动器

## 系统要求

- Android 11 (API 30) 或更高
- 横屏触摸屏设备
- 网络连接

## 构建

```bash
cd android-kiosk
./gradlew assembleDebug
```

APK输出位置: `app/build/outputs/apk/debug/app-debug.apk`

## 安装

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 设置为Kiosk模式

1. 安装APK
2. 在设备设置中将 "GBase Kiosk" 设为默认Home应用
3. 重启设备

## 配置

修改 `MainActivity.kt` 中的配置:

```kotlin
companion object {
    private const val BOT_URL = "https://gbase.ai/bot/YOUR_BOT_ID"
    private const val IDLE_TIMEOUT_MS = 120_000L // 重置超时时间
}
```

## 项目结构

```
android-kiosk/
├── app/
│   ├── src/main/
│   │   ├── java/com/gbase/kiosk/
│   │   │   └── MainActivity.kt      # 主Activity
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   ├── activity_main.xml    # 主布局
│   │   │   │   ├── zone_button.xml      # 分类按钮
│   │   │   │   └── prompt_button.xml    # 问题按钮
│   │   │   ├── drawable/               # 背景样式
│   │   │   └── values/                 # 字符串、样式
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

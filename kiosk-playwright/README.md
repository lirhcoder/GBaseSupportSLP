# GBase AI Kiosk - Playwright Edition

使用 Playwright 控制浏览器，实现完整的 Bot 功能，包括 Canvas 地图显示。

## 功能特点

- ✅ **Canvas 地图支持** - 原生 Bot 页面，所有功能可用
- ✅ **预设问题按钮** - 左侧覆盖层显示分类问题
- ✅ **多语言支持** - 支持日/英/中/韩等10种语言
- ✅ **自动重置** - 闲置超时后自动刷新页面
- ✅ **触摸友好** - 适合 Kiosk 触摸屏使用

## 安装

```bash
cd kiosk-playwright

# 安装依赖
npm install

# 安装浏览器（首次运行需要）
npm run install-browser
```

## 运行

```bash
npm start
```

## 配置

编辑 `kiosk.js` 中的 CONFIG 对象：

```javascript
const CONFIG = {
    botId: 'a182ac3e-0552-4fc0-aced-cd995e5f91c2',  // Bot ID
    botUrl: 'https://gbase.ai/bot/',                 // Bot URL
    idleTimeout: 120,      // 闲置超时（秒）
    idleWarningAt: 15,     // 显示倒计时的剩余秒数
    fullscreen: true,      // 全屏模式
    devtools: false,       // 显示开发者工具（调试用）
};
```

## 自定义问题

修改 `ZONES` 数组来自定义分类和预设问题：

```javascript
const ZONES = [
    {
        id: 'general',
        icon: '🎫',
        label: '総合案内',
        color: '#3b82f6',
        prompts: [
            '营业时间是几点？',
            '今天有什么活动？',
            // ...
        ]
    },
    // ...
];
```

## 架构

```
┌─────────────────────────────────────────────┐
│  Playwright 控制的 Chromium 浏览器          │
│  ┌───────────┬─────────────────────────┐   │
│  │ 覆盖层    │  GBase Bot 页面         │   │
│  │           │                         │   │
│  │ [分类按钮] │  聊天界面               │   │
│  │           │                         │   │
│  │ [问题1]   │  ┌─────────────────┐   │   │
│  │ [问题2]   │  │ Canvas 地图     │   │   │
│  │ [问题3]   │  │ (原生支持)      │   │   │
│  │ [问题4]   │  └─────────────────┘   │   │
│  │           │                         │   │
│  └───────────┴─────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 工作流程

1. Playwright 启动 Chromium 浏览器
2. 导航到 GBase Bot 页面
3. 注入自定义覆盖层（CSS + DOM）
4. 用户点击预设问题按钮
5. Playwright 填充输入框并点击发送
6. Bot 处理请求并显示结果（包括 Canvas 地图）
7. 闲置超时后自动刷新重置

## 生产环境部署

对于 Kiosk 设备部署，建议：

1. 使用系统服务管理器（systemd/pm2）保持运行
2. 设置开机自启动
3. 禁用系统休眠
4. 配置触摸屏校准

```bash
# 使用 PM2 运行
npm install -g pm2
pm2 start kiosk.js --name gbase-kiosk
pm2 save
pm2 startup
```

## 故障排除

**问题：浏览器未安装**
```bash
npm run install-browser
```

**问题：发送按钮找不到**
检查 Bot 页面结构是否变化，可能需要更新选择器。

**问题：页面加载慢**
增加 `waitForTimeout` 时间或检查网络连接。

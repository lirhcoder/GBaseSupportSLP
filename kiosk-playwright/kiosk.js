/**
 * GBase AI Kiosk - Playwright Edition
 *
 * Features:
 * - Full bot functionality including Canvas maps
 * - Preset question buttons overlay
 * - Multi-language support
 * - Idle timeout with auto-reset
 * - Touch-friendly interface
 *
 * Usage:
 *   npm install
 *   npm run install-browser
 *   npm start
 */

const { chromium } = require('playwright');

// ========== Configuration ==========
const CONFIG = {
    botId: 'a182ac3e-0552-4fc0-aced-cd995e5f91c2',
    botUrl: 'https://gbase.ai/bot/',
    idleTimeout: 120,        // seconds before auto-reset
    idleWarningAt: 15,       // show warning when this many seconds left
    fullscreen: true,        // launch in fullscreen/kiosk mode
    devtools: false,         // show devtools for debugging
};

// Preset questions by zone
const ZONES = [
    {
        id: 'general',
        icon: '🎫',
        label: '総合案内',
        color: '#3b82f6',
        prompts: [
            '営業時間を教えて',
            '今日のイベントは？',
            '駐車場はありますか？',
            'ベビーカーを借りたい'
        ]
    },
    {
        id: 'floor',
        icon: '🗺️',
        label: 'フロアナビ',
        color: '#f97316',
        prompts: [
            'スターバックスはどこ？',
            'トイレに行きたい',
            'ATMはありますか？',
            'ユニクロへの行き方'
        ]
    },
    {
        id: 'shop',
        icon: '🛍️',
        label: '店舗検索',
        color: '#ec4899',
        prompts: [
            'カフェを探して',
            'レストランのおすすめ',
            '子供服のお店',
            'お土産を買いたい'
        ]
    },
    {
        id: 'language',
        icon: '🌍',
        label: '多言語',
        color: '#22c55e',
        prompts: [
            'Where is the restroom?',
            '免税柜台在哪里？',
            '화장실이 어디에요?',
            'ห้องน้ำอยู่ที่ไหน?'
        ]
    },
    {
        id: 'other',
        icon: '❓',
        label: 'その他',
        color: '#8b5cf6',
        prompts: [
            'Wi-Fiはありますか？',
            'コインロッカーの場所',
            '車椅子の貸し出し',
            '忘れ物をしました'
        ]
    }
];

// ========== Overlay CSS ==========
const OVERLAY_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');

    /* Base overlay styles - positioning handled in floating section below */

    #kiosk-header {
        padding: 12px 16px;
        background: rgba(255,255,255,0.05);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
    }

    #kiosk-header h1 {
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        margin: 0;
    }

    #kiosk-header p {
        color: rgba(255,255,255,0.5);
        font-size: 11px;
        margin: 0;
    }

    #kiosk-zones {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .kiosk-zone-btn {
        padding: 10px 8px;
        border-radius: 10px;
        border: 2px solid transparent;
        background: rgba(255,255,255,0.08);
        color: #fff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        text-align: center;
    }

    .kiosk-zone-btn .zone-icon {
        font-size: 20px;
    }

    .kiosk-zone-btn .zone-label {
        font-size: 11px;
        opacity: 0.9;
    }

    .kiosk-zone-btn:hover {
        background: rgba(255,255,255,0.15);
        transform: scale(1.02);
    }

    .kiosk-zone-btn.active {
        background: var(--zone-color);
        border-color: rgba(255,255,255,0.3);
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    #kiosk-prompts {
        flex: 1;
        padding: 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .kiosk-prompt-btn {
        width: 100%;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05);
        color: #fff;
        font-size: 13px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .kiosk-prompt-btn:hover {
        background: rgba(255,255,255,0.12);
        border-color: var(--zone-color);
    }

    .kiosk-prompt-btn:active {
        transform: scale(0.98);
    }

    .kiosk-prompt-btn.sending {
        background: var(--zone-color);
        border-color: var(--zone-color);
    }

    .kiosk-prompt-btn .arrow {
        opacity: 0.4;
        font-size: 12px;
    }

    .kiosk-prompt-btn:hover .arrow {
        opacity: 1;
    }

    #kiosk-footer {
        padding: 16px 20px;
        background: rgba(0,0,0,0.2);
        border-top: 1px solid rgba(255,255,255,0.1);
    }

    #kiosk-timer {
        display: none;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        background: rgba(239, 68, 68, 0.2);
        border-radius: 8px;
        color: #fca5a5;
        font-size: 14px;
    }

    #kiosk-timer.active {
        display: flex;
        animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    #kiosk-status {
        text-align: center;
        color: rgba(255,255,255,0.4);
        font-size: 11px;
        margin-top: 12px;
    }

    /* Floating overlay mode - no margin on body */
    body {
        margin-left: 0 !important;
    }

    /* Overlay as floating panel - positioned below header */
    #kiosk-overlay {
        position: fixed !important;
        left: 10px !important;
        top: 70px !important;
        bottom: 70px !important;
        width: 280px !important;
        background: rgba(26, 26, 46, 0.97) !important;
        backdrop-filter: blur(10px);
        z-index: 99999 !important;
        font-family: 'Noto Sans JP', sans-serif;
        display: flex !important;
        flex-direction: column !important;
        transform: translateX(0);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 30px rgba(0,0,0,0.5);
        overflow: hidden;
        border-radius: 16px;
    }

    #kiosk-overlay.hidden {
        transform: translateX(calc(-100% - 20px)) !important;
    }

    /* Toggle button to show overlay */
    #kiosk-toggle-btn {
        position: fixed;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 99998;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        font-size: 26px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
    }

    #kiosk-toggle-btn.visible {
        opacity: 1;
        pointer-events: auto;
    }

    #kiosk-toggle-btn:hover {
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.7);
    }

    #kiosk-toggle-btn:active {
        transform: translateY(-50%) scale(0.95);
    }

    /* No backdrop - floating panel only */
`;

// ========== Main Kiosk Logic ==========
async function startKiosk() {
    console.log('🚀 Starting GBase AI Kiosk...');

    // Launch browser
    const browser = await chromium.launch({
        headless: false,
        args: CONFIG.fullscreen ? [
            '--start-maximized',
            '--disable-infobars',
            '--disable-extensions',
            '--disable-dev-shm-usage',
        ] : [],
        devtools: CONFIG.devtools,
    });

    // Create context and page
    const context = await browser.newContext({
        viewport: null,  // Use full window size
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // Navigate to bot page
    const botUrl = CONFIG.botUrl + CONFIG.botId;
    console.log(`📍 Navigating to: ${botUrl}`);
    await page.goto(botUrl, { waitUntil: 'networkidle' });

    // Wait for bot to load
    await page.waitForTimeout(2000);

    // Inject overlay
    console.log('💉 Injecting kiosk overlay...');
    await page.addStyleTag({ content: OVERLAY_CSS });
    await injectOverlayDOM(page);

    // Initialize zones and prompts
    await initializeOverlay(page, ZONES);

    // Expose sendPrompt function to page
    await page.exposeFunction('kioskSendMessage', async (message) => {
        console.log(`📤 Sending: ${message}`);

        try {
            // Find the textbox by placeholder text (GBase bot specific)
            const textbox = page.getByRole('textbox', { name: 'こちらにメッセージを入力してください' });
            await textbox.fill(message);
            await page.waitForTimeout(200);

            // Find the send button - it's the button next to the textbox in the input container
            // The button becomes enabled after text is entered
            const inputContainer = page.locator('.m_82577fc2');
            const sendButton = inputContainer.locator('button').last();

            // Wait for button to be enabled
            await page.waitForTimeout(100);
            await sendButton.click();

            console.log('✅ Message sent');

            // Auto-hide overlay after sending
            await page.waitForTimeout(500);
            await page.evaluate(() => {
                if (window.hideOverlay) window.hideOverlay();
            });
            console.log('🙈 Overlay hidden');

            // Wait for response and then close Canvas if open
            await page.waitForTimeout(3000);
            await closeCanvasIfOpen(page);

            return true;
        } catch (error) {
            console.log('❌ Error sending message:', error.message);

            // Fallback: try alternative selectors
            try {
                const textarea = await page.$('textarea');
                if (textarea) {
                    await textarea.fill(message);
                    await page.waitForTimeout(200);
                    await page.keyboard.press('Enter');
                    console.log('✅ Message sent (via Enter key)');

                    // Auto-hide overlay
                    await page.waitForTimeout(500);
                    await page.evaluate(() => {
                        if (window.hideOverlay) window.hideOverlay();
                    });

                    await page.waitForTimeout(3000);
                    await closeCanvasIfOpen(page);
                    return true;
                }
            } catch (e) {
                console.log('❌ Fallback also failed');
            }

            return false;
        }
    });

    // Function to close Canvas panel if it's open
    async function closeCanvasIfOpen(page) {
        try {
            // Check if Canvas panel is visible by looking for the map title text
            const mapTitle = await page.locator('text=NEWoMan高輪 Map').first();
            const isVisible = await mapTitle.isVisible().catch(() => false);

            if (isVisible) {
                // The close button is a sibling of the title in the panel header
                // Find the button with an X icon near the map title
                const panelHeader = await mapTitle.locator('..'); // parent
                const closeButton = await panelHeader.locator('button').first();

                if (closeButton) {
                    await closeButton.click();
                    console.log('🗺️ Canvas panel closed');
                }
            }
        } catch (e) {
            console.log('🗺️ Canvas panel not found or already closed');
        }
    }

    // Wire up sendPrompt in page context
    await page.evaluate(() => {
        window.sendPrompt = async function(prompt, btn) {
            btn.classList.add('sending');
            const arrow = btn.querySelector('.arrow');
            if (arrow) arrow.textContent = '⏳';

            const success = await window.kioskSendMessage(prompt);

            setTimeout(() => {
                btn.classList.remove('sending');
                if (arrow) arrow.textContent = success ? '✓' : '→';
                setTimeout(() => {
                    if (arrow) arrow.textContent = '→';
                }, 2000);
            }, 500);

            // Auto-hide overlay after sending message
            if (success && window.hideOverlay) {
                setTimeout(() => {
                    window.hideOverlay();
                }, 800);
            }

            window.resetIdleTimer();
        };
    });

    // Idle timer functionality
    await page.exposeFunction('kioskReset', async () => {
        console.log('🔄 Resetting kiosk...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        // Re-inject overlay after reload
        await page.addStyleTag({ content: OVERLAY_CSS });
        await injectOverlayDOM(page);
        await initializeOverlay(page, ZONES);
    });

    await page.evaluate((config) => {
        window.idleTimer = null;
        window.countdownTimer = null;

        window.resetIdleTimer = function() {
            window.idleSeconds = 0;
            window.isWarning = false;
            const timer = document.getElementById('kiosk-timer');
            if (timer) timer.classList.remove('active');

            clearInterval(window.idleTimer);
            clearInterval(window.countdownTimer);

            window.idleTimer = setInterval(() => {
                window.idleSeconds++;

                const remaining = config.idleTimeout - window.idleSeconds;

                if (remaining <= config.idleWarningAt && !window.isWarning) {
                    window.isWarning = true;
                    const timer = document.getElementById('kiosk-timer');
                    if (timer) timer.classList.add('active');

                    window.countdownTimer = setInterval(() => {
                        const r = config.idleTimeout - window.idleSeconds;
                        const countdown = document.getElementById('kiosk-countdown');
                        if (countdown) countdown.textContent = r;

                        if (r <= 0) {
                            window.kioskReset();
                        }
                    }, 1000);
                }
            }, 1000);
        };

        // Start idle timer
        window.resetIdleTimer();

        // Reset on any interaction
        document.addEventListener('click', () => window.resetIdleTimer());
        document.addEventListener('touchstart', () => window.resetIdleTimer());
        document.addEventListener('keydown', () => window.resetIdleTimer());
    }, CONFIG);

    console.log('✅ Kiosk ready!');
    console.log('📋 Controls:');
    console.log('   - Click zone buttons to switch categories');
    console.log('   - Click prompt buttons to send questions');
    console.log('   - Auto-reset after', CONFIG.idleTimeout, 'seconds of inactivity');

    // Keep the browser open
    await page.waitForTimeout(999999999);
}

// Inject overlay DOM using safe DOM methods
async function injectOverlayDOM(page) {
    await page.evaluate(() => {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'kiosk-overlay';

        // Header
        const header = document.createElement('div');
        header.id = 'kiosk-header';
        const h1 = document.createElement('h1');
        h1.textContent = '🤖 AIコンシェルジュ';
        const p = document.createElement('p');
        p.textContent = 'ニュウマン高輪';
        header.appendChild(h1);
        header.appendChild(p);
        overlay.appendChild(header);

        // Zones container
        const zones = document.createElement('div');
        zones.id = 'kiosk-zones';
        overlay.appendChild(zones);

        // Prompts container
        const prompts = document.createElement('div');
        prompts.id = 'kiosk-prompts';
        overlay.appendChild(prompts);

        // Footer
        const footer = document.createElement('div');
        footer.id = 'kiosk-footer';

        const timer = document.createElement('div');
        timer.id = 'kiosk-timer';
        const timerIcon = document.createElement('span');
        timerIcon.textContent = '⏱️';
        const countdown = document.createElement('span');
        countdown.id = 'kiosk-countdown';
        countdown.textContent = '15';
        const timerText = document.createElement('span');
        timerText.textContent = '秒後にリセット';
        timer.appendChild(timerIcon);
        timer.appendChild(countdown);
        timer.appendChild(timerText);

        const status = document.createElement('div');
        status.id = 'kiosk-status';
        status.textContent = 'Playwright Kiosk Mode';

        footer.appendChild(timer);
        footer.appendChild(status);
        overlay.appendChild(footer);

        // Insert at beginning of body
        document.body.insertBefore(overlay, document.body.firstChild);

        // Create toggle button (hidden initially, shows when overlay is hidden)
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'kiosk-toggle-btn';
        toggleBtn.textContent = '☰';
        toggleBtn.title = 'メニューを表示';
        toggleBtn.onclick = function() {
            window.showOverlay();
        };
        document.body.appendChild(toggleBtn);

        // Functions to show/hide overlay
        window.hideOverlay = function() {
            const overlay = document.getElementById('kiosk-overlay');
            const toggleBtn = document.getElementById('kiosk-toggle-btn');
            if (overlay) overlay.classList.add('hidden');
            if (toggleBtn) toggleBtn.classList.add('visible');
        };

        window.showOverlay = function() {
            const overlay = document.getElementById('kiosk-overlay');
            const toggleBtn = document.getElementById('kiosk-toggle-btn');
            if (overlay) overlay.classList.remove('hidden');
            if (toggleBtn) toggleBtn.classList.remove('visible');
            if (window.resetIdleTimer) window.resetIdleTimer();
        };

        // Show overlay initially
        window.showOverlay();
    });
}

// Initialize zones and prompts with safe DOM methods
async function initializeOverlay(page, zones) {
    await page.evaluate((zonesData) => {
        window.kioskZones = zonesData;
        window.currentZoneIndex = 0;
        window.idleSeconds = 0;
        window.isWarning = false;

        // Render zone buttons as small cards
        const zonesContainer = document.getElementById('kiosk-zones');
        if (!zonesContainer) return;
        zonesContainer.textContent = ''; // Clear safely

        zonesData.forEach((zone, index) => {
            const btn = document.createElement('button');
            btn.className = 'kiosk-zone-btn' + (index === 0 ? ' active' : '');
            btn.style.setProperty('--zone-color', zone.color);

            const iconSpan = document.createElement('span');
            iconSpan.className = 'zone-icon';
            iconSpan.textContent = zone.icon;

            const labelSpan = document.createElement('span');
            labelSpan.className = 'zone-label';
            labelSpan.textContent = zone.label;

            btn.appendChild(iconSpan);
            btn.appendChild(labelSpan);
            btn.onclick = (e) => {
                e.stopPropagation();
                window.selectZone(index);
            };
            zonesContainer.appendChild(btn);
        });

        // Click outside to close overlay
        document.addEventListener('click', (e) => {
            const overlay = document.getElementById('kiosk-overlay');
            const toggleBtn = document.getElementById('kiosk-toggle-btn');
            if (overlay && !overlay.classList.contains('hidden')) {
                if (!overlay.contains(e.target) && e.target !== toggleBtn) {
                    window.hideOverlay();
                }
            }
        });

        // Render prompts function
        window.renderPrompts = function(zoneIndex) {
            const zone = zonesData[zoneIndex];
            const container = document.getElementById('kiosk-prompts');
            if (!container) return;
            container.textContent = ''; // Clear safely
            container.style.setProperty('--zone-color', zone.color);

            zone.prompts.forEach((prompt) => {
                const btn = document.createElement('button');
                btn.className = 'kiosk-prompt-btn';
                btn.style.setProperty('--zone-color', zone.color);

                const textSpan = document.createElement('span');
                textSpan.textContent = prompt;
                const arrowSpan = document.createElement('span');
                arrowSpan.className = 'arrow';
                arrowSpan.textContent = '→';

                btn.appendChild(textSpan);
                btn.appendChild(arrowSpan);
                btn.onclick = () => window.sendPrompt(prompt, btn);
                container.appendChild(btn);
            });
        };

        window.selectZone = function(index) {
            window.currentZoneIndex = index;
            document.querySelectorAll('.kiosk-zone-btn').forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });
            window.renderPrompts(index);
            if (window.resetIdleTimer) window.resetIdleTimer();
        };

        // Initial render
        window.renderPrompts(0);
    }, zones);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down kiosk...');
    process.exit(0);
});

// Start the kiosk
startKiosk().catch(console.error);

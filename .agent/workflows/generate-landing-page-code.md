---
description: Generate the High-Fidelity HTML/CSS Landing Page for GBase Support (SC Solution) - Japanese Version.
---

1. **Asset Generation (Japanese Style)**:
   - Target Directory: `landing_page/assets/`
   - Generate `hero_bg.png`: "Futuristic Japanese shopping mall with neon signs in Japanese Kanji (案内, インフォメーション), cyberpunk, night, high quality 3d render".
   - Generate `map_canvas_ui.png`: "Tablet showing a digital floor map with Japanese text UI labels (現在地, ルート), futuristic glowing path, dark mode".
   - Generate `avatar_agent.png`: use `generate_image` with the user's uploaded reference image. Prompt: "3D render of this anime character as a professional concierge in a shopping mall, bowing slightly, warm smile, high quality, consistent with reference".

2. **HTML Structure (Japanese)**:
   - File: `landing_page/index.html`.
   - **Language**: `lang="ja"`.
   - **Fonts**: Include "Noto Sans JP".
   - **Content**: Translate all copy to Japanese.
     - Headline: "フロアマップが、そのままAIコンシェルジュに。" (Floor map becomes AI concierge).
     - Sub-head: "画像をアップロードするだけ。既存の案内図が、多言語対応のインタラクティブなナビゲーションシステムに生まれ変わります。"
     - Features: "Map Canvas (マップキャンバス)", "デジタルヒューマン (Digital Human)".

3. **CSS Styling**:
   - File: `landing_page/styles.css`.
   - Font Family: `'Noto Sans JP', 'Inter', sans-serif`.
   - Keep the Dark Mode Glassmorphism theme.

4. **Verification**:
   - Check text rendering.
   - Verify image aesthetics match Japanese market expectations.

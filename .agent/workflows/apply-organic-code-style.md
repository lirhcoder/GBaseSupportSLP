---
description: A workflow to generate "Organic" (Anti-AI) HTML/CSS code, emphasizing semantics, business-logic naming, and SEO depth.
---

This workflow guides the generation of code that feels "hand-crafted" and professional, avoiding common AI-generated patterns like "div soup" or generic class names.

1. **Semantic Structure Strategy**:
    - **No `<div>` as primary wrappers**: Use `<article>`, `<section>`, `<aside>`, `<nav>`, `<header>`, `<footer>`.
    - **Break Linearity**: Do not just vertically stack content. Use `<aside>` for supplementary info (testimonials, quick stats) or `<figure>` for visual media.
    - **Micro-semantics**: Use `<time>`, `<address>`, `<blockquote class="expert-quote">`.

2. **Business-Driven Naming (BEM-ish)**:
    - **Rule**: Class names MUST reflect *what the component is for* in the business context, not just *what it looks like*.
    - **Avoid**: `.card`, `.flex-box`, `.wrapper`, `.section-1`.
    - **Use**: `.sc-concierge-unit`, `.mall-navigation-map`, `.customer-pain-point`, `.feature-highlight--primary`.

3. **SEO & Data injection**:
    - **JSON-LD**: Always inject a `<script type="application/ld+json">` block. Use `Product`, `Service`, or `HowTo` schemas.
    - **Meta Tags**: Ensure `description` is compelling and manually optimized, not just a summary.
    - **Open Graph**: Add precise `og:image`, `og:title`, and `og:type`.

4. **Resource & Accessibility Optimization**:
    - **Images**: Always use `alt` text that describes the *content and function* for a blind user (e.g., "Detailed floor map showing the path to the restroom" vs "Map").
    - **Loading**: Use `<link rel="preload">` for LCP images (like Hero background).
    - **Critical CSS**: If possible, separate critical styles.

5. **Anti-pattern Check**:
    - [ ] Is there any `div` nested deeper than 3 levels without a semantic tag? -> **Refactor**.
    - [ ] Are there class names like `.text-block`? -> **Rename to `.product-description`**.
    - [ ] Is the page structural linearity too "perfect"? -> **Add an asymmetry**.

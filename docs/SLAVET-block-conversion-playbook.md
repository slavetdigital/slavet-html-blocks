
# Slavet Theme — Zero‑Error HTML → Dynamic Blocks Playbook (FSE, Tailwind v4)

> **Purpose:** Convert every file in `wp-content/themes/theme-name/HTML/*.html` into production‑grade **dynamic blocks** in `src/`, with **pixel‑perfect editor⇄frontend parity**, **no warnings/errors/deprecations**, and **clean builds** to `build/` via `wp-scripts`.

---

## 0) Ground Rules (non‑negotiable)

- **Scope:** Work **only** in `src/`. Do **not** change files outside `src` or the registered template‑parts/templates, except moving converted HTML to `HTML/HTML-DONE/` after successful QA.
- **Styling:** 99% **Tailwind CSS v4** utilities; no custom CSS unless strictly necessary (then keep it in the block’s `style.css`).
- **Rendering:** Blocks are **dynamic** only — `save: () => null` with server render in `render.php`.
- **Sanitization:** Escape everything in PHP; obey WP security & a11y best practices.
- **Parity:** **Identical DOM + classes** between `edit.js` and `render.php`. No visual drift.
- **Filters + Grids:** If a filter controls a grid, they live in **one block**.
- **Post Types & Manual Data:** Any listing block supports **both** `post_type` query and `manual` mode, displaying with the same DOM.
- **After conversion:** Move the source HTML file to `HTML/HTML-DONE/` and tick it off in your tracker.
- **CI/QA:** Lint, validate, a11y, console checks must pass with 0 errors/warnings/deprecations.

---

## 1) Repository Conventions

### 1.1 Where things go
- **Blocks:** `src/<block-slug>/` → copied by build to `build/<block-slug>/`.
- **Files per block:**
  - `block.json` — metadata, attributes, supports, category/icon, `render` pointer
  - `index.js` — `registerBlockType('slavet/<block-slug>', { edit, save: () => null })`
  - `edit.js` — editor DOM **identical** to frontend; inspector controls & repeaters
  - `style.css` — Tailwind v4 imports at top; editor+frontend shared styles
  - `editor.css` — optional editor‑only tweaks (avoid unless necessary)
  - `view.js` — optional progressive enhancement (filters/toggles, responsive BG/video switch, etc.)
  - `render.php` — sanitized server render producing the **same DOM** as `edit.js`
- **Template parts:** Extract `<header>` → `parts/header-*.html`, `<footer>` → `parts/footer-*.html` and register as options (Customizer or `theme.json` styles). Default + N options.
- **Templates:** Keep `templates/page.html`, `templates/single.html` lean (header → `post-content` → footer). Composition happens via blocks & patterns.

### 1.2 Naming
- Block slug mirrors section role, e.g., `team-grid`, `about-hero`, `services-features`.
- If there are **variants**, keep one slug and add a `variant` attribute (`"default"`, `"v2"`, …) rather than multiplying blocks.

---

## 2) Conversion Algorithm (per `HTML/*.html`)

1. **Parse layout**
   - Detect **model A**: `<body> header + sections + footer` or **model B**: `<body> header + <main>… + footer`.
   - Extract `<header>` and `<footer>` into **template parts** (see §6 variants).
2. **Split `<main>`**
   - Every top‑level `<section>` or **significant** `<div>` becomes **one block**.
   - Repetitive UI (button, card, badge) becomes Inspector‑driven **repeaters** (add/remove item buttons).
3. **Scaffold the block**
   - Create `src/<block-slug>/` with standard files.
   - Copy the **exact** HTML markup & Tailwind classes into **both** `edit.js` and `render.php`.
4. **Extract attributes**
   - Turn every editable content piece into an attribute with strong defaults:
     - Text (heading, subheading, rich text, meta)
     - Media (img/video bg, alt, poster, sources)
     - Links (label, URL, rel, target)
     - Lists/Items (repeaters with add/remove)
     - Layout knobs (columns, gap, alignment, variant, show/hide parts)
     - Color tokens (bg/text/border) and **background mode**: `none | color | image | video`
5. **Editor controls**
   - Inspector controls for every attribute; repeaters with **Add Item** / **Remove item** buttons.
   - Background mode switcher: if `image` or `video`, reveal relevant fields.
6. **Server render**
   - In `render.php`, sanitize:
     - `esc_html()` for plain text; `wp_kses_post()` for rich text
     - `esc_url()` for URLs; `esc_attr()` for attributes
     - Clamp integers (e.g., columns 1–4). Fall back to defaults safely.
7. **Enhancements (opt‑in)**
   - In `view.js`, progressively enhance only what needs JS (filtering, tabs, collapsibles).
   - For media backgrounds, select best source per viewport DPR; lazy‑load sensibly.
8. **QA for the block**
   - Ensure **editor = frontend** visually and structurally.
   - Check a11y: heading levels, alt text, focus visibility, ARIA labels for repeated regions.
   - Save the block, reload the editor, view the frontend — **no errors/warnings** anywhere.
9. **Finalize**
   - Add optional **pattern** composing the page from the new blocks.
   - Move the HTML source to `HTML/HTML-DONE/`.
   - Update your tracker and commit.

---

## 3) Multi‑Header / Multi‑Footer Strategy (Options)

- Register **one default** header/footer and additional **variants**:
  - `parts/header.html` (default) + `parts/header-v2.html`, `parts/header-v3.html`, …
  - Same for footer.
- Provide a **theme option** or pattern choices that swap which template part is inserted.
- Do **not** embed site branding/navigation inside blocks. Keep them template‑part‑only.

---

## 4) “Reusable Anywhere” Rule for Singles & Archives

- Any section originating from `single-*.html` or `*.html` archive must be authored as a **generic block**:
  - When placed on a single post/page, it can read the **current post** data.
  - When placed on any page, it can switch to **manual content** or **query** a chosen post type/taxonomy.
- Provide a **Data Source** control:
  - `manual` (repeaters)
  - `post_type` (choose post type, taxonomy/term, order, per_page)
  - Use `WP_Query` with safe args; render identical DOM in both modes.
- Links should point to the correct **single** pages; archives include pagination where relevant.

---

## 5) Attributes (Core Set)

```json
{
  "variant": { "type": "string", "default": "default" },
  "heading": { "type": "string", "default": "" },
  "subheading": { "type": "string", "default": "" },
  "rich": { "type": "string", "default": "" },
  "items": { "type": "array", "default": [] },
  "cta": { "type": "object", "default": { "label": "", "url": "#" } },
  "columns": { "type": "number", "default": 3 },
  "bgMode": { "type": "string", "default": "none" },  // none | color | image | video
  "bgColor": { "type": "string", "default": "" },
  "bgImage": { "type": "object", "default": { "url": "", "alt": "" } },
  "bgVideo": { "type": "object", "default": { "mp4": "", "webm": "", "poster": "" } },
  "dataSource": { "type": "string", "default": "manual" }, // manual | post_type
  "postType": { "type": "string", "default": "post" },
  "taxonomy": { "type": "string", "default": "" },
  "terms": { "type": "array", "default": [] },
  "perPage": { "type": "number", "default": 6 },
  "orderBy": { "type": "string", "default": "date" },
  "order": { "type": "string", "default": "desc" },
  "ariaLabel": { "type": "string", "default": "" }
}
```

---

## 6) Editor ⇄ Frontend Parity (Hard Requirements)

- Duplicate the **same JSX/HTML** structure in `edit.js` and `render.php`.
- Keep Tailwind classes identical. Put shared utilities in `style.css` to ensure the editor iframe and frontend match.
- Avoid unpredictable DOM in the editor (e.g., conditionally loaded third‑party scripts). Prefer pure markup with small `view.js` upgrades.

---

## 7) Sanitization & A11y Quick Table

| Data | Editor control | PHP render |
|---|---|---|
| Plain text | `<TextControl/>` | `esc_html()` |
| Rich text | `<RichText/>` | `wp_kses_post()` |
| URL | `<URLInput/>` | `esc_url()` |
| Attribute | Toggle/Select | `esc_attr()` |
| Integer | RangeControl | `max(1, min(4, (int)$attrs['columns']))` |
| Image/Video | Media library | `esc_url()`, alt via `esc_attr()` |
| Region label | TextControl | `aria-label` when multiple similar sections |

---

## 8) Filters + Grid in One Block

- Combine filter controls and grid list in **one** block (e.g., `team-grid`, `blog-grid`, `videos-grid`).
- Wire `view.js` to:
  - Read filter state (search, terms, ordering)
  - Update list via front‑end filtering or REST (for large datasets)
- Server render builds initial list; `view.js` enhances UX (debounce, pagination).

---

## 9) Build & Validation (Zero Warnings Policy)

Add or use these scripts in `package.json`:

```json
{
  "scripts": {
    "build": "wp-scripts build",
    "lint": "wp-scripts lint-js && wp-scripts lint-style",
    "validate:blocks": "wp block validate",
    "check:blocks": "wp-scripts build && wp block validate",
    "test:a11y": "node ./tools/a11y-check.mjs",
    "test:console": "node ./tools/check-console-errors.mjs",
    "test:playwright": "npx playwright test"
  }
}
```

**Sequence (must all be clean):**
```bash
npm run build
npm run lint
npm run validate:blocks
npm run test:a11y
npm run test:console
npm run test:playwright   # optional but recommended
```
All must return code **0** with **no warnings/deprecations**.

---

## 10) Error‑Proofing the Conversion (Anti‑Hallucination Routine)

1. **Before you start a block**
   - Copy DOM exactly; no re‑naming, no class changes.
   - List attributes you’ll expose. If text/media exists in markup, a corresponding attribute must exist.
2. **While editing**
   - After each change, diff `edit.js` vs. `render.php` output (DOM snapshot). They must match.
3. **After scaffold**
   - Run **build + lint + validate** immediately. Fix issues before proceeding.
4. **After page assembly**
   - Add blocks to a page, save, reload, and test frontend. Check both editor and browser consoles.
5. **Finally**
   - Move HTML file to `HTML/HTML-DONE/`.
   - Update progress tracker and commit with a descriptive message.

---

## 11) Repeater Pattern (Add/Remove Items)

- Use an array attribute `items`.
- Provide **Add item** and **Remove** per item controls in the Inspector and inline toolbar where appropriate.
- Persist keys (e.g., `id` or `uid`) to avoid React list reordering bugs.
- In PHP, loop items defensively: skip empty rows; sanitize each field.

---

## 12) Background Modes (Color / Image / Video)

- Attribute `bgMode`: `none | color | image | video`.
- If `image`: render `<div class="absolute inset-0"><img …/></div>` with proper `alt` (decorative → empty alt).
- If `video`: `<video muted playsinline autoplay loop …>` with `<source>`s and `poster`.
- Provide a fallback color. Manage quality/responsiveness in `view.js` only if needed.

---

## 13) CI Recommendations

- Add a GitHub Action `validate.yml` to run: build → lint → block validate → a11y → console checks.
- Fail PRs on any warning/error. Require green checks before merge.

---

## 14) Minimal Boilerplates

### 14.1 `index.js`
```js
import { registerBlockType } from '@wordpress/blocks';
import edit from './edit';
import metadata from './block.json';
import './style.css';
import './editor.css';

registerBlockType(metadata.name, {
  edit,
  save: () => null,
});
```

### 14.2 `block.json`
```json
{
  "apiVersion": 3,
  "name": "slavet/<block-slug>",
  "title": "<Nice Title>",
  "category": "slavet",
  "icon": "layout",
  "description": "Converted from HTML",
  "attributes": { /* see §5 */ },
  "supports": { "align": ["wide", "full"], "spacing": { "margin": true, "padding": true } },
  "editorScript": "file:./index.js",
  "style": "file:./style.css",
  "render": "file:./render.php"
}
```

### 14.3 `render.php`
```php
<?php
$attrs = wp_parse_args( $attributes, [
  'heading' => '',
  'items'   => [],
  // … other defaults
]);

$heading = esc_html( $attrs['heading'] );
?>
<section class="py-12">
  <div class="container mx-auto">
    <?php if ( $heading ) : ?>
      <h2 class="text-3xl font-semibold mb-6"><?php echo $heading; ?></h2>
    <?php endif; ?>
    <div class="grid gap-6 md:grid-cols-3">
      <?php foreach ( $attrs['items'] as $item ) :
        $title = isset($item['title']) ? esc_html($item['title']) : '';
        $text  = isset($item['text']) ? wp_kses_post($item['text']) : '';
      ?>
        <article class="rounded-xl p-6 bg-white/5 border">
          <h3 class="text-xl font-medium mb-2"><?php echo $title; ?></h3>
          <div class="prose"><?php echo $text; ?></div>
        </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>
```

---

## 15) Acceptance Checklist (per block)

- [ ] `edit.js` DOM === `render.php` DOM (structure + classes)
- [ ] All content knobs exposed as attributes & controls
- [ ] Sanitization in PHP for every output
- [ ] Works in `manual` and `post_type` data sources if relevant
- [ ] No editor or frontend console warnings/errors
- [ ] No deprecations on save/update
- [ ] Passes build, lint, block validation, a11y, console checks
- [ ] HTML source moved to `HTML/HTML-DONE/`

---

## 16) Common Pitfalls & Fixes

- **Mismatched DOM:** Copy markup once, paste to both files, then only edit **through attributes**.
- **Missing Tailwind in editor:** Ensure shared utilities live in the block’s `style.css` imported by `index.js`.
- **List key churn:** Add a stable `uid` to each `items[]` entry.
- **Deprecated React APIs:** Rely on `@wordpress/components` primitives; run `npm run lint` often.
- **Block invalidation after save:** Check attribute shape between editor and PHP; keep defaults in sync.
- **Overfetching:** For post queries, paginate and limit fields; switch to REST only if UX demands.

---

## 17) Execution Order for a Multi‑File Batch

1. For each file in `HTML/`:
   - Convert → QA → move to `HTML/HTML-DONE/`
2. After a batch:
   - Run full validation pipeline (build, lint, validate, a11y, console)
   - Smoke test with Playwright (optional)
3. Commit with message: `feat(blocks): convert <file> → <blocks>`

---

## 18) Done = Shippable

- No warnings, no errors, no deprecations anywhere.
- Editor and frontend are visually identical.
- Blocks are reusable on any page, with manual or post‑type data modes.
- Multiple headers/footers available as options.
- All original HTMLs archived in `HTML/HTML-DONE/`.

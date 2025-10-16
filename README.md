# slavet-html-blocks — Claude Code plugin

Marketplace-ready plugin that converts project HTML sections into **WordPress FSE dynamic blocks** in `src/` and validates **zero-error parity** before emitting to `build/` — powered by **Claude Code Sub-Agents**.

## Why this plugin
- Zero bloat: heavy work is opt-in via explicit commands
- Evidence-first: block output parity is proven via file diffs and render checks
- Works offline against local HTML and your theme’s `src/` without remote calls
- Resource-thrifty: token budgets, chunked scans, cached ASTs, throttled background scheduling
- Integrates with `slavet-claude-frontend` (design tokens) and `slavet-claude-wordpress` (compliance checks)

## Features
- Parses `HTML/*.html` → splits sections/divs → emits **dynamic blocks** (PHP render + editor JSX)
- Tailwind v4 support; preserves utility classes and normalizes editor canvas styles
- Enforces **editor ⇄ frontend parity** and **zero warnings/deprecations** policy
- Multiple header/footer variants; blocks reusable anywhere (manual or post-type data sources)
- Strict server-side sanitization and escaping in PHP render callbacks

## Install
### Marketplace
```bash
claude plugin marketplace add slavet-html-blocks@slavet-market
claude plugin install slavet-html-blocks
```

### Local (from path)
```bash
# In your project root
/plugin install /absolute/path/to/slavet-html-blocks
```

## Commands
```text
/plugin slavet-html-blocks convert --html-dir HTML --src-dir src --build-dir build [--auto] [--yes]
/plugin slavet-html-blocks validate [--src-dir src] [--build-dir build]
/plugin slavet-html-blocks scan --html-dir HTML
/plugin slavet-html-blocks fix [--src-dir src]
/plugin slavet-html-blocks sync [--src-dir src] [--build-dir build]
/plugin slavet-html-blocks settings --maxTokens 6000 --fileBatch 6 --sleepMs 250 --throttleCPU 0.2
```

### Flags
- `--auto`: run in background-friendly batches during idle windows; posts status cards
- `--yes`: auto-apply suggested edits without prompting
- `--maxTokens`: hard cap per step to avoid overruns
- `--fileBatch`: batch size when scanning/transforming multiple files
- `--sleepMs`: backoff between batches to keep the editor responsive
- `--throttleCPU`: gently rate-limit heavier steps

## Behavior
- Prefers existing artifacts in your repo (previous conversions, cached ASTs) before new work
- Produces concise, citation-rich outputs (paths, diffs, and short tables) instead of narratives
- Stops if evidence is missing; asks before large scans or destructive changes

## Sub-agents
- Converter: splits HTML, maps structure to block scaffolds, and generates render/edit code
- Parity Validator: compares editor and frontend renders and flags deltas to fix
- Resource Sentinel: enforces token/cycle budgets and schedules background work
- QA Guard: blocks emission to `build/` until parity and sanitization checks pass

## Examples
```bash
# Convert HTML files into reusable dynamic blocks
/plugin slavet-html-blocks convert --html-dir HTML --src-dir src --build-dir build --auto

# Validate editor ↔ frontend parity and sanitization before emitting to build
/plugin slavet-html-blocks validate --src-dir src --build-dir build

# Scan only and list candidate sections
/plugin slavet-html-blocks scan --html-dir HTML
```

## Settings
Use the `settings` command to adjust resource posture:
```bash
/plugin slavet-html-blocks settings --maxTokens 6000 --fileBatch 6 --sleepMs 250 --throttleCPU 0.2
```

## CI integration (optional)
- Run `convert` and `validate` in CI and store artifacts under `./.reports/` if desired
- Keep CI outputs concise; prefer file diffs and short tables

## Marketplace publish
Include `.claude-plugin/marketplace.json` in your repo. Then consumers can:
```bash
claude plugin marketplace add slavet-html-blocks@slavet-market
claude plugin install slavet-html-blocks
```

## Autonomy
With `--auto`, batch work continues in idle windows and posts status cards. Changes require explicit approval unless `--yes` is passed.

## License
MIT

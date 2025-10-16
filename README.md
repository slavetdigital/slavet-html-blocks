# slavet-html-blocks — Claude Code Plugin
Marketplace-ready plugin that converts project HTML sections into **WordPress FSE dynamic blocks** in `src/` and validates **zero-error parity** before emitting to `build/` — powered by **Claude Code Sub-Agents**.

## Features
- Parses `HTML/*.html` → splits sections/divs → **dynamic blocks** (PHP render + editor JSX) with Tailwind v4.
- Enforces **editor⇄frontend parity**, strict PHP sanitization, and **zero warnings/deprecations** policy.
- Multi header/footer variants and blocks reusable anywhere (manual or post-type data sources).
- Resource-thrifty: token budgets, chunked scans, cached ASTs, throttled background scheduling.
- Integrates with `slavet-claude-frontend` (design tokens) and `slavet-claude-wordpress` (checks).

## Install
```bash
claude plugin marketplace add slavet-html-blocks@slavet-market
claude plugin install slavet-html-blocks
```

## CLI
```
/plugin slavet-html-blocks convert --html-dir HTML --src-dir src --build-dir build [--auto] [--yes]
/plugin slavet-html-blocks validate
/plugin slavet-html-blocks scan --html-dir HTML
/plugin slavet-html-blocks fix
/plugin slavet-html-blocks sync
/plugin slavet-html-blocks settings --maxTokens 6000 --fileBatch 6 --sleepMs 250 --throttleCPU 0.2
```

## Autonomy
With `--auto`, batch work continues in idle windows and posts status cards. Changes require explicit approval unless `--yes` is passed.

## License
MIT

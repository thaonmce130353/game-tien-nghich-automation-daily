# docs index

Lookup order for game-controller questions: read this file, then the single file you need. Do not open `game-client/` or `data/*.json` directly.

| Need | Go to | Size |
| --- | --- | --- |
| What does controller X do, which controller handles feature Y | [controllers/INDEX.md](controllers/INDEX.md) (one line per controller, 162 rows) | ~13 KB |
| Senders, request fields and method names of one controller | `controllers/<Name>.md` | 1–10 KB each |
| Source of a specific method | `node scripts/bundle-method.js <Ctrl> <method> [method...]` (prints only those bodies, capped at 1200 chars each; `--max=N` to change) | on demand |
| Banner heroes: roster, schedule rules, what the client can and cannot know | [banner-heroes.md](banner-heroes.md) | ~5 KB |
| Which `*Ctrl` globals exist and safe inspection rules | [game-controllers.md](game-controllers.md) | ~5 KB |

## Layout

- `controllers/` generated per-controller notes. Do not edit by hand; regenerate with `node scripts/describe-controllers.js`.
- `data/` raw inputs and machine-readable output.
  - `tn-exposure-probe.json`: export from the HUD **🔍 Probe → Quét → Xuất JSON** (input to the generator).
  - `game-controller-methods.json`: generator output with every method grouped by kind (use `grep`/`node -e` on one controller, not a full read).
  - `tn-banner-status.json`: export from **Banner hero → Xuất JSON** when saved here.
- `game-client/` local-only copy of the proprietary game bundle. Never commit or redistribute (see the root README).

## Rules of thumb

- Find a feature: search `controllers/INDEX.md` for a keyword (for example `grep -i "guild" docs/controllers/INDEX.md`).
- Purposes marked "(guess)" are from the name only; verify with `bundle-method.js` before relying on them.
- After a game update, re-export the probe JSON into `data/`, run the generator, and re-check `banner-heroes.md`.

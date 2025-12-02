---
last_updated: 2025-12-02
source_path: .trae/documents/Obsidian Integration for Accountant Project.md
---
## Vault Setup
- Use the project root `/Users/ciepolml/Projects/accountant` as the Obsidian vault so docs and code live together and sync via git.
- Open Obsidian → “Open folder as vault” → choose `/Users/ciepolml/Projects/accountant`.

## Folder Structure & Index Notes
- Keep existing folders; add simple index notes for navigation:
  - `docs/Index.md`, `docs/UX/Index.md`, `docs/specs/Index.md`, `.trae/documents/Index.md`.
- Add `README-Obsidian.md` describing vault usage and workflow.

## Create/Complete Markdown Docs
- Add helpful stubs: `docs/Architecture-Overview.md`, `docs/Contributing.md`, `docs/Glossary.md`, `docs/CHANGELOG.md`.
- Ensure frontmatter and basic cross-links in existing docs.

## Bidirectional Sync & Automation
- Version control: keep git; add Obsidian Git plugin for auto-commit/pull in Obsidian.
- Real-time updates:
  - Dev watcher (`scripts/sync-obsidian.js`) using `chokidar` + `gray-matter`:
    - Update `last_updated` frontmatter on change.
    - Maintain folder index notes (e.g., `docs/specs/Index.md`).
    - Prepare for future `src/**` code docs when code arrives.
  - Git hooks:
    - `pre-commit`: validate frontmatter.
    - `post-merge`: refresh indexes.
- Cross-referencing:
  - Use wikilinks and inline code refs like ``src/services/process.ts:712``.

## Obsidian Plugins Configuration
- Enable Community plugins in Obsidian.
- Install and configure:
  - Obsidian Git (auto commit/pull at 10–30 min).
  - Dataview (queries for dashboards).
  - Tasks (task lists with due dates).
  - Templater (frontmatter/templates).
  - Excalidraw (optional diagrams).
  - Charts (optional visuals).

## Obsidian AI Plugin (Local LLM via Ollama)
- Prepare Ollama:
  - Install: `https://ollama.com/download`.
  - Start a model: `ollama run tinyllama` (example; choose a stronger model if needed).
- Install plugin into vault:
  - From vault root: `cd .obsidian/plugins`
  - `git clone https://github.com/Sparky4567/obsidian_ai_plugin.git`
  - `cd obsidian_ai_plugin && npm install && npm run build`
- Enable in Obsidian:
  - Toggle Community plugins on; enable “LLM plugin”.
  - In plugin settings: choose endpoint (local Ollama) and model (e.g., `tinyllama`).
- Usage test:
  - Write simple text, select it.
  - Press `CTRL+P` (Command Palette).
  - Type `ASK LLM` → pick a command → Enter.
  - Confirm selection is replaced with LLM output.
- Repo hygiene:
  - Add `.gitignore` for `.obsidian/plugins/*/node_modules` to avoid huge commits.

## Documentation Standards
- Frontmatter on all notes:
  - `title`, `tags` (`spec`, `ux`, `feature`, `process`), `version`, `last_updated`, `source_path`, `status` (`draft`, `reviewed`).
- Linking:
  - Each spec links to related features and UX; embed visuals with `![[wireframes/dashboard.svg]]`.
- Version tracking:
  - Increment `version` on major changes and log in `docs/CHANGELOG.md` with the git commit/tag.

## Automated Backups
- Obsidian Git: enable auto-commit and auto-push to remote.
- macOS `launchd` nightly zip backup:
  - Zip `docs` and `.trae/documents` to `~/ObsidianBackups/accountant-YYYYMMDD.zip`.
  - Keep 14 days; prune older.

## Usage Patterns
- Edit docs in Obsidian or editor; watcher updates indexes/frontmatter.
- Tasks: use `- [ ]` with due dates; query via Dataview.
- Graph View: tag-based groups (`spec`, `ux`, `feature`) for structure.
- LLM: use the AI plugin for inline rewrites, summaries, and scaffolds.

## Verification
- Make an edit in a doc; confirm `last_updated` and index refresh.
- Create a new spec via Templater; verify frontmatter and `docs/specs/Index.md` inclusion.
- Run Obsidian Git auto-commit/push; confirm on remote.
- Test AI plugin with `ASK LLM`; verify output replacement.
- Confirm nightly backup zip appears in `~/ObsidianBackups/`.

On approval, I will: configure the vault, add index notes/templates, implement the watcher + git hooks, install and set up the AI plugin with Ollama, add `.gitignore` safeguards, and the backup plist, then verify end-to-end.
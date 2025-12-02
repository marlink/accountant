---
title: Obsidian Vault Usage
tags: [process, obsidian]
version: 1.0
last_updated: 2025-12-02
source_path: docs/README-Obsidian.md
status: reviewed
---

- Open the project root as a vault: `/Users/ciepolml/Projects/accountant`
- Enable Community plugins and install: Obsidian Git, Dataview, Tasks, Templater, Excalidraw (optional), Charts (optional)
- Use index notes: `docs/Index.md`, `docs/specs/Index.md`, `docs/UX/Index.md`, `.trae/documents/Index.md`
- Frontmatter fields: `title`, `tags`, `version`, `last_updated`, `source_path`, `status`
- Cross-link docs with wikilinks and embed visuals with `![[path/to/file]]`
- Version changes: update `version` and log in `docs/CHANGELOG.md` with git commit/tag
- Local LLM: install Obsidian AI plugin and run `ollama run tinyllama`, then use Command Palette → ASK LLM

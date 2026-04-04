# schema2md (TypeScript)

Generate Markdown documentation and Mermaid ER diagrams from database schemas.
MVP supports SQLite via `sqlite:///absolute/path.db`.

## Quick Start

- Install deps and build:
  - `npm install`
  - `npm run build`
- Run the CLI:
  - `node dist/cli.js --url "sqlite:///C:/Users/maxen/IdeaProjects/schema2md/examples/shop.sqlite" --output "C:/Users/maxen/IdeaProjects/schema2md/examples/SHOP_TS.md" --title "Shop DB (TS)"`

Optionally, link for a global command:
- `npm link` then run `db-doc --url ... --output ...`

## CLI

- `--url` (required): Database URL (MVP: `sqlite:///absolute/path.db`).
- `--output` (required): Output Markdown file path.
- `--exclude`: Comma-separated table patterns to ignore (e.g., `migrations,temp_*`).
- `--title`: Document title (default: `Database Documentation`).

## Config

Create `.dbdoc.json` at the repo root to persist excludes:

```json
{
  "exclude": ["migrations*", "sqlite_%"]
}
```

CLI `--exclude` merges with config values (deduped).

## Output Structure

- Table index with internal links
- Global ER diagram (Mermaid `erDiagram`)
- Per-table sections: columns table and FK list

## Project Layout

- `src/cli.ts` — Node CLI entry
- `src/extractors/sqliteExtractor.ts` — SQLite metadata
- `src/emitters/*` — Markdown and Mermaid generators
- `src/core/*` — Models and type mapping
- `src/utils/*` — Config + filters

## Requirements

- Node.js 18+

# schema2md-cli

Generate database documentation (Markdown or LaTeX) with an optional ER diagram from your schema.

- TypeScript/Node.js CLI
- Supported sources: SQLite, PostgreSQL, MySQL/MariaDB
- Outputs: Markdown (.md) or LaTeX (.tex), with optional PDF compile
- ER diagram: Mermaid.js → rendered to image and embedded (Markdown/LaTeX)

## Installation

- Requirements: Node.js 18+
- Global install:
  - `npm install -g schema2md-cli`
  - Run: `db-doc --help`
- Without install: `npx schema2md-cli@latest --help`

## CLI

Required:
- `--url` Database URL (sqlite://, postgres://, mysql://)
- `--output` Output path (.md or .tex)

Common:
- `--exclude` Comma-separated glob patterns to ignore tables, e.g. `migrations,temp_*`
- `--title` Document title (default: `Database Documentation`)

Formats:
- `--format md` (default)
- `--format latex`

LaTeX options:
- `--summary` Generate a condensed LaTeX (counts + index + relations). Omit to include full per-table details.
- `--compile` Compile `.tex` into `.pdf` (requires local LaTeX or Docker)
- `--cleanup aux|all` Clean LaTeX aux files; `all` also deletes the `.tex`
- `--docker` Use Docker to compile (when no local LaTeX): recommend `--docker-image blang/latex:ctanfull`
- `--docker-image <image>` LaTeX Docker image (default: `paperist/alpine-texlive` if not set; `blang/latex:ctanfull` is safer)

ER diagram options (Mermaid):
- `--er` / `--no-er` Include/exclude ER diagram in LaTeX (default: include)
- `--diagram-format svg|png|pdf` Render format for ER (default: `png` for LaTeX/pdflatex compatibility)
- `--er-docker-image <image>` Mermaid CLI Docker image (e.g., `minlag/mermaid-cli:latest`)

Notes on Mermaid rendering:
- The CLI first tries Docker (Mermaid CLI). If not available or fails, it falls back to Kroki (https://kroki.io) to render the image. You can disable the fallback by providing an invalid URL via `KROKI_URL` env or removing network access.

## Examples

Project ships with ready SQLite examples:
- `examples/sqlite/shop/`
- `examples/sqlite/university/`
- `examples/sqlite/org/`

Each folder contains:
- `*.sqlite` sample DB
- `*.tex` LaTeX source
- `*.pdf` compiled output
- `*-er.mmd` Mermaid source of the ER diagram
- `*-er.png` rendered ER diagram image

Example command (Shop, LaTeX + PDF + ER diagram via Docker):

```bash
# Windows paths: ensure sqlite URL uses an absolute path
# Use PNG diagram for pdflatex compatibility

db-doc \
  --url "sqlite:///C:/ABS/PATH/examples/sqlite/shop/shop.sqlite" \
  --output "examples/sqlite/shop/shop.tex" \
  --format latex \
  --summary \
  --er --diagram-format png \
  --compile --cleanup aux \
  --docker --docker-image "blang/latex:ctanfull"
```

PostgreSQL example:

```bash
db-doc \
  --url "postgres://user:pass@host:5432/db?schema=public" \
  --output out.tex \
  --format latex \
  --er --diagram-format png \
  --compile --cleanup aux \
  --docker --docker-image "blang/latex:ctanfull"
```

Markdown example (no PDF):

```bash
db-doc --url "sqlite:///C:/ABS/PATH/db.sqlite" --output README.md --format md --exclude "migrations,temp_*"
```

## Configuration (.dbdoc.json)

Place at repo root to persist exclusions and future options:

```json
{
  "exclude": ["migrations*", "sqlite_%"]
}
```

CLI `--exclude` merges with config values (deduped).

## Engine specifics

- SQLite: PRAGMA introspection; no native comments → Description shows `-`.
- PostgreSQL: information_schema + pg_description for comments; select schema via `?schema=`.
- MySQL/MariaDB: information_schema; comments supported when present.

## Troubleshooting


- LaTeX compile errors (fonts/unicode): Prefer the `blang/latex:ctanfull` image or install a full TeX Live/MiKTeX locally. Use `--diagram-format png` for pdflatex.

## Development

```bash
npm install
npm run build
node dist/cli.js --url "sqlite:///C:/ABS/PATH/examples/sqlite/shop/shop.sqlite" \
  --output "examples/sqlite/shop/shop.tex" --format latex --summary --er \
  --diagram-format png --compile --cleanup aux --docker --docker-image blang/latex:ctanfull
```


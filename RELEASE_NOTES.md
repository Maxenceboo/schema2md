# schema2md-cli v0.3.0 — Release Notes

## Highlights
- TypeScript-only CLI
- Sources: SQLite, PostgreSQL, MySQL/MariaDB
- Outputs: Markdown (.md) and LaTeX (.tex) with optional PDF compile (`--compile`)
- ER diagram: Mermaid → image (PNG/SVG/PDF) and embedded in LaTeX/README
- New: `--diagram-only` renders just the ER diagram image
- Examples restructured under `examples/sqlite/{shop,university,org}`

## CLI Flags
- Core: `--url`, `--output`, `--exclude`, `--title`, `--format md|latex`, `--summary`
- LaTeX: `--compile`, `--cleanup aux|all`, `--docker`, `--docker-image`
- ER: `--er/--no-er`, `--diagram-format png|svg|pdf`, `--er-docker-image`, `--diagram-only`

## Quick Start
```bash
# Markdown
db-doc --url "sqlite:///ABS/PATH/db.sqlite" --output README.md --format md --exclude "migrations,temp_*"

# LaTeX + PDF (with ER diagram)
db-doc \
  --url "sqlite:///ABS/PATH/examples/sqlite/shop/shop.sqlite" \
  --output "examples/sqlite/shop/shop.tex" \
  --format latex --summary \
  --er --diagram-format png \
  --compile --cleanup aux \
  --docker --docker-image "blang/latex:ctanfull"

# Diagram only
db-doc \
  --url "sqlite:///ABS/PATH/examples/sqlite/shop/shop.sqlite" \
  --output "examples/sqlite/shop/er.png" \
  --diagram-only --diagram-format png
```

## Examples
- SQLite examples with `.sqlite`, `.tex`, `.pdf`, `.mmd`, `.png` under:
  - `examples/sqlite/shop`
  - `examples/sqlite/university`
  - `examples/sqlite/org`

## Notes
- Mermaid rendering tries Docker CLI first (if `--er-docker-image` provided), then falls back to Kroki for convenience.
- Prefer `--diagram-format png` for `pdflatex` compatibility.
- Node.js >= 18 required.

# PostgreSQL Example

Spin up a local Postgres with the schema and generate docs.

## Start

```bash
docker compose up -d
```

## Generate docs

```bash
db-doc --url "postgres://postgres:postgres@localhost:5432/shop?schema=public" \
       --output "./POSTGRES_SHOP.md" --title "Shop (Postgres)"
```

Stop services when done:

```bash
docker compose down -v
```

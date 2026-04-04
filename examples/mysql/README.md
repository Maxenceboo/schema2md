# MySQL Example

Spin up a local MySQL with the schema and generate docs.

## Start

```bash
docker compose up -d
```

## Generate docs

```bash
db-doc --url "mysql://shop:shop@localhost:3306/shop" \
       --output "./MYSQL_SHOP.md" --title "Shop (MySQL)"
```

Stop services when done:

```bash
docker compose down -v
```

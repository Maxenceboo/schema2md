# schema2md-cli

Génère une documentation Markdown avec diagramme ER (Mermaid) à partir d'un schéma de base de données.

- TypeScript/Node.js uniquement
- Moteurs supportés (MVP+): SQLite, PostgreSQL, MySQL/MariaDB
- Sorties: Markdown + bloc Mermaid `erDiagram`

## Installation

- Requis: Node.js >= 18
- Utilisation directe (sans installer):
  - `npx schema2md-cli@latest --help`
- Installation globale:
  - `npm install -g schema2md-cli`
  - Puis `db-doc --help`

## Utilisation

### LaTeX (résumé ou complet)

- Résumé (counts + index + relations):
  - db-doc --url "sqlite:///C:/.../shop.sqlite" --output "out.tex" --format latex --summary
- Complet (ajoute le détail des colonnes):
  - db-doc --url "postgres://.../dbname?schema=public" --output "out.tex" --format latex

> Compilez le .tex avec votre distribution LaTeX habituelle (pdflatex, xelatex, etc.).

### Markdown

Génère un fichier Markdown depuis l'URL de connexion.

### SQLite

```bash
# Chemin absolu recommandé
db-doc --url "sqlite:///C:/chemin/vers/base.sqlite" --output README.md --title "Ma Base"
```

### PostgreSQL

```bash
# Paramètre optionnel ?schema=public (défaut)
db-doc --url "postgres://user:pass@host:5432/ma_db?schema=public" --output db.md --exclude "migrations,temp_*"
```

### MySQL / MariaDB

```bash
db-doc --url "mysql://user:pass@host:3306/ma_db" --output db.md
```

### Options

- `--url` (requis): URL de la base. Schémas supportés: `sqlite://`, `postgres://`, `mysql://`.
- `--output` (requis): Chemin du fichier Markdown à écrire.
- `--exclude`: Liste de motifs (séparés par des virgules) pour ignorer des tables, ex: `migrations,temp_*`.
- `--title`: Titre du document (défaut: `Database Documentation`).

## Configuration (.dbdoc.json)

Placez un fichier `.dbdoc.json` à la racine du projet pour persister des exclusions:

```json
{
  "exclude": ["migrations*", "sqlite_%"]
}
```

Les motifs du fichier et ceux passés en ligne de commande sont fusionnés (sans doublons). Les wildcards `*` et `?` sont supportées.

## Sortie générée

- Index des tables avec ancres internes
- Diagramme global Mermaid (`erDiagram`)
- Section par table:
  - Tableau des colonnes (type générique lisible, PK/FK, nullabilité, défaut, description)
  - Liste des clés étrangères

Exemple de relations Mermaid: `Users ||--o{ Orders : "fk_orders_user_id_to_users_id"`.

## Notes par moteur

- SQLite: Extraction via PRAGMA; pas de commentaires natifs de colonnes/tables (champs de description resteront `-`).
- PostgreSQL: Utilise `information_schema` + `pg_description` pour commentaires; schéma sélectionné via `?schema=`.
- MySQL/MariaDB: Utilise `information_schema`; commentaires de tables/colonnes si présents.

## Limitations actuelles

- Un seul schéma à la fois pour PostgreSQL (via `?schema=`).
- Composite PK/FK et contraintes uniques non encore détaillés dans le diagramme Mermaid.

## Développement

```bash
npm install
npm run build
node dist/cli.js --url "sqlite:///C:/.../examples/shop.sqlite" --output "examples/SHOP_TS.md"
```

Arborescence:
- `src/cli.ts` — Entrée CLI
- `src/extractors/` — `sqliteExtractor.ts`, `postgresExtractor.ts`, `mysqlExtractor.ts`
- `src/emitters/` — `markdown.ts`, `mermaid.ts`
- `src/core/` — `models.ts`, `typeMapping.ts`
- `src/utils/` — `config.ts`, `filters.ts`

## Publication npm

- Le package est prêt pour `npm publish` (champ `bin` → `db-doc`).
- Un workflow GitHub Actions publie sur npm lors d'une Release:
  - Fichier: `.github/workflows/publish.yml`
  - Ajoutez le secret `NPM_TOKEN` dans le dépôt (Settings → Secrets → Actions).
  - Créez une Release/tag (ex: `v0.3.0`).

Licence: MIT


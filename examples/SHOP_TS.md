# Shop DB (TS)

## Table Index
<a id="table-index"></a>
- [line_items](#table-line-items)
- [orders](#table-orders)
- [users](#table-users)

## Global ER Diagram
```mermaid
erDiagram
    line_items {
        integer id PK
        integer order_id
        string sku
        integer qty
    }
    orders {
        integer id PK
        string user_id
        string placed_at
    }
    users {
        string id PK
        string email
        string created_at
    }
    orders ||--o{ line_items : "fk_line_items_order_id_to_orders_id"
    users ||--o{ orders : "fk_orders_user_id_to_users_id"
```

## Tables

### line_items
<a id="table-line-items"></a>

Columns: 4 / PK: 1 / FKs: 1

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| order_id | `Integer` | FK | No | - | - |
| qty | `Integer` | - | No | - | - |
| sku | `String` | - | No | - | - |

Foreign Keys

- `line_items.order_id` -> `orders.id` (`fk_line_items_order_id_to_orders_id`)

[Back to index](#table-index)

### orders
<a id="table-orders"></a>

Columns: 3 / PK: 1 / FKs: 1

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| placed_at | `String` | - | No | - | - |
| user_id | `String` | FK | No | - | - |

Foreign Keys

- `orders.user_id` -> `users.id` (`fk_orders_user_id_to_users_id`)

[Back to index](#table-index)

### users
<a id="table-users"></a>

Columns: 3 / PK: 1 / FKs: 0

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `String` | PK | Yes | - | - |
| created_at | `String` | - | No | - | - |
| email | `String` | - | No | - | - |

[Back to index](#table-index)

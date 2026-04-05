# Org DB

## Table Index
<a id="table-index"></a>
- [employee_projects](#table-employee-projects)
- [employees](#table-employees)
- [projects](#table-projects)
- [teams](#table-teams)

## Global ER Diagram
```mermaid
erDiagram
    employee_projects {
        integer employee_id PK
        integer project_id PK
        string role
    }
    employees {
        integer id PK
        integer manager_id
        integer team_id
        string email
        string hired_at
    }
    projects {
        integer id PK
        integer team_id
        string code
        string title
    }
    teams {
        integer id PK
        string name
    }
    projects ||--o{ employee_projects : "fk_employee_projects_project_id_to_projects_id"
    employees ||--o{ employee_projects : "fk_employee_projects_employee_id_to_employees_id"
    teams ||--o{ employees : "fk_employees_team_id_to_teams_id"
    employees ||--o{ employees : "fk_employees_manager_id_to_employees_id"
    teams ||--o{ projects : "fk_projects_team_id_to_teams_id"
```

## Tables

### employee_projects
<a id="table-employee-projects"></a>

Columns: 3 / PK: 2 / FKs: 2

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| employee_id | `Integer` | PK/FK | No | - | - |
| project_id | `Integer` | PK/FK | No | - | - |
| role | `String` | - | Yes | - | - |

Foreign Keys

- `employee_projects.project_id` -> `projects.id` (`fk_employee_projects_project_id_to_projects_id`)
- `employee_projects.employee_id` -> `employees.id` (`fk_employee_projects_employee_id_to_employees_id`)

[Back to index](#table-index)

### employees
<a id="table-employees"></a>

Columns: 5 / PK: 1 / FKs: 2

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| email | `String` | - | No | - | - |
| hired_at | `String` | - | No | - | - |
| manager_id | `Integer` | FK | Yes | - | - |
| team_id | `Integer` | FK | Yes | - | - |

Foreign Keys

- `employees.team_id` -> `teams.id` (`fk_employees_team_id_to_teams_id`)
- `employees.manager_id` -> `employees.id` (`fk_employees_manager_id_to_employees_id`)

[Back to index](#table-index)

### projects
<a id="table-projects"></a>

Columns: 4 / PK: 1 / FKs: 1

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| code | `String` | - | No | - | - |
| team_id | `Integer` | FK | No | - | - |
| title | `String` | - | No | - | - |

Foreign Keys

- `projects.team_id` -> `teams.id` (`fk_projects_team_id_to_teams_id`)

[Back to index](#table-index)

### teams
<a id="table-teams"></a>

Columns: 2 / PK: 1 / FKs: 0

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| name | `String` | - | No | - | - |

[Back to index](#table-index)

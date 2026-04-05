# University DB

## Table Index
<a id="table-index"></a>
- [course_instructors](#table-course-instructors)
- [courses](#table-courses)
- [departments](#table-departments)
- [enrollments](#table-enrollments)
- [instructors](#table-instructors)
- [students](#table-students)

## Global ER Diagram
```mermaid
erDiagram
    course_instructors {
        integer course_id PK
        integer instructor_id PK
    }
    courses {
        integer id PK
        integer department_id
        string code
        string title
    }
    departments {
        integer id PK
        string name
    }
    enrollments {
        integer student_id PK
        integer course_id PK
        string enrolled_on
        string grade
    }
    instructors {
        integer id PK
        integer department_id
        string email
        string hired_at
    }
    students {
        integer id PK
        integer department_id
        string email
        string enrolled_at
    }
    instructors ||--o{ course_instructors : "fk_course_instructors_instructor_id_to_instructors_id"
    courses ||--o{ course_instructors : "fk_course_instructors_course_id_to_courses_id"
    departments ||--o{ courses : "fk_courses_department_id_to_departments_id"
    courses ||--o{ enrollments : "fk_enrollments_course_id_to_courses_id"
    students ||--o{ enrollments : "fk_enrollments_student_id_to_students_id"
    departments ||--o{ instructors : "fk_instructors_department_id_to_departments_id"
    departments ||--o{ students : "fk_students_department_id_to_departments_id"
```

## Tables

### course_instructors
<a id="table-course-instructors"></a>

Columns: 2 / PK: 2 / FKs: 2

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| course_id | `Integer` | PK/FK | No | - | - |
| instructor_id | `Integer` | PK/FK | No | - | - |

Foreign Keys

- `course_instructors.instructor_id` -> `instructors.id` (`fk_course_instructors_instructor_id_to_instructors_id`)
- `course_instructors.course_id` -> `courses.id` (`fk_course_instructors_course_id_to_courses_id`)

[Back to index](#table-index)

### courses
<a id="table-courses"></a>

Columns: 4 / PK: 1 / FKs: 1

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| code | `String` | - | No | - | - |
| department_id | `Integer` | FK | No | - | - |
| title | `String` | - | No | - | - |

Foreign Keys

- `courses.department_id` -> `departments.id` (`fk_courses_department_id_to_departments_id`)

[Back to index](#table-index)

### departments
<a id="table-departments"></a>

Columns: 2 / PK: 1 / FKs: 0

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| name | `String` | - | No | - | - |

[Back to index](#table-index)

### enrollments
<a id="table-enrollments"></a>

Columns: 4 / PK: 2 / FKs: 2

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| course_id | `Integer` | PK/FK | No | - | - |
| student_id | `Integer` | PK/FK | No | - | - |
| enrolled_on | `String` | - | No | - | - |
| grade | `String` | - | Yes | - | - |

Foreign Keys

- `enrollments.course_id` -> `courses.id` (`fk_enrollments_course_id_to_courses_id`)
- `enrollments.student_id` -> `students.id` (`fk_enrollments_student_id_to_students_id`)

[Back to index](#table-index)

### instructors
<a id="table-instructors"></a>

Columns: 4 / PK: 1 / FKs: 1

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| department_id | `Integer` | FK | No | - | - |
| email | `String` | - | No | - | - |
| hired_at | `String` | - | No | - | - |

Foreign Keys

- `instructors.department_id` -> `departments.id` (`fk_instructors_department_id_to_departments_id`)

[Back to index](#table-index)

### students
<a id="table-students"></a>

Columns: 4 / PK: 1 / FKs: 1

| Column | Type | Attr | Null | Default | Description |
|---|---|---|---|---|---|
| id | `Integer` | PK | Yes | - | - |
| department_id | `Integer` | FK | No | - | - |
| email | `String` | - | No | - | - |
| enrolled_at | `String` | - | No | - | - |

Foreign Keys

- `students.department_id` -> `departments.id` (`fk_students_department_id_to_departments_id`)

[Back to index](#table-index)

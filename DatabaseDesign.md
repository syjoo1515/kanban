# Database Design — Kanban Board

## 1. 현황 및 전환 계획

| 단계 | 저장소 | 비고 |
|------|--------|------|
| 현재 (v1) | localStorage (JSON) | 브라우저 로컬, 서버 없음 |
| 향후 (v2) | MySQL (RDB) | REST API 서버 연동 |

---

## 2. ERD (v2 — MySQL 연동 기준)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    boards    │       │      cards       │       │   columns    │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ board_id (FK)    │       │ id (PK)      │
│ name         │       │ id (PK)          │──────►│ board_id(FK) │
│ created_at   │       │ column_id (FK)   │       │ name         │
│ updated_at   │       │ title            │       │ position     │
└──────────────┘       │ description      │       │ created_at   │
                       │ position         │       │ updated_at   │
                       │ created_at       │       └──────────────┘
                       │ updated_at       │
                       └──────────────────┘
```

> MVP에서는 `boards` 테이블 없이 단일 보드로 시작할 수 있음.

---

## 3. 테이블 정의

### 3.1 `boards` — 보드

```sql
CREATE TABLE boards (
  id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)     NOT NULL,
  created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 `columns` — 컬럼

```sql
CREATE TABLE columns (
  id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  board_id   BIGINT UNSIGNED  NOT NULL,
  name       VARCHAR(50)      NOT NULL,
  position   TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 0: TO-DO, 1: In-Progress, 2: Done
  created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

초기 데이터:

```sql
INSERT INTO boards (name) VALUES ('My Board');

INSERT INTO columns (board_id, name, position) VALUES
  (1, 'TO-DO',       0),
  (1, 'In-Progress', 1),
  (1, 'Done',        2);
```

### 3.3 `cards` — 카드

```sql
CREATE TABLE cards (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  board_id    BIGINT UNSIGNED NOT NULL,
  column_id   BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(255)    NOT NULL,
  description TEXT,
  position    INT UNSIGNED    NOT NULL DEFAULT 0, -- 컬럼 내 순서
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (board_id)  REFERENCES boards(id)  ON DELETE CASCADE,
  FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
  INDEX idx_board_column (board_id, column_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. localStorage → MySQL 매핑

| localStorage 필드 | MySQL 컬럼 |
|-------------------|------------|
| `id` (timestamp string) | `cards.id` (AUTO_INCREMENT) |
| `text` | `cards.title` |
| `column` ('todo' \| 'inprogress' \| 'done') | `cards.column_id` (FK → columns.id) |
| — | `cards.position` (순서) |
| — | `cards.description` (상세 설명, 향후 사용) |

---

## 5. 예상 API 엔드포인트 (v2)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/boards/:boardId/cards` | 보드의 전체 카드 조회 |
| POST | `/api/boards/:boardId/cards` | 카드 생성 |
| PATCH | `/api/cards/:cardId` | 카드 수정 (컬럼 이동, 텍스트 수정) |
| DELETE | `/api/cards/:cardId` | 카드 삭제 |

---

## 6. 인덱스 전략

| 테이블 | 인덱스 | 목적 |
|--------|--------|------|
| cards | `(board_id, column_id)` | 보드별 컬럼 카드 조회 성능 |
| columns | `(board_id, position)` | 컬럼 순서 정렬 |

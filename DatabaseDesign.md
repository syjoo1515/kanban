# Database Design — Kanban Board

## 1. 현황

| 항목 | 내용 |
|------|------|
| DB | Supabase (PostgreSQL) |
| 인증 | Supabase Auth (Email / Google / GitHub) |
| 데이터 격리 | Row Level Security (RLS) |
| 버전 | v3 (팀 공유 + 수정 이력) |

---

## 2. ERD

```
┌──────────────────┐
│   auth.users     │  ← Supabase Auth 관리
├──────────────────┤
│ id (uuid, PK)    │
│ email            │
└──┬───────────────┘
   │ 1
   ├─────────────────────────────────────┐
   │ N                                   │ N
┌──▼───────────────┐       ┌─────────────▼──────┐
│     boards       │       │   board_members    │
├──────────────────┤       ├────────────────────┤
│ id (uuid, PK)    │◄──────│ board_id (FK)      │
│ owner_id (FK)    │       │ user_id (FK)        │
│ name             │       │ joined_at           │
│ share_code       │       └────────────────────┘
│ created_at       │
└──┬───────────────┘
   │ 1
   ├──────────────────────────────────────┐
   │ N                                    │ N
┌──▼───────────────┐       ┌──────────────▼─────┐
│      cards       │       │   card_history     │
├──────────────────┤       ├────────────────────┤
│ id (uuid, PK)    │       │ id (uuid, PK)      │
│ board_id (FK)    │       │ board_id (FK)      │
│ user_id (FK)     │       │ card_id            │
│ title            │       │ user_id (FK)       │
│ "column"         │       │ user_email         │
│ position         │       │ action             │
│ created_at       │       │ card_title         │
└──────────────────┘       │ from_column        │
                           │ to_column          │
                           │ created_at         │
                           └────────────────────┘
```

---

## 3. 테이블 생성 순서

외래키 참조 관계로 인해 반드시 아래 순서대로 생성해야 합니다.

```
auth.users (Supabase 자동 제공, 생성 불필요)
    │
    ▼
① boards          (owner_id → auth.users)
    │
    ▼
② board_members   (board_id → boards, user_id → auth.users)
    │
    ▼
③ cards           (board_id → boards, user_id → auth.users)
    │
    ▼
④ card_history    (board_id → boards, user_id → auth.users)
```

---

## 4. 테이블 정의

> **주의**: 개별 SQL을 순서대로 실행할 경우, `boards` RLS 정책은 `board_members` 테이블이 생성된 이후에 실행해야 합니다. **섹션 6의 전체 실행 SQL 사용을 권장합니다.**

### ① `boards` — 보드

```sql
create table boards (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users(id) on delete cascade not null,
  name       text not null default 'My Board',
  share_code text unique not null default upper(substring(replace(gen_random_uuid()::text,'-',''),1,6)),
  created_at timestamptz default now()
);

alter table boards enable row level security;

-- 공유코드로 참여 시도 시 조회 가능하도록 인증된 사용자 전체 읽기 허용
-- (cards/card_history는 별도 RLS로 board_id 기반 격리됨)
create policy "board members can read"
  on boards for select using (
    auth.uid() = owner_id
    or exists (select 1 from board_members where board_id = boards.id and user_id = auth.uid())
    or auth.role() = 'authenticated'
  );

create policy "owner can update"
  on boards for update using (auth.uid() = owner_id);

create policy "owner can insert"
  on boards for insert with check (auth.uid() = owner_id);
```

### ② `board_members` — 보드 멤버

```sql
create table board_members (
  id        uuid primary key default gen_random_uuid(),
  board_id  uuid references boards(id) on delete cascade not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (board_id, user_id)
);

alter table board_members enable row level security;

create policy "members can read own membership"
  on board_members for select using (auth.uid() = user_id);

create policy "anyone can join"
  on board_members for insert with check (auth.uid() = user_id);

create policy "owner can remove members"
  on board_members for delete using (
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
    or auth.uid() = user_id
  );
```

### ③ `cards` — 카드

```sql
drop table if exists cards cascade;

create table cards (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid references boards(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete set null,
  title      text not null,
  "column"   text not null check ("column" in ('todo','inprogress','done')),
  position   int not null default 0,
  created_at timestamptz default now()
);

alter table cards enable row level security;

create policy "board members can manage cards"
  on cards for all using (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = cards.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  ) with check (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = cards.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  );
```

### ④ `card_history` — 수정 이력

```sql
create table card_history (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid references boards(id) on delete cascade not null,
  card_id     uuid,
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text,
  action      text not null check (action in ('created','moved','deleted')),
  card_title  text,
  from_column text,
  to_column   text,
  created_at  timestamptz default now()
);

alter table card_history enable row level security;

create policy "board members can read history"
  on card_history for select using (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = card_history.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  );

create policy "board members can insert history"
  on card_history for insert with check (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = card_history.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  );
```

---

## 5. 테이블 정의서

### ① `boards`

| 컬럼 | 타입 | NOT NULL | 기본값 | 설명 |
|------|------|:--------:|--------|------|
| `id` | uuid | ✓ | `gen_random_uuid()` | PK |
| `owner_id` | uuid | ✓ | — | FK → auth.users(id), 보드 소유자 |
| `name` | text | ✓ | `'My Board'` | 보드 이름 |
| `share_code` | text | ✓ | 6자리 대문자 자동생성 | 팀 공유용 고유 코드 (UNIQUE) |
| `max_members` | int | ✓ | `10` | 최대 참여 인원 |
| `created_at` | timestamptz | — | `now()` | 생성 시각 |

---

### ② `board_members`

| 컬럼 | 타입 | NOT NULL | 기본값 | 설명 |
|------|------|:--------:|--------|------|
| `id` | uuid | ✓ | `gen_random_uuid()` | PK |
| `board_id` | uuid | ✓ | — | FK → boards(id) |
| `user_id` | uuid | ✓ | — | FK → auth.users(id) |
| `joined_at` | timestamptz | — | `now()` | 참여 시각 |

> `(board_id, user_id)` UNIQUE 제약으로 중복 참여 방지

---

### ③ `cards`

| 컬럼 | 타입 | NOT NULL | 기본값 | 설명 |
|------|------|:--------:|--------|------|
| `id` | uuid | ✓ | `gen_random_uuid()` | PK |
| `board_id` | uuid | ✓ | — | FK → boards(id), 소속 보드 |
| `user_id` | uuid | — | — | FK → auth.users(id), 카드 생성자 (삭제 시 NULL) |
| `title` | text | ✓ | — | 카드 텍스트 |
| `"column"` | text | ✓ | — | `todo` \| `inprogress` \| `done` (예약어라 따옴표 필수) |
| `position` | int | ✓ | `0` | 컬럼 내 정렬 순서 (향후 사용) |
| `created_at` | timestamptz | — | `now()` | 생성 시각 |

---

### ④ `card_history`

| 컬럼 | 타입 | NOT NULL | 기본값 | 설명 |
|------|------|:--------:|--------|------|
| `id` | uuid | ✓ | `gen_random_uuid()` | PK |
| `board_id` | uuid | ✓ | — | FK → boards(id) |
| `card_id` | uuid | — | — | 대상 카드 id (삭제된 카드도 보존) |
| `user_id` | uuid | — | — | FK → auth.users(id), 수정자 (탈퇴 시 NULL) |
| `user_email` | text | — | — | 수정자 이메일 (탈퇴 후에도 이력 보존용) |
| `action` | text | ✓ | — | `created` \| `moved` \| `deleted` |
| `card_title` | text | — | — | 카드 제목 스냅샷 |
| `from_column` | text | — | — | 이동 전 컬럼 (`moved`, `deleted` 시 기록) |
| `to_column` | text | — | — | 이동 후 컬럼 (`created`, `moved` 시 기록) |
| `created_at` | timestamptz | — | `now()` | 이력 기록 시각 |

---

## 6. 전체 실행 SQL (Supabase SQL Editor에 한 번에 실행)

> **테이블 생성 → RLS 활성화 → 정책 추가** 순서로 구성되어 있습니다.
> `boards` RLS 정책이 `board_members`를 참조하므로, 모든 테이블을 먼저 생성한 뒤 정책을 추가해야 합니다.

```sql
-- ================================================================
-- STEP 1. 테이블 생성 (의존 순서: boards → board_members → cards → card_history)
-- ================================================================

-- ① boards
create table boards (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null default 'My Board',
  share_code  text unique not null default upper(substring(replace(gen_random_uuid()::text,'-',''),1,6)),
  max_members int not null default 10,
  created_at  timestamptz default now()
);

-- ② board_members
create table board_members (
  id        uuid primary key default gen_random_uuid(),
  board_id  uuid references boards(id) on delete cascade not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (board_id, user_id)
);

-- ③ cards (기존 테이블 삭제 후 재생성)
drop table if exists cards cascade;
create table cards (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid references boards(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete set null,
  title      text not null,
  "column"   text not null check ("column" in ('todo','inprogress','done')),
  position   int not null default 0,
  created_at timestamptz default now()
);

-- ④ card_history
create table card_history (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid references boards(id) on delete cascade not null,
  card_id     uuid,
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text,
  action      text not null check (action in ('created','moved','deleted')),
  card_title  text,
  from_column text,
  to_column   text,
  created_at  timestamptz default now()
);

-- ================================================================
-- STEP 2. RLS 활성화
-- ================================================================

alter table boards       enable row level security;
alter table board_members enable row level security;
alter table cards         enable row level security;
alter table card_history  enable row level security;

-- ================================================================
-- STEP 3. RLS 정책 추가 (모든 테이블이 존재한 후 실행)
-- ================================================================

-- boards 정책 (board_members 참조 → STEP 2 이후에만 가능)
-- share_code 조회(참여 시도)도 허용하기 위해 인증된 사용자 전체 읽기 허용
-- 단, cards/card_history는 별도 RLS로 board_id 기반 격리됨
create policy "board members can read"
  on boards for select using (
    auth.uid() = owner_id
    or exists (select 1 from board_members where board_id = boards.id and user_id = auth.uid())
    or auth.role() = 'authenticated'
  );
create policy "owner can insert"
  on boards for insert with check (auth.uid() = owner_id);
create policy "owner can update"
  on boards for update using (auth.uid() = owner_id);

-- board_members 정책
create policy "members can read own membership"
  on board_members for select using (auth.uid() = user_id);
create policy "anyone can join"
  on board_members for insert with check (auth.uid() = user_id);
create policy "owner can remove members"
  on board_members for delete using (
    exists (select 1 from boards where id = board_id and owner_id = auth.uid())
    or auth.uid() = user_id
  );

-- cards 정책
create policy "board members can manage cards"
  on cards for all
  using (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = cards.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = cards.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  );

-- card_history 정책
create policy "board members can read history"
  on card_history for select using (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = card_history.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  );
create policy "board members can insert history"
  on card_history for insert with check (
    exists (
      select 1 from boards b
      left join board_members bm on bm.board_id = b.id
      where b.id = card_history.board_id
        and (b.owner_id = auth.uid() or bm.user_id = auth.uid())
    )
  );
```

---

## 7. Supabase Realtime 설정

Supabase Dashboard → **Database → Replication** → `cards` 테이블 토글 ON

팀원이 카드를 변경하면 다른 멤버 화면에 자동 반영됩니다.

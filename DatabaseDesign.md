# Database Design — Kanban Board

## 1. 현황

| 항목 | 내용 |
|------|------|
| DB | Supabase (PostgreSQL) |
| 인증 | Supabase Auth (Email / Google / GitHub) |
| 데이터 격리 | Row Level Security (RLS) |
| 버전 | v2 (현재 운영 중) |

> v1(localStorage) 단계는 완료되어 Supabase DB로 전환되었습니다.

---

## 2. ERD

```
┌──────────────────┐
│   auth.users     │  ← Supabase Auth 관리 (직접 수정 불가)
├──────────────────┤
│ id (uuid, PK)    │
│ email            │
│ ...              │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐
│      cards       │
├──────────────────┤
│ id (uuid, PK)    │
│ user_id (FK)     │
│ title            │
│ column           │
│ position         │
│ created_at       │
└──────────────────┘
```

---

## 3. 테이블 정의

### `cards` — 카드

```sql
create table cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  column     text not null check (column in ('todo','inprogress','done')),
  position   int not null default 0,
  created_at timestamptz default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 자동 생성 PK |
| `user_id` | uuid | 카드 소유자 (auth.users FK) |
| `title` | text | 카드 텍스트 |
| `column` | text | `todo` \| `inprogress` \| `done` |
| `position` | int | 컬럼 내 순서 (향후 정렬 사용) |
| `created_at` | timestamptz | 생성 시각 |

---

## 4. Row Level Security (RLS)

```sql
alter table cards enable row level security;

create policy "users can manage own cards"
  on cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- 모든 읽기/쓰기/수정/삭제에 적용
- `auth.uid()`와 `user_id`가 일치하는 행만 접근 가능
- 다른 사용자의 카드는 DB 레벨에서 차단

---

## 5. 인증 구조

| 방법 | 처리 주체 | 비고 |
|------|----------|------|
| 이메일/비밀번호 | Supabase Auth | 이메일 확인 필요 |
| Google OAuth | Supabase Auth + Google Cloud | Client ID/Secret 등록 필요 |
| GitHub OAuth | Supabase Auth + GitHub OAuth App | Client ID/Secret 등록 필요 |

---

## 6. Supabase API 사용 패턴

| 작업 | API 호출 |
|------|---------|
| 카드 조회 | `supabase.from('cards').select('*').eq('user_id', uid).order('created_at')` |
| 카드 생성 | `supabase.from('cards').insert({ title, column, user_id })` |
| 카드 이동 | `supabase.from('cards').update({ column }).eq('id', id)` |
| 카드 삭제 | `supabase.from('cards').delete().eq('id', id)` |

---

## 7. 향후 확장 계획

| 기능 | 변경 내용 |
|------|----------|
| 다중 보드 | `boards` 테이블 추가, cards에 `board_id` FK 추가 |
| 카드 상세 | cards에 `description`, `due_date`, `assignee` 컬럼 추가 |
| 실시간 협업 | Supabase Realtime 채널 구독 추가 |
| 팀 공유 | `teams`, `team_members` 테이블 추가 및 RLS 정책 확장 |

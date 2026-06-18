# TRD — Technical Requirements Document

## 1. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 마크업 | HTML5 |
| 스타일 | CSS3 (Flexbox) |
| 로직 | Vanilla JavaScript (ES6+ ESM) |
| 인증 | Supabase Auth (Email / Google OAuth / GitHub OAuth) |
| DB | Supabase (PostgreSQL) |
| 호스팅 | GitHub Pages |

---

## 2. 파일 구조

```
kanban/
├── index.html        # 로그인 화면 + 보드 화면 (섹션 전환)
├── style.css         # 레이아웃, 인증 UI, 반응형 스타일
├── app.js            # 인증 흐름, DB 연동, 렌더링, DnD
├── supabase.js       # Supabase 클라이언트 초기화 (KEY 설정)
├── plan.md
├── PRD.md
├── TRD.md
├── UserFlow.md
├── DatabaseDesign.md
├── DesignSystem.md
└── TASKS.md
```

---

## 3. 아키텍처

```
[로그인 화면]
     │ Google / GitHub / 이메일 인증
     ▼
[Supabase Auth]
     │ onAuthStateChange → 세션 확인
     ▼
[보드 화면]
     │
     ├─ loadCards() → supabase.from('cards').select()
     ├─ addCard()   → supabase.from('cards').insert()
     ├─ moveCard()  → supabase.from('cards').update()
     └─ deleteCard()→ supabase.from('cards').delete()
           │
           ▼
     [renderBoard() → DOM 재생성]
```

---

## 4. 인증 흐름

| 방법 | Supabase API |
|------|-------------|
| 이메일 로그인 | `supabase.auth.signInWithPassword({ email, password })` |
| 이메일 회원가입 | `supabase.auth.signUp({ email, password })` |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| GitHub OAuth | `supabase.auth.signInWithOAuth({ provider: 'github' })` |
| 로그아웃 | `supabase.auth.signOut()` |
| 세션 감지 | `supabase.auth.onAuthStateChange(callback)` |

---

## 5. 데이터 모델

```js
// Supabase cards 테이블 레코드
{
  id:         string,   // UUID (Supabase 자동 생성)
  user_id:    string,   // auth.users.id (RLS 기준)
  title:      string,   // 카드 텍스트
  column:     string,   // 'todo' | 'inprogress' | 'done'
  position:   number,   // 컬럼 내 순서 (향후 사용)
  created_at: string    // timestamptz
}
```

---

## 6. Supabase DB 스키마

```sql
create table cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  column     text not null check (column in ('todo','inprogress','done')),
  position   int not null default 0,
  created_at timestamptz default now()
);

alter table cards enable row level security;

create policy "users can manage own cards"
  on cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## 7. Drag and Drop 구현

HTML5 네이티브 Drag and Drop API 사용.

| 이벤트 | 대상 | 처리 |
|--------|------|------|
| `dragstart` | 카드 | `dataTransfer.setData('text/plain', card.id)` |
| `dragover` | 컬럼 | `e.preventDefault()` — 드롭 허용 |
| `dragenter` | 컬럼 | `drag-over` 클래스 추가 (하이라이트) |
| `dragleave` | 컬럼 | `drag-over` 클래스 제거 |
| `drop` | 컬럼 | 카드 id로 `moveCard()` 호출 → Supabase update → 재렌더링 |

---

## 8. Supabase 클라이언트 설정 (`supabase.js`)

```js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

> `supabase.js`의 두 상수는 사용자가 직접 발급한 값으로 교체해야 한다.

---

## 9. 브라우저 호환성

- ES Modules (`type="module"`): Chrome 61+, Firefox 60+, Edge 16+
- HTML5 Drag and Drop API: Chrome 4+, Firefox 3.5+, Edge 12+
- Supabase JS v2: 모든 현대 브라우저 지원

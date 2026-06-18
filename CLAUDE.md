# CLAUDE.md — Kanban Board 작업 규칙

## 1. 필수 작업 규칙

### workflow.md 갱신
- **모든 작업 완료 후 반드시 `workflow.md`를 갱신한다.**
- 형식:
  - **프롬프트**: 사용자 입력 원문 그대로 기록
  - **작업**: 수행한 내용을 항목별로 요약
  - 날짜 섹션(`## YYYY-MM-DD`) 하위에 순번으로 추가

### TASKS.md 갱신
- 작업이 완료될 때마다 `TASKS.md`의 해당 항목을 `[x]`로 체크한다.

### 문서 동기화
- 코드나 문서 변경 시 아래 두 경로를 항상 동일하게 유지한다.
  - `/home/ubuntu/work/kanban/` (개인 저장소)
  - `/home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/syjoo1515/day03/kanban/` (공동 저장소)

### 커밋 및 푸시
- 커밋 전 사용자 확인을 받는다.
- `git rebase`는 사용하지 않는다. pull 시 merge 방식만 사용한다.
- 두 저장소(`syjoo1515/kanban`, `weable-kosa/kosa-vibecoding-2026-3rd`) 모두 push한다.

---

## 2. 저장소 정보

| 구분 | 경로 |
|------|------|
| 개인 저장소 remote | `git@github.com:syjoo1515/kanban.git` |
| 공동 저장소 remote | `git@github.com:weable-kosa/kosa-vibecoding-2026-3rd.git` |
| 개인 저장소 로컬 | `/home/ubuntu/work/kanban/` |
| 공동 저장소 로컬 | `/home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/syjoo1515/day03/kanban/` |
| 배포 URL | `https://syjoo1515.github.io/kanban` |

---

## 3. 프로젝트 파일 구조

```
kanban/
├── index.html        # 로그인 화면(#auth-screen) + 보드 화면(#board-screen)
├── style.css         # 전체 스타일 (인증 UI + 보드 UI + 반응형)
├── app.js            # Supabase 인증 + DB 연동 + DnD 로직
├── supabase.js       # Supabase 클라이언트 초기화
├── CLAUDE.md         # 작업 규칙 (현재 파일)
├── workflow.md       # 작업 이력 (프롬프트 + 작업 요약)
├── TASKS.md          # 체크리스트
├── SETTING.md        # Supabase 설정 가이드
├── PRD.md            # 제품 요구사항
├── TRD.md            # 기술 요구사항
├── UserFlow.md       # 사용자 흐름
├── DatabaseDesign.md # DB 설계 (Supabase PostgreSQL)
├── DesignSystem.md   # 디자인 시스템
└── plan.md           # 초기 구현 계획 (v1 기준)
```

---

## 4. 기술 스택

| 항목 | 내용 |
|------|------|
| 마크업 | HTML5 |
| 스타일 | CSS3 (Flexbox, 반응형 미디어쿼리) |
| 로직 | Vanilla JS (ES Modules, `type="module"`) |
| 인증 | Supabase Auth (Email / Google OAuth / GitHub OAuth) |
| DB | Supabase PostgreSQL (RLS 적용) |
| 배포 | GitHub Pages (정적 호스팅) |
| Supabase SDK | CDN `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm` |

---

## 5. Supabase 연동 정보

| 항목 | 값 |
|------|----|
| Project URL | `https://ztoxcwkonwdmxmeiieyb.supabase.co` |
| ANON KEY 위치 | `supabase.js` |
| cards 테이블 | `id(uuid)`, `user_id(uuid)`, `title(text)`, `column(text)`, `position(int)`, `created_at(timestamptz)` |
| column 허용값 | `'todo'`, `'inprogress'`, `'done'` |
| RLS 정책 | `auth.uid() = user_id` (본인 카드만 접근 가능) |

---

## 6. 핵심 함수 목록 (app.js)

| 함수 | 역할 |
|------|------|
| `showAuth()` / `showBoard()` | 화면 전환 (`.hidden` 클래스 토글) |
| `showError(msg)` / `clearError()` | 에러 메시지 표시/숨김 |
| `getCurrentUser()` | 현재 세션 유저 반환 |
| `loadCards()` | Supabase에서 카드 로드 후 렌더링 |
| `addCard(title, column)` | 카드 생성 (DB insert + 로컬 배열 추가) |
| `deleteCard(id)` | 카드 삭제 (DB delete + 로컬 배열 제거) |
| `moveCard(id, targetColumn)` | 카드 이동 (DB update + 로컬 변경) |
| `renderBoard()` | 전체 보드 DOM 재렌더링 |
| `createCardEl(card)` | 카드 DOM 요소 생성 및 이벤트 바인딩 |

---

## 7. 주요 DOM 구조

| ID / 클래스 | 설명 |
|------------|------|
| `#auth-screen` | 로그인 화면 섹션 |
| `#board-screen` | 보드 화면 섹션 (기본 `.hidden`) |
| `#btn-google` / `#btn-github` | 소셜 로그인 버튼 |
| `#btn-login` / `#btn-signup` | 이메일 로그인/회원가입 버튼 |
| `#btn-logout` | 로그아웃 버튼 |
| `#auth-error` | 인증 에러 메시지 표시 영역 |
| `#user-email` | 헤더 유저 이메일 표시 |
| `.column[data-column]` | 컬럼 (`todo` / `inprogress` / `done`) |
| `#list-{col}` | 컬럼별 카드 목록 `<ul>` |
| `#badge-{col}` | 컬럼별 카드 수 배지 |
| `.card-input[data-column]` | 카드 추가 입력창 |
| `.add-btn[data-column]` | 카드 추가 버튼 |

---

## 8. 알려진 이슈 / 주의사항

| 이슈 | 내용 |
|------|------|
| 이메일 확인 404 | Supabase Site URL 설정 필요. Authentication → URL Configuration → Site URL을 `https://syjoo1515.github.io/kanban`으로 설정 |
| 소셜 계정 중복 가입 | `signUp` 시 `identities` 배열이 비어있으면 중복 안내 메시지 표시 (app.js:70) |
| ES Module 제약 | `<script type="module">`로 로드하므로 로컬 파일(`file://`) 직접 열기 불가. 반드시 HTTP 서버 경유 |
| Supabase CDN | 외부 CDN 의존성 있음. 네트워크 없는 환경에서는 동작 불가 |

---

## 9. 반응형 브레이크포인트

| 구간 | 레이아웃 |
|------|---------|
| `> 1024px` | 3컬럼 수평 (300px 고정) |
| `≤ 1024px` | 2컬럼 flex-wrap |
| `≤ 640px` | 1컬럼 수직 스택, 삭제 버튼 항상 표시 |

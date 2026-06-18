# TASKS — Kanban Board

## 진행 상태 범례
- [ ] 미완료
- [x] 완료
- [~] 진행 중

---

## Phase 1: 문서화

- [x] plan.md 작성
- [x] PRD.md 작성
- [x] TRD.md 작성
- [x] UserFlow.md 작성
- [x] DatabaseDesign.md 작성
- [x] DesignSystem.md 작성
- [x] TASKS.md 작성
- [x] SETTING.md 작성 (Supabase 설정 가이드)

---

## Phase 2: 마크업 (index.html)

- [x] HTML 기본 구조 (`<!DOCTYPE html>`, `<head>`, `<body>`)
- [x] CSS/JS 파일 연결 (`<link>`, `<script type="module">`)
- [x] 보드 컨테이너 (`#board`) 생성
- [x] TO-DO 컬럼 섹션 생성 (`data-column="todo"`)
- [x] In-Progress 컬럼 섹션 생성 (`data-column="inprogress"`)
- [x] Done 컬럼 섹션 생성 (`data-column="done"`)
- [x] 각 컬럼 헤더 (제목 + 카드 수 배지)
- [x] 각 컬럼 카드 목록 영역 (`.card-list`)
- [x] 각 컬럼 카드 추가 폼 (input + 버튼)
- [x] 로그인 화면 (`#auth-screen`) — 이메일 폼 + 소셜 버튼
- [x] 보드 화면 (`#board-screen`) — 헤더에 유저 이메일 + 로그아웃 버튼

---

## Phase 3: 스타일 (style.css)

- [x] CSS 변수 (`--color-*`, `--space-*`) 정의
- [x] 전역 리셋 및 기본 스타일
- [x] 보드 레이아웃 (flexbox 3컬럼)
- [x] 컬럼 스타일 (배경, 테두리, 둥근 모서리)
- [x] 컬럼 헤더 액센트 색상 (TO-DO / In-Progress / Done)
- [x] 카드 스타일 (배경, 그림자, 패딩)
- [x] 카드 hover 효과 (그림자 강조, 삭제 버튼 표시)
- [x] 드래그 중 카드 스타일 (`.dragging` 클래스, opacity)
- [x] 드롭 영역 하이라이트 (`.drag-over` 클래스)
- [x] 카드 추가 폼 스타일 (input, 버튼)
- [x] 삭제 버튼 스타일
- [x] 반응형 레이아웃 (태블릿 2컬럼, 모바일 1컬럼)
- [x] 로그인 화면 스타일 (auth-card, 소셜 버튼, 에러 메시지)
- [x] 로그아웃 버튼 및 헤더 유저 정보 스타일

---

## Phase 4: 로직 (app.js + supabase.js)

- [x] `supabase.js` — Supabase 클라이언트 초기화
- [x] `initAuth()` — 세션 확인 및 화면 전환
- [x] 이메일 로그인 (`signInWithPassword`)
- [x] 이메일 회원가입 (`signUp`)
- [x] 소셜 계정 중복 이메일 회원가입 시 안내 메시지 표시
- [x] Google OAuth 로그인 (`signInWithOAuth`, async/await + 에러 처리)
- [x] GitHub OAuth 로그인 (`signInWithOAuth`, async/await + 에러 처리)
- [x] 로그아웃 (`signOut`)
- [x] `loadCards()` — Supabase DB에서 카드 로드
- [x] `addCard()` — Supabase DB에 카드 추가
- [x] `deleteCard()` — Supabase DB에서 카드 삭제
- [x] `moveCard()` — Supabase DB에서 카드 컬럼 업데이트
- [x] `renderBoard()` — 전체 보드 DOM 재렌더링
- [x] 카드 추가 이벤트 핸들러 (버튼 클릭, Enter 키)
- [x] 카드 삭제 이벤트 핸들러 (× 버튼)
- [x] Drag and Drop 핸들러 (`dragstart` / `dragover` / `dragenter` / `dragleave` / `drop`)

---

## Phase 5: Supabase 설정 (사용자 직접 수행)

- [x] Supabase 프로젝트 생성 및 URL / ANON KEY 발급
- [x] `supabase.js`에 URL과 KEY 입력
- [x] SQL Editor에서 cards 테이블 + RLS 정책 실행
- [x] Authentication → Providers에서 Google OAuth 활성화
- [x] Authentication → Providers에서 GitHub OAuth 활성화
- [x] Authentication → URL Configuration에 Site URL 및 Redirect URL 추가

---

## Phase 6: 검증

- [x] 이메일 회원가입 → 확인 메일 수신 확인
- [ ] 이메일 로그인 → 보드 화면 진입 확인 (이메일 확인 404 이슈 해결 중)
- [ ] Google 소셜 로그인 → 보드 화면 진입 확인
- [ ] GitHub 소셜 로그인 → 보드 화면 진입 확인
- [ ] 카드 추가 후 Supabase Table Editor에서 데이터 확인
- [ ] 카드 이동 후 DB column 값 변경 확인
- [ ] 카드 삭제 후 DB 레코드 삭제 확인
- [ ] 로그아웃 → 로그인 화면 복귀 확인
- [ ] 다른 브라우저에서 같은 계정 로그인 → 동일 카드 표시 확인

---

## Phase 7: 배포

- [x] GitHub Pages 배포 확인 (`https://syjoo1515.github.io/kanban`)
- [x] Supabase Redirect URL에 GitHub Pages URL 등록

---

## Phase 8: 향후 작업

- [ ] 카드 상세 편집 (설명, 마감일, 담당자)
- [ ] 다중 보드 지원
- [ ] Supabase Realtime으로 실시간 협업
- [ ] 컬럼 커스터마이징

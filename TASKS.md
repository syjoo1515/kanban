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

---

## Phase 2: 마크업 (index.html)

- [x] HTML 기본 구조 (`<!DOCTYPE html>`, `<head>`, `<body>`)
- [x] CSS/JS 파일 연결 (`<link>`, `<script defer>`)
- [x] 보드 컨테이너 (`#board`) 생성
- [x] TO-DO 컬럼 섹션 생성 (`data-column="todo"`)
- [x] In-Progress 컬럼 섹션 생성 (`data-column="inprogress"`)
- [x] Done 컬럼 섹션 생성 (`data-column="done"`)
- [x] 각 컬럼 헤더 (제목 + 카드 수 배지)
- [x] 각 컬럼 카드 목록 영역 (`.card-list`)
- [x] 각 컬럼 카드 추가 폼 (input + 버튼)

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

---

## Phase 4: 로직 (app.js)

- [x] `loadState()` — localStorage에서 카드 배열 로드
- [x] `saveState(cards)` — localStorage에 카드 배열 저장
- [x] `createCard(text, column)` — 새 카드 객체 생성
- [x] `renderBoard()` — 전체 보드 DOM 재렌더링
- [x] `renderCard(card)` — 카드 DOM 요소 생성 및 이벤트 바인딩
- [x] 카드 추가 이벤트 핸들러 (버튼 클릭, Enter 키)
- [x] 카드 삭제 이벤트 핸들러 (× 버튼)
- [x] Drag and Drop: `dragstart` 핸들러
- [x] Drag and Drop: `dragover` 핸들러 (preventDefault)
- [x] Drag and Drop: `dragenter` 핸들러 (하이라이트 추가)
- [x] Drag and Drop: `dragleave` 핸들러 (하이라이트 제거)
- [x] Drag and Drop: `drop` 핸들러 (카드 이동 처리)
- [x] 초기 실행 (DOMContentLoaded → loadState → renderBoard)

---

## Phase 5: 검증

- [x] 브라우저에서 `index.html` 열기 (HTTP 200 확인)
- [x] 각 컬럼에 카드 추가 확인
- [x] Enter 키로 카드 추가 확인
- [x] 카드 드래그 앤 드롭으로 컬럼 간 이동 확인
- [x] 페이지 새로고침 후 localStorage 상태 유지 확인
- [x] × 버튼으로 카드 삭제 확인
- [x] 빈 입력창에서 추가 시 무시 확인
- [x] 같은 컬럼 내 드롭 시 변화 없음 확인

---

## Phase 6: 향후 작업 (v2 백엔드 연동)

- [ ] REST API 서버 구현 (Node.js / Spring Boot 등)
- [ ] MySQL 스키마 적용 (DatabaseDesign.md 참고)
- [ ] `loadState()` → `GET /api/cards` fetch로 교체
- [ ] `saveState()` → `PUT /api/cards` fetch로 교체
- [ ] 개별 카드 이동 → `PATCH /api/cards/:id` 로 최적화
- [ ] 사용자 인증 추가

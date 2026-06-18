# Kanban Board 구현 계획

## 파일 구조

```
kanba/
├── index.html
├── style.css
├── app.js
└── plan.md
```

---

## 구현 계획

### 1. `index.html`
- 세 컬럼(`todo`, `inprogress`, `done`) 각각 `<section>` 태그로 구성
- 각 컬럼 헤더에 제목 표시 (TO-DO / In-Progress / Done)
- 새 카드 추가용 입력 폼(input + 버튼)을 각 컬럼 하단에 배치
- `style.css`, `app.js` 연결

### 2. `style.css`
- 전체 레이아웃: flexbox로 3컬럼 수평 배치
- 카드: 흰색 박스, 그림자, 둥근 모서리
- 드래그 중 카드: opacity 감소 및 시각적 피드백
- 컬럼 드롭 영역 하이라이트 (dragover 시 배경색 변경)

### 3. `app.js`
- **데이터 모델**: `{ id, text, column }` 구조 배열로 관리
- **localStorage**: `loadState()` / `saveState()` 로 JSON 직렬화/역직렬화
  - key: `"kanban-cards"`
- **렌더링**: `renderBoard()` — 전체 재렌더링 방식
- **카드 추가**: 각 컬럼 하단 입력창에서 Enter 또는 버튼 클릭으로 카드 생성
- **카드 삭제**: 카드에 × 버튼 추가
- **HTML5 Drag and Drop API**:
  - 카드 요소에 `draggable="true"` 부여
  - `dragstart` → `dataTransfer.setData('text/plain', cardId)`
  - 컬럼 `dragover` → `preventDefault()` (드롭 허용)
  - 컬럼 `dragenter` / `dragleave` → 하이라이트 토글
  - 컬럼 `drop` → 카드의 column 값 변경 후 저장 및 재렌더링
- **상태 흐름**: 이벤트 → 상태 업데이트 → `saveState()` → `renderBoard()`

---

## 데이터 구조 예시

```json
[
  { "id": "1718000000000", "text": "할 일 1", "column": "todo" },
  { "id": "1718000000001", "text": "진행 중 1", "column": "inprogress" },
  { "id": "1718000000002", "text": "완료 1", "column": "done" }
]
```

---

## 검증 방법
1. 브라우저에서 `index.html` 열기
2. 각 컬럼에 카드 추가 확인
3. 카드를 다른 컬럼으로 드래그 앤 드롭 후 이동 확인
4. 페이지 새로고침 후 localStorage 상태 유지 확인
5. × 버튼으로 카드 삭제 확인

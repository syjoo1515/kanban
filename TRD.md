# TRD — Technical Requirements Document

## 1. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 마크업 | HTML5 |
| 스타일 | CSS3 (Flexbox) |
| 로직 | Vanilla JavaScript (ES6+) |
| 상태 저장 (현재) | localStorage (JSON) |
| 상태 저장 (예정) | REST API + MySQL |

---

## 2. 파일 구조

```
kanba/
├── index.html        # 진입점, DOM 구조 정의
├── style.css         # 레이아웃 및 시각적 스타일
├── app.js            # 상태 관리, 이벤트 처리, 렌더링
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
[사용자 인터랙션]
       ↓
[app.js 이벤트 핸들러]
       ↓
[상태 업데이트 (메모리 내 배열)]
       ↓
[saveState() → localStorage]
       ↓
[renderBoard() → DOM 재생성]
```

백엔드 연동 시 `saveState()` 를 API 호출로 교체하고, `loadState()` 를 초기 fetch 로 대체한다.

---

## 4. 데이터 모델 (프론트엔드)

```js
// 카드 객체
{
  id: string,      // Date.now().toString() — 고유 식별자
  text: string,    // 카드 텍스트
  column: string   // 'todo' | 'inprogress' | 'done'
}
```

localStorage key: `"kanban-cards"`

---

## 5. Drag and Drop 구현

HTML5 네이티브 Drag and Drop API 사용.

| 이벤트 | 대상 | 처리 |
|--------|------|------|
| `dragstart` | 카드 | `dataTransfer.setData('text/plain', card.id)` |
| `dragover` | 컬럼 | `e.preventDefault()` — 드롭 허용 |
| `dragenter` | 컬럼 | `drag-over` 클래스 추가 (하이라이트) |
| `dragleave` | 컬럼 | `drag-over` 클래스 제거 |
| `drop` | 컬럼 | 카드 id 읽어 column 값 변경 → 저장 → 재렌더링 |

---

## 6. localStorage 스키마

```json
// key: "kanban-cards"
[
  { "id": "1718000000000", "text": "카드 텍스트", "column": "todo" }
]
```

---

## 7. 백엔드 연동 전환 가이드

현재 `app.js` 의 `loadState()` / `saveState()` 를 아래와 같이 교체한다.

```js
// 현재 (localStorage)
function loadState() {
  return JSON.parse(localStorage.getItem('kanban-cards') || '[]');
}
function saveState(cards) {
  localStorage.setItem('kanban-cards', JSON.stringify(cards));
}

// 전환 후 (REST API)
async function loadState() {
  const res = await fetch('/api/cards');
  return res.json();
}
async function saveState(cards) {
  await fetch('/api/cards', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cards)
  });
}
```

---

## 8. 브라우저 호환성

- HTML5 Drag and Drop API: Chrome 4+, Firefox 3.5+, Edge 12+
- localStorage: 모든 현대 브라우저 지원

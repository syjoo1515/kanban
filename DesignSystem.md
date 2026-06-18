# Design System — Kanban Board

## 1. 색상

### Primary Palette

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-bg` | `#f0f2f5` | 전체 배경 |
| `--color-surface` | `#ffffff` | 카드, 컬럼 배경 |
| `--color-border` | `#e0e0e0` | 카드 테두리 |
| `--color-text-primary` | `#1a1a1a` | 본문 텍스트 |
| `--color-text-muted` | `#888888` | 서브 텍스트, 플레이스홀더 |

### Column Accent Colors

| 컬럼 | 헤더 배경 | 의미 |
|------|----------|------|
| TO-DO | `#e3f2fd` (연파랑) | 대기 |
| In-Progress | `#fff8e1` (연노랑) | 진행 중 |
| Done | `#e8f5e9` (연초록) | 완료 |

### Interactive

| 상태 | 값 | 용도 |
|------|----|------|
| 버튼 기본 | `#1976d2` | 추가 버튼 배경 |
| 버튼 호버 | `#1565c0` | 추가 버튼 hover |
| 드롭 하이라이트 | `#bbdefb` + border `#1976d2` | dragover 상태 컬럼 |
| 드래그 중 카드 | opacity `0.4` | 원본 카드 투명도 |

---

## 2. 타이포그래피

| 역할 | 크기 | 굵기 | 비고 |
|------|------|------|------|
| 보드 제목 | `1.5rem` | 700 | |
| 컬럼 제목 | `1rem` | 700 | uppercase |
| 카드 텍스트 | `0.9rem` | 400 | |
| 카드 카운트 | `0.8rem` | 400 | muted |
| 버튼 레이블 | `0.85rem` | 600 | |

폰트 패밀리: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

---

## 3. 스페이싱

| 토큰 | 값 | 용도 |
|------|----|------|
| `--space-xs` | `4px` | 아이콘 간격 |
| `--space-sm` | `8px` | 카드 내부 패딩 |
| `--space-md` | `16px` | 컬럼 패딩, 카드 간격 |
| `--space-lg` | `24px` | 컬럼 간격 |

---

## 4. 컴포넌트

### Board
- 배경: `--color-bg`
- 레이아웃: `display: flex`, `gap: 24px`, `padding: 24px`
- 최소 높이: `100vh`

### Column
- 너비: `300px` (고정)
- 배경: `#f8f9fa`
- 둥근 모서리: `12px`
- 패딩: `16px`
- `display: flex; flex-direction: column`

### Column Header
- 컬럼별 accent 배경색
- `border-radius: 8px`
- 카드 개수 배지 포함

### Card
- 배경: `--color-surface`
- `border: 1px solid --color-border`
- `border-radius: 8px`
- `padding: 12px`
- `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`
- hover: `box-shadow` 강조
- `cursor: grab`, 드래그 중: `cursor: grabbing`

### Delete Button (×)
- 위치: 카드 우측 상단
- 크기: `20px × 20px`
- 색상: `--color-text-muted`, hover: `#e53935`
- 기본 숨김, 카드 hover 시 표시

### Add Card Form
- 입력창: `width: 100%`, `border-radius: 6px`, `border: 1px solid --color-border`
- 추가 버튼: `background: --color-btn`, `color: #fff`, `border-radius: 6px`
- 버튼 hover: 배경색 어둡게

---

## 5. 아이콘 / 기호

외부 아이콘 라이브러리 없이 유니코드 문자 사용.

| 용도 | 기호 |
|------|------|
| 카드 삭제 | `×` (`&times;`) |
| 카드 추가 버튼 | `+` 텍스트 또는 `추가` |

---

## 6. 애니메이션 / 트랜지션

| 요소 | 속성 | 시간 |
|------|------|------|
| 카드 hover shadow | `box-shadow` | `0.15s ease` |
| 삭제 버튼 표시 | `opacity` | `0.15s ease` |
| 컬럼 dragover 배경 | `background-color` | `0.1s ease` |
| 버튼 hover 색상 | `background-color` | `0.15s ease` |

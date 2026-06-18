# User Flow — Kanban Board

## 1. 전체 흐름 개요

```
앱 진입
  └─ Supabase 세션 확인 (onAuthStateChange)
       ├─ 세션 있음 → 보드 화면 표시 + 카드 로드
       └─ 세션 없음 → 로그인 화면 표시
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        [이메일 로그인]  [Google]    [GitHub]
              │            │            │
              └────────────┴────────────┘
                           │ 인증 성공
                           ▼
                     [보드 화면]
                     ├─ 카드 추가
                     ├─ 카드 삭제
                     ├─ 카드 이동 (드래그 앤 드롭)
                     └─ 로그아웃
```

---

## 2. 인증 흐름

### 2-1. 이메일 회원가입

```
로그인 화면에서 이메일 + 비밀번호 입력
  └─ "회원가입" 버튼 클릭
       ├─ 이메일/비밀번호 미입력 → 에러 메시지 표시
       ├─ 비밀번호 6자 미만 → 에러 메시지 표시
       └─ 정상 입력
            └─ supabase.auth.signUp() 호출
                 ├─ 성공 → "확인 이메일 발송" 안내 표시
                 └─ 실패 → 에러 메시지 표시
```

### 2-2. 이메일 로그인

```
로그인 화면에서 이메일 + 비밀번호 입력
  └─ "로그인" 버튼 클릭 또는 Enter
       └─ supabase.auth.signInWithPassword() 호출
            ├─ 성공 → onAuthStateChange 트리거 → 보드 화면
            └─ 실패 → 에러 메시지 표시
```

### 2-3. 소셜 로그인 (Google / GitHub)

```
"Google로 계속하기" 또는 "GitHub로 계속하기" 버튼 클릭
  └─ supabase.auth.signInWithOAuth({ provider }) 호출
       └─ OAuth 제공자 인증 화면으로 리다이렉트
            └─ 인증 완료 → 앱으로 리다이렉트
                 └─ onAuthStateChange 트리거 → 보드 화면
```

### 2-4. 로그아웃

```
헤더의 "로그아웃" 버튼 클릭
  └─ supabase.auth.signOut() 호출
       └─ onAuthStateChange 트리거 → 로그인 화면
```

---

## 3. 카드 추가 흐름

```
사용자가 컬럼 하단 입력창에 텍스트 입력
  └─ Enter 키 또는 "추가" 버튼 클릭
       ├─ 텍스트 비어있음 (trim 후 빈 문자열) → 무시
       └─ 텍스트 있음
            └─ supabase.from('cards').insert() 호출
                 ├─ 성공 → 로컬 cards 배열에 추가 → renderBoard()
                 └─ 실패 → console.error (에러 무시)
```

---

## 4. 카드 삭제 흐름

```
카드의 × 버튼 클릭
  └─ supabase.from('cards').delete().eq('id', id) 호출
       ├─ 성공 → 로컬 cards 배열에서 제거 → renderBoard()
       └─ 실패 → console.error
```

---

## 5. 카드 이동 (드래그 앤 드롭) 흐름

```
카드 드래그 시작 (dragstart)
  └─ dataTransfer에 card.id 저장
       ↓
  컬럼 위 통과 (dragover) → preventDefault (드롭 허용)
       ↓
  컬럼 진입 (dragenter) → .drag-over 클래스 추가 (하이라이트)
       ↓
  컬럼 이탈 (dragleave) → .drag-over 클래스 제거
       ↓
  컬럼에 드롭 (drop)
  └─ 카드 id 읽기
       ├─ 같은 컬럼 → 무시
       └─ 다른 컬럼
            └─ supabase.from('cards').update({ column }) 호출
                 ├─ 성공 → 로컬 card.column 변경 → renderBoard()
                 └─ 실패 → console.error
```

---

## 6. 화면 상태 다이어그램

```
[로그인 화면]
      │ 인증 성공
      ▼
[보드 화면]
    │           │           │
    │ 드래그     │ 삭제       │ 추가
    ▼           ▼           ▼
[카드 이동]  [카드 제거]  [카드 추가]
    │           │           │
    └───────────┴───────────┘
                │
         Supabase DB 동기화
                │
         보드 재렌더링
                │
         로그아웃 버튼 클릭
                │
         [로그인 화면]
```

---

## 7. 엣지 케이스

| 상황 | 처리 방법 |
|------|----------|
| 입력창이 비어 있을 때 추가 | trim 후 빈 문자열이면 무시 |
| 같은 컬럼 내 드롭 | DB 업데이트 없이 무시 |
| 비밀번호 6자 미만 회원가입 | 에러 메시지 표시 |
| OAuth 리다이렉트 후 세션 복원 | `onAuthStateChange`가 자동 처리 |
| DB 오류 | `console.error` 출력, UI 상태 유지 |
| 다른 사용자 카드 접근 | RLS가 차단 (DB 레벨 보안) |

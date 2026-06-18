# SETTING — Supabase 설정 가이드

이 문서는 Kanban Board를 정상적으로 사용하기 위해 **직접 수행해야 하는 설정 항목**을 순서대로 안내합니다.

---

## Step 1. Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 에 접속하여 로그인
2. **New Project** 클릭
3. 프로젝트 이름, 비밀번호, 리전(Asia Northeast — Seoul 권장) 입력 후 생성
4. 프로젝트 생성 완료까지 약 1~2분 대기

---

## Step 2. API Key 발급 및 `supabase.js` 수정

1. Supabase Dashboard → 좌측 메뉴 **Settings(톱니바퀴) → Data API** 이동
   - 또는 프로젝트 홈 상단의 **Connect** 버튼 → **App Frameworks** 탭에서 확인 가능
2. 아래 두 값을 복사

| 항목 | 위치 |
|------|------|
| Project URL | `Project URL` 항목 (예: `https://xxxx.supabase.co`) |
| anon public key | `API Keys` → `anon` `public` 항목 |

3. 프로젝트의 `supabase.js` 파일을 열어 두 값 교체

```js
const SUPABASE_URL      = 'https://xxxxxxxxxxxxxxxx.supabase.co';  // ← 교체
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';       // ← 교체
```

---

## Step 3. 데이터베이스 테이블 생성

1. Supabase Dashboard → 좌측 메뉴 **SQL Editor** 이동
2. **New Query** 클릭 후 아래 SQL 전체 복사하여 붙여넣기
3. **Run** 버튼 클릭

```sql
-- cards 테이블 생성
create table cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  column     text not null check (column in ('todo','inprogress','done')),
  position   int not null default 0,
  created_at timestamptz default now()
);

-- Row Level Security 활성화 (사용자별 데이터 격리)
alter table cards enable row level security;

-- 사용자가 자신의 카드만 읽기/쓰기/수정/삭제 가능하도록 정책 설정
create policy "users can manage own cards"
  on cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

4. `Success. No rows returned` 메시지가 표시되면 완료

---

## Step 4. Google OAuth 설정

### 4-1. Google Cloud Console에서 OAuth 앱 생성

1. [https://console.cloud.google.com](https://console.cloud.google.com) 접속
2. 상단 프로젝트 선택 → **새 프로젝트** 생성 (또는 기존 프로젝트 선택)
3. 좌측 메뉴 **API 및 서비스 → 사용자 인증 정보** 이동
4. **사용자 인증 정보 만들기 → OAuth 클라이언트 ID** 클릭
5. 애플리케이션 유형: **웹 애플리케이션** 선택
6. **승인된 리다이렉션 URI** 에 아래 URL 추가:
   ```
   https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback
   ```
   > `<YOUR_PROJECT_ID>` 는 Supabase Project URL에서 확인 (예: `abcdefghijklm`)
7. **만들기** 클릭 → **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

### 4-2. Supabase에 Google 정보 입력

1. Supabase Dashboard → **Authentication → Providers → Google**
2. **Enable Sign in with Google** 토글 ON
3. 위에서 복사한 값 입력:
   - Client ID (Google에서 발급)
   - Client Secret (Google에서 발급)
4. **Save** 클릭

---

## Step 5. GitHub OAuth 설정

### 5-1. GitHub에서 OAuth 앱 생성

1. GitHub 로그인 → 우측 상단 프로필 → **Settings**
2. 좌측 하단 **Developer settings → OAuth Apps → New OAuth App** 클릭
3. 아래 정보 입력:

| 항목 | 값 |
|------|----|
| Application name | Kanban Board (자유롭게 입력) |
| Homepage URL | `https://syjoo1515.github.io/kanban` |
| Authorization callback URL | `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback` |

4. **Register application** 클릭
5. **Client ID** 복사
6. **Generate a new client secret** 클릭 → **Client Secret** 복사

### 5-2. Supabase에 GitHub 정보 입력

1. Supabase Dashboard → **Authentication → Providers → GitHub**
2. **Enable Sign in with GitHub** 토글 ON
3. 위에서 복사한 값 입력:
   - Client ID (GitHub에서 발급)
   - Client Secret (GitHub에서 발급)
4. **Save** 클릭

---

## Step 6. Redirect URL 등록

OAuth 로그인 후 앱으로 올바르게 돌아오도록 Redirect URL을 등록합니다.

1. Supabase Dashboard → **Authentication → URL Configuration**
2. **Redirect URLs** 섹션에서 **Add URL** 클릭
3. 아래 URL을 **각각 추가**:
   ```
   https://syjoo1515.github.io/kanban
   ```
   ```
   http://localhost:8080
   ```
   > 로컬 테스트 시 `http://localhost:8080` 이 등록되어 있지 않으면 GitHub Pages URL로 강제 리다이렉트됩니다.
4. **Save** 클릭

---

## Step 7. GitHub Pages 배포 설정

1. GitHub → `syjoo1515/kanban` 저장소 이동
2. **Settings → Pages**
3. **Source**: `Deploy from a branch` 선택
4. **Branch**: `main` / `/ (root)` 선택 후 **Save**
5. 배포 완료 후 `https://syjoo1515.github.io/kanban` 에서 앱 확인

> 배포까지 최대 3~5분 소요될 수 있습니다.

---

## 설정 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [x] `supabase.js`에 URL과 ANON KEY 입력
- [ ] SQL Editor에서 cards 테이블 + RLS 정책 실행
- [ ] Google OAuth 앱 생성 및 Supabase에 등록
- [ ] GitHub OAuth 앱 생성 및 Supabase에 등록
- [ ] Supabase Redirect URL에 GitHub Pages URL 등록
- [ ] GitHub Pages 배포 설정 완료

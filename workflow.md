# Workflow — Kanban Board 작업 이력

> 사용자 프롬프트는 원문 그대로, 작업 내용은 요약하여 기록합니다.
> 작업이 완료될 때마다 이 문서를 갱신합니다.

---

## 2026-06-18

---

### 1. 칸반보드 초기 기획

**프롬프트**
> HTML과 CSS, JS로 칸반보드를 만들려고 해. 칸반보드에는 TO-DO, In-progress, Done의 컬럼이 있어야 해. 카드를 드래그해서 컬럼간 이동이 가능하게 만들어야해. HTML과 CSS, JS는 각각 다른 파일로 생성해줘. 우선 localstorage에 상태를 저장해주고 드래그 앤 드롭은 HTML5 네이티브 Drag and drop API를 사용해줘. plan.md에 계획을 저장해줘

**작업**
- `plan.md` 작성 (파일 구조, 구현 계획, 데이터 구조, 검증 방법)
- 플랜 모드 진입 후 승인 대기

---

### 2. 카드 추가 기능 확인 요청

**프롬프트**
> 카드 추가 기능도 추가해줘

**작업**
- plan.md에 이미 카드 추가 기능이 포함되어 있음을 확인 및 안내

---

### 3. plan.md 저장 요청

**프롬프트**
> 우선 plan.md를 먼저 저장해줘

**작업**
- `plan.md` 프로젝트 디렉토리에 저장

---

### 4. 문서 생성 요청

**프롬프트**
> plan.md에 근거해서 다음 문서를 생성 및 저장해줘 : PRD, TRD, User Flow, Database Design, Design System, TASKS. 현재는 백엔드가 없지만 추후 Mysql 등으로 RDB를 연동할 수 있으니 그 점을 고려해서 데이터베이스 디자인 문서를 만들어줘. 모든 문서는 .md로 생성해서 저장해줘

**작업**
- `PRD.md`, `TRD.md`, `UserFlow.md`, `DatabaseDesign.md`, `DesignSystem.md`, `TASKS.md` 생성

---

### 5. PRD 업데이트 요청

**프롬프트**
> PRD에 시나리오, 성공 기준을 추가해서 작성해줘

**작업**
- `PRD.md`에 섹션 6(사용 시나리오 5개), 섹션 7(기능적/비기능적 성공 기준) 추가

---

### 6. 칸반보드 구현 요청

**프롬프트**
> 만들어진 문서들에 근거해서 칸반보드를 구현해줘

**작업**
- `index.html` — 3컬럼 구조, 헤더, 카드 추가 폼 생성
- `style.css` — DesignSystem 기반 스타일 적용
- `app.js` — localStorage 상태 관리, DnD API, 카드 CRUD 구현
- `TASKS.md` Phase 2~4 완료 처리

---

### 7. TASKS.md 업데이트 규칙 설정

**프롬프트**
> 앞으로 작업을 완료하면 task.md 파일을 업데이트해줘

**작업**
- 메모리에 규칙 저장 (작업 완료 시 TASKS.md 항목 [x] 처리)
- 기존 완료 항목 일괄 체크

---

### 8. 정적 서버 확인 요청

**프롬프트**
> 정적 서버에서 해당 시스템이 구현되는지 확인해줘

**작업**
- python3 http.server로 서버 실행
- index.html, style.css, app.js HTTP 200 확인
- app.js 핵심 함수 15개 존재 여부 검증 (전부 PASS)

---

### 9. 반응형 웹 요청

**프롬프트**
> 웹을 반응형으로 만들어줘

**작업**
- `style.css`에 미디어 쿼리 추가 (태블릿 ≤1024px 2컬럼, 모바일 ≤640px 1컬럼)
- 모바일 삭제 버튼 항상 표시 처리
- `TASKS.md` 반응형 항목 완료 처리

---

### 10. 검증 실행 요청

**프롬프트**
> 이제 TASKS.md의 검증을 실행하고 업데이트해줘

**작업**
- app.js 코드 분석으로 Phase 5 검증 항목 8개 전부 PASS
- `TASKS.md` Phase 5 전체 완료 처리

---

### 11. 커밋 및 푸시 요청 (1차)

**프롬프트**
> 지금까지 진행 내용을 commit 및 push해줘

**작업**
- `day03/kanba` 10개 파일 스테이징 및 커밋
- `weable-kosa/kosa-vibecoding-2026-3rd` push 완료

---

### 12. ~/work/kanba 복사 요청

**프롬프트**
> ~/work 디렉토리에 kanba 폴더를 만들고, 현재까지 만든 모든 파일들을 복사해줘

**작업**
- `/home/ubuntu/work/kanba` 디렉토리 생성 및 파일 복사

---

### 13. GitHub 저장소 생성 및 배포 요청

**프롬프트**
> 해당 리파지토리의 내용을 syjoo1515 계정으로 커밋해줘. github으로 해당 프로그램을 배포할꺼야

**작업**
- `/home/ubuntu/work/kanba` git 초기화, `main` 브랜치 생성
- 초기 커밋 생성
- `git@github.com:syjoo1515/kanba.git` remote 추가 후 push

---

### 14. Supabase 인증 + DB 연동 요청

**프롬프트**
> 이제 google, github, 이메일로 회원가입 및 인증할 수 있는 기능을 추가할꺼야. 회원가입 및 인증은 supabase의 기능을 사용할꺼고, DB도 supabase를 사용할꺼야. 만들어진 문서들을 업데이트하고 기능을 추가해줘. 내가 설정해야하는 부분은 따로 정리해서 알려줘

**작업**
- `supabase.js` 신규 생성 (Supabase 클라이언트 초기화)
- `index.html` — 로그인 화면(`#auth-screen`) 추가, 보드 화면 래핑
- `app.js` — localStorage 제거, Supabase Auth + DB 연동 전면 교체
- `style.css` — 인증 UI 스타일 추가
- `PRD.md`, `TRD.md`, `UserFlow.md`, `TASKS.md` v2 기준 업데이트

---

### 15. SETTING.md 생성 요청

**프롬프트**
> 내가 설정해야하는부분을 setting.md 문서로 정리해줘

**작업**
- `SETTING.md` 생성 (Step 1~7: Supabase 프로젝트, API Key, DB 스키마, Google/GitHub OAuth, Redirect URL, GitHub Pages 배포 가이드)

---

### 16. Supabase API Key 입력 요청

**프롬프트**
> SUPABASE_URL는 https://ztoxcwkonwdmxmeiieyb.supabase.co/rest/v1/이고, anon key는 eyJ... 이야. 너가 교체해줘

**작업**
- `supabase.js`에 실제 URL(`/rest/v1/` 제거), ANON KEY 입력

---

### 17. 저장소명 kanba → kanban 변경 요청

**프롬프트**
> 그런데, 현재 리파지토리 이름을 kanban으로 지었어야 했는데 kanba로 지었어. 현재 깃에 업로드 한 내역까지 모두 수정할 수 있어?

**작업**
- GitHub에서 저장소명 변경 안내 후 사용자 직접 변경
- remote URL을 `syjoo1515/kanban`으로 수정
- 문서 내 `kanba` → `kanban` 일괄 치환 (SETTING.md, TASKS.md, TRD.md, plan.md)
- 커밋 및 push

---

### 18. 로컬 디렉토리명 변경 요청

**프롬프트**
> 응 바꿔줘

**작업**
- `/home/ubuntu/work/kanba` → `/home/ubuntu/work/kanban` 디렉토리 이름 변경

---

### 19. GitHub Pages 로그인 화면 미표시 이슈

**프롬프트**
> https://syjoo1515.github.io/kanban으로 테스트하려고하니까 로그인하는 페이지가 나오지 않아

**작업**
- GitHub Pages가 구버전 파일 서빙 중인 것 확인 (index.html에 `<script defer>` 구버전)
- `index.html`, `app.js`, `style.css`, `PRD.md`, `UserFlow.md` 커밋 및 push

---

### 20. kosa-vibecoding 저장소 day03/kanba → kanban 폴더명 변경

**프롬프트**
> weable-kosa/kosa-vibecoding-2026-3rd 저장소에서 src/exercise/syjoo1515/day03에서 kanba > kanban으로 폴더 이름을 변경해줘

**작업**
- `day03/kanba` → `day03/kanban` 디렉토리 rename
- 커밋 및 push

---

### 21. 소셜 계정 중복 이메일 안내 메시지 추가

**프롬프트**
> 회원가입시 이미 해당 이메일과 연동된 소셜계정이 존재한다면, 이미 해당 이메일과 연동된 소셜 계정이 있다는 문장을 보여줘

**작업**
- `app.js` signUp 시 에러 메시지 + `identities` 배열 이중 감지로 중복 안내 메시지 표시
- `TASKS.md` 해당 항목 추가 및 완료 처리
- 두 저장소 커밋 및 push

---

### 22. 문서 최신화 요청

**프롬프트**
> 문서들을 현재 프로그램 및 진행상황과 일치하는지 확인하고, 최신화가 필요하면 최신화해줘

**작업**
- `DatabaseDesign.md` — localStorage/MySQL → Supabase PostgreSQL 기준 전면 재작성
- `DesignSystem.md` — 인증 화면 컴포넌트 섹션 추가
- `TASKS.md` — Supabase 설정 완료 항목 체크, 배포 완료 체크
- 두 저장소 커밋 및 push

---

### 23. workflow.md 및 CLAUDE.md 생성 요청

**프롬프트**
> 지금까지 내가 전달한 프롬포트와 너가 한 작업을 정리해서 workflow.md 문서로 저장해줘. 프롬포트는 그대로 작성하고 작업은 요약해서 정리해서 작성해줘. 이 내용을 CLAUDE.md에 반영해서 앞으로는 작업 시 항상 workflow.md를 갱신해줘

**작업**
- `workflow.md` 생성 (전체 작업 이력 정리)
- `CLAUDE.md` 생성 (workflow.md 갱신 규칙 포함)

---

### 24. CLAUDE.md 참고 정보 보완 요청

**프롬프트**
> claude.md는 동기화 외에도 너가 현재 프로그램에서 참고해야 할 정보들을 추가적으로 정리해둬

**작업**
- `CLAUDE.md` 재작성 — 저장소 정보, 기술 스택, Supabase 연동 정보, 핵심 함수 목록, DOM 구조, 알려진 이슈, 반응형 브레이크포인트 추가
- 두 저장소 커밋 및 push

---

### 25. GitHub 소셜 로그인 버튼 무반응 버그

**프롬프트**
> github으로 계속하기 버튼으로 로그인하려는데 버튼이 반응하지 않아

**작업**
- `app.js` Google/GitHub 소셜 버튼 핸들러에 `async/await` 및 에러 처리 추가
- Supabase Dashboard GitHub Provider 활성화 여부 확인 안내
- `TASKS.md` / `workflow.md` 업데이트

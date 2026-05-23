# 구현 노트

## 완료된 항목
- **프로젝트 초기화:** Next.js (App Router), Tailwind CSS, shadcn/ui 설정 완료.
- **데이터베이스 설계:** `profiles`, `categories`, `subjects`, `posts`, `comments`, `points_history`, `calendar_events` 테이블 및 RLS 설정이 포함된 초기 스키마 작성 (`supabase/migrations/20260519162519_initial_schema.sql`).
- **인증 기능 구현:** 
    - `@korea.ac.kr` 도메인 제한 로직이 포함된 회원가입 페이지 (`src/app/signup/page.tsx`).
    - 로그인 페이지 (`src/app/login/page.tsx`).
    - Supabase Auth와 연동된 프로필 자동 생성 트리거 설정.
- **게시판 기본 기능:**
    - 동적 라우팅을 이용한 통합 게시판 목록 페이지 (`src/app/board/[type]/page.tsx`).
    - 게시글 상세 페이지 및 댓글 목록 표시 (`src/app/board/[type]/[id]/page.tsx`).
    - 게시글 작성 페이지 (`src/app/board/[type]/new/page.tsx`).
    - 댓글 작성 컴포넌트 (`src/components/board/CommentForm.tsx`).
- **메인 화면:** 최신 게시글 및 포인트 랭킹 대시보드 구현 (`src/app/page.tsx`).
- **레이아웃:** 공통 네비게이션 바 및 게시판 레이아웃 설정.

## 계획 외 변경
- `src/app/board/layout.tsx`: 게시판 관련 페이지에서 공통적으로 `Navbar`와 배경색을 유지하기 위해 추가함.
- `date-fns` 라이브러리 추가: 게시글 및 댓글의 작성 시간을 "방금 전", "1시간 전" 등으로 표시하기 위해 설치함.

## 미해결 항목
- **자료실 파일 업로드:** Supabase Storage 연동 로직은 UI 구조는 잡혀있으나 실제 파일 업로드 핸들러는 다음 단계에서 구현 예정.
- **Q&A 채택 및 포인트 지급:** DB 스키마에는 반영되어 있으나, UI 상의 채택 버튼 및 포인트 지급 RPC 호출 로직은 추가 구현 필요.
- **관리자 페이지:** `/admin` 경로는 아직 생성되지 않음.

## Reviewer 확인 요청
- `src/app/board/[type]/page.tsx`와 `src/app/board/[type]/[id]/page.tsx`에서 사용된 서버 컴포넌트 데이터 페칭 로직이 효율적인지 확인 부탁드립니다.
- RLS 정책이 의도한 대로 (비밀 댓글 등) 잘 작동하는지 스키마 파일을 검토해 주세요.

# 구현 계획

## 요구사항 요약
고려대학교 학생들을 위한 커뮤니티 플랫폼 구축. 주요 기능으로는 @korea.ac.kr 이메일 인증 기반 회원가입, 자유 게시판, 학년/과목별 자료 공유 및 토론, 팀원 매칭, 전공 Q&A 및 포인트 기반 랭킹 시스템, 그리고 관리자 기능을 포함함.

## 가정
- 프로젝트는 초기 단계이며, Next.js (App Router) 기반으로 신규 생성이 필요함.
- Supabase 프로젝트가 이미 생성되어 있거나 생성할 준비가 되어 있다고 가정함.
- `@korea.ac.kr` 이메일 제한은 Supabase Auth의 'Email Domains' 설정 또는 가입 로직에서의 검증으로 처리함.
- '비밀 댓글'은 팀원 매칭 게시판에서 지원 방법 중 하나로 사용됨.

## 기술 스택
- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend & DB:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel

## 구현 범위
| 파일/기능 | 변경 유형 | 내용 |
|------|----------|------|
| 프로젝트 초기화 | 신규 | Next.js, Tailwind, shadcn/ui 설정 |
| Supabase 스키마 | 신규 | profiles, posts, comments, categories, subjects, points, calendar_events 테이블 설계 및 생성 |
| Auth (가입/로그인) | 신규 | 이메일 도메인 제한 및 프로필 정보(이름, 학번) 저장 로직 |
| 게시판 (공통) | 신규 | 자유 게시판, 자료실, 팀원 매칭, Q&A를 위한 통합/분리형 게시판 UI 및 API |
| 랭킹 시스템 | 신규 | 답변 채택 로직 및 메인 화면 Top 10 대시보드 |
| 관리자 페이지 | 신규 | `/admin` 경로, 카테고리 및 학사 일정 관리 기능 |

## 구현 순서
1. **환경 구축:** Next.js 프로젝트 초기화 및 Supabase 연동 설정.
2. **데이터베이스 설계:** Supabase SQL Editor를 통한 테이블 및 RLS(Row Level Security) 설정.
3. **인증 기능 구현:** 가입 시 도메인 체크 및 프로필 생성 트리거 설정.
4. **게시판 기본 기능:** CRUD, 좋아요, 댓글(대댓글 포함) 기능 구현.
5. **특화 기능 개발:**
    - 자료실: Supabase Storage 연동 (파일 업로드/다운로드).
    - 팀원 매칭: 템플릿 입력 폼 및 상태 토글.
    - Q&A: 채택 로직 및 포인트 시스템.
6. **대시보드 및 랭킹:** 메인 화면 UI 및 랭킹 쿼리 구현.
7. **관리자 기능:** 카테고리 및 일정 관리 UI 구현.

## 기술 결정
- **게시판 구조:** `posts` 테이블에 `type` 컬럼을 두어 게시판 종류를 구분하고, 종류별로 필요한 필드(태그, 상태 등)를 유연하게 처리.
- **포인트 시스템:** 답변 채택 시 `profiles` 테이블의 `points`를 증가시키는 RPC(Remote Procedure Call) 또는 Database Trigger 사용.
- **파일 저장:** Supabase Storage의 `archives` 버킷을 생성하여 학년/과목별로 폴더 구조 관리.
- **관리자 권한:** `profiles` 테이블의 `role` 컬럼을 활용하여 미들웨어 수준에서 `/admin` 접근 제어.

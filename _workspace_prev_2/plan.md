# 구현 계획

## 요구사항 요약
이전 단계에서 누락된 핵심 기능들을 구현하여 커뮤니티 플랫폼을 완성함. 자료실 파일 업로드/다운로드, Q&A 채택 및 포인트 시스템, 관리자 페이지(/admin), 그리고 게시글 작성 시 과목 선택 기능을 포함함.

## 가정
- Supabase Storage에 `archives` 버킷이 생성되어야 함 (또는 코드로 생성 시도).
- 포인트 지급 로직은 데이터 무결성을 위해 Supabase RPC(Remote Procedure Call)를 통해 처리함.
- 관리자 권한은 `profiles` 테이블의 `role` 컬럼값이 'admin'인 경우로 제한함.

## 기술 스택
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Icons:** Lucide React

## 구현 범위
| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `supabase/migrations/..._updates.sql` | 신규 | `posts` 및 `comments` 테이블 컬럼 추가, 포인트 지급 및 채택 RPC 함수 정의 |
| `src/app/board/[type]/new/page.tsx` | 수정 | 과목 선택(`subject_id`) 및 파일 업로드 UI/로직 추가 |
| `src/app/board/[type]/[id]/page.tsx` | 수정 | 파일 다운로드 링크, Q&A 채택 버튼, 과목명 표시 |
| `src/app/board/[type]/page.tsx` | 수정 | 목록에서 과목명 표시 및 Q&A 해결 상태 표시 |
| `src/lib/supabase/middleware.ts` | 수정 | `/admin` 경로에 대한 관리자 권한 체크 로직 추가 |
| `src/app/admin/` | 신규 | 관리자 레이아웃, 대시보드, 카테고리 관리, 학사 일정 관리 페이지 |
| `src/components/admin/` | 신규 | 관리자용 데이터 테이블 및 폼 컴포넌트 |

## 구현 순서
1. **DB 스키마 확장:** `posts`에 `file_url`, `subject_id` 추가, `comments`에 `is_accepted` 추가 및 RPC 함수 작성.
2. **자료실 & 과목 선택:**
    - 게시글 작성 폼에 과목 선택 및 파일 업로드 기능 구현.
    - 게시글 상세 페이지에 파일 다운로드 기능 구현.
3. **Q&A 채택 시스템:**
    - 댓글 채택 UI 및 RPC 연동.
    - 채택 시 포인트 지급 및 게시글 상태 변경 확인.
4. **관리자 페이지 구축:**
    - 미들웨어 권한 제어.
    - 카테고리 CRUD UI 구현.
    - 학사 일정 CRUD UI 구현.
5. **UI/UX 개선:** 메인 페이지 랭킹 연동 확인 및 전반적인 레이아웃 점검.

## 기술 결정
- **파일 업로드:** Supabase Storage의 `archives` 버킷을 사용하며, 파일명 중복 방지를 위해 `UUID-파일명` 형식을 사용함.
- **포인트 로직:** `accept_answer` RPC를 통해 단일 트랜잭션으로 댓글 채택, 게시글 상태 변경, 포인트 지급, 포인트 이력 기록을 처리하여 데이터 일관성 보장.
- **관리자 UI:** shadcn/ui의 `Table`, `Dialog`, `Form` 컴포넌트를 활용하여 일관된 관리 도구 구축.

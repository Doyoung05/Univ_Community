# 구현 계획

## 요구사항 요약
이전 단계의 피드백을 반영하여 관리자 기능을 완성하고, 시스템의 안정성과 보안을 강화하며, 메인 페이지의 사용자 경험을 개선합니다. 주요 작업으로는 사용자 관리 페이지 구현, 스토리지 삭제 정책 및 Cleanup 로직 추가, 포인트 랭킹 확대가 포함됩니다.

## 가정
- 관리자 권한은 `profiles` 테이블의 `role` 컬럼이 'admin'인 사용자로 한정합니다.
- 포인트 조정 시 투명성을 위해 `points_history`에 이력을 남기며, 이는 RPC를 통해 처리합니다.
- 스토리지 삭제 정책은 파일 업로드 시 설정된 `owner` 정보를 기반으로 작동합니다.

## 기술 스택
- **Frontend:** Next.js 15 (App Router), TypeScript, shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Icons:** Lucide React

## 구현 범위
| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `supabase/migrations/20260521000000_final_touches.sql` | 신규 | 스토리지 DELETE 정책, 관리자용 포인트 조정 및 역할 변경 RPC/정책 추가 |
| `src/app/admin/users/page.tsx` | 신규 | 사용자 목록 조회, 역할 변경, 포인트 수동 조정 UI 구현 |
| `src/app/board/[type]/new/page.tsx` | 수정 | 게시글 저장 실패 시 업로드된 파일 자동 삭제(Cleanup) 로직 적용 |
| `src/app/page.tsx` | 수정 | 포인트 기반 실시간 랭킹 Top 10 확대 및 UI 개선 |

## 구현 순서
1. **데이터베이스 및 보안 설정:**
   - `archives` 버킷에 대한 `DELETE` 정책을 추가하여 파일 삭제 권한 부여.
   - `profiles` 테이블에 관리자 업데이트 정책 추가.
   - 관리자 전용 포인트 조정(`adjust_points`) 및 역할 변경(`update_user_role`) RPC 함수 작성.
2. **관리자 사용자 관리 페이지 구현:**
   - `src/app/admin/users/page.tsx` 생성.
   - 사용자 목록 테이블 및 포인트/역할 수정을 위한 다이얼로그 구현.
3. **시스템 안정성 강화:**
   - `src/app/board/[type]/new/page.tsx`에서 파일 업로드 후 DB Insert 실패 시 `storage.remove`를 호출하는 에러 핸들링 추가.
4. **메인 페이지 고도화:**
   - `src/app/page.tsx`의 랭킹 쿼리를 `limit(10)`으로 수정하고 UI 레이아웃을 10명에 맞게 조정.
5. **검증:**
   - 비밀 댓글 RLS 작동 여부 재확인 및 전반적인 기능 테스트.

## 기술 결정
- **RPC 기반 포인트 관리:** 관리자의 수동 조정도 시스템 포인트 로직과 일관성을 유지하기 위해 RPC를 사용하여 트랜잭션 처리 및 이력 기록을 강제합니다.
- **보상 트랜잭션 (Cleanup):** 분산 시스템(Storage + DB) 간의 일관성을 위해 클라이언트 단에서 실패 시 명시적인 삭제 로직을 수행합니다.
- **RLS 보안:** 비밀 댓글은 DB 레벨의 RLS 정책을 통해 원천적으로 보호하며, UI는 필터링된 데이터만 표시하도록 유지합니다.

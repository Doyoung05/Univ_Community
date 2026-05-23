# 구현 노트

## 완료된 항목
- [x] **데이터베이스 및 보안 설정:** `supabase/migrations/20260521000000_final_touches.sql` 생성.
    - `archives` 버킷에 대한 `DELETE` 정책 추가.
    - `profiles` 테이블에 관리자용 `UPDATE` 정책 추가.
    - 관리자 전용 포인트 조정(`adjust_points`) 및 역할 변경(`update_user_role`) RPC 함수 구현.
- [x] **관리자 사용자 관리 페이지 구현:** `src/app/admin/users/page.tsx` 신규 구현.
    - 사용자 목록 조회, 검색, 역할 변경(Select), 포인트 조정(Modal) 기능 포함.
- [x] **시스템 안정성 강화:** `src/app/board/[type]/new/page.tsx` 수정.
    - 게시글 저장 실패 시 업로드된 파일을 스토리지에서 삭제하는 Cleanup 로직 추가.
- [x] **메인 페이지 고도화:** `src/app/page.tsx` 수정.
    - 포인트 랭킹을 Top 10으로 확대하고 UI 디자인 개선 (Lucide 아이콘 활용 및 레이아웃 정돈).

## 계획 외 변경
- `src/app/page.tsx`: Hero 섹션에 배경 아이콘을 추가하고 게시글 목록의 디자인을 더 현대적으로 개선했습니다.

## 미해결 항목
- 없음. 모든 계획된 항목이 구현되었습니다.

## Reviewer 확인 요청
- `src/app/admin/users/page.tsx`에서 사용된 `Select` 컴포넌트가 `@base-ui/react/select` 기반의 커스텀 구현체인데, 기존 프로젝트의 사용 패턴과 일치하는지 확인 부탁드립니다.
- `src/app/board/[type]/new/page.tsx`의 Cleanup 로직이 예외 상황(네트워크 오류 등)에서도 안정적으로 작동할지 검토 부탁드립니다.

# 구현 계획

## 요구사항 요약
로그인 성공 후에도 게시글 페이지 진입 시 계속 로그인 화면으로 리다이렉트되는 문제 해결.

## 가정
- Vercel 배포 환경에서 `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수가 Edge Runtime(미들웨어)에 제대로 전달되지 않았거나, 빈 문자열로 처리되어 Supabase 인증이 실패함.
- 미들웨어의 쿠키 동기화 로직(`setAll`)에서 세션 갱신 정보가 브라우저로 제대로 전달되지 않음.
- 게시글 상세 페이지(`/board/[type]/[id]`)는 비로그인 사용자에게 차단된 상태임.

## 기술 스택
- Next.js 16 (App Router)
- Supabase SSR (@supabase/ssr)
- TypeScript

## 구현 범위
| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/lib/supabase/middleware.ts` | 수정 | `setAll` 로직 개선, 환경 변수 체크 및 디버깅 로그 추가 |
| `src/lib/supabase/server.ts` | 수정 | 환경 변수 참조 방식 개선 (필수 값 체크) |
| `src/lib/supabase/client.ts` | 수정 | 환경 변수 참조 방식 개선 |

## 구현 순서
1. **환경 변수 검증 로직 강화**: `?? ''`로 인해 조용히 실패하는 것을 방지하기 위해 환경 변수가 없을 경우 경고를 남기거나 명확히 처리.
2. **미들웨어 쿠키 동기화 수정**: `setAll`에서 `request`와 `response` 모두에 쿠키 옵션을 정확히 전달하도록 수정.
3. **디버깅 로그 추가**: Vercel 로그에서 확인할 수 있도록 미들웨어의 인증 단계별 로그 추가.
4. **공용 페이지 범위 검토**: 게시판 목록 등 비로그인 사용자도 볼 수 있어야 하는 페이지가 있다면 `isPublicPage` 로직 수정.

## 기술 결정
- **안전한 환경 변수 참조**: `process.env` 값이 없을 경우 런타임 에러 대신 명확한 로그를 남겨 설정 오류임을 알림.
- **Supabase SSR 표준 패턴 적용**: 최신 `@supabase/ssr` 가이드에 따른 미들웨어 구현 패턴 적용.

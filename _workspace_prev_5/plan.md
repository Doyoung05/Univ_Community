# 구현 계획 - 프로젝트 오류 분석 및 Vercel 배포를 위한 수정

## 요구사항 요약
Next.js 16/React 19 환경에서 발생하는 린트 에러(any 타입, 선언 전 참조, 미사용 변수)를 해결하고, 빌드 오류(`.next/dev/types/routes.d.ts`)를 수정하여 Vercel 배포가 가능한 상태로 프로젝트를 개선한다.

## 가정
- `npm run build` 시 발생하는 `.next/dev/types/routes.d.ts` 에러는 타입 안정성 확보 및 `params` 처리 방식 최적화를 통해 해결될 것으로 가정한다.
- Supabase 관련 환경 변수는 Vercel 대시보드에 이미 설정되어 있거나 설정될 예정이라고 가정한다.
- Next.js 16은 최신 버전(또는 실험적 버전)이므로, Next.js 15에서 도입된 `params` 비동기 처리 방식을 엄격히 따른다.

## 기술 스택
- Next.js 16.2.6 (App Router)
- React 19.2.4
- TypeScript 5
- Supabase (@supabase/ssr)
- Tailwind CSS 4
- Lucide React (아이콘)

## 구현 범위
| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/types/database.ts` | 신규 | 공통 데이터 타입(Profile, Post, Subject 등) 정의 |
| `src/app/admin/users/page.tsx` | 수정 | `any` 제거, `fetchUsers` 선언 위치 수정, 미사용 임포트 제거 |
| `src/app/admin/subjects/page.tsx` | 수정 | `any` 제거, `fetchSubjects` 선언 위치 수정 |
| `src/app/admin/page.tsx` | 수정 | `any` 제거 및 타입 적용 |
| `src/app/board/[type]/page.tsx` | 수정 | `any` 제거 및 타입 적용 |
| `src/app/board/[type]/[id]/page.tsx` | 수정 | `any` 제거 및 타입 적용 |
| `src/app/board/[type]/new/page.tsx` | 수정 | `any` 제거 및 타입 적용 |
| `src/components/board/*.tsx` | 수정 | `error: any`를 `Error` 또는 구체적 타입으로 변경 |

## 구현 순서
1. **타입 정의**: `src/types/database.ts` 파일을 생성하여 프로젝트 전반에서 사용할 인터페이스를 정의한다.
2. **관리자 페이지 수정**: `src/app/admin` 내의 파일들에서 린트 에러를 해결한다.
3. **게시판 페이지 수정**: `src/app/board` 내의 파일들에서 린트 에러 및 타입 이슈를 해결한다.
4. **공통 컴포넌트 수정**: `src/components/board` 내의 버튼 및 폼 컴포넌트에서 `any` 타입을 제거한다.
5. **빌드 확인**: 모든 수정 후 빌드가 정상적으로 수행되는지 확인하는 단계를 제안한다.

## 기술 결정
- **타입 안정성**: `any` 대신 구체적인 인터페이스를 사용하여 런타임 에러를 방지하고 개발 생산성을 높인다.
- **함수 선언**: `useEffect` 내에서 호출되는 함수는 `useEffect` 상단에 정의하거나 `useCallback`으로 감싸서 "선언 전 참조" 에러를 방지한다.
- **Next.js 15/16 호환성**: `params`와 `searchParams`를 `Promise`로 취급하여 `await`를 사용하는 패턴을 유지한다.

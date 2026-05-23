---
name: dev-orchestrator
description: 소프트웨어 개발 하네스 오케스트레이터. 기능 구현, 버그 수정, 리팩토링, API 개발, 컴포넌트 작성, 코드 리뷰 등 코드를 작성하거나 수정하는 모든 개발 작업에 이 스킬을 사용한다. "만들어줘", "구현해줘", "고쳐줘", "수정해줘", "추가해줘", "리팩토링해줘", "버그 수정", "리뷰해줘", "코드 짜줘" 등의 표현이 포함된 개발 요청이면 반드시 이 스킬을 트리거한다. 재실행, 업데이트, 다시 구현, 이전 결과 개선, 부분 수정 요청도 처리한다.
---

# 소프트웨어 개발 오케스트레이터

Planner → Developer → Reviewer 3단계 파이프라인으로 개발 작업을 처리한다.

**실행 모드:** 서브 에이전트 (순차 파이프라인, 파일 기반 데이터 전달)

## Phase 0: 컨텍스트 확인

`_workspace/` 디렉토리 존재 여부와 사용자 요청 유형을 확인한다:

| 상황 | 실행 모드 | 처리 |
|------|----------|------|
| `_workspace/` 없음 | **초기 실행** | Phase 1부터 전체 실행 |
| `_workspace/` 있음 + "다시", "수정", "개선" | **부분 재실행** | 해당 Phase 에이전트만 재호출 |
| `_workspace/` 있음 + 새 요구사항 | **새 실행** | `_workspace/`를 `_workspace_prev/`로 이동 후 전체 실행 |

## Phase 1: Planner

`.gemini/agents/planner.md`를 읽어 역할과 출력 형식을 확인한 뒤, 아래와 같이 Agent를 호출한다.

```
Agent(
  subagent_type: "general-purpose",
  model: "opus",
  prompt: """
  .gemini/agents/planner.md의 역할 정의, 작업 원칙, 출력 형식을 따른다.

  사용자 요구사항: {사용자 요청 전문}

  1. 프로젝트 루트를 탐색하여 기술 스택과 기존 코드 패턴을 파악한다.
  2. 요구사항과 관련된 기존 파일을 찾아 읽는다.
  3. _workspace/ 디렉토리를 만들고 plan.md를 작성한다.
  """
)
```

## Phase 2: Developer

`.gemini/agents/developer.md`를 읽어 역할을 확인한 뒤, 아래와 같이 Agent를 호출한다.

```
Agent(
  subagent_type: "general-purpose",
  model: "opus",
  prompt: """
  .gemini/agents/developer.md의 역할 정의와 작업 원칙을 따른다.

  1. _workspace/plan.md를 읽는다.
  2. 계획의 구현 순서대로 코드를 작성/수정한다.
  3. 완료 후 _workspace/implementation-notes.md를 작성한다.
  """
)
```

## Phase 3: Reviewer

`.gemini/agents/reviewer.md`를 읽어 역할을 확인한 뒤, 아래와 같이 Agent를 호출한다.

```
Agent(
  subagent_type: "general-purpose",
  model: "opus",
  prompt: """
  .gemini/agents/reviewer.md의 역할 정의, 검토 항목, 출력 형식을 따른다.

  1. _workspace/plan.md, _workspace/implementation-notes.md를 읽는다.
  2. 구현된 코드 파일들을 읽는다.
  3. 교차 검증 후 _workspace/review.md를 작성한다.
  4. Critical 버그가 있으면 직접 수정하고 "수정 완료"로 기록한다.
  """
)
```

## Phase 4: 결과 보고

`_workspace/review.md`를 읽고 사용자에게 다음을 보고한다:
- 구현된 파일 목록
- Critical/Major/Minor 버그 건수
- 확인이 필요한 항목 (있을 경우)
- 다음 단계 제안

## 데이터 전달 경로

```
사용자 요청
  → [Planner] → _workspace/plan.md
  → [Developer] → 코드 파일(들) + _workspace/implementation-notes.md
  → [Reviewer] → _workspace/review.md (+ Critical 버그 수정)
  → 사용자에게 최종 보고
```

## 에러 핸들링

- 에이전트 실패 시 1회 재시도한다.
- 재시도 후에도 실패하면 해당 Phase 없이 다음 Phase로 진행하고 보고서에 명시한다.
- `_workspace/`는 삭제하지 않는다 — 감사 추적 및 재실행을 위해 보존한다.

## 테스트 시나리오

**정상 흐름:**
"로그인 API를 만들어줘" →
Planner: 인증 구조 파악 + plan.md 작성 →
Developer: 코드 구현 →
Reviewer: 보안·로직 검토 + review.md 작성 →
사용자에게 결과 보고

**에러 흐름 (Developer 실패):**
Planner 완료 후 Developer 1회 재시도 →
재시도 실패 시 plan.md만 사용자에게 전달하며 수동 구현 안내

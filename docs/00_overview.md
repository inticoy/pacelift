# 🏋️‍♂️ Notion Workout Logger 기술 명세서

## 1. 프로젝트 개요
- **목표**: Notion을 백엔드 DB로 활용하고 Next.js 웹앱에서 운동 루틴을 손쉽게 일괄 기록(Bulk Insert)할 수 있는 시스템 구축
- **기술 스택**: Next.js(App Router) · Vercel · Notion API SDK
- **핵심 가치**: 복잡한 노션 UI 대신 "루틴 선택 → 수치 입력 → 저장" 3단계만으로 기록 완료

## 2. 데이터베이스 스키마
운동 종목을 관리하는 **Workout DB**와 실제 운동 로그를 저장하는 **Log DB** 두 개의 데이터베이스를 사용합니다.

### 2.1 Workout DB (마스터 데이터)
앱이 운동 선택 리스트를 만들 때 조회(GET)하는 원본 데이터입니다.

| 속성명 | Notion 타입 | 설명 |
| --- | --- | --- |
| Name | Title | 운동 이름 (예: 벤치프레스, 러닝) |
| Type | Select | Strength(근력) / Cardio(유산소) |
| Target | Select | 가슴, 등, 하체, 어깨, 팔, 코어 등 |

### 2.2 Log DB (트랜잭션 데이터)
앱이 운동 기록을 전송(POST)하는 대상 데이터베이스입니다. Speed, Pace, Rollup 속성은 노션이 자동 계산하므로 API로 값을 전송하지 않습니다.

| 속성명 (User) | Notion 타입 | API 키 | 설명 / 전송 여부 |
| --- | --- | --- | --- |
| Title | Title | `Name` | `YYMMDD_운동명` 포맷으로 자동 생성 (필수) |
| Date | Date | `Date` | 운동 수행 날짜 (기본값 Today) |
| Exercises | Relation | `Exercise_Relation` | Workout DB 페이지 ID 배열 (필수) |
| Type | Rollup | - | (읽기 전용) Exercises → Type 참조 |
| Target | Rollup | - | (읽기 전용) Exercises → Target 참조 |
| Weight | Number | `Weight` | 중량 (kg) |
| Sets | Number | `Sets` | 세트 수 |
| Reps | Number | `Reps` | 반복 횟수 |
| Number | Number | `Number` | 기타 숫자 기록 (머신 세팅 등) |
| Min | Number | `Min` | 유산소 시간(분) |
| Sec | Number | `Sec` | 유산소 시간(초) |
| Distance | Number | `Distance` | 거리(km) |
| Cadence | Number | `Cadence` | 분당 회전수/걸음 수 |
| Heart Rate | Number | `Heart_Rate` | 심박수(bpm) |
| Notes | Text | `Notes` | 수행 메모 |
| Speed | Formula | - | (읽기 전용) Min/Sec/Distance 기반 계산 |
| Pace | Formula | - | (읽기 전용) Min/Sec/Distance 기반 계산 |

## 3. 데이터 구조 (프론트엔드 상태)
앱 내부에서 "장바구니"처럼 임시로 쌓아두는 운동 데이터를 위한 타입 정의입니다.

### 3.1 Exercise Item 인터페이스 (TypeScript)
```ts
interface WorkoutSessionItem {
  id: string;             // 임시 UUID (리스트 렌더링용)
  exerciseId: string;     // Notion Workout DB의 Page ID
  exerciseName: string;   // 화면 표시용 이름
  exerciseType: 'Strength' | 'Cardio'; // 입력 폼 분기용
  exerciseTarget: string; // 화면 표시용 (예: 가슴)

  // User Input Data (Nullable)
  weight?: number;
  sets?: number;
  reps?: number;
  min?: number;
  sec?: number;
  distance?: number;
  cadence?: number;
  heartRate?: number;
  notes?: string;
}
```

### 3.2 Routine Config (`constants/routines.ts`)
자주 사용하는 루틴을 사전에 정의해 빠르게 불러옵니다.

```ts
export const ROUTINES = [
  {
    id: 'chest_day',
    label: '🔥 가슴 파괴',
    items: [
      { exerciseId: 'uuid_bench_press', defaultSets: 5 },
      { exerciseId: 'uuid_incline_press', defaultSets: 4 },
      { exerciseId: 'uuid_dips', defaultSets: 3 },
    ],
  },
  {
    id: 'running_easy',
    label: '🏃 Easy Run',
    items: [
      { exerciseId: 'uuid_running', defaultSets: 1 },
    ],
  },
];
```

## 4. UI/UX 흐름 및 와이어프레임

### 4.1 메인 대시보드 (/)
- **헤더**: 날짜 선택기(기본값 오늘)
- **루틴 셀렉터**(가로 스크롤): [가슴], [등], [하체], [러닝] 버튼. 클릭 시 해당 루틴의 운동이 Active List에 일괄 추가
- **Active List**: 운동 카드가 쌓이는 입력 폼 영역. 타입별 입력 필드 노출
  - Strength: Weight, Sets, Reps (Stepper UI 권장)
  - Cardio: Min, Sec, Distance, Avg HR
- **카드 액션**: 각 카드 우측 상단 X 버튼으로 개별 삭제
- **Floating Action Button (+)**: 모달 → 개별 운동 검색 및 추가
- **Footer Action Bar**: [기록 저장하기] 버튼(현재 리스트의 모든 항목 전송)

### 4.2 입력 로직 상세
- 유산소 입력은 Min·Sec 단위를 기본으로 제공하면 UX가 좋음
- Speed/Pace는 입력받지 않고 노션에서 자동 계산
- Title은 사용자가 입력하지 않으며 서버 액션에서 `Format(Date, 'YYMMDD') + '_' + ExerciseName` 형식으로 생성

## 5. API 연동 전략 (Server Actions)

### 5.1 Fetch Exercises (GET)
- 목적: 운동 선택 모달에 뿌릴 Workout DB 데이터 조회
- 최적화: Next.js Data Cache 사용, 변화가 거의 없으므로 `revalidate: 86400`(24시간) 권장

### 5.2 Submit Log (POST)
- 사용자가 [저장]을 누르면 프론트엔드 배열을 순회하며 `Promise.all`로 병렬 전송
- 값이 존재하는 속성만 조건부로 매핑해 payload 구성

```ts
// Server Action: createLog(data)
const response = await notion.pages.create({
  parent: { database_id: LOG_DB_ID },
  properties: {
    Name: {
      title: [{ text: { content: `${yymmdd}_${data.exerciseName}` } }],
    },
    Exercises: {
      relation: [{ id: data.exerciseId }],
    },
    Date: {
      date: { start: data.date },
    },
    ...(data.weight && { Weight: { number: data.weight } }),
    ...(data.sets && { Sets: { number: data.sets } }),
    ...(data.min && { Min: { number: data.min } }),
    ...(data.sec && { Sec: { number: data.sec } }),
    // ... 나머지 필드 매핑
  },
});
```

## 6. 개발 체크리스트
- [ ] Step 1: Notion Workout DB와 Log DB 생성 후 Integration 연결
- [ ] Step 2: Next.js 프로젝트 세팅 (`npx create-next-app@latest`)
- [ ] Step 3: `.env.local`에 `NOTION_KEY`, `LOG_DB_ID`, `WORKOUT_DB_ID` 설정
- [ ] Step 4: Workout DB 데이터를 가져와 ID/이름 매핑 스크립트 작성(상수 생성용)
- [ ] Step 5: UI 컴포넌트 개발 (Routine Selector, Input Card 등)
- [ ] Step 6: Server Action 연동 및 Vercel 배포

## 7. 추가 구현 & 배포 고려사항

### 7.1 프로젝트 세팅
- 패키지 매니저는 `pnpm`으로 통일하고, 루트에 `.npmrc`/`.pnpmfile.cjs` 등을 두어 버전 일관성을 유지합니다.
- Next.js는 16(stable 최신) 버전을 기준으로 App Router + Server Actions 기능을 적극 활용합니다.

### 7.2 Tailwind & 반응형 UI
- Tailwind CSS를 기본 스타일 시스템으로 사용해 디자인 토큰(색상, 폰트, spacing)을 관리합니다.
- 모바일·데스크톱 동시 사용을 위해 컴포넌트 단위로 responsive utility 클래스를 정의하고, Form/Card 레이아웃은 `sm`, `md`, `lg` 브레이크포인트로 분리합니다.

### 7.3 Vercel 배포 및 접근 제어
- Vercel 배포 후 `*.vercel.app` 주소는 기본적으로 전 세계에 공개되므로, 개인 서비스라면 최소한의 인증 장치가 필요합니다.
- 선택지
  1. **NextAuth/Clerk 등 Login Flow**: OAuth(구글/애플) 혹은 Notion 계정을 통한 Sign-in을 붙여 인증된 사용자만 로그 페이지 접근.
  2. **Vercel Password Protection**: Pro 플랜 이상에서 프로젝트 단위 비밀번호 보호 설정.
  3. **IP Allowlist**: 사내 전용이라면 Vercel Edge Middleware로 허용 IP를 필터링.
- 민감한 환경 변수(NOTION_KEY 등)는 Vercel Project Settings → Environment Variables에만 저장하고, 브라우저로 노출되지 않도록 Server Action/Route Handler에서만 사용합니다.
- **MVP 전략**: 초기 버전은 운영자(본인) Notion Integration 토큰 한 개만 `.env`에 넣어 사용하고, 전체 플로우가 안정되면 다중 사용자용 OAuth 토큰 저장을 고려한다.

#### 노션/구글 로그인과 토큰 위임
- Notion API는 아직 *사용자 브라우저에서 직접* API 키를 발급받아 사용하는 방식을 지원하지 않고, 서버 측에서 발급받은 Integration 토큰으로만 접근 가능합니다.
- 대신 **Notion OAuth**를 이용하면 사용자가 Notion 계정으로 로그인한 뒤, 앱이 해당 사용자의 워크스페이스에 접근할 수 있는 액세스 토큰을 *서버에서* 발급받아 저장할 수 있습니다.
- 흐름 예시
  1. 사용자가 NextAuth 등으로 구글 로그인 → 세션 생성.
  2. 동일 세션에서 Notion OAuth 버튼을 제공 → Notion 승인 완료 시 서버 Route Handler가 Authorization Code를 Notion 서버로 교환하여 Access Token/Workspace 정보를 획득.
  3. 해당 토큰을 DB 혹은 Notion 전용 KV에 암호화 저장 → 요청 시 Server Action이 사용자별 토큰으로 Notion API 호출.
- 이 방식은 사용자별로 Notion DB 연결 권한을 부여하거나 회수할 수 있는 장점이 있으나, 여전히 브라우저가 아닌 서버에서 토큰을 안전하게 관리해야 한다는 점을 기억해야 합니다.

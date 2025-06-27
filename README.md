# skybiz-lunch-menu-scrawler-worker

Cloudflare Workers를 사용한 점심 메뉴 이미지 수집 워커입니다.

## 기능

- 카카오톡 채널에서 점심 메뉴 이미지를 자동으로 수집
- 매일 평일 한국시간 오전 9시~11시 50분, 10분 간격으로 자동 실행 (크론 스케줄)
- 수동 트리거 지원
- TypeScript로 작성됨
- GitHub Actions를 통한 자동 배포

## 지원하는 식당

- 삼촌밥차 (uncle)
- 슈마우스 (mouse)  
- 정담 (jundam)

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 배포

#### GitHub Actions 자동 배포 (권장)
```bash
# main 브랜치에 push하면 자동 배포
git push origin main
```

#### 수동 배포
```bash
npm run deploy
```

### 타입 체크
```bash
npm run type-check
```

### 프로덕션 배포
```bash
npm run deploy:production
```

### 테스트 (타입 체크)
```bash
npm test
```

## 사용법

### 자동 실행
매일 평일 (월~금) 한국시간 오전 9시부터 11시 50분까지 10분 간격으로 실행됩니다.

**실행 시간표**: 09:00, 09:10, 09:20, 09:30, 09:40, 09:50, 10:00, 10:10, 10:20, 10:30, 10:40, 10:50, 11:00, 11:10, 11:20, 11:30, 11:40, 11:50

### 수동 실행
```bash
curl -X POST https://your-worker-domain/trigger
```

## 프로젝트 구조

```
.github/
└── workflows/
    └── deploy.yml  # GitHub Actions 배포 워크플로우
src/
├── index.ts        # 메인 워커 코드
└── env.ts          # 환경 타입 정의
wrangler.toml       # Cloudflare Workers 설정
```

## GitHub Actions 배포 설정

### 1. Cloudflare API 토큰 생성
1. [Cloudflare 대시보드](https://dash.cloudflare.com/profile/api-tokens)에서 API 토큰 생성
2. **Custom token** 선택
3. 권한 설정:
   - `Account` - `Cloudflare Workers:Edit`
   - `Zone` - `Zone:Read` (도메인 사용 시)

### 2. GitHub Secrets 설정
GitHub 리포지토리 Settings > Secrets and variables > Actions에서 다음 secrets 추가:

- `CLOUDFLARE_API_TOKEN`: 위에서 생성한 API 토큰
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID (대시보드 우측 사이드바에서 확인)

### 3. 자동 배포
- `main` 브랜치에 push하면 자동으로 배포됩니다
- Pull Request 시에는 타입 체크만 실행됩니다
- Node.js 24 환경에서 실행됩니다

### 4. 워크플로우 단계
1. **Test Job**: TypeScript 타입 체크 실행
2. **Deploy Job**: 테스트 통과 시 Cloudflare Workers에 배포

## 환경 설정

### Cloudflare Workers 설정 (`wrangler.toml`)

- `name`: 워커 이름 (`lunch-menu-scraper`)
- `compatibility_date`: `2024-11-06`
- `compatibility_flags`: `["nodejs_compat"]`
- `triggers.crons`: 한국시간 기준 스케줄 (`"*/10 0-2 * * 1-5"`)

### 크론 스케줄 상세
- **UTC 시간**: `0-2시` (매 10분마다)
- **한국시간**: `9-11시 50분` (매 10분마다)
- **요일**: 월요일~금요일 (평일)

## API 엔드포인트

- `GET /`: 워커 상태 확인
- `POST /trigger`: 수동으로 스크래핑 트리거

## 주요 함수

- `checkWorkDone()`: 오늘 작업이 완료되었는지 확인
- `getImage()`: 특정 카카오톡 채널에서 이미지 URL 가져오기
- `fetchAllImages()`: 모든 채널에서 병렬로 이미지 수집
- `uploadImage()`: 수집된 이미지 정보를 서버에 업로드

## 기술 스택

- **TypeScript** v5.8.3
- **Cloudflare Workers** (Runtime)
- **Wrangler CLI** v4.22.0
- **GitHub Actions** (CI/CD)
- **Node.js** 24 (Development)

## 개발 환경

- Node.js 18+ 권장
- npm 또는 yarn
- Git

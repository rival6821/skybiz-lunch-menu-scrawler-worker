# skybiz-lunch-menu-scrawler-worker

Cloudflare Workers를 사용한 점심 메뉴 이미지 수집 워커입니다.

## 기능

- 카카오톡 채널에서 점심 메뉴 이미지를 자동으로 수집
- 매일 평일 오전 11시에 자동 실행 (크론 스케줄)
- 수동 트리거 지원
- TypeScript로 작성됨

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

## 사용법

### 자동 실행
평일 9시부터 12시까지 10분간격으로 실행

### 수동 실행
```bash
curl -X POST https://your-worker-domain/trigger
```

## 프로젝트 구조

```
src/
├── index.ts    # 메인 워커 코드
└── env.ts      # 환경 타입 정의
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

## 환경 설정

`wrangler.toml` 파일에서 다음 설정을 확인하세요:

- `compatibility_date`: Cloudflare Workers 호환성 날짜
- `triggers.crons`: 크론 스케줄 설정
- `compatibility_flags`: Node.js 호환성 플래그

## API 엔드포인트

- `GET /`: 워커 상태 확인
- `POST /trigger`: 수동으로 스크래핑 트리거

## 주요 함수

- `checkWorkDone()`: 오늘 작업이 완료되었는지 확인
- `getImage()`: 특정 카카오톡 채널에서 이미지 URL 가져오기
- `fetchAllImages()`: 모든 채널에서 병렬로 이미지 수집
- `uploadImage()`: 수집된 이미지 정보를 서버에 업로드

## 기술 스택

- TypeScript
- Cloudflare Workers
- Wrangler CLI

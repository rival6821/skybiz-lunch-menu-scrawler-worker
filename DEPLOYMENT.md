# Cloudflare Workers 배포 가이드

## 1. Wrangler CLI 설치 및 인증

```bash
# Wrangler CLI 전역 설치 (이미 설치되지 않은 경우)
npm install -g wrangler

# Cloudflare 계정으로 로그인
wrangler login
```

## 2. 프로젝트 설정

`wrangler.toml` 파일에서 다음을 확인하세요:

```toml
name = "lunch-menu-scraper"
main = "src/index.ts"
compatibility_date = "2024-11-06"
compatibility_flags = ["nodejs_compat"]

[triggers]
crons = [
  "*/10 0-2 * * 1-5"  # 매일 평일 한국시간 오전 9시~11시 (UTC 0시~2시), 10분마다 실행
]

```

## 3. 배포

```bash
# 프로덕션 배포
npm run deploy

# 또는 직접 wrangler 사용
wrangler deploy
```

## 4. 환경 변수 설정 (필요한 경우)

```bash
# 환경 변수 설정
wrangler secret put API_KEY

# 환경 변수 확인
wrangler secret list
```

## 5. 로그 확인

```bash
# 실시간 로그 확인
wrangler tail

# 특정 배포의 로그 확인
wrangler tail --format=pretty
```

## 6. 워커 관리

```bash
# 워커 목록 확인
wrangler list

# 워커 삭제
wrangler delete [WORKER_NAME]
```

## 트러블슈팅

### 크론 트리거가 작동하지 않는 경우
- Cloudflare 대시보드에서 워커의 트리거 설정을 확인
- 크론 표현식이 올바른지 확인

### 배포 오류
- `wrangler.toml` 설정 확인
- TypeScript 컴파일 오류 확인: `npm run type-check`

### API 호출 실패
- 외부 API 접근 권한 확인
- CORS 설정 확인

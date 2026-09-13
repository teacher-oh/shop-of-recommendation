# Shop of Recommendation

사기 전에 비교하고, 왜 추천하는지 확인하는 상품 큐레이션 사이트입니다.

## 현재 구성

- 반응형 프리미엄 쇼핑 UI
- 28개 카테고리 탐색
- 검색 / 필터 / 정렬
- BEST / 가성비 / 신상품 / 저장됨
- 최근 본 상품
- 최대 3개 상품 비교
- 상품 상세 모달
- 브라우저 localStorage 기반 개인화
- API 상품 데이터 자동 로딩
- `data/products.json` 공개 카탈로그 스냅샷
- `data/catalog.db.json` 상품 / 가격 이력 / 수집 실행 기록 DB 스냅샷
- GitHub Actions 6시간 자동 수집

## API 소스

현재 파이프라인은 다음 공식 API 어댑터를 사용합니다.

- eBay Browse API
- Best Buy Products API
- Amazon Creators API (계정별 인증 구성 후 활성화)
- Etsy Open API v3

Coupang은 사용하지 않습니다. 비공식 스크래핑도 사용하지 않습니다.

## GitHub Actions Secrets

저장소 Settings → Secrets and variables → Actions에 API 자격정보를 추가하면 됩니다.

- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`
- `BESTBUY_API_KEY`
- `AMAZON_ACCESS_KEY`
- `AMAZON_SECRET_KEY`
- `ETSY_API_KEY`
- `ETSY_ACCESS_TOKEN`

값 자체는 채팅이나 코드에 넣지 마세요.

## 데이터 흐름

`공식 API → collector → 정규화/중복제거 → catalog DB JSON → products.json → GitHub Pages UI`

GitHub Pages는 정적 호스팅이므로 서버 DB를 직접 실행하는 대신 수집 작업에서 DB 스냅샷을 만들고 사이트에는 공개 카탈로그 JSON을 배포합니다. 추후 Supabase 같은 외부 DB를 붙이면 실시간 가격 이력과 사용자 계정 기능으로 확장할 수 있습니다.

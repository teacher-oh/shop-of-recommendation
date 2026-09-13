# Mock Supplier API

이 폴더는 실제 쇼핑몰/마켓 API를 연결하기 전에 **상품 공급 → 리뷰 → 카테고리 → 브랜드 분리 → 필터링** 파이프라인을 연습하기 위한 가상 공급처입니다.

- 모든 데이터는 가상입니다.
- 리뷰는 실제 고객 리뷰가 아닙니다.
- `mock: true`와 `sourceType: "mock"`를 유지해야 합니다.
- 나중에 실제 공급처를 연결할 때도 같은 JSON 구조를 유지하면 프론트엔드 코드를 크게 바꾸지 않아도 됩니다.

## 파일 구조

- `products.json` — 상품 원본
- `reviews.json` — 상품과 `productId`로 연결된 리뷰 원본
- `categories.json` — 카테고리별 상품 수
- `brands.json` — 브랜드별 상품 수
- `index.json` — 공급처 메타데이터와 가상 엔드포인트 규격

실제 API를 붙일 때는 이 스키마를 기준으로 provider adapter가 외부 응답을 정규화하도록 만듭니다.

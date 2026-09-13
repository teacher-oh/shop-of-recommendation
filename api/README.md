# Provider adapters

The site uses a provider-adapter boundary so marketplace APIs can be added, removed, or replaced without changing the evaluation engine.

## Current provider

- `api/adapters/ebay.js` — eBay Browse API search adapter.
- `api/provider-registry.js` — safe registry; unavailable providers are skipped instead of failing the whole request.

## Environment variables

Never commit API credentials to GitHub. Configure them in the server/deployment environment or GitHub Actions Secrets.

```text
EBAY_CLIENT_ID=
EBAY_CLIENT_SECRET=
EBAY_MARKETPLACE_ID=EBAY_US
EBAY_API_BASE_URL=https://api.ebay.com
EBAY_LIMIT=20
SEARCH_QUERY=
```

The eBay Browse API uses an application access token obtained through the client-credentials flow. Production use of eBay Buy APIs requires the applicable eBay production approval/partner process; sandbox credentials can be used while developing.

## Data contract

Adapters return normalized observations with:

- source/sourceId
- brand/name/image
- price/currency
- seller rating and seller feedback count (kept separate from product review ratings)
- URL/category/categoryId
- country
- evidence metadata such as observedAt, GTIN/EPID, and condition

Do not treat seller feedback as product quality. The evaluation engine must keep marketplace observations, product reviews, manufacturer claims, and independent measurements as separate evidence classes.

## Adding another provider

1. Create `api/adapters/<provider>.js` with `search()` and `run()`.
2. Normalize into the same observation contract.
3. Register it in `api/provider-registry.js`.
4. Add an adapter-level mock test before enabling production credentials.
5. Keep credentials out of source control.

# Mock API

This project already includes a working mock backend.

Use it exactly like a real API.

Do not change API endpoint names, request shapes, or response shapes.

## What this gives you

- Contract-aligned endpoints
- Mock datasets
- Filtering
- Pagination
- Validation
- Error simulation (500, 503, 429, timeout, slow)

## Super simple setup (first time only)

1. Make sure you are using Node.js 22 or newer.
2. Install dependencies:

```bash
npm install
```

3. Generate the Mock Service Worker file:

```bash
npm run setup:mocks
```

This creates `public/mockServiceWorker.js`.

## Start the app

Run:

```bash
npm run dev
```

By default, the mock API is automatically enabled when the app starts.

## Quick check that mocks are running

After starting the app:

1. Open your browser to the Vite URL (usually http://localhost:5173).
2. Open Developer Tools, then open the Network tab.
3. Refresh the page.
4. You should see API calls to paths like `/api/health` and other `/api/...` routes.

If those calls return data, the mock API is working.

## Main endpoints

| Method | Endpoint |
|---|---|
| POST | `/api/provider-searches` |
| GET | `/api/provider-searches/:searchId/providers` |
| GET | `/api/providers/:providerId` |
| GET | `/api/providers/:providerId/reviews` |
| GET | `/api/providers/:providerId/availability` |
| GET | `/api/property-types` |
| GET | `/api/filter-options` |
| POST | `/api/analytics/events` |
| GET | `/api/health` |

Tip for fast UI work: you can use `searchId=demo` to load results directly.

## Provider search for form submission
| POST | `/api/provider-searches` |

example payload:
{
    movingFromPostcode: 'LS146QH',
    movingToPostcode: 'PO198TR',
    propertyType: 'flat',
    bedrooms: 2,
    movingDate: '2026-09-01',
}

successful submission returns searchId

## Provider list query parameters

Use these on `GET /api/provider-searches/:searchId/providers`:

- `page`
- `pageSize` (max 50)
- `sort`
- `minimumRating`
- `minimumPrice` (pence)
- `maximumPrice` (pence)
- `maximumDistance` (miles)
- `verifiedOnly`
- `weekendAvailable`
- `services` (comma-separated)
- `availability`

## Simulate errors and slow responses

Add `scenario=...` to supported endpoints.

Examples:

- `/api/provider-searches/demo/providers?scenario=slow`
- `/api/provider-searches/demo/providers?scenario=rate-limit`

Scenarios:

- `slow` -> about 3 seconds delay
- `server-error` -> HTTP 500
- `service-unavailable` -> HTTP 503
- `timeout` -> HTTP 504
- `rate-limit` -> HTTP 429 with `Retry-After: 5`
- `empty` -> empty provider list
- `malformed` -> intentionally invalid provider payload

Normal responses also include a small delay (default 500ms).

## Turn mocks off (optional)

If you need to disable mocks, set:

- `VITE_ENABLE_MOCK_API=false`

Then restart the dev server.

## Common beginner issues

1. I ran `npm run dev` but API calls fail immediately.
Cause: `public/mockServiceWorker.js` was not generated.
Fix: run `npm run setup:mocks`, then restart `npm run dev`.

2. I changed endpoint names and now things break.
Cause: contract mismatch.
Fix: revert endpoint/contract changes and consume the API as provided.

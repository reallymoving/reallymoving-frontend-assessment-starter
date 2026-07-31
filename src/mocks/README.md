# Mock REST API

This directory contains the supplied Mock Service Worker implementation for the Reallymoving Front-End Engineering Technical Assessment.

The mock service implements the API contract supplied in **Part 4 — Mock API Contract and Data Integration Specification**. Candidates consume it as an independently owned REST service; they should not need to modify it to complete the core exercise.

## Setup

After installing dependencies, generate the MSW browser worker once:

```bash
npm run setup:mocks
```

This creates `public/mockServiceWorker.js`. Commit that generated file to the candidate repository so local development and deployed preview environments work consistently.

## Structure

```text
src/mocks/
├── data/
│   ├── providers.json
│   ├── reviews.json
│   ├── property-types.json
│   └── filter-options.json
├── handlers/
│   ├── analytics.handlers.ts
│   ├── health.handlers.ts
│   ├── provider-search.handlers.ts
│   ├── provider.handlers.ts
│   ├── reference-data.handlers.ts
│   ├── review.handlers.ts
│   └── index.ts
├── browser.ts
├── helpers.ts
├── server.ts
├── store.ts
├── types.ts
└── validation.ts
```

## Endpoints

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

Use `searchId=demo` for direct results-page development without first creating a search. The finished customer journey should create a search via `POST /api/provider-searches` and use the returned identifier.

## Failure simulation

Append one of the following query-string values to supported endpoints:

| Query | Behaviour |
|---|---|
| `scenario=slow` | Approximately three-second response delay |
| `scenario=server-error` | HTTP 500, retryable |
| `scenario=service-unavailable` | HTTP 503, retryable |
| `scenario=timeout` | HTTP 504, retryable |
| `scenario=rate-limit` | HTTP 429 with `Retry-After: 5` |
| `scenario=empty` | Empty provider collection |
| `scenario=malformed` | Deliberately invalid provider payload |

Normal requests use `VITE_MOCK_DEFAULT_DELAY_MS`, defaulting to 500 milliseconds.

## Supported provider query parameters

- `page`
- `pageSize` — capped at 50
- `sort`
- `minimumRating`
- `minimumPrice` — pence
- `maximumPrice` — pence
- `maximumDistance` — miles
- `verifiedOnly`
- `weekendAvailable`
- `services` — comma-separated service codes; all requested services must match
- `availability`

## Supported provider sort modes

- `best-match`
- `price-low-to-high`
- `price-high-to-low`
- `rating-high-to-low`
- `reviews-high-to-low`
- `distance-nearest`
- `newest`

Sorting is deterministic and falls back to company name when primary values are equal.

## Supplied data

The dataset contains:

- 24 synthetic providers;
- at least three providers without ratings/reviews;
- at least three unverified providers;
- more than five providers with weekend availability;
- at least four recommended providers;
- varied prices, distances, availability and service combinations;
- more than 20 synthetic reviews;
- no production customer or provider data.

## Candidate-owned concerns

The supplied mock API intentionally does not make candidate decisions about:

- API client design;
- runtime response validation;
- retry policy;
- timeouts and request cancellation;
- request deduplication;
- query keys and cache invalidation;
- server-state library choice;
- favourites, compare-list or recently viewed state;
- authentication architecture.

Those concerns remain part of the assessment.

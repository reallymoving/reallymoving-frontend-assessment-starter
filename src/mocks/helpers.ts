import { delay, HttpResponse } from 'msw';
import type { ApiError, Pagination, ResponseMeta } from './types';

const configuredDelay = Number(import.meta.env.VITE_MOCK_DEFAULT_DELAY_MS ?? 500);
const normalDelay = Number.isFinite(configuredDelay) ? configuredDelay : 500;

export function createRequestId(): string {
  return `req_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
}

export function createMeta(): ResponseMeta {
  return {
    requestId: createRequestId(),
    generatedAt: new Date().toISOString(),
  };
}

export function createApiError(
  code: string,
  message: string,
  retryable: boolean,
  fieldErrors?: ApiError['error']['fieldErrors'],
): ApiError {
  return {
    error: {
      code,
      message,
      ...(fieldErrors?.length ? { fieldErrors } : {}),
      retryable,
      requestId: createRequestId(),
    },
  };
}

export function createPagination(
  page: number,
  pageSize: number,
  totalItems: number,
): Pagination {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}

export function readPositiveInteger(
  value: string | null,
  fallback: number,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

export function readOptionalNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export async function applyScenario(url: URL): Promise<HttpResponse | null> {
  const scenario = url.searchParams.get('scenario');

  if (scenario === 'slow') {
    await delay(3000);
  } else {
    await delay(normalDelay);
  }

  switch (scenario) {
    case 'server-error':
      return HttpResponse.json(
        createApiError(
          'UNEXPECTED_ERROR',
          'The provider service encountered an unexpected error.',
          true,
        ),
        { status: 500 },
      );
    case 'service-unavailable':
      return HttpResponse.json(
        createApiError(
          'SERVICE_UNAVAILABLE',
          'Provider results are temporarily unavailable. Please try again.',
          true,
        ),
        { status: 503 },
      );
    case 'timeout':
      return HttpResponse.json(
        createApiError('REQUEST_TIMEOUT', 'The request took too long to complete.', true),
        { status: 504 },
      );
    case 'rate-limit':
      return HttpResponse.json(
        createApiError(
          'RATE_LIMIT_EXCEEDED',
          'Too many requests have been made. Please wait before trying again.',
          true,
        ),
        { status: 429, headers: { 'Retry-After': '5' } },
      );
    default:
      return null;
  }
}

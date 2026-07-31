import { http, HttpResponse } from 'msw';
import {
  applyScenario,
  createApiError,
  createMeta,
  createPagination,
  readOptionalNumber,
  readPositiveInteger,
} from '../helpers';
import { providers, reviews } from '../store';
import type { Review, ReviewSort } from '../types';

const supportedSorts: ReviewSort[] = [
  'newest',
  'oldest',
  'rating-high-to-low',
  'rating-low-to-high',
];

function sortReviews(items: Review[], sort: ReviewSort): Review[] {
  return [...items].sort((a, b) => {
    let difference = 0;
    switch (sort) {
      case 'oldest':
        difference = Date.parse(a.createdAt) - Date.parse(b.createdAt);
        break;
      case 'rating-high-to-low':
        difference = b.rating - a.rating;
        break;
      case 'rating-low-to-high':
        difference = a.rating - b.rating;
        break;
      case 'newest':
      default:
        difference = Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
    return difference || a.id.localeCompare(b.id);
  });
}

export const reviewHandlers = [
  http.get('/api/providers/:providerId/reviews', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenarioResponse = await applyScenario(url);
    if (scenarioResponse) return scenarioResponse;

    const providerId = String(params.providerId);
    if (!providers.some((provider) => provider.id === providerId)) {
      return HttpResponse.json(
        createApiError('PROVIDER_NOT_FOUND', 'The requested provider could not be found.', false),
        { status: 404 },
      );
    }

    let result = reviews.filter((review) => review.providerId === providerId);
    const minimumRating = readOptionalNumber(url.searchParams.get('minimumRating'));
    if (minimumRating !== undefined) {
      result = result.filter((review) => review.rating >= minimumRating);
    }

    const requestedSort = url.searchParams.get('sort') as ReviewSort | null;
    const sort = requestedSort && supportedSorts.includes(requestedSort) ? requestedSort : 'newest';
    result = sortReviews(result, sort);

    const page = readPositiveInteger(url.searchParams.get('page'), 1);
    const pageSize = readPositiveInteger(url.searchParams.get('pageSize'), 5, 50);
    const pagination = createPagination(page, pageSize, result.length);
    const startIndex = (page - 1) * pageSize;

    return HttpResponse.json({
      data: result.slice(startIndex, startIndex + pageSize),
      pagination,
      meta: createMeta(),
    });
  }),
];

import { http, HttpResponse } from 'msw';
import {
  applyScenario,
  createApiError,
  createMeta,
  createPagination,
  readOptionalNumber,
  readPositiveInteger,
} from '../helpers';
import { providers, searches } from '../store';
import type {
  AvailabilityStatus,
  ProviderDetails,
  ProviderSort,
  ProviderSummary,
  ServiceCode,
} from '../types';
import { validateSearchCriteria } from '../validation';

const supportedSorts: ProviderSort[] = [
  'best-match',
  'price-low-to-high',
  'price-high-to-low',
  'rating-high-to-low',
  'reviews-high-to-low',
  'distance-nearest',
  'newest',
];

const availabilityStatuses: AvailabilityStatus[] = [
  'available',
  'limited',
  'unavailable',
  'contact-required',
];

function toSummary(provider: ProviderDetails): ProviderSummary {
  const {
    fullDescription: _fullDescription,
    contact: _contact,
    serviceAreas: _serviceAreas,
    insurance: _insurance,
    accreditations: _accreditations,
    awards: _awards,
    features: _features,
    reviewSummary: _reviewSummary,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...summary
  } = provider;
  return summary;
}

function compareName(a: ProviderDetails, b: ProviderDetails): number {
  return a.companyName.localeCompare(b.companyName, 'en-GB');
}

function sortProviders(items: ProviderDetails[], sort: ProviderSort): ProviderDetails[] {
  return [...items].sort((a, b) => {
    let difference = 0;
    switch (sort) {
      case 'price-low-to-high':
        difference = a.estimatedPrice.amount - b.estimatedPrice.amount;
        break;
      case 'price-high-to-low':
        difference = b.estimatedPrice.amount - a.estimatedPrice.amount;
        break;
      case 'rating-high-to-low':
        difference = (b.rating?.average ?? -1) - (a.rating?.average ?? -1);
        if (difference === 0) {
          difference = (b.rating?.reviewCount ?? 0) - (a.rating?.reviewCount ?? 0);
        }
        break;
      case 'reviews-high-to-low':
        difference = (b.rating?.reviewCount ?? 0) - (a.rating?.reviewCount ?? 0);
        break;
      case 'distance-nearest':
        difference = a.distanceMiles - b.distanceMiles;
        break;
      case 'newest':
        difference = Date.parse(b.createdAt) - Date.parse(a.createdAt);
        break;
      case 'best-match':
      default: {
        const score = (provider: ProviderDetails): number =>
          (provider.recommended ? 1000 : 0) +
          (provider.verified ? 500 : 0) +
          (provider.rating?.average ?? 0) * 100 +
          Math.min(provider.rating?.reviewCount ?? 0, 500) -
          provider.distanceMiles * 2 -
          provider.estimatedPrice.amount / 10_000;
        difference = score(b) - score(a);
      }
    }
    return difference || compareName(a, b);
  });
}

export const providerSearchHandlers = [
  http.post('/api/provider-searches', async ({ request }) => {
    const scenarioResponse = await applyScenario(new URL(request.url));
    if (scenarioResponse) return scenarioResponse;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        createApiError('INVALID_JSON', 'The request body must contain valid JSON.', false),
        { status: 400 },
      );
    }

    const { criteria, errors } = validateSearchCriteria(body);
    if (!criteria || errors.length > 0) {
      return HttpResponse.json(
        createApiError(
          'VALIDATION_FAILED',
          'One or more search fields are invalid.',
          false,
          errors,
        ),
        { status: 422 },
      );
    }

    const searchId = `search_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
    const createdAt = new Date().toISOString();
    searches.set(searchId, criteria);

    return HttpResponse.json(
      {
        data: { searchId, criteria, createdAt },
        meta: createMeta(),
      },
      { status: 201 },
    );
  }),

  http.get('/api/provider-searches/:searchId/providers', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenarioResponse = await applyScenario(url);
    if (scenarioResponse) return scenarioResponse;

    const searchId = String(params.searchId);
    if (!searches.has(searchId) && searchId !== 'demo') {
      return HttpResponse.json(
        createApiError('SEARCH_NOT_FOUND', 'The requested search could not be found.', false),
        { status: 404 },
      );
    }

    if (url.searchParams.get('scenario') === 'empty') {
      const page = readPositiveInteger(url.searchParams.get('page'), 1);
      const pageSize = readPositiveInteger(url.searchParams.get('pageSize'), 10, 50);
      return HttpResponse.json({
        data: [],
        pagination: createPagination(page, pageSize, 0),
        meta: createMeta(),
      });
    }

    let result = [...providers];
    const minimumRating = readOptionalNumber(url.searchParams.get('minimumRating'));
    const minimumPrice = readOptionalNumber(url.searchParams.get('minimumPrice'));
    const maximumPrice = readOptionalNumber(url.searchParams.get('maximumPrice'));
    const maximumDistance = readOptionalNumber(url.searchParams.get('maximumDistance'));
    const verifiedOnly = url.searchParams.get('verifiedOnly') === 'true';
    const weekendAvailable = url.searchParams.get('weekendAvailable') === 'true';
    const availability = url.searchParams.get('availability') as AvailabilityStatus | null;
    const services = (url.searchParams.get('services') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean) as ServiceCode[];

    if (minimumRating !== undefined) {
      result = result.filter(
        (provider) => provider.rating !== null && provider.rating.average >= minimumRating,
      );
    }
    if (minimumPrice !== undefined) {
      result = result.filter((provider) => provider.estimatedPrice.amount >= minimumPrice);
    }
    if (maximumPrice !== undefined) {
      result = result.filter((provider) => provider.estimatedPrice.amount <= maximumPrice);
    }
    if (maximumDistance !== undefined) {
      result = result.filter((provider) => provider.distanceMiles <= maximumDistance);
    }
    if (verifiedOnly) result = result.filter((provider) => provider.verified);
    if (weekendAvailable) {
      result = result.filter((provider) => provider.availability.weekendAvailable);
    }
    if (availability && availabilityStatuses.includes(availability)) {
      result = result.filter((provider) => provider.availability.status === availability);
    }
    if (services.length > 0) {
      result = result.filter((provider) =>
        services.every((service) => provider.services.includes(service)),
      );
    }

    const requestedSort = url.searchParams.get('sort') as ProviderSort | null;
    const sort = requestedSort && supportedSorts.includes(requestedSort) ? requestedSort : 'best-match';
    result = sortProviders(result, sort);

    const page = readPositiveInteger(url.searchParams.get('page'), 1);
    const pageSize = readPositiveInteger(url.searchParams.get('pageSize'), 10, 50);
    const pagination = createPagination(page, pageSize, result.length);
    const startIndex = (page - 1) * pageSize;
    let data = result.slice(startIndex, startIndex + pageSize).map(toSummary);

    if (url.searchParams.get('scenario') === 'malformed' && data.length > 0) {
      data = data.map((provider, index) =>
        index === 0
          ? ({ ...provider, companyName: undefined, rating: { average: '4.8', reviewCount: 10 } } as unknown as ProviderSummary)
          : provider,
      );
    }

    return HttpResponse.json({ data, pagination, meta: createMeta() });
  }),
];

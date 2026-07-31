import { http, HttpResponse } from 'msw';
import { addDays, applyScenario, createApiError, createMeta } from '../helpers';
import { providers } from '../store';

export const providerHandlers = [
  http.get('/api/providers/:providerId', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenarioResponse = await applyScenario(url);
    if (scenarioResponse) return scenarioResponse;

    const provider = providers.find((item) => item.id === String(params.providerId));
    if (!provider) {
      return HttpResponse.json(
        createApiError('PROVIDER_NOT_FOUND', 'The requested provider could not be found.', false),
        { status: 404 },
      );
    }

    if (url.searchParams.get('scenario') === 'malformed') {
      return HttpResponse.json({
        data: { ...provider, companyName: undefined, updatedAt: 'not-a-date' },
        meta: createMeta(),
      });
    }

    return HttpResponse.json({ data: provider, meta: createMeta() });
  }),

  http.get('/api/providers/:providerId/availability', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenarioResponse = await applyScenario(url);
    if (scenarioResponse) return scenarioResponse;

    const provider = providers.find((item) => item.id === String(params.providerId));
    if (!provider) {
      return HttpResponse.json(
        createApiError('PROVIDER_NOT_FOUND', 'The requested provider could not be found.', false),
        { status: 404 },
      );
    }

    const movingDate = url.searchParams.get('movingDate');
    if (!movingDate || !/^\d{4}-\d{2}-\d{2}$/.test(movingDate)) {
      return HttpResponse.json(
        createApiError(
          'VALIDATION_FAILED',
          'One or more fields are invalid.',
          false,
          [
            {
              field: 'movingDate',
              code: 'INVALID_DATE',
              message: 'A valid movingDate query parameter is required.',
            },
          ],
        ),
        { status: 422 },
      );
    }

    const alternativeDates =
      provider.availability.status === 'available'
        ? [addDays(movingDate, 1), addDays(movingDate, 2)]
        : provider.availability.status === 'limited'
          ? [addDays(movingDate, 2), addDays(movingDate, 3)]
          : [addDays(movingDate, 7), addDays(movingDate, 8)];

    return HttpResponse.json({
      data: {
        providerId: provider.id,
        requestedDate: movingDate,
        status: provider.availability.status,
        alternativeDates,
        lastCheckedAt: new Date().toISOString(),
      },
      meta: createMeta(),
    });
  }),
];

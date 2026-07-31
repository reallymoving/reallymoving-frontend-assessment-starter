import { http, HttpResponse } from 'msw';
import { applyScenario, createApiError } from '../helpers';
import { analyticsEvents } from '../store';
import { isAnalyticsEvent } from '../validation';

export const analyticsHandlers = [
  http.post('/api/analytics/events', async ({ request }) => {
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

    if (!isAnalyticsEvent(body)) {
      return HttpResponse.json(
        createApiError('INVALID_ANALYTICS_EVENT', 'The analytics event is invalid.', false),
        { status: 400 },
      );
    }

    analyticsEvents.push(body);
    return new HttpResponse(null, { status: 204 });
  }),
];

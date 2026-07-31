import { http, HttpResponse } from 'msw';
import filterOptions from '../data/filter-options.json';
import propertyTypes from '../data/property-types.json';
import { applyScenario, createMeta } from '../helpers';

export const referenceDataHandlers = [
  http.get('/api/property-types', async ({ request }) => {
    const scenarioResponse = await applyScenario(new URL(request.url));
    if (scenarioResponse) return scenarioResponse;
    return HttpResponse.json({ data: propertyTypes, meta: createMeta() });
  }),

  http.get('/api/filter-options', async ({ request }) => {
    const scenarioResponse = await applyScenario(new URL(request.url));
    if (scenarioResponse) return scenarioResponse;
    return HttpResponse.json({ data: filterOptions, meta: createMeta() });
  }),
];

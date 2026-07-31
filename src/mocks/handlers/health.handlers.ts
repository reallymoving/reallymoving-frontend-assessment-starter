import { http, HttpResponse } from 'msw';

export const healthHandlers = [
  http.get('/api/health', () =>
    HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }),
  ),
];

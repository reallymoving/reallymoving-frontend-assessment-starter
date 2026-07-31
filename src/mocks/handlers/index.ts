import { analyticsHandlers } from './analytics.handlers';
import { healthHandlers } from './health.handlers';
import { providerHandlers } from './provider.handlers';
import { providerSearchHandlers } from './provider-search.handlers';
import { referenceDataHandlers } from './reference-data.handlers';
import { reviewHandlers } from './review.handlers';

export const handlers = [
  ...healthHandlers,
  ...referenceDataHandlers,
  ...providerSearchHandlers,
  ...providerHandlers,
  ...reviewHandlers,
  ...analyticsHandlers,
];

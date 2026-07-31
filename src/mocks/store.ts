import providersJson from './data/providers.json';
import reviewsJson from './data/reviews.json';
import type { ProviderDetails, ProviderSearchCriteria, Review } from './types';

export const providers = providersJson as ProviderDetails[];
export const reviews = reviewsJson as Review[];
export const searches = new Map<string, ProviderSearchCriteria>();
export const analyticsEvents: unknown[] = [];

export function resetMockState(): void {
  searches.clear();
  analyticsEvents.length = 0;
}

export type PropertyType =
  | 'flat'
  | 'terraced-house'
  | 'semi-detached-house'
  | 'detached-house'
  | 'bungalow'
  | 'other';

export type ServiceCode =
  | 'home-removals'
  | 'packing'
  | 'unpacking'
  | 'storage'
  | 'furniture-disassembly'
  | 'furniture-assembly'
  | 'specialist-items'
  | 'weekend-moves';

export type AvailabilityStatus =
  | 'available'
  | 'limited'
  | 'unavailable'
  | 'contact-required';

export type ProviderBadgeCode =
  | 'verified'
  | 'recommended'
  | 'top-rated'
  | 'long-established'
  | 'eco-conscious'
  | 'fast-response';

export type ProviderSort =
  | 'best-match'
  | 'price-low-to-high'
  | 'price-high-to-low'
  | 'rating-high-to-low'
  | 'reviews-high-to-low'
  | 'distance-nearest'
  | 'newest';

export type ReviewSort =
  | 'newest'
  | 'oldest'
  | 'rating-high-to-low'
  | 'rating-low-to-high';

export type AnalyticsEventName =
  | 'provider_search_submitted'
  | 'provider_results_loaded'
  | 'provider_viewed'
  | 'provider_favourited'
  | 'provider_unfavourited'
  | 'provider_added_to_compare'
  | 'provider_removed_from_compare'
  | 'comparison_viewed'
  | 'filter_applied'
  | 'sort_changed';

export interface Money {
  amount: number;
  currency: 'GBP';
}

export interface ProviderSearchCriteria {
  movingFromPostcode: string;
  movingToPostcode: string;
  propertyType: PropertyType;
  bedrooms: number;
  movingDate: string;
}

export interface ProviderRating {
  average: number;
  reviewCount: number;
}

export interface ProviderAvailability {
  status: AvailabilityStatus;
  earliestAvailableDate: string | null;
  weekendAvailable: boolean;
}

export interface ProviderBadge {
  code: ProviderBadgeCode;
  label: string;
}

export interface ProviderSummary {
  id: string;
  companyName: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
  rating: ProviderRating | null;
  estimatedPrice: Money;
  distanceMiles: number;
  yearsTrading: number;
  verified: boolean;
  recommended: boolean;
  availability: ProviderAvailability;
  badges: ProviderBadge[];
  services: ServiceCode[];
}

export interface ProviderContact {
  telephone: string;
  email: string;
  websiteUrl: string | null;
}

export interface InsuranceDetails {
  goodsInTransit: boolean;
  goodsInTransitLimit: Money | null;
  publicLiability: boolean;
  publicLiabilityLimit: Money | null;
}

export interface Accreditation {
  id: string;
  name: string;
  reference: string;
}

export interface Award {
  id: string;
  name: string;
  year: number;
}

export interface ProviderFeatures {
  packingService: boolean;
  unpackingService: boolean;
  storageAvailable: boolean;
  weekendMoves: boolean;
  furnitureAssembly: boolean;
  specialistItems: boolean;
  instantBooking: boolean;
}

export interface ReviewSummary {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface ProviderDetails extends ProviderSummary {
  fullDescription: string;
  contact: ProviderContact;
  serviceAreas: string[];
  insurance: InsuranceDetails;
  accreditations: Accreditation[];
  awards: Award[];
  features: ProviderFeatures;
  reviewSummary: ReviewSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  providerId: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  moveDate: string;
  createdAt: string;
  verifiedCustomer: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ResponseMeta {
  requestId: string;
  generatedAt: string;
}

export interface ResourceResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export interface CollectionResponse<T> {
  data: T[];
  pagination: Pagination;
  meta: ResponseMeta;
}

export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    fieldErrors?: FieldError[];
    retryable: boolean;
    requestId: string;
  };
}

export interface ProviderSearchRecord {
  searchId: string;
  criteria: ProviderSearchCriteria;
  createdAt: string;
}

export interface ProviderAvailabilityResult {
  providerId: string;
  requestedDate: string;
  status: AvailabilityStatus;
  alternativeDates: string[];
  lastCheckedAt: string;
}

export interface AnalyticsEvent {
  eventName: AnalyticsEventName;
  occurredAt: string;
  properties: Record<string, string | number | boolean | null>;
}

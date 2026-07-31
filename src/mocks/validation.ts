import type {
  AnalyticsEvent,
  FieldError,
  PropertyType,
  ProviderSearchCriteria,
} from './types';

const propertyTypes: PropertyType[] = [
  'flat',
  'terraced-house',
  'semi-detached-house',
  'detached-house',
  'bungalow',
  'other',
];

const ukPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function normalisePostcode(value: string): string {
  return value.replaceAll(/\s/g, '').toUpperCase();
}

function isValidIsoDate(value: string): boolean {
  if (!isoDatePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateSearchCriteria(body: unknown): {
  criteria?: ProviderSearchCriteria;
  errors: FieldError[];
} {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      errors: [
        {
          field: 'body',
          code: 'INVALID_BODY',
          message: 'Request body must be a JSON object.',
        },
      ],
    };
  }

  const candidate = body as Partial<Record<keyof ProviderSearchCriteria, unknown>>;
  const errors: FieldError[] = [];

  const movingFromPostcode =
    typeof candidate.movingFromPostcode === 'string'
      ? candidate.movingFromPostcode.trim()
      : '';
  const movingToPostcode =
    typeof candidate.movingToPostcode === 'string' ? candidate.movingToPostcode.trim() : '';
  const propertyType = candidate.propertyType;
  const bedrooms = candidate.bedrooms;
  const movingDate = typeof candidate.movingDate === 'string' ? candidate.movingDate : '';

  if (!movingFromPostcode) {
    errors.push({
      field: 'movingFromPostcode',
      code: 'REQUIRED',
      message: 'Moving-from postcode is required.',
    });
  } else if (!ukPostcodePattern.test(movingFromPostcode)) {
    errors.push({
      field: 'movingFromPostcode',
      code: 'INVALID_POSTCODE',
      message: 'Enter a valid UK postcode.',
    });
  }

  if (!movingToPostcode) {
    errors.push({
      field: 'movingToPostcode',
      code: 'REQUIRED',
      message: 'Moving-to postcode is required.',
    });
  } else if (!ukPostcodePattern.test(movingToPostcode)) {
    errors.push({
      field: 'movingToPostcode',
      code: 'INVALID_POSTCODE',
      message: 'Enter a valid UK postcode.',
    });
  }

  if (
    movingFromPostcode &&
    movingToPostcode &&
    normalisePostcode(movingFromPostcode) === normalisePostcode(movingToPostcode)
  ) {
    errors.push({
      field: 'movingToPostcode',
      code: 'POSTCODES_MATCH',
      message: 'Moving-to postcode must be different from moving-from postcode.',
    });
  }

  if (typeof propertyType !== 'string' || !propertyTypes.includes(propertyType as PropertyType)) {
    errors.push({
      field: 'propertyType',
      code: 'INVALID_PROPERTY_TYPE',
      message: 'Select a supported property type.',
    });
  }

  if (!Number.isInteger(bedrooms) || (bedrooms as number) < 0 || (bedrooms as number) > 10) {
    errors.push({
      field: 'bedrooms',
      code: 'OUT_OF_RANGE',
      message: 'Bedrooms must be between 0 and 10.',
    });
  }

  if (!isValidIsoDate(movingDate)) {
    errors.push({
      field: 'movingDate',
      code: 'INVALID_DATE',
      message: 'Enter a valid moving date.',
    });
  } else {
    const today = new Date();
    const todayIso = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const moving = new Date(`${movingDate}T00:00:00Z`);
    const latest = new Date(todayIso);
    latest.setUTCFullYear(latest.getUTCFullYear() + 2);

    if (moving < todayIso) {
      errors.push({
        field: 'movingDate',
        code: 'DATE_IN_PAST',
        message: 'The moving date must be today or later.',
      });
    } else if (moving > latest) {
      errors.push({
        field: 'movingDate',
        code: 'DATE_TOO_FAR_IN_FUTURE',
        message: 'The moving date must be within the next two years.',
      });
    }
  }

  if (errors.length > 0) return { errors };

  return {
    criteria: {
      movingFromPostcode,
      movingToPostcode,
      propertyType: propertyType as PropertyType,
      bedrooms: bedrooms as number,
      movingDate,
    },
    errors: [],
  };
}

export function isAnalyticsEvent(body: unknown): body is AnalyticsEvent {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return false;
  const value = body as Partial<AnalyticsEvent>;
  return (
    typeof value.eventName === 'string' &&
    typeof value.occurredAt === 'string' &&
    typeof value.properties === 'object' &&
    value.properties !== null
  );
}

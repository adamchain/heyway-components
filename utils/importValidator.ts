/**
 * CLIENT-SIDE IMPORT VALIDATOR
 * 
 * This mirrors the shared/importValidator.js logic for frontend use
 */

// Standardized error codes (must match backend)
export const ERROR_CODES = {
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_PHONE_FORMAT: 'INVALID_PHONE_FORMAT',
  DUPLICATE_IN_BATCH: 'DUPLICATE_IN_BATCH',
  DUPLICATE_IN_DB: 'DUPLICATE_IN_DB',
  DNC_BLOCKED: 'DNC_BLOCKED',
  RATE_LIMITED: 'RATE_LIMITED',
  BLACKLISTED_NUMBER: 'BLACKLISTED_NUMBER',
  TIME_WINDOW_BLOCKED: 'TIME_WINDOW_BLOCKED',
  INTEGRATION_FAILURE: 'INTEGRATION_FAILURE',
  VALIDATION_RULE_FAILED: 'VALIDATION_RULE_FAILED',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  NO_CONSENT: 'NO_CONSENT'
} as const;

export interface ImportError {
  index?: number;
  contactId?: string | null;
  raw?: Record<string, any>;
  code: string;
  message: string;
  field?: string;
  timestamp?: string;
}

/**
 * Validates a phone number format
 */
export function validatePhone(phone: string, index: number, raw: any): {
  isValid: boolean;
  normalizedPhone: string | null;
  error: ImportError | null;
} {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      normalizedPhone: null,
      error: {
        index,
        raw,
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Phone number is required',
        field: 'phone',
        timestamp: new Date().toISOString()
      }
    };
  }

  // Clean phone number (remove spaces, hyphens, parentheses, dots, plus)
  const cleanPhone = phone.replace(/[\s\-\(\)\.\+]/g, '');

  // Check for valid phone format (7-15 digits)
  if (!/^\d{7,15}$/.test(cleanPhone)) {
    return {
      isValid: false,
      normalizedPhone: null,
      error: {
        index,
        raw,
        code: ERROR_CODES.INVALID_PHONE_FORMAT,
        message: 'Phone number is not E.164 or US 10-digit format',
        field: 'phone',
        timestamp: new Date().toISOString()
      }
    };
  }

  return {
    isValid: true,
    normalizedPhone: cleanPhone,
    error: null
  };
}

/**
 * Validates a contact name
 */
export function validateName(name: string, index: number, raw: any): {
  isValid: boolean;
  error: ImportError | null;
} {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return {
      isValid: false,
      error: {
        index,
        raw,
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Contact name is required',
        field: 'name',
        timestamp: new Date().toISOString()
      }
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validates a date field
 */
export function validateDate(dateValue: string, fieldName: string, index: number, raw: any): {
  isValid: boolean;
  parsedDate: Date | null;
  error: ImportError | null;
} {
  if (!dateValue) {
    return {
      isValid: false,
      parsedDate: null,
      error: {
        index,
        raw,
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: `${fieldName} is required`,
        field: fieldName,
        timestamp: new Date().toISOString()
      }
    };
  }

  try {
    const parsedDate = new Date(dateValue);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }

    return {
      isValid: true,
      parsedDate,
      error: null
    };
  } catch (error) {
    return {
      isValid: false,
      parsedDate: null,
      error: {
        index,
        raw,
        code: ERROR_CODES.INVALID_DATE_FORMAT,
        message: `Invalid date format for ${fieldName}`,
        field: fieldName,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Validates an array of contacts (client-side version)
 */
export function validateContacts(
  contacts: any[],
  options: {
    requireReferenceDate?: boolean;
    referenceDateField?: string;
  } = {}
): {
  validContacts: any[];
  errors: ImportError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    willImport: number;
    willSkip: number;
  };
} {
  const {
    requireReferenceDate = false,
    referenceDateField = 'referenceDate'
  } = options;

  const validContacts: any[] = [];
  const allErrors: ImportError[] = [];
  const seenPhones = new Set<string>();

  contacts.forEach((contact, index) => {
    const errors: ImportError[] = [];
    let isValid = true;

    // Validate name
    const nameValidation = validateName(contact.name, index, contact);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.error!);
      isValid = false;
    }

    // Validate phone
    const phoneValidation = validatePhone(contact.phoneNumber, index, contact);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error!);
      isValid = false;
    } else {
      const normalizedPhone = phoneValidation.normalizedPhone!;

      // Check for duplicates in this batch
      if (seenPhones.has(normalizedPhone)) {
        errors.push({
          index,
          raw: contact,
          code: ERROR_CODES.DUPLICATE_IN_BATCH,
          message: 'Duplicate phone number in this import batch',
          field: 'phone',
          timestamp: new Date().toISOString()
        });
        isValid = false;
      } else {
        seenPhones.add(normalizedPhone);
      }
    }

    // Email (optional) - accept any string; just trim if present
    if (contact.email && contact.email.trim() !== '') {
      contact.email = contact.email.trim();
    }

    // Validate reference date if required
    if (requireReferenceDate && referenceDateField) {
      const dateValidation = validateDate(contact[referenceDateField], referenceDateField, index, contact);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.error!);
        isValid = false;
      }
    }

    if (isValid) {
      validContacts.push(contact);
    }

    allErrors.push(...errors);
  });

  const summary = {
    total: contacts.length,
    valid: validContacts.length,
    invalid: allErrors.length,
    willImport: validContacts.length,
    willSkip: allErrors.length
  };

  return {
    validContacts,
    errors: allErrors,
    summary
  };
}
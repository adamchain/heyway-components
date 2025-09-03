/**
 * Phone number formatting utilities for US phone numbers
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Formats a phone number to E.164 format (+1XXXXXXXXXX) for US numbers
 * @param phoneNumber - Raw phone number input
 * @returns Formatted phone number with +1 prefix
 */
export const formatUSPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Handle different input formats
  if (digits.length === 11 && digits.startsWith('1')) {
    // Already has country code (11234567890 -> +11234567890)
    return `+${digits}`;
  } else if (digits.length === 10) {
    // Missing country code (1234567890 -> +11234567890)
    return `+1${digits}`;
  } else if (digits.length === 0) {
    // Empty input
    return '';
  }
  
  // For other lengths, assume it's a partial US number and add +1
  return `+1${digits}`;
};

/**
 * Formats phone number for display with US formatting (XXX) XXX-XXXX
 * @param phoneNumber - Raw or formatted phone number
 * @returns Display formatted phone number
 */
export const formatPhoneNumberDisplay = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Handle different lengths for progressive formatting
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  
  // Handle 11-digit numbers (with country code)
  if (digits.length === 11 && digits.startsWith('1')) {
    const phoneDigits = digits.slice(1); // Remove the 1
    return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`;
  }
  
  // For other cases, show first 10 digits formatted
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

/**
 * Validates a US phone number
 * @param phoneNumber - Phone number to validate
 * @returns Validation result with formatted number
 */
export const validateUSPhoneNumber = (phoneNumber: string): PhoneValidationResult => {
  if (!phoneNumber.trim()) {
    return {
      isValid: false,
      formatted: '',
      error: 'Phone number is required'
    };
  }
  
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check for valid US phone number lengths
  if (digits.length === 10) {
    // Standard 10-digit US number
    const formatted = formatUSPhoneNumber(phoneNumber);
    return {
      isValid: true,
      formatted,
    };
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // 11-digit with country code
    const formatted = formatUSPhoneNumber(phoneNumber);
    return {
      isValid: true,
      formatted,
    };
  } else if (digits.length > 0 && digits.length < 10) {
    // Partial number - still allow it for progressive input
    const formatted = formatUSPhoneNumber(phoneNumber);
    return {
      isValid: false,
      formatted,
      error: 'Phone number must be 10 digits'
    };
  } else if (digits.length > 11) {
    return {
      isValid: false,
      formatted: formatUSPhoneNumber(phoneNumber),
      error: 'Phone number is too long'
    };
  } else if (digits.length === 11 && !digits.startsWith('1')) {
    return {
      isValid: false,
      formatted: formatUSPhoneNumber(phoneNumber),
      error: 'Invalid country code'
    };
  }
  
  return {
    isValid: false,
    formatted: formatUSPhoneNumber(phoneNumber),
    error: 'Invalid phone number format'
  };
};

/**
 * Handles phone number input change with automatic formatting
 * @param input - Raw input value
 * @param currentValue - Current state value
 * @returns Object with formatted display value and E.164 value
 */
export const handlePhoneNumberInput = (input: string, currentValue: string) => {
  // Allow backspace to work naturally
  if (input.length < currentValue.length) {
    const displayValue = formatPhoneNumberDisplay(input);
    const e164Value = formatUSPhoneNumber(input);
    return { displayValue, e164Value };
  }
  
  // Format for display as user types
  const displayValue = formatPhoneNumberDisplay(input);
  const e164Value = formatUSPhoneNumber(input);
  
  return { displayValue, e164Value };
};

/**
 * Checks if a phone number appears to be valid for submission
 * @param phoneNumber - Phone number to check
 * @returns True if valid for submission
 */
export const isValidForSubmission = (phoneNumber: string): boolean => {
  const validation = validateUSPhoneNumber(phoneNumber);
  return validation.isValid;
};
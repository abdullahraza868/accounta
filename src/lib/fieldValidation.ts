/**
 * Field Validation Toolkit
 * 
 * Standardized validation for all form fields across the application.
 * Use these validators to ensure consistent validation behavior.
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address
 * 
 * Rules:
 * - Must contain exactly one @
 * - Must have characters before and after @
 * - Domain must have at least one dot
 * - Must follow standard email format
 * 
 * @param email - The email address to validate
 * @param required - Whether the field is required (default: true)
 * @returns EmailValidationResult with isValid flag and optional error message
 * 
 * @example
 * const result = validateEmail('user@example.com');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 */
export function validateEmail(email: string, required: boolean = true): EmailValidationResult {
  // Handle empty case
  if (!email || email.trim() === '') {
    if (required) {
      return {
        isValid: false,
        error: 'Email address is required',
      };
    }
    return { isValid: true };
  }

  const trimmedEmail = email.trim();

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  // Additional checks
  const parts = trimmedEmail.split('@');
  
  // Check for multiple @ symbols
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Email must contain exactly one @ symbol',
    };
  }

  const [localPart, domain] = parts;

  // Check local part (before @)
  if (localPart.length === 0) {
    return {
      isValid: false,
      error: 'Email must have characters before @',
    };
  }

  // Check domain part (after @)
  if (domain.length === 0 || !domain.includes('.')) {
    return {
      isValid: false,
      error: 'Email must have a valid domain',
    };
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return {
      isValid: false,
      error: 'Email cannot contain consecutive dots',
    };
  }

  // Check for leading/trailing dots
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email local part cannot start or end with a dot',
    };
  }

  return { isValid: true };
}

// ============================================================================
// PHONE VALIDATION
// ============================================================================

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates a phone number (US format)
 * 
 * Accepts:
 * - (555) 123-4567
 * - 555-123-4567
 * - 5551234567
 * - +1 555 123 4567
 * 
 * @param phone - The phone number to validate
 * @param required - Whether the field is required (default: false)
 * @returns PhoneValidationResult with isValid flag, optional error, and formatted number
 * 
 * @example
 * const result = validatePhone('(555) 123-4567');
 * if (result.isValid) {
 *   console.log(result.formatted); // "+1 (555) 123-4567"
 * }
 */
export function validatePhone(phone: string, required: boolean = false): PhoneValidationResult {
  // Handle empty case
  if (!phone || phone.trim() === '') {
    if (required) {
      return {
        isValid: false,
        error: 'Phone number is required',
      };
    }
    return { isValid: true };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Check if it starts with country code
  let phoneDigits = digitsOnly;
  if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    phoneDigits = digitsOnly.substring(1);
  }

  // Validate length (must be 10 digits for US)
  if (phoneDigits.length !== 10) {
    return {
      isValid: false,
      error: 'Phone number must be 10 digits',
    };
  }

  // Validate area code (first 3 digits)
  const areaCode = phoneDigits.substring(0, 3);
  if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
    return {
      isValid: false,
      error: 'Invalid area code',
    };
  }

  // Format the phone number
  const formatted = `+1 (${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;

  return {
    isValid: true,
    formatted,
  };
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  date?: Date;
}

/**
 * Validates a date string
 * 
 * Accepts:
 * - YYYY-MM-DD (ISO format)
 * - MM/DD/YYYY
 * - MM-DD-YYYY
 * 
 * @param dateString - The date string to validate
 * @param required - Whether the field is required (default: false)
 * @param minDate - Optional minimum date
 * @param maxDate - Optional maximum date
 * @returns DateValidationResult with isValid flag, optional error, and parsed Date
 * 
 * @example
 * const result = validateDate('2024-12-31', true, new Date(), null);
 * if (result.isValid) {
 *   console.log(result.date); // Date object
 * }
 */
export function validateDate(
  dateString: string,
  required: boolean = false,
  minDate?: Date,
  maxDate?: Date
): DateValidationResult {
  // Handle empty case
  if (!dateString || dateString.trim() === '') {
    if (required) {
      return {
        isValid: false,
        error: 'Date is required',
      };
    }
    return { isValid: true };
  }

  // Try to parse the date
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Please enter a valid date',
    };
  }

  // Check minimum date
  if (minDate && date < minDate) {
    return {
      isValid: false,
      error: `Date must be on or after ${minDate.toLocaleDateString()}`,
    };
  }

  // Check maximum date
  if (maxDate && date > maxDate) {
    return {
      isValid: false,
      error: `Date must be on or before ${maxDate.toLocaleDateString()}`,
    };
  }

  return {
    isValid: true,
    date,
  };
}

// ============================================================================
// REQUIRED FIELD VALIDATION
// ============================================================================

export interface RequiredValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a field has a value
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field (for error message)
 * @returns RequiredValidationResult
 * 
 * @example
 * const result = validateRequired(firstName, 'First name');
 * if (!result.isValid) {
 *   console.error(result.error); // "First name is required"
 * }
 */
export function validateRequired(value: string, fieldName: string = 'This field'): RequiredValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
}

// ============================================================================
// TEXT LENGTH VALIDATION
// ============================================================================

export interface LengthValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates text length
 * 
 * @param value - The text to validate
 * @param minLength - Minimum length (optional)
 * @param maxLength - Maximum length (optional)
 * @param fieldName - The name of the field (for error message)
 * @returns LengthValidationResult
 * 
 * @example
 * const result = validateLength(description, 10, 500, 'Description');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 */
export function validateLength(
  value: string,
  minLength?: number,
  maxLength?: number,
  fieldName: string = 'This field'
): LengthValidationResult {
  const length = value.trim().length;

  if (minLength !== undefined && length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (maxLength !== undefined && length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }

  return { isValid: true };
}

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

export interface NumberValidationResult {
  isValid: boolean;
  error?: string;
  value?: number;
}

/**
 * Validates a number
 * 
 * @param value - The value to validate
 * @param required - Whether the field is required
 * @param min - Minimum value (optional)
 * @param max - Maximum value (optional)
 * @param fieldName - The name of the field (for error message)
 * @returns NumberValidationResult
 * 
 * @example
 * const result = validateNumber('25', true, 0, 100, 'Age');
 * if (result.isValid) {
 *   console.log(result.value); // 25
 * }
 */
export function validateNumber(
  value: string,
  required: boolean = false,
  min?: number,
  max?: number,
  fieldName: string = 'This field'
): NumberValidationResult {
  // Handle empty case
  if (!value || value.trim() === '') {
    if (required) {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      };
    }
    return { isValid: true };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (min !== undefined && num < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  if (max !== undefined && num > max) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${max}`,
    };
  }

  return {
    isValid: true,
    value: num,
  };
}

// ============================================================================
// URL VALIDATION
// ============================================================================

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a URL
 * 
 * @param url - The URL to validate
 * @param required - Whether the field is required
 * @returns UrlValidationResult
 * 
 * @example
 * const result = validateUrl('https://example.com');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 */
export function validateUrl(url: string, required: boolean = false): UrlValidationResult {
  // Handle empty case
  if (!url || url.trim() === '') {
    if (required) {
      return {
        isValid: false,
        error: 'URL is required',
      };
    }
    return { isValid: true };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL',
    };
  }
}

// ============================================================================
// ZIP CODE VALIDATION (US)
// ============================================================================

export interface ZipCodeValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates a US ZIP code
 * 
 * Accepts:
 * - 12345
 * - 12345-6789
 * 
 * @param zipCode - The ZIP code to validate
 * @param required - Whether the field is required
 * @returns ZipCodeValidationResult
 * 
 * @example
 * const result = validateZipCode('12345');
 * if (result.isValid) {
 *   console.log(result.formatted); // "12345"
 * }
 */
export function validateZipCode(zipCode: string, required: boolean = false): ZipCodeValidationResult {
  // Handle empty case
  if (!zipCode || zipCode.trim() === '') {
    if (required) {
      return {
        isValid: false,
        error: 'ZIP code is required',
      };
    }
    return { isValid: true };
  }

  const trimmed = zipCode.trim();

  // ZIP format: 12345 or 12345-6789
  const zipRegex = /^\d{5}(-\d{4})?$/;

  if (!zipRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid ZIP code (12345 or 12345-6789)',
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
}

// ============================================================================
// COMPOSITE VALIDATION
// ============================================================================

/**
 * Validates multiple fields at once
 * 
 * @param validations - Array of validation results
 * @returns Object with isValid flag and array of errors
 * 
 * @example
 * const result = validateAll([
 *   validateEmail(email),
 *   validateRequired(firstName, 'First name'),
 *   validatePhone(phone)
 * ]);
 * if (!result.isValid) {
 *   console.error(result.errors);
 * }
 */
export function validateAll(
  validations: Array<
    | EmailValidationResult
    | PhoneValidationResult
    | DateValidationResult
    | RequiredValidationResult
    | LengthValidationResult
    | NumberValidationResult
    | UrlValidationResult
    | ZipCodeValidationResult
  >
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const validation of validations) {
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// CUSTOM VALIDATION
// ============================================================================

export interface CustomValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Creates a custom validator function
 * 
 * @param validator - Custom validation function
 * @returns CustomValidationResult
 * 
 * @example
 * const passwordMatch = customValidation(
 *   password === confirmPassword,
 *   'Passwords must match'
 * );
 */
export function customValidation(
  isValid: boolean,
  errorMessage: string
): CustomValidationResult {
  return {
    isValid,
    error: isValid ? undefined : errorMessage,
  };
}

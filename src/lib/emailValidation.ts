/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gets email validation error message
 * @param email - Email address to validate
 * @returns Error message or empty string if valid
 */
export const getEmailError = (email: string): string => {
  if (!email) {
    return '';
  }
  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

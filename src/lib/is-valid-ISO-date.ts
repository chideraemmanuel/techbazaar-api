/**
 * Helper function to check if a string is a valid ISO 8601 date
 * @param date_string the date string to validate
 * @returns true of false based on whether the provided date string is a valid ISO 8601 date
 */
const isValidISODate = (date_string: string) => {
  const date = new Date(date_string);
  return date instanceof Date && !isNaN(date.getTime());
};

export default isValidISODate;

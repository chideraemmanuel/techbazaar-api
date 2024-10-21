const validateISODateRange = (start_date: Date, end_date: Date) => {
  if (start_date && end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    return startDate <= endDate;
  }

  return true; // If one or both dates are missing, skip this validation
};

export default validateISODateRange;

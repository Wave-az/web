export const MIN_YEAR = 1959;
export const CURRENT_YEAR = new Date().getFullYear();

export function getDaysInMonth(yearStr: string, monthStr: string): number {
  const month = parseInt(monthStr, 10);
  if (!month || month < 1 || month > 12) return 31;

  const year = parseInt(yearStr, 10);
  if (!year) {
    // Default non-leap year fallback if year not set
    const base = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return base[month - 1];
  }

  // JS: month is 1-based here, but Date uses 0-based and day 0 = last day of previous month
  return new Date(year, month, 0).getDate();
}

export function sanitizeYearInput(raw: string): string {
  // keep only digits and max 4 chars
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits;
}

/**
 * Date Utility Functions
 * Consolidated date formatting functions to eliminate duplication across components
 */

import { format, parseISO, isValid } from "date-fns";

/**
 * Formats a date string to locale format
 * @param dateStr - ISO date string or undefined
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateLocale(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "";
  }
}

/**
 * Formats an ISO date string to a custom format
 * @param isoString - ISO date string
 * @param fmt - Format pattern (default: "dd/MM/yyyy")
 * @returns Formatted date string or original string if invalid
 */
export function formatDateUI(isoString: string, fmt = "dd/MM/yyyy"): string {
  if (!isoString) return "";
  try {
    const date = parseISO(isoString);
    return isValid(date) ? format(date, fmt) : isoString;
  } catch {
    return isoString;
  }
}

/**
 * Formats a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO date string
 */
export function formatDateISO(date: Date): string {
  try {
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Formats a date string to "MMM dd, yyyy" format (e.g., "Jan 15, 2026")
 * @param dateStr - ISO date string
 * @returns Formatted date string
 */
export function formatDateLong(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, "MMM dd, yyyy") : dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Checks if a date string is valid
 * @param dateStr - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDate(dateStr: string): boolean {
  try {
    const date = parseISO(dateStr);
    return isValid(date);
  } catch {
    return false;
  }
}

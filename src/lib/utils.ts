import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to safely convert decimal/string values to numbers for calculations
export function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Handle Prisma Decimal objects
  if (value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  // Handle objects with toString method (like Decimal.js)
  if (value && typeof value.toString === 'function') {
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Utility function to safely sum an array of decimal values
export function sumDecimals(values: any[]): number {
  return values.reduce((sum, value) => sum + toNumber(value), 0);
}

/**
 * Currency Formatting Utilities
 * 
 * Formats numbers as currency with dollar signs and commas
 * Example: 1000000 -> $1,000,000
 */

/**
 * Format a number as currency with $ and commas
 * @param amount - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string like "$1,000,000" or "$1,000,000.00"
 */
export function formatCurrency(amount: number | string | null | undefined, decimals: number = 0): string {
  if (amount === null || amount === undefined || amount === '') {
    return '$0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  
  if (isNaN(numAmount)) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);
}

/**
 * Format a number as currency for input fields (removes $ for editing)
 * @param amount - The number to format
 * @returns Formatted string like "1,000,000"
 */
export function formatCurrencyForInput(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  
  if (isNaN(numAmount)) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Parse a formatted currency string back to a number
 * @param formattedAmount - Formatted string like "$1,000,000" or "1,000,000"
 * @returns The numeric value
 */
export function parseCurrency(formattedAmount: string): number {
  if (!formattedAmount) {
    return 0;
  }

  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = formattedAmount.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format currency for display in input fields with live formatting
 * Handles user typing and formats as they type
 * @param value - The input value
 * @returns Formatted string for display
 */
export function formatCurrencyInput(value: string): string {
  if (!value) return '';
  
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  if (!cleaned) return '';
  
  // Split by decimal point
  const parts = cleaned.split('.');
  const integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Format integer part with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Combine with decimal part (limit to 2 decimal places)
  const formattedDecimal = decimalPart.length > 2 ? decimalPart.substring(0, 2) : decimalPart;
  
  return formattedDecimal ? `${formattedInteger}.${formattedDecimal}` : formattedInteger;
}


/**
 * Currency utilities for Tanzanian Shilling (TZS)
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyWithDecimals = (amount: number): string => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  // Remove TZS symbol and commas, then parse
  const cleanValue = value.replace(/[TZS,\s]/g, '');
  return parseFloat(cleanValue) || 0;
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('sw-TZ').format(amount);
};

interface CurrencyValidationResult {
  isValid: boolean;
  amount: number;
  error?: string;
}

export const CURRENCY_SYMBOL = 'TZS';
export const CURRENCY_NAME = 'Tanzanian Shilling';
export const CURRENCY_CODE = 'TZS';

// Common amounts in TZS
export const COMMON_AMOUNTS = {
  MINIMUM: 1000,
  SMALL: 5000,
  MEDIUM: 25000,
  LARGE: 100000,
  VERY_LARGE: 500000,
  MAXIMUM: 1000000,
};

// Quick amount presets
export const QUICK_AMOUNTS = [
  1000,
  5000,
  10000,
  25000,
  50000,
  100000,
  250000,
  500000,
  1000000,
];

// Utility payment amounts
export const UTILITY_AMOUNTS = [
  5000,
  10000,
  25000,
  50000,
  100000,
];

// Kijumbe contribution amounts
export const KIJUMBE_AMOUNTS = [
  5000,
  10000,
  15000,
  25000,
  50000,
];

// Loan amounts
export const LOAN_AMOUNTS = [
  25000,
  50000,
  100000,
  150000,
  200000,
  500000,
];

// Validation helpers
export const validateAmount = (amount: number, min: number = 0, max: number = 10000000): boolean => {
  return amount >= min && amount <= max && !isNaN(amount);
};

interface CurrencyValidationOptions {
  min?: number;
  max?: number;
}

export const validateCurrencyInput = (
  value: string, 
  options: CurrencyValidationOptions = {}
): CurrencyValidationResult => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      amount: 0,
      error: 'Tafadhali ingiza kiasi'
    };
  }
  
  // Convert string to number
  const amount = typeof value === 'string' ? parseCurrency(value) : Number(value);
  
  if (isNaN(amount) || amount < 0) {
    return { 
      isValid: false, 
      amount: 0, 
      error: 'Kiasi si sahihi' 
    };
  }
  
  // Use provided min or default to COMMON_AMOUNTS.MINIMUM
  const minAmount = options.min !== undefined ? options.min : COMMON_AMOUNTS.MINIMUM;
  const maxAmount = options.max !== undefined ? options.max : COMMON_AMOUNTS.MAXIMUM;
  
  if (amount < minAmount) {
    return { 
      isValid: false, 
      amount, 
      error: `Kiasi lazima kiwe angalau ${formatCurrency(minAmount)}` 
    };
  }
  
  if (amount > maxAmount) {
    return { 
      isValid: false, 
      amount, 
      error: `Kiasi cha juu ni ${formatCurrency(maxAmount)}` 
    };
  }
  
  return { 
    isValid: true, 
    amount 
  };
};

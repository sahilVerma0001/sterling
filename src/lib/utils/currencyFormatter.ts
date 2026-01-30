export const formatCurrency = (
  value: number | string,
  options?: {
    currency?: string;
    locale?: string;
    decimals?: number;
  }
): string => {
  if (value === null || value === undefined || value === "") return "";

  const numberValue =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : value;

  if (isNaN(numberValue)) return "";

  const {
    currency = "USD",
    locale = "en-US",
    decimals = 2,
  } = options || {};

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numberValue);
};

export const formatCurrencyInput = (value: string): string => {
  if (!value) return "";
  const numericValue = value.replace(/[^0-9]/g, "");
  return numericValue ? Number(numericValue).toLocaleString("en-US") : "";
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  return Number(value.replace(/[^0-9]/g, ""));
};

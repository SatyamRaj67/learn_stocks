import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculatePriceChange = (
  current: number,
  previous: number | null | undefined
) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};

// Format currency
export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Format large numbers (for volume and market cap)
export const formatLargeNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toString();
};

// Format data for cards
export const formatPercentage = (value: number) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

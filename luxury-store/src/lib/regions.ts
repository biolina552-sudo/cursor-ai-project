export const supportedCountries = [
  {
    code: "SA",
    name: "Saudi Arabia",
    nameAr: "السعودية",
    currency: "SAR",
    taxRate: 0.15,
    shippingFrom: 25,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    nameAr: "الإمارات",
    currency: "AED",
    taxRate: 0.05,
    shippingFrom: 22,
  },
  {
    code: "MA",
    name: "Morocco",
    nameAr: "المغرب",
    currency: "MAD",
    taxRate: 0.2,
    shippingFrom: 49,
  },
  {
    code: "EG",
    name: "Egypt",
    nameAr: "مصر",
    currency: "USD",
    taxRate: 0.14,
    shippingFrom: 12,
  },
  {
    code: "KW",
    name: "Kuwait",
    nameAr: "الكويت",
    currency: "USD",
    taxRate: 0,
    shippingFrom: 10,
  },
] as const;

export const currencyRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  SAR: 3.75,
  AED: 3.67,
  MAD: 10.05,
};

export function resolveCountry(countryCode?: string | null) {
  return (
    supportedCountries.find((country) => country.code === countryCode) ??
    supportedCountries[0]
  );
}

export function convertFromUsd(amount: number, currency: string) {
  return Math.round(amount * (currencyRates[currency] ?? 1) * 100) / 100;
}

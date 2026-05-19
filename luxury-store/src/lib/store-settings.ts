export const storefrontSettings = {
  storeName: "Shoplina",
  storeNameAr: "شوبلينا",
  defaultLocale: "ar",
  defaultCurrency: "SAR",
  defaultCountryCode: "SA",
  enabledLocales: ["ar"],
  enabledCurrencies: ["SAR"],
  showPublicLanguageSwitcher: false,
  showPublicCurrencySwitcher: false,
  paymentMethods: [
    {
      id: "cod",
      label: "Cash on delivery",
      labelAr: "الدفع عند الاستلام",
      description: "Pay when the order arrives",
      descriptionAr: "ادفع عند وصول الطلب",
      enabled: true,
      recommended: true,
    },
    {
      id: "card",
      label: "Credit / debit card",
      labelAr: "بطاقة بنكية",
      description: "Visa, Mastercard and Mada",
      descriptionAr: "فيزا، ماستركارد ومدى",
      enabled: true,
      recommended: false,
    },
    {
      id: "apple-pay",
      label: "Apple Pay",
      labelAr: "Apple Pay",
      description: "Fast mobile checkout",
      descriptionAr: "دفع سريع من الجوال",
      enabled: true,
      recommended: false,
    },
    {
      id: "stc-pay",
      label: "STC Pay",
      labelAr: "STC Pay",
      description: "Saudi wallet payments",
      descriptionAr: "محفظة دفع سعودية",
      enabled: false,
      recommended: false,
    },
    {
      id: "installments",
      label: "Tamara / Tabby",
      labelAr: "تمارا / تابي",
      description: "Buy now, pay later",
      descriptionAr: "اشتر الآن وادفع لاحقًا",
      enabled: false,
      recommended: false,
    },
  ],
} as const;

export function getStorefrontLocale(locale?: string) {
  if (locale && storefrontSettings.enabledLocales.includes(locale as "ar")) {
    return locale;
  }
  return storefrontSettings.defaultLocale;
}

export function getStorefrontCurrency() {
  return storefrontSettings.defaultCurrency;
}

export function getEnabledPaymentMethods() {
  return storefrontSettings.paymentMethods.filter((method) => method.enabled);
}

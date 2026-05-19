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

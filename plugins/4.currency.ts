import currency from 'currency.js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  return {
    provide: {
      currency: (value: number | string) => {
        return currency(value, {
          separator: config.public.currencySeparator,
          symbol: config.public.currencySymbol,
          decimal: config.public.currencyDecimal,
          precision: config.public.currencyPrecision,
        }).format();
      },
    },
  };
});

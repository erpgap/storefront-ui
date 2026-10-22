import currency from 'currency.js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  return {
    provide: {
      currency: (value: number | string) => {
        return currency(value, {
          separator: config.public.currencySeparator,
          symbol: config.public.currencySymbol,
          decimal: config.public.currencyDecimal,
          // Runtime config values from the environment are strings.
          precision: config.public.currencyPrecision ? Number(config.public.currencyPrecision) : undefined,
        }).format()
      },
    },
  }
})

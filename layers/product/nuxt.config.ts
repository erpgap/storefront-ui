// https://nuxt.com/docs/api/configuration/nuxt-config

import type { Nitro } from 'nitropack/types'
import chalk from 'chalk'

export default defineNuxtConfig({
  /**
   * Hook to WARMUP redis cache on local mode development.
   */
  hooks: {
    'nitro:init': async (nitro: Nitro) => {
      if (process.env.NODE_ENV === 'development') {
        chalk.bold.blue(`Start warmup stock...`)
        const data = Array.from(Array(2300).keys())

        const formatedData = data.map((item: number) => ({
          key: `stock:stock:product-${item}`, value: '{"3": 3}',
        }))

        await nitro.storage.setItems(formatedData)

        chalk.bold.blue(`Finish warmup stock`)
      }
    },
  },
})

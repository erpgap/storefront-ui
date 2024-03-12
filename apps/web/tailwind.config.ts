import type { Config } from 'tailwindcss';
import { tailwindConfig } from '@storefront-ui/vue/tailwind-config';
import sfTypography from '@storefront-ui/typography';

export default <Config>{
  presets: [tailwindConfig],
  content: ['./**/*.vue', '../../node_modules/@storefront-ui/vue/**/*.{js,mjs}'],
  plugins: [sfTypography],
  css: ['~/assets/css/tailwind.css'],

  theme: {
    extend: {
      screens: {
        xxl: '1440px',
        xs: '376px',
      },
      zIndex: {
        60: '60',
        80: '60',
        100: '100',
      },
    },
  },
};

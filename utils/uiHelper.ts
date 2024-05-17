import { useMediaQuery } from '@vueuse/core';

const mediaQueries = {
  tablet: '(min-width: 768px)',
  desktop: '(min-width: 1024px)',
};

export const isTabletScreen = useMediaQuery(mediaQueries.tablet);
export const isWideScreen = useMediaQuery(mediaQueries.desktop);

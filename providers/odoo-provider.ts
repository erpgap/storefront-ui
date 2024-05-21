import type { ProviderGetImage } from '@nuxt/image';
import objectHash from 'object-hash';

export const getImage: ProviderGetImage = (src, { modifiers }, ctx) => {
  const baseURL = useRuntimeConfig().public.odooBaseImageUrl;

  const resolution = `${modifiers?.width}x${modifiers?.height}`;

  const hash = objectHash({ text: src + resolution });

  return { url: `${baseURL}${src?.replace('/', '')}/${resolution}/${hash}` };
};

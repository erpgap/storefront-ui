import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(async (nuxtApp) => {
  const odooUrl = nuxtApp.$config.public.odooBaseImageUrl;
  return {
    provide: {
      getImage: (
        imagePath: string,
        width: number,
        heigth: number,
        name: string
      ) => {
        const resolution = `${width}x${heigth}`;
        return `${odooUrl}${imagePath?.replace("/", "")}/${resolution}/${name}_${resolution}`;
      },
    },
  };
});

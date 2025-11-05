
declare module '#app' {
  interface NuxtApp {
    $getImage: (src: string, w?: number, h?: number, filename?: string) => string
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $getImage: (src: string, w?: number, h?: number, filename?: string) => string
  }
}

import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, _from, _savedPosition) {

    if (to.hash) return { el: to.hash, behavior: 'smooth' }

    return { top: 0, left: 0 }
  },
}

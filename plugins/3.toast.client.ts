import Toast, { TYPE } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, {
    timeout: 2000,
    filterBeforeCreate: (toast: any) => {
      if (toast.type === TYPE.ERROR) {
        const msg = typeof toast.content === 'string' ? toast.content.trim().toLowerCase() : ''
        if (!msg || msg === '' || msg.includes('not found')) {
          return false
        }
      }
      return toast
    },
  })
})

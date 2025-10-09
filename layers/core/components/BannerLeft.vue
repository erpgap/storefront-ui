<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div class="relative">
    <!-- Img -->
    <div class="img bg-[#f7f7f7] flex justify-start">
      <NuxtImg
        src="/img/home/banner-3.jpg"
        alt="erpgap-img"
        class="w-full md:w-1/2 max-h-[400px] md:max-h-full md:h-[500px] lg:h-[550px] 2xl:h-[620px] object-cover object-center"
      />
    </div>
    <!-- Text -->
    <div class="text narrow-container w-full md:absolute top-[47%] left-[50%] -translate-half bg-[#F7F7F7] md:bg-transparent py-7 flex justify-end">
      <div class="md:max-w-[47%] lg:max-w-[470px] text-black flex flex-col items-start gap-4">
        <h1 class="text-[28px] md:text-[36px] font-normal">Elevate Everyday Living</h1>
        <p class="text-[16px] md:text-[18px] mb-3">Minimalist design, modern comfort, and timeless style come together to transform every room in your home.</p>
        <SfButton type="button" class="!bg-black !text-white !border-none !ring-none !shadow-none min-h-[48px] text-[16px] font-normal tracking-[0.5px] px-7 gap-3 mb-2">
          SHOP NEW ARRIVALS
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="white">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z"/>
          </svg>
        </SfButton>
      </div>
    </div>
  </div>
</template>

<style scoped>

@media (min-width: 768px) {
  .-translate-half {
    transform: translate(-50%, -50%)
  }
}
</style>
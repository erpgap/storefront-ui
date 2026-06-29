<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')
const error = useError()

const is404 = computed(
  () => error.value?.statusCode === 404 || error.value?.message === 'Product not found',
)
const code = computed(() => (is404.value ? '404' : String(error.value?.statusCode || '500')))
const title = computed(() => (is404.value ? 'Page not found' : 'Something went wrong'))
const message = computed(() =>
  is404.value
    ? "The page you're looking for doesn't exist or may have moved. Let's get you back on track."
    : 'An unexpected error occurred. Please try again, or head back to the homepage.',
)
</script>

<template>
  <NuxtLayout>
    <section class="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[clamp(440px,72vh,760px)]">
      <!-- Content -->
      <div class="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16">
        <div class="max-w-[520px] lg:ml-auto w-full">
          <p class="font-light leading-none tracking-[-0.04em] text-primary-200 text-[clamp(80px,13vw,170px)]">
            {{ code }}
          </p>
          <h1 class="mt-4 font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)]">
            {{ title }}
          </h1>
          <p class="mt-5 text-primary-500 font-light leading-relaxed max-w-[420px]">
            {{ message }}
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <SfButton
              :tag="NuxtLink"
              to="/"
              class="min-h-[52px] px-7 text-[13px] font-medium"
            >
              Back to home
            </SfButton>
            <SfButton
              :tag="NuxtLink"
              to="/products"
              variant="tertiary"
              class="min-h-[52px] px-7 text-[13px] tracking-[0.1em] uppercase font-medium !border !border-primary-200 !text-black hover:!bg-transparent hover:!border-black"
            >
              Browse products
            </SfButton>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="order-1 lg:order-2 relative min-h-[280px] lg:min-h-full overflow-hidden">
        <NuxtImg
          src="/img/content/404.webp"
          alt=""
          aria-hidden="true"
          class="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          fetchpriority="high"
        />
      </div>
    </section>
  </NuxtLayout>
</template>

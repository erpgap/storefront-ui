<script setup lang="ts">
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Minimal, distraction-free header: back-to-cart · brand · secure note. -->
    <header class="border-b border-primary-100">
      <div class="narrow-container h-16 grid grid-cols-3 items-center">
        <component
          :is="NuxtLink"
          to="/cart"
          class="group relative justify-self-start inline-flex items-center gap-2 py-1.5 text-[13px] tracking-[0.08em] uppercase text-primary-600 whitespace-nowrap transition-colors hover:text-black"
        >
          <svg
            width="16"
            height="12"
            viewBox="0 0 18 14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          >
            <path d="M17 7H2M7 1 2 7l5 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="sm:hidden">{{ $t('back') }}</span>
          <span class="hidden sm:inline">{{ $t('backToCart') }}</span>
          <span class="absolute left-0 bottom-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
        </component>

        <!-- Brand: intentionally not a link (no distractions out of checkout). -->
        <div class="justify-self-center">
          <AlokaiLogo />
        </div>

        <span class="justify-self-end hidden sm:inline-flex items-center gap-1.5 text-[12px] tracking-[0.08em] uppercase text-primary-400">
          <UiLineIcon name="lock" :size="14" />
          {{ $t('trust.secure') }}
        </span>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <WishlistSidebar />
    <CartSidebar />
  </div>
</template>

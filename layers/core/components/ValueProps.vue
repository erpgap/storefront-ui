<script lang="ts" setup>
const values = [
  {
    title: 'Free Shipping',
    text: 'On all orders over $150',
    icon: 'M3 7h11v8H3zM14 10h4l3 3v2h-7z',
    extra: 'circles-truck',
  },
  {
    title: '30-Day Returns',
    text: 'Shop with confidence',
    icon: 'M3 12a9 9 0 1 1 3 6.7',
    extra: 'return',
  },
  {
    title: '2-Year Warranty',
    text: 'Crafted to last',
    icon: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z',
  },
  {
    title: 'Expert Support',
    text: 'Here to help, always',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  },
]
</script>

<template>
  <section class="border-y border-primary-100 py-12">
    <div class="narrow-container grid grid-cols-2 md:grid-cols-4 gap-8">
      <div
        v-for="value in values"
        :key="value.title"
        class="flex items-start gap-4"
      >
        <svg
          class="flex-none text-primary-800"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
        >
          <path :d="value.icon" />
          <template v-if="value.extra === 'circles-truck'">
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </template>
          <path
            v-else-if="value.extra === 'return'"
            d="M3 19v-4h4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div>
          <h3 class="text-[14px] font-semibold tracking-[0.02em]">
            {{ value.title }}
          </h3>
          <p class="text-[13px] text-primary-400 mt-1">
            {{ value.text }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

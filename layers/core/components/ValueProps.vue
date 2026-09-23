<script lang="ts" setup>
// CMS-editable via layers/cms/blocks/valueProps.ts. Defaults reproduce the
// previously hard-coded list, so `<ValueProps />` renders as before.
//
// `icon` is a named choice rather than raw SVG path data: merchants pick from a
// curated set, and the markup stays under our control instead of becoming an
// injection surface.
type IconName = 'truck' | 'return' | 'shield' | 'support'

interface ValueItem {
  title?: string
  text?: string
  icon?: IconName
}

const props = withDefaults(defineProps<{
  items?: ValueItem[]
}>(), { items: undefined })

const ICONS: Record<IconName, { path: string, extra?: 'circles-truck' | 'return' }> = {
  truck: { path: 'M3 7h11v8H3zM14 10h4l3 3v2h-7z', extra: 'circles-truck' },
  return: { path: 'M3 12a9 9 0 1 1 3 6.7', extra: 'return' },
  shield: { path: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z' },
  support: { path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
}

const values = computed(() => (props.items ?? [
  { title: 'Free Shipping', text: 'On all orders over $150', icon: 'truck' as IconName },
  { title: '30-Day Returns', text: 'Shop with confidence', icon: 'return' as IconName },
  { title: '2-Year Warranty', text: 'Crafted to last', icon: 'shield' as IconName },
  { title: 'Expert Support', text: 'Here to help, always', icon: 'support' as IconName },
]).map((item, index) => {
  const icon = ICONS[item.icon as IconName] ?? ICONS.shield
  return { ...item, key: `${item.title ?? 'item'}-${index}`, icon: icon.path, extra: icon.extra }
}))
</script>

<template>
  <section class="border-y border-primary-100 py-12">
    <div class="narrow-container grid grid-cols-2 md:grid-cols-4 gap-8">
      <div
        v-for="value in values"
        :key="value.key"
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
            <circle
              cx="7"
              cy="17"
              r="2"
            />
            <circle
              cx="17"
              cy="17"
              r="2"
            />
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

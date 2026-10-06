<script setup lang="ts">
// The `faq` block. Questions are stored as one flat list with a group name on
// each (block arrays cannot nest, §9.4); consecutive questions sharing a group
// are shown under one heading. <details> keeps every answer in the HTML, so
// crawlers and in-page search see them, and it works without JavaScript.
const props = withDefaults(defineProps<{
  title?: string
  items?: { group?: string, question: string, answer: string }[]
}>(), {
  title: '',
  items: () => [],
})

const groups = computed(() => {
  const result: { title: string, items: typeof props.items }[] = []
  for (const item of props.items) {
    const title = item.group?.trim() ?? ''
    const last = result[result.length - 1]
    if (last && last.title === title) last.items.push(item)
    else result.push({ title, items: [item] })
  }
  return result
})
</script>

<template>
  <section class="narrow-container pb-[clamp(48px,7vw,96px)]">
    <div class="max-w-[820px]">
      <h2
        v-if="title"
        class="mb-10 text-[24px] font-light tracking-[-0.01em]"
      >
        {{ title }}
      </h2>
      <div class="space-y-14">
        <section
          v-for="(group, index) in groups"
          :key="index"
        >
          <h3
            v-if="group.title"
            class="text-[13px] tracking-[0.16em] uppercase font-medium text-primary-400 mb-2"
          >
            {{ group.title }}
          </h3>
          <div class="border-t border-primary-100">
            <details
              v-for="(item, itemIndex) in group.items"
              :key="itemIndex"
              class="group border-b border-primary-100"
            >
              <summary
                class="flex items-center justify-between gap-6 py-5 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden"
              >
                <span class="font-medium text-[16px]">{{ item.question }}</span>
                <svg
                  class="shrink-0 transition-transform duration-300 group-open:rotate-45 text-primary-400"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke-linecap="round"
                  />
                </svg>
              </summary>
              <p class="pb-5 -mt-1 text-primary-500 font-light leading-relaxed max-w-[640px]">
                {{ item.answer }}
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

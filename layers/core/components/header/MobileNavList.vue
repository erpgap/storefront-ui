<script lang="ts" setup>
import type { Category } from '~~/graphql'

defineEmits<{
  navigate: []
}>()

const categories = inject<Category[]>('categoriesForMegaMenu')

// Secondary links mirror the footer so the mobile menu is a complete site map,
// not just the product categories.
const linkGroups = [
  {
    title: 'Shop',
    links: [
      { label: 'Top Sellers', link: '/products' },
      { label: 'New Arrivals', link: '/products?sort=newest,DESC' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', link: '/about' },
      { label: 'Sustainability', link: '/sustainability' },
      { label: 'Stores', link: '/stores' },
      { label: 'Journal', link: '/journal' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping', link: '/shipping' },
      { label: 'Returns', link: '/returns' },
      { label: 'Contact', link: '/contact' },
      { label: 'FAQ', link: '/faq' },
    ],
  },
]
</script>

<template>
  <nav :aria-label="$t('navigationMenu')">
    <!-- Primary product categories -->
    <ul class="px-4 pt-2 flex flex-col">
      <li
        v-for="category in categories"
        :key="category.id"
      >
        <HeaderMobileNavLink
          :to="category.slug"
          :label="category.name"
          @navigate="$emit('navigate')"
        />
      </li>
    </ul>

    <!-- Secondary links (Shop extras + info pages, mirroring the footer) -->
    <div class="px-4 pt-7 pb-4 grid grid-cols-2 gap-x-6 gap-y-7">
      <div
        v-for="group in linkGroups"
        :key="group.title"
      >
        <h2 class="text-[12px] font-bold tracking-[0.16em] uppercase text-primary-400 mb-3">
          {{ group.title }}
        </h2>
        <ul>
          <li
            v-for="link in group.links"
            :key="link.label"
          >
            <NuxtLink
              :to="link.link"
              class="block py-2 text-[15px] text-primary-600 transition-colors hover:text-black"
              @click="$emit('navigate')"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
const NuxtLink = resolveComponent('NuxtLink')

const linkColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'Top Sellers', link: '/products' },
      { label: 'Women', link: '/products' },
      { label: 'Men', link: '/products' },
      { label: 'Accessories', link: '/products' },
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

const socials = [
  { label: 'X', url: 'https://twitter.com/erpGap', icon: '/img/x.svg' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/odoogap/', icon: '/img/linkedin.svg' },
  { label: 'GitHub', url: 'https://github.com/erpgap/storefront-ui', icon: '/img/github.svg' },
]
</script>

<template>
  <div>
    <ValueProps />
    <Newsletter />
    <footer class="bg-white border-t border-primary-100 text-black">
      <div class="narrow-container">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)] gap-10 py-[72px]">
        <div>
          <NuxtLink to="/" aria-label="Sf Homepage" class="inline-block mb-5">
            <AlokaiLogo class="w-auto h-9" />
          </NuxtLink>
          <p class="font-light text-[14px] text-primary-400 max-w-[280px]">
            Considered, timeless fashion in natural fabrics — made to wear well and last.
          </p>
        </div>

        <div v-for="column in linkColumns" :key="column.title">
          <h5 class="text-[12px] font-bold tracking-[0.16em] uppercase mb-5">
            {{ column.title }}
          </h5>
          <ul>
            <li v-for="item in column.links" :key="item.label">
              <NuxtLink
                :to="item.link"
                class="block py-[7px] text-[14px] text-primary-500 transition-colors hover:text-black"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-primary-100 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-primary-400">
        <span>
          © {{ new Date().getFullYear() }} Alokai by
          <a
            href="https://www.erpgap.com/alokai/"
            target="_blank"
            rel="noopener"
            class="underline"
          >ERPGAP</a>. All rights reserved.
        </span>
        <div class="flex items-center gap-3">
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.url"
            :aria-label="social.label"
            target="_blank"
            rel="noopener"
            class="transition-transform hover:-translate-y-0.5"
          >
            <img
              :src="social.icon"
              :alt="social.label"
              width="38"
              height="38"
              class="w-[38px] h-[38px]"
              loading="lazy"
              decoding="async"
            >
          </a>
        </div>
      </div>
    </div>
    </footer>
  </div>
</template>

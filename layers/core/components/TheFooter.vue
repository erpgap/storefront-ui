<script lang="ts" setup>
const NuxtLink = resolveComponent('NuxtLink')

const linkColumns = [
  {
    titleKey: 'core.siteLinks.shop',
    links: [
      ...shopLinks,
      { labelKey: 'core.siteLinks.women', link: '/women' },
      { labelKey: 'core.siteLinks.men', link: '/men' },
    ],
  },
  { titleKey: 'core.siteLinks.company', links: companyLinks },
  { titleKey: 'core.siteLinks.support', links: supportLinks },
]

const socials = [
  { label: 'X', url: 'https://twitter.com/erpGap', icon: '/img/x.svg' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/odoogap/', icon: '/img/linkedin.svg' },
  { label: 'GitHub', url: 'https://github.com/erpgap/storefront-ui', icon: '/img/github.svg' },
]
</script>

<template>
  <div>
    <Newsletter />
    <footer class="bg-white border-t border-primary-100 text-black">
      <div class="narrow-container">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)] gap-10 py-[72px]">
          <div>
            <!-- The footer's links are plain anchors (`custom`), without the
                 router's active classes. Nothing styles those, and the footer
                 hydrates only once it scrolls into view: by then the shopper
                 may be on another page than the one the server rendered, and
                 the classes no longer match it. -->
            <NuxtLink
              v-slot="{ href, navigate }"
              to="/"
              custom
            >
              <a
                :href="href"
                :aria-label="$t('core.header.homeLink')"
                class="inline-block mb-5"
                @click="navigate"
              >
                <AlokaiLogo class="text-[22px]" />
              </a>
            </NuxtLink>
            <p class="font-light text-[14px] text-primary-400 max-w-[280px]">
              {{ $t('core.footer.tagline') }}
            </p>
          </div>

          <div
            v-for="column in linkColumns"
            :key="column.titleKey"
          >
            <h3 class="text-[12px] font-bold tracking-[0.16em] uppercase mb-5">
              {{ $t(column.titleKey) }}
            </h3>
            <ul>
              <li
                v-for="item in column.links"
                :key="item.labelKey"
              >
                <NuxtLink
                  v-slot="{ href, navigate }"
                  :to="item.link"
                  custom
                >
                  <a
                    :href="href"
                    class="block py-2.5 text-[16px] md:py-[7px] md:text-[14px] text-primary-500 transition-colors hover:text-black"
                    @click="navigate"
                  >
                    {{ $t(item.labelKey) }}
                  </a>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-primary-100 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-primary-400">
          <i18n-t
            scope="global"
            keypath="core.footer.copyright"
            tag="span"
          >
            <template #year>
              {{ new Date().getFullYear() }}
            </template>
            <template #company>
              <a
                href="https://www.erpgap.com/alokai/"
                target="_blank"
                rel="noopener"
                class="underline"
              >ERPGAP</a>
            </template>
          </i18n-t>
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

<script lang="ts" setup>
import type { MenuItem } from '../utils/websiteMenu'

const NuxtLink = resolveComponent('NuxtLink')
const { t } = useI18n()
const { footer, loadWebsiteFooter } = useWebsiteFooter()
await loadWebsiteFooter()

// The columns edited in Odoo; the storefront's own links stand in when Odoo
// has none to give (the same lists the mobile menu falls back to).
const fallbackColumns: MenuItem[] = [
  { labelKey: 'core.siteLinks.shop', links: [
    ...shopLinks,
    { labelKey: 'core.siteLinks.women', link: '/women' },
    { labelKey: 'core.siteLinks.men', link: '/men' },
  ] },
  { labelKey: 'core.siteLinks.company', links: companyLinks },
  { labelKey: 'core.siteLinks.support', links: supportLinks },
].map((column, index) => ({
  id: -(index + 1),
  label: t(column.labelKey),
  to: '',
  external: false,
  children: column.links.map((link, position) => ({
    id: -((index + 1) * 100 + position),
    label: t(link.labelKey),
    to: link.link,
    external: false,
    children: [],
  })),
}))
const columns = computed(() => footer.value.columns.length ? footer.value.columns : fallbackColumns)
</script>

<template>
  <div>
    <Newsletter />
    <footer class="bg-white border-t border-primary-100 text-black">
      <div class="narrow-container">
        <!-- The brand, then the columns from Odoo: as many side by side as
             fit, however many the merchant makes. -->
        <div class="grid grid-cols-1 lg:grid-cols-[1.6fr_3fr] gap-10 py-[72px]">
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
                <SiteLogo class="text-[22px]" />
              </a>
            </NuxtLink>
            <p class="font-light text-[14px] text-primary-400 max-w-[280px]">
              {{ $t('core.footer.tagline') }}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-10">
            <div
              v-for="column in columns"
              :key="column.id"
            >
              <h3 class="text-[12px] font-bold tracking-[0.16em] uppercase mb-5">
                {{ column.label }}
              </h3>
              <ul>
                <template
                  v-for="item in column.children"
                  :key="item.id"
                >
                  <li v-if="!item.to">
                    <!-- No page of its own in Odoo: its name, as text. -->
                    <span class="block py-2.5 text-[16px] md:py-[7px] md:text-[14px] text-primary-500">{{ item.label }}</span>
                  </li>
                  <li v-else>
                    <NuxtLink
                      v-slot="{ href, navigate }"
                      :to="item.to"
                      :external="item.external"
                      custom
                    >
                      <a
                        :href="href"
                        class="block py-2.5 text-[16px] md:py-[7px] md:text-[14px] text-primary-500 transition-colors hover:text-black"
                        v-bind="item.external ? { target: '_blank', rel: 'noopener' } : {}"
                        @click="item.external || navigate($event)"
                      >
                        {{ item.label }}
                      </a>
                    </NuxtLink>
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </div>

        <div class="border-t border-primary-100 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-primary-400">
          <!-- The company's name as set in Odoo. -->
          <span>
            {{ footer.company
              ? $t('core.footer.copyright', { year: new Date().getFullYear(), company: footer.company })
              : $t('core.footer.copyrightNoCompany', { year: new Date().getFullYear() }) }}
          </span>
          <!-- The company's social media accounts, as filled in in Odoo. -->
          <div
            v-if="footer.socials.length"
            class="flex items-center gap-3"
          >
            <a
              v-for="social in footer.socials"
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

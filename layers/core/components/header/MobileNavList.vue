<script lang="ts" setup>
import { SfIconExpandMore } from '@storefront-ui/vue'
import type { Category } from '~~/graphql'

const emit = defineEmits<{
  navigate: []
}>()

const categories = inject<Ref<Category[]>>('categoriesForMegaMenu')
const { items: websiteMenu } = useWebsiteMenu()

// The menu edited in Odoo (Website > Menus); the product categories stand in
// when Odoo has none to give, as the drawer listed before.
const menuItems = computed(() => websiteMenu.value.length
  ? websiteMenu.value
  : (categories?.value ?? []).map(category => ({
      id: category.id, label: category.name ?? '', to: category.slug ?? '', external: false, children: [],
    })))

// One submenu open at a time, as an accordion.
const openId = ref<number | null>(null)
const toggle = (id: number) => {
  openId.value = openId.value === id ? null : id
}
const navigate = () => {
  openId.value = null
  emit('navigate')
}

const linkGroups = [
  { titleKey: 'core.siteLinks.shop', links: shopLinks },
  { titleKey: 'core.siteLinks.company', links: companyLinks },
  { titleKey: 'core.siteLinks.support', links: supportLinks },
]
</script>

<template>
  <nav :aria-label="$t('navigationMenu')">
    <!-- The website menu -->
    <ul class="px-4 pt-2 flex flex-col">
      <li
        v-for="item in menuItems"
        :key="item.id"
      >
        <template v-if="item.children.length">
          <button
            type="button"
            class="w-full flex justify-between items-center border-b border-primary-100 text-[16px] text-black font-medium py-4"
            :aria-expanded="openId === item.id"
            :aria-controls="`mobile-menu-${item.id}`"
            @click="toggle(item.id)"
          >
            {{ item.label }}
            <SfIconExpandMore
              class="transition-transform duration-200"
              :class="{ 'rotate-180': openId === item.id }"
              aria-hidden="true"
            />
          </button>
          <ul
            v-show="openId === item.id"
            :id="`mobile-menu-${item.id}`"
            class="py-2 border-b border-primary-100"
          >
            <li v-if="item.to">
              <NuxtLink
                :to="item.to"
                :external="item.external"
                class="block py-2.5 pl-4 text-[15px] text-black"
                @click="navigate"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
            <li
              v-for="child in item.children"
              :key="child.id"
            >
              <NuxtLink
                v-if="child.to"
                :to="child.to"
                :external="child.external"
                class="block py-2.5 pl-4 text-[15px] text-primary-600"
                @click="navigate"
              >
                {{ child.label }}
              </NuxtLink>
              <span
                v-else
                class="block pt-3 pb-1 pl-4 text-[12px] tracking-[0.12em] uppercase text-primary-400"
              >{{ child.label }}</span>
            </li>
          </ul>
        </template>
        <HeaderMobileNavLink
          v-else-if="item.to"
          :to="item.to"
          :label="item.label"
          @navigate="navigate"
        />
      </li>
    </ul>

    <!-- Secondary links (Shop extras + info pages, mirroring the footer) -->
    <div class="px-4 pt-7 pb-4 grid grid-cols-2 gap-x-6 gap-y-7">
      <div
        v-for="group in linkGroups"
        :key="group.titleKey"
      >
        <h2 class="text-[12px] font-bold tracking-[0.16em] uppercase text-primary-400 mb-3">
          {{ $t(group.titleKey) }}
        </h2>
        <ul>
          <li
            v-for="link in group.links"
            :key="link.labelKey"
          >
            <NuxtLink
              :to="link.link"
              class="block py-2 text-[15px] text-primary-600 transition-colors hover:text-black"
              @click="$emit('navigate')"
            >
              {{ $t(link.labelKey) }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<template>
  <TheHeader />

  <main class="narrow-container">
    <UiBreadcrumb
      :breadcrumbs="breadcrumbs"
      class="mt-5 mb-10"
    />
    <div ata-testid="account-layout">
      <h1
        v-if="isRoot"
        class="mb-10 md:mb-10 md:mx-0 font-bold typography-headline-3 md:typography-headline-2"
      >
        {{ $t("account.heading") }}
      </h1>
      <div
        v-else
        class="flex items-center gap-3 mb-10 mt-4"
      >
        <SfButton
          :tag="NuxtLink"
          to="/my-account"
          class="flex md:hidden whitespace-nowrap"
          size="sm"
          variant="tertiary"
        >
          <template #prefix>
            <SfIconArrowBack />
          </template>
          {{ $t("account.back") }}
        </SfButton>
        <h1 class="font-bold typography-headline-3">
          {{ findCurrentPage?.label }}
        </h1>
      </div>
      <div
        class="md:flex gap-10 pb-20"
        data-testid="account-page-sidebar"
      >
        <nav
          :class="[
            'border-t md:border border-primary-100 md:rounded-md min-w-[280px] md:p-2 max-h-[500px] overflow-y-auto md:block',
            { hidden: !isRoot },
          ]"
        >
          <ul class="py-2 md:py-0">
            <li
              v-for="item in navItems"
              :key="item.link"
            >
              <NuxtLink
                :to="item.link"
                :class="[
                  'flex items-center justify-between gap-3 px-4 py-3 md:py-2.5 rounded-md text-[14px] transition-colors',
                  isActive(item.link)
                    ? 'bg-primary-50 text-black font-medium'
                    : 'text-primary-600 hover:text-black hover:bg-primary-50',
                ]"
              >
                {{ item.label }}
                <SfIconChevronRight
                  size="sm"
                  class="md:hidden text-primary-300"
                />
              </NuxtLink>
            </li>
          </ul>

          <div class="my-2 border-t border-primary-100" />

          <button
            type="button"
            class="w-full flex items-center px-4 py-3 md:py-2.5 rounded-md text-[14px] text-primary-600 hover:text-black hover:bg-primary-50 transition-colors"
            @click="handleLogout"
          >
            {{ $t("account.logout") }}
          </button>
        </nav>
        <div class="flex-1">
          <section
            class="grid grid-cols-1 2xs:grid-cols-2 gap-4 md:gap-y-6 md:gap-x-2 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 md:mb-5"
            data-testid="category-grid"
          >
            <slot />
          </section>
        </div>
      </div>
    </div>
  </main>
  <LazyTheFooter hydrate-on-visible />
  <LazyBottomNavbar v-if="$viewport.isLessThan('desktopSmall')" />

  <WishlistSidebar />
  <CartSidebar />
</template>

<script setup>
import {
  SfButton,
  SfIconArrowBack,
  SfIconChevronRight,
} from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')
const { t } = useI18n()
const router = useRouter()
const { logout } = useAuth()

const navItems = [
  { label: t('account.myOrders.section.myOrders'), link: '/my-account/my-orders' },
  { label: t('account.accountSettings.section.personalData'), link: '/my-account/personal-data' },
  { label: t('account.accountSettings.section.shippingDetails'), link: '/my-account/shipping-details' },
  { label: t('account.accountSettings.section.billingDetails'), link: '/my-account/billing-details' },
]

const currentPath = computed(() => router.currentRoute.value.path)
const path = '/my-account'
const rootPathRegex = new RegExp(`^${path}/?$`)
const isRoot = computed(() => rootPathRegex.test(currentPath.value))
const isActive = (link) => currentPath.value === link || currentPath.value.startsWith(`${link}/`)
const findCurrentPage = computed(() =>
  navItems.find(({ link }) => currentPath.value.includes(link)),
)

// Published by the order-detail page so we can show "#S00004" in the breadcrumb.
const orderCrumb = useState('account-order-crumb', () => '')
const route = useRoute()
const isOrderDetail = computed(
  () => !!route.params.id && currentPath.value.includes('/my-account/my-orders'),
)

const breadcrumbs = computed(() => {
  const crumbs = [
    { name: t('home'), link: '/' },
    { name: t('account.heading'), link: '/my-account' },
  ]
  if (isRoot.value) return crumbs

  // Order detail: Home / Account / My Orders / #S00004
  if (isOrderDetail.value) {
    crumbs.push({ name: t('account.myOrders.section.myOrders'), link: '/my-account/my-orders' })
    if (orderCrumb.value) crumbs.push({ name: orderCrumb.value, link: currentPath.value })
    return crumbs
  }

  crumbs.push({ name: findCurrentPage.value?.label, link: currentPath.value })
  return crumbs
})

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

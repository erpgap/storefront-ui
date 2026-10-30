<script lang="ts" setup>
// CMS-editable via the `categories` block. Every prop defaults to the copy that
// used to be hard-coded here, so `<Categories />` with no props renders exactly
// as before and the existing homepage needs no change.
import { imageProvider } from '#cms/utils/media'

interface CategoryTile {
  name?: string
  image?: string
  link?: string
}

const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  linkLabel?: string
  linkUrl?: string
  items?: CategoryTile[]
}>(), {
  eyebrow: undefined,
  title: undefined,
  linkLabel: undefined,
  linkUrl: '/products',
  items: undefined,
})

const NuxtLink = resolveComponent('NuxtLink')
const { t } = useI18n()

// A prop left out falls back to the default copy (translated, so it cannot be a
// withDefaults value); an empty string from the CMS still renders nothing.
const eyebrowText = computed(() => props.eyebrow !== undefined ? props.eyebrow : t('core.home.categories.eyebrow'))
const titleText = computed(() => props.title !== undefined ? props.title : t('core.home.categories.title'))
const linkLabelText = computed(() => props.linkLabel !== undefined ? props.linkLabel : t('core.home.categories.linkLabel'))

const categories = computed<CategoryTile[]>(() => props.items?.length
  ? props.items
  : [
      { name: t('core.siteLinks.women'), image: '/img/home/cat_women_sand.webp', link: '/women' },
      { name: t('core.siteLinks.men'), image: '/img/home/cat_men_sand.webp', link: '/men' },
      { name: t('core.home.categories.accessories'), image: '/img/home/cat_accessories_sand.webp', link: '/women/accessories' },
    ])

// Tiles are 1/3 width at three-up but half at four-up, so the responsive hint
// has to follow the count the merchant chose rather than stay hard-coded.
const imageSizes = computed(() => categories.value.length >= 4
  ? 'xs:100vw sm:50vw md:25vw lg:25vw xl:25vw xxl:25vw 2xl:25vw'
  : 'xs:100vw sm:100vw md:33vw lg:33vw xl:33vw xxl:33vw 2xl:33vw')

const gridClass = computed(() => categories.value.length >= 4
  ? 'grid-cols-2 md:grid-cols-4'
  : categories.value.length === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-3')
</script>

<template>
  <section class="narrow-container py-[clamp(64px,9vw,132px)]">
    <UiSectionHeading
      :eyebrow="eyebrowText"
      :title="titleText"
      :link-label="linkLabelText"
      :link-url="linkUrl"
    />

    <div
      class="grid gap-6"
      :class="gridClass"
    >
      <NuxtLink
        v-for="(category, index) in categories"
        :key="`${category.name}-${index}`"
        :to="category.link || '/products'"
        class="group relative block overflow-hidden rounded-[3px]"
      >
        <NuxtImg
          :src="category.image"
          :provider="imageProvider(category.image)"
          alt=""
          aria-hidden="true"
          width="896"
          height="1088"
          :sizes="imageSizes"
          densities="1x"
          class="w-full aspect-4/5 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-white bg-linear-to-t from-black/55 to-transparent">
          <span class="text-[19px] font-medium">{{ category.name }}</span>
          <span class="grid place-items-center w-[38px] h-[38px] rounded-full border border-white/50 transition-colors duration-300 group-hover:bg-white group-hover:text-black">
            <UiIconArrowRight :width="14" />
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

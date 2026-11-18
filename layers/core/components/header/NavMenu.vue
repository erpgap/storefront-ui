<script lang="ts" setup>
import { SfIconExpandMore } from '@storefront-ui/vue'
import type { MenuItem } from '../../utils/websiteMenu'

defineProps<{
  items: MenuItem[]
}>()

const route = useRoute()
const openId = ref<number | null>(null)
const buttons = ref<Record<number, HTMLButtonElement | null>>({})
let closeTimer: ReturnType<typeof setTimeout> | undefined

const open = (id: number) => {
  clearTimeout(closeTimer)
  openId.value = id
}
const close = () => {
  clearTimeout(closeTimer)
  openId.value = null
}
// A mouse has already opened the panel by hovering, so its click keeps it
// open rather than shutting it in the shopper's face; Enter, Space and a tap
// toggle it.
const onClick = (event: MouseEvent, id: number) => {
  if ((event as PointerEvent).pointerType === 'mouse') return open(id)
  return openId.value === id ? close() : open(id)
}

// Hover opens for a mouse only (a tap is a click), and closes a moment after
// the pointer leaves, so crossing the gap to the panel does not shut it.
const onPointerEnter = (event: PointerEvent, id: number) => {
  if (event.pointerType === 'mouse') open(id)
}
const onPointerLeave = (event: PointerEvent, id: number) => {
  if (event.pointerType !== 'mouse' || openId.value !== id) return
  closeTimer = setTimeout(close, 150)
}

const closeAndFocus = (id: number) => {
  close()
  buttons.value[id]?.focus()
}

// Focus moving out of an item (Tab past its last link) closes its panel.
const onFocusOut = (event: FocusEvent, id: number) => {
  const next = event.relatedTarget as Node | null
  if (openId.value === id && !(event.currentTarget as HTMLElement).contains(next)) close()
}

// The page a link leads to is the one shown, or one beneath it.
const isCurrentLink = (link: MenuItem) => {
  const to = link.to
  if (!to || link.external) return false
  return to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`)
}
// A top entry is current when it, or a link in its submenu, is.
const isCurrent = (item: MenuItem) => isCurrentLink(item) || item.children.some(isCurrentLink)

// Tailwind only, no <style> block: a component's own CSS ships as a separate,
// render-blocking stylesheet, while Tailwind's is inlined in the page.
const ENTRY = 'relative py-1.5 text-[13px] tracking-[0.08em] uppercase whitespace-nowrap transition-colors hover:text-black aria-expanded:text-black'
  + ' after:absolute after:left-0 after:bottom-0 after:h-px after:bg-black after:transition-[width] after:duration-300 hover:after:w-full aria-expanded:after:w-full'
const entryClass = (item: MenuItem) => [ENTRY, isCurrent(item) ? 'text-black after:w-full' : 'text-primary-600 after:w-0']

const LINK = 'group flex items-center justify-between gap-6 px-6 py-2.5 text-[15px] whitespace-nowrap transition-colors hover:text-black focus-visible:text-black'
// The page being shown: black, a touch heavier, and marked by a bar at its
// left, as the top entry is by its underline.
// Only the closest match is marked: on /women/clothing, Clothing and not
// "View all" (/women).
const currentLinkIn = (item: MenuItem) => [item, ...item.children]
  .filter(isCurrentLink)
  .sort((a, b) => b.to.length - a.to.length)[0]
const linkClass = (link: MenuItem, item: MenuItem) => [
  LINK,
  link === currentLinkIn(item) ? 'text-black font-medium shadow-[inset_2px_0_0_black]' : 'text-primary-600',
]

watch(() => route.fullPath, close)
onBeforeUnmount(() => clearTimeout(closeTimer))
</script>

<template>
  <!-- Full height of the header, so a submenu opens right at its bottom edge. -->
  <ul class="flex h-full gap-7">
    <li
      v-for="item in items"
      :key="item.id"
      class="relative flex items-center"
      @pointerenter="onPointerEnter($event, item.id)"
      @pointerleave="onPointerLeave($event, item.id)"
      @focusout="onFocusOut($event, item.id)"
      @keydown.escape="item.children.length && closeAndFocus(item.id)"
    >
      <!-- An entry with a submenu opens it; its own page is the first link inside. -->
      <template v-if="item.children.length">
        <button
          :ref="(el) => { buttons[item.id] = el as HTMLButtonElement | null }"
          type="button"
          class="flex items-center gap-1"
          :class="entryClass(item)"
          :aria-expanded="openId === item.id"
          :aria-controls="`header-menu-${item.id}`"
          @click="onClick($event, item.id)"
        >
          {{ item.label }}
          <SfIconExpandMore
            size="sm"
            class="transition-transform duration-200"
            :class="{ 'rotate-180': openId === item.id }"
            aria-hidden="true"
          />
        </button>
        <!-- Rendered hidden rather than left out, so its links are in the page.
             It hangs from the header's bottom line, 1px down to leave it seen. -->
        <Transition
          enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
          leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
          enter-from-class="opacity-0 -translate-y-1"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-show="openId === item.id"
            :id="`header-menu-${item.id}`"
            class="absolute left-1/2 -translate-x-1/2 top-[calc(100%+1px)] z-50 min-w-[260px] bg-white border-x border-b border-primary-100 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.22)]"
          >
            <ul class="py-4">
              <li v-if="item.to">
                <NuxtLink
                  :to="item.to"
                  :external="item.external"
                  :class="linkClass(item, item)"
                >
                  <span>{{ item.label }}</span>
                  <span
                    class="text-sm opacity-0 -translate-x-1.5 transition group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none"
                    aria-hidden="true"
                  >→</span>
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
                  :class="linkClass(child, item)"
                >
                  <span>{{ child.label }}</span>
                  <span
                    class="text-sm opacity-0 -translate-x-1.5 transition group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none"
                    aria-hidden="true"
                  >→</span>
                </NuxtLink>
                <span
                  v-else
                  class="block px-6 pt-3 pb-1 text-[11px] tracking-[0.16em] uppercase text-primary-400"
                >{{ child.label }}</span>
              </li>
            </ul>
          </div>
        </Transition>
      </template>

      <NuxtLink
        v-else-if="item.to"
        :to="item.to"
        :external="item.external"
        :class="entryClass(item)"
      >
        {{ item.label }}
      </NuxtLink>
      <span
        v-else
        :class="entryClass(item)"
      >{{ item.label }}</span>
    </li>
  </ul>
</template>

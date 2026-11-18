<script lang="ts" setup>
import type { MenuItem } from '../../utils/websiteMenu'

const props = defineProps<{
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

// Escape closes whichever panel is open, one opened by hovering too: focus is
// elsewhere then, so a handler on the entry would never hear the key. Focus
// goes back to the entry's button only if it was in the entry.
useEventListener(globalThis.document, 'keydown', (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || openId.value === null) return
  const id = openId.value
  const hadFocus = buttons.value[id]?.closest('li')?.contains(document.activeElement)
  close()
  if (hadFocus) buttons.value[id]?.focus()
})

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
// A submenu's link unfolded in More: indented under its entry, a size down.
const SUB_LINK = LINK.replace('px-6', 'pl-10 pr-6').replace('text-[15px]', 'text-[14px]')
const subLinkClass = (link: MenuItem, item: MenuItem) => [
  SUB_LINK,
  link === currentLinkIn(item) ? 'text-black font-medium shadow-[inset_2px_0_0_black]' : 'text-primary-600',
]
const linkClass = (link: MenuItem, item: MenuItem) => [
  LINK,
  link === currentLinkIn(item) ? 'text-black font-medium shadow-[inset_2px_0_0_black]' : 'text-primary-600',
]

// --- One row, whatever Odoo holds --------------------------------------------
// The entries that fit between the logo and the icons show; the rest go into
// a More menu at the end. The widths are measured once with every entry shown
// (again once the web font is in, and when the menu changes), then each
// resize only recounts. Until then the row is clipped, so the server-rendered
// header never pushes the icons out or scrolls the page sideways.
const MORE = Number.MIN_SAFE_INTEGER
const GAP = 28 // gap-7
const list = ref<HTMLUListElement>()
const moreEntry = ref<HTMLLIElement>()
const fitCount = ref(props.items.length)
const measured = ref(false)
let widths: number[] = []
let observer: ResizeObserver | undefined

const available = () => list.value?.parentElement?.clientWidth ?? 0

const fit = () => {
  const room = available()
  if (!room) return // hidden (below the desktop width): recount once shown
  if (!widths.some(Boolean)) return void remeasure()
  const all = widths.reduce((sum, width) => sum + width, 0) + GAP * (widths.length - 1)
  if (all <= room) {
    fitCount.value = widths.length
    return
  }
  let used = moreEntry.value?.getBoundingClientRect().width ?? 0
  let count = 0
  for (const width of widths) {
    if (used + GAP + width > room) break
    used += GAP + width
    count++
  }
  fitCount.value = count
}

async function remeasure() {
  fitCount.value = props.items.length
  await nextTick()
  const entries = list.value?.querySelectorAll<HTMLElement>(':scope > li[data-entry]') ?? []
  widths = [...entries].map(entry => entry.getBoundingClientRect().width)
  fit()
  measured.value = true
}

const overflow = computed(() => props.items.slice(fitCount.value))

// In More, the entry whose submenu is unfolded: on opening, the one holding
// the page being shown, if any.
const moreOpenId = ref<number | null>(null)
watch(openId, (id) => {
  if (id === MORE) moreOpenId.value = overflow.value.find(item => item.children.length && isCurrent(item))?.id ?? null
})

onMounted(() => {
  remeasure()
  if (list.value?.parentElement) {
    observer = new ResizeObserver(fit)
    observer.observe(list.value.parentElement)
  }
  document.fonts?.ready.then(remeasure)
})
watch(() => props.items, remeasure)

watch(() => route.fullPath, close)
onBeforeUnmount(() => {
  clearTimeout(closeTimer)
  observer?.disconnect()
})
</script>

<template>
  <!-- Full height of the header, so a submenu opens right at its bottom edge.
       Clipped until the entries are measured (see fit). -->
  <ul
    ref="list"
    class="relative flex h-full min-w-0 gap-7"
    :class="{ 'overflow-hidden': !measured }"
  >
    <li
      v-for="(item, index) in items"
      v-show="index < fitCount"
      :key="item.id"
      data-entry
      class="relative flex shrink-0 items-center"
      @pointerenter="onPointerEnter($event, item.id)"
      @pointerleave="onPointerLeave($event, item.id)"
      @focusout="onFocusOut($event, item.id)"
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
          <!-- A thin chevron, to match the light uppercase labels; it turns
               over on an ease that settles, rather than flipping. -->
          <svg
            viewBox="0 0 12 12"
            class="size-2.5 ml-0.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            :class="{ 'rotate-180': openId === item.id }"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          ><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
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

    <!-- More: the entries that do not fit. Always rendered, so its width is
         known; out of the row and of reach while nothing overflows. -->
    <li
      ref="moreEntry"
      class="relative flex shrink-0 items-center"
      :class="{ 'absolute invisible pointer-events-none': !overflow.length }"
      :aria-hidden="!overflow.length || undefined"
      :inert="!overflow.length || undefined"
      @pointerenter="onPointerEnter($event, MORE)"
      @pointerleave="onPointerLeave($event, MORE)"
      @focusout="onFocusOut($event, MORE)"
    >
      <button
        :ref="(el) => { buttons[MORE] = el as HTMLButtonElement | null }"
        type="button"
        class="flex items-center gap-1"
        :class="[ENTRY, overflow.some(isCurrent) ? 'text-black after:w-full' : 'text-primary-600 after:w-0']"
        :aria-expanded="openId === MORE"
        aria-controls="header-menu-more"
        @click="onClick($event, MORE)"
      >
        {{ $t('core.header.more') }}
        <svg
          viewBox="0 0 12 12"
          class="size-2.5 ml-0.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          :class="{ 'rotate-180': openId === MORE }"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        ><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
      </button>
      <Transition
        enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
        leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
        enter-from-class="opacity-0 -translate-y-1"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <!-- At the right edge of More, the last entry, so it stays on screen. -->
        <div
          v-show="openId === MORE"
          id="header-menu-more"
          class="absolute right-0 top-[calc(100%+1px)] z-50 min-w-[260px] max-h-[70vh] overflow-y-auto bg-white border-x border-b border-primary-100 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.22)]"
        >
          <ul class="py-3">
            <li
              v-for="item in overflow"
              :key="item.id"
            >
              <!-- An entry with a submenu: one row that unfolds its links
                   beneath it, one at a time, so submenus never pile up. -->
              <template v-if="item.children.length">
                <button
                  type="button"
                  :class="[LINK, 'w-full text-left', isCurrent(item) ? 'text-black font-medium' : 'text-primary-600']"
                  :aria-expanded="moreOpenId === item.id"
                  :aria-controls="`header-more-${item.id}`"
                  @click="moreOpenId = moreOpenId === item.id ? null : item.id"
                >
                  <span>{{ item.label }}</span>
                  <svg
                    viewBox="0 0 12 12"
                    class="size-2.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    :class="{ 'rotate-180': moreOpenId === item.id }"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  ><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
                </button>
                <ul
                  v-show="moreOpenId === item.id"
                  :id="`header-more-${item.id}`"
                  class="pb-2"
                >
                  <template
                    v-for="link in [...(item.to ? [item] : []), ...item.children]"
                    :key="link.id"
                  >
                    <li v-if="link.to">
                      <NuxtLink
                        :to="link.to"
                        :external="link.external"
                        :class="subLinkClass(link, item)"
                      >
                        <span>{{ link.label }}</span>
                      </NuxtLink>
                    </li>
                  </template>
                </ul>
              </template>
              <NuxtLink
                v-else-if="item.to"
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
              <!-- No page of its own: shown as the others are, not greyed out. -->
              <span
                v-else
                class="flex px-6 py-2.5 text-[15px] whitespace-nowrap text-primary-600"
              >{{ item.label }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </li>
  </ul>
</template>

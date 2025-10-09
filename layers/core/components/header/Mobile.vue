<script lang="ts" setup>
  import {
    SfButton,
    SfDrawer,
    SfIconMenu,
    SfIconClose,
    SfListItem,
    useDisclosure,
    useTrapFocus,
  } from '@storefront-ui/vue'
  import {
    onClickOutside
  } from '@vueuse/core'
  import {
    HeaderButtonSearch
  } from '#components'
  import type {
    Category
  } from '~/graphql'

  const {
    isOpen,
    toggle,
    close
  } = useDisclosure()

  const NuxtLink = resolveComponent('NuxtLink')

  const menuRef = ref()
  const drawerRef = ref()
  const searchRef = ref()
  const showSearchClerkRef = ref()

  useTrapFocus(drawerRef, {
    activeState: isOpen,
    arrowKeysUpDown: true,
    initialFocus: 'container',
  })

  onClickOutside(menuRef, () => {
    close()
  })

  onClickOutside(searchRef, () => {
    showSearchClerkRef.value = false
  })

  const categoriesForMegaMenu = inject < Category[] > ('categoriesForMegaMenu')
</script>

<template>
  <header ref="menuRef" :class="[
      'text-black flex w-full py-3.5 bg-white border-b border-[#E5E7EB]',
    ]">
    <div class="flex items-center justify-between h-full w-full narrow-container">
      <!-- Icon -->
      <div>
        <SfButton class="block font-body bg-transparent hover:bg-white active:bg-white self-end !pl-0 mr-[4px]"
          type="button" :aria-haspopup="true" :aria-expanded="isOpen" variant="tertiary" square @click="toggle()">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16" fill="none">
            <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 0)" fill="black" />
            <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 0)" fill="black" />
            <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 7.04016)" fill="black" />
            <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 7.04016)" fill="black" />
            <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 14.08)" fill="black" />
            <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 14.08)" fill="black" />
          </svg>
        </SfButton>
      </div>
      <!-- Logo -->
      <NuxtLink to="/" aria-label="Sf Homepage" class="h-6 mt-[-3px]">
        <AlokaiLogo class="h-full w-auto" />
      </NuxtLink>
      <!-- Nav -->
      <transition enter-active-class="transform transition duration-500 ease-in-out"
        leave-active-class="transform transition duration-500 ease-in-out"
        enter-from-class="-translate-x-full md:translate-x-0 md:opacity-0"
        enter-to-class="translate-x-0 md:translate-x-0 md:opacity-100" leave-from-class="translate-x-0 md:opacity-100"
        leave-to-class="-translate-x-full md:translate-x-0 md:opacity-0">
        <SfDrawer ref="drawerRef" v-model="isOpen" disable-click-away placement="bottom"
          class="bg-white h-[calc(100%-97px)] overflow-y-auto w-full top-index">
          <div class="flex flex-col h-full">
            <ul class="p-6 px-4 flex flex-col">
              <li>
                <p>
                  <a href="#"
                    class="flex justify-between items-center border-b border-[#e5e7eb] text-[16px] text-black font-medium py-4">Living
                    Room Seating <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17"
                      fill="none">
                      <g clip-path="url(#clip0_77_682)">
                        <path
                          d="M4.26521 1.43191C4.72625 0.970869 5.47373 0.970869 5.93477 1.43191L12.734 8.23119C12.9554 8.45259 13.0805 8.75358 13.0805 9.06668C13.0805 9.37978 12.9562 9.68006 12.7348 9.90146L5.93477 16.7015C5.47372 17.1625 4.72625 17.1625 4.26521 16.7015C3.80417 16.2404 3.80417 15.4929 4.26521 15.0319L10.2304 9.06668L4.26521 3.10146C3.80417 2.64044 3.80417 1.89295 4.26521 1.43191Z"
                          fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_77_682">
                          <rect width="17" height="17" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a href="#"
                    class="flex justify-between items-center border-b border-[#e5e7eb] text-[16px] text-black font-medium py-4">Tables
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                      <g clip-path="url(#clip0_77_682)">
                        <path
                          d="M4.26521 1.43191C4.72625 0.970869 5.47373 0.970869 5.93477 1.43191L12.734 8.23119C12.9554 8.45259 13.0805 8.75358 13.0805 9.06668C13.0805 9.37978 12.9562 9.68006 12.7348 9.90146L5.93477 16.7015C5.47372 17.1625 4.72625 17.1625 4.26521 16.7015C3.80417 16.2404 3.80417 15.4929 4.26521 15.0319L10.2304 9.06668L4.26521 3.10146C3.80417 2.64044 3.80417 1.89295 4.26521 1.43191Z"
                          fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_77_682">
                          <rect width="17" height="17" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </p>
              </li>
              <li>
                <p><a href="#"
                    class="flex justify-between items-center border-b border-[#e5e7eb] text-[16px] text-black font-medium py-4">Bedroom
                    Furniture <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17"
                      fill="none">
                      <g clip-path="url(#clip0_77_682)">
                        <path
                          d="M4.26521 1.43191C4.72625 0.970869 5.47373 0.970869 5.93477 1.43191L12.734 8.23119C12.9554 8.45259 13.0805 8.75358 13.0805 9.06668C13.0805 9.37978 12.9562 9.68006 12.7348 9.90146L5.93477 16.7015C5.47372 17.1625 4.72625 17.1625 4.26521 16.7015C3.80417 16.2404 3.80417 15.4929 4.26521 15.0319L10.2304 9.06668L4.26521 3.10146C3.80417 2.64044 3.80417 1.89295 4.26521 1.43191Z"
                          fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_77_682">
                          <rect width="17" height="17" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </p>
              </li>
              <li>
                <p><a href="#"
                    class="flex justify-between items-center border-b border-[#e5e7eb] text-[16px] text-black font-medium py-4">Storage &
                    Shelving <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17"
                      fill="none">
                      <g clip-path="url(#clip0_77_682)">
                        <path
                          d="M4.26521 1.43191C4.72625 0.970869 5.47373 0.970869 5.93477 1.43191L12.734 8.23119C12.9554 8.45259 13.0805 8.75358 13.0805 9.06668C13.0805 9.37978 12.9562 9.68006 12.7348 9.90146L5.93477 16.7015C5.47372 17.1625 4.72625 17.1625 4.26521 16.7015C3.80417 16.2404 3.80417 15.4929 4.26521 15.0319L10.2304 9.06668L4.26521 3.10146C3.80417 2.64044 3.80417 1.89295 4.26521 1.43191Z"
                          fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_77_682">
                          <rect width="17" height="17" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </p>
              </li>
              <li>
                <p><a href="#"
                    class="flex justify-between items-center border-b border-[#e5e7eb] text-[16px] text-black font-medium py-4">Lighting
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                      <g clip-path="url(#clip0_77_682)">
                        <path
                          d="M4.26521 1.43191C4.72625 0.970869 5.47373 0.970869 5.93477 1.43191L12.734 8.23119C12.9554 8.45259 13.0805 8.75358 13.0805 9.06668C13.0805 9.37978 12.9562 9.68006 12.7348 9.90146L5.93477 16.7015C5.47372 17.1625 4.72625 17.1625 4.26521 16.7015C3.80417 16.2404 3.80417 15.4929 4.26521 15.0319L10.2304 9.06668L4.26521 3.10146C3.80417 2.64044 3.80417 1.89295 4.26521 1.43191Z"
                          fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_77_682">
                          <rect width="17" height="17" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </p>
              </li>
              <li>
                <p><a href="#"
                    class="flex justify-between items-center border-b border-[#e5e7eb] text-[16px] text-black font-medium py-4">Home
                    Office <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17"
                      fill="none">
                      <g clip-path="url(#clip0_77_682)">
                        <path
                          d="M4.26521 1.43191C4.72625 0.970869 5.47373 0.970869 5.93477 1.43191L12.734 8.23119C12.9554 8.45259 13.0805 8.75358 13.0805 9.06668C13.0805 9.37978 12.9562 9.68006 12.7348 9.90146L5.93477 16.7015C5.47372 17.1625 4.72625 17.1625 4.26521 16.7015C3.80417 16.2404 3.80417 15.4929 4.26521 15.0319L10.2304 9.06668L4.26521 3.10146C3.80417 2.64044 3.80417 1.89295 4.26521 1.43191Z"
                          fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_77_682">
                          <rect width="17" height="17" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </p>
              </li>
            </ul>
            <div class="mt-auto">
              <ul class="flex">
                <li class="flex-1 border-t border-r border-[#E5E7EB]">
                  <a href="#" class="block bg-[#f7f7f7] h-full w-full py-4 text-center flex items-center justify-center gap-3">
                    <Icon
                      :name="isAuthenticated ? 'ion:person' : 'ion:person-outline'"
                      size="22px"
                      class="!text-black"
                    />
                    Account
                  </a>
                </li>
                <li class="flex-1 border-t border-[#E5E7EB]">
                  <a href="#" class="block bg-[#f7f7f7] h-full w-full py-4 text-center flex items-center justify-center gap-3">
                    <Icon
                      :name="wishlistTotalItems > 0 ? 'mdi:heart' : 'mdi:heart-outline'"
                      size="22px"
                      class="!text-black"
                    />
                    Wishlist
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </SfDrawer>
      </transition>
      <!-- Icon -->
      <div>
        <HeaderButtonCart />
      </div>
    </div>
  </header>
</template>
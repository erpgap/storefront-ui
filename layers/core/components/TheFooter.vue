<template>
  <footer class="bg-[#f7f7f7]">
        <div class="footer-top text-black">
      <div
        class="narrow-container pt-[50px] lg:pt-[90px] pb-[60px] lg:pb-[190px] flex flex-col xl:flex-row justify-between gap-[60px] xl:gap-[100px]">
        <!-- Col -->
        <div>
          <div class="min-w-[180px]">
            <!-- Logo -->
            <NuxtLink to="/" aria-label="Sf Homepage">
              <AlokaiLogo class="w-auto h-9" />
            </NuxtLink>
          </div>
        </div>
        <!-- Col -->
        <div class="flex flex-col md:flex-row justify-between gap-[25px] lg:gap-[30px] grow">
          <!-- Col -->
          <div class="">
            <h3 class="text-[20px] font-semibold mb-[15px] md:mb-[30px]">How To Buy</h3>
            <ul class="flex flex-col gap-[10px] md:gap-[16px]">
              <li><a href="#" class="hover:underline">Payment methods</a></li>
              <li><a href="#" class="hover:underline">Order pickup</a></li>
              <li><a href="#" class="hover:underline">Purchase status</a></li>
              <li><a href="#" class="hover:underline">Track orders</a></li>
              <li><a href="#" class="hover:underline">Returns</a></li>
            </ul>
          </div>
          <!-- Col -->
          <div class="">
            <h3 class="text-[20px] font-semibold mb-[15px] md:mb-[30px]">Help</h3>
            <ul class="flex flex-col gap-[10px] md:gap-[16px]">
              <li><a href="#" class="hover:underline">Help centers</a></li>
              <li><a href="#" class="hover:underline">Security & fraud</a></li>
              <li><a href="#" class="hover:underline">Feedback</a></li>
              <li><a href="#" class="hover:underline">Contact</a></li>
            </ul>
          </div>
          <!-- Col -->
          <div class="">
            <h3 class="text-[20px] font-semibold mb-[15px] md:mb-[30px]">Services</h3>
            <ul class="flex flex-col gap-[10px] md:gap-[16px]">
              <li><a href="#" class="hover:underline">Gift cards</a></li>
              <li><a href="#" class="hover:underline">Order pickup</a></li>
              <li><a href="#" class="hover:underline">Purchase status</a></li>
              <li><a href="#" class="hover:underline">Track orders</a></li>
            </ul>
          </div>
          <!-- Col -->
          <div class=" shrink-0">
            <h3 class="text-[20px] font-semibold mb-[15px] md:mb-[30px] text-nowrap">About</h3>
            <ul class="flex flex-col gap-[10px] md:gap-[16px]">
              <li><a href="#" class="hover:underline">About Us</a></li>
              <li><a href="#" class="hover:underline">Order pickup</a></li>
              <li><a href="#" class="hover:underline">Purchase status</a></li>
              <li><a href="#" class="hover:underline">Track orders</a></li>
              <li><a href="#" class="hover:underline">Returns</a></li>
            </ul>
          </div>
          <!-- Col -->
          <div class="">
            <h3 class="text-[20px] font-semibold mb-[15px] md:mb-[40px]">Contact Us</h3>
            <ul class="flex flex-col gap-[10px] md:gap-[16px]">
              <li><a href="#" class="flex items-center gap-[15px] hover:underline"><NuxtImg
                    src="img/phone.svg" alt="erpgap-icon" class="w-[42px]" />
                  <p>+1 222-333-444</p>
                </a></li>
              <li><a href="#" class="flex items-center gap-[15px] hover:underline"><NuxtImg
                    src="img/email.svg" alt="erpgap-icon" class="w-[42px]" />
                  <p>info@erpgap.com</p>
                </a></li>
            </ul>
            <h3 class="text-[20px] font-semibold my-[15px] md:my-[40px]">Follow Us</h3>
            <ul class="flex items-center gap-[24px]">
              <li><a href="#"><NuxtImg src="img/x.svg" alt="erpgap-icon" class="w-[42px]" /></a></li>
              <li><a href="#"><NuxtImg src="img/linkedin.svg" alt="erpgap-icon" class="w-[42px]" /></a></li>
              <li><a href="#"><NuxtImg src="img/github.svg" alt="erpgap-icon" class="w-[42px]" /></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-[#191919] text-white">
      <div
        class="narrow-container flex flex-col sm:flex-row items-center justify-between gap-4 py-6 sm:py-9"
      >
        <div
          class="flex items-center justify-center gap-4 sm:gap-6"
        >
          <SfLink
            v-for="{ label, link } in bottomLinks"
            :key="label"
            variant="secondary"
            class="!text-white no-underline hover:underline text-[14px] text-normal"
            :href="link"
          >
            {{ label }}
          </SfLink>
        </div>
        <p
          class="flex items-center justify-center text-[14px] text-normal"
        >
          @{{ new Date().getFullYear() }} Alokai by&nbsp;<a
            class="underline"
            href="https://www.erpgap.com/"
          >ERPGAP</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import {
  SfIconContactSupport,
  SfIconFacebook,
  SfIconHelp,
  SfIconInstagram,
  SfIconCall,
  SfIconPinterest,
  SfIconTwitter,
  SfIconYoutube,
  SfButton,
  SfLink,
  SfListItem,
} from '@storefront-ui/vue'

const categories = [
  {
    label: 'How to buy',
    subcategories: [
      {
        subcategoryLabel: 'Payment methods',
        link: '#',
      },
      {
        subcategoryLabel: 'Order pickup',
        link: '#',
      },
      {
        subcategoryLabel: 'Purchase status',
        link: '#',
      },
      {
        subcategoryLabel: 'Track orders',
        link: '#',
      },
      {
        subcategoryLabel: 'Returns',
        link: '#',
      },
    ],
  },
  {
    label: 'Help',
    subcategories: [
      {
        subcategoryLabel: 'Help centers',
        link: '#',
      },
      {
        subcategoryLabel: 'Security & fraud',
        link: '#',
      },
      {
        subcategoryLabel: 'Feedback',
        link: '#',
      },
      {
        subcategoryLabel: 'Contact',
        link: '#',
      },
    ],
  },
  {
    label: 'Services',
    subcategories: [
      {
        subcategoryLabel: 'Gift cards',
        link: '#',
      },
      {
        subcategoryLabel: 'Order pickup',
        link: '#',
      },
      {
        subcategoryLabel: 'Purchase status',
        link: '#',
      },
      {
        subcategoryLabel: 'Track orders',
        link: '#',
      },
    ],
  },
  {
    label: 'About',
    subcategories: [
      {
        subcategoryLabel: 'About us',
        link: '#',
      },
      {
        subcategoryLabel: 'Order pickup',
        link: '#',
      },
      {
        subcategoryLabel: 'Purchase status',
        link: '#',
      },
      {
        subcategoryLabel: 'Track orders',
        link: '#',
      },
      {
        subcategoryLabel: 'Returns',
        link: '#',
      },
    ],
  },
]
const contactOptions = [
  {
    label: 'Help center',
    link: '#',
    details: ['Find answers online anytime'],
    icon: SfIconHelp,
  },
  {
    label: 'Live chat',
    link: '#',
    details: ['Mon–Fri, 5am–10pm PT', 'Sat–Sun, 6am–9pm PT'],
    icon: SfIconContactSupport,
  },
  {
    label: '1 234 567 8901',
    link: '#',
    details: ['Mon–Fri, 5am–10pm PT', 'Sat–Sun, 6am–9pm PT'],
    icon: SfIconCall,
  },
]
const bottomLinks = [
  {
    label: 'Privacy policy',
    link: '#',
  },
  {
    label: 'Terms of Service',
    link: '#',
  },
]
</script>

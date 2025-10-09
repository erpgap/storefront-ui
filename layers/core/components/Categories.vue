<script setup>
import { SfScrollable, SfButton } from '@storefront-ui/vue'
</script>

<template>
  <div class="narrow-container pt-[40px] pb-[40px] md:pt-[80px] md:pb-[120px]">
    <h3 class="text-[24px] sm:text-[28px] font-normal mb-[30px] md:mb-[50px]">
      Shop by Category
    </h3>
    <ul class="hidden md:grid grid-cols-3 gap-x-5 gap-y-10">
      <li>
        <a href="#">
          <NuxtImg
            src="/img/categories/living-room-seating.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Living Room Seating <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </li>
      <li>
        <a href="#">
          <NuxtImg
            src="/img/categories/tables.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Tables <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </li>
      <li>
        <a href="#">
          <NuxtImg
            src="/img/categories/bedroom-furniture.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Bedroom Furniture <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </li>
      <li>
        <a href="#">
          <NuxtImg
            src="/img/categories/storage-and-shelving.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Storage & Shelving <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </li>
      <li>
        <a href="#">
          <NuxtImg
            src="/img/categories/lighting.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Lighting <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </li>
      <li>
        <a href="#">
          <NuxtImg
            src="/img/categories/home-office.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Home Office <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </li>
    </ul>
    <SfScrollable
      buttons-placement="none"
      class="items-center pb-8 flex md:hidden"
      data-testid="category-slider"
      drag="true"
    >
      <div class="min-w-[300px] max-w-[300px]">
        <a href="#">
          <NuxtImg
            src="/img/categories/living-room-seating.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Living Room Seating <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </div>
      <div class="min-w-[300px] max-w-[300px]">
        <a href="#">
          <NuxtImg
            src="/img/categories/tables.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Tables <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </div>
      <div class="min-w-[300px] max-w-[300px]">
        <a href="#">
          <NuxtImg
            src="/img/categories/bedroom-furniture.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Bedroom Furniture <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </div>
      <div class="min-w-[300px] max-w-[300px]">
        <a href="#">
          <NuxtImg
            src="/img/categories/storage-and-shelving.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Storage & Shelving <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </div>
      <div class="min-w-[300px] max-w-[300px]">
        <a href="#">
          <NuxtImg
            src="/img/categories/lighting.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Lighting <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </div>
      <div class="min-w-[300px] max-w-[300px]">
        <a href="#">
          <NuxtImg
            src="/img/categories/home-office.jpg"
            class="w-full"
            alt="category-img"
          />
          <p class="text-[16px] uppercase tracking-[0.5px] flex items-center gap-3 mt-5">Home Office <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z" fill="black"/>
          </svg></p>
        </a>
      </div>
    </SfScrollable>
  </div>
</template>

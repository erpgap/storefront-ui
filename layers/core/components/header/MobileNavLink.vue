<script lang="ts" setup>
defineProps<{
  to: string
  label: string
}>()

defineEmits<{
  navigate: []
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex justify-between items-center border-b border-primary-100 text-[16px] text-black font-medium py-4"
    @click="$emit('navigate')"
  >
    {{ label }}

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      aria-hidden="true"
    >
      <g clip-path="url(#clip0_77_682)">
        <path
          d="M4.26521 1.43191C4.72625 0.970869 5.47373 0.970869 5.93477 1.43191L12.734 8.23119C12.9554 8.45259 13.0805 8.75358 13.0805 9.06668C13.0805 9.37978 12.9562 9.68006 12.7348 9.90146L5.93477 16.7015C5.47372 17.1625 4.72625 17.1625 4.26521 16.7015C3.80417 16.2404 3.80417 15.4929 4.26521 15.0319L10.2304 9.06668L4.26521 3.10146C3.80417 2.64044 3.80417 1.89295 4.26521 1.43191Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_77_682">
          <rect width="17" height="17" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </NuxtLink>
</template>

<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

defineProps({
    searchText: { type: String, default: '' },
})
</script>

<template>
    <div :class="[
        'flex flex-col gap-[20px] bg-white w-full h-[392px]  overflow-hidden rounded-md py-6 px-2',
        {
            'absolute top-12 shadow-md px-[34px]':
                $viewport.isGreaterThan('tablet'),
        },
    ]">
        <div class="grid gap-[30px] text-center justify-center items-center">
            <NuxtImg class="mx-auto" src="/images/something-went-wrong.svg" :alt="$t('emptyStateAltText')"
                width="138" />

            <p class=" font-medium text-[18px] text-center text-[#121212]">
                {{ `${$t('noResultsFor')} ` }}"<span class="text-primary font-extrabold">{{ searchText }}</span>"
            </p>

            <SfButton class="md:flex" variant="secondary" @click="navigateTo('/search')">
                {{ $t("seeAllProducts") }}
            </SfButton>
        </div>
    </div>
</template>

<style scoped></style>

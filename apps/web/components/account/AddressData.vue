<template>
    <div class="flex items-center col-span-3">
        <SfRadio class="min-w-5 aspect-square"/>
        <div class="md:mx-4" data-testid="address-data">
            <div class="flex justify-between my-2">
                <h2 class="typography-headline-4 font-bold">{{ header }}</h2>
                <div>
                    <SfButton
                        variant="tertiary"
                        size="sm"
                        class="self-start"
                        @click="$emit('on-click')"
                        >{{ buttonText }}</SfButton
                    >
                    <SfButton
                        variant="tertiary"
                        size="sm"
                        class="self-start text-red-700 hover:bg-red-100 hover:text-red-800 active:bg-red-200 active:text-red-900 disabled:bg-transparent"
                        @click="$emit('on-click')"
                        >{{ deleteText }}</SfButton
                    >
                </div>
            </div>
            <div class="my-2">
                <slot />
            </div>
        </div>
    </div>
    <UiDivider class="w-screen -mx-4 md:col-span-3 md:w-auto md:mx-0" />

</template>
<script lang="ts" setup>
import { SfButton, SfRadio } from '@storefront-ui/vue';

type AddressDataProps = {
header: string;
buttonText: string;
deleteText: string;
};

defineProps<AddressDataProps>();
defineEmits(['on-click']);
</script>

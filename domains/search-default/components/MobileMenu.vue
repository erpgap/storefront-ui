<script lang="ts" setup>
import { SfDrawer, SfButton, useDisclosure, SfInput, SfIconClose, SfIconSearch } from '@storefront-ui/vue'

const { isOpen: collapseOpen, toggle: collapseToggle } = useDisclosure()
const formSearchTemplateRef = ref(null)
const {
    searchInputValue,
    highlightedIndex,
    search,
    searchHits,
    enterPress,
    showResultSearch,
    selectHit,
} = useSearch(formSearchTemplateRef)

const handleSearch = () => {
    enterPress(searchHits[highlightedIndex])
}
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['close'])
const route = useRoute()
watch(
    () => route.path,
    () => {
        if (props.isOpen) {
            emit('close')
        }
    },
    { deep: true, immediate: true },
)
</script>

<template>
    <transition enter-active-class="transform transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full" enter-to-class="translate-x-0"
        leave-active-class="transform transition-transform duration-300 ease-in" leave-from-class="translate-x-0"
        leave-to-class="translate-x-full">
        <SfDrawer ref="searchMenuRef" :model-value="isOpen" placement="top"
            class="p-0 h-dvh w-full fixed top-0 bottom-0 left-0 right-auto z-80 bg-white py-5 px-6 overflow-y-auto no-scrollbar">
            <SfButton square variant="tertiary" class="absolute right-[16px] top-[16px] hover:bg-current"
                @click="$emit('close')">
                <SfIconClose class="text-neutral-500" />
            </SfButton>
            <div class="grid gap-4">
                <h2 class="flex items-center font-poppins font-medium text-sm leading-5 text-[#6C757D] h-[40px]" />
                <div>
                    <form ref="formSearchTemplateRef" role="search" class="w-full" @submit.prevent>
                        <SfInput v-model="searchInputValue" type="text"
                            class="[&::-webkit-search-cancel-button]:appearance-none" placeholder="Search"
                            wrapper-class="flex-1 h-10 pr-0" size="base" @input="search()"
                            @keydown.enter.prevent="handleSearch">
                            <template #suffix>
                                <span class="flex items-center">
                                    <SfButton v-if="searchInputValue" variant="tertiary" square aria-label="clear"
                                        class="rounded-l-none hover:bg-transparent active:bg-transparent"
                                        @click="searchInputValue = ''">
                                        <Icon name="ion:close" size="20px" class="text-neutral-500" />
                                    </SfButton>
                                    <SfButton variant="tertiary" square aria-label="search" type="submit"
                                        class="rounded-l-none hover:bg-transparent active:bg-transparent"
                                        @click="handleSearch">
                                        <Icon name="ion:search" size="20px" />
                                    </SfButton>
                                </span>
                            </template>
                        </SfInput>
                    </form>
                </div>
                <div v-if="showResultSearch" class="grid gap-[5px] text-black">
                    <LazyMobileSearchList :hits="searchHits" :search-text="searchInputValue" @select="selectHit" />
                </div>

                <div />
            </div>
        </SfDrawer>
    </transition>
</template>

<style scoped></style>

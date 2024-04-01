<script lang="ts" setup>
import {
  SfAccordionItem,
  SfButton,
  SfCheckbox,
  SfChip,
  SfIconChevronLeft,
  SfListItem,
  SfRadio,
  SfSelect,
  SfThumbnail,
} from "@storefront-ui/vue";
import { ProductFilterType } from "~/types/product";

const emit = defineEmits(["close"]);
const props = defineProps({
  attributes: {
    type: Array,
    required: true,
  },
  categories: {
    type: Object,
    required: true,
  },
});
const route: any = useRoute();
const router: any = useRouter();
const { changeFilters, facetsFromUrlToFilter } = useUiHelpers();

const sort = ref(route.query?.sort ? route.query?.sort : "");

const parent = computed(() => {
  return {
    label: props.categories?.label?.toLowerCase(),
    slug: props.categories?.slug,
  };
});
const getSortOptions = (searchData: { input: any }) => ({
  options: sortOptions,
  selected: searchData.input.sort || "name asc",
});
const changeSorting = async (newSort: string) => {
  sort.value = newSort;
};
const sortBy = computed(() => getSortOptions({ input: { sort: sort.value } }));
const selectedFilters = ref<any>([]);
const isFilterSelected = (option: any) => {
  return selectedFilters.value.some(
    (filter: { id: any }) => String(filter.id) === String(option.value)
  );
};
const isPriceSelected = (option: any) => {
  return selectedFilters.value.some(
    (filter: { id: any }) => String(filter.id) === String(option.values)
  );
};
const isItemActive = (selectedValue: string) => {
  return selectedFilters.value?.includes(selectedValue);
};

const facets: any = computed(() => [
  {
    id: null,
    label: "Price",
    type: "price",
    options: [
      { id: "pr1", label: "Under $250.00", values: "0-250" },
      { id: "pr2", label: "$250.00 - $500.00", values: "250-500" },
      { id: "pr3", label: "$500.00 - $750.00", values: "500-750" },
      { id: "pr4", label: "$750.00 - $1000.00", values: "750-1000" },
      { id: "pr5", label: "$1000.00- $1500.00", values: "1000-1500" },
    ],
  },
  ...props.attributes,
]);
const opened = ref<boolean[]>(facets.value.map(() => true));

const priceModel = ref<any>("");
const selectPrice = (values: any) => {
  const newValue: any = [values];
  const getIndex = selectedFilters.value.findIndex(
    (item: { filterName: string }) => item?.filterName === "price"
  );
  if (getIndex > -1) {
    selectedFilters.value[getIndex].id = newValue[0];
  } else {
    selectedFilters.value.push({
      filterName: "price",
      label: "Price",
      id: newValue[0],
    });
  }
};
const selectedFilter = (
  facet: { label: string },
  option: { id: string; value: string; label: string }
) => {
  const alreadySelectedIndex = selectedFilters.value.findIndex(
    (filter: { id: string }) => String(filter.id) === String(option.value)
  );
  if (alreadySelectedIndex === -1) {
    selectedFilters.value.push({
      filterName: facet?.label,
      label: option?.label,
      id: option?.value,
    });
    return;
  }
  selectedFilters.value.splice(alreadySelectedIndex, 1);
};
const applyFilters = () => {
  if (!priceModel.value) {
    selectedFilters.value = selectedFilters.value?.filter(
      (item: ProductFilterType) => {
        return item.filterName !== "price";
      }
    );
  }
  const filters = selectedFilters.value.filter((item: any) => {
    return typeof item === "object";
  });
  changeFilters(filters, sort.value);
  emit("close");
  facetsFromUrlToFilter();
};
const clearFilters = () => {
  selectedFilters.value = [];
  router.push({ query: {} });
  emit("close");
};

const changeCategory = (categoryId: number) => {
  clearFilters();
  router.push({ path: `/category/${categoryId}` });
};

onMounted(() => {
  selectedFilters.value = facetsFromUrlToFilter();
  const priceFilter = selectedFilters.value?.find((item: ProductFilterType) => {
    return item.filterName === "price";
  });
  if (priceFilter) {
    priceModel.value = priceFilter.id;
  }
});
</script>

<template>
  <aside class="w-full lg:max-w-[376px]">
    <template v-if="categories.length">
      <div
        class="py-2 px-4 mb-4 bg-neutral-100 typography-headline-6 font-bold text-neutral-900 uppercase tracking-widest md:rounded-md"
        data-testid="category-tree"
      >
        {{ $t("category") }}
      </div>

      <ul class="mt-4 mb-6 md:mt-2" data-testid="categories">
        <SfListItem
          v-for="(category, index) in categories"
          :key="category.name"
          size="lg"
          :class="[
            'md:sf-list-item-sm md:py-1.5 sf-list-item',
            {
              'bg-primary-100 hover:bg-primary-100 active:bg-primary-100 font-medium':
                category.id === route.query.id,
            },
          ]"
          data-testid="category-tree-item"
        >
          <span
            class="flex gap-2 items-center"
            @click="changeCategory(category.id)"
          >
            <span
              class="text-base md:text-sm capitalize flex items-center"
              data-testid="list-item-menu-label"
              :class="{
                'font-bold': category.slug === route.path,
              }"
            >
              <slot />
              {{ category.name }}
            </span>
          </span>
        </SfListItem>
      </ul>
    </template>
    <h5
      class="py-2 px-4 mb-6 bg-neutral-100 typography-headline-6 font-bold text-neutral-900 uppercase tracking-widest md:rounded-md"
    >
      Sort by
    </h5>
    <div class="px-2">
      <SfSelect
        v-model="sortBy.selected"
        placeholder="Select sorting"
        :aria-label="$t('sortBy')"
        @update:model-value="changeSorting"
      >
        <option
          v-for="{ id, value, attrName } in sortBy.options"
          :key="id"
          :selected="sortBy.selected === value"
          :value="value"
        >
          {{ attrName }}
        </option>
      </SfSelect>
    </div>
    <h5
      class="py-2 px-4 mt-6 mb-4 bg-neutral-100 typography-headline-6 font-bold text-neutral-900 uppercase tracking-widest md:rounded-md"
    >
      Filter
    </h5>
    <client-only>
      <ul>
        <li v-for="(facet, index) in facets" :key="index">
          <SfAccordionItem v-model="opened[index]">
            <template #summary>
              <div class="flex justify-between items-center p-2 mb-2">
                <p class="p-2 font-medium typography-headline-5">
                  {{ facet?.label }}
                </p>
                <SfIconChevronLeft
                  :class="opened[index] ? 'rotate-90' : '-rotate-90'"
                />
              </div>
            </template>
            <template v-if="facet.type == 'price'">
              <fieldset id="radio-price">
                <SfListItem
                  v-for="{ id, values, label } in facet.options"
                  :key="id"
                  tag="label"
                  size="sm"
                  class="px-1.5 bg-transparent hover:bg-transparent"
                >
                  <template #prefix>
                    <SfRadio
                      v-model="priceModel"
                      class="flex items-center"
                      name="radio-price"
                      :value="values"
                      @click="priceModel = priceModel === values ? '' : values"
                      @update:model-value="selectPrice(values)"
                    />
                  </template>
                  <p>
                    <span
                      :class="[
                        'text-sm mr-2',
                        { 'font-medium': priceModel === values },
                      ]"
                      >{{ label }}</span
                    >
                  </p>
                </SfListItem>
              </fieldset>
            </template>
            <ul
              v-if="facet.type === 'select'"
              class="grid grid-cols-5 gap-2 px-3"
            >
              <li v-for="{ id, value, label } in facet.options" :key="id">
                <SfChip
                  class="w-full"
                  size="sm"
                  :input-props="{ value }"
                  :model-value="isFilterSelected({ id, value })"
                  @update:model-value="
                    selectedFilter(facet, { id, value, label })
                  "
                >
                  {{ label }}
                </SfChip>
              </li>
            </ul>
            <ul
              v-if="facet.type === 'radio'"
              class="grid grid-cols-3 gap-2 px-3"
            >
              <li v-for="{ id, value, label } in facet.options" :key="id">
                <SfChip
                  class="w-full"
                  size="sm"
                  :input-props="{ value }"
                  :model-value="isFilterSelected({ id, value })"
                  @update:model-value="
                    selectedFilter(facet, { id, value, label })
                  "
                >
                  {{ label }}
                </SfChip>
              </li>
            </ul>
            <template v-if="facet.type == 'color'">
              <SfListItem
                v-for="{ id, value, label, htmlColor } in facet.options"
                :key="id"
                size="sm"
                tag="label"
                :class="[
                  'px-4 bg-transparent hover:bg-transparent',
                  {
                    'font-medium': isFilterSelected({ id, value }),
                  },
                ]"
                :selected="isFilterSelected({ id, value })"
              >
                <template #prefix>
                  <SfCheckbox
                    :value="label"
                    class="appearance-none peer hidden"
                    :model-value="isFilterSelected({ id, value })"
                    @update:model-value="
                      selectedFilter(facet, { id, value, label })
                    "
                  />
                  <span
                    class="inline-flex items-center justify-center p-1 transition duration-300 rounded-full cursor-pointer ring-1 ring-neutral-200 ring-inset outline-offset-2 outline-secondary-600 peer-checked:ring-2 peer-checked:ring-primary-700 peer-hover:bg-primary-100 peer-[&:not(:checked):hover]:ring-primary-200 peer-active:bg-primary-200 peer-active:ring-primary-300 peer-disabled:cursor-not-allowed peer-disabled:bg-disabled-100 peer-disabled:opacity-50 peer-disabled:ring-1 peer-disabled:ring-disabled-200 peer-disabled:hover:ring-disabled-200 peer-checked:hover:ring-primary-700 peer-checked:active:ring-primary-700 peer-focus-visible:outline"
                  >
                    <SfThumbnail
                      size="sm"
                      :style="{ backgroundColor: htmlColor }"
                    />
                  </span>
                </template>
                <p>
                  <span class="mr-2 typography-text-sm">{{ label }}</span>
                </p>
              </SfListItem>
            </template>
          </SfAccordionItem>
          <hr class="my-4" />
        </li>
      </ul>
    </client-only>
    <div
      class="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 lg:justify-between px-3 lg:px-0"
    >
      <SfButton variant="secondary" class="w-full mr-3" @click="clearFilters">
        {{ $t("clearFilters") }}
      </SfButton>
      <SfButton class="w-full" @click="applyFilters">{{
        $t("showProducts")
      }}</SfButton>
    </div>
  </aside>
</template>

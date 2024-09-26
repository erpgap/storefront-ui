<script setup lang="ts">
import { ref, onMounted } from "vue";
import { SfListItem, SfRadio, SfIconBlock } from "@storefront-ui/vue";

const { deliveryMethods, loadDeliveryMethods, setDeliveryMethod } =
  useDeliveryMethod();

const radioModel = ref("");

defineProps({
  shippingDate: {
    type: String,
    default: "tomorrow",
  },
});

await loadDeliveryMethods();

if (deliveryMethods?.value?.length === 1) {
  radioModel.value = String(deliveryMethods.value[0].id);
  await setDeliveryMethod(deliveryMethods.value[0].id);
}

const handleSelectShippingMethod = async (shippingMethodId: number) => {
  radioModel.value = String(shippingMethodId);
  await setDeliveryMethod(shippingMethodId);
};
</script>

<template>
  <div class="md:px-4 my-6" data-testid="shipping-method">
    <div class="flex justify-between items-center">
      <h3 class="text-neutral-900 text-lg font-bold">
        {{ $t("shippingMethod.heading") }}
      </h3>
    </div>

    <div class="mt-4">
      <ul
        v-if="deliveryMethods.length"
        class="grid gap-y-4 md:grid-cols-2 md:gap-x-4"
        role="radiogroup"
      >
        <SfListItem
          v-for="{ id, name } in deliveryMethods"
          :key="id"
          tag="label"
          class="border rounded-md items-start"
          @click="handleSelectShippingMethod(id)"
        >
          <div class="flex gap-2">
            <SfRadio v-model="radioModel" :value="String(id)" />
            <div>
              <p>{{ name }}</p>
              <p class="text-xs text-neutral-500">{{ shippingDate }}</p>
            </div>
          </div>
        </SfListItem>
      </ul>

      <div v-else class="flex mb-6">
        <SfIconBlock class="mr-2 text-neutral-500" />
        <p>{{ $t("shippingMethod.description") }}</p>
      </div>
    </div>
  </div>
</template>

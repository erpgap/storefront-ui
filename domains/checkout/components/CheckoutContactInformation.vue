<template>
  <form
    data-testid="contact-information-form"
    @submit.prevent="$emit('on-save', contactInfo)"
  >
    <label>
      <UiFormLabel>{{ $t("contactInfo.name") }}</UiFormLabel>
      <SfInput
        v-model="contactInfo.name"
        name="name"
        type="text"
        :placeholder="$t('contactInfo.name')"
        required
      />
    </label>
    <div class="mt-4"/>
    <label>
      <UiFormLabel>{{ $t("contactInfo.email") }}</UiFormLabel>
      <SfInput
        v-model="contactInfo.email"
        name="email"
        type="email"
        :placeholder="$t('contactInfo.email')"
        required
      />
    </label>
    <div class="mt-4 flex flex-col-reverse md:flex-row md:justify-end">
      <SfButton
        type="reset"
        class="md:mr-4"
        variant="secondary"
        @click="$emit('on-cancel')"
      >
        {{ $t("contactInfo.cancel") }}
      </SfButton>
      <SfButton type="submit" class="min-w-[120px] mb-4 md:mb-0">
        {{ $t("contactInfo.save") }}
      </SfButton>
    </div>
  </form>
</template>
<script lang="ts" setup>
import { SfButton, SfInput } from "@storefront-ui/vue";

type FormContactInformationProps = {
  name?: string;
  email?: string;
};

const props = defineProps<FormContactInformationProps>();
const { email, name } = toRefs(props);
defineEmits(["on-save", "on-cancel"]);
const contactInfo = ref({
  email: email?.value?.includes("newEmail") ? "" : email?.value ?? "",
  name: name?.value?.includes("newName") ? "" : name?.value ?? "",
});
</script>

<template>
  <form @submit.prevent="$emit('on-save', userData.fullName)" data-testid="account-forms-name">
    <div class="md:flex justify-between gap-4">
      <label class="block flex-1">
        <UiFormLabel>{{
          $t('account.accountSettings.personalData.yourName')
        }}</UiFormLabel>
        <SfInput
          name="fullname"
          type="text"
          v-model="userData.fullName"
          required
        />
      </label>
    </div>
    <div class="mt-6 flex flex-col-reverse md:flex-row md:justify-end gap-4">
      <SfButton type="reset" variant="secondary" @click="$emit('on-cancel')">
        {{ $t('contactInfo.cancel') }}
      </SfButton>
      <SfButton type="submit" class="min-w-[120px]">
        {{ $t('contactInfo.save') }}
      </SfButton>
    </div>
  </form>
</template>
<script lang="ts" setup>
import { SfButton, SfInput } from '@storefront-ui/vue';

type AccountFormsNameProps = {
  fullName?: string;
};

const props = defineProps<AccountFormsNameProps>();
const { fullName } = toRefs(props);
defineEmits(['on-save', 'on-cancel']);
const userData = ref({
  fullName: fullName?.value ?? '',
});
</script>

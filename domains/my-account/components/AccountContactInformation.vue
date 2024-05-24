<script lang="ts" setup>
import { SfButton, SfInput } from '@storefront-ui/vue';

type AccountFormsNameProps = {
  email?: string;
};

const props = defineProps<AccountFormsNameProps>();
const { email } = toRefs(props);
defineEmits(['on-save', 'on-cancel']);
const userData = ref({
  email: email?.value ?? '',
});
</script>
<template>
  <form
    data-testid="account-forms-name"
    @submit.prevent="$emit('on-save', userData.email)"
  >
    <div class="md:flex justify-between gap-4">
      <label class="block flex-1">
        <UiFormLabel>{{
          $t('account.accountSettings.personalData.contactInformation')
        }}</UiFormLabel>
        <SfInput v-model="userData.email" name="email" type="text" required />
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

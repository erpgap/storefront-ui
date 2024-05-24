<script lang="ts" setup>
import { SfButton, SfInput, SfSwitch } from '@storefront-ui/vue';

type AccountFormsNameProps = {
  fullName?: string;
  email?: string;
};

const props = defineProps<AccountFormsNameProps>();
const { email, fullName } = toRefs(props);
defineEmits(['on-save', 'on-cancel']);
const userData = ref({
  fullName: fullName?.value ?? '',
  email: email?.value ?? '',
  subscribeNewsletter: true,
});
</script>
<template>
  <form
    data-testid="account-forms-name"
    @submit.prevent="$emit('on-save', userData)"
  >
    <div class="md:flex flex-col justify-between gap-4">
      <label class="block flex-1">
        <UiFormLabel>{{
          $t('account.accountSettings.personalData.yourName')
        }}</UiFormLabel>
        <SfInput
          v-model="userData.fullName"
          name="fullname"
          type="text"
          required
        />
      </label>
      <label class="block flex-1">
        <UiFormLabel>{{
          $t('account.accountSettings.personalData.contactInformation')
        }}</UiFormLabel>
        <SfInput v-model="userData.email" name="email" type="text" required />
      </label>
      <label>
        <UiFormLabel>{{ $t('contactInfo.subescribe') }}</UiFormLabel>
        <SfSwitch v-model="userData.subscribeNewsletter" />
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

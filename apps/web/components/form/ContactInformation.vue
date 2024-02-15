<template>
  <form data-testid="contact-information-form" @submit.prevent="$emit('on-save', contactInfo)">
    <label>
      <FormLabel>{{ $t('contactInfo.name') }}</FormLabel>
      <SfInput name="name" type="text" v-model="contactInfo.name" required />
    </label>
    <br />
    <label>
      <FormLabel>{{ $t('contactInfo.email') }}</FormLabel>
      <SfInput name="email" type="email" v-model="contactInfo.email" required />
    </label>
    <div class="mt-4 flex flex-col-reverse md:flex-row md:justify-end">
      <SfButton type="reset" class="md:mr-4" variant="secondary" @click="$emit('on-cancel')">
        {{ $t('contactInfo.cancel') }}
      </SfButton>
      <SfButton type="submit" class="min-w-[120px] mb-4 md:mb-0">
        {{ $t('contactInfo.save') }}
      </SfButton>
    </div>
  </form>
</template>
<script lang="ts" setup>
import { SfButton, SfInput } from '@storefront-ui/vue';

type FormContactInformationProps = {
  name?: string;
  email?: string;
};

const props = defineProps<FormContactInformationProps>();
const { email, name } = toRefs(props);
defineEmits(['on-save', 'on-cancel']);
const contactInfo = ref({
  email: email?.value ?? '',
  name: name?.value ?? ''
});
</script>

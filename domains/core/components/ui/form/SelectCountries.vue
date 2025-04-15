<script setup lang="ts">
const { loadCountries, countries } = useCountryList()
await loadCountries()

const model = defineModel({ default: 0 })
</script>

<template>
  <label class="md:col-span-3">
    <UiFormLabel>{{ $t("form.countryLabel") }}</UiFormLabel>
    <UiFormCustomSfSelect v-model="model" name="country" autocomplete="country-name" required>
      <option key="placeholder" :value="null">
        {{ $t("form.selectPlaceholder") }}
      </option>
      <option v-for="country in countries?.countries" :key="country?.id" :value="country?.id">
        {{ country?.name }}
      </option>
    </UiFormCustomSfSelect>
  </label>
</template>

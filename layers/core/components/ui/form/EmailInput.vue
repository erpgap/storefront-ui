<script setup lang="ts">
const model = defineModel()

const emit = defineEmits(['is-field-valid'])

const showError = ref(false)

const clearError = () => {
  showError.value = false
}

const validateEmail = () => {
  const isValid = /^\S+@\S+\.\S+$/.test(String(model.value))
  showError.value = !isValid
  emit('is-field-valid', isValid)
}

watch(model, () => {
  validateEmail()
})
</script>

<template>
  <div class="relative w-full">
    <span
      class="flex items-center gap-2 px-4 bg-white rounded-md text-neutral-500 h-[48px] w-full"
    >
      <input
        v-bind="$attrs"
        v-model="model"
        type="text"
        placeholder="Enter your email here"
        class="w-full text-base outline-none appearance-none text-neutral-900 disabled:cursor-not-allowed disabled:bg-transparent read-only:bg-transparent"
        @input="clearError"
      >
    </span>
  </div>
</template>

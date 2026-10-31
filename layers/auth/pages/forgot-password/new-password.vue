<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'
import type { MutationChangePasswordArgs } from '~~/graphql'

const { changeForgottenPassword } = useAuth()
const route = useRoute()

defineEmits(['on-cancel'])

const repeatPassword = ref('')
const token = ref(route.query.token)

const changePasswordArgs = ref<MutationChangePasswordArgs>({
  newPassword: '',
  token: token as any,
})

const passwordsDoesntMatch = ref(false)

const handleSubmit = async () => {
  passwordsDoesntMatch.value = false

  if (changePasswordArgs.value.newPassword !== repeatPassword.value) {
    passwordsDoesntMatch.value = true
    return
  }

  await changeForgottenPassword({
    newPassword: changePasswordArgs.value.newPassword,
    token: changePasswordArgs.value.token,
  })
}
</script>

<template>
  <div class="p-8">
    <div class="mx-auto border border-primary-100 p-6 md:p-8 mt-8">
      <div class="w-full min-h-[330px] flex flex-col gap-4 items-center justify-center">
        <h1 class="text-3xl font-bold mb-4">
          {{ $t("auth.setNewPassword.pageHeading") }}
        </h1>
        <form
          method="post"
          data-testid="account-forms-password"
          @submit.prevent="handleSubmit"
        >
          <label class="block my-4">
            <UiFormLabel>{{
              $t("account.accountSettings.personalData.newPassword")
            }}</UiFormLabel>
            <UiFormPasswordInput
              v-model="changePasswordArgs.newPassword"
              name="password"
              :invalid="passwordsDoesntMatch"
              required
              @change="passwordsDoesntMatch = false"
            />
            <UiFormHelperText class="block">
              {{
                $t("account.accountSettings.personalData.passwordHelp")
              }}</UiFormHelperText>
          </label>
          <label class="block">
            <UiFormLabel>{{
              $t("account.accountSettings.personalData.newPasswordAgain")
            }}</UiFormLabel>
            <UiFormPasswordInput
              v-model="repeatPassword"
              name="password"
              :invalid="passwordsDoesntMatch"
              required
              @change="passwordsDoesntMatch = false"
            />
          </label>
          <UiFormMessage
            v-if="passwordsDoesntMatch"
            class="mt-3"
          >
            {{ $t("account.accountSettings.personalData.passwordsDontMatch") }}
          </UiFormMessage>
          <div class="mt-6 flex flex-col-reverse md:flex-row md:justify-end gap-4">
            <SfButton
              type="reset"
              variant="secondary"
              @click="$emit('on-cancel')"
            >
              {{ $t("contactInfo.cancel") }}
            </SfButton>
            <SfButton
              type="submit"
              class="min-w-[120px]"
            >
              {{ $t("account.accountSettings.personalData.changePassword") }}
            </SfButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style></style>

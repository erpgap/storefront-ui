<script lang="ts" setup>
import { SfButton, SfInput, SfIconVisibility } from "@storefront-ui/vue";
import { useToast } from "vue-toastification";
import type { MutationChangePasswordArgs } from "~/graphql";

const { changeForgottenPassword } = useAuth();
const route = useRoute();
const toast = useToast();

const firstNewPasswordVisible = ref(false);
const secondNewPasswordVisible = ref(false);

const repeatPassword = ref("");
const token = ref(route.query.token);

const changePasswordArgs = ref<MutationChangePasswordArgs>({
  newPassword: "",
  token: token as any,
});

const passwordsDoesntMatch = ref(false);

const handleSubmit = async () => {
  passwordsDoesntMatch.value = false;

  if (changePasswordArgs.value.newPassword !== repeatPassword.value) {
    passwordsDoesntMatch.value = true;
    toast.error("Passwords doesnt match");
    return;
  }

  await changeForgottenPassword({
    newPassword: changePasswordArgs.value.newPassword,
    token: changePasswordArgs.value.token,
  });
};
</script>

<template>
  <div class="p-8">
    <div class="mx-auto rounded-md p-4 md:p-6 mt-8">
      <div
        class="w-full min-h-[330px] flex flex-col gap-4 items-center justify-center"
      >
        <h1 class="text-3xl font-bold mb-4">Change your password</h1>
        <template>
          <form
            data-testid="account-forms-password"
            @submit.prevent="handleSubmit"
          >
            <label class="block my-4">
              <UiFormLabel>{{
                $t("account.accountSettings.personalData.newPassword")
              }}</UiFormLabel>
              <SfInput
                v-model="changePasswordArgs.newPassword"
                name="password"
                :type="firstNewPasswordVisible ? 'text' : 'password'"
                :class="{ 'text-red-600': passwordsDoesntMatch }"
                @change="passwordsDoesntMatch = false"
                required
              >
                <template #suffix>
                  <button
                    type="button"
                    @click="firstNewPasswordVisible = !firstNewPasswordVisible"
                  >
                    <SfIconVisibility />
                  </button>
                </template>
              </SfInput>
              <UiFormHelperText class="block">
                {{
                  $t("account.accountSettings.personalData.passwordHelp")
                }}</UiFormHelperText
              >
            </label>
            <label class="block">
              <UiFormLabel>{{
                $t("account.accountSettings.personalData.newPasswordAgain")
              }}</UiFormLabel>
              <SfInput
                v-model="repeatPassword"
                name="password"
                :type="secondNewPasswordVisible ? 'text' : 'password'"
                :class="{ 'text-red-600': passwordsDoesntMatch }"
                @change="passwordsDoesntMatch = false"
                required
              >
                <template #suffix>
                  <button
                    type="button"
                    @click="
                      secondNewPasswordVisible = !secondNewPasswordVisible
                    "
                  >
                    <SfIconVisibility />
                  </button>
                </template>
              </SfInput>
            </label>
            <div
              class="mt-6 flex flex-col-reverse md:flex-row md:justify-end gap-4"
            >
              <SfButton
                type="reset"
                variant="secondary"
                @click="$emit('on-cancel')"
              >
                {{ $t("contactInfo.cancel") }}
              </SfButton>
              <SfButton type="submit" class="min-w-[120px]">
                {{ $t("account.accountSettings.personalData.changePassword") }}
              </SfButton>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<style></style>

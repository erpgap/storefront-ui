<script setup lang="ts">
import {
  SfButton,
  SfInput,
  SfCheckbox,
  SfLink,
  SfModal,
  useDisclosure,
} from '@storefront-ui/vue'

definePageMeta({
  layout: false,
})

const firstNameModel = ref('')
const lastNameModel = ref('')
const emailModel = ref('')
const passwordModel = ref('')
const termsAndConditionsModel = ref<boolean>()
const subscriptionsModel = ref<boolean>()

const NuxtLink = resolveComponent('NuxtLink')
const { isOpen, open } = useDisclosure()
const { signup, loading } = useAuth()
const router = useRouter()

const fullName = computed(
  () => `${firstNameModel.value} ${lastNameModel.value}`,
)

const handleSignup = async () => {
  await signup({
    email: emailModel.value,
    name: fullName.value,
    password: passwordModel.value,
    subscribeNewsletter: subscriptionsModel.value === true,
  })
}
</script>

<template>
  <NuxtLayout
    name="auth"
    :heading="$t('auth.signup.heading')"
  >
    <UiAlert
      class="w-full p-4 md:p-6 mb-6 !justify-start typography-text-base"
      variant="neutral"
    >
      <i18n-t keypath="auth.signup.bannerText">
        <template #login>
          <SfLink
            :tag="NuxtLink"
            to="/login"
            class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
            data-testid="signup-page-login-button"
          >
            {{ $t("auth.login.heading") }}
          </SfLink>
        </template>
      </i18n-t>
    </UiAlert>

    <form
      data-testid="signup-form"
      class="flex flex-col md:border md:border-neutral-200 rounded-md gap-4 md:p-6"
      @submit.prevent="handleSignup"
    >
      <label>
        <UiFormLabel>{{ $t("form.firstNameLabel") }} *</UiFormLabel>
        <SfInput
          v-model="firstNameModel"
          name="firstName"
          autocomplete="given-name"
          required
        />
      </label>
      <label>
        <UiFormLabel>{{ $t("form.lastNameLabel") }} *</UiFormLabel>
        <SfInput
          v-model="lastNameModel"
          name="lastName"
          autocomplete="family-name"
          required
        />
      </label>
      <label>
        <UiFormLabel>{{ $t("form.emailLabel") }} *</UiFormLabel>
        <SfInput
          v-model="emailModel"
          name="email"
          type="email"
          autocomplete="email"
          required
        />
      </label>
      <div>
        <label>
          <UiFormLabel>{{ $t("form.passwordLabel") }} *</UiFormLabel>
          <UiFormPasswordInput
            v-model="passwordModel"
            name="password"
            autocomplete="current-password"
            required
          />
          <UiFormHelperText class="mb-2">{{
            $t("form.passwordHint")
          }}</UiFormHelperText>
        </label>
      </div>

      <div class="flex items-center">
        <SfCheckbox
          id="terms"
          v-model="termsAndConditionsModel"
          value="value"
          class="peer"
          required
        />
        <label
          class="ml-3 text-base text-neutral-900 cursor-pointer font-body peer-disabled:text-disabled-900"
          for="terms"
        >
          *
          <i18n-t keypath="form.termsAndConditionsLabel">
            <template #terms>
              <SfLink
                href="#"
                class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
              >
                {{ $t("termsAndConditions") }}
              </SfLink>
            </template>
          </i18n-t>
        </label>
      </div>

      <div class="flex mb-2">
        <SfCheckbox
          id="subscription"
          v-model="subscriptionsModel"
          value="value"
          class="peer mt-0.5"
        />
        <label
          class="ml-3 text-base text-neutral-900 cursor-pointer font-body peer-disabled:text-disabled-900"
          for="subscription"
        >
          {{ $t("form.subscriptionLabel") }}
        </label>
      </div>

      <p class="text-sm text-neutral-500 mt-0.5 mb-2">
        {{ $t("form.asterixHint") }}
      </p>

      <SfButton
        type="submit"
        size="lg"
        class="w-full"
      >
        {{ $t("auth.signup.createButton") }}
      </SfButton>
    </form>

    <UiModal
      v-model="isOpen"
      class="max-w-[480px] inset-x-4 md:inset-x-0"
      tag="section"
      role="alertdialog"
      disable-click-away
      aria-labelledby="signUpModalTitle"
      aria-describedby="signUpModalDesc"
    >
      <header class="flex items-center flex-col">
        <NuxtImg
          src="/images/signup-success.svg"
          :alt="$t('auth.signup.modal.imageAlt')"
          width="192"
          height="192"
          class="my-6"
        />
        <h2
          id="signUpModalTitle"
          class="mt-6 mb-4 font-bold typography-headline-3"
        >
          {{ $t("auth.signup.modal.heading") }}
        </h2>
      </header>
      <UiAlert
        class="w-full p-4 mb-6 !justify-start typography-text-base"
        variant="neutral"
      >
        <i18n-t
          id="signUpModalDesc"
          keypath="auth.signup.modal.description"
          tag="p"
        >
          <template #information>
            <SfLink
              :tag="NuxtLink"
              to="/my-account"
              class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
            >
              {{ $t("auth.signup.modal.information") }}
            </SfLink>
          </template>
        </i18n-t>
      </UiAlert>

      <footer class="flex justify-end">
        <SfButton
          :tag="NuxtLink"
          to="/"
          class="w-full"
        >
          {{ $t("auth.signup.modal.button") }}
        </SfButton>
      </footer>
    </UiModal>
  </NuxtLayout>
</template>

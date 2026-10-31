import { useToast } from 'vue-toastification'
import type {
  ChangePasswordResponse,
  MutationChangePasswordArgs,
  MutationCreateUpdatePartnerArgs,
  MutationLoginArgs,
  MutationRegisterArgs,
  MutationResetPasswordArgs,
  MutationUpdatePasswordArgs,
  Partner,
  PartnerResponse,
  ResetPasswordResponse,
  SignInUserResponse,
  SignUpUserResponse,
  UpdatePasswordResponse,
} from '~~/graphql'
import { DEFAULT_AFTER_LOGIN, loginRoute } from '~~/app/utils/authRedirect'
import { MutationName } from '~~/server/mutations'
import { QueryName } from '~~/server/queries'

const isBadResetToken = (message: string) =>
  /token|base64|padding|codec/i.test(message)

export const useAuth = () => {
  const { $sdk } = useNuxtApp()
  const router = useRouter()
  const userCookie = useCookie<any | null>('odoo-user', {
    maxAge: 3600 * 30,
    sameSite: 'lax',
    secure: !import.meta.dev,
  })
  const user = useState<Partner>('user', () => ({}) as Partner)

  const toast = useToast()
  // Taken here, while the composable runs in the component's setup: the
  // functions below run later, when Nuxt's context may be gone (during SSR
  // that threw NUXT_E1001 and lost the request's cookies).
  const requestFetch = useRequestFetch()
  const { t } = useNuxtApp().$i18n

  const loading = ref(false)
  const authError = useState<string>('auth-error', () => '')

  const clearUser = () => {
    userCookie.value = null
    user.value = {} as Partner
  }

  const isRejectedByOdoo = (error: any) =>
    Array.isArray(error?.data?.data) && error.data.data.length > 0

  const loadUser = async (withoutCache: boolean = false): Promise<boolean> => {
    // Without the cookie the storefront does not count the visitor as logged
    // in (see server/utils/loginSession.ts), and for a guest Odoo answers
    // "User does not exist" as an error: a failed request on every guest
    // checkout.
    if (!userCookie.value) {
      clearUser()
      return false
    }

    loading.value = true

    const query = withoutCache ? $sdk().odoo.queryNoCache : $sdk().odoo.query

    try {
      const data = await query<null, { partner: Partner }>({
        queryName: QueryName.LoadUserQuery,
      })
      const partner = data?.partner

      if (!partner?.id || partner.isPublic) {
        clearUser()
        return false
      }

      userCookie.value = partner.id
      user.value = partner
      return true
    }
    catch (error: any) {
      if (isRejectedByOdoo(error)) {
        clearUser()
        return false
      }
      return Boolean(userCookie.value || user.value?.id)
    }
    finally {
      loading.value = false
    }
  }

  const hasValidSession = async (): Promise<boolean> => {
    try {
      const { valid } = await requestFetch<{ valid: boolean }>('/api/auth/session')
      return valid
    }
    catch {
      return true
    }
  }

  // For a request that failed on a protected page: if the reason is a dead
  // session (cookie deleted, expired or tampered with), send the user to log
  // in again and return true so the caller skips its own error message.
  const redirectIfSessionExpired = async (): Promise<boolean> => {
    if (await loadUser(true)) {
      return false
    }
    await navigateTo(loginRoute(router.currentRoute.value.fullPath, true))
    return true
  }

  const updatePartner = async (params: MutationCreateUpdatePartnerArgs) => {
    loading.value = true
    try {
      const data = await $sdk().odoo.mutation<
        MutationCreateUpdatePartnerArgs,
        { createUpdatePartner: Partner }
      >({ mutationName: MutationName.CreateUpdatePartner }, params)

      // Checkout saves a guest's contact through here too, which does not log
      // them in: storing it as the user made isAuthenticated true for them.
      if (userCookie.value) user.value = data?.createUpdatePartner
    }
    finally {
      loading.value = false
    }
  }

  const logout = async () => {
    userCookie.value = null
    user.value = {} as Partner
    await $sdk().odoo.mutation<null, null>({
      mutationName: MutationName.LogoutMutation,
    })
  }

  const signup = async (params: MutationRegisterArgs) => {
    try {
      loading.value = true
      authError.value = ''
      await $sdk().odoo.mutation<MutationRegisterArgs, SignUpUserResponse>(
        {
          mutationName: MutationName.RegisterUserMutation,
        },
        { ...params },
      )
      // login() goes to the account page itself. When it fails the account
      // exists all the same, so say so here: the shopper stays on this page
      // and signing up again would only answer that the email is taken.
      if (!await login({ email: params.email, password: params.password })) {
        authError.value = t('auth.signup.createdButNotSignedIn')
      }
    }
    catch (error: any) {
      authError.value = errorMessage(error, t('auth.signup.error'))
      return
    }
    finally {
      loading.value = false
    }
  }

  // Resolves to whether the shopper is now logged in.
  const login = async (params: MutationLoginArgs, redirectTo: string = DEFAULT_AFTER_LOGIN): Promise<boolean> => {
    try {
      loading.value = true
      authError.value = ''
      const data = await $sdk().odoo.mutation<
        MutationLoginArgs,
        SignInUserResponse
      >({ mutationName: MutationName.LoginMutation }, { ...params })

      userCookie.value = data?.login?.user?.partner?.id ?? null
      user.value = data?.login?.user?.partner as Partner
      router.push(redirectTo)
      return true
    }
    catch (error: any) {
      authError.value = errorMessage(error, t('auth.login.error'))
      return false
    }
    finally {
      loading.value = false
    }
  }

  // Throws when Odoo refuses: the reset page retries some failures and words
  // the message itself. Catching here made every failure look like success.
  const resetPassword = async (params: MutationResetPasswordArgs) => {
    try {
      loading.value = true
      await $sdk().odoo.mutation<
        MutationResetPasswordArgs,
        ResetPasswordResponse
      >({ mutationName: MutationName.SendResetPasswordMutation }, { ...params })

      router.push('/reset-password-success')
    }
    finally {
      loading.value = false
    }
  }

  const updatePassword = async (params: MutationUpdatePasswordArgs) => {
    // Let the caller handle success/error UI (the account page shows inline
    // messages instead of toasts), so just surface errors by re-throwing.
    loading.value = true
    try {
      await $sdk().odoo.mutation<
        MutationUpdatePasswordArgs,
        UpdatePasswordResponse
      >({ mutationName: MutationName.UpdatePasswordMutation }, params)
    }
    finally {
      loading.value = false
    }
  }

  const changeForgottenPassword = async (
    params: MutationChangePasswordArgs,
  ) => {
    try {
      loading.value = true
      await $sdk().odoo.mutation<
        MutationChangePasswordArgs,
        ChangePasswordResponse
      >({ mutationName: MutationName.ChangePasswordMutation }, params)

      toast.success(t('auth.toast.passwordChanged'))
      router.push('/')
    }
    catch (error: any) {
      const message = errorMessage(error, t('auth.setNewPassword.error'))
      // A used, expired or mangled link fails on its token, and Odoo words
      // that for developers ("Unknown token version", a base64 error) or
      // repeats the token back. Other refusals, such as a password too short
      // for the policy, are already readable.
      toast.error(isBadResetToken(message) ? t('auth.setNewPassword.linkInvalid') : message)
    }
    finally {
      loading.value = false
    }
  }

  const isAuthenticated = computed(() => {
    return user?.value?.id || Boolean(userCookie.value)
  })

  return {
    signup,
    logout,
    isAuthenticated,
    login,
    resetPassword,
    changeForgottenPassword,
    user,
    loading,
    authError,
    updatePassword,
    loadUser,
    clearUser,
    hasValidSession,
    redirectIfSessionExpired,
    updatePartner,
  }
}

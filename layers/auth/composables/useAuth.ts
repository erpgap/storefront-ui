import { useToast } from 'vue-toastification'
import type {
  ChangePasswordResponse,
  CreateUpdatePartnerResponse,
  LoadUserQueryResponse,
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
} from '~/graphql'
import { MutationName } from '~/server/mutations'
import { QueryName } from '~/server/queries'

export const useAuth = () => {
  const { $sdk } = useNuxtApp()
  const router = useRouter()
  const userCookie = useCookie<any | null>('odoo-user', { maxAge: 3600 * 30 })
  const user = useState<Partner>('user', () => ({}) as Partner)

  const toast = useToast()

  const loading = ref(false)
  const resetEmail = useCookie<string>('reset-email')

  const loadUser = async (withoutCache: boolean = false) => {
    loading.value = true

    const query = withoutCache ? $sdk().odoo.queryNoCache : $sdk().odoo.query

    const data = await query<null, LoadUserQueryResponse>({
      queryName: QueryName.LoadUserQuery,
    })

    userCookie.value = data?.partner?.id
    user.value = data?.partner

    loading.value = false
  }

  const updatePartner = async (params: MutationCreateUpdatePartnerArgs) => {
    loading.value = true

    const data = await $sdk().odoo.mutation<
      MutationCreateUpdatePartnerArgs,
      CreateUpdatePartnerResponse
    >({ mutationName: MutationName.CreateUpdatePartner }, params)

    console.log(data)
    user.value = data?.createUpdatePartner

    if (userCookie.value?.id) {
      userCookie.value = data?.createUpdatePartner?.id
    }

    toast.success('Partner updated successfully')
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
      const data = await $sdk().odoo.mutation<MutationRegisterArgs, SignUpUserResponse>(
        {
          mutationName: MutationName.RegisterUserMutation,
        },
        { ...params },
      )
      user.value = data?.register?.partner
      await login({ email: params.email, password: params.password })
      router.push('/my-account/personal-data')
    }
    catch (error: any) {
      toast.error(error?.data?.message)
      return
    }
    finally {
      loading.value = false
    }
  }

  const login = async (params: MutationLoginArgs) => {
    try {
      loading.value = true
      const data = await $sdk().odoo.mutation<
        MutationLoginArgs,
        SignInUserResponse
      >({ mutationName: MutationName.LoginMutation }, { ...params })

      userCookie.value = data?.login?.user?.partner
      user.value = data?.login?.user?.partner as Partner
      router.push('/my-account/personal-data')
    }
    finally {
      loading.value = false
    }
  }

  const resetPassword = async (params: MutationResetPasswordArgs) => {
    try {
      loading.value = true
      const data = await $sdk().odoo.mutation<
        MutationResetPasswordArgs,
        ResetPasswordResponse
      >({ mutationName: MutationName.SendResetPasswordMutation }, { ...params })

      router.push('/reset-password-success')
      resetEmail.value = params.email
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  const successResetEmail = () => {
    const result = resetEmail.value
    resetEmail.value = ''

    return result
  }

  const updatePassword = async (params: MutationUpdatePasswordArgs) => {
    try {
      loading.value = true
      const data = await $sdk().odoo.mutation<
        MutationUpdatePasswordArgs,
        UpdatePasswordResponse
      >({ mutationName: MutationName.UpdatePasswordMutation }, params)

      toast.success('Password updated successfully')
    }
    catch (error: any) {
      toast.error(error?.data?.message)
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
      const data = await $sdk().odoo.mutation<
        MutationChangePasswordArgs,
        ChangePasswordResponse
      >({ mutationName: MutationName.ChangePasswordMutation }, params)

      toast.success('Password changed successfully')
      router.push('/')
    }
    catch (error: any) {
      toast.error(error?.data?.message)
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
    successResetEmail,
    updatePassword,
    loadUser,
    updatePartner,
  }
}

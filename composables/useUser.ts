import { useToast } from "vue-toastification";
import {
  LoadUserQueryResponse,
  LoginUserResponse,
  MutationLoginArgs,
  MutationRegisterArgs,
  MutationResetPasswordArgs,
  MutationUpdateMyAccountArgs,
  MutationUpdatePasswordArgs,
  Partner,
  RegisterUserResponse,
  ResetPasswordResponse,
  UpdateMyAccountResponse,
  UpdatePasswordResponse,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";

export const useUser = () => {
  const { $sdk } = useNuxtApp();
  const router = useRouter();
  const userCookie = useCookie<Partner | null>("odoo-user");
  const user = useState<Partner>("user", () => ({} as Partner));

  const toast = useToast();

  const loading = ref(false);
  const resetEmail = useCookie<string>("reset-email");

  const loadUser = async () => {
    loading.value = true;

    const { data } = await $sdk().odoo.query<null, LoadUserQueryResponse>({
      queryName: QueryName.LoadUserQuery,
    });

    userCookie.value = data.value.partner;
    user.value = data.value.partner;

    loading.value = false;
  };

  const logout = async () => {
    userCookie.value = null;
    user.value = {} as Partner;
    await $sdk().odoo.mutation<null, null>({
      mutationName: MutationName.LogoutMutation,
    });
  };

  const signup = async (params: MutationRegisterArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<
      MutationRegisterArgs,
      RegisterUserResponse
    >(
      {
        mutationName: MutationName.RegisterUserMutation,
      },
      { ...params }
    );
    loading.value = false;

    if (error.value) {
      toast.error(error.value?.data?.message);
      return;
    }

    user.value = data.value.partner;
  };

  const login = async (params: MutationLoginArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<
      MutationLoginArgs,
      LoginUserResponse
    >({ mutationName: MutationName.LoginMutation }, { ...params });
    if (error.value) {
      toast.error(error.value?.data?.message);
      return;
    }

    userCookie.value = data.value.login.partner;
    user.value = data.value.login.partner;
    router.push("/my-account");
  };

  const resetPassword = async (params: MutationResetPasswordArgs) => {
    loading.value = true;
    const { error } = await $sdk().odoo.mutation<
      MutationResetPasswordArgs,
      ResetPasswordResponse
    >({ mutationName: MutationName.SendResetPasswordMutation }, { ...params });
    if (error.value) {
      toast.error(error.value?.data?.message);
      return;
    }

    resetEmail.value = params.email;
  };

  const successResetEmail = () => {
    const result = resetEmail.value;
    resetEmail.value = "";

    return result;
  };

  const updateAccount = async (params: MutationUpdateMyAccountArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<
      MutationUpdateMyAccountArgs,
      UpdateMyAccountResponse
    >({ mutationName: MutationName.UpdateMyAccountMutation }, { ...params });
    if (error.value) {
      toast.error(error.value?.data?.message);
      return;
    }

    user.value = data.value.updateMyAccount;
  };

  const updatePassword = async (params: MutationUpdatePasswordArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<
      MutationUpdatePasswordArgs,
      UpdatePasswordResponse
    >({ mutationName: MutationName.UpdatePasswordMutation }, params);
    if (error.value) {
      toast.error(error.value?.data?.message);
      return;
    }

    toast.success("Password updated successfully");
  };

  const isAuthenticated = computed(() => {
    return !!userCookie.value?.id;
  });

  return {
    signup,
    logout,
    isAuthenticated,
    login,
    loadUser,
    resetPassword,
    user,
    loading,
    successResetEmail,
    updateAccount,
    updatePassword,
  };
};

import { LoadUserQueryResponse, MutationLoginArgs, MutationRegisterArgs, MutationResetPasswordArgs, MutationUpdateMyAccountArgs, MutationUpdatePasswordArgs, Partner, PartnerResponse, RegisterUserResponse, ResetPasswordResponse, UpdateMyAccountParams } from '~/graphql';
import { MutationName } from '~/server/mutations';
import { QueryName } from '~/server/queries';

export const useUser = () => {
  const { $sdk } = useNuxtApp();
  const user = useCookie<Partner | null>('odoo-user');

  const loading = ref(false);
  const loginError = ref(false);
  const signupError = ref(false);
  const updateAccountError = ref(false);
  const updatePasswordError = ref(false);
  const resetPasswordError = ref(false);
  const resetEmail = useCookie<string>('reset-email');

  const loadUser = async () => {
    loading.value = true;

    if (!user.value) {
      const { data } = await $sdk().odoo.query<null, LoadUserQueryResponse>({queryName: QueryName.LoadUserQuery});
      user.value = data.value.partner;
    }

    loading.value = false;

  };

  const logout = async () => {
    user.value = null;
    await $sdk().odoo.mutation<null, null>({mutationName: MutationName.LogoutMutation});
  };

  const signup = async (params: MutationRegisterArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<MutationRegisterArgs, RegisterUserResponse>({
      mutationName: MutationName.RegisterUserMutation
    }, {...params});
    loading.value = false;

    if (error.value) {
      signupError.value = true;
      return;
    }

    user.value = data.value.partner;
  };

  const login = async (params: MutationLoginArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<MutationLoginArgs, LoadUserQueryResponse>(
      {mutationName: MutationName.LoginMutation}, {...params}
    );
    if (error.value) {
      loginError.value = true;
      return;
    }

    user.value = data.value.partner;
  };

  const resetPassword = async (params: MutationResetPasswordArgs) => {
    loading.value = true;
    const { error } = await $sdk().odoo.mutation<MutationResetPasswordArgs, ResetPasswordResponse>(
      {mutationName: MutationName.SendResetPasswordMutation}, {...params}
    );
    if (error.value) {
      resetPasswordError.value = true;
      return;
    }

    resetEmail.value = params.email;
  };

  const successResetEmail = () => {
    const result = resetEmail.value;
    resetEmail.value = '';

    return result;
  };

  const updateAccount = async (params: MutationUpdateMyAccountArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<MutationUpdateMyAccountArgs, PartnerResponse>(
      {mutationName: MutationName.UpdateMyAccountMutation}, {...params}
    );
    if (error.value) {
      updateAccountError.value = true;
      return;
    }

    user.value = data.value.updateMyAccount;

  };

  const updatePassword = async (params: MutationUpdatePasswordArgs) => {
    if (updatePasswordError.value) {
      updatePasswordError.value = false;
    }
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<MutationUpdatePasswordArgs, LoadUserQueryResponse>(
      {mutationName: MutationName.UpdatePasswordMutation}, {...params}
    );
    if (error.value) {
      updatePasswordError.value = true;
      return;
    }

    user.value = data.value.updatePassword.partner;
  };

  return {
    signup,
    logout,
    login,
    loadUser,
    resetPassword,
    user,
    loading,
    loginError,
    signupError,
    resetPasswordError,
    updateAccountError,
    updatePasswordError,
    successResetEmail,
    updateAccount,
    updatePassword,

  };
};

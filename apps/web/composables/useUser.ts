import { LoadUserQueryResponse, MutationChangePasswordArgs, MutationLoginArgs, MutationRegisterArgs, Partner, RegisterUserResponse } from '~/graphql';
import { MutationName } from '~/server/mutations';
import { QueryName } from '~/server/queries';

export const useUser = () => {
  const { $sdk } = useNuxtApp();
  const user = useCookie<Partner | null>('odoo-user');

  const loading = ref(false);

  const loadUser = async () => {
    loading.value = true;
    loading.value = false;
    if (!user.value) {
      const { data } = await $sdk().odoo.query<null, LoadUserQueryResponse>({queryName: QueryName.LoadUserQuery});
      user.value = data.value.partner;
    }

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
      console.log(error);
    }

    user.value = data.value.partner;
  };

  const login = async (params: MutationLoginArgs) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<MutationLoginArgs, LoadUserQueryResponse>(
      {mutationName: MutationName.LoginMutation}, {...params}
    );
    if (error.value) {
      console.log(error);
    }

    user.value = data.value.partner;
  };

  const changePassword = async (params: MutationChangePasswordArgs) => {
    console.log('Mocked: changePasswod');
  };

  return {
    signup,
    logout,
    login,
    loadUser,
    changePassword,
    user,
  };
};

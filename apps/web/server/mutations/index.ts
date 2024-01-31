import { DocumentNode } from '@apollo/client';
import LoginMutation from './LoginMutation';
import LogoutMutation from './LogoutMutation';
import CreateNewAccountMutation from './CreateNewAccountMutation';
import SendResetPasswordMutation from './SendResetPasswordMutation';
import UpdatePasswordMutation from './UpdatePasswordMutation';
import ChangePasswordMutation from './ChangePasswordMutation';
import CartAddItem from './CartAddItem';
import CartUpdateQuantity from './CartUpdateQuantity';
import CartRemoveItem from './CartRemoveItem';
import RegisterUserMutation from './RegisterUserMutation';
import UpdateMyAccountMutation from './UpdateMyAccountMutation';
import DeleteAddressMutation from './DeleteAddressMutation';
import UpdateAddressMutation from './UpdateAddressMutation';
import CreateNewAddressMutation from './CreateNewAddressMutation';
import SelectAddressMutation from './SelectAddressMutation';

enum MutationName {
    LoginMutation = 'LoginMutation',
    LogoutMutation = 'LogoutMutation',
    CreateNewAccountMutation = 'CreateNewAccountMutation',
    SendResetPasswordMutation = 'SendResetPasswordMutation',
    UpdatePasswordMutation = 'UpdatePasswordMutation',
    ChangePasswordMutation = 'ChangePasswordMutation',
    CartAddItem = 'CartAddItem',
    CartUpdateQuantity = 'CartUpdateQuantity',
    CartRemoveItem = 'CartRemoveItem',
    RegisterUserMutation = 'RegisterUserMutation',
    UpdateMyAccountMutation = 'UpdateMyAccountMutation',
    DeleteAddressMutation = 'DeleteAddressMutation',
    UpdateAddressMutation = 'UpdateAddressMutation',
    CreateNewAddressMutation = 'CreateNewAddressMutation',
    SelectAddressMutation = 'SelectAddressMutation'
  }

const Mutations : Record<MutationName, DocumentNode> = {
  LoginMutation,
  LogoutMutation,
  CreateNewAccountMutation,
  SendResetPasswordMutation,
  UpdatePasswordMutation,
  ChangePasswordMutation,
  CartAddItem,
  CartUpdateQuantity,
  CartRemoveItem,
  RegisterUserMutation,
  UpdateMyAccountMutation,
  DeleteAddressMutation,
  UpdateAddressMutation,
  CreateNewAddressMutation,
  SelectAddressMutation
};

export {
  Mutations,
  MutationName
};

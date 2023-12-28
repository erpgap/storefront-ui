import { DocumentNode } from '@apollo/client';
import LoginMutation from './LoginMutation';
import LogoutMutation from './LogoutMutation';
import CreateNewAccountMutation from './CreateNewAccountMutation';
import SendResetPasswordMutation from './SendResetPasswordMutation';
import UpdatePasswordMutation from './UpdatePasswordMutation';
import ChangePasswordMutation from './ChangePasswordMutation';
import CartAddItem from './CartAddItem';

enum MutationName {
    LoginMutation = 'LoginMutation',
    LogoutMutation = 'LogoutMutation',
    CreateNewAccountMutation = 'CreateNewAccountMutation',
    SendResetPasswordMutation = 'SendResetPasswordMutation',
    UpdatePasswordMutation = 'UpdatePasswordMutation',
    ChangePasswordMutation = 'ChangePasswordMutation',
    CartAddItem = 'CartAddItem'
  }

const Mutations : Record<MutationName, DocumentNode> = {
  LoginMutation,
  LogoutMutation,
  CreateNewAccountMutation,
  SendResetPasswordMutation,
  UpdatePasswordMutation,
  ChangePasswordMutation,
  CartAddItem
};

export {
  Mutations,
  MutationName
};

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
import WishlistAddItem from './WishlistAddItem';
import WishlistRemoveItem from './WishlistRemoveItem';
import AddAddress from './AddAddress';
import UpdateAddress from './UpdateAddress';
import CreateUpdatePartner from './CreateUpdatePartner';

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
  WishlistAddItem = 'WishlistAddItem',
  WishlistRemoveItem = 'WishlistRemoveItem',
  AddAddress = 'AddAddress',
  UpdateAddress = 'UpdateAddress',
  CreateUpdatePartner = 'CreateUpdatePartner',
}

const Mutations: Record<MutationName, DocumentNode> = {
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
  WishlistAddItem,
  WishlistRemoveItem,
  AddAddress,
  UpdateAddress,
  CreateUpdatePartner,
};

export { Mutations, MutationName };

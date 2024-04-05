import AddAddress from "./AddAddress";
import AdyenAcquierInfo from "./AdyenAcquirerInfo";
import AdyenPaymentDetails from "./AdyenPaymentDetails";
import AdyenPaymentMethods from "./AdyenPaymentMethods";
import AdyenPayments from "./AdyenPayments";
import AdyenTransaction from "./AdyenTransaction";
import StripeTransaction from "./StripeTransaction";
import StripeInlineform from "./StripeInlineform";
import CartAddItem from "./CartAddItem";
import CartRemoveItem from "./CartRemoveItem";
import CartUpdateQuantity from "./CartUpdateQuantity";
import ChangePasswordMutation from "./ChangePasswordMutation";
import CreateNewAccountMutation from "./CreateNewAccountMutation";
import CreateUpdatePartner from "./CreateUpdatePartner";
import LoginMutation from "./LoginMutation";
import LogoutMutation from "./LogoutMutation";
import RegisterUserMutation from "./RegisterUserMutation";
import SendResetPasswordMutation from "./SendResetPasswordMutation";
import UpdateAddress from "./UpdateAddress";
import UpdateMyAccountMutation from "./UpdateMyAccountMutation";
import UpdatePasswordMutation from "./UpdatePasswordMutation";
import WishlistAddItem from "./WishlistAddItem";
import WishlistRemoveItem from "./WishlistRemoveItem";
import { DocumentNode } from "@apollo/client";

enum MutationName {
  LoginMutation = "LoginMutation",
  LogoutMutation = "LogoutMutation",
  CreateNewAccountMutation = "CreateNewAccountMutation",
  SendResetPasswordMutation = "SendResetPasswordMutation",
  UpdatePasswordMutation = "UpdatePasswordMutation",
  ChangePasswordMutation = "ChangePasswordMutation",
  CartAddItem = "CartAddItem",
  CartUpdateQuantity = "CartUpdateQuantity",
  CartRemoveItem = "CartRemoveItem",
  RegisterUserMutation = "RegisterUserMutation",
  UpdateMyAccountMutation = "UpdateMyAccountMutation",
  WishlistAddItem = "WishlistAddItem",
  WishlistRemoveItem = "WishlistRemoveItem",
  AddAddress = "AddAddress",
  UpdateAddress = "UpdateAddress",
  CreateUpdatePartner = "CreateUpdatePartner",
  AdyenTransaction = "AdyenTransaction",
  AdyenAcquierInfo = "AdyenAcquierInfo",
  AdyenPaymentMethods = "AdyenPaymentMethods",
  AdyenPaymentDetails = "AdyenPaymentDetails",
  AdyenPayments = "AdyenPayments",
  StripeTransaction = "StripeTransaction",
  StripeInlineform = "StripeInlineform"
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
  AdyenTransaction,
  AdyenAcquierInfo,
  AdyenPaymentMethods,
  AdyenPaymentDetails,
  AdyenPayments,
  StripeTransaction,
  StripeInlineform
};

export { Mutations, MutationName };

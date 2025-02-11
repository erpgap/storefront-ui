import type { AttributeValue, Cart, OrderLine } from "~/graphql";

export const reduceCart = (cartData: Cart) => ({
    order: {
        id: cartData?.order?.id,
        amountTotal: cartData?.order?.amountTotal,
        amountTax: cartData?.order?.amountTax,
        amountDelivery: cartData?.order?.amountDelivery,
        amountSubtotal: cartData?.order?.amountSubtotal,
        amountDiscounts: cartData?.order?.amountDiscounts,
        amountGiftCards: cartData?.order?.amountGiftCards,
        shippingMethod: {
            id: cartData?.order?.shippingMethod?.id,
            name: cartData?.order?.shippingMethod?.name,
            price: cartData?.order?.shippingMethod?.price
        },
        coupons: cartData?.order?.coupons,
        giftCards: cartData?.order?.giftCards,
        websiteOrderLine: cartData?.order?.websiteOrderLine?.map((line: OrderLine) => ({
            id: line?.id,
        })),
        orderLines: cartData?.order?.orderLines?.map((line: OrderLine) => ({
            id: line?.id,
            name: line?.product?.name,
            priceTotal: line?.priceTotal,
            priceSubtotal: line?.priceSubtotal,
            quantity: line?.quantity,
            product: {
                id: line?.product?.id,
                image: line?.product?.image,
                imageFilename: line?.product?.imageFilename,
                qty: line?.product?.qty,
                variantAttributeValues: line?.product?.variantAttributeValues?.map((attr: AttributeValue) => ({
                    id: attr?.id,
                    name: attr?.name,
                    attribute: {
                        id: attr?.attribute?.id,
                        name: attr?.attribute?.name
                    }
                })),
                combinationInfo: {
                    price: line?.product?.combinationInfo?.price,
                    list_price: line?.product?.combinationInfo?.list_price,
                }

            }
        })),
        partner: {
            id: cartData?.order?.partner?.id,
            name: cartData?.order?.partner?.name,
            email: cartData?.order?.partner?.email,
            isPublic: cartData?.order?.partner?.isPublic,
        },
        partnerShipping: {
            id: cartData?.order?.partnerShipping?.id,
            city: cartData?.order?.partnerShipping?.city,
            country: { id: cartData?.order?.partnerShipping?.country?.id },
            name: cartData?.order?.partnerShipping?.name,
            state: { id: cartData?.order?.partnerShipping?.state?.id },
            street: cartData?.order?.partnerShipping?.street,
            phone: cartData?.order?.partnerShipping?.phone,
            zip: cartData?.order?.partnerShipping?.zip,
        },
        partnerInvoice: {
            id: cartData?.order?.partnerInvoice?.id,
            city: cartData?.order?.partnerInvoice?.city,
            country: { id: cartData?.order?.partnerInvoice?.country?.id },
            name: cartData?.order?.partnerInvoice?.name,
            state: { id: cartData?.order?.partnerInvoice?.state?.id },
            street: cartData?.order?.partnerInvoice?.street,
            phone: cartData?.order?.partnerInvoice?.phone,
            zip: cartData?.order?.partnerInvoice?.zip,
        }
    }
})

export async function updateCart(event: any, updateData: any) {
    const session = await useSession(event, {
        password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(
        keyName
    )) || { cart: {} };

    const updatedCart = Object.assign({}, currentCart.cart, updateData);
    const reducedCart = reduceCart(updatedCart as Cart)

    useStorage().setItem(keyName, { reducedCart });
}

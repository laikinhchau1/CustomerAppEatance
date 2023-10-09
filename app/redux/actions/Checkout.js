export const TYPE_SAVE_CHECKOUT_DETAILS = "TYPE_SAVE_CHECKOUT_DETAILS";
export const SAVE_CART_COUNT = "SAVE_CART_COUNT";
export const SAVE_CURRENCY_SYMBOL = "SAVE_CURRENCY_SYMBOL"
export const SAVE_CART_PRICE = "SAVE_CART_PRICE"
export const SAVE_CHECKOUT_SCREEN = "SAVE_CHECKOUT_SCREEN"
export const SAVE_GUEST_ADDRESS = "SAVE_GUEST_ADDRESS"
export const SAVE_GUEST_DETAILS = "SAVE_GUEST_DETAILS"



export function saveCheckoutDetails(data) {
    return {
        type: TYPE_SAVE_CHECKOUT_DETAILS,
        value: data
    };
}

export function saveCartCount(data) {
    return {
        type: SAVE_CART_COUNT,
        value: data
    };
}

export function saveCartPrice(data) {
    return {
        type: SAVE_CART_PRICE,
        value: data
    };
}

export function saveCurrencySymbol(data) {
    return {
        type: SAVE_CURRENCY_SYMBOL,
        value: data
    };
}

export function saveIsCheckoutScreen(data) {
    return {
        type: SAVE_CHECKOUT_SCREEN,
        value: data
    };
}

export function saveGuestAddress(data) {
    return {
        type: SAVE_GUEST_ADDRESS,
        value: data
    };
}

export function saveGuestDetails(data) {
    return {
        type: SAVE_GUEST_DETAILS,
        value: data
    };
}


import { SAVE_GUEST_ADDRESS, SAVE_GUEST_DETAILS, TYPE_SAVE_CHECKOUT_DETAILS } from "../actions/Checkout";
import { SAVE_CART_COUNT, SAVE_CART_PRICE } from "../actions/Checkout";
import { SAVE_CURRENCY_SYMBOL, SAVE_CHECKOUT_SCREEN } from "../actions/Checkout";

const initalState = {
  checkoutDetail: {},
  cartCount: 0,
  currency_symbol: "",
  isCheckout: false,
  guestAddress: undefined,
  guestDetails: undefined
};

export function checkoutDetailOperation(state = initalState, action) {
  switch (action.type) {
    case TYPE_SAVE_CHECKOUT_DETAILS: {
      return Object.assign({}, state, {
        checkoutDetail: action.value
      });
    }
    case SAVE_CART_COUNT: {
      return Object.assign({}, state, {
        cartCount: action.value
      });
    }
    case SAVE_CART_PRICE: {
      return Object.assign({}, state, {
        cartPrice: action.value
      });
    }
    case SAVE_CURRENCY_SYMBOL: {
      return Object.assign({}, state, {
        currency_symbol: action.value
      });
    }
    case SAVE_CHECKOUT_SCREEN: {
      return Object.assign({}, state, {
        isCheckout: action.value
      });
    }
    case SAVE_GUEST_ADDRESS: {
      return Object.assign({}, state, {
        guestAddress: action.value
      });
    }
    case SAVE_GUEST_DETAILS: {
      return Object.assign({}, state, {
        guestDetails: action.value
      });
    }
    default:
      return state;
  }
}

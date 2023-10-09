import { SAVE_ALERT_DATA, SAVE_APP_VERSION, SAVE_CMS_PAGES_DATA, SAVE_COUNTRY_LIST, SAVE_CURRENT_LOCATION, SAVE_FAQS_PAGES_DATA, SAVE_FOOD_TYPE, SAVE_LANGUAGE_LIST, SAVE_ORDER_MODE, SAVE_PROMPT_STATUS, SAVE_SOCIAL_URL, SAVE_STORE_URL, TYPE_APPLE_LOGIN, TYPE_APPLE_TOKEN, TYPE_REMEMBER_LOGIN, TYPE_SAVE_CANCELLATION_REASON, TYPE_SAVE_COUNTRY_CODE, TYPE_SAVE_LANGUAGE, TYPE_SAVE_LOGIN_DETAILS, TYPE_SAVE_LOGIN_FCM, TYPE_SAVE_MAP_KEY, TYPE_SAVE_MIN_ORDER_AMOUNT, TYPE_SAVE_PAYMENT_DETAILS, TYPE_SAVE_RES_ID, TYPE_SAVE_TABLE_ID, TYPE_SHOW_SCHEDULE_DELIVERY, TYPE_SHOW_SOCIAL_BUTTON, TYPE_SOCIAL_LOGIN } from "../actions/User";

const initialStateUser = {
    // LOGIN DETAILS
    lan: "en",
    phoneNumberInRedux: undefined,
    userIdInRedux: undefined,
    firstName: "",
    lastName: "",
    notification: "1",
    arrayCMSData: [],
    arrayFAQsData: [],
    storeURL: {},
    currentLocation: undefined,
    foodType: undefined,
    googleMapKey: undefined,
    isLoginRemembered: false,
    isShowSocial: false,
    code: '+40',
    isShowScheduleDelivery: false,
    isAppleLogin: false,
    updatePrompt: false,
    cancellationReasons: undefined,
    orderMode: 0,
};

export function userOperations(state = initialStateUser, action) {
    switch (action.type) {
        case TYPE_SAVE_LOGIN_DETAILS: {
            return Object.assign({}, state, {
                phoneNumberInRedux: action.value.PhoneNumber,
                userIdInRedux: action.value.UserID,
                firstName: action.value.FirstName,
                phoneCode: action.value.phone_code,
                lastName: action.value.LastName,
                image: action.value.image,
                notification: action.value.notification,
                email: action.value.Email,
                referral_code: action.value.referral_code
            });
        }
        case TYPE_SAVE_LOGIN_FCM: {
            return Object.assign({}, state, {
                token: action.value
            });
        }
        case TYPE_SAVE_LANGUAGE: {
            return Object.assign({}, state, {
                lan: action.value
            });
        }
        case TYPE_SAVE_COUNTRY_CODE: {
            return Object.assign({}, state, {
                code: action.value
            });
        }

        case SAVE_CMS_PAGES_DATA: {
            return Object.assign({}, state, {
                arrayCMSData: (action.value)
            });
        }

        case SAVE_FAQS_PAGES_DATA: {
            return Object.assign({}, state, {
                arrayFAQsData: (action.value)
            });
        }

       

        case SAVE_FOOD_TYPE: {
            return Object.assign({}, state, {
                foodType: (action.value)
            });
        }

        case SAVE_STORE_URL: {
            return Object.assign({}, state, {
                storeURL: (action.value)
            });
        }

        case SAVE_APP_VERSION: {
            return Object.assign({}, state, {
                appVersion: (action.value)
            });
        }

        case SAVE_PROMPT_STATUS: {
            return Object.assign({}, state, {
                updatePrompt: (action.value)
            });
        }


        case SAVE_SOCIAL_URL: {
            return Object.assign({}, state, {
                socialURL: (action.value)
            });
        }

        case SAVE_CURRENT_LOCATION: {
            return Object.assign({}, state, {
                currentLocation: (action.value)
            });


        }
        case TYPE_SAVE_PAYMENT_DETAILS: {
            return Object.assign({}, state, {
                paymentDetails: action.value
            });
        }

        case TYPE_SAVE_MAP_KEY: {
            return Object.assign({}, state, {
                googleMapKey: action.value
            });
        }

        case TYPE_REMEMBER_LOGIN: {
            return Object.assign({}, state, {
                isLoginRemembered: action.value
            });
        }

        case TYPE_SOCIAL_LOGIN: {
            return Object.assign({}, state, {
                isSocialLogin: action.value
            });
        }

        case TYPE_SHOW_SOCIAL_BUTTON: {
            return Object.assign({}, state, {
                isShowSocial: action.value
            });
        }

        case TYPE_SAVE_MIN_ORDER_AMOUNT: {
            return Object.assign({}, state, {
                minOrderAmount: action.value
            });
        }

        case TYPE_SAVE_TABLE_ID: {
            return Object.assign({}, state, {
                table_id: action.value
            });
        }

        case TYPE_SAVE_RES_ID: {
            return Object.assign({}, state, {
                res_id: action.value
            });
        }
        case SAVE_ALERT_DATA: {
            return Object.assign({}, state, {
                alertData: (action.value)
            });
        }
        case SAVE_COUNTRY_LIST: {
            return Object.assign({}, state, {
                countryArray: (action.value)
            });
        }
        case SAVE_LANGUAGE_LIST: {
            return Object.assign({}, state, {
                languageArray: (action.value)
            });
        }
        case TYPE_SHOW_SCHEDULE_DELIVERY: {
            return Object.assign({}, state, {
                isShowScheduleDelivery: action.value
            });
        }
        case TYPE_APPLE_LOGIN: {
            return Object.assign({}, state, {
                isAppleLogin: action.value
            });
        }
        case TYPE_APPLE_TOKEN: {
            return Object.assign({}, state, {
                appleToken: action.value
            });
        }

        case TYPE_SAVE_CANCELLATION_REASON: {
            return Object.assign({}, state, {
                cancellationReasons: action.value
            });
        }
        case SAVE_ORDER_MODE: {
            return Object.assign({}, state, {
                orderMode: action.value
            });
        }
        default:
            return state;
    }
}

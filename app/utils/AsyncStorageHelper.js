// import { AsyncStorage } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export function flushAllData(onSuccess, onFailure) {
    AsyncStorage.clear().then(
        success => onSuccess(success),
        err => onFailure(err)
    );
}

export function saveUserLogin(details, onSuccess, onFailure) {
    AsyncStorage.setItem("login", JSON.stringify(details)).then(
        success => onSuccess(success),
        err => onFailure(err)
    );
}

export function saveUserFCM(details, onSuccess, onFailure) {
    AsyncStorage.setItem("token", JSON.stringify(details)).then(
        success => onSuccess(success),
        err => onFailure(err)
    );
}

export function getUserFCM(onSuccess, onFailure) {
    AsyncStorage.getItem("token").then(
        res => {
            if (res != "" && res != null && res != undefined) {
                onSuccess(JSON.parse(res));
            } else {
                onFailure("Token Null");
            }
        },
        err => onFailure(err)
    );
}


export function saveSocialLogin(details, onSuccess, onFailure) {
    AsyncStorage.setItem("social", JSON.stringify(details)).then(
        success => onSuccess(success),
        err => onFailure(err)
    );
}

export function getSocialLogin(onSuccess, onFailure) {
    AsyncStorage.getItem("social").then(
        res => {
            if (res != "" && res != null && res != undefined) {
                onSuccess(JSON.parse(res));
            } else {
                onFailure("Null");
            }
        },
        err => onFailure(err)
    );
}

export function getUserToken(onSuccess, onFailure) {
    AsyncStorage.getItem("login").then(
        res => {
            if (res != "" && res != null && res != undefined) {
                onSuccess(JSON.parse(res));
            } else {
                onFailure("Token Null");
            }
        },
        err => onFailure(err)
    );
}

export function saveCartData(details, onSuccess, onFailure) {
    AsyncStorage.setItem("cartList", JSON.stringify(details)).then(
        success => {

            onSuccess(success);
        },
        error => onFailure(error)
    );
}

export function clearCartData(onSuccess, onError) {
    AsyncStorage.removeItem("cartList").then(
        response => {
            onSuccess(response);
        },
        error => {
            onError(error);
        }
    );
}

export function getCartList(onSuccess, onCartNotFound, onFailure) {
    AsyncStorage.getItem("cartList").then(
        response => {
            if (response != "" && response != null && response != undefined) {

                onSuccess(JSON.parse(response));
            } else {
                onCartNotFound(response);
            }
        },
        error => {
            onFailure(error);
        }
    );
}

export function saveLanguage(lan, onSuccess, onFailure) {
    AsyncStorage.setItem("lan", JSON.stringify(lan)).then(
        success => {
            onSuccess(success);
        },
        error => {
            onFailure(error);
        }
    );
}

export async function getLanguage(onSuccess, onFailure) {
    await AsyncStorage.getItem("lan").then(
        res => {
            onSuccess(JSON.parse(res));
        },
        error => {
            onFailure("error");
        }
    );
}

export async function saveTranslation(lan, onSuccess, onFailure) {
    await AsyncStorage.setItem("saved_translation", JSON.stringify(lan)).then(
        success => {
            onSuccess(success);
        },
        error => {
            onFailure(error);
        }
    );
}

export async function getSavedTranslation(onSuccess, onFailure) {
    await AsyncStorage.getItem("saved_translation").then(
        res => {
            onSuccess(JSON.parse(res));
        },
        error => {
            onFailure("error");
        }
    );
}

export function saveCurrency_Symbol(symbol, onSuccess, onFailure) {
    AsyncStorage.setItem("currency_symbol", JSON.stringify(symbol)).then(
        success => {
            onSuccess(success);
        },
        error => {
            onFailure(error);
        }
    );
}

export function getCurrency_Symbol(onSuccess, onFailure) {
    AsyncStorage.getItem("currency_symbol").then(
        res => {
            onSuccess(JSON.parse(res));
        },
        error => {
            onFailure("error");
        }
    );
}

export function clearCurrency_Symbol(onSuccess, onError) {
    AsyncStorage.removeItem("currency_symbol").then(
        response => {
            onSuccess(response);
        },
        error => {
            onError(error);
        }
    );
}

export function saveAppleLoginAsync(bool, onSuccess, onFailure) {
    AsyncStorage.setItem("apple_login", JSON.stringify(bool)).then(
        success => {
            onSuccess(success);
        },
        error => {
            onFailure(error);
        }
    );
}

export function getAppleLoginAsync(onSuccess, onFailure) {
    AsyncStorage.getItem("apple_login").then(
        res => {
            onSuccess(JSON.parse(res));
        },
        error => {
            onFailure("error");
        }
    );
}

export function saveAppleTokenAsync(token, onSuccess, onFailure) {
    AsyncStorage.setItem("apple_token", JSON.stringify(token)).then(
        success => {
            onSuccess(success);
        },
        error => {
            onFailure(error);
        }
    );
}

export function getAppleTokenAsync(onSuccess, onFailure) {
    AsyncStorage.getItem("apple_token").then(
        res => {
            onSuccess(JSON.parse(res));
        },
        error => {
            onFailure("error");
        }
    );
}

export function saveMenu(menu, onSuccess, onFailure) {
    AsyncStorage.setItem("menuData", JSON.stringify(menu)).then(
        success => {
            onSuccess(success);
        },
        error => {
            onFailure(error);
        }
    );
}

export async function getMenu(onSuccess, onFailure) {
    await AsyncStorage.getItem("menuData").then(
        res => {
            onSuccess(JSON.parse(res));
        },
        error => {
            onFailure("error");
        }
    );
}
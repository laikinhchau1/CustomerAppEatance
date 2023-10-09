import { debugLog } from "./EDConstants";
import { strings } from "../locales/i18n";
import { isValidPhoneNumber } from "libphonenumber-js";

export default class Validations {
    checkForEmpty = (text, errorMessage = 'This is a required field') => {
        if (text.trim().length === 0) {
            return errorMessage;
        }
        return ''
    };

    validatePhoneEmail = (text, errorMessage) => {

        let regMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let isnum = /^\d+$/.test(text);

        if (text.trim().length === 0) {
            return errorMessage;
        } else if (text != '' && !text.includes('@') && !isnum) {
            return errorMessage
        } else if (text != '' && text.includes('@')) {
            return regMail.test(text) ? '' : strings('emailValidate');
        } else if (text != '' && isnum) {
            return text.length > 0 ? '' : errorMessage
        } else {
            return ''
        }
    }

    validateMobile = (number, message, code) => {
        if (number === "") {
            return message;
        }
        else {
            if (isValidPhoneNumber("+" + code + number))
                return ""
            else
                return strings("validPhone")
        }
    }
    validateLoginMobile = (number, message) => {
        if (number === "") {
            return message;
        } else {
            return ""
        }
    }
    // Function for performing email validations
    validateEmail = (text, errorMessage = 'This is a required field') => {
        if (text.trim().length === 0) {
            return errorMessage;
        }
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return reg.test(text) ? '' : strings('emailValidate');
    };
    // Function for performing Password validations
    validatePassword = (text, errorMessage = 'This is a required field') => {
        if (text.trim().length === 0) {
            return errorMessage;
        } else if (text.trim().length < 6) {
            return strings('passwordValidationString')
        } else {
            return ''
        }
        // let reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{6,12}$/;
        // return reg.test(text) ? '' : strings('general.passwordValidationString');
    };

    validateLoginPassword = (text, errorMessage = 'This is a required field') => {
        if (text.trim().length === 0) {
            return errorMessage;
        }
    };

    validateConfirmPassword = (password1, password2, errorMessage = 'Passwords does not match') => {
        if (password2.trim().length === 0) {
            return strings('emptyConfirmPassword');
        }
        if (password1 === password2) {
            return '';
        }
        return errorMessage;
    };
}

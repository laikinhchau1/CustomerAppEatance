/* eslint-disable prettier/prettier */
import currencyFormatter from 'currency-formatter';
import Moment from 'moment';
import { Dimensions, Platform } from "react-native";
import I18n from 'i18n-js';
import { RFValue } from 'react-native-responsive-fontsize';


export const GENERAL_URL = "https:/yourwebsite.com/v1/general_api/"; //DEV
export const BASE_URL = "https://yourwebsite.com/v1/api/";
export const RETURN_URL = "https://yourwebsite.com"


export const REGISTRATION_URL = BASE_URL + "registration";
export const LOGIN_URL = BASE_URL + "login";
export const LOGOUT_URL = BASE_URL + "logout";
export const DRIVER_TRACKING = BASE_URL + "driverTracking";
export const CHANGE_TOKEN = BASE_URL + "updateDeviceToken";
export const CHECK_ORDER_URL = BASE_URL + "checkServiceability";
export const GET_RESTAURANT_DETAIL = BASE_URL + "getRestaurantDetail";
export const GET_RESTAURANT_MENU = BASE_URL + "getRestaurantMenu";
export const ADD_TO_CART = BASE_URL + "addtoCart";
export const GET_NOTIFICATION = BASE_URL + "getNotification";
export const ADD_REVIEW = BASE_URL + "addReview";
export const GET_REVIEW = BASE_URL + "getRestaurantRating";
export const ADD_ORDER = BASE_URL + "addOrder";
export const CMS_PAGE = GENERAL_URL + "getCMSPage"
export const PROMO_CODE_LIST = BASE_URL + "couponList";
export const APPLY_PROMO_CODE = BASE_URL + "checkPromocode";
export const GET_RECIPE_LIST = BASE_URL + "getRecipes";
export const REGISTRATION_HOME = BASE_URL + "getHome";
export const CHECK_BOOKING_AVAIL = BASE_URL + "checkBookingAvailability";
export const BOOKING_EVENT = BASE_URL + "bookEvent";
export const BOOKING_HISTORY = BASE_URL + "getBooking";
export const DELETE_EVENT = BASE_URL + "deleteBooking";
export const ADD_ADDRESS = BASE_URL + "addAddress";
export const GET_ADDRESS = BASE_URL + "getAddress";
export const DELETE_ADDRESS = BASE_URL + "deleteAddress";
export const UPDATE_PROFILE = BASE_URL + "editProfile";
export const RESET_PASSWORD_REQ_URL = BASE_URL + "changePassword";
export const ORDER_LISTING = BASE_URL + "orderListing";
export const FORGOT_PASSWORD = BASE_URL + "forgotpassword";
export const FORGOT_PASSWORD_WITH_EMAIL = BASE_URL + "forgotpasswordViaResetLink";
export const GET_USER_LANGUAGE = BASE_URL + "changeUserLanguage";
export const COUNTRY_CODE_URL = BASE_URL + "getCountryPhoneCode";
export const GET_FOOD_TYPE = BASE_URL + "getFoodType";
export const GET_QR_POINTS = BASE_URL + "getUsersEarningPoints";
export const NETOPIA_PAYMENT = 'https://rapi.ro/mobilpay/card_Redirect'
export const SEND_OTP = 'https://api.conectoo.com/v1/sms/send'
export const ADD_ORDER_REVIEW = BASE_URL + "add_OrderReview";
export const DELETE_ACCOUNT = BASE_URL + "deleteAccount"
export const APPLY_COUPON = BASE_URL + "applyCoupon";
export const LANGUAGE_LIST = GENERAL_URL + 'language_list'
export const COUNTRY_CODE_LIST = GENERAL_URL + 'country_code_list'
export const PAYMENT_LIST = BASE_URL + 'payment_method'
export const CHECK_CARD_PAYMENT = BASE_URL + 'checkCardPayment'
export const CREATE_PAYMENT_METHOD = BASE_URL + 'createPaymentMethod'
export const CREATE_PAYMENT_ONLINE = BASE_URL + 'online_payment'
export const APP_VERSION = GENERAL_URL + "getAppVersion"
export const GET_CANCEL_REASON_LIST = GENERAL_URL + "cancel_reject_reason_list";
export const CANCEL_ORDER = BASE_URL + "cancelOrder";
export const FAQ_URL = BASE_URL + "FAQs";
export const CHECK_TABLE_AVAIL = BASE_URL + "checkTableBookingAvailability";
export const BOOKING_TABLE = BASE_URL + "bookTable";



//UNIT MODE
export const DISTANCE_IN_MILES = true

// IS VERIFICATION REQUIRED
export const isVerificationRequired = false

// ALERT CONSTANTS
export const APP_NAME = "Eatance";
export const DEFAULT_ALERT_TITLE = APP_NAME;

// REQUESTS CONSTANTS
export const RequestKeys = {
  contentType: 'Content-Type',
  json: 'application/json',
  authorization: 'Authorization',
  bearer: 'Bearer',
};

export const API_PAGE_SIZE = 20

// STORAGE CONSTANTS
export const StorageKeys = {
  user_details: 'UserDetails',
};

// REDUX CONSTANTS
export const ACCESS_TOKEN = 'ACCESS_TOKEN';
export const RESPONSE_FAIL = 0;
export const RESPONSE_SUCCESS = 1;
export const COUPON_ERROR = 2;
export const RESTAURANT_ERROR = 3;


export const PAYMENT_TYPES = {
  cash: "cash",
  online: "online",
  later: "later",
  counter: 'counter'
}

export const GOOGLE_API_KEY = 'ENTER_YOUR_MAPS_API_KEY_HERE';

// NOTIFICATION_TYPE
export const ORDER_TYPE = 'order';
export const NOTIFICATION_TYPE = 'noti';
export const DEFAULT_TYPE = 'default';
export const DINE_TYPE = 'dinein';
export const EVENT_TYPE = 'event';


export const funGetTime = date => {
  var d = new Date(date);
  return Moment(d).format("LT");
};

export const funGetFullDate = date => {
  return Moment(date).format("Do MMMM, YYYY");
};

export const funGetDate = date => {
  var d = new Date(date);
  return Moment(d).format("MM-DD-YYYY");
};

export const funGetTomorrowDate = () => {
  var d = new Date();
  return new Date(d);
};

export function funGetDateStr(date, formats) {
  if (formats == undefined) {
    formats = "MM-DD-YYYY";
  }
  Moment.locale("en");
  var d = new Date("" + date.replaceAll("-", "/"));
  return Moment(d).format(formats);
}

export function funGetTimeStr(date) {
  Moment.locale("en");
  var d = new Date("" + date.replaceAll("-", "/"));
  return Moment(d).format("LT");
}

export function funGetFrench_Curr(x, y, lan) {
  // var xValue = parseInt(x) * parseInt(y)
  let decimal
  let thousand

  if (lan == "fr") {
    decimal = ","
    thousand = "."
  }
  else {
    decimal = "."
    thousand = ","
  }
  // return xValue
  if (y === undefined) {
    var zValue = parseFloat(y);
    return currencyFormatter.format(zValue, {
      symbol: '',
      decimal: '.',
      thousand: sym,
      precision: 2,
    });
  } else {

    var xValue = parseFloat(x) * parseFloat(y);

    return currencyFormatter.format(xValue, {
      symbol: '',
      decimal: decimal,
      thousand: thousand,
      precision: 2,
    });
  }
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

export function capiString(str) {
  if (str !== undefined && str !== null) {
    var splitStr = str.split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
  }
  // Directly return the joined string
  return str !== undefined && str !== null ? splitStr.join(' ') : str;
}

export function debugLog() {
  for (var i = 0; i < arguments.length; i++) {
    console.log(arguments[i]);
  }
}

export function isRTLCheck() {
  return I18n.currentLocale().indexOf('ar') === 0;
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

export const boldify = text => {
  const charSet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?', '.', ',', '"', "'"];
  const targetCharSet = ['𝗮', '𝗯', '𝗰', '𝗱', '𝗲', '𝗳', '𝗴', '𝗵', '𝗶', '𝗷', '𝗸', '𝗹', '𝗺', '𝗻', '𝗼', '𝗽', '𝗾', '𝗿', '𝘀', '𝘁', '𝘂', '𝘃', '𝘄', '𝘅', '𝘆', '𝘇', '𝗔', '𝗕', '𝗖', '𝗗', '𝗘', '𝗙', '𝗚', '𝗛', '𝗜', '𝗝', '𝗞', '𝗟', '𝗠', '𝗡', '𝗢', '𝗣', '𝗤', '𝗥', '𝗦', '𝗧', '𝗨', '𝗩', '𝗪', '𝗫', '𝗬', '𝗭', '𝟬', '𝟭', '𝟮', '𝟯', '𝟰', '𝟱', '𝟲', '𝟳', '𝟴', '𝟵', '!', '?', '.', ',', '"', "'"];
  const textArray = text.split('');
  let boldText = '';
  textArray.forEach((letter) => {
    const index = charSet.findIndex((_letter) => _letter === letter);
    if (index !== -1) {
      boldText = boldText + targetCharSet[index];
    } else {
      boldText = boldText + letter;
    }
  });
  return boldText;
}

// TEXT FIELD TYPES
export const TextFieldTypes = {
  email: 'email',
  password: 'password',
  phone: 'phone',
  default: 'default',
  amount: 'amount',
};

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 360;
const guidelineBaseHeight = 760;
const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// CHANGE FONT SIZE IN ANDROID
export function getProportionalFontSize(baseFontSize) {
  var intialFontSize = baseFontSize || 14;
  var fontSizeToReturnModerate = moderateScale(intialFontSize);
  var fontSizeToReturnVertical = verticalScale(intialFontSize);
  return Platform.OS == 'ios' ? fontSizeToReturnModerate : RFValue(intialFontSize, 812);
}
export const encodeData = (data) => {
  let formBody = [];
  for (var property in data) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");
  return formBody
}

//decimal validation
export const validateTwoDecimal = value => {
  var rgx = /^[0-9]*\.[0-9]{3}$/;
  return value.match(rgx);
}
//#endregion

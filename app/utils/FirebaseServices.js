// import firebase from "react-native-firebase";
import messaging from '@react-native-firebase/messaging';
import { debugLog } from "./EDConstants";
const USER_NOTIFICATIONS = "USER_NOTIFICATIONS_"
const GENERAL_NOTIFICATIONS = "GENERAL_NOTIFICATIONS_"

export const checkFirebasePermission = async (onSuccessTokenRequest, onFailureTokenRequest) => {
    requestPermission(
        onSuccess => {
            debugLog("GET FCM TOKEN ::::::::: ", onSuccess)
            getToken(onSuccessTokenRequest, onFailureTokenRequest)
        },
        onFailure => {
            debugLog("GET ERROR FCM TOKEN ::::::::: ", onFailure)
            onFailureTokenRequest(onFailure)
        }
    );
}

const getToken = async (onSuccess, onFailure) => {
    var fcmToken = await messaging().getToken();

    if (fcmToken !== "") {

        onSuccess(fcmToken)
    } else {
        onFailure(fcmToken)
    }
}

const requestPermission = async (onSuccessRequest, onFailureRequest) => {
    try {
        await messaging().requestPermission();
        debugLog('User has notification permissions enabled.');
        getToken(onSuccessRequest, onFailureRequest)
    } catch (error) {
        // User has rejected permissions
        onFailureRequest(error)
    }
}

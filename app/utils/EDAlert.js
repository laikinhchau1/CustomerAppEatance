import { strings } from "../locales/i18n";
import { DEFAULT_ALERT_TITLE } from "../utils/EDConstants";
import { showCustomAlert } from "../components/EDCustomAlert";

export function showDialogue(message, arrayButtons = [], title = DEFAULT_ALERT_TITLE, okButtonHandler = () => {
}, okayButtonTitle , isNotPreferred) {
    var arrayButtonsToShow = arrayButtons.concat([{ "text": okayButtonTitle || strings("dialogOkay"), onPress: okButtonHandler , isNotPreferred : isNotPreferred || false}])
    showCustomAlert(
        title,
        message,
        arrayButtonsToShow)
}

export function showPaymentDialogue(message, arrayButtons = [], title = DEFAULT_ALERT_TITLE) {
    showCustomAlert(
        title,
        message,
        arrayButtons)
}


export function showProceedDialogue(message, arrayButtons, title = DEFAULT_ALERT_TITLE, okButtonHandler = () => {
}) {
    var arrayButtonsToShow = arrayButtons.concat([{ "text": strings("dialogCancel"), onPress: okButtonHandler , isNotPreferred : true }])
    arrayButtonsToShow = (arrayButtons || []).concat([
        { text: strings("dialogProceed"), onPress: okButtonHandler }
    ]);
    showCustomAlert(
        title,
        message,
        arrayButtonsToShow)
}

export function showNoInternetAlert() {
    let arrayButtonsToShow = [{ "text": strings("dialogOkay") }]
    showCustomAlert(
        strings("appName"),
        strings("noInternet"),
        arrayButtonsToShow)
}



export function showValidationAlert(message) {
    var arrayButtonsToShow = [{ "text": strings("dialogOkay") }]
    showCustomAlert(
        strings("appName"),
        message,
        arrayButtonsToShow)
}

export function showDialogueNew(message, arrayButtons, title = DEFAULT_ALERT_TITLE, okButtonHandler = () => {
}) {
    var arrayButtonsToShow = arrayButtons.concat([{ "text": strings("dialogCancel"), onPress: okButtonHandler , isNotPreferred : true }])
    arrayButtonsToShow = (arrayButtons || []).concat([
        { text: strings("dialogOkay"), onPress: okButtonHandler }
    ]);
    showCustomAlert(
        title,
        message,
        arrayButtonsToShow)
}

export function showConfirmationDialogue(message, arrayButtons, title = DEFAULT_ALERT_TITLE, okButtonHandler = () => {
}, noButtonHandler = () => { }) {
    var arrayButtonsToShow = arrayButtons.concat([{ "text": strings("dialogCancel"), onPress: okButtonHandler }])
    arrayButtonsToShow = (arrayButtons || []).concat([
        { text: strings("dialogYes"), onPress: okButtonHandler },
        { text: strings("dialogNo"), onPress: noButtonHandler , isNotPreferred : true}
    ]);
    showCustomAlert(
        title,
        message,
        arrayButtonsToShow)
}
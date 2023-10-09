import React from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import { NavigationActions, NavigationEvents, StackActions } from "react-navigation";
import { connect } from "react-redux";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCheckoutDetails } from "../redux/actions/Checkout";
import { saveResIDInRedux, saveTableIDInRedux } from '../redux/actions/User';
import { clearCartData, clearCurrency_Symbol } from "../utils/AsyncStorageHelper";
import { showDialogue, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, RESTAURANT_ERROR, RETURN_URL } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { netStatus } from "../utils/NetworkStatusConnection";
import { addOrder, createOnlinePaymentMethod, paypalCaptureAPI, paypalOrderAPI } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";


class PaymentGatewayContainer extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.checkoutDetail = this.props.checkoutDetail;
        this.order_delivery = props.checkoutDetail.order_delivery
        this.isForPending = this.props.navigation.state.params.isPending || false
        this.pendingTotal = this.props.navigation.state.params.pendingTotal || 0
        this.isPendingAdded = this.props.navigation.state.params.isPendingAdded || false
        this.pendingTotalPayment = this.props.navigation.state.params.pendingTotalPayment || 0
        this.promoObj = this.props.navigation.state.params.promoObj || {}
        this.extra_comment = this.props.navigation.state.params.extra_comment
        this.oldOrderID = this.props.navigation.state.params.order_id
        this.currecy_code = this.props.navigation.getParam("currency_code")
        this.paymentDetails = this.props.paymentDetails
        console.log("CheckOUT :::::::: ", this.checkoutDetail, this.currecy_code)
    }

    state = {
        isLoading: false,
        url: undefined,
        isPaymentComplete: false
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPressed);
        this.generateAccessToken()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed)
    }

    onDidBlur = () => {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed)
    }
    onBackPressed = () => {
        showDialogue(strings("stopPayment"), [{ text: strings("dialogCancel") ,  isNotPreferred : true }], strings("appName"),
            this.onBackEventHandler)
        return true
    }

    /**
     * API Call to generate paypal access token
     */
    generateAccessToken = () => {
        netStatus(
            status => {
                if (status) {
                    let params = {
                        language_slug: this.props.lan,
                        user_id: this.props.user_id,
                        payment_method: 'paypal',
                        isLoggedIn: this.props.user_id !== undefined && this.props.user_id !== null && this.props.user_id !== "" ? 1 : 0
                    }
                    this.setState({ isLoading: true })
                    createOnlinePaymentMethod(
                        params,
                        this.onSuccessToken,
                        this.onFailureToken,
                        this.props
                    )
                }
                else
                    showDialogue(strings('noInternet'), [], "", this.onBackEventHandler)
            }
        )
    }

    //On successful access token generation

    onSuccessToken = onSuccess => {
        debugLog("ACCESS TOKEN GENERATED ::::::", onSuccess)
        if (onSuccess !== undefined && onSuccess.payment_details.access_token !== undefined) {
            this.access_token = onSuccess.payment_details.access_token
            this.generateOrderID()
        }
        else {
            this.setState({ isLoading: false })
            showDialogue(strings('paymentFail'), [], strings('appName'), this.onBackEventHandler)
        }
    }

    //On failed access token generation

    onFailureToken = onFailure => {
        this.setState({ isLoading: false })
        debugLog("ACCESS TOKEN GENERATION FAILED ::::::", onFailure)
        showDialogue(strings('paymentFail'), [], strings('appName'), this.onBackEventHandler)
    }

    /**
     *  Generate Order ID after obtaining access token
     */
    generateOrderID = () => {
        netStatus(
            status => {
                if (status) {
                    let params = {
                        "intent": "CAPTURE",
                        "application_context": {
                            "return_url": RETURN_URL,
                            "cancel_url": RETURN_URL
                        },
                        "purchase_units": [
                            {
                                "amount": {
                                    "currency_code": this.currecy_code,
                                    "value": parseFloat(this.isForPending ? this.pendingTotal : (this.isPendingAdded && this.promoObj.coupon_id == undefined ? parseFloat(this.checkoutDetail.total) + parseFloat(this.pendingTotalPayment) : this.checkoutDetail.total)).toFixed(2).toString()
                                }
                            }
                        ]
                    }
                    paypalOrderAPI(
                        params,
                        this.onSuccessOrderID,
                        this.onFailureOrderID,
                        {
                            authorization: 'Bearer ' + this.access_token,
                            paymentDetails: this.paymentDetails,
                            forOrder: true
                        }
                    )
                }
                else
                    showDialogue(strings('noInternet'), [], "", this.onBackEventHandler)
            }
        )
    }
    //On success Order ID 
    onSuccessOrderID = (onSuccess) => {
        debugLog("ON SUCCESS Order ID::::", onSuccess)
        if (onSuccess !== undefined && onSuccess.id !== undefined) {
            this.order_id = onSuccess.id
            this.setState({ url: onSuccess.links[1].href })
        }
        else {
            this.setState({ isLoading: false })
            showDialogue(strings('paymentFail'), [], strings('appName'), this.onBackEventHandler)
        }
    }

    //On failure Order ID 
    onFailureOrderID = (onFailure) => {
        this.setState({ isLoading: false })
        debugLog("ON FAILURE Order ID::::", onFailure)
        showDialogue(strings('paymentFail'), [], strings('appName'), this.onBackEventHandler)
    }

    /**
    * Capture payment after order
    */

    capturePaypalPayment = () => {
        netStatus(
            status => {
                if (status) {
                    paypalCaptureAPI(
                        {},
                        this.onSuccesscapturePaypalPayment,
                        this.onFailurecapturePaypalPayment,
                        {
                            authorization: 'Bearer ' + this.access_token,
                            order_id: this.order_id,
                            paymentDetails: this.paymentDetails,
                            forOrder: true


                        }
                    )
                }
                else
                    showDialogue(strings('noInternet'), [], "", this.onBackEventHandler)
            }
        )
    }
    //On success capturePaypalPayment
    onSuccesscapturePaypalPayment = (onSuccess) => {
        debugLog("ON SUCCESS Paypal capture::::", onSuccess)
        this.getPaymentStatus()
    }

    //On failure capturePaypalPayment
    onFailurecapturePaypalPayment = (onFailure) => {
        this.setState({ isLoading: false })
        debugLog("ON FAILURE Paypal capture::::", onFailure)
        showDialogue(strings('paymentFail'), [], strings('appName'), this.onBackEventHandler)
    }

    /**
     * Get payment status after a payment
     */

    getPaymentStatus = () => {
        netStatus(
            status => {
                if (status) {
                    paypalOrderAPI(
                        {},
                        this.onSuccessOrderStatus,
                        this.onFailureOrderStatus,
                        {
                            authorization: 'Bearer ' + this.access_token,
                            order_id: this.order_id,
                            paymentDetails: this.paymentDetails,

                        }
                    )
                }
                else
                    showDialogue(strings('noInternet'), [], "", this.onBackEventHandler)
            }
        )
    }
    //On success Order Status 
    onSuccessOrderStatus = (onSuccess) => {
        debugLog("ON SUCCESS Order Status::::", onSuccess)
        if (onSuccess !== undefined && onSuccess.status !== undefined && onSuccess.status === "COMPLETED") {
            if (this.isForPending)
                this.payPendingOrder()
            else {
                if (this.isPendingAdded)
                    this.payPendingOrder()
                else
                    this.placeOrder()
            }
        }
        else {
            this.setState({ isLoading: false })
            showDialogue(strings('paymentFail'), [], strings('appName'), this.onBackEventHandler)
        }
    }

    //On failure Order Status 
    onFailureOrderStatus = (onFailure) => {
        this.setState({ isLoading: false })
        debugLog("ON FAILURE Order Status::::", onFailure)
        showDialogue(strings('paymentFail'), [], strings('appName'), this.onBackEventHandler)
    }

    payPendingOrder = () => {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                debugLog("PAID FOR PENDING ORDER::::::")
                if (this.isPendingAdded)
                    this.placeOrder()
                else
                    this.updatePendingOrders()
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }

    updatePendingOrders = () => {
      
    }
    

    /**
     * Webview Navigation change
     */
    navigationChange = (resp) => {
        debugLog("NAVIGATION CHANGE CALLED :::::::::::", resp)
        if (resp.url.includes(RETURN_URL) && this.state.isPaymentComplete === false) {
            this.setState({ isPaymentComplete: true, isLoading: true, url: undefined })
            this.capturePaypalPayment()
        }
    }

    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("paymentGateway")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onBackPressed}
                loading={this.state.isLoading}
            >
                <NavigationEvents onDidBlur={this.onDidBlur} />

                {/* MAIN VIEW */}
                <View style={{ flex: 1 }}>
                    {this.state.url !== undefined && this.state.url.trim().length !== 0 ?
                        <WebView
                            onLoad={() => this.setState({ isLoading: false })}
                            style={{ width: "100%", height: "100%" }}
                            source={{ uri: this.state.url }}
                            javaScriptEnabled={true}
                            allowsBackForwardNavigationGestures={true}
                            onNavigationStateChange={this.navigationChange}
                        /> : null}
                </View>
            </BaseContainer >
        );
    }
    //#endregion


    //#region 
    onBackEventHandler = () => {
        this.props.navigation.goBack();
    }
    //#endregion

    //#region ADD ORDER
    /**
     * @param { Success Reponse Object } onSuccess
     */
    onSuccessAddOrder = (onSuccess) => {
        debugLog("ORDER SUCCESS ::::::::::::: ", onSuccess)
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("generalWebServiceError")
            );
        } else {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.resObj = onSuccess.restaurant_detail
                if (this.isPendingAdded)
                    this.updatePendingOrders()
                else
                    clearCartData(
                        response => {
                            if (this.order_delivery == "DineIn") {
                                this.props.saveTableID(undefined);
                                this.props.saveResID(undefined);
                            }
                            this.props.navigation.popToTop()
                            this.props.navigation.navigate("OrderConfirm", { isForDineIn: this.order_delivery == "DineIn" ? true : false, resObj: onSuccess.restaurant_detail, navigateToOrder: true });
                        },
                        error => { }
                    );

            }
            else if (onSuccess.status == RESTAURANT_ERROR) {
                this.props.saveCartCount(0);
                clearCurrency_Symbol(onSuccess => { }, onfailure => { })
                clearCartData(
                    response => {
                    },
                    error => { }
                );
                showDialogue(onSuccess.message, [], strings("appName"),
                    () =>
                        this.props.navigation.dispatch(
                            StackActions.reset({
                                index: 0,
                                actions: [
                                    NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                                ]
                            })
                        ));
            }
            else {
                showValidationAlert(onSuccess.message);
            }
        }
        this.setState({ isLoading: false });
    }
    //#endregion

    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureAddOrder = (onfailure) => {
        this.setState({ isLoading: false });
        showDialogue(strings("generalWebServiceError"), [], strings("appName"), this.onBackEventHandler);
    }

    //#region 
    /** PLACE ORDER API */
    placeOrder = () => {
        netStatus(status => {
            if (this.extra_comment !== undefined && this.extra_comment !== null)
                this.checkoutDetail.extra_comment = this.extra_comment
            this.checkoutDetail.transaction_id = this.order_id
            this.checkoutDetail.payment_option = 'paypal'

            if (this.oldOrderID !== undefined && this.oldOrderID !== null)
                this.checkoutDetail.order_id = this.oldOrderID

            if (this.props.user_id == undefined || this.props.user_id == null || this.props.user_id == "") {
                this.checkoutDetail.isLoggedIn = 0
                this.checkoutDetail.first_name = this.props.guestDetails.first_name
                this.checkoutDetail.last_name = this.props.guestDetails.last_name
                this.checkoutDetail.phone_number = this.props.guestDetails.phone_number
                this.checkoutDetail.phone_code = this.props.guestDetails.phone_code
                this.checkoutDetail.email = this.props.guestDetails.email

                if (this.order_delivery == "Delivery") {
                    this.checkoutDetail.address_input = this.props.guestAddress.address
                    this.checkoutDetail.landmark = this.props.guestAddress.landmark
                    this.checkoutDetail.latitude = this.props.guestAddress.latitude
                    this.checkoutDetail.longitude = this.props.guestAddress.longitude
                    this.checkoutDetail.zipcode = this.props.guestAddress.zipcode
                    this.checkoutDetail.city = this.props.guestAddress.city
                    this.checkoutDetail.state = this.props.guestAddress.state
                    this.checkoutDetail.country = this.props.guestAddress.country
                }
            }
            else
                this.checkoutDetail.isLoggedIn = 1

            console.log("CheckOut request :::::::::: ", JSON.stringify(this.checkoutDetail))
            if (status) {
                this.setState({ isLoading: true });
                addOrder(this.checkoutDetail, this.onSuccessAddOrder, this.onFailureAddOrder, this.props, true)
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    //#endregion
}

export const style = StyleSheet.create({
    subContainer: {
        // flexDirection: "row",
        margin: 10,
        backgroundColor: "#fff",
        borderRadius: 6,
        padding: 10,
        justifyContent: "center"
    },
    totalPrice: {
        flex: 1,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(14),
        alignSelf: "center",
        marginHorizontal: 10,
        color: "#000"
    },
    roundButton: {
        alignSelf: "center",
        margin: 10,
        backgroundColor: EDColors.primary,
        borderRadius: 4
    },
    checkOutContainer: {
        // flexDirection: "row",
        marginTop: 100,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        borderRadius: 6,
        alignSelf: "flex-end",
        backgroundColor: "#fff"
    },
    paymentMethodTitle: {
        flex: 1,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(14),
        color: "#000",
        margin: 10
    },
    button: {
        paddingTop: 10,
        paddingRight: 20,
        paddingLeft: 20,
        paddingBottom: 10,
        color: "#fff",
        fontFamily: EDFonts.regular
    }
});

export default connect(
    state => {
        return {
            checkoutDetail: state.checkoutReducer.checkoutDetail,
            lan: state.userOperations.lan,
            currency: state.checkoutReducer.currency_symbol,
            paymentDetails: state.userOperations.paymentDetails || {},
            phoneNumber: state.userOperations.phoneNumberInRedux,
            user_id: state.userOperations.userIdInRedux,
            guestDetails: state.checkoutReducer.guestDetails,
            guestAddress: state.checkoutReducer.guestAddress
        };
    },
    dispatch => {
        return {
            saveCheckoutDetails: checkoutData => {
                dispatch(saveCheckoutDetails(checkoutData));
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveTableID: table_id => {
                dispatch(saveTableIDInRedux(table_id))
            },
            saveResID: table_id => {
                dispatch(saveResIDInRedux(table_id))
            },
        };
    }
)(PaymentGatewayContainer);

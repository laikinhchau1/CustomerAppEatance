import React from "react";
import { BackHandler, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CardFlip from "react-native-card-flip/CardFlip";
import { Icon } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationActions, NavigationEvents, StackActions } from "react-navigation";
import { connect } from "react-redux";
import NavigationService from "../../NavigationService";
import Assets from "../assets";
import EDCopyPasswordDialogue from "../components/EDCopyPasswordDialogue";
import EDForgotPassword from '../components/EDForgotPassword';
import EDPopupView from '../components/EDPopupView';
import EDRTLText from "../components/EDRTLText";
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from '../components/EDRTLView';
import EDThemeButton from "../components/EDThemeButton";
import EDUnderlineButton from '../components/EDUnderlineButton';
import { strings } from '../locales/i18n';
import { saveIsCheckoutScreen } from '../redux/actions/Checkout';
import { rememberLoginInRedux, saveAppleLogin, saveAppleToken, saveLanguageInRedux, saveSocialLoginInRedux, saveUserDetailsInRedux, saveUserFCMInRedux } from "../redux/actions/User";
import { saveUserFCM, saveUserLogin } from "../utils/AsyncStorageHelper";
import { showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from "../utils/EDFontConstants";
import { checkFirebasePermission } from "../utils/FirebaseServices";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { loginUser } from "../utils/ServiceManager";
import Validations from '../utils/Validations';

class LoginContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.validationsHelper = new Validations()
        this.countryCode = "91"

    }

    state = {
        phoneNumber: "",
        password: "",
        isLoading: false,
        modelVisible: false,
        firebaseToken: "",
        shouldPerformValidation: false,
        remember: true,
        phoneCode: '',
        modelPasswordVisible: false,
        passwordData: undefined,
        useEmail:
            this.props.navigation.state !== undefined &&
                this.props.navigation.state.params !== undefined &&
                this.props.navigation.state.params.useEmail !== undefined ?
                this.props.navigation.state.params.useEmail : false
    };

    async componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handlerBack);
        checkFirebasePermission(onSuccess => {
            this.setState({ firebaseToken: onSuccess })
            this.props.saveToken(onSuccess)

        }, (onFailure) => {
            console.log("Firebase token not allowed", onFailure)
        })

        if (this.props.countryArray !== undefined && this.props.countryArray !== null && this.props.countryArray[0] !== undefined && this.props.countryArray[0].phonecode !== undefined) {
            this.countryCode = this.props.countryArray[0].phonecode
        }
        if (this.state.useEmail == true) {
            this.cardView.flipX()
        }
    }
    componentWillUnmount() {
        this.backHandler.remove()
    }
    handlerBack = () => {
        this.navigateToBack()
        return true
    }
    toggleRemeber = () => {
        this.setState({ remember: !this.state.remember })
    }

    toggleView = () => {

        this.setState({ useEmail: !this.state.useEmail, shouldPerformValidation: false, phoneNumber: "" })
        this.cardView.flipX()
    }

    navigateToBack = () => {
        console.log("ischeckout::", this.props.isCheckout)
        this.setState({ shouldPerformValidation: false ,  phoneNumber: "", password: "",  })
        if (this.props.isCheckout) {
            this.props.saveIsCheckoutScreen(false)
        }
        this.props.navigation.goBack()
    }
    onCountrySelect = country => {
        debugLog("Country data :::::", country)
        this.countryCode = country.callingCode[0]
    }

    // RENDER METHOD
    render() {
        return (
            <KeyboardAwareScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, backgroundColor: EDColors.white }}
                // contentContainerStyle={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
                enableAutoAutomaticScroll={false}
                enableOnAndroid
                enabled
            >
                <Icon name={"arrow-back"}
                    onPress={this.navigateToBack}
                    size={25} color={EDColors.white} containerStyle={{ zIndex: 1, position: "absolute", top: 10 + (Platform.OS == "ios" ? initialWindowMetrics.insets.top : 0), left: 10 }} />
                {/* PARENT VIEW */}
                <View pointerEvents={this.state.isLoading ? "none" : "auto"} style={styles.commoneFlex} >
                <NavigationEvents onDidFocus={this.onDidFocus} />
                    {/* PROGRESS LOADER */}
                    {/* {this.state.isLoading ? <ProgressLoader /> : null} */}

                    {/* FORGOT PASSWORD DIALOGUE */}
                    {this.renderForgotPasswordDialogue()}
                    {this.onPasswordChangeSuccessDialogue()}
                    {/* TOP HEADER IMAGE */}
                    <Image defaultSource={Assets.bgSignup} source={Assets.bgSignup}
                        style={styles.logInImageStyle} />

                    {/* CHILD VIEW */}
                    <View style={styles.parentViewContainer}>

                        <EDRTLView style={styles.signInViewStyle} >

                            {/* TITLE */}
                            <Text style={styles.titleTextStyle} >
                                {strings("loginTitle")}
                            </Text>

                        </EDRTLView>

                        <View style={styles.loginView}>
                            <CardFlip
                                clickable={false}
                                flip={this.state.useEmail}
                                useNativeDriver={true}
                                flipHorizontal
                                ref={ref => this.cardView = ref}
                            >
                                {/* PHONE NUMBER / EMAIL */}
                                {this.state.useEmail ? null :
                                    <EDRTLTextInput
                                        textstyle={{ color: EDColors.black }}
                                        icon="call"
                                        countryData={this.props.countryArray}
                                        type={TextFieldTypes.phone}
                                        identifier={'phoneNumber'}
                                        onCountrySelect={this.onCountrySelect}
                                        placeholder={strings('phoneNumber')}
                                        onChangeText={this.textFieldTextDidChangeHandler}
                                        initialValue={this.state.phoneNumber}
                                        errorFromScreen={
                                            this.state.shouldPerformValidation
                                                ? this.validationsHelper.validateMobile(
                                                    this.state.phoneNumber,
                                                    strings('emptyPhone'),
                                                    this.countryCode
                                                )
                                                : ''
                                        }
                                    />}
                                {!this.state.useEmail ? null :
                                    <EDRTLTextInput
                                        icon="email"
                                        textstyle={{ color: EDColors.black }}
                                        type={TextFieldTypes.email}
                                        identifier={'phoneNumber'}
                                        placeholder={strings('email')}
                                        onChangeText={this.textFieldTextDidChangeHandler}
                                        initialValue={this.state.phoneNumber}
                                        errorFromScreen={
                                            this.state.shouldPerformValidation
                                                ? this.validationsHelper.validateEmail(
                                                    this.state.phoneNumber,
                                                    strings('emptyEmail'),
                                                )
                                                : ''
                                        }
                                    />
                                }
                            </CardFlip>
                            {/* PASSWORD */}
                            <EDRTLTextInput
                                textstyle={styles.textStyle}
                                icon="lock"
                                type={TextFieldTypes.password}
                                identifier={'password'}
                                placeholder={strings('password')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.password}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validateLoginPassword( //check it for text
                                            this.state.password,
                                            strings('emptyPassword')
                                        )
                                        : ''
                                }
                            />
                            <EDRTLView style={styles.rememberBox}>

                                {/* REMEMBER ME */}
                                <TouchableOpacity
                                    onPress={this.toggleRemeber}
                                    style={{ flex: 1, marginRight: isRTLCheck() ? 0 : 5 }}
                                >
                                    <EDRTLView style={{
                                        alignItems: "center",
                                    }}>
                                        <Icon name={this.state.remember ? "check-square" : "square"} type={'feather'} color={EDColors.blackSecondary} size={getProportionalFontSize(15)} />
                                        <EDRTLText title={strings("rememberMe")} style={styles.rememberText} numberOfLines={2} />
                                    </EDRTLView>
                                </TouchableOpacity>

                                {/* FORGOT PASSWORD */}
                                <EDUnderlineButton
                                    buttonStyle={[styles.buttonStyle, { marginLeft: isRTLCheck() ? 0 : 5 }]}
                                    viewStyle={styles.underLineTxt}
                                    textStyle={styles.touchableTextStyle}
                                    onPress={this._onForgotPasswordPressed}
                                    label={strings('forgotPassword') + '?'}
                                />


                            </EDRTLView>
                            {/* SIGN IN AND SIGN UP TEXT */}
                            <View style={styles.signInBottomViewStyle} >

                                {/* SIGN IN BUTTON */}
                                <EDThemeButton
                                    isLoading={this.state.isLoading}
                                    isLoadingPermission={this.state.isLoading}
                                    label={strings("loginTitle")}
                                    style={styles.edThemeButtonStyle}
                                    textStyle={styles.edButtonTextStyle}
                                    onPress={this._signInPressed} />

                                <EDUnderlineButton
                                    buttonStyle={[styles.buttonStyle, { marginTop: 5, marginBottom: 15 }]}
                                    viewStyle={styles.underLineSignUpTxt}
                                    style={styles.textStyle}
                                    textStyle={[styles.touchableTextStyle, { color: EDColors.black, fontSize: getProportionalFontSize(16), textDecorationLine: 'underline' }]}
                                    onPress={this.toggleView}
                                    label={this.state.useEmail ? strings('signWithPhone') : strings('signWithEmail')}
                                />




                                {/* SIGN UP BUTTON */}
                                <View style={{ marginVertical: 10 }} >
                                    <EDUnderlineButton
                                        buttonStyle={[styles.buttonStyle, { marginTop: 30 }]}
                                        viewStyle={styles.underLineSignUpTxt}
                                        style={styles.textStyle}
                                        textStyle={[styles.touchableTextStyle, { color: EDColors.black, fontSize: getProportionalFontSize(16), textDecorationLine: 'underline' }]}
                                        onPress={this._onSignUpPressed}
                                        title={strings("dontHaveAccount")}
                                        label={strings("signUpTitle")} />
                                    {/* </EDRTLView> */}
                                </View>
                            </View>


                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        );
    }
    //#endregion

    //#region 
    /** FORGOT PASSWORD HANDLER */
    _onForgotPasswordPressed = () => {
        this.setState({ modelVisible: true })
    }
    //#endregion

    //#region 
    /** ON SIG UP HANDLER */
    _onSignUpPressed = () => {
        this.setState({ shouldPerformValidation: false ,  phoneNumber: "", password: "",  })
        this.props.navigation.navigate("SignupContainer");
    }
    //#endregion

    //#region TEXT CHANGE EVENTS
    /**
     * @param {Value of textfield whatever user type} value
     ** @param {Unique identifier for every text field} identifier
     */
    textFieldTextDidChangeHandler = (value, identifier) => {
        var newText = value
        if (!this.state.useEmail && identifier == "phoneNumber") {
            newText = value.replace(/[^0-9\\]/g, "");
        }
        this.state[identifier] = newText
        this.setState({ shouldPerformValidation: false })
    }

    /** RENDER LOGOUT DIALOGUE */
    renderForgotPasswordDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.modelVisible}>
                <EDForgotPassword
                    lan={this.props.lan}
                    onDismissHandler={this.onDismissForgotPasswordHandler}
                    title={strings('logoutConfirm')}
                    countryArray={this.props.countryArray}
                    countryCode={this.countryCode}
                    onPasswordChange={this.onPasswordChange}
                />
            </EDPopupView>
        )
    }
    //#endregion
    onPasswordChange = (objSuccess, code, phNo) => {
        // this.setState({modelPasswordVisible : true , passwordData : "data"})
        showValidationAlert(objSuccess.message)
      
    }
    onDismissHandler = () => {
        this.setState({ modelPasswordVisible: false, passwordData: undefined })
    }

    onPasswordChangeSuccessDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.modelPasswordVisible}>
                <EDCopyPasswordDialogue
                    data={this.state.passwordData}
                    onDismissHandler={this.onDismissHandler}
                />
            </EDPopupView>
        )
    }



    //#region FORGOT PASSWORD BUTTON EVENTS
    onDismissForgotPasswordHandler = () => {
        this.setState({ modelVisible: false })
    }
    //#endregion

    /** SIGN IN PRESSED */
    _signInPressed = () => {
        this.setState({ shouldPerformValidation: true })
        if (!this.state.useEmail) {
            if (this.validationsHelper.validateMobile(
                this.state.phoneNumber,
                strings("emptyPhone"),
                this.countryCode
            ).trim() == "" && this.state.password.trim().length > 0) {
                this.callLoginAPI();
            }
        }
        else {
            if (this.validationsHelper.validateEmail(
                this.state.phoneNumber,
                strings("emptyEmail")
            ).trim() == "" && this.state.password.trim().length > 0) {
                this.callLoginAPI();
            }
        }
    }

   

    //#region NETWORK API 
    /**
     * @param { Success response object } onSuccess
     */
    onSuccessLogin = (onSuccess) => {
        this.setState({ isLoading: false });
        console.log("Login Detail ::::::::: ", onSuccess)
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("generalWebServiceError")
            );
        }


        // this.props.saveCredentials(onSuccess.login);
        // this.props.saveSocialLogin(false)

        // // Remember login for future use
        // this.props.rememberLogin(this.state.remember)
        // this.props.saveAppleLogin(false)

        // // Save login in async if remember me is selected
        // if (this.state.remember)
        //     saveUserLogin(onSuccess.login, success => { }, errAsyncStore => { });

        // if (this.props.isCheckout) {
        //     this.props.saveIsCheckoutScreen(false)
        //     NavigationService.navigateToSpecificRoute("CartContainer")
        // } else {
        //     this.props.saveToken(this.state.firebaseToken)
        //     saveUserFCM(this.state.firebaseToken, success => { }, failure => { })
        //     this.props.navigation.dispatch(
        //         StackActions.reset({
        //             index: 0,
        //             actions: [
        //                 NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
        //             ]
        //         })
        //     );
        // }
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("general.generalWebServiceError")
            );
        }
        else if (onSuccess.status == 0) {
            showValidationAlert(onSuccess.message);


        }
        else if (onSuccess.status == RESPONSE_SUCCESS) {
          
            this.props.saveCredentials(onSuccess.login);
            this.props.saveSocialLogin(false)

            // Remember login for future use
            this.props.rememberLogin(this.state.remember)
            this.props.saveAppleLogin(false)

            // Save login in async if remember me is selected
            if (this.state.remember)
                saveUserLogin(onSuccess.login, success => { }, errAsyncStore => { });
            console.log('checkout::', this.props.isCheckout)
            if (this.props.isCheckout) {
                this.props.saveIsCheckoutScreen(false)
                NavigationService.navigateToSpecificRoute("CartContainer")
            } else {
                this.props.saveToken(this.state.firebaseToken)
                saveUserFCM(this.state.firebaseToken, success => { }, failure => { })
                this.props.navigation.dispatch(
                    StackActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                        ]
                    })
                );
            }
        } else {
            showValidationAlert(onSuccess.message);
        }
    }

    /**
     * @param { Failure response objetc } onFailure
     */
    onFailureLogin = (onFailure) => {
        this.setState({ isLoading: false });
        showValidationAlert(strings("generalWebServiceError"));
    }

    /** 
     * LOGIN API 
     */
    callLoginAPI() {
        console.log("FIRST FIREBASE TOKEN ::::::::" + this.state.firebaseToken);
        netStatus(status => {
            if (status) {

                this.setState({ isLoading: true });

                let params = {
                    language_slug: this.props.lan,
                    Password: this.state.password,
                    firebase_token: this.state.firebaseToken,
                    phone_code: this.countryCode
                }
                params[this.state.useEmail ? 'Email' : 'PhoneNumber'] = this.state.phoneNumber
                loginUser(params, this.onSuccessLogin, this.onFailureLogin, this.props);
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }

    
    //#endregion

}

const styles = StyleSheet.create({
    loginView: { marginHorizontal: 20, marginTop: 0, marginBottom: getProportionalFontSize(20) },
    parentViewContainer: { flex: 1, width: "100%", height: "100%" },
    socialView: { alignSelf: 'center', marginTop: 10, justifyContent: "center" },
    socialTextView: { flexDirection: 'row', alignSelf: 'center', marginBottom: 20 },
    lineText: { fontSize: getProportionalFontSize(14), fontFamily: EDFonts.regular, color: EDColors.txtplaceholder },
    appleIconStyle: { height: getProportionalFontSize(50), width: getProportionalFontSize(50), borderRadius: 50, marginTop: 7, marginLeft: 5 },
    socialSubView: { justifyContent: 'space-evenly', width: metrics.screenWidth * 0.65, alignItems: 'center', alignSelf: 'center' },
    lineStyle: { height: 0.5, backgroundColor: EDColors.txtplaceholder, width: getProportionalFontSize(130), alignSelf: 'center' },
    iconStyle: { width: metrics.screenWidth, alignSelf: "center", height: metrics.screenHeight * 0.20, marginBottom: -10 },
    titleTextStyle: { color: EDColors.black, fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(28), alignSelf: "flex-start", marginTop: getProportionalFontSize(50) },
    buttonStyle: { marginBottom: 0, },
    touchableTextStyle: { fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semiBold, color: EDColors.black },
    textStyle: { color: EDColors.black, fontSize: getProportionalFontSize(16), marginTop: 0, },
    signInViewStyle: { borderRadius: 32, marginTop: -32, backgroundColor: EDColors.white, paddingHorizontal: 20 },
    signInBottomViewStyle: { alignSelf: "center", marginTop: 10 },
    edThemeButtonStyle: { alignSelf: 'center', width: metrics.screenWidth * 0.9, borderRadius: 16, marginBottom: 20, height: metrics.screenHeight * 0.07 },
    edButtonTextStyle: { fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semiBold },
    underLineTxt: { borderBottomColor: EDColors.black },
    underLineSignUpTxt: { borderBottomColor: EDColors.white },

    rememberBox: {
        alignItems: "center",
        marginVertical: getProportionalFontSize(20),
        marginTop: getProportionalFontSize(30),
        // alignContent: 'space-between',
        justifyContent: "space-between"
    },
    rememberText: { color: EDColors.blackSecondary, fontSize: getProportionalFontSize(14), marginHorizontal: 5, fontFamily: EDFonts.semiBold },
    SocialIcon: {
        borderRadius: 0, width: metrics.screenWidth * 0.65,
        height: heightPercentageToDP('6.0%'),
        borderRadius: 5,
        marginTop: 10,
    },
    commoneFlex: { flex: 1, backgroundColor: EDColors.white },
    logInImageStyle: { height: metrics.screenHeight * 0.36, width: "100%", },
})

// CONNECT FUNCTION
export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            isShowSocial: state.userOperations.isShowSocial,
            isCheckout: state.checkoutReducer.isCheckout,
            countryArray: state.userOperations.countryArray,
        };
    },
    dispatch => {
        return {
            saveCredentials: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
            },
            saveToken: token => {
                dispatch(saveUserFCMInRedux(token))
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            },
            rememberLogin: data => {
                dispatch(rememberLoginInRedux(data))
            },
            saveSocialLogin: bool => {
                dispatch(saveSocialLoginInRedux(bool))
            },
            saveIsCheckoutScreen: data => {
                dispatch(saveIsCheckoutScreen(data));
            },
            saveAppleLogin: boolean => {
                dispatch(saveAppleLogin(boolean))
            },
            saveAppleToken: token => {
                dispatch(saveAppleToken(token))
            }
        };
    }
)(LoginContainer);

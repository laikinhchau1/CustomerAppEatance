import React from "react";
import { Platform } from "react-native";
import { BackHandler, Image, StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationActions, NavigationEvents, StackActions } from "react-navigation";
import { connect } from "react-redux";
import NavigationService from "../../NavigationService";
import Assets from "../assets";
import EDProfilePicture from '../components/EDProfilePicture';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import EDUnderlineButton from '../components/EDUnderlineButton';
import { strings } from "../locales/i18n";
import { saveIsCheckoutScreen } from "../redux/actions/Checkout";
import { rememberLoginInRedux, saveAppleLogin, saveSocialLoginInRedux, saveUserDetailsInRedux, saveUserFCMInRedux } from "../redux/actions/User";
import { saveUserFCM, saveUserLogin } from "../utils/AsyncStorageHelper";
import { showDialogue, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, getProportionalFontSize, isRTLCheck, isVerificationRequired, RESPONSE_SUCCESS, TextFieldTypes } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { checkFirebasePermission } from "../utils/FirebaseServices";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { registerUser } from "../utils/ServiceManager";
import Validations from '../utils/Validations';

class SignupContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    /** CONTRUCTOR */
    constructor(props) {
        super(props);

        this.validationsHelper = new Validations()
        this.avatarSource = undefined
        this.countryCode = ""

    }

    /** STATE */
    state = {
        strFullName: "",
        strLastName: "",
        strPhone: "",
        strPassword: "",
        strEmail: "",
        isLoading: false,
        firebaseToken: "",
        shouldPerformValidation: false,
        shouldPerformEmailValidation: false
    };

    /** DID MOUNT */
    async componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handlerBack);
        checkFirebasePermission(onSuccess => {
            this.setState({ firebaseToken: onSuccess });
            this.props.saveToken(onSuccess)

        }, () => {

        })

        if (this.props.countryArray !== undefined && this.props.countryArray !== null && this.props.countryArray[0] !== undefined && this.props.countryArray[0].phonecode !== undefined) {
            this.countryCode = this.props.countryArray[0].phonecode
        }
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    handlerBack = () => {
        this.navigateToBackHandler()
        return true
    }
    navigateToBackHandler = () => {
        this.setState({ strFullName: '', strLastName: '', strPhone: '', strPassword: '', strEmail: ''})
        this.setState({ shouldPerformValidation: false, shouldPerformEmailValidation: false })
        this.props.navigation.goBack()
    }

    onDidFocus = () => { }

    onCountrySelect = country => {
        this.countryCode = country.callingCode[0]
    }

    /** RENDER METHOD */
    render() {
        return (


            <KeyboardAwareScrollView style={{ flex: 1 }}
                bounces={false}
                // extraScrollHeight={64}
                keyboardShouldPersistTaps="handled"
                // behavior="padding"
                showsVerticalScrollIndicator={false}
                enabled
                enableAutoAutomaticScroll={false}
                enableOnAndroid={true}
            >
                <Icon name={"arrow-back"}
                onPress={this.navigateToBackHandler}
                size={25} color={EDColors.white} containerStyle={{ zIndex: 1, position: "absolute", top: 10 + (Platform.OS == "ios" ? initialWindowMetrics.insets.top : 0), left: 10 }} />

                <View style={styles.commoneFlex} pointerEvents={this.state.isLoading ? "none" : "auto"} >

                    {/* PROGRESS LOADER */}
                    {/* {this.state.isLoading ? <ProgressLoader /> : null} */}

                    {/* NAVIGATION EVENTS */}
                    <NavigationEvents onDidFocus={this.onDidFocus} />
                    {/* TOP HEADER IMAGE */}
                    <Image defaultSource={Assets.bgSignup} source={Assets.bgSignup}
                        style={styles.signUpImageStyle} />

                    {/* PARENT VIEW */}
                    <View style={styles.parentViewContainer} >



                        {/* LOGO AND TITLE VIEW */}
                        <EDRTLView style={styles.childViewContainer}>

                            {/* TITLE */}
                            <Text
                                style={styles.titleTextStyle}>
                                {strings("signUpTitle")}
                            </Text>
                            {/* PROFILE IMAGE COMPONENT */}
                            <EDProfilePicture
                                imagePath={this.avatarSource}
                                onImageSelectionHandler={this.onImageSelectionHandler}
                            />

                        </EDRTLView>
                        {/* INPUT CONATINER  */}
                        <View style={styles.subView}>



                            {/* USERNAME */}
                            <EDRTLTextInput
                                textstyle={{ color: EDColors.black }}
                                icon="person"
                                type={TextFieldTypes.default}
                                identifier={'strFullName'}
                                placeholder={strings('firstName')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.strFullName}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.checkForEmpty(
                                            this.state.strFullName,
                                            strings('emptyName'),
                                        )
                                        : ''
                                }
                            />

                            {/* LAST NAME */}
                            <EDRTLTextInput
                                textstyle={{ color: EDColors.black }}
                                icon="person"
                                type={TextFieldTypes.default}
                                identifier={'strLastName'}
                                placeholder={strings('lastName')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.strLastName}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.checkForEmpty(
                                            this.state.strLastName,
                                            strings('emptyLastName'),
                                        )
                                        : ''
                                }
                            />
                            {/* PHONE NUMBER */}
                            <EDRTLTextInput
                                textstyle={{ color: EDColors.black }}
                                icon="call"
                                type={TextFieldTypes.phone}
                                countryData={this.props.countryArray}
                                identifier={'strPhone'}
                                onCountrySelect={this.onCountrySelect}
                                placeholder={strings('phoneNumber')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.strPhone}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validateMobile(
                                            this.state.strPhone,
                                            strings('emptyPhone'),
                                            this.countryCode
                                        )
                                        : ''
                                }
                            />

                            <EDRTLTextInput
                                icon="email"
                                textstyle={{ color: EDColors.black }}
                                type={TextFieldTypes.email}
                                identifier={'strEmail'}
                                placeholder={strings('emailOptional')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.strEmail}
                                errorFromScreen={
                                    this.state.shouldPerformEmailValidation
                                        ? this.validationsHelper.validateEmail(
                                            this.state.strEmail,
                                            strings("emailValidate"),
                                        )
                                        : ''
                                }
                            />

                            {/* PASSWORD */}
                            <EDRTLTextInput
                                icon="lock"
                                textstyle={{ color: EDColors.black }}
                                type={TextFieldTypes.password}
                                identifier={'strPassword'}
                                placeholder={strings('password')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                initialValue={this.state.strPassword}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validatePassword(
                                            this.state.strPassword,
                                            strings('emptyPassword')
                                        )
                                        : ''
                                }
                            />


                            {/* BOTTOM VIEW */}
                            <View style={styles.bottomParentView} >

                                {/* SIGN UP BUTTON */}
                                <EDThemeButton
                                    label={strings("signUpTitle")}
                                    style={styles.edButtonStyle}
                                    onPress={this._onPressSignUp}
                                    isLoading={this.state.isLoading}
                                    isLoadingPermission={this.state.isLoading}
                                />

                                {/* SIGN IN BUTTON */}
                                <EDUnderlineButton
                                    viewStyle={styles.bottomBorderColor}
                                    buttonStyle={[styles.buttonStyle, { marginBottom: 10, borderBottomWidth: 0 }]}
                                    style={styles.textStyle}
                                    textStyle={styles.touchableTextStyle}
                                    onPress={this.navigateToBack}
                                    title={strings("alreadyHaveAccount")}
                                    label={" " + strings("loginTitle")}
                                />
                            </View>
                        </View>
                    </View>
                </View>

            </KeyboardAwareScrollView>
        );
    }
    //#endregion

    /**
*
* @param {The image response received from image picker} imageSource
*/
    onImageSelectionHandler = imageSource => {
        debugLog("IMAGE SOURCE ::::::", imageSource)
        this.avatarSource = imageSource;
    };

    //#region BUTTON EVENT HANDLER
    /** 
     * 
     */
    _onPressSignUp = () => {

        this.setState({ shouldPerformValidation: true })
        if (this.state.strFullName.trim().length > 0 &&
            this.state.strLastName.trim().length > 0 &&
            this.validationsHelper
                .validateMobile(
                    this.state.strPhone,
                    strings("emptyPhone"),
                    this.countryCode
                )
                .trim() == "" &&
            // this.state.strEmail.trim().length > 0 &&
            this.state.strPassword.trim().length > 0 &&
            this.validationsHelper
                .validatePassword(
                    this.state.strPassword,
                    strings("passwordValidationString")
                )
                .trim() == ""
            //      &&
            // this.validationsHelper
            //     .validateEmail(
            //         this.state.strEmail,
            //         strings("emailValidate")
            //     )
            //     .trim() == ""
        ) {
            // if (this.avatarSource !== undefined)
            if (this.state.strEmail.trim() !== "") {
                console.log("email::", this.state.strEmail)
                if (this.validationsHelper
                    .validateEmail(
                        this.state.strEmail,
                        strings("emailValidate")
                    )
                    .trim() == "") {
                    this.callRegistrationAPI()
                } else {
                    this.setState({ shouldPerformEmailValidation: true })
                }
            }
            else {
                this.callRegistrationAPI()
            }
            // else
            //     showValidationAlert(strings('general.imageEmpty'))
        } else { return }
    }
    //#endregion

    //#region TEXT CHANGE EVENTS
    /**
     * @param {Value of textfield whatever user type} value
     ** @param {Unique identifier for every text field} identifier
     */
    textFieldTextDidChangeHandler = (value, identifier) => {
        var newText = value
        if (identifier == "strPhone") {
            newText = value.replace(/[^0-9\\]/g, "");
        }
        this.state[identifier] = newText
        this.setState({ shouldPerformValidation: false, shouldPerformEmailValidation: false })
    }
    //#endregion

    //#region NETWORK API 
    /**
     * @param { Success response object } onSuccess
     */
    onSuccessRegistration = (onSuccess) => {
        
        this.setState({ isLoading: false });
        if (onSuccess != undefined) {
            console.log("Sucess REGISTRATION :::::::::: ", onSuccess)
            if (onSuccess.status == RESPONSE_SUCCESS) {
                if (!isVerificationRequired) {
                    this.props.saveCredentials(onSuccess.User);
                    this.props.saveSocialLogin(false)
                    this.props.rememberLogin(true)
                    this.props.saveAppleLogin(false)
                    saveUserLogin(onSuccess.User, success => { }, errAsyncStore => { });
                    this.props.saveToken(this.state.firebaseToken)
                    saveUserFCM(this.state.firebaseToken, success => { }, failure => { })
                    if (this.props.isCheckout) {
                        this.props.saveIsCheckoutScreen(false)
                        NavigationService.navigateToSpecificRoute("CartContainer")
                    }
                    this.props.navigation.dispatch(
                        StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                            ]
                        })
                    );
                }
               
            }
            else
                showValidationAlert(onSuccess.message);

        }
        else
            showValidationAlert(strings("generalWebServiceError"));
    }

    /**
     * @param { Failure response objetc } onFailure
     */
    onFailureRegistration = (onFailure) => {
        console.log('::::: FAILED SIG UP', onFailure)
        this.setState({ isLoading: false });
        showValidationAlert(onFailure.message || strings("generalWebServiceError"));
    }

    /** 
     * REGISTRATION API 
     */
    callRegistrationAPI() {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                let param = {
                    language_slug: this.props.lan,
                    FirstName: this.state.strFullName,
                    LastName: this.state.strLastName,
                    PhoneNumber: this.state.strPhone,
                    Password: this.state.strPassword,
                    Email: this.state.strEmail,
                    firebase_token: this.state.firebaseToken,
                    image: this.avatarSource,
                    phone_code: this.countryCode
                }
                registerUser(param, this.onSuccessRegistration, this.onFailureRegistration, this.props);
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    //#endregion

    navigateToBack = () => {
        this.setState({ strFullName: '', strLastName: '', strPhone: '', strPassword: '', strEmail: '', strCoupon: '' })
        this.setState({ shouldPerformValidation: false, shouldPerformEmailValidation: false })
        this.props.navigation.navigate("LoginContainer")
    }



}

const styles = StyleSheet.create({
    signUpImageStyle: { height: metrics.screenHeight * 0.36, width: "100%", },
    parentViewContainer: { flex: 1, width: "100%", height: "100%", },
    childViewContainer: { borderRadius: 32, justifyContent: 'space-between', marginTop: - getProportionalFontSize(32), backgroundColor: EDColors.white, paddingHorizontal: 18, paddingTop: getProportionalFontSize(50), paddingBottom: getProportionalFontSize(5) },
    titleTextStyle: { color: EDColors.black, fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(28), alignSelf: 'center', },
    buttonStyle: { alignSelf: 'center', marginTop: 10 },
    touchableTextStyle: { color: EDColors.black, fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(16), textDecorationLine: 'underline' },
    subView: { marginHorizontal: 20, marginTop: 0, marginBottom: 20 },
    bottomParentView: { alignSelf: "center", marginTop: 20, flex: 1, width: "100%" },
    edButtonStyle: { alignSelf: 'center', width: '100%', height: heightPercentageToDP('6%'), borderRadius: 16 },
    textStyle: { color: EDColors.blackSecondary, fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16), marginVertical: 10 },
    bottomBorderColor: { borderBottomColor: EDColors.transparent, marginVertical: 10 },
    commoneFlex: { flex: 1, backgroundColor: EDColors.white }
})

// CONNECT FUNCTION
export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            code: state.userOperations.code,
            countryArray: state.userOperations.countryArray,
            isCheckout: state.checkoutReducer.isCheckout,
        };
    },
    dispatch => {
        return {
            saveToken: token => {
                dispatch(saveUserFCMInRedux(token))
            },
            saveCredentials: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
            },
            saveSocialLogin: bool => {
                dispatch(saveSocialLoginInRedux(bool))
            },
            rememberLogin: data => {
                dispatch(rememberLoginInRedux(data))
            },
            saveAppleLogin: boolean => {
                dispatch(saveAppleLogin(boolean))
            },
            saveIsCheckoutScreen: data => {
                dispatch(saveIsCheckoutScreen(data));
            },
        };
    }
)(SignupContainer);
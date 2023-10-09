/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Clipboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast, { DURATION } from "react-native-easy-toast";
import { Icon } from 'react-native-elements';
import { strings } from '../locales/i18n';
import { showNoInternetAlert, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import { forgotPassword } from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import EDRTLText from './EDRTLText';
import EDRTLTextInput from './EDRTLTextInput';
import EDRTLView from './EDRTLView';
import EDThemeButton from './EDThemeButton';


export default class EDForgotPassword extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.validationsHelper = new Validations();
        this.countryCode = this.props.countryCode
    }

    copyToClipboard = (text) => {
        this.refs.toast.show(strings("copyPassword"), DURATION.LENGTH_SHORT);
        Clipboard.setString(text)
    }

    render() {
        return (
            <View style={styles.modalContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <Toast ref="toast" position="center" fadeInDuration={0} />
                <View style={styles.modalSubContainer}>
                    <EDRTLView style={styles.headerView}>
                        <EDRTLText style={{ flex: 1, color: EDColors.black, textAlign: 'center' }} title={strings('forgotPassword')} />
                        <TouchableOpacity onPress={this.props.onDismissHandler} style={[styles.closeOpacityStyle, { alignSelf: isRTLCheck() ? 'flex-start' : 'flex-end' }]}>
                            <Icon
                                name={"close"}
                                size={getProportionalFontSize(20)}
                                color={EDColors.black}
                            />
                        </TouchableOpacity>
                    </EDRTLView>
                    {this.state.isPasswordVisible ?
                        <View>
                            <EDRTLText style={styles.forgotPasswordTxt} title={this.state.strForgotPassword} />
                        </View>
                        :
                        <View>
                            {/* EMAIL INPUT */}
                            <EDRTLTextInput
                                icon="email"
                                textstyle={{ marginHorizontal: 24 }}
                                style={{ marginHorizontal: 24 }}
                                errorStyle={{ marginHorizontal: 24 }}
                                containerStyle={{ marginTop: 0, overflow: "hidden" }}
                                type={TextFieldTypes.email}
                                initialValue={this.state.email}
                                autoFocus={true}
                                placeholder={strings('email')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.validateEmail(
                                            this.state.email,
                                            strings('emptyEmail'),
                                        )
                                        : ''
                                }
                                errorMessageStyle={{ marginHorizontal: 24 }}
                            />
                            {/* <EDRTLTextInput
                                textstyle={{ color: EDColors.black }}
                                icon="call"
                                countryData={this.props.countryArray}
                                textstyle={{ marginHorizontal: 24 }}
                                style={{ marginHorizontal: 24 }}
                                errorStyle={{ marginHorizontal: 24 }}
                                containerStyle={{ marginTop: 0, overflow: "hidden" }}
                                type={TextFieldTypes.phone}
                                identifier={'phoneNumber'}
                                autoFocus={true}
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
                                errorMessageStyle={{ marginHorizontal: 24 }}
                            /> */}

                            <EDThemeButton
                                label={strings('submitButton')}
                                isLoadingPermission={this.state.isLoading}
                                onPress={this.onSubmitButtonHandler}
                                isRadius={true}
                            />
                        </View>
                    }
                </View>
            </View>
        );
    }

    state = {
        shouldPerformValidation: false,
        isLoading: false,
        email: '',
        isPasswordVisible: false,
        strForgotPassword: "",
        phoneNumber: ''
    }

    // ON COUNTRY SELECT
    onCountrySelect = country => {
        debugLog("Country data :::::", country)
        this.countryCode = country.callingCode[0]
    }

    //#region TEXT CHANGE EVENTS
    textFieldTextDidChangeHandler = (newNumber) => {
        this.setState({ shouldPerformValidation: false, email: newNumber });
    }
    //#endregion

    //#region BUTTON EVENTS
    onSubmitButtonHandler = () => {
        this.setState({ shouldPerformValidation: true });
        if (this.validationsHelper.validateEmail(this.state.email, strings('emptyEmail'))) {
            return;
        }

        this.callForgotPasswordAPI();
    }
    //#endregion

    //#region NETWORK
    /**
    *
    * @param {The success response object} objSuccess
    */
    onForgotPasswordSuccess = objSuccess => {

        if (objSuccess !== undefined) {
            if (objSuccess.status === RESPONSE_SUCCESS) {

                this.setState({
                    isLoading: false,
                    // isPasswordVisible: true,
                    strForgotPassword: objSuccess.message
                })
                // showValidationAlert(objSuccess.message)
                this.props.onPasswordChange(objSuccess, this.countryCode, this.state.phoneNumber)
                this.props.onDismissHandler()
            } else {
                showValidationAlert(objSuccess.message)
                this.setState({ isLoading: false });
            }
        } else {
            showValidationAlert(strings("generalWebServiceError"))
            this.setState({ isLoading: false });
        }
    }

    /**
    *
    * @param {The success response object} objSuccess
    */
    onForgotPasswordFailure = objFailure => {
        this.setState({ isLoading: false });
        showValidationAlert(objFailure.message);
    }


    callForgotPasswordAPI = () => {
        netStatus(isConnected => {
            if (isConnected) {
                let objForgotPasswordParams = {
                    language_slug: this.props.lan,
                    Email: this.state.email
                    // phone_code: this.countryCode,
                    // phone_number: this.state.phoneNumber
                    // phoneNumber:this.state.phoneNumber,
                    // countryCode: this.countryCode
                };
                this.setState({ isLoading: true });
                forgotPassword(objForgotPasswordParams, this.onForgotPasswordSuccess, this.onForgotPasswordFailure, this.props);
            } else {
                showNoInternetAlert();
            }
        });
    }
    //#endregion

    copyPasswordHandler = () => {
        this.copyToClipboard(this.state.strForgotPassword)
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: EDColors.transparent,
    },
    modalSubContainer: {
        backgroundColor: EDColors.white,
        padding: 10,
        marginHorizontal: 20,
        borderRadius: 6,
        marginTop: 20,
        marginBottom: 20,
        paddingBottom: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    headerView: {
        alignItems: 'center'
    },
    closeImageStyle: {
        width: 15, height: 15, tintColor: EDColors.primary
    },
    passwordText: {
        color: EDColors.black,
        fontSize: 16,
        paddingVertical: 5,
        fontFamily: EDFonts.regular,
        marginHorizontal: 10
    },
    passwordView: {
        marginHorizontal: 10, marginBottom: 10
    },
    forgotPasswordTxt: {
        fontSize: 16, marginHorizontal: 10
    },
    closeOpacityStyle: {
        padding: 10
    }
});

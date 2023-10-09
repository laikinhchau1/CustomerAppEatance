import React from 'react';
import { AppState, Linking, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Toast from "react-native-easy-toast";
import { Icon } from 'react-native-elements';
import Share from "react-native-share";
import { connect } from 'react-redux';
import EDProfilePicture from '../components/EDProfilePicture';
import EDRTLText from '../components/EDRTLText';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from '../components/EDRTLView';
import ProgressLoader from '../components/ProgressLoader';
import { strings } from '../locales/i18n';
import { saveCartCount } from '../redux/actions/Checkout';
import { saveLanguageInRedux, saveUserDetailsInRedux, saveUserFCMInRedux } from '../redux/actions/User';
import { flushAllData, getUserFCM, saveLanguage, saveUserFCM, saveUserLogin } from '../utils/AsyncStorageHelper';
import { showDialogue, showDialogueNew, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { boldify, debugLog, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { checkFirebasePermission } from '../utils/FirebaseServices';
import metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { deleteUser, qrPoints, updateProfile } from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import BaseContainer from './BaseContainer';

// const APP_STORE_LINK = this.props.storeURL.app_store_url;
// const PLAY_STORE_LINK = this.props.storeURL.play_store_url;

class ProfileContainer extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.firebaseOff = false;
        this.qr_points = 0
        this.validationsHelper = new Validations()

        this.state = {
            isLoading: false,
            ImageSource: this.props.image || undefined,
            isNotification: this.props.notification === '0' ? false : true,
            firstName: this.props.firstName || '',
            lastName: this.props.lastName || '',
            PhoneNumber: this.props.token || '',
            phoneCode: this.props.phoneCode || '',
            email: this.props.email || '',
            txtFocus: false,
            appState: AppState.currentState,
            firebaseToken: '',
        };
    }

    componentDidMount() {
        this.checkPushPermission();
        // this.getUserqrPoint();
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    /**
      * @param { Applications status Active or Background } nextAppState
      */
    _handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.getToken();
        }
        this.setState({ appState: nextAppState });
    };
    //#endregion
    checkPushPermission = () => {
        getUserFCM(
            success => {
                if (success.length > 0) {
                    this.firebaseOff = false;
                } else {
                    this.firebaseOff = true;
                    this.setState({ isNotification: false });
                    this.getToken();
                }
            },
            failure => {
                this.firebaseOff = true;
                this.setState({ isNotification: false });
            }
        );
    };

    getUserqrPoint = () => {
        let qrParams = {
            // token: this.props.token,
            user_id: this.props.userID || 0,
        }
        this.setState({ isLoading: true })
        qrPoints(
            qrParams,
            this.onSuccessqrPoints,
            this.onFailureqrPoints
        )
    }
    //#endregion

    onSuccessqrPoints = (onSuccess) => {
        if (onSuccess.status == RESPONSE_SUCCESS) {
            this.qr_points = onSuccess.EarningPoints

        } else {
            showValidationAlert(onSuccess.message);
        }
        this.setState({ isLoading: false })
    }

    onFailureqrPoints = () => {
        this.setState({ isLoading: false })
        showValidationAlert(strings("generalWebServiceError"));
    }

    /** DID MOUNT */
    getToken = () => {
        if (
            this.props.firebaseToken === undefined ||
            this.props.firebaseToken === null ||
            this.props.firebaseToken === ''
        ) {
            checkFirebasePermission(
                onSuccess => {
                    this.props.saveToken(onSuccess);
                    this.firebaseOff = false;
                    this.setState({ firebaseToken: onSuccess });
                    saveUserFCM(onSuccess, success => { }, failure => { });
                },
                error => {
                    this.firebaseOff = true;
                }
            );
        } else {
            this.firebaseOff = false;
            this.props.saveToken(this.props.firebaseToken);
            saveUserFCM(this.props.firebaseToken, success => { }, failure => { });
            this.setState({ firebaseToken: this.props.firebaseToken });
        }
    };

    onDeletePress = () => {
        showDialogue(
            strings('deleteAccountConfirm'),
            [{ text: strings('dialogYes'), onPress: this.callDeleteAPI }],
            strings('appName'),
            () => { }
            ,
            strings('dialogNo'),
            true
        );
    }

    //#endregion

    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings('myAccount')}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[{ url: 'done', type: 'MaterialIcons' }]}
                onRight={this.onRightEventHandler}
                onLeft={this.onBackEventHandler}>

                {/* PROGRESS LOADER */}
                {this.state.isLoading ? <ProgressLoader /> : null}

                {/* TOAST */}
                <Toast ref="toast" position="center" fadeInDuration={0} />

                {/* MAIN CONTAINER */}
                <View style={{ flex: 1 }}>


                    {/* SCROLL VIEW */}
                    <ScrollView>

                        {/* PROFILE IMAGE COMPONENT */}
                        <EDProfilePicture
                            imagePath={this.state.ImageSource}
                            onImageSelectionHandler={this.onImageSelectionHandler}
                        />

                        {/* CHILD VIEW CONTAINER */}
                        <View style={style.childViewContainer}>

                            {this.state.PhoneNumber !== undefined && this.state.PhoneNumber != '' ? (
                                <EDRTLTextInput
                                    type={TextFieldTypes.default}
                                    countryData={this.props.countryArray}
                                    dialCode={this.state.phoneCode}
                                    icon="call"
                                    type={TextFieldTypes.phone}
                                    editableBox={false}
                                    initialValue={this.state.PhoneNumber}
                                    labelStyle={{ fontSize: getProportionalFontSize(12) }}
                                    placeholder={strings('phoneNumber')}
                                />
                            ) : null}

                            {/* EMAIL */}

                            <EDRTLTextInput
                                type={TextFieldTypes.default}
                                icon="email"
                                editableBox={this.props.isSocialLogin ? false : true}
                                labelStyle={{ fontSize: getProportionalFontSize(12) }}
                                initialValue={this.state.email}
                                onChangeText={this.onEmailtChangeHanlder}
                                placeholder={strings('email')}
                                customIcon={this.props.isSocialLogin ? null : "edit-3"}
                                customIconFamily={this.props.isSocialLogin ? null : 'feather'}
                                customIconColor={EDColors.grayNew}
                                focusOnPress={true}
                            />

                            {/* USER NAME */}

                            <EDRTLTextInput
                                type={TextFieldTypes.default}
                                icon="person"
                                identifier={'FirstName'}
                                labelStyle={{ fontSize: getProportionalFontSize(12) }}
                                initialValue={this.state.firstName}
                                onChangeText={this.onTextChangeHanlder}
                                placeholder={strings('firstName')}
                                customIcon={"edit-3"}
                                customIconFamily={'feather'}
                                customIconColor={EDColors.grayNew}
                                focusOnPress={true}
                            />

                            {/* LAST NAME */}
                            {this.props.lastName !== undefined ? (

                                <EDRTLTextInput
                                    type={TextFieldTypes.default}
                                    icon="person"
                                    identifier={'FirstName'}
                                    labelStyle={{ fontSize: getProportionalFontSize(12) }}
                                    initialValue={this.state.lastName}
                                    onChangeText={this.onLastTextChangeHanlder}
                                    placeholder={strings('lastName')}
                                    customIcon={"edit-3"}
                                    customIconFamily={'feather'}
                                    customIconColor={EDColors.grayNew}
                                    focusOnPress={true}
                                />
                            ) : null}

                            {/* ADDRESS */}
                            <EDRTLView style={style.addressView}>
                                <View >
                                    <Text style={style.placeholderText}>
                                        {strings('yourAddress')}
                                    </Text>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        style={{
                                            marginRight: isRTLCheck() ? 10 : 10,
                                            marginLeft: isRTLCheck() ? 10 : 0,
                                        }}
                                        onPress={this.onCustomIconPress}>
                                        <Icon
                                            type={'ant-design'}
                                            size={getProportionalFontSize(20)}
                                            onPress={this.onAddressEventHandler}
                                            name={isRTLCheck() ? 'left' : "right"}
                                            color={EDColors.grayNew} />
                                    </TouchableOpacity>
                                </View>
                            </EDRTLView>
                            {/* PASSWORD */}
                            {this.props.isSocialLogin ? null :
                                <EDRTLView style={style.passwordView}>
                                    <View >
                                        <Text style={style.placeholderText}>
                                            {strings('password')}
                                        </Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity
                                            style={{
                                                marginRight: isRTLCheck() ? 10 : 10,
                                                marginLeft: isRTLCheck() ? 10 : 0,
                                            }}
                                            onPress={this.onCustomIconPress}>
                                            <Icon
                                                type={'ant-design'}
                                                size={getProportionalFontSize(20)}
                                                onPress={this.onPasswordChangeHandler}
                                                name={isRTLCheck() ? 'left' : "right"}
                                                color={EDColors.grayNew} />
                                        </TouchableOpacity>
                                    </View>
                                </EDRTLView>
                            }

                            {/* NOTIFICATION */}
                            <EDRTLView style={style.passwordView}>
                                <View >
                                    <Text style={style.placeholderText}>
                                        {strings('notification')}
                                    </Text>
                                </View>
                                <View>
                                    <Switch
                                        trackColor={{ false: EDColors.separatorColor, true: EDColors.palePrimary }}
                                        thumbColor={EDColors.primary}
                                        style={style.notificationSwitch}
                                        value={this.state.isNotification}
                                        onValueChange={this.onRadioValueChangeHandle} />
                                </View>
                            </EDRTLView>

                        </View>
                       

                        <TouchableOpacity onPress={this.onDeletePress}>
                            <EDRTLView style={{ marginVertical: 10, alignSelf: 'center', alignItems: 'center', bottom: Platform.OS == 'ios' ? 20 : 0, marginTop: Platform.OS == 'ios' ? 30 : 10 }}>
                                <Icon name="delete" size={getProportionalFontSize(20)} color={EDColors.error} />
                                <EDRTLText title={strings("deleteAccount")} style={style.deleteText} />
                            </EDRTLView>
                        </TouchableOpacity>
                    </ScrollView>


                </View>
            </BaseContainer>
        );
    }
    //#endregion


    /**
     * Share app
     */
    shareApp = () => {
        const shareOptions = {
            title: strings("shareApp"),
            message: strings("shareAppMessage") + '\niOS: ' + this.props.storeURL.app_store_url +
                '\nAndroid: ' + this.props.storeURL.play_store_url + '\n' + strings('usePromo') + boldify((this.props.referral_code || '')) +
                strings('rewardMsg'),

        };
        Share.open(shareOptions);
    }

    //#region
    onRightEventHandler = index => {
        index == 0 ? this.updateData() : null;
    };
    //#endregion

    //#region
    /** BACK EVENT HANDLER */
    onBackEventHandler = () => {
        this.props.navigation.goBack();
    };
    //#endregion

    //#region
    /** TEXT CHANGE */
    onTextChangeHanlder = text => {
        this.setState({
            firstName: text,
        });
    };
    onLastTextChangeHanlder = text => {
        this.setState({
            lastName: text,
        });
    };
    onEmailtChangeHanlder = text => {
        this.setState({
            email: text,
        });
    };
    //#endregion


    //#region
    /** ADDRESS ICON EVETN */
    onAddressEventHandler = () => {
        // this.props.navigation.navigate('AddressListContainer', {
        //     isSelectAddress: false,
        // });
        this.props.navigation.navigate('DetailedAddressListContainer', {
            isSelectAddress: false,
        });
    };

    //#region
    /** RADIO BUTTON VALUE */
    onRadioValueChangeHandle = value => {
        if (value === true && this.firebaseOff) {
            showDialogueNew(strings('notificationPermission'), [], strings('notification'), () => {
                Platform.OS == "ios" ?
                    Linking.openURL('app-settings:').catch(err => {
                        console.log(err);
                    }):
                    Linking.openSettings().catch(err => {
                        console.log(err);
                    })
            });
        } else {
            this.setState({ isNotification: value });

            this.getToken();
        }
    };
    //#endregion

    //#region
    /** PASSWORD CHANGE */
    onPasswordChangeHandler = () => {
        this.props.navigation.navigate('ChangePasswordContainer');
    };
    //#endregion

    /**
    *
    * @param {The image response received from image picker} imageSource
    */
    onImageSelectionHandler = imageSource => {
        console.log('[][][][][', imageSource)
        this.state.ImageSource = imageSource;
    };

    /** PROFILE UPDATE CALLED */
    updateData() {
        if (this.validate()) {
            this.updateProfile();
        }
    }

    /** VALIDATE USER NAME */
    validate() {
        if (this.state.email !== '') {
            if (this.validationsHelper
                .validateEmail(
                    this.state.email,
                    strings("emailValidate")
                )
                .trim() !== "") {
                showValidationAlert(strings('emailValidate'));
                return false;
            }
        }
        if (this.state.firstName === '') {
            showValidationAlert(strings('emptyName'));
            return false;
        }
        if (this.state.lastName === '') {
            showValidationAlert(strings('emptyLastName'));
            return false;
        }
        else {
            return true
        }
    }

    //#region NETWORK API

    /** delete API CALL */
    callDeleteAPI = () => {
        // CHECK INTERNET STATUS
        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true });
                // delete PARAMS
                const deleteParams = {
                    user_id: this.props.userID,
                    language_slug: this.props.lan,
                };
                deleteUser(deleteParams, this.ondeleteSuccess, this.ondeleteFailure, this.props)
            } else {
                showNoInternetAlert();
            }
        });
    }

    /**
     *
     * @param {The success object returned in delete API response} _objSuccess
     */
    ondeleteSuccess = (_objSuccess) => {
        const selectedLanguage = this.props.lan;

        // DISMISS delete DIALOGUE
        this.setState({ isLoading: false });

        // CLEAR USER DETAILS IN REDUX
        this.props.saveCredentials({});
        this.props.saveLanguageRedux(selectedLanguage)


        // CLEAR USER DETAILS FROM ASYNC STORE
        flushAllData(
            _response => {
                // SET CART COUNT TO 0 IN REDUX
                this.props.saveCartCount(0);

                // MAINTAIN THE SELECTED LANGUAGE IN ASYNC STORE
                saveLanguage(selectedLanguage, _successSaveLanguage => { }, _error => { });

                // TAKE THE USER TO INITIAL SCREEN
                this.props.navigation.popToTop();
                this.props.navigation.navigate('SplashContainer');
            },
            _error => { }
        );
    }

    /**
     *
     * @param {The failure response object returned in delete API} _objFailure
     */
    ondeleteFailure = _objFailure => {
        debugLog('delete OBJ FAILURE ::: ' + JSON.stringify(_objFailure))

        // DISMISS delete DIALOGUE
        this.setState({ isLoading: false });
        setTimeout(() => {
            showDialogue(_objFailure.message, [], '', () => { });
        }, 500);
    }

    /**
     * @param { on Success Response Object } onSuccess
     */
    onSuccessUpdateProfile = onSuccess => {
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                if (this.props.isLoginRemembered)
                    saveUserLogin(
                        onSuccess.profile,
                        success => {
                            this.props.saveCredentials(onSuccess.profile);
                        },
                        errAsyncStore => {
                            this.setState({ isLoading: false });
                        }
                    );
                else {
                    this.props.saveCredentials(onSuccess.profile);
                }
            } else {
                showValidationAlert(onSuccess.message);
            }
        } else {
            showValidationAlert(strings('generalWebServiceError'));
        }
        this.changeTokenAPI();
    };

    /**
     * @param { on Fialure response Object } onFailure 
     */
    onFailureUpdateProfile = onFailure => {
        this.setState({ isLoading: false });
        showValidationAlert(onFailure.message || strings('generalWebServiceError'));
    };

    //#region CHANGE TOKEN
    /** CALL CHANGE TOKEN API */
    changeTokenAPI = () => {
        let params = {
            language_slug: this.props.lan,
            // token: this.props.phoneNumber,
            user_id: this.props.userID,
            firebase_token: this.state.firebaseToken,
        };
        this.setState({ isLoading: false });
        this.props.navigation.goBack();
    };
    //#endregion

    /** UPDATE PROFILE CALLED */
    updateProfile() {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });

                let objUpdateProfile = {
                    user_id: this.props.userID,
                    // token: this.props.token,
                    first_name: this.state.firstName,
                    last_name: this.state.lastName,
                    image: this.state.ImageSource,
                    password: '1234',
                    notification: this.state.isNotification ? '1' : '0',
                    Email: this.state.email
                };
                updateProfile(objUpdateProfile, this.onSuccessUpdateProfile, this.onFailureUpdateProfile, this.props);
            } else {
                console.log('error');
                showValidationAlert(strings('noInternet'));
            }
        });
    }
    //#endregion
}

export default connect(

    state => {
        return {
            userID: state.userOperations.userIdInRedux,
            firstName: state.userOperations.firstName,
            lastName: state.userOperations.lastName,
            image: state.userOperations.image,
            notification: state.userOperations.notification,
            token: state.userOperations.phoneNumberInRedux,
            email: state.userOperations.email,
            lan: state.userOperations.lan,
            isLoginRemembered: state.userOperations.isLoginRemembered,
            phoneNumber: state.userOperations.phoneNumberInRedux,
            firebaseToken: state.userOperations.token,
            isSocialLogin: state.userOperations.isSocialLogin,
            referral_code: state.userOperations.referral_code,
            phoneCode: state.userOperations.phoneCode,
            storeURL: state.userOperations.storeURL || {},
            countryArray: state.userOperations.countryArray,
        };
    },
    dispatch => {
        return {
            saveCredentials: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
            },
            saveToken: token => {
                dispatch(saveUserFCMInRedux(token));
            },
            saveSocialLogin: bool => {
                dispatch(saveSocialLoginInRedux(bool))
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            },
        };
    }
)(ProfileContainer);

const style = StyleSheet.create({
    childViewContainer: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        padding: 10,
        margin: 15,
    },
    deleteText: {
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(16),
        color: EDColors.error,
        marginHorizontal: 5
    },
    placeholderText: {
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.semiBold,
        color: EDColors.grayNew,
        paddingHorizontal: 8
    },
    share: {
        backgroundColor: EDColors.primary,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 10,
        margin: 20,
        borderRadius: 25,
        elevation: 1,
    },
    icons: {
        height: 40,
        width: 40,
        resizeMode: "contain"
    },
    notificationSwitch: { alignSelf: 'center', marginHorizontal: 5 },
    addressView: { width: '100%', justifyContent: 'space-between', alignItems: 'center', height: metrics.screenHeight * 0.06, marginTop: 10 },
    passwordView: { width: '100%', justifyContent: 'space-between', alignItems: 'center', height: metrics.screenHeight * 0.06 },

});

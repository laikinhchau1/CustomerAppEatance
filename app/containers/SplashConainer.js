import I18n from "i18n-js";
import React from "react";
import { Animated, Image, Platform, StyleSheet, View } from "react-native";
import * as RNFS from 'react-native-fs';
import { heightPercentageToDP } from "react-native-responsive-screen";
import { NavigationActions, StackActions } from "react-navigation";
import { connect } from "react-redux";
import XLSX from 'xlsx';
import NavigationService from "../../NavigationService";
import Assets from "../assets";
import EDRTLView from '../components/EDRTLView';
import EDTextView from "../components/EDTextView";
import EDThemeButton from "../components/EDThemeButton";
import EDUnderlineButton from '../components/EDUnderlineButton';
import ProgressLoader from '../components/ProgressLoader';
import { setI18nConfig, strings } from "../locales/i18n";
import { saveCurrencySymbol } from "../redux/actions/Checkout";
import { rememberLoginInRedux, saveAppleLogin, saveAppleToken, saveAppVersion, saveCMSPagesData, saveCountryCodeInRedux, saveCountryList, saveFoodType, saveLanguageInRedux, saveLanguageList, saveSocialButtonInRedux, saveSocialLoginInRedux, saveUserDetailsInRedux, saveUserFCMInRedux } from "../redux/actions/User";
import { getAppleLoginAsync, getAppleTokenAsync, getCurrency_Symbol, getLanguage, getSocialLogin, getUserFCM, getUserToken, saveTranslation } from "../utils/AsyncStorageHelper";
import { EDColors } from "../utils/EDColors";
import { debugLog, DEFAULT_TYPE, DINE_TYPE, EVENT_TYPE, getProportionalFontSize, isRTLCheck, NOTIFICATION_TYPE, ORDER_TYPE, RESPONSE_SUCCESS } from '../utils/EDConstants';
import { EDFonts } from "../utils/EDFontConstants";
import { checkFirebasePermission } from "../utils/FirebaseServices";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { getAPPVersionAPI, getCMSPage, getCountryList, getFoodType, getLanguageList } from "../utils/ServiceManager";
var redirectType = "";

class SplashContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    /** CONTRUCTOR */
    constructor(props) {
        super(props);
        redirectType = this.props.screenProps !== undefined &&
            this.props.screenProps !== null ?
            this.props.screenProps.notificationSlug : DEFAULT_TYPE;

    }

    state = {
        isVisible: false,
        bounceValue: new Animated.Value(metrics.screenHeight),
        fadeAnim: new Animated.Value(0),
        firebaseToken: '',
        isLoading: false,
        animated: false
    }

    /** DID MOUNT */
    componentDidMount() {
        this.fetchAppVersion();
        checkFirebasePermission(onSuccess => {
            this.setState({ firebaseToken: onSuccess })
            this.props.saveToken(onSuccess)

        }, (onFailure) => {
            console.log("Firebase token not allowed", onFailure)
        })

        // this.getLanguageList()

        getCurrency_Symbol(
            (onSuccess) => {
                this.props.saveCurrencySymbol(onSuccess)
            },
            () => {

            }
        )
        this.saveLangInRedux()
    }

    /** WILL MOUNT */
    async componentWillMount() {
        this.checkData()
    }

    /** CALL FETCH APP VERSION API */
    fetchAppVersion = () => {
        netStatus(isConnected => {
            if (isConnected) {
                let appParams = {
                    language_slug: "en",
                    user_type: "customer",
                    platform: Platform.OS
                }
                getAPPVersionAPI(appParams, this.onSuccessAppVersionHandler, this.onFailureAppVersionHandler)
            }
        })
    }


    onSuccessAppVersionHandler = (onSuccess) => {
        if (onSuccess !== undefined && onSuccess !== null && onSuccess.status == RESPONSE_SUCCESS) {
            this.props.saveAppVersionInRedux(onSuccess)
        }
    }

    onFailureAppVersionHandler = (onFailure) => {
    }

    /** CALL CMS API */
    getCMSDetails = (selectedLanguage) => {
        netStatus(isConnected => {
            if (isConnected) {
                let objCMSParams = {
                    language_slug: selectedLanguage,
                }
                getCMSPage(objCMSParams, this.onSucessGetCMSDetails, this.onFailureGetCMSDetails)
            }
        })
    }

    onSucessGetCMSDetails = (objCMSSuccessResponse) => {
        if (objCMSSuccessResponse !== undefined && objCMSSuccessResponse.cmsData !== undefined) {
            this.props.saveCMSDetails(objCMSSuccessResponse.cmsData)
        }
        if (objCMSSuccessResponse.shouldAllowFacebookLogin != undefined) {
            this.props.saveSocialButtonInRedux(objCMSSuccessResponse.shouldAllowFacebookLogin)
        } else {
            this.props.saveSocialButtonInRedux(false)
        }
        if (objCMSSuccessResponse.phone_code != undefined) {
            this.props.saveCountryCode(objCMSSuccessResponse.phone_code)
        } else {
            this.props.saveCountryCode('N/A')
        }
    }

    onFailureGetCMSDetails = (objCMSFailureResponse) => {
        debugLog("CMS FAILURE ::::::", objCMSFailureResponse)
    }

    /** CALL FOOD TYPE API */
    getFoodType = (selectedLanguage) => {
        netStatus(isConnected => {
            if (isConnected) {
                let objFoodParams = {
                    language_slug: selectedLanguage,
                }
                getFoodType(objFoodParams, this.onSuccessFoodType, this.onFailureFoodType)
            }
        })
    }

    onSuccessFoodType = (onSuccess) => {
        if (onSuccess !== undefined && onSuccess.food_type !== undefined) {
            this.props.saveFoodTypeInRedux(onSuccess.food_type)
        }
    }

    onFailureFoodType = (onFailure) => {
        debugLog("FOOD TYPE FAILURE ::::::", onFailure)
    }

    checkData = () => {
        getUserToken(
            success => {
                if (success != undefined && success.UserID != undefined &&
                    success.UserID != null &&
                    success.UserID != ''
                ) {
                    this.props.saveCredentials(success);
                    this.props.rememberLogin(true)
                    getAppleLoginAsync(
                        success => {
                            this.props.saveAppleLogin(success)
                        },
                        failure => {
                            this.props.saveAppleLogin(false)
                        }
                    )
                    getAppleTokenAsync(
                        success => {
                            this.props.saveAppleToken(success)
                        },
                        failure => {
                            this.props.saveAppleToken('')
                        }
                    )
                    debugLog("SCRREN TYPE ::::", redirectType)
                    if (redirectType === ORDER_TYPE) {
                        redirectType = undefined;

                        NavigationService.navigateToSpecificRoute("Order");
                    }
                    else if (redirectType === NOTIFICATION_TYPE) {
                        redirectType = undefined;
                        NavigationService.navigateToSpecificRoute("Notification");
                    }
                    else if (redirectType === DINE_TYPE) {
                        redirectType = undefined;
                        NavigationService.navigateToSpecificRoute("PendingOrders");
                    }
                    else if (redirectType === EVENT_TYPE) {
                        redirectType = undefined;
                        NavigationService.navigateToSpecificRoute("MyBookingContainer");
                    }
                    else {
                        getUserFCM(
                            success => {
                                getSocialLogin(
                                    success => {
                                        if (success) {
                                            this.props.saveSocialLogin(true)
                                        } else {
                                            this.props.saveSocialLogin(false)
                                        }
                                    },
                                    failure => {
                                        this.props.saveSocialLogin(false)
                                    }
                                )
                                this.props.saveToken(success)
                                this.saveLangInRedux()
                                setTimeout(() => {
                                    this.props.navigation.dispatch(
                                        StackActions.reset({
                                            index: 0,
                                            actions: [
                                                NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                                            ]
                                        })
                                    );
                                }, 2000);
                            },
                            failure => {
                                setTimeout(() => {
                                    this.props.navigation.dispatch(
                                        StackActions.reset({
                                            index: 0,
                                            actions: [
                                                NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                                            ]
                                        })
                                    );
                                }, 2000);
                            }
                        )
                    }
                } else {
                    setTimeout(() => {
                        this._toggleSubview()
                        this.setState({
                            isVisible: true
                        })
                    }, 2000);
                }
            },
            failure => {
                setTimeout(() => {
                    this._toggleSubview()
                    this.setState({ isVisible: true })
                    this.props.saveCredentials({});
                }, 2000);
            }
        );
    }


    //#endregion

    // RENDER METHOD
    render() {
        var _this = this;
        return (
            <View style={{ flex: 1 }}>
                {/* BACKGROUND IMAGE */}
                <View style={{ flex: 1 }}>
                    <Image defaultSource={Assets.bgHome} source={Assets.bgHome}
                        style={styles.backgroundImage} />
                    <Animated.Image source={Assets.bgOnboarding} style={{ width: "100%", height: "100%", opacity: this.state.fadeAnim }} />
                </View>
                {/* PROGRESS LOADER */}
                {this.state.isLoading ? <ProgressLoader /> : null}


                <Animated.View style={[styles.subView, { transform: [{ translateY: this.state.bounceValue }], useNativeDriver: false }]}>
                    {/* <ImageBackground defaultSource={Assets.bgOnboarding} source={Assets.bgOnboarding}
                        style={{
                            width: "100%", height: "100%"
                        }} > */}
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20, paddingTop: metrics.screenHeight * 0.4 }}>


                        {/* SIGN UP */}
                        <EDThemeButton
                            onPress={() => this._onPressSignIn(true)}
                            icon={"email"}
                            label={strings("signWithEmail")}
                            style={styles.transparentBtn}
                        />
                        <EDThemeButton
                            icon={"call"}
                            onPress={this._onPressSignIn}
                            label={strings("signWithPhone")}
                            style={[styles.transparentBtn, {
                                marginBottom: 30
                            }]}

                        />



                        {/* SKIP */}
                        <EDThemeButton
                            // isTransparent={true}
                            onPress={this._onPressSkip}
                            label={strings("skipNow")}
                            textStyle={{ color: EDColors.black }}
                            style={[styles.transparentBtn, {
                                backgroundColor: EDColors.white,
                                marginBottom: 10
                            }]}
                        />
                        <EDRTLView style={[styles.RTLTextStyle], { marginBottom: 5 }}>
                            {/* DONT HAVE ACCOUNT TEXT */}
                            <EDTextView
                                textstyle={[styles.textStyle, { fontFamily: EDFonts.regular }]}
                                text={strings("dontHaveAccount")} />

                            {/* SIGN UP BUTTON */}
                            <EDUnderlineButton
                                style={styles.textStyle}
                                buttonStyle={styles.buttonStyle}
                                textStyle={[styles.touchableTextStyle, { textDecorationLine: 'underline' }]}
                                onPress={this._onPressSignUp}
                                label={strings("signUpTitle")} />
                        </EDRTLView>
                    </View>
                    {/* </ImageBackground> */}
                </Animated.View>

            </View >
        );
    }
    //#endregion

    /** TOGGLE ANIMATION VIEW */
    _toggleSubview() {
        Animated.spring(this.state.bounceValue, { toValue: 0, velocity: 3, tension: 2, friction: 8, useNativeDriver: true }).start(
            () => {
                this.setState({ animated: true })
            }
        );
        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 1,
                duration: 1000
            },
        ).start();
    }

    //#region BUTTON PRESS EVENTS
    /** 
     * 
     */
    _onPressSignIn = (byEmail) => {
        this.props.navigation.navigate("LoginContainer", { useEmail: byEmail == true })
    }
    _onPressSkip = () => {
        this.props.navigation.dispatch(
            StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })]
            })
        );
    }
    _onPressSignUp = () => {
        this.props.navigation.navigate("SignupContainer");
    }
    //#endregion

    /** //#region 
     * GET LANGAGE FROM ASYNC AND SAVE IN REDUX
     */
    saveLangInRedux() {
        getLanguage(
            success => {
                let lan = I18n.currentLocale()
                if (success != null && success != undefined) {
                    lan = success
                    I18n.locale = success;
                    setI18nConfig(lan)
                    this.props.saveLanguageRedux(success);
                    this.getCMSDetails(success)
                    this.getCountryList(success)
                    this.getLanguageList()
                } else {
                    lan = "en"
                    I18n.locale = "en";
                    setI18nConfig("en")
                    this.props.saveLanguageRedux(lan);
                    this.getCMSDetails("en")
                    this.getCountryList('en')
                    this.getLanguageList()

                }
            }, failure => {

            }
        )
    }
    //#endregion


    /**
     *@param { preferred language } lang
     *
     * @memberof SplashContainer
     */
    getCountryList = (lang) => {
        netStatus(isConnected => {
            if (isConnected) {
                var param = {
                    language_slug: lang
                }
                getCountryList(param, this.onSuccessCountryList, this.onFailureCountryList)
            }
        })
    }

    onSuccessCountryList = onSuccess => {
        if (onSuccess.country_list !== undefined && onSuccess.country_list.length > 0) {
            this.props.saveCountryList(onSuccess.country_list)
        } else {
            this.props.saveCountryList(undefined)
        }
    }

    onFailureCountryList = onFailure => {
        console.log('::::::: FAILURE COUNTRY LIST', onFailure)
    }


    //Fetch locale data from server
    getFromServer = (url) => {
        // debugLog("GET FROM SERVER ::::::", url)
        RNFS.downloadFile({
            fromUrl: url,
            toFile: `${RNFS.DocumentDirectoryPath}/translations.xlsx`,
        }).promise.then((res) => {

            this.convertExcelToJson()

        }).catch(
            err => {
            }
        )
    }
    convertExcelToJson = () => {
        RNFS.readFile(RNFS.DocumentDirectoryPath + "/translations.xlsx", 'ascii').then((res) => {
            /* parse file */
            const wb = XLSX.read(res, { type: 'binary' });

            /* convert first worksheet to AOA */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            let mainArray = []
            let obj = []
            data.map((e, index) => {

                let i = 0
                while (i < e.length - 1) {
                    obj[i] = {}
                    let child_obj = {}
                    child_obj[e[0]] = e[i + 1]
                    obj[i] = child_obj

                    if (mainArray[i] === undefined)
                        mainArray[i] = []
                    mainArray[i].push(obj[i])
                    i++;
                    if (mainArray[i - 1].length == data.length) {
                        mainArray[i - 1] = mainArray[i - 1].reduce(function (result, current) {
                            return Object.assign(result, current);
                        }, {});
                    }
                }
            })
            // console.log("server files::" , mainArray)
            saveTranslation(JSON.stringify(mainArray),
                () =>
                    setI18nConfig(),
                err => { }
            )
        }).catch((err) => { debugLog("Conversion Error", "Error " + err.message); });

    }


    /**
     *
     * @memberof SplashContainer
     */
    getLanguageList = (lang) => {
        netStatus(isConnected => {
            if (isConnected) {
                getLanguageList({}, this.onSuccesslangList, this.onFailurelangList, this.props)
            }
        })
    }

    onSuccesslangList = onSuccess => {
        if (onSuccess.language_list !== undefined && onSuccess.language_list.length > 1) {
            this.props.saveLanguageList(onSuccess.language_list)
        } else {
            this.props.saveLanguageList(undefined)
        }
        if (onSuccess.language_file !== undefined &&
            onSuccess.language_file !== null &&
            onSuccess.language_file.trim().length !== 0
        ) {
            this.getFromServer(onSuccess.language_file);
        }
    }

    onFailurelangList = onFailure => {
        console.log('::::::::: LANG FAILURE', onFailure)
    }
    //#endregion
}


const styles = StyleSheet.create({
    backgroundImage: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%", height: "100%", position: "absolute" },
    textStyle: { color: EDColors.textNew, fontSize: getProportionalFontSize(16), marginTop: 10, fontFamily: EDFonts.semiBold },
    buttonStyle: { borderBottomColor: EDColors.primary, alignSelf: 'flex-end' },
    touchableTextStyle: { color: EDColors.white, fontSize: getProportionalFontSize(16), marginTop: 10, fontFamily: EDFonts.semiBold },
    RTLTextStyle: { flexDirection: 'row', alignSelf: 'center' },
    subView: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        height: metrics.screenHeight * 0.5,
    },
    transparentBtn: {
        backgroundColor: EDColors.whiteOpaque,
        width: "90%",
        borderRadius: 16,
        paddingVertical: 10,
        height: heightPercentageToDP('6.5%'),

    },
    separator: {
        height: 1, backgroundColor: EDColors.white, flex: 1, alignSelf: 'center', opacity: .8
    }
})

// CONNECT FUNCTION
export default connect(
    state => {
        return {
            lan: state.userOperations.lan
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
            saveAppVersionInRedux: token => {
                dispatch(saveAppVersion(token))
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            },
            saveCurrencySymbol: symbol => {
                dispatch(saveCurrencySymbol(symbol))
            },
            saveCountryCode: code => {
                dispatch(saveCountryCodeInRedux(code))
            },
            saveCMSDetails: cmsDetails => {
                dispatch(saveCMSPagesData(cmsDetails))
            },
            saveFoodTypeInRedux: food_type => {
                dispatch(saveFoodType(food_type))
            },
            rememberLogin: data => {
                dispatch(rememberLoginInRedux(data))
            },
            saveSocialLogin: bool => {
                dispatch(saveSocialLoginInRedux(bool))
            },
            saveSocialButtonInRedux: boolean => {
                dispatch(saveSocialButtonInRedux(boolean))
            },
            saveCountryList: array => {
                dispatch(saveCountryList(array))
            },
            saveLanguageList: array => {
                dispatch(saveLanguageList(array))
            },
            saveAppleLogin: boolean => {
                dispatch(saveAppleLogin(boolean))
            },
            saveAppleToken: token => {
                dispatch(saveAppleToken(token))
            }
        };
    }
)(SplashContainer);
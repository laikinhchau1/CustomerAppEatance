import React from "react";
import { FlatList, Image, Keyboard, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import deviceInfoModule from "react-native-device-info";
import { Icon } from "react-native-elements";
import { initialWindowMetrics } from "react-native-safe-area-context";
import Share from "react-native-share";
import { NavigationActions, NavigationEvents, StackActions } from "react-navigation";
import { connect } from "react-redux";
import Assets from "../assets";
import { strings } from "../locales/i18n";
import { saveCartCount } from "../redux/actions/Checkout";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { saveResIDInRedux, saveTableIDInRedux, saveUserDetailsInRedux } from "../redux/actions/User";
import { flushAllData, saveLanguage } from "../utils/AsyncStorageHelper";
import { showDialogue, showNoInternetAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { capiString, debugLog, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import { netStatus } from '../utils/NetworkStatusConnection';
import { logoutAPI } from "../utils/ServiceManager";
import EDImage from "./EDImage";
import EDRTLView from "./EDRTLView";
import EDText from "./EDText";
import ProgressLoader from "./ProgressLoader";


class SideBar extends React.PureComponent {
    //#region  LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.arrayFinalSideMenu = []
        this.arrSocialApps = []
    }

    state = {
        is_updated: false,
        firstName: "",
        lastName: "",
        image: "",
        isLoading: false
    };

    //#region HELPER FUNCTIONS
    /** SETUP SIDE MENU ITEMS */
    setupSideMenuData = () => {
        // Vikrant 29-07-21

        return [
            { route: 'Home' || 'MainContainer', screenName: strings("homeTitle"), icon: "home", type: 'simple-line-icon' },
            { route: 'Order', screenName: strings("myOrder"), icon: "handbag", type: 'simple-line-icon' },
            { route: 'Recipe', screenName: strings("recipeTitle"), icon: "restaurant-outline", type: 'ionicon' },
            { route: 'Event', screenName: strings("bookingsOnline"), icon: "calendar", type: 'ant-design' },
            { route: 'MyBooking', screenName: strings("myReservations"), icon: "calendar-check-o", type: 'font-awesome' },
            { route: 'Notification', screenName: strings("notification"), icon: "bell", type: 'simple-line-icon' }
        ];
    };

    // RENDER METHOD
    render() {
        Keyboard.dismiss()
        let arrTemp = this.setupSideMenuData();

        if (this.props.storeURL !== undefined && this.props.storeURL !== null && this.props.storeURL.app_store_url !== undefined) {
            arrTemp = arrTemp.concat(
                [
                    { route: 'Rate', screenName: strings("rate"), icon: "star", type: 'simple-line-icon' },
                    { route: 'Share', screenName: strings('share'), icon: "share", type: 'simple-line-icon' }
                ]
            )
        }

        let arrCMSPages = ((this.props.arrayCMSPages)).map(itemToIterate => { return { isAsset: true, route: 'CMSContainer', screenName: itemToIterate.name, icon: { uri: itemToIterate.cms_icon }, cmsSlug: itemToIterate.CMSSlug }; });
        let arraySideMenuData = arrTemp.concat(arrCMSPages);
        arraySideMenuData = arraySideMenuData.concat({ route: 'FAQs', screenName: strings('faqs'), icon: 'question-answer' })
        this.arrayFinalSideMenu = this.props.firstName != undefined && this.props.firstName != ''
            ? arraySideMenuData.concat({ route: 'SignOut', screenName: strings('signout'), icon: 'logout' })
            : arraySideMenuData;



        this.arrSocialApps = []
        if (this.props.socialURL.facebook !== undefined &&
            this.props.socialURL.facebook !== null &&
            this.props.socialURL.facebook.trim().length !== 0) {
            this.arrSocialApps.push(
                { name: 'facebook', color: EDColors.facebook, url: this.props.socialURL.facebook }
            )
        }
        if (this.props.socialURL.twitter !== undefined &&
            this.props.socialURL.twitter !== null &&
            this.props.socialURL.twitter.trim().length !== 0) {
            this.arrSocialApps.push(
                { name: 'twitter', color: EDColors.twitter, type: "entypo", url: this.props.socialURL.twitter }
            )
        }

        if (this.props.socialURL.linkedin !== undefined &&
            this.props.socialURL.linkedin !== null &&
            this.props.socialURL.linkedin.trim().length !== 0) {
            this.arrSocialApps.push(
                { name: 'logo-linkedin', type: "ionicon", color: EDColors.linkedin, url: this.props.socialURL.linkedin }
            )
        }

        return (
            <View style={{ flex: 1, backgroundColor: "#F5F5F5" }} pointerEvents={this.state.isLoading ? 'none' : 'auto'} >
                <NavigationEvents onDidFocus={() => { this.setState({ is_updated: true }); }} />

                {this.state.isLoading ? <ProgressLoader /> : null}


                {/* PROFILE HEADER */}

                <TouchableOpacity
                    style={{ flex: 2, paddingTop: Platform.OS == "ios" ? initialWindowMetrics.insets.top + 5 : 5 }}
                    activeOpacity={1.0}
                    onPress={this.onProfilepressed}>
                    <View style={[style.sideBarMainView]}>
                        <EDRTLView style={style.flexStyle}>
                            <EDImage
                                source={this.props.image}
                                style={style.sideBarImage}
                                resizeMode={'cover'}

                            />
                        </EDRTLView>

                        {/* Profile name */}
                        <EDRTLView style={style.flexStyle}>
                            <View style={style.usernameTextView}>
                                <EDText
                                    style={style.zeroView}
                                    textStyle={[style.usernameText]}
                                    title={this.props.firstName != undefined && this.props.firstName != ""
                                        ? capiString(this.props.firstName + " " + this.props.lastName)
                                        : strings("guest")} />

                                {/* View profile text */}
                                <EDRTLView style={{ alignItems: 'center' }}>
                                    <EDText style={style.zeroView}
                                        textStyle={style.sidebarTextStyle}
                                        title={this.props.firstName != undefined && this.props.firstName != ""
                                            ? strings("viewProfile")
                                            : null} />
                                    {this.props.firstName != undefined && this.props.firstName != "" ? <Icon name={isRTLCheck() ? 'caretleft' : 'caretright'} size={10} color={EDColors.text} type={'ant-design'} /> : null}
                                </EDRTLView>
                            </View>
                        </EDRTLView>
                    </View>

                </TouchableOpacity>


                {/* ITEMS LIST */}
                <View style={style.navItemContainer}>
                    <View style={{ flex: 4 }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={this.arrayFinalSideMenu}
                            extraData={this.state}
                            keyExtractor={(item, index) => item + index}
                            renderItem={this.createView}
                        />
                    </View>

                    {/* VERSION DETAIL */}
                    <EDRTLView style={[style.versionStyle, { alignItems: isRTLCheck() ? 'flex-end' : 'flex-start', paddingBottom: initialWindowMetrics.insets.bottom + 8 }]}>
                        <EDRTLView style={style.logoView}>
                            <Image source={Assets.logo} style={{ height: 24, width: 24 }} resizeMode={'contain'} />
                            {/* <Icon name="versions" type="octicon" size={getProportionalFontSize(18)}/> */}
                            <Text style={style.iconText} >{strings("version") + " " + deviceInfoModule.getVersion()}</Text>
                        </EDRTLView>
                        {this.arrSocialApps !== undefined && this.arrSocialApps !== null && this.arrSocialApps.length > 0 ?
                            <EDRTLView style={style.socialIconView}>
                                {this.arrSocialApps.map(item => (
                                    item.url !== undefined && item.url !== null ?
                                        <Icon name={item.name} color={item.color} type={item.type} style={style.socialIconStyle} onPress={() => this.openSocialApp(item)} />
                                        : null
                                ))}
                            </EDRTLView>
                            : null}
                    </EDRTLView>
                </View>
            </View>
        );
    }
    //#endregion

    /** BUTTON EVENT HANDLER
     *
     */
    //#region PROFILE PRESS HANDLER
    // SOCIAL APP PRESSED
    openSocialApp = (item) => {
        if (item.url !== undefined && item.url !== null)
            Linking.openURL(item.url).catch(() => { })
    }

    /** PROFILE PRESSES */
    onProfilepressed = () => {
        if (
            this.props.firstName != undefined &&
            this.props.firstName != ''
        ) {
            this.props.navigation.navigate("ProfileContainer");
        } else {
            this.props.navigation.navigate("LoginContainer");
        }
    }
    //#endregion

    //#region ITEM PRESS HANDLER
    /** DRAWER ITEM PRESSED */
    onDrawerItemPressed = (selectedIndex) => {
        // CLOSE DRAWER
        if (this.arrayFinalSideMenu[selectedIndex].screenName !== strings('signout')) {
            this.props.navigation.closeDrawer();
        }

        // LOGOUT
        if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('signout')) {
            showDialogue(
                strings('logoutConfirm'),
                [{ text: strings('dialogYes'), onPress: this.callLogoutAPI, buttonColor: EDColors.offWhite }],
                strings('appName'),
                () => { }
                ,
                strings('dialogNo'),
                true
            );
        }

        else if (this.arrayFinalSideMenu[selectedIndex].screenName == strings("rate")) {
            this.props.navigation.closeDrawer();
            this.openStore();
        }
        else if (this.arrayFinalSideMenu[selectedIndex].screenName == strings("share")) {
            this.props.navigation.closeDrawer();
            this.shareApp();
        }
        else {
            this.props.navigation.closeDrawer();
            this.props.saveNavigationSelection(this.arrayFinalSideMenu[selectedIndex].screenName);
            debugLog("Data", "routeName: " + this.arrayFinalSideMenu[selectedIndex].route + " params:  ")
            this.props.navigation.dispatch(
                NavigationActions.navigate({
                    routeName: this.arrayFinalSideMenu[selectedIndex].route, // <==== this is stackNavigator
                    params: { routeName: this.arrayFinalSideMenu[selectedIndex] },
                    action: NavigationActions.navigate({
                        routeName: this.arrayFinalSideMenu[selectedIndex].route,
                        params: { routeName: this.arrayFinalSideMenu[selectedIndex] } // <===== this is defaultScreen for Portfolio
                    })
                })
            );
        }
    }
    //#endregion

    /** OPEN STORE FOR RATING */
    openStore() {
        if (Platform.OS == "ios") {
            Linking.openURL(this.props.storeURL.app_store_url).catch(err => { });
        } else {
            Linking.openURL(this.props.storeURL.play_store_url).catch(err => { });
        }
    }

    /** SHAR APPLICATION */
    shareApp() {
        const shareOptions = {
            title: strings("shareApp"),
            message: strings("shareAppMessage") + '\niOS: ' + this.props.storeURL.app_store_url + '\nAndroid: ' + this.props.storeURL.play_store_url,
            // url: 'iOS: ' + this.props.storeURL.app_store_url + '\nAndroid: ' + this.props.storeURL.play_store_url
            // url: `iOS: ${this.props.storeURL.app_store_url} \nAndroid: ${this.props.storeURL.play_store_url}`
        };
        Share.open(shareOptions);
    }

    //#region ITEM VIEW
    /** VIEW FOR ITEMS */
    createView = ({ item, index }) => {
        if (item != undefined) {
            let isSelected = item.route == 'CMSContainer' ? item.screenName : item.route
            return (
                // Vikrant 29-07-21
                <TouchableOpacity
                    style={[style.drawerItemView, { backgroundColor: this.props.titleSelected == isSelected ? EDColors.primary : EDColors.radioSelected }]}
                    onPress={() => { this.onDrawerItemPressed(index) }}>
                    <EDRTLView style={style.sidebarItemsView}>
                        <EDRTLView style={{
                            alignItems: "center"
                        }}>
                            {/* ICON */}
                            {item.isAsset ?
                                <Image
                                    style={{ width: getProportionalFontSize(20), height: getProportionalFontSize(18), tintColor: this.props.titleSelected == isSelected ? EDColors.white : EDColors.blackSecondary }}
                                    source={
                                        item.icon
                                    }
                                    resizeMode="contain"
                                />
                                :
                                <Icon
                                    name={item.icon}
                                    color={this.props.titleSelected == isSelected ? EDColors.white : EDColors.blackSecondary}
                                    size={this.props.iconSize || getProportionalFontSize(20)}
                                    type={item.type || "material"}
                                />
                            }

                            {/* TITLE */}
                            <Text style={[style.drawerTextStyle, {
                                color: this.props.titleSelected == isSelected
                                    ? EDColors.white
                                    : EDColors.blackSecondary,

                            }]}>
                                {item.screenName}
                            </Text>
                        </EDRTLView>

                    </EDRTLView>
                </TouchableOpacity>
            );
        } else { return null; }
    }
    //#endregion





    //#region NETWORK
    /** LOGOUT API CALL */
    callLogoutAPI = () => {
        netStatus(isConnected => {
            this.setState({ isLoading: true });
            if (isConnected) {

                let params = {
                    language_slug: this.props.lan,
                    token: this.props.token,
                    user_id: this.props.userID
                }
                logoutAPI(params, this.onLogoutSuccess, this.onLogoutFailure, this.props);
            } else {
                this.setState({ isLoading: false })
                showNoInternetAlert();
            }
        });
    }

    /**
     *
     * @param {The success object returned in logout API response} _objSuccess
     */
    onLogoutSuccess = (_objSuccess) => {
        this.props.saveCredentials({
            phoneNumberInRedux: undefined,
            userIdInRedux: undefined
        });

        flushAllData(
            response => {
                saveLanguage(this.props.lan,
                    success => { },
                    error => { }
                );
                this.props.saveCartCount(0);
                this.props.saveTableID(undefined);
                this.props.saveResID(undefined);
                this.props.navigation.dispatch(
                    StackActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: "SplashContainer" })
                        ]
                    })
                );
            },
            error => { }
        );
        this.props.firstName = "";
        this.props.lastName = "";
        this.props.image = "";
        this.props.navigation.closeDrawer();
        this.setState({ isLoading: false })
    }

    /**
     *
     * @param {The failure response object returned in logout API} _objFailure
     */
    onLogoutFailure = _objFailure => {
        // DISMISS LOGOUT DIALOGUE
        this.setState({ isLoading: false })
    }
    //#endregion

}

export const style = StyleSheet.create({
    usernameTextView: { justifyContent: 'space-evenly', flex: 1 },
    iconText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(14), color: 'rgba(0, 0, 0, 0.4)', marginHorizontal: 5, alignSelf: 'center' },
    zeroView: { marginHorizontal: 0, marginTop: 0 },
    drawerTextStyle: {
        fontSize: 16,
        marginHorizontal: 15,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(14),
        color: EDColors.blackSecondary
    },
    sidebarItemsView: { flex: 1, alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, justifyContent: "space-between" },
    drawerItemView: {
        flex: 1,
        // marginTop:8,
        marginHorizontal: 13,
        // marginBottom: 8,
        // borderWidth:1,
        borderRadius: 16,
        marginTop: 5
    },
    navItemContainer: {
        flex: 5,
        paddingBottom: 20
    },
    navItem: {
        color: EDColors.black,
        fontSize: 15,
        marginLeft: 40,
        marginTop: 40,
        flexDirection: "row",
        alignItems: "center"
    },
    // socialIconStyle:{marginHorizontal:5},
    versionStyle: { alignItems: 'center', width: "100%", marginTop: 20, justifyContent: "space-between" },
    flexStyle: { flex: 1 },
    socialIconView: { flex: 1, justifyContent: 'space-evenly', paddingHorizontal: 15 },
    sidebarTextStyle: { marginHorizontal: 5, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semiBold, color: EDColors.blackSecondary },
    logoView: { paddingHorizontal: 20, alignItems: 'center' },
    sideBarImage: { marginTop: 30, borderWidth: 0, width: 80, height: 80, borderRadius: 40, },
    usernameText: { color: EDColors.black, marginTop: 10, marginBottom: -10, fontSize: getProportionalFontSize(20), fontFamily: EDFonts.semiBold },
    sideBarMainView: { flex: 1, justifyContent: 'center', marginHorizontal: 15, height: metrics.screenHeight * 25, borderBottomColor: '#EDEDED', borderBottomWidth: 1 },

});

export default connect(
    state => {
        return {
            titleSelected: state.navigationReducer.selectedItem,
            userToken: state.userOperations.phoneNumberInRedux,
            userID: state.userOperations.userIdInRedux,
            firstName: state.userOperations.firstName,
            lastName: state.userOperations.lastName,
            image: state.userOperations.image,
            token: state.userOperations.token,
            lan: state.userOperations.lan,
            arrayCMSPages: state.userOperations.arrayCMSData,
            storeURL: state.userOperations.storeURL || {},
            socialURL: state.userOperations.socialURL || {},
            currency: state.checkoutReducer.currency_symbol,

        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveCredentials: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
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
)(SideBar);

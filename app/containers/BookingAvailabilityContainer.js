import React from "react";
import { View, ScrollView, RefreshControl, Platform, Linking, StyleSheet, AppState, TouchableOpacity } from "react-native";
import { RESPONSE_SUCCESS, GOOGLE_API_KEY, debugLog, getProportionalFontSize, isRTLCheck, API_PAGE_SIZE } from "../utils/EDConstants";
import { connect } from "react-redux";
import { homedata } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import { EDColors } from "../utils/EDColors";
import { showDialogueNew } from "../utils/EDAlert";
import { netStatus } from "../utils/NetworkStatusConnection";
import { strings } from "../locales/i18n";
import { NavigationEvents } from 'react-navigation'
import metrics from '../utils/metrics';
import EDHomeSearchBar from '../components/EDHomeSearchBar'
import EDPlaceholderComponent from '../components/EDPlaceholderComponent'
import EDRestaurantEventFlatList from "../components/EDRestaurantEventFlatList";
import { PERMISSIONS } from "react-native-permissions";
import { checkLocationPermission } from "../utils/LocationServices";
import { getCurrentLocation, getAddress } from "../utils/LocationServiceManager"
import { EDFonts } from "../utils/EDFontConstants";
import EDLocationModel from "../components/EDLocationModel";
import { Spinner } from "native-base";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import EDRTLText from "../components/EDRTLText";
import { Icon } from "react-native-elements";
import { saveCurrentLocation } from "../redux/actions/User";
import EDRTLView from "../components/EDRTLView";

class BookingAvailabilityContainer extends React.Component {
    //#region  LIFE CYCLE METHODS

    /**CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.arrayRestaurants = []
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.isAllowPermission = false
        this.shouldLoadMore = false
        this.latitude = undefined
        this.longitude = undefined
    }

    /** STATE */
    state = {
        isLoading: false,
        latitude: "",
        longitude: "",
        appState: AppState.currentState,
        refreshing: false,
        isPageLoading: false,
        isResLoading: true,
        locationError: false,
        isPermissionLoading: false,
        strSearch: "",
        isShowReview: false
    };

    onDidFocusContainer = () => {
        this.props.saveNavigationSelection("Event");
        if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") {
            if (this.props.currentLocation !== undefined && this.props.currentLocation !== null && this.props.currentLocation.latitude !== undefined) {
                this.currentCity = this.props.currentLocation.areaName
                this.currentAddress = this.props.currentLocation.address
            }
            this.arrayRestaurants = undefined
            this.setState({ isLoading: true })
            this.getRestaurantList()
            AppState.addEventListener('change', this._handleAppStateChange);
        } else {
            showDialogueNew(strings("loginValidation"), [], strings("appName"), () => {
                this.props.navigation.navigate("LoginContainer", {
                    isCheckout: true
                });
            });
        }
    }

    onLocationBtnPressed = () => {
        this.props.navigation.navigate('searchLocation', {})
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    onGPSPressed = () => {
        this.currentCity = undefined
        this.currentAddress = undefined
        this.props.saveCurrentLocation(undefined)
        this.onPullToRefreshHandler()
    }

    //Get Current Address 
    getCurrentAddress = (lat, long) => {
        getAddress(lat, long,
            onSuccess => {
                debugLog("ON SUCCESS GET ADDRESS :::::", onSuccess)
                this.currentAddress = onSuccess.localArea
                this.currentCity = onSuccess.strAddress
                let addressData = {
                    latitude: lat,
                    longitude: long,
                    areaName: onSuccess.strAddress,
                    address: onSuccess.localArea
                }
                debugLog("ADDRESS TO SAVE ::::::", addressData)
                this.props.saveCurrentLocation(addressData)
            },
            this.onFailureGetAddress,
            GOOGLE_API_KEY
        )
    }

    onFailureGetAddress = onFailure => {
        debugLog('Address Fail:::::::: ', onFailure);
    }

    onConnectionChangeHandler = () => {
        this.setState({ isResLoading: true })
        this.arrayRestaurants = undefined
        this.getRestaurantList()
    }

    /**
     * @param { Applications status Active or Background } nextAppState
     */
    _handleAppStateChange = (nextAppState) => {
        if (nextAppState == 'active') { }
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            if (Platform.OS === 'android' && this.isAndroidPermission === true) {
                this.setState({ isResLoading: false })

            } else {
                if (this.isAllowPermission === false && !this.state.isLoading) {
                    this.arrayRestaurants = undefined
                    this.getRestaurantList()
                }
            }
        }
        this.setState({ appState: nextAppState });
    }

    getRestaurantList = (isForRefresh = false) => {
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';

        if (this.arrayRestaurants === undefined) {
            this.arrayRestaurants = [];
        }
        netStatus(isConnected => {
            if (isConnected) {
                if (this.props.currentLocation !== undefined && this.props.currentLocation !== null && this.props.currentLocation.latitude !== undefined) {
                    let param = {
                        language_slug: this.props.lan,
                        latitude: this.props.currentLocation.latitude,
                        longitude: this.props.currentLocation.longitude,
                        itemSearch: this.state.strSearch,
                        // token: this.props.phoneNumber,
                        isEvent: 1,
                        count: API_PAGE_SIZE,
                        page_no: (this.arrayRestaurants && !isForRefresh) ? parseInt(this.arrayRestaurants.length / API_PAGE_SIZE) + 1 : 1,
                    }
                    if (!isForRefresh) {
                        this.setState({ isLoading: this.arrayRestaurants === undefined || this.arrayRestaurants.length === 0 });
                    }
                    homedata(param, this.onSuccessRestaurantData, this.onFailureRestaurantData);
                }
                else {
                    console.log('::::::::::: ELSE')
                    var paramPermission =
                        Platform.OS === 'ios'
                            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                            : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
                    console.log('::::::::::: ELSE IF')
                    checkLocationPermission(
                        paramPermission,
                        () => {
                            getCurrentLocation(
                                onSucces => {
                                    console.log('::::::::::: SUCCESS LOCATION', onSucces)
                                    this.getCurrentAddress(onSucces.latitude, onSucces.longitude);
                                    this.latitude = onSucces.latitude
                                    this.longitude = onSucces.longitude
                                    this.isAllowPermission = false
                                    this.setState({ locationError: false, latitude: onSucces.latitude, longitude: onSucces.longitude })
                                    let param = {
                                        language_slug: this.props.lan,
                                        latitude: onSucces.latitude,
                                        longitude: onSucces.longitude,
                                        itemSearch: this.state.strSearch,
                                        // token: this.props.phoneNumber,
                                        isEvent: 1,
                                        count: API_PAGE_SIZE,
                                        page_no: (this.arrayRestaurants && !isForRefresh) ? parseInt(this.arrayRestaurants.length / API_PAGE_SIZE) + 1 : 1,
                                    }
                                    if (!isForRefresh) {
                                        this.setState({ isLoading: this.arrayRestaurants === undefined || this.arrayRestaurants.length === 0 });
                                    }
                                    homedata(param, this.onSuccessRestaurantData, this.onFailureRestaurantData);
                                },
                                failure => {
                                    console.log('::::::::::: ONFAILURE LOCATION')
                                    this.isAllowPermission = false
                                    if (failure.code == 1)
                                        this.strOnScreenMessage = strings("allowLocationSettings")
                                    else
                                        this.strOnScreenMessage = strings("currentLocationError")
                                    this.setState({
                                        locationError: false,
                                        isResLoading: false,
                                        isLoading: false
                                    })
                                },
                                GOOGLE_API_KEY
                            )
                        },
                        () => {
                            console.log('::::::::::: LOCATION')
                            this.isAllowPermission = true

                            this.setState({
                                locationError: true,
                                isResLoading: false,
                                isLoading: false
                            })
                        }
                    )
                }
            }
            else {
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
                this.setState({ isLoading: false, isResLoading: false });
            }
        })
    }

    /**
   * Flat list header component
   */

    renderHeaderComponent = () => {
        return (
            <>

                <TouchableOpacity
                    activeOpacity={1}
                    onPress={this.onLocationBtnPressed}>
                    <EDRTLView style={[styles.locationStrap, { marginBottom: -2 }]}>
                        <Icon name={'location-pin'} type={"simple-line-icon"} size={getProportionalFontSize(18)} color={EDColors.white} />
                        <View style={{ flex: 1, marginHorizontal: 10 }}>
                            <EDRTLText
                                style={{
                                    color: EDColors.white,
                                    fontFamily: EDFonts.semiBold,
                                    fontSize: getProportionalFontSize(15),
                                }}
                                numberOfLines={1}
                                title={(this.currentAddress || strings('locationNotDetected')) + (this.currentCity ? (", " + this.currentCity) : "")}
                                onPress={this.onLocationBtnPressed}
                            />
                            {this.currentCity == undefined ?
                                <EDRTLText
                                    numberOfLines={2}
                                    style={{
                                        color: EDColors.white,
                                        fontFamily: EDFonts.regular,
                                        fontSize: getProportionalFontSize(13),
                                        marginTop: 2,
                                    }}
                                    onPress={this.onLocationBtnPressed}
                                    title={strings('manuallyChooseLocation')}
                                /> : null}
                        </View>
                        <Icon
                            name={'expand-more'}
                            size={getProportionalFontSize(24)}
                            // onPress={this.onGPSPressed}
                            color={EDColors.white}
                            containerStyle={{ alignSelf: 'center' }}
                        />
                    </EDRTLView>

                </TouchableOpacity>
                <View style={styles.headerView}>
                    <EDHomeSearchBar
                        value={this.state.strSearch}
                        style={styles.searchBar}
                        // ref={input => this.itemSearch = input}
                        placeholder={strings("searchNearByRestaurant")}
                        onChangeValue={this.onTextChangeHandler}
                        disabled={false}
                        onSearchPress={this.onSearchPressed}
                    />
                </View>
            </>
        )
    }

    renderFooterComponent = () => {
        return (
            this.state.isPageLoading ?
                <Spinner color={EDColors.primary} size="large" /> : null
        )
    }

    // RENDER METHOD
    render() {

        return (
            <BaseContainer
                // title={strings("eventTitle")}
                title={strings("bookingsOnline")}
                left={'menu'}
                right={[]}
                onLeft={this.onMenuEventHandler}
                loading={this.state.isLoading}
                onConnectionChangeHandler={this.onConnectionChangeHandler}>

                {/* SCREEN FOCUS EVENT */}
                <NavigationEvents onDidFocus={this.onDidFocusContainer} />

                {/* PARENT VIEW */}
                <View style={{ flex: 1 }}>

                    {this.state.locationError && this.currentCity == undefined ?
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={this.onLocationBtnPressed}>
                                <EDRTLView style={styles.locationStrap}>
                                    <Icon name={'location-pin'} type={"simple-line-icon"} size={getProportionalFontSize(18)} color={EDColors.white} />
                                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                                        <EDRTLText
                                            style={{
                                                color: EDColors.white,
                                                fontFamily: EDFonts.semiBold,
                                                fontSize: getProportionalFontSize(15),
                                            }}
                                            title={strings('locationNotDetected')}
                                            onPress={this.onLocationBtnPressed}
                                        />
                                        <EDRTLText
                                            numberOfLines={2}
                                            style={{
                                                color: EDColors.white,
                                                fontFamily: EDFonts.regular,
                                                fontSize: getProportionalFontSize(13),
                                                marginTop: 2,
                                            }}
                                            onPress={this.onLocationBtnPressed}
                                            title={strings('manuallyChooseLocation')}
                                        />
                                    </View>
                                    <Icon
                                        name={'expand-more'}
                                        size={getProportionalFontSize(24)}
                                        // onPress={this.onGPSPressed}
                                        color={EDColors.white}
                                        containerStyle={{ alignSelf: 'center' }}
                                    />
                                </EDRTLView>
                            </TouchableOpacity>
                            <EDLocationModel
                                isLoadingPermission={this.state.isResLoading}
                                onLocationEventHandler={this.onLocationEventHandler}
                            />
                        </View>
                        :
                        <>

                            {/* RESTAURANT LIST */}
                            {this.arrayRestaurants != undefined && this.arrayRestaurants != null && this.arrayRestaurants.length > 0
                                ? (
                                    <>
                                        {this.renderHeaderComponent()}
                                        <EDRestaurantEventFlatList
                                            arrayRestaurants={this.arrayRestaurants}
                                            onPressedBookEvent={this.onPressedBookEvent}
                                            // ListHeaderComponent={this.renderHeaderComponent}
                                            ListFooterComponent={this.renderFooterComponent}
                                            onPullToRefreshHandler={this.onPullToRefreshHandler}
                                            onEndReached={this.onLoadMore}
                                            isShowReview={this.state.isShowReview}
                                        />
                                    </>
                                )
                                : (this.strOnScreenMessage || '').trim().length > 0 ? (
                                    <View style={{ height: metrics.screenHeight, width: metrics.screenWidth }}>
                                        <ScrollView
                                            style={{ flex: 1 }}
                                            contentContainerStyle={{ height: metrics.screenHeight, width: metrics.screenWidth }}
                                            refreshControl={
                                                <RefreshControl
                                                    refreshing={this.refreshing || false}
                                                    colors={[EDColors.primary]}
                                                    onRefresh={this.onPullToRefreshHandler}
                                                />}
                                        >
                                            {this.renderHeaderComponent()}
                                            <EDPlaceholderComponent title={this.strOnScreenMessage} subTitle={this.strOnScreenSubtitle} />
                                        </ScrollView>
                                    </View>
                                ) : null}
                        </>
                    }
                </View>
            </BaseContainer >
        );
    }
    //#endregion

    //#region 
    /** Menu EVENT HANDLER */
    onMenuEventHandler = () => {
        this.props.navigation.openDrawer();
    }
    //#endregion

    //#region 
    /** SEARCH TEXT CHANGE */
    onTextChangeHandler = (text) => {
        this.setState({
            strSearch: text
        })
    }
    //#endregion

    onLoadMore = () => {
        if (this.shouldLoadMore && !this.state.isPageLoading) {
            this.setState({ isPageLoading: true })
            this.getRestaurantList()
        }
    }

    /** CONTROL REFRESH */
    onPullToRefreshHandler = () => {
        this.arrayRestaurants = undefined,
            this.refreshing = false,
            this.latitude = undefined
        this.longitude = undefined
        this.setState({
            strSearch: "",
            isResLoading: true,
            isLoading: true
        })
        this.itemSearch = '',
            this.getRestaurantList()
    }

    //#region SEARCH FOR REST
    onSearchPressed = () => {
        if (this.state.strSearch == "" || !(/\S/.test(this.state.strSearch))) {
            return
        } else {
            this.pull = false
            this.arrayRestaurants = undefined;
            this.setState({ isResLoading: true })
            if (this.state.strSearch != undefined && this.state.strSearch != "" && this.state.strSearch.length > 0) {
                this.getRestaurantList()
            } else {
                this.getRestaurantList()
            }
        }
    }
    //#endregion

    //#region 
    onPressedBookEvent = (model) => {
        this.props.navigation.navigate("EventBookContainer", {
            data: model,
            isShowReview: this.state.isShowReview
        });
    }
    //#endregion

    //#region NETWORK
    //#region BACKGROUND LOCATION
    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureBackgroundLocation = (onFailure) => {
        console.log("Configure fail :::::::", onFailure)
        this.setState({ isLoading: false })
    }

    /**
     * @param { Success Res Data Response object } onSuccess 
     * 
     */
    onSuccessRestaurantData = (onSuccess) => {
        debugLog("ON SUCCESS ::::", onSuccess, this.arrayRestaurants)
        if (this.arrayRestaurants == undefined)
            this.arrayRestaurants = []
        this.strOnScreenMessage = ''
        this.strOnScreenSubtitle = ''
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {

                if (onSuccess.enable_review !== undefined && onSuccess.enable_review !== null && onSuccess.enable_review == '1') {
                    this.setState({ isShowReview: true })
                } else {
                    this.setState({ isShowReview: false })
                }

                if (onSuccess.restaurant != undefined && onSuccess.restaurant.length > 0) {
                    let arrRest = onSuccess.restaurant || []
                    let totalRecordCount = onSuccess.total_restaurant || 0
                    this.shouldLoadMore = this.arrayRestaurants.length + arrRest.length < totalRecordCount
                    this.arrayRestaurants = [...this.arrayRestaurants, ...arrRest];
                } else {
                    if (this.arrayRestaurants == undefined || this.arrayRestaurants.length === 0) {
                        this.strOnScreenMessage = strings('noDataFound');
                        this.arrayRestaurants = []
                    }
                }
                this.setState({ isLoading: false, isPageLoading: false, isResLoading: false });

            } else {
                this.strOnScreenMessage = onSuccess.message
                this.setState({ isLoading: false, isPageLoading: false, isResLoading: false });
            }
        } else {
            this.strOnScreenMessage = strings('noRestAvailable');
            this.setState({ isLoading: false, isPageLoading: false, isResLoading: false });
        }
    }

    /**
     * @param { Failure Res Data Response Object } OnFailure
     * 
     */
    onFailureRestaurantData = (onFailure) => {
        this.strOnScreenMessage = strings("generalWebServiceError");
        this.strOnScreenSubtitle = "";
        this.setState({ isLoading: false, isResLoading: false });
        // showValidationAlert(strings("noInternet"));
    }

    onLocationEventHandler = () => {
        this.setState({ isResLoading: true })
        this.isAllowPermission = false
        Linking.openSettings();
    }
    //#endregion
}

//#region  STYLES
const styles = StyleSheet.create({
    // VIKRANT 28-07-21
    locationStrap: {
        backgroundColor: EDColors.primary,
        padding: 10,
        justifyContent: 'space-between',
    },
    locationView: { flex: 0.8, marginHorizontal: 2, flexDirection: 'row', alignItems: 'center' },
    locationText: { color: EDColors.white, fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(12), paddingHorizontal: 5 },
    headerView: { marginBottom: 10, backgroundColor: EDColors.primary },
    searchBar: { marginHorizontal: 10, marginVertical: 10, marginTop: 10, marginBottom: 15 }
    // VIKRANT 28-07-21
})
//#endregion

export default connect(
    state => {

        return {
            lan: state.userOperations.lan,
            userID: state.userOperations.userIdInRedux,
            phoneNumber: state.userOperations.phoneNumberInRedux,
            currentLocation: state.userOperations.currentLocation
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveCurrentLocation: data => {
                dispatch(saveCurrentLocation(data));
            }
        };
    }
)(BookingAvailabilityContainer);

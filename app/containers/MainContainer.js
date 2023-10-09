import I18n from "i18n-js";
import { Spinner } from "native-base";
import React from "react";
import { AppState, Linking, Platform, RefreshControl, ScrollView, SectionList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from 'react-native-elements';
import { PERMISSIONS, RESULTS } from "react-native-permissions";
import RNRestart from "react-native-restart";
import { NavigationEvents } from 'react-navigation';
import { connect } from "react-redux";
import BannerImages from "../components/BannerImages";
import EDHomeSearchBar from "../components/EDHomeSearchBar";
import EDLanguageSelect from "../components/EDLanguageSelect";
import EDLocationModel from '../components/EDLocationModel';
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from "../components/EDPopupView";
import EDResCategoryFlatList from '../components/EDResCategoryFlatList';
import EDRestaurantDeatilsFlatList from "../components/EDRestaurantDetailsFlatList";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import RadioGroupWithHeader from "../components/RadioGroupWithHeader";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCartPrice, saveCurrencySymbol } from "../redux/actions/Checkout";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { saveCurrentLocation, saveFoodType, saveLanguageInRedux, saveMapKeyInRedux, saveMinOrderAmount, saveOrderMode, savePaymentDetailsInRedux, saveResIDInRedux, saveSocialURL, saveStoreURL, saveTableIDInRedux, saveUserFCMInRedux } from "../redux/actions/User";
import { clearCartData, getCartList, getLanguage, saveLanguage } from "../utils/AsyncStorageHelper";
import { showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { API_PAGE_SIZE, debugLog, getProportionalFontSize, GOOGLE_API_KEY, isRTLCheck, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { checkFirebasePermission } from "../utils/FirebaseServices";
import { getAddress, getCurrentLocation } from "../utils/LocationServiceManager";
import metrics from '../utils/metrics';
import { netStatus } from "../utils/NetworkStatusConnection";
import { checkPermission } from "../utils/PermissionServices";
import { changeToken, getFoodType, homedata, saveUserLanguageinDB } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";


class MainContainer extends React.Component {

    distance = "";
    foodTypes = [];
    sortType = 0
    arrayCategories = undefined;
    arrayRestaurants = undefined;
    arraySlider = undefined;
    strOnScreenMessage = '';
    strOnScreenSubtitle = '';
    shouldLoadMore = false;
    homeSectionData = [
        {
            index: 0,
            title: strings("nearByRestaurant"),
            data: [{
                arrayRestaurants: []
            }]
        }
    ]
    allOrderModes = [
        {
            label: strings("deliveryOrder"),
            size: 15,
            selected: 1
        },
        {
            label: strings("pickUpOrder"),
            size: 15,
            selected: 0
        }
    ]
    is_filter = false
    locationError = false
    table_id = undefined
    orderMode = this.props.orderMode || 0
    state = {
        locationError: false,
        isPermissionLoading: false,
        isLoading: false,
        isMoreLoading: false,
        strSearch: "",
        appState: AppState.currentState,
        languageModal: false,
        isShowLanguageIcon: false,
        languages: undefined,
        isShowReview: false,
        isListLoading: false
    }

    /** DID MOUNT */
    componentDidMount() {
        if (this.props.userIdFromRedux !== undefined && this.props.userIdFromRedux !== null && this.props.userIdFromRedux !== "") {
            if (this.props.token === undefined || this.props.token === null || this.props.token === "") {
                checkFirebasePermission(onSuccess => {
                    this.props.saveToken(onSuccess)
                    this.changeTokenAPI()
                },
                    error => {
                        console.log("Firebase Error :::::::: ", error)
                    })
            } else {
                this.changeTokenAPI();
            }
        }
        this.setState({ isLoading: true })
        this.loading = true
        this.getRestaurantData()
        this.getUserLanguage();
        this.getCartList()
        AppState.addEventListener('change', this._handleAppStateChange);
    }


    //#region CHANGE TOKEN
    /** CALL CHANGE TOKEN API */
    changeTokenAPI = () => {
        let params = {
            language_slug: this.props.lan,
            // token: this.props.phoneNumber,
            user_id: this.props.userIdFromRedux,
            firebase_token: this.props.token
        }
        changeToken(params,
            success => { debugLog("Change Token success ::::::::::: ", success) },
            failure => { debugLog("Change Token failure ::::::::::: ", failure) },
        )
    }
    //#endregion
    /**
     * @param { Applications status Active or Background } nextAppState
     */
    _handleAppStateChange = (nextAppState) => {

        if (nextAppState == 'active') {

        }
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {

            if (Platform.OS === 'android' && this.isAndroidPermission === true) {
                this.setState({ isPermissionLoading: false })

            } else {
                if (this.isAllowPermission === false) {
                    this.arrayRestaurants = undefined
                    this.getRestaurantData()
                }
            }
        }
        this.setState({ appState: nextAppState });
    }
    //#endregion


    /** WILL MOUNT */
    componentWillUnmount = () => {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    //#region GET USER LANGUAGE API
    /**
     * @param { on Success response object } success
     */
    onSuccessLanguage = (success) => {
        console.log('::: LANG CHANGED SUCCESS', success)
    }

    /**
     * @param { on Failure repsonse object } failure
     */
    onFailureLanguage = (failure) => {
        console.log('::: LANG CHANGED FAILED', failure)
    }
    /** CALL API FOR LANGUAGE
     *
     */
    getUserLanguage = () => {
        let lan = "en"
        getLanguage(
            success => {
                lan = success != undefined && success !== null ? success : 'en'
                let params = {
                    language_slug: lan,
                    // token: this.props.phoneNumber,
                    user_id: this.props.userIdFromRedux,
                }
                saveUserLanguageinDB(params, this.onSuccessLanguage, this.onFailureLanguage)
            },
            failure => {
                let params = {
                    language_slug: lan,
                    // token: this.props.phoneNumber,
                    user_id: this.props.userIdFromRedux,
                }
                saveUserLanguageinDB(params, this.onSuccessLanguage, this.onFailureLanguage)
            }
        )

    }
    //#endregion

    onLocationBtnPressed = () => {
        this.props.navigation.navigate('searchLocation')
    }

    onGPSPressed = () => {
        this.currentCity = undefined
        this.currentAddress = undefined
        this.props.saveCurrentLocation(undefined)
        this.onPullToRefreshHandler()
    }

    //#region
    /** SEARCH TEXT CHANGE */
    onTextChangeHandler = (text,) => {

        // this.shouldLoadMore = false
        // this.arrayRestaurants = undefined
        this.setState({ strSearch: text })
        // this.getRestaurantData(text, false, true)

    }
    //#endregion

    //#region On Search Pressed
    onSearchPressed = () => {
        if (this.state.strSearch == "" || !(/\S/.test(this.state.strSearch))) {
            return
        }
        else {
            this.setState({ isLoading: true })
            this.arrayRestaurants = []
            this.getRestaurantData();
        }
    }
    //#endregion

    //#region RENDER RIGHT TOP HEADER
    /**
     * @param { Index Number for Cart or Filter Tag } index
     */
    renderRightTopHeader = index => {
        if (this.props.cartCount > 0) {

            if (index == 0) {
                {
                    if (this.state.isShowLanguageIcon)
                        this._onChangeLanguagePressed()
                }
            } else if (index == 1) {
                this.props.navigation.navigate("Filter", {
                    getFilterDetails: this.getFilter,
                    filterType: "Main",
                    distance: this.distance,
                    foodArray: this.foodTypes,
                    sortType: this.sortType,
                    minFilterDistance: this.minFilterDistance,
                    maxFilterDistance: this.maxFilterDistance,
                    isShowReview: this.state.isShowReview
                });
            }
            else {
                if (this.table_id !== undefined && this.table_id !== "")
                    this.props.navigation.navigate("CheckOutContainer");
                else
                    this.props.navigation.navigate("CartContainer", { isview: false });
            }
        } else {
            if (index == 0) {
                if (this.state.isShowLanguageIcon)
                    this._onChangeLanguagePressed()
            }
            if (index == 1) {
                this.props.navigation.navigate("Filter", {
                    getFilterDetails: this.getFilter,
                    filterType: "Main",
                    foodArray: this.foodTypes,
                    distance: this.distance,
                    sortType: this.sortType,
                    minFilterDistance: this.minFilterDistance,
                    maxFilterDistance: this.maxFilterDistance,
                    isShowReview: this.state.isShowReview
                });
            }
        }
    };
    //#endregion

    /** NETWORK CONNECTIVITY */
    networkConnectivityStatus = () => {
        this.arrayCategories = undefined
        this.arrayRestaurants = undefined
        this.getRestaurantData()
    }
    //#endregion

    //#region filter FUNCTION
    /**
     * @param { } data
     */
    getFilter = data => {
        if (this.filter) {
            return
        }
        else {
            this.distance = data.distance;
            this.filter = true;
            this.arrayCategories = undefined;
            this.arrayRestaurants = undefined;
            this.foodTypes = data.foodArray
            this.sortType = data.sortType
            this.is_filter = data.applied
            this.getRestaurantData();
        }
    };
    //#endregion

    /**
    *
    * @param { Lattitude } lat
    * @param { Longitude } long
    * @param { Searched Text } searchText
    */
    getRestaurantData = (searchData, isForRefresh = false, showLoader = false) => {
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.locationError = false

        if (this.arrayRestaurants === undefined) {
            this.arrayRestaurants = [];
        }
        debugLog("REACHED HERE GET REST::::::")
        netStatus(isConnected => {
            if (isConnected) {
                if (this.props.currentLocation !== undefined && this.props.currentLocation !== null && this.props.currentLocation.latitude !== undefined) {
                    let param = {
                        user_id: this.props.userIdFromRedux,
                        language_slug: this.props.lan,
                        latitude: this.props.currentLocation.latitude,
                        longitude: this.props.currentLocation.longitude,
                        itemSearch: searchData || this.state.strSearch,
                        category_id: this.selectedCategory,
                        orderMode: this.orderMode,
                        // token: this.props.phoneNumber,
                        food: "" + this.foodTypes,
                        distance: "" + this.distance,
                        count: API_PAGE_SIZE,
                        sortBy: this.sortType,
                        page_no: (this.arrayRestaurants && !isForRefresh) ? parseInt(this.arrayRestaurants.length / API_PAGE_SIZE) + 1 : 1,
                    }
                    if (showLoader) {
                        this.setState({ isListLoading: true })
                    }
                    else if (searchData !== undefined && searchData.trim().length !== 0 && !showLoader) {
                        this.setState({ isLoading: true })
                    }
                    else if (!isForRefresh) {
                        this.setState({ isLoading: !showLoader && (this.arrayRestaurants === undefined || this.arrayRestaurants.length === 0), isMoreLoading: this.arrayRestaurants !== undefined && this.arrayRestaurants.length !== 0 });
                    }
                    homedata(param, this.onSuccessResData, this.onFailureResData, this.props);
                }
                else {
                    var paramPermission =
                        Platform.OS === 'ios'
                            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                            : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
                    checkPermission(
                        paramPermission,
                        () => {
                            getCurrentLocation(
                                onSucces => {
                                    this.getCurrentAddress(onSucces.latitude, onSucces.longitude);
                                    this.latitude = onSucces.latitude
                                    this.longitude = onSucces.longitude
                                    this.isAllowPermission = false
                                    this.setState({ locationError: false })
                                    let param = {
                                        user_id: this.props.userIdFromRedux,
                                        language_slug: this.props.lan,
                                        latitude: onSucces.latitude,
                                        longitude: onSucces.longitude,
                                        itemSearch: searchData || this.state.strSearch,
                                        category_id: this.selectedCategory,
                                        orderMode: this.orderMode,
                                        food: "" + this.foodTypes,
                                        distance: "" + this.distance,
                                        sortBy: this.sortType,
                                        count: API_PAGE_SIZE,
                                        page_no: (this.arrayRestaurants && !isForRefresh) ? parseInt(this.arrayRestaurants.length / API_PAGE_SIZE) + 1 : 1,
                                    }
                                    if (showLoader) {
                                        this.setState({ isListLoading: true })
                                    }
                                    else if (searchData !== undefined && searchData.trim().length !== 0 && !showLoader) {
                                        this.setState({ isLoading: true })
                                    }
                                    else if (!isForRefresh) {
                                        this.setState({ isLoading: !showLoader && (this.arrayRestaurants === undefined || this.arrayRestaurants.length === 0), isMoreLoading: this.arrayRestaurants !== undefined && this.arrayRestaurants.length !== 0 });
                                    }
                                    homedata(param, this.onSuccessResData, this.onFailureResData, this.props);
                                },
                                onFailure => {
                                    this.loading = false
                                    this.locationError = true
                                    if (onFailure == RESULTS.BLOCKED)
                                        this.permissionBlocked = true
                                    this.isAllowPermission = true
                                    if (onFailure.code == 1)
                                        this.strOnScreenMessage = strings("allowLocationSettings")
                                    else
                                        this.strOnScreenMessage = strings("currentLocationError")
                                    this.setState({ isListLoading: false, isLoading: false, isPermissionLoading: false, locationError: false })
                                },
                                GOOGLE_API_KEY)
                        },
                        onFailure => {
                            this.loading = false
                            if (onFailure == RESULTS.BLOCKED)
                                this.permissionBlocked = true
                            this.isAllowPermission = true
                            this.setState({
                                isLoading: false,
                                isListLoading: false,
                                locationError: true,
                                isPermissionLoading: false
                            })
                        }
                    )
                }
            } else {
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
                this.arrayRestaurants = []
                this.setState({ isListLoading: false, isLoading: false, isPermissionLoading: false, locationError: false });
            }
        })

    }
    //#endregion

    //#region GET RESTAURANT DATA API
    /**
     * @param { on Success response object } onSuccess
     */
    onSuccessResData = (onSuccess) => {
        this.loading = false
        this.strOnScreenMessage = '';
        this.filter = false
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.arrayCategories = onSuccess.category;
                this.arraySlider = onSuccess.slider;
                this.social_links = onSuccess.social_details
                

                if (onSuccess.enable_review !== undefined && onSuccess.enable_review !== null && onSuccess.enable_review == '1') {
                    this.setState({ isShowReview: true })
                } else {
                    this.setState({ isShowReview: false })
                }

                if (onSuccess.lanugages != undefined && onSuccess.lanugages.length > 1) {
                    this.setState({ languages: onSuccess.lanugages, isShowLanguageIcon: true })
                } else {
                    this.setState({ languages: onSuccess.lanugages, isShowLanguageIcon: false })
                }

                if (onSuccess.minimum_order_amount !== undefined && onSuccess.minimum_order_amount !== null) {
                    this.props.saveMinOrderAmount(onSuccess.minimum_order_amount)
                }

              
                if (onSuccess.currency != undefined && onSuccess.currency != null && onSuccess.currency !== '')
                    this.props.saveCurrencySymbol(onSuccess.currency)
                if (this.props.storeURL == undefined || this.props.storeUR == null || this.props.storeURL.length == 0) {
                    let storeURL = {
                        app_store_url: onSuccess.app_store_url,
                        play_store_url: onSuccess.play_store_url
                    }
                    this.props.saveStoreURLInRedux(storeURL)
                }
                if (this.props.socialURL == undefined || this.props.socialURL == null) {
                    this.props.saveSocialURLInRedux({
                        facebook: onSuccess.social_details.facebook,
                        linkedin: onSuccess.social_details.linkedin,
                        twitter: onSuccess.social_details.twitter
                    })
                }
                this.props.savePaymentDetails(onSuccess.payment_details);
                this.props.saveMapKey(onSuccess.google_map_api_key);

                this.minFilterDistance = onSuccess.minFilterDistance
                this.maxFilterDistance = onSuccess.maxFilterDistance

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

                this.homeSectionData = [
                    {
                        index: 0,
                        title: strings("nearByRestaurant"),
                        data: [{
                            arrayRestaurants: this.arrayRestaurants
                        }]
                    }
                ]
                this.setState({ isListLoading: false, isLoading: false, isPermissionLoading: false, isMoreLoading: false });
            } else {
                this.setState({ isListLoading: false, isLoading: false, isPermissionLoading: false, isMoreLoading: false });
            }
        } else {
            this.strOnScreenMessage = strings('noDataFound');
            this.setState({ isListLoading: false, isLoading: false, isPermissionLoading: false, isMoreLoading: false });
        }
    }

    /**
     * @param { on Failure Response Object } onFailure
     */
    onFailureResData = (onFailure) => {
        this.loading = false
        this.filter = false
        this.strOnScreenMessage = strings("generalWebServiceError")
        this.setState({ isListLoading: false, isLoading: false, isMoreLoading: false });
    }

    //Get Current Address 
    getCurrentAddress = (lat, long) => {
        getAddress(lat, long,
            onSuccess => {
                this.currentAddress = onSuccess.localArea
                this.currentCity = onSuccess.strAddress
                let addressData = {
                    latitude: lat,
                    longitude: long,
                    areaName: onSuccess.strAddress,
                    address: onSuccess.localArea
                }
                this.props.saveCurrentLocation(addressData)
            },
            this.onFailureGetAddress,
            GOOGLE_API_KEY
        )
    }

    onFailureGetAddress = onFailure => {
    }

    onDidFocusMainContainer = () => {

        if (this.props.languageArray !== undefined && this.props.languageArray.length > 1) {
            this.setState({ isShowLanguageIcon: true })
        } else {
            this.setState({ isShowLanguageIcon: false })
        }

        if (!this.is_filter)
            this.foodTypes = []
        if (this.props.currentLocation !== undefined && this.props.currentLocation !== null && this.props.currentLocation.latitude !== undefined) {
            if ((this.currentCity !== this.props.currentLocation.areaName || this.currentAddress !== this.props.currentLocation.address) && this.loading == false) {
                this.onPullToRefreshHandler()
            }
            this.currentAddress = this.props.currentLocation.address
            this.currentCity = this.props.currentLocation.areaName
        }
        else {
            this.onPullToRefreshHandler()
        }
        this.props.saveNavigationSelection("Home")

        this.getCartList();
        this.getFoodType()
    }

    /** CALL FOOD TYPE API */
    getFoodType = () => {
        if (this.props.foodType == undefined || this.props.foodType == null || this.props.foodType.length == 0) {
            netStatus(isConnected => {
                if (isConnected) {
                    let objFoodParams = {
                        language_slug: this.props.lan,
                    }
                    getFoodType(objFoodParams, this.onSuccessFoodType, this.onFailureFoodType)
                }
            })
        }
    }

    onSuccessFoodType = (onSuccess) => {
        if (onSuccess !== undefined && onSuccess.food_type !== undefined) {
            this.props.saveFoodTypeInRedux(onSuccess.food_type)
        }
    }

    onFailureFoodType = (onFailure) => { }

    onPullToRefreshHandler = () => {
        this.strOnScreenMessage = ""
        this.strOnScreenSubtitle = ""
        this.refreshing = false
        this.latitude = undefined
        this.longitude = undefined
        this.shouldLoadMore = false
        this.selectedCategory = ""
        this.arrayRestaurants = undefined
        this.setState({ isLoading: true, strSearch: "" })
        this.getRestaurantData()
        
    }

    onLoadMore = () => {
        if (this.shouldLoadMore && !this.state.isMoreLoading && !this.state.isLoading) {
            this.getRestaurantData()
        }
    }
    /** GET LIST OF CART ITEMS */
    getCartList = () => {
        getCartList(this.onSuccessCartList, onCartNotFound => {
            this.props.saveCartCount(0);
        }, error => { });
        this.props.saveNavigationSelection("Home");
    }

    //#region GET CART ITEMS
    /**
     * @param { Success Response Object } success
     */
    onSuccessCartList = (success) => {
        if (success != undefined) {
            let cartData = success.items;
            this.table_id = success.table_id;
            debugLog("TABEL ID :::", this.table_id)
            if (cartData.length > 0) {
                let count = 0;
                let price = 0
                cartData.map((item, index) => {
                    count = count + Number(item.quantity);
                    price = Number(price) + (item.quantity * Number(item.price))
                    if (item.addons_category_list != undefined && item.addons_category_list != []) {
                        array = item.addons_category_list
                        array.map(data => {
                            subArray = data.addons_list
                            subArray.map(innerData => {
                                price = Number(price) + Number(innerData.add_ons_price)
                            })
                        })
                    }
                });
                this.props.saveCartPrice(price);
                this.props.saveCartCount(count);
            } else if (cartData.length == 0) {
                this.props.saveCartPrice(0);
                this.props.saveCartCount(0);
            }
        } else { }
    }
    //#endregion
    //#endregion

    /** CATEGORY PRESSED EVENT */
    onCategoryPressed = (item) => {
        this.arrayRestaurants = [];
        if (this.selectedCategory == item.item.category_id) {
            this.selectedCategory = ""
            this.getRestaurantData();
        }
        else {
            this.selectedCategory = item.item.category_id;
            this.getRestaurantData();
        }
    }
    //#endregion

    /** ON POPULAR RES EVENT */
    onPopularResEvent = (restObjModel) => {
        this.props.navigation.navigate("RestaurantContainer", {
            restId: restObjModel.restuarant_id,
            content_id: restObjModel.content_id,
            currency: restObjModel.currency_symbol,
            isDineIn: false,
            isShowReview: this.state.isShowReview,
            resObj: restObjModel
        }
        );
    }
    //#endregion

    onOrderModeSelect = value => {
        this.orderMode = value;
        this.props.saveOrderModeInRedux(value)
        this.onPullToRefreshHandler()
    }

    onSearchBarLayout = (e) => {
        debugLog("SEarch layout :::::", e.nativeEvent)
    }

    // Section Header
    renderSectionHeader = () => {
        return (
            <View style={{ flex: 1 }}>
                {this.currentCity !== undefined || this.locationError ? (
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={this.onLocationBtnPressed}>
                        <EDRTLView style={[styles.locationStrap, { marginBottom: 0 }]}>
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
                ) : null}
                <RadioGroupWithHeader
                    selected={this.props.orderMode}
                    activeColor={EDColors.white}
                    forHome={true}
                    Texttitle={strings('selectMode')}
                    titleStyle={{ color: EDColors.white }}
                    viewStyle={styles.radioViewStyle}
                    radioColor={EDColors.white}
                    style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
                    lableStyle={{ fontFamily: EDFonts.semiBold }}
                    data={this.allOrderModes}
                    onSelected={this.onOrderModeSelect}
                />
                {/* BANNER IMAGES */}
                <BannerImages images={this.arraySlider} />

                {/* SEARCH BAR */}
                <EDHomeSearchBar
                    onLayout={this.onSearchBarLayout}
                    value={this.state.strSearch}
                    style={{ marginBottom: 10 }}
                    placeholder={strings("homeSearch")}
                    onChangeValue={this.onTextChangeHandler}
                    disabled={this.state.isLoading || this.state.isMoreLoading}
                    onSearchPress={this.onSearchPressed}
                />

                {/* CATEGORIZED RES LIST */}
                <EDResCategoryFlatList
                    arrayCategories={this.arrayCategories}
                    onCategoryPressed={this.onCategoryPressed}
                    modelSelected={this.selectedCategory}
                />
            </View>
        )
    }

    // SECTION BODY 
    renderBody = () => {
        return (
            <View style={{ flex: 1 }}>

                {/* POPULAR RESTAURANT LIST */}
                {this.arrayRestaurants != undefined && this.arrayRestaurants != null && this.arrayRestaurants.length > 0
                    ?
                    <View>
                        <EDRTLText title={strings("nearByRestaurant")} style={styles.title} />
                        <EDRestaurantDeatilsFlatList
                            arrayRestaurants={this.arrayRestaurants}
                            social_links={this.social_links !== undefined && this.social_links !== null ? this.social_links : {}}
                            openSocial={this.openSocialURL}
                            refreshing={this.refreshing}
                            onPopularResEvent={this.onPopularResEvent}
                            onEndReached={this.onLoadMore}
                            isShowReview={this.state.isShowReview}
                            isLoading={this.state.isListLoading}
                        />
                    </View>
                    :
                    // DATA NOT AVAILABE
                    (this.strOnScreenMessage || '').trim().length > 0 ? (
                        <ScrollView
                            contentContainerStyle={{ width: metrics.screenWidth, paddingBottom: 70 }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.refreshing || false}
                                    colors={[EDColors.primary]}
                                    onRefresh={this.onPullToRefreshHandler}
                                />}
                        >
                            < EDPlaceholderComponent style={{ marginTop: metrics.screenHeight * .08 }} title={this.strOnScreenMessage} subTitle={this.strOnScreenSubtitle} />
                        </ScrollView>
                    ) : null
                }
            </View>
        )
    }

    openSocialURL = url => {
        let strCallURL = url;
        if (strCallURL !== undefined && strCallURL !== null && strCallURL.trim().length !== 0) {
            if (strCallURL.toString().toLowerCase()[0] !== "h")
                strCallURL = "https://" + strCallURL
            if (Linking.canOpenURL(strCallURL)) {
                Linking.openURL(strCallURL).catch(error => {
                    debugLog('ERROR :: ', error);
                    showValidationAlert(strings('urlNotSupport'));
                });
            } else {
                showValidationAlert(strings('urlNotSupport'));
            }
        }
        else
            showValidationAlert(strings('urlNotSupport'));
    }


    //#region LOCATION BUTTON EVENTS
    onLocationEventHandler = () => {
        this.setState({ isLoading: true })
        if (this.permissionBlocked) {
            this.setState({ isPermissionLoading: true, isLoading: false })
            this.isAllowPermission = false
            this.isAndroidPermission = false
            if (Platform.OS == 'android')
                Linking.openSettings();
            else
                Linking.openURL('app-settings:')
        }
        else {
            this.getRestaurantData()
        }
    }
    //#endregion

    renderLoader = () => {
        return (
            this.state.isMoreLoading ?
                <Spinner color={EDColors.primary} size="large" /> : null
        )
    }

    _onSideMenuPressed = () => {
        this.props.navigation.openDrawer()
    }

    /**
    * LANGUAGE CHANGE PRESSED
    */
    _onChangeLanguagePressed = () => {
        this.setState({ languageModal: true })
    }

    /** RENDER LOGOUT DIALOGUE */
    renderLanguageSelectDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.languageModal}>
                <EDLanguageSelect
                    languages={this.props.languageArray}
                    lan={this.props.lan}
                    onChangeLanguageHandler={this.onChangeLanguageHandler}
                    onDismissHandler={this.onDismissLanguageHandler}
                    title={strings('changeLanguage')}
                />
            </EDPopupView>
        )
    }
    //#endregion

    onDismissLanguageHandler = () => {
        this.setState({ languageModal: false })
    }

    //#region FORGOT PASSWORD BUTTON EVENTS
    onChangeLanguageHandler = (language) => {

        this.setState({ languageModal: false })

        let lan = I18n.currentLocale();
        switch (language) {
            case 0: {
                lan = "en";
                I18n.locale = "en";
                break;
            }
            case 1: {
                lan = "fr";
                I18n.locale = "fr";
                break;
            }
            case 2: {
                lan = "ar";
                I18n.locale = "ar";
                break;
            }
        }
        this.props.saveLanguageRedux(lan);
        clearCartData(() => { }, () => { })
        saveLanguage
            (
                lan,
                success => {
                    RNRestart.Restart(); this.arrayRestaurants = undefined
                },
                error => { }
            );
    }

  

    //#endregion
    render() {
        return (
            <BaseContainer
                title={strings("homeTitle")}
                left={'menu'}
                // onLeftFC={this._onChangeLanguagePressed}
                // isLeftFC={this.state.isShowLanguageIcon}
                // menuFC={"language"}
                right={this.state.locationError ? [] : this.props.cartCount > 0
                    ? [this.state.isShowLanguageIcon ? { url: "language", name: "language", type: "material" } : {}, { url: "filter", name: "filter", type: "ant-design" }, { url: "shopping-cart", name: "Cart", value: this.props.cartCount, type: "ant-design" },]
                    : [this.state.isShowLanguageIcon ? { url: "language", name: "language", type: "material" } : {}, { url: "filter", name: "filter", type: "ant-design" }]}
                onLeft={this._onSideMenuPressed}
                onRight={this.renderRightTopHeader}
                onConnectionChangeHandler={this.networkConnectivityStatus}
                loading={this.state.isLoading}>

                {/* NAVIGATION EVENTS */}
                <NavigationEvents onDidFocus={this.onDidFocusMainContainer} />

                {/* LANGUAGE SELECTION DIALOG */}
                {this.renderLanguageSelectDialogue()}

                {/* LOCATION STRIP */}
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
                            isLoadingPermission={this.state.isPermissionLoading}
                            onLocationEventHandler={this.onLocationEventHandler}
                        />
                    </View>
                    :
                    <SectionList
                        sections={this.homeSectionData}
                        extraData={this.arrayRestaurants}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.refreshing || false}
                                colors={[EDColors.primary]}
                                onRefresh={this.onPullToRefreshHandler}
                            />}
                        renderItem={this.renderBody}
                        renderSectionHeader={this.renderSectionHeader}
                        ListFooterComponent={this.renderLoader}
                        stickySectionHeadersEnabled={false}
                    />
                }
            </BaseContainer>
        )
    }
}

const styles = StyleSheet.create({
    locationStrap: {
        // flexDirection: isRTLCheck() ? "row-reverse" : "row",
        backgroundColor: EDColors.primary,
        padding: 10,
        justifyContent: 'space-between',
        // alignItems:'center'
    },
    title: {
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(18),
        color: EDColors.black,
        marginVertical: 10,
        marginHorizontal: 15
    },
    radioViewStyle: {
        paddingHorizontal: 5, paddingVertical: 10, margin: 0, backgroundColor: EDColors.primary, borderRadius: 0
    }
})

export default connect(
    state => {
        return {
            userIdFromRedux: state.userOperations.userIdInRedux,
            token: state.userOperations.token,
            phoneNumber: state.userOperations.phoneNumberInRedux,
            lan: state.userOperations.lan,
            cartCount: state.checkoutReducer.cartCount,
            storeURL: state.userOperations.storeURL,
            currentLocation: state.userOperations.currentLocation,
            foodType: state.userOperations.foodType,
            notification: state.userOperations.notification,
            languageArray: state.userOperations.languageArray,
            orderModeInRedux: state.userOperations.orderMode,

        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            },
            saveCurrencySymbol: symbol => {
                dispatch(saveCurrencySymbol(symbol))
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveToken: token => {
                dispatch(saveUserFCMInRedux(token))
            },
            saveStoreURLInRedux: data => {
                dispatch(saveStoreURL(data))
            },
            saveSocialURLInRedux: data => {
                dispatch(saveSocialURL(data))
            },
            saveCurrentLocation: data => {
                dispatch(saveCurrentLocation(data));
            },
            savePaymentDetails: data => {
                dispatch(savePaymentDetailsInRedux(data))
            },
            saveMapKey: data => {
                dispatch(saveMapKeyInRedux(data))
            },
            saveFoodTypeInRedux: food_type => {
                dispatch(saveFoodType(food_type))
            },
            saveCartPrice: data => {
                dispatch(saveCartPrice(data));
            },
            saveMinOrderAmount: data => {
                dispatch(saveMinOrderAmount(data))
            },
            saveTableID: table_id => {
                dispatch(saveTableIDInRedux(table_id))
            },
            saveResID: table_id => {
                dispatch(saveResIDInRedux(table_id))
            },
            saveOrderModeInRedux: mode => {
                dispatch(saveOrderMode(mode))
            }
        };
    }
)(MainContainer);
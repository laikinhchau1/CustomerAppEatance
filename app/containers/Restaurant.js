
import React from "react";
import { StyleSheet, TouchableOpacity, View, Animated, Text, Platform, RefreshControl, SafeAreaView } from "react-native";
import Toast, { DURATION } from "react-native-easy-toast";
import { Icon } from "react-native-elements";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import Assets from "../assets";
import EDCategoryOrder from "../components/EDCategoryOrder";
import EDImage from "../components/EDImage";
import EDItemDetails from "../components/EDItemDetails";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from "../components/EDPopupView";
import EDRTLText from "../components/EDRTLText";
import RestaurantOverview from "../components/RestaurantOverview";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCurrencySymbol, saveCartPrice } from "../redux/actions/Checkout";
import { getCartList, saveCartData, saveCurrency_Symbol, clearCartData, saveMenu } from "../utils/AsyncStorageHelper";
import { showValidationAlert, showConfirmationDialogue } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, getProportionalFontSize, isRTLCheck, RESPONSE_FAIL, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { ResDetails, getRestaurantMenu } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import EDRadioDailogWithButton from "../components/EDRadioDailogWithButton";
import EDMenuListComponent from "../components/EDMenuListComponent";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { saveTableIDInRedux, saveResIDInRedux } from "../redux/actions/User";
import { FlatList } from "react-native";
import EDRTLView from "../components/EDRTLView";
import { initialWindowMetrics } from "react-native-safe-area-context";
import CartItem from "../components/CartItem";

export class Restaurant extends React.Component {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.popularItems = []
        this.restaurantDetails = undefined
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.resObj = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.resObj : []
        this.resId = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.restId : ""
        this.content_id = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.content_id : null
        this.isDineIn = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.isDineIn : false
        this.showRestReview = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.isShowReview : false
        this.selectedItem = ""
        this.cartDataDict = {}
        this.isOpen = "open"
        this.tempArrayItem = []
        this.tempQty = 0
        this.priceType = "";
        this.availType = 0
        this.foodArray = []
        this.sectionData = []
        this.menuArray = []
        this.is_filter = false
        this.takeToCheckout = false
        this.itemToRemove = {}

    }

    state = {
        isLoading: false,
        visible: false,
        refresh: this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.refresh : null,
        isCategory: false,
        key: 1,
        keyAPI: 0,
        cartData: [],
        cartLoading: false,
        isCartModalVisible: false,
        isCustomItem: false,
        isMenuLoading: false,
        height: metrics.screenHeight * 0.36,
        isShowReview: false,
        scrolledHeight: undefined,
        menuListScroll: undefined,
        removeModal: false,
        recipeVisible: false,
        isSearchVisible: false,
        strSearch: ""
    };

    //#region 
    /** NETWORK CONNECTIVITY */
    networkConnectivityStatus = () => {
        if (!this.is_filter)
            this.foodArray = []

        this.getRestaurantDetails();
        this.getCartDataList()

    }
    //#endregion

    getCartDataList = () => {
        getCartList(this.onSuccessCartListAsync, this.onCartNotFound, this.onFailureCartListAsync);
    }

    //#region 
    /**
     * @param { Success Cart List From ASync } success
     */
    onSuccessCartListAsync = (success) => {
        console.log('[][[][][][][][ ASYNC', success)
        this.cartDataDict = success
        this.setState({
            cartData: success.items,
            key: this.state.key + 1
        })
        if (success.table_id !== undefined && success.table_id !== "")
            this.takeToCheckout = true
        else
            this.takeToCheckout = false
    }

    onFailureCartListAsync = () => { }

    /**
     * 
     */
    onCartNotFound = (data) => {
        var cartData = {};

        cartData = {
            resId: this.resId,
            items: [],
            coupon_name: "",
            cart_id: 0
        };

        this.cartDataDict = cartData
    }

    /**
     * @param { Text Function object } data
     */
    testFunction = data => {
        console.log("FILTER DATA :::::::" + JSON.stringify(data))
        this.foodArray = data.foodArray
        this.priceType = data.price;
        this.availType = data.availType;
        this.menuArray = []
        this.sectionData = []
        this.is_filter = data.applied
        // this.getRestaurantMenuDetails();
        this.getRestaurantDetails()
    };

    onPullToRefreshHandler = () => {
        console.log('::::::::::::::::::::::::::::::: IN PULL TO REFRESH')
        this.popularItems = []
        this.menuArray = []
        this.sectionData = []
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.state.isSearchVisible = false
        // this.getRestaurantMenuDetails();
        this.getRestaurantDetails()
    }

    cancelSearch = () => {
        this.setState({ isSearchVisible: false })
    }

    //#region STORE
    /** STORE DATA */
    storeData = (data, qty = 1, customQty = "") => {
        var cartArray = [];
        var cartData = {};

        if (this.props.table_id !== undefined && this.props.table_id !== "")
            this.takeToCheckout = true
        else
            this.takeToCheckout = false
        if (this.props.res_id !== undefined && this.props.res_id !== this.resId) {
            showConfirmationDialogue(strings("activeDineInSession"), [], "", () => {
                this.props.saveTableID(undefined);
                this.props.saveResID(undefined);
                this.takeToCheckout = false
                this.storeData(data, qty)
            })
        }
        else
            getCartList(
                success => {
                    console.log(':::::::::::', success)
                    if (success != undefined) {
                        cartArray = success.items;
                        if (cartArray.length > 0) {
                            if (success.resId == this.resId) {
                                var repeatArray = cartArray.filter(item => { return item.menu_id == data.menu_id; });

                                if (repeatArray.length > 0) {
                                    if (qty == -1 && repeatArray[repeatArray.length - 1].quantity == 1) {
                                        cartArray = cartArray.filter(item => { return item.menu_id !== data.menu_id; });
                                    }
                                    else {
                                        if (customQty !== "")
                                            repeatArray[repeatArray.length - 1].quantity = customQty;
                                        else {
                                            repeatArray[repeatArray.length - 1].quantity < 999 || qty == -1 ?
                                                repeatArray[repeatArray.length - 1].quantity = repeatArray[repeatArray.length - 1].quantity + qty
                                                : showValidationAlert(strings("qtyExceed"))

                                        }
                                    }
                                } else {
                                    data.quantity = (customQty !== "" ? customQty : qty);
                                    cartArray.push(data);
                                }

                                cartData = {
                                    resId: this.resId,
                                    items: cartArray.filter(data => data.quantity !== 0),
                                    coupon_name:
                                        success.coupon_name.length > 0 ? success.coupon_name : "",
                                    cart_id: success.cart_id,
                                    table_id: success.table_id !== undefined ? success.table_id : this.props.table_id
                                };

                                this.updateCount(cartData.items, repeatArray.length == 0);
                                this.saveData(cartData);
                                this.setState({ cartData: cartData.items, key: this.state.key + 1 })
                            } else {
                                this.tempArrayItem = data
                                this.tempQty = qty
                                this.setState({ visible: false, isCartModalVisible: true, isCustomItem: false, recipeVisible: false })
                            }
                        } else if (cartArray.length == 0) {
                            //cart empty
                            data.quantity = (customQty !== "" ? customQty : qty);
                            cartData = {
                                resId: this.resId,
                                items: [data],
                                coupon_name: "",
                                cart_id: 0
                            };
                            if (this.props.table_id !== undefined && this.props.table_id !== "")
                                cartData.table_id = this.props.table_id;
                            this.updateCount(cartData.items, true);
                            this.saveData(cartData);
                            this.setState({ cartData: cartData.items, key: this.state.key + 1 })
                        }
                    } else {
                        //cart has no data
                        data.quantity = (customQty !== "" ? customQty : qty);
                        cartData = {
                            resId: this.resId,
                            items: [data],
                            coupon_name: "",
                            cart_id: 0
                        };
                        if (this.props.table_id !== undefined && this.props.table_id !== "")
                            cartData.table_id = this.props.table_id;
                        this.updateCount(cartData.items, true);
                        this.saveData(cartData);
                        this.setState({ cartData: cartData.items, key: this.state.key + 1 })
                    }
                    this.props.navigation.state.params.categoryArray = undefined
                },
                onCartNotFound => {
                    //first time insert data
                    data.quantity = (customQty !== "" ? customQty : qty);
                    cartData = {
                        resId: this.resId,
                        items: [data],
                        coupon_name: "",
                        cart_id: 0
                    };
                    if (this.props.table_id !== undefined && this.props.table_id !== "")
                        cartData.table_id = this.props.table_id;
                    this.updateCount(cartData.items, true);
                    this.saveData(cartData);
                    this.setState({
                        cartData: cartData.items,
                        key: this.state.key + 1
                    })
                },
                error => {
                }
            );
    }

   
    //#region 
    /** UPDATE DATA */
    updateCount(data, shouldShowToast) {
        debugLog("::::::::: toast call with data ::::::::", data);
        if (shouldShowToast)
            this.refs.toast.show(strings("addItemSuccess"), DURATION.LENGTH_SHORT);

        var count = 0;
        var price = 0
        var array = []
        var subArray = []
        data.map((item, index) => {
            count = count + item.quantity;
            price = item.offer_price !== undefined && item.offer_price !== ''
                ? Number(price) + (item.quantity * parseInt(item.offer_price))
                : Number(price) + (item.quantity * Number(item.price))
            if (item.addons_category_list != undefined && item.addons_category_list != []) {
                array = item.addons_category_list
                array.map(data => {
                    subArray = data.addons_list
                    subArray.map(innerData => {
                        price = Number(price) + (item.quantity * Number(innerData.add_ons_price))
                    })
                })
            }
        });
        this.props.saveCartCount(count);
        this.props.saveCartPrice(price);
    }
    //#endregion

    //#region SAV EDATA
    saveData(data) {
        saveCartData(data, success => { }, fail => { });
    }

    //#region ITEM DETAILS
    renderItemDetails = () => {
        return (
            <EDPopupView isModalVisible={this.state.visible}>
                <EDItemDetails
                    data={this.selectedItem}
                    cartLoading={this.state.cartLoading}
                    onDismissHandler={this.onDismissItemDetailHandler}
                    onPress={this.onPressAddtoCartItemHandler}
                    isOpen={this.isOpen.toLowerCase() === "open" ? true : false}
                    cartData={this.state.cartData.length === 0 ? [] : this.state.cartData}
                    navigateToCart={this.navigateToCart}
                    onRecipeDetails={this.onRecipeDetails}
                />
            </EDPopupView>
        )
    }

    onRecipeDetails = (item) => {
        this.setState({ visible: false })
        this.props.navigation.navigate("RecipeDetail", {
            "detail": item.menuitem_recipe,
            "menuitem": item,
            "currency_symbol": this.props.currency,
            "resId": this.resId,
            "contentId": this.content_id,
            "isOpen": this.isOpen.toLowerCase() === "open" ? true : false
        })
    }

    renderCartChangeModal = () => {
        return (
            <EDPopupView isModalVisible={this.state.isCartModalVisible}>
                <EDRadioDailogWithButton
                    title={strings('askAddToCart')}
                    Texttitle={strings('cartClearWarningMsg')}
                    titleStyle={{ fontFamily: EDFonts.bold, marginBottom: 20 }}
                    label={strings('dialogConfirm')}
                    onCancelPressed={this.onCartAddCancelPressed}
                    onContinueButtonPress={this.onCartAddContinuePressed} />

            </EDPopupView>
        )
    }

    onCartAddContinuePressed = value => {
        if (value != undefined && value == 1) {
            this.setState({ isCartModalVisible: false })
        } else {
            this.props.saveCartCount(0);
            clearCartData(success => { }, failure => { })
            if (this.state.isCustomItem)
                this.onPressAddtoCartItemHandler(this.tempArrayItem, this.tempQty)
            else
                this.storeData(this.tempArrayItem, this.tempQty)
            this.setState({ isCartModalVisible: false, isCustomItem: false })
        }
    }

    onCartAddCancelPressed = () => {
        this.setState({ isCartModalVisible: false })
    }

    //#region 
    /** RENDER CATEGORY MODEL */
    renderCategoryOrder = () => {
        return (
            <EDPopupView isModalVisible={this.state.isCategory}>
                <EDCategoryOrder
                    image={this.selectedItem.image}
                    currency={this.props.currency}
                    price={this.selectedItem.offer_price != "" ? this.selectedItem.offer_price : this.selectedItem.price}
                    onDismissHandler={this.onDismissHandler}
                    categoryName={this.selectedItem.name}
                    newButtomHandler={this.onNewButtonHandler}
                    repeatButtonHandler={this.onRepeatButtonHandler}
                />
            </EDPopupView>
        )
    }

    onCartItemPressed = () => {
        if (this.takeToCheckout)
            this.props.navigation.navigate("CheckOutContainer", { isDineOrder: true });
        else
            this.props.navigation.navigate("CartContainer", { isview: false });
    }

    renderSectionHeader = () => {
        return (
            <View style={{ backgroundColor: EDColors.offWhite }}>
                <EDImage
                    source={this.restaurantDetails.image}
                    placeholder={Assets.logo}
                    resizeMode={'cover'}
                    placeholderResizeMode={'contain'}
                    placeholderStyle={[style.ImageStyle, {
                        height: metrics.screenHeight * 0.1,
                        paddingVertical: metrics.screenHeight * 0.15,
                    }]}
                    style={style.ImageStyle} />
                <View style={{ marginTop: -40, marginBottom: 10 }}>
                    <RestaurantOverview
                        item={this.restaurantDetails}
                        isShow={this.state.isShowReview}
                        onButtonClick={this.onReviewPress}
                        showRestReview={this.showRestReview}
                        isRestaurant={true}
                        total_reviews={this.resObj !== undefined && this.resObj !== null && this.resObj.restaurant_review_count !== undefined && this.resObj.restaurant_review_count !== null ? this.resObj.restaurant_review_count : null}
                        rating={this.resObj !== undefined && this.resObj !== null && this.resObj.rating !== undefined && this.resObj.rating !== null ? this.resObj.rating : null}
                    />
                    {this.isOpen.toLowerCase() === 'close' ? <EDRTLText style={{ textAlign: 'center', color: EDColors.error, marginVertical: 10, fontFamily: EDFonts.medium }}
                        title={strings("currentlyNotAccepting")} /> : null}
                    {/* <EDRTLText
                        style={style.ourMenu}
                        title={strings("restaurantMenu")}
                    /> */}
                </View>

            </View>
        )
    }

    onDismissRemove = () => {
        this.setState({ removeModal: false })
    }

    //#region
    /** ON PLUS CLICKED */
    onPlusEventHandler = (value, index) => {
        console.log("in plus event::::: ", this.state.cartData)
        if (value > 0) {
            var array = this.state.cartData
            this.state.cartData[index].quantity = value;
            this.updateUI(this.state.cartData);
        }
        console.log("UPADTED ARRAY", this.state.cartData)
    };
    //#endregion

    //#region
    /** ONMINUS CLICKED */
    onMinusEventHandler = (value, index) => {
        debugLog("MINUS EVENT ::::", value, index)
        // if (value > 0) {
        //     var array = this.state.cartData
        //     this.state.cartData.items[index].quantity = value;
        //     this.updateUI(this.state.cartData);
        // } else if (value == 0) {
        // }
        // console.log("UPADTED ARRAY", this.state.cartData)
    };
    //#endregion

    deleteHandler = (index) => {
        debugLog("DELETE INDEX :::::", index)
        var array = this.state.cartData;
        array.splice(index, 1);
        this.updateUI(array)
    }

    //#region UPDATE UI
    updateUI(items) {
        console.log("UPDATED UI CALLED::::: ", items)
        let cartData = {
            resId: this.resId,
            items: items,
            coupon_name: "",
            cart_id: ""
        };
        this.cartDataDict = cartData
        this.updateCount(cartData.items, false);
        this.saveData(cartData);
        this.setState({
            cartData: cartData.items,
            key: this.state.key + 1
        })

    }

    /** RENDER ITEMS TO REMOVE MODEL */
    renderRemoveItems = () => {

        let cartItems = this.state.cartData || {}
        debugLog("CART ITEMS ::::", cartItems, this.itemToRemove, this.state.removeModal)
        if (!cartItems.map(e => e.menu_id).includes(this.itemToRemove.menu_id)) {
            if (this.state.removeModal)
                this.onDismissRemove();
        }
        return (
            <EDPopupView isModalVisible={this.state.removeModal}
                shouldDismissModalOnBackButton={true}
                onRequestClose={this.onDismissRemove}
            >

                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={this.onDismissRemove}
                />
                <SafeAreaView style={style.removeContainer}>

                    <View style={style.topSeperator} ></View>

                    <EDRTLView style={style.removeHeader}>
                        <EDRTLText title={strings("chooseToRemove")} style={style.chooseItem} />
                        <Icon
                            color={EDColors.primary}
                            name="close" size={getProportionalFontSize(20)} onPress={this.onDismissRemove} />
                    </EDRTLView>

                    <View style={{ height: 1, backgroundColor: "#F6F6F6", marginBottom: 5, width: '90%', alignSelf: "center" }}></View>

                    <FlatList
                        data={cartItems}
                        style={[style.removeList, { marginBottom: Platform.OS == "ios" ? initialWindowMetrics.insets.bottom : 0 }]}
                        extraData={this.state}
                        keyExtractor={(item, index) => item.menu_id + index}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => {
                            console.log("ITEMS IN CART ITEMS::::: ", item, index)
                            return (
                                item.menu_id == this.itemToRemove.menu_id ?
                                    <>
                                        <CartItem
                                            key={this.state.key}
                                            index-={index}
                                            items={item}
                                            currency={this.restaurantDetails.currency_symbol}
                                            price={
                                                item.offer_price !== '' &&
                                                    item.offer_price !== undefined &&
                                                    item.offer_price !== null
                                                    ? item.offer_price
                                                    : item.price
                                            }
                                            addonsItems={
                                                item.addons_category_list === undefined ? [] : item.addons_category_list
                                            }
                                            iscounts={item.addons_category_list === undefined ? true : false}
                                            quantity={item.quantity}
                                            onPlusClick={this.onPlusEventHandler}
                                            onMinusClick={this.onMinusEventHandler}
                                            deleteClick={() => this.deleteHandler(index)}
                                            forRemoval={true}
                                        />
                                        <View style={{ height: index !== cartItems.length - 1 ? 1 : 0, backgroundColor: "#F6F6F6", marginBottom: 5, width: '90%', alignSelf: "center" }} />
                                    </>
                                    : null
                            );
                        }}
                    />
                </SafeAreaView>
            </EDPopupView>
        )
    }



    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("restaurantTitle")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[
                    (this.menuArray.length !== 0 ? { url: "search1", name: "Search", type: "ant-design" } : {}),
                    { url: "shopping-cart", name: "Cart", value: this.props.cartCount, type: "ant-design" }, { url: "filter", name: "filter", type: "ant-design" }]}
                onLeft={this._onLeftPressed}
                onRight={this._onRightPressed}
                onConnectionChangeHandler={this.networkConnectivityStatus}
                loading={this.state.isMenuLoading || this.state.isLoading}>

                {/* NAVIGATION EVENTS */}
                <NavigationEvents onWillFocus={this.networkConnectivityStatus} />

                {/* TOAST */}
                <Toast ref="toast" position="center" fadeInDuration={0} />

                {/* SAFE AREA */}
                <SafeAreaView style={{ flex: 1 }}>

                    {/* MAIN VIEW */}
                    <View style={{ flex: 1 }} >

                        {this.restaurantDetails !== undefined ?

                            <View style={style.mainContainer}>

                                {this.renderItemDetails()}

                                {this.renderCategoryOrder()}

                                {this.renderCartChangeModal()}

                                {this.state.cartData !== [] ? this.renderRemoveItems() : null}

                                {this.menuArray !== undefined && this.menuArray.length > 0 ?

                                    <View style={{ flex: 1 }}>
                                        <EDMenuListComponent
                                            onPullToRefreshHandler={this.onPullToRefreshHandler}
                                            ListHeaderComponent={this.renderSectionHeader}
                                            data={this.sectionData}
                                            data2={this.sectionData}
                                            currency_Symbol={this.restaurantDetails.currency_symbol}
                                            cartData={this.state.cartData.length === 0 ? [] : this.state.cartData}
                                            isOpen={this.isOpen.toLowerCase() === "open" ? true : false}
                                            plusAction={this.onResDetailsPlusEvent}
                                            minusItems={this.onResDetailsMinusEvent}
                                            addData={this.onResDetailsAddEvent}
                                            addOneData={this.storeData}
                                            onProductPress={this.onProductPress}
                                            scrolledHeight={this.state.menuListScroll}
                                            screenHeight={height => this.scrollListHeight(height)}
                                            isSearchVisible={this.state.isSearchVisible}
                                            cancelSearch={this.cancelSearch}
                                        // refreshControl={this.onPullToRefreshHandler}
                                        />
                                        {debugLog("Props ::::", this.restaurantDetails.flag_delivery_order)}
                                        {this.props.minOrderAmount !== undefined && this.isDineIn == false ?
                                            this.props.cartPrice !== undefined && this.props.cartPrice >= this.props.minOrderAmount
                                                ? null :
                                                (this.restaurantDetails !== undefined && this.restaurantDetails.flag_delivery_order == true
                                                    ?
                                                    <View style={{ backgroundColor: EDColors.primary, alignItems: 'center' }}>
                                                        <Text style={{ color: EDColors.white, fontSize: 14, marginVertical: 5, marginHorizontal: 5, fontFamily: EDFonts.medium, textAlign: 'center', }}>
                                                            {isRTLCheck() ? strings('minOrderMsg')  + this.props.minOrderAmount + this.props.currency + strings('minOrderMsg2') : strings('minOrderMsg') + this.props.currency + this.props.minOrderAmount + strings('minOrderMsg2')}</Text>
                                                    </View> : null) : null}

                                        {this.props.cartCount !== undefined && this.props.cartCount !== null && this.props.cartCount >= 1 ? (
                                            <View>
                                                <View style={{
                                                    marginBottom: Platform.OS == 'android' ? 10 : 10,
                                                    height: Platform.OS == 'android' ? heightPercentageToDP('6.0%') : heightPercentageToDP('6.0%'),
                                                    borderRadius: 16, marginHorizontal: 10, marginTop: 10
                                                }}>
                                                    <TouchableOpacity
                                                        onPress={this.onCartItemPressed}
                                                        style={[style.themeButton, { marginTop: heightPercentageToDP('0.1%') }]}>
                                                        <Text style={[style.themeButtonText]}>{strings('restaurantOrder') + (this.props.cartCount != undefined ? this.props.cartCount.toString() : '')}</Text>
                                                        <Text style={style.themeButtonText}>{strings('restaurantFor')}</Text>
                                                        <Text style={[style.themeButtonText]}>{(this.props.cartPrice != undefined ? this.props.currency + (Math.round(this.props.cartPrice * 100) / 100).toString() : '')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : null}


                                    </View>
                                    : (this.strOnScreenMessage).trim().length > 0
                                        ? (
                                            <View style={style.noDataViewStyle}>
                                                <EDPlaceholderComponent
                                                    title={this.strOnScreenMessage}
                                                    subTitle={this.strOnScreenSubtitle}
                                                />
                                            </View>) : null}


                            </View>
                            : (this.strOnScreenMessage.trim().length > 0 ?
                                <View style={style.noDataViewStyle}>
                                    <EDPlaceholderComponent
                                        title={this.strOnScreenMessage}
                                        subTitle={this.strOnScreenSubtitle}
                                    />
                                </View> : null)}

                    </View>
                </SafeAreaView>
                {/* } */}
            </BaseContainer>
        );
    }
    //#endregion

    scrollListHeight = height => {
        this.setState({ scrolledHeight: height })
    }

    //#region 
    /** RES DETAILS PLUS EVENT */
    onResDetailsPlusEvent = (itemdata, data) => {
        this.setState({
            isCategory: true,
            selectedData: data
        })
        this.selectedItem = itemdata
    }
    //#endregion

    //#region 
    /** RES DETAILS MINUS EVENT */
    onResDetailsMinusEvent = (value) => {
        if (this.state.visible)
            this.setState({ visible: false, removeModal: true, recipeVisible: false })
        this.itemToRemove = value
        this.setState({ removeModal: true })

        // this.props.navigation.navigate("CartContainer", { isview: value })
    }
    //#endregion

    onProductPress = data => {
        this.selectedItem = data
        this.setState({
            visible: true
        })
    }

    //#region BACK PRESS HANDLER
    _onLeftPressed = () => {
        this.props.navigation.goBack();
    }
    //#endregion

    /** ON RIGHT EVENT HANDLER */
    /**
     * @param { Index Number Selected } index
     */
    _onRightPressed = (index) => {
        if (index == 0) {
            if (this.menuArray.length !== 0) {
                this.setState({ strSearch: "", isSearchVisible: true })
            }
        }
        else if (index == 1) {
            if (this.props.cartCount > 0) {
                if (this.takeToCheckout)
                    this.props.navigation.navigate("CheckOutContainer", { isDineOrder: true });
                else
                    this.props.navigation.navigate("CartContainer", { isview: false });
            } else {
                showValidationAlert(strings("cartItemNotAvailable"));
            }
        } else if (index == 2) {
            this.props.navigation.navigate("Filter", {
                getFilterDetails: this.testFunction,
                filterType: "menu",
                price: this.priceType,
                availType: this.availType,
                foodArray: this.foodArray
            });
        }
    };

    navigateToCart = (value) => {
        if (this.props.cartCount > 0) {
            // this.props.navigation.navigate("CartContainer", { isview: false });
            this.itemToRemove = value
            this.setState({ removeModal: true })

        } else {
            showValidationAlert(strings("cartItemNotAvailable"));
        }
    }

    //#region ON CLOSE EVENT HANDLER
    onDismissItemDetailHandler = () => {
        this.setState({ visible: false, recipeVisible: false });
    }
    //#endregion

    onPressAddtoCartItemHandler = (item, qty, customQty = "") => {
        if (item.is_customize === "0") {
            this.storeData(item, qty, customQty)
        } else {

            var cartArray = [];
            getCartList(
                success => {
                    console.log('[][[][][][][][ 2', success)
                    if (success !== undefined) {
                        cartArray = success.items;
                        if (cartArray.length > 0) {
                            if (success.resId !== this.resId) {
                                this.tempArrayItem = item
                                this.tempQty = qty
                                this.setState({ visible: false, isCartModalVisible: true, isCustomItem: true, recipeVisible: false })
                            } else {
                                if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                                    var repeatItem = this.cartDataDict.items.filter(items => {
                                        return items.menu_id == item.menu_id
                                    })

                                    if (repeatItem.length > 0) {
                                        this.selectedItem = item
                                        this.setState({
                                            isCategory: true,
                                            visible: false,
                                            recipeVisible: false
                                        })
                                    } else {
                                        this.setState({ visible: false, recipeVisible: false })
                                        this.onResDetailsAddEvent(item)
                                    }
                                } else {
                                    this.setState({ visible: false, recipeVisible: false })
                                    this.onResDetailsAddEvent(item)
                                }
                            }
                        } else {
                            if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                                var repeatItem = this.cartDataDict.items.filter(items => {
                                    return items.menu_id == item.menu_id
                                })

                                if (repeatItem.length > 0) {
                                    this.selectedItem = item
                                    this.setState({
                                        isCategory: true,
                                        visible: false,
                                        recipeVisible: false
                                    })
                                } else {
                                    this.setState({ visible: false, recipeVisible: false })
                                    this.onResDetailsAddEvent(item)
                                }
                            } else {
                                this.setState({ visible: false, recipeVisible: false })
                                this.onResDetailsAddEvent(item)
                            }
                        }
                    } else {
                        if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                            var repeatItem = this.cartDataDict.items.filter(items => {
                                return items.menu_id == item.menu_id
                            })

                            if (repeatItem.length > 0) {
                                this.selectedItem = item
                                this.setState({
                                    isCategory: true,
                                    visible: false,
                                    recipeVisible: false
                                })
                            } else {
                                this.setState({ visible: false, recipeVisible: false })
                                this.onResDetailsAddEvent(item)
                            }
                        } else {
                            this.setState({ visible: false, recipeVisible: false })
                            this.onResDetailsAddEvent(item)
                        }
                    }
                },
                notfound => {
                    if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                        var repeatItem = this.cartDataDict.items.filter(items => {
                            return items.menu_id == item.menu_id
                        })

                        if (repeatItem.length > 0) {
                            this.selectedItem = item
                            this.setState({
                                isCategory: true,
                                visible: false,
                                recipeVisible: false
                            })
                        } else {
                            this.setState({ visible: false, recipeVisible: false })
                            this.onResDetailsAddEvent(item)
                        }
                    } else {
                        this.setState({ visible: false, recipeVisible: false })
                        this.onResDetailsAddEvent(item)
                    }
                }
            )
        }
    }

    onDismissHandler = () => {
        this.setState({
            isCategory: false
        })
    }

    onNewButtonHandler = () => {
        this.setState({ isCategory: false })
        this.onResDetailsAddEvent(this.selectedItem)
    }

    onRepeatButtonHandler = () => {
        this.setState({ isCategory: false })

        this.selectedArray = this.cartDataDict.items.filter((items) => {
            return items.menu_id === this.selectedItem.menu_id
        })
        this.lastSelectedData = this.selectedArray[this.selectedArray.length - 1]
        this.storeData(this.lastSelectedData, 1);
    }

    //#region 
    /** RES DETAILS ADD EVENT */
    onResDetailsAddEvent = (addData) => {
        this.setState({ isLoading: true })
        var data
        this.menuArray.map(item => {
            item.items != undefined ? item.items.map(subItem => {
                if (subItem.menu_id == addData.menu_id) {
                    data = subItem
                }
            }) : null
        })
        this.setState({ isLoading: false })
        this.props.navigation.navigate("CategoryDetailContainer",
            {
                subCategoryArray: data,
                resid: this.resId,
                currency_symbol: this.restaurantDetails.currency_symbol,
                ItemName: data.name,
                restaurantDetails: this.restaurantDetails
            }
        )
    }

    /**
     * Review press
     */
    onReviewPress = (item) => {
        this.props.navigation.navigate("ReviewContainer", {
            content_id: item.content_id,
            resid: item.restuarant_id,
        });
    }
    //#region 

    //#endregion

    /**
     * @param { Success Repsonse Object for Details} onSuccess
     */
    onSuccessResData = (onSuccess) => {
        if (onSuccess.error != undefined) {
            this.strOnScreenMessage = onSuccess.response != undefined ? onSuccess.response : strings("generalWebServiceError")

            this.setState({ isLoading: false });
        } else if (onSuccess.status == RESPONSE_SUCCESS) {

            if (onSuccess.popular_item !== undefined &&
                onSuccess.popular_item !== null &&
                onSuccess.popular_item.length !== 0
            ) {
                let item = []
                onSuccess.popular_item.map(data => {
                    item = item.concat(data.items)
                })
                this.popularItems = item
                // this.sectionData.push({ category_id: -1, title: strings("popularItems"), data: this.popularItems })
            }

            this.getRestaurantMenuDetails()

            if (onSuccess.show_restaurant_reviews !== undefined && onSuccess.show_restaurant_reviews !== null) {
                this.setState({ isShowReview: onSuccess.show_restaurant_reviews })
            }

            if (onSuccess.restaurant.length !== 0) {
                this.restaurantDetails = onSuccess.restaurant[0];
                this.resId = onSuccess.restaurant[0].restuarant_id
                this.isOpen = onSuccess.restaurant[0].timings !== undefined && onSuccess.restaurant[0].timings !== null ? onSuccess.restaurant[0].timings.closing : "closed"
                this.setState({ height: this.state.height + (this.isOpen.toLowerCase() === 'close' ? 40 : 0) })
                this.props.saveCurrencySymbol(onSuccess.restaurant[0].currency_symbol)
                saveCurrency_Symbol(onSuccess.restaurant[0].currency_symbol, onsuccess => { }, onFailure => { })
            }

            this.setState({ isLoading: false, key: this.state.key + 1 });
        } else if (onSuccess.status == RESPONSE_FAIL) {
            this.strOnScreenMessage = strings('noDataFound');
            this.setState({ isLoading: false, key: this.state.key + 1 });
        }
    }

    /**
     * @param { Failure Response object for Details } onFailure
     */
    onFailureResData = (onFailure) => {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = onFailure.response != undefined ? onFailure.response : strings("generalWebServiceError")
    }

    /** GET RES DETAILS */
    getRestaurantDetails() {
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';

        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true, isMenuLoading: true });
                let param = {
                    language_slug: this.props.lan,
                    restaurant_id: this.resId,
                    content_id: this.content_id,
                    food: "" + this.foodArray,
                    price: "" + this.priceType,
                    availability: this.availType

                }
                ResDetails(param, this.onSuccessResData, this.onFailureResData);
            } else {
                this.strOnScreenMessage = strings("noInternetTitle");
                this.strOnScreenSubtitle = strings("noInternet");
            }
        })
    }


    /**
    * @param { Success Response Object } onSuccess
    */
    onSuccessResMenuData = (onSuccess) => {
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("generalWebServiceError")
            );
        } else if (onSuccess.status == RESPONSE_SUCCESS) {
            this.sectionData = []
            if (this.menuArray == undefined) {
                this.menuArray = []
            }

            if (onSuccess.menu_item !== undefined && onSuccess.menu_item.length > 0) {
                this.menuArray = onSuccess.menu_item

                if (this.popularItems.length > 0)
                    this.menuArray.splice(0, 0, { category_id: -1, category_name: strings("popularItems"), items: this.popularItems })
                this.menuArray.map(data => {
                    this.sectionData.push(
                        { category_id: data.category_id, title: data.category_name, data: data.items }
                    )
                })
                saveMenu(this.sectionData, () => { }, () => { })
            } else {
                this.strOnScreenMessage = strings('noDataFound')
            }

            this.setState({ keyAPI: this.state.keyAPI + 1, isMenuLoading: false, menuListScroll: this.state.scrolledHeight });

        } else if (onSuccess.status == RESPONSE_FAIL) {
            this.setState({ isMenuLoading: false });
        }
    }

    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureResMenuData = (onFailure) => {
        console.log('::::: RES FAILED', onFailure)
        this.setState({ isLoading: false, isMenuLoading: false });
        showValidationAlert(
            onFailure.response != undefined
                ? onFailure.response
                : strings("generalWebServiceError")
        );
    }
    /** API CALL FOR RES DATA */
    getRestaurantMenuDetails() {
        netStatus(status => {
            if (status) {
                this.setState({ isMenuLoading: true });

                let objRestaurantData = {
                    language_slug: this.props.lan,
                    restaurant_id: parseInt(this.resId),
                    content_id: parseInt(this.content_id),
                    food: "" + this.foodArray,
                    price: "" + this.priceType,
                    availability: this.availType
                }

                getRestaurantMenu(objRestaurantData, this.onSuccessResMenuData, this.onFailureResMenuData, this.props);
            } else {
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
            }
        });

    }
    //#endregion

}

//#region STYLES
export const style = StyleSheet.create({
    title: {
        fontSize: getProportionalFontSize(20),
        fontFamily: EDFonts.regular,
        marginLeft: 5,
        color: "#000",
        paddingLeft: 10,
        paddingRight: 10
    },
    image: {
        width: 20,
        height: 20
    },
    ourMenu: { fontSize: getProportionalFontSize(18), fontFamily: EDFonts.semiBold, marginHorizontal: 20, marginTop: 0, marginBottom: 15, color: EDColors.black },
    mainContainer: { flex: 1, },
    ImageStyle: { width: "100%", height: metrics.screenHeight * 0.25 },
    noDataViewStyle: { marginTop: 50, flex: 1, },
    themeButton: {
        backgroundColor: EDColors.homeButtonColor,
        borderRadius: 16,
        width: "92.5%",
        height: Platform.OS == 'android' ? heightPercentageToDP('6%') : heightPercentageToDP('6.0%'),
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: 30,
        alignItems: 'center',
        paddingHorizontal: 10
    },
    themeButtonText: {
        color: EDColors.white,
        textAlign: 'center',
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(17),
    },
    removeContainer: { width: "100%", position: "absolute", bottom: 0, maxHeight: metrics.screenHeight * 0.85, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: EDColors.white, shadowOpacity: 0.25, shadowRadius: 5, shadowColor: EDColors.text, shadowOffset: { height: 0, width: 0 } },
    removeList: {
        maxHeight: metrics.screenHeight * .4,
        padding: 10
    },
    chooseItem: {
        fontFamily: EDFonts.semiBold,
        fontSize: 16,
        color: EDColors.primary
    },
    topSeperator: { borderWidth: 2, borderColor: "#EDEDED", width: "20%", alignSelf: "center", marginTop: 15, marginBottom: 20 },
    removeHeader: {
        alignItems: 'center',
        justifyContent: "space-between",
        padding: 10,
        marginBottom: 10,
        marginHorizontal: 10
    }
});
//#endregion

export default connect(
    state => {
        return {
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            lan: state.userOperations.lan,
            cartCount: state.checkoutReducer.cartCount,
            cartPrice: state.checkoutReducer.cartPrice,
            currency: state.checkoutReducer.currency_symbol,
            minOrderAmount: state.userOperations.minOrderAmount,
            table_id: state.userOperations.table_id,
            res_id: state.userOperations.res_id
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveCurrencySymbol: symbol => {
                dispatch(saveCurrencySymbol(symbol))
            },
            saveCartPrice: data => {
                dispatch(saveCartPrice(data));
            },
            saveTableID: table_id => {
                dispatch(saveTableIDInRedux(table_id))
            },
            saveResID: table_id => {
                dispatch(saveResIDInRedux(table_id))
            }
        };
    }
)(Restaurant);





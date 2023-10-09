import moment from 'moment';
import React from "react";
import { TextInput } from 'react-native';
import { BackHandler, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { SvgXml } from 'react-native-svg';
import { NavigationActions, NavigationEvents, StackActions } from "react-navigation";
import { connect } from "react-redux";
import CartItem from "../components/CartItem";
import EDButton from '../components/EDButton';
import EDCategoryOrder from "../components/EDCategoryOrder";
import EDItemDetails from "../components/EDItemDetails";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from "../components/EDPopupView";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import PriceDetail from "../components/PriceDetail";
import ProductComponent from '../components/ProductComponent';
import ProgressLoader from "../components/ProgressLoader";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCheckoutDetails } from "../redux/actions/Checkout";
import { clearCartData, clearCurrency_Symbol, getCartList, saveCartData } from "../utils/AsyncStorageHelper";
import { showDialogue, showProceedDialogue, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { validateTwoDecimal, capiString, COUPON_ERROR, debugLog, funGetFrench_Curr, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, RESTAURANT_ERROR } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { discount_icon } from '../utils/EDSvgIcons';
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { addOrder, addToCart } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
export class CheckOutContainer extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.cartData = [];
        this.deleteIndex = -1;
        this.cart_id = 0;
        this.cartResponse = undefined;
        this.delivery_charges = ""
        this.promoCode = ""
        this.resId = ""
        this.minimum_subtotal = ""
        this.featured_items = undefined
        this.unpaid_orders_status = true
        this.featured_items_image = []
        this.selectedItem = ""
        this.comment = ""
        this.placeOrderFromCheckout = false
        this.cartTotal = ''
        this.count = 0
        this.payment_option = this.props.navigation.state.params !== undefined && this.props.navigation.state.params.payment_option !== undefined ?
            this.props.navigation.state.params.payment_option : "cod"
        this.tipsArray = []
        this.tip = ''

    }

    state = {
        key: 1,
        isLoading: false,
        isAsyncSync: false,
        value: 0,
        visible: false,
        isCategory: false,
        tip: "",
        customTip: "",
        noTip: true,
        tipView: false
    };

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.getcartDataList()
    }
    componentWillUnmount() {
        this.backHandler.remove()
    }

    onDidFocus = () => {
        // this.getcartDataList()
    }



  
    // RENDER METHOD
    render() {
        if ((this.state.tip == 0 || this.state.tip == '') && (this.state.customTip == 0 || this.state.customTip == '')) { this.setState({ noTip: true }) }
        return (
            <BaseContainer
                title={strings("doCheckout")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onLeftPressEvent}
            >

                <NavigationEvents onDidFocus={this.onDidFocus} />

                {/* PROGRESS LOADER */}
                {this.state.isLoading ? <ProgressLoader /> : null}

                {/* CATEGORY MODAL */}
                {this.renderCategoryOrder()}

                {/* ITEM DETAILS */}
                {this.renderItemDetails()}

                {/* MAIN VIEW */}
                {this.cartResponse != undefined && this.cartResponse.items.length > 0 ?
                    <View style={{ flex: 1, paddingBottom: 5, backgroundColor: EDColors.radioSelected, marginHorizontal: 10 }}>

                        <ScrollView contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'space-between'
                        }}
                            showsVerticalScrollIndicator={false}
                        >

                            {/* DISPLAY CART CARD LIST */}
                            <FlatList

                                data={this.cartResponse != undefined ? this.cartResponse.items : []}
                                showsVerticalScrollIndicator={false}
                                style={{ marginVertical: 10 }}
                                keyExtractor={(item, index) => item + index}
                                renderItem={({ item, index }) => {
                                    return (
                                        <CartItem
                                            key={this.state.key}
                                            index={index}
                                            items={item}
                                            currency={this.props.currency}
                                            price={
                                                item.offer_price !== '' &&
                                                    item.offer_price !== undefined &&
                                                    item.offer_price !== null
                                                    ? item.offer_price
                                                    : item.price
                                            }
                                            addonsItems={item.addons_category_list === undefined ? [] : item.addons_category_list}
                                            iscounts={item.addons_category_list === undefined ? true : false}
                                            quantity={item.quantity}
                                            onPlusClick={this.onPlusEventHandler}
                                            onMinusClick={this.onMinusEventHandler}
                                            deleteClick={this.onDeletEventHandler}
                                            lan={this.props.lan}
                                        />
                                    );
                                }}
                            />

                            {/* FEATUED ITEMS */}
                            {this.featured_items !== undefined && this.featured_items !== null && this.featured_items.length !== 0 ?
                                <View>
                                    <EDRTLText title={strings("peopleAlsoOrdered")} style={[style.alsoOrderedText]} />
                                    <FlatList
                                        style={{ marginVertical: 5, marginBottom: 10, marginHorizontal: -20 }}
                                        // showsHorizontalScrollIndicator={false}
                                        data={this.featured_items}
                                        renderItem={this.renderFeaturedItems}
                                        extraData={this.state}
                                    // horizontal
                                    />
                                </View> : null}

                            {/* BOTTOM VIEW */}
                            <View style={{}}>
                               
                              

                                {/* PRICE DETAILS */}
                                <View style={style.priceContainer}>
                                    <EDRTLText style={[style.title, { marginVertical: 5, marginHorizontal: 20, fontFamily: EDFonts.semiBold }]} title={strings("priceDetail")} />
                                    <View style={style.divider} />
                                    {this.cartResponse.price != undefined ? (
                                        this.cartResponse.price.filter(data => data.label_key !== undefined).map((item, index) => {
                                            return (
                                                <PriceDetail
                                                    key={item.label}
                                                    title={item.label != undefined ? capiString(item.label) : ""}
                                                    subtitle={item.label2 != undefined ? capiString(item.label2) : ""}
                                                    titleStyle={style.priceLabel}
                                                    priceStyle={style.priceLabel}
                                                    priceDetailsView={style.priceDetailView}
                                                    price={
                                                        item.value != undefined
                                                            ? item.label_key.includes("Discount")
                                                                ? isRTLCheck() ? this.props.currency + item.value + " -" : "- " + this.props.currency + funGetFrench_Curr(item.value, 1, this.props.currency)
                                                                : (item.label_key.includes("Tip") || item.label_key.includes("Delivery") || item.label_key.includes("Service")) ? (item.value.toString().includes("%") ? isRTLCheck() ? item.value + " +" : "+ " + item.value :
                                                                    isRTLCheck() ? this.props.currency + item.value + " +" : "+ " + this.props.currency + funGetFrench_Curr(item.value, 1, this.props.currency)) :
                                                                    this.props.currency + funGetFrench_Curr(item.value, 1, this.props.currency)
                                                            : ""
                                                    }
                                                    label_key={item.label_key}
                                                />
                                            );
                                        })) : (<View />)}
                                </View>
                            </View>
                        </ScrollView>

                        {/* PROMO CODE VIEW */}
                        {this.props.navigation.state.params == undefined || (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.isDineOrder !== undefined &&
                            this.props.navigation.state.params.isDineOrder == true) ? null :
                            <View style={style.walletContainer} >
                                {this.cartResponse.is_apply == true ? (
                                    <View style={style.cartResponse} >
                                        <Text style={[style.cartResponseTextStyle, { flex: 1 }]} >
                                            {this.promoCode + " " + strings("promoApplied")}
                                        </Text>
                                        <TouchableOpacity
                                            style={{ alignSelf: "center", marginRight: 10 }}
                                            onPress={this.onCloseEventHandler}>
                                            <Icon
                                                name={"close"}
                                                size={getProportionalFontSize(28)}
                                                color={EDColors.black}
                                            />
                                        </TouchableOpacity>
                                    </View>) : (

                                    <EDRTLView style={{ alignItems: 'center' }}>
                                        {/* <Icon name={"local-offer"} size={16} color={EDColors.blackSecondary} style={style.discountIcon} /> */}
                                        <SvgXml xml={discount_icon} style={{ marginHorizontal: 5 }} />
                                        <Text
                                            style={style.promoCode}
                                            onPress={this.navigateToPromoCode}>
                                            {strings("haveAPromo")}
                                        </Text>
                                    </EDRTLView>
                                )}
                            </View>}

                        {this.props.minOrderAmount !== undefined && this.props.navigation.state.params != undefined && this.props.navigation.state.params.isDineOrder !== true ?
                            (this.cartTotal !== undefined && this.cartTotal >= Number(this.props.minOrderAmount)) || (this.props.navigation.state.params.delivery_status !== undefined && this.props.navigation.state.params.delivery_status.toLowerCase() == 'pickup') ? null :
                                <View style={{ backgroundColor: EDColors.offWhite, alignItems: 'center', margin: 10, marginBottom: -2, borderRadius: 16 }}>
                                    <Text style={{ color: EDColors.black, fontSize: 14, marginVertical: 5, marginHorizontal: 5, fontFamily: EDFonts.medium, textAlign: 'center', }}>
                                        {isRTLCheck() ? strings('minOrderMsg') +  this.props.minOrderAmount +this.props.currency + strings('minOrderMsg2') : strings('minOrderMsg') + this.props.currency + this.props.minOrderAmount + strings('minOrderMsg2')}</Text>
                                </View> : null}

                        {/* CHECK OUT VIEW */}
                        <View style={style.checkOutContainer}>
                            {/* <EDRTLText style={style.totalPrice}
                                title={this.props.currency + funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency)}
                            /> */}
                            <TouchableOpacity
                                style={style.checkoutButtonView}
                                onPress={this.onCheckOutEventHandler}>
                                <Text style={style.checkoutText}>{this.placeOrderFromCheckout ? isRTLCheck() ? strings("placeOrder") + " ("+ funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency) + this.props.currency  + ")" : strings("placeOrder") + " ("+ this.props.currency + funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency)  + ")" :isRTLCheck() ? strings("doCheckout") + " ("  + funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency)+ this.props.currency + ")" : strings("doCheckout") + " ("+ this.props.currency   + funGetFrench_Curr(this.cartResponse.total, 1, this.props.currency)+ ")"}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                    : this.cartResponse != undefined &&
                        this.cartResponse.items.length <= 0
                        ? <View style={{ flex: 1, height: metrics.screenHeight * 0.9 }}>
                            <EDPlaceholderComponent
                                title={strings("emptyCartMsg")}
                            />
                        </View>
                        : null
                }
            </BaseContainer>
        );
    }
    //#endregion


  
    //#region 
    /** FEATURED ITEMS */
    renderFeaturedItems = (item) => {
        return (
            <View style={style.featuredProductView} >
                <ProductComponent
                    currency={this.props.currency}
                    data={item.item}
                    addons_category_list={item.item.addons_category_list === undefined ? [] : item.item.addons_category_list}
                    cartData={this.cartResponse !== undefined && this.cartResponse.items.length !== 0 ? this.cartResponse.items : []}
                    // isLoading={this.props.isLoading}
                    isOpen={true}
                    plusAction={() => this.onPressAddtoCartItemHandler(item.item, 1)}
                    // minusItems={this.props.minusItems}
                    addData={() => this.onPressAddtoCartItemHandler(item.item, 1)}
                    addOneData={() => this.onPressAddtoCartItemHandler(item.item, 1)}
                    onProductPress={() => this.onFeaturedPress(item.item)}
                // onLayout={this.onProductLayout}
                />
            </View>
        )
    }
    onFeaturedPress = item => {
        // // // OPEN THE MODAL FOR PRODUCTS DETAILS
        debugLog("FEATURE PRESS ::::", item)
        this.selectedItem = item
        this.setState({
            visible: true
        })
    }

    onPressAddtoCartItemHandler = (item, qty) => {
        // this.setState({ cartLoading: true })
        console.log('onAddPress::' , item)
        if (item.is_customize === "0") {
            this.storeData(item, qty)
        } else {
            if (this.cartResponse.items !== undefined && this.cartResponse.items.length > 0) {
                var repeatItem = this.cartResponse.items.filter(items => {
                    return items.menu_id == item.menu_id
                })

                if (repeatItem.length > 0) {
                    this.selectedItem = item
                    this.setState({
                        isCategory: true,
                        visible: false
                    })
                } else {
                    this.setState({ visible: false })
                    this.onResDetailsAddEvent(item)
                }
            } else {
                this.setState({ visible: false })
                this.onResDetailsAddEvent(item)
            }
        }
    }
    //#endregion

    onNewButtonHandler = () => {
        this.setState({
            isCategory: false
        })
        this.onResDetailsAddEvent(this.selectedItem)
    }

    onRepeatButtonHandler = () => {
        this.setState({
            isCategory: false
        })

        this.selectedArray = this.cartResponse.items.filter((items) => {
            return items.menu_id === this.selectedItem.menu_id
        })
        this.lastSelectedData = this.selectedArray[this.selectedArray.length - 1]
        this.storeData(this.lastSelectedData, 1);
    }


    onResDetailsAddEvent = (addData) => {
        this.props.navigation.navigate("CategoryDetailContainer",
            {
                subCategoryArray: addData,
                resid: this.resId,
                currency_symbol: this.props.currency,
                refreshScreen: this.getcartDataList
            }
        )
    }

    onDismissHandler = () => {
        this.setState({
            isCategory: false
        })
    }

    /** RENDER CATEGORY MODEL */
    renderCategoryOrder = () => {
        return (
            <EDPopupView isModalVisible={this.state.isCategory}>
                <EDCategoryOrder
                    onDismissHandler={this.onDismissHandler}
                    categoryName={this.selectedItem.name}
                    newButtomHandler={this.onNewButtonHandler}
                    repeatButtonHandler={this.onRepeatButtonHandler}
                />
            </EDPopupView>
        )
    }

    //#region ON CLOSE EVENT HANDLER
    onDismissItemDetailHandler = () => {
        this.setState({ visible: false });
    }
    //#endregion


    //#region ITEM DETAILS
    renderItemDetails = () => {
        return (

            <EDPopupView isModalVisible={this.state.visible}>
                <EDItemDetails
                    data={this.selectedItem}
                    onDismissHandler={this.onDismissItemDetailHandler}
                    onPress={this.onPressAddtoCartItemHandler}
                    isOpen={true}
                    cartData={this.cartResponse !== undefined && this.cartResponse.items.length !== 0 ? this.cartResponse.items : []}
                    navigateToCart={this.onDismissItemDetailHandler}
                // key={this.state.key}
                />
            </EDPopupView>
        )
    }


    //#region STORE
    /** STORE DATA */
    storeData = (data, qty) => {
        var cartArray = [];
        var cartData = {};

        //demo changes
        getCartList(
            success => {
                if (success != undefined) {
                    cartArray = success.items;
                    if (cartArray.length > 0) {
                        if (success.resId == this.resId) {
                            var repeatArray = cartArray.filter(item => { return item.menu_id == data.menu_id; });

                            if (repeatArray.length > 0) {
                                repeatArray[repeatArray.length - 1].quantity = repeatArray[repeatArray.length - 1].quantity + qty;
                            } else {
                                data.quantity = 1;
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
                            // if (this.props.table_id !== undefined && this.props.table_id !== "")
                            //     cartData.table_id = this.props.table_id;
                            this.updateCount(cartData.items, repeatArray.length == 0);
                            this.saveData(cartData);
                            this.setState({
                                cartData: cartData.items,
                                key: this.state.key + 1
                            })
                        } else {
                            showValidationAlert(strings("pendingItems"));
                            this.setState({
                                visible: false
                            })
                        }
                    } else if (cartArray.length == 0) {
                        //cart empty
                        data.quantity = 1;
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
                            // visible: false,
                            key: this.state.key + 1
                        })
                    }
                } else {
                    //cart has no data
                    data.quantity = 1;
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
                        // visible: false,
                        key: this.state.key + 1
                    })
                }
                // this.props.navigation.state.params.categoryArray = undefined
            },
            onCartNotFound => {
                //first time insert data
                debugLog("onCartNotFound", onCartNotFound);
                data.quantity = 1;
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
                    // visible: false
                    cartData: cartData.items,
                    key: this.state.key + 1
                })
            },
            error => {
                debugLog("onCartNotFound", error);
            }
        );
        this.setState({ visible: false })

        // this.getcartDataList()

    }

    saveData(data) {
        debugLog("CALLED FROM CART DATA TO SAVE :::", data)
        saveCartData(data, success => { }, fail => { });
        this.getCartData(data.items)
    }


    //#region 
    /** ON PLUS CLICKED */
    onPlusEventHandler = (value, index) => {
        this.promoCode = "";
        if (value > 0) {
            this.cartResponse.items[index].quantity = value;
            this.getCartData(this.cartResponse.items);
        }
    }
    //#endregion

    //#region 
    /** ONMINUS CLICKED */
    onMinusEventHandler = (value, index) => {
        this.promoCode = "";
        if (value > 0) {
            this.cartResponse.items[index].quantity = value;
            this.getCartData(this.cartResponse.items);
        } else if (value == 0) {
            var array = this.cartResponse.items;
            array.splice(index, 1);
            this.getCartData(array);
        }
    }
    //#endregion

    //#region 
    /** ON DLEETE CLICKED */
    onDeletEventHandler = (index) => {
        this.promoCode = "";
        this.deleteIndex = index;
        showDialogue(
            strings('deleteFromCart'),
            [{ text: strings('dialogYes'), onPress: this.onYesEventHandler, buttonColor: EDColors.offWhite }],
            '',
            this.onNoEventHandler
            ,
            strings('dialogNo'),
            true
        );
    }
    //#endregion

    //#region 
    /** ON CLOASE BUTTON */
    onCloseEventHandler = () => {
        this.promoCode = "";
        this.getCartData(this.cartResponse.items);
    }
    //#endregion

    //#region 
    /** LEFT PRESS EVENT */
    onLeftPressEvent = () => {
        this.promoCode = ""
        this.props.navigation.goBack();
    }
    //#endregion



    //#region 
    /** BUTTON PRESSED EVENTS */
    onYesEventHandler = () => {
        var array = this.cartResponse.items;
        array.splice(this.deleteIndex, 1);
        this.getCartData(array);
    }

    onNoEventHandler = () => {
        this.deleteIndex = -1;
    }
    //#endregion


    //#region 
    /** NAVIGATE TO PROMO CODE CONTAINER */
    navigateToPromoCode = () => {
        this.props.navigation.navigate("PromoCodeContainer", {
            getData: this.passCurrentData,
            subTotal: this.cartResponse.subtotal,
            resId: this.resId,
            order_delivery: this.props.navigation.state.params == undefined || (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.isDineOrder !== undefined &&
                this.props.navigation.state.params.isDineOrder == true) ? "DineIn" : this.props.navigation.state.params.delivery_status || "",
        });
    }
    //#endregion

    //#region 
    /** CHECKOUT EVENT HANDLER */
    onCheckOutEventHandler = () => {
        // if (this.props.phoneNumberInRedux !== undefined && this.props.phoneNumberInRedux !== null && this.props.phoneNumberInRedux !== '') {
        if (this.is_unpaid) {
            if (this.props.res_id == this.resId) {
                var checkoutData = {
                    address_id: this.props.navigation.state.params !== undefined ? this.props.navigation.state.params.address_id : 0,
                    subtotal: this.cartResponse.subtotal,
                    items: '{"items": ' + JSON.stringify(this.cartResponse.items) + "}",
                    coupon_id: this.cartResponse.coupon_id,
                    coupon_type: this.cartResponse.coupon_type,
                    coupon_amount: this.cartResponse.coupon_amount,
                    user_id: this.props.userID,
                    // token: this.props.token,
                    restaurant_id: this.resId,
                    total: this.cartResponse.total,
                    coupon_name: this.cartResponse.coupon_name,
                    coupon_discount: this.cartResponse.coupon_discount,
                    order_date: "",
                    order_delivery: this.props.navigation.state.params == undefined || (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.isDineOrder !== undefined &&
                        this.props.navigation.state.params.isDineOrder == true) ? "DineIn" : this.props.navigation.state.params.delivery_status,
                    language_slug: this.props.lan,
                    delivery_charge: this.delivery_charges,
                    delivery_instructions:
                        this.props.navigation !== undefined &&
                            this.props.navigation.state !== undefined &&
                            this.props.navigation.state.params !== undefined ?
                            this.props.navigation.state.params.delivery_instructions
                            : '',
                    extra_comment:
                        this.props.navigation !== undefined &&
                            this.props.navigation.state !== undefined &&
                            this.props.navigation.state.params !== undefined ?
                            this.props.navigation.state.params.comment
                            : ''

                };
                this.props.saveCheckoutDetails(checkoutData)
                if (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.payment_option !== undefined) {

                    this.comment = this.props.navigation.state.params.comment

                    if (this.props.navigation.state.params.payment_option == "cod")
                        this.placeOrder()
                    else
                        this.navigateToPaymentGateway(this.props.navigation.state.params.payment_option)
                }
            }
        }
        else {
            var checkoutData = {
                address_id: this.props.navigation.state.params !== undefined ? this.props.navigation.state.params.address_id : 0,
                subtotal: this.cartResponse.subtotal,
                items: '{"items": ' + JSON.stringify(this.cartResponse.items) + "}",
                coupon_id: this.cartResponse.coupon_id,
                coupon_type: this.cartResponse.coupon_type,
                coupon_amount: this.cartResponse.coupon_amount,
                user_id: this.props.userID,
                // token: this.props.token,
                restaurant_id: this.resId,
                total: this.cartResponse.total,
                coupon_name: this.cartResponse.coupon_name,
                coupon_discount: this.cartResponse.coupon_discount,
                order_date: "",
                order_delivery: this.props.navigation.state.params == undefined || (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.isDineOrder !== undefined &&
                    this.props.navigation.state.params.isDineOrder == true) ? "DineIn" : this.props.navigation.state.params.delivery_status,
                language_slug: this.props.lan,
                delivery_charge: this.delivery_charges,
                extra_comment:
                    this.props.navigation !== undefined &&
                        this.props.navigation.state !== undefined &&
                        this.props.navigation.state.params !== undefined ?
                        this.props.navigation.state.params.comment
                        : '',
                delivery_instructions:
                    this.props.navigation !== undefined &&
                        this.props.navigation.state !== undefined &&
                        this.props.navigation.state.params !== undefined ?
                        this.props.navigation.state.params.delivery_instructions
                        : ''
            };
            if (this.table_id !== undefined && this.table_id !== "") {
                checkoutData.table_id = this.table_id;
                checkoutData.order_delivery = "DineIn"
            }
            this.props.saveCheckoutDetails(checkoutData)
            if (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.payment_option !== undefined) {

                this.comment = this.props.navigation.state.params.comment
                if (this.props.navigation.state.params.payment_option == "cod")
                    this.placeOrder()
                else
                    this.navigateToPaymentGateway(this.props.navigation.state.params.payment_option)
            }
        }

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
                this.props.saveCartCount(0);
                clearCartData(
                    response => {

                        this.props.navigation.popToTop();
                        this.props.navigation.navigate("OrderConfirm", { isForDineIn: false, resObj: onSuccess.restaurant_detail });

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
        showValidationAlert(strings("generalWebServiceError"));
        this.setState({ isLoading: false });
    }

    //#region 
    /** PLACE ORDER API */
    placeOrder = () => {
        netStatus(status => {
            let addOrderParams = this.props.checkoutDetail
            // addOrderParams.extra_comment = this.comment
            // addOrderParams.delivery_instructions = this.driver_comment
            addOrderParams.order_date = moment(new Date()).format("DD-MM-YYYY hh:mm A");
            addOrderParams.payment_option = "cod"
            addOrderParams.isLoggedIn = (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0

            console.log("CheckOut request :::::::::: ", addOrderParams)
            if (status) {
                this.setState({ isLoading: true });
                addOrder(addOrderParams, this.onSuccessAddOrder, this.onFailureAddOrder, this.props, true)
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    //#endregion


    navigateToPaymentGateway = () => {
    

       if (this.payment_option == "paypal")
            this.props.navigation.navigate("PaymentGatewayContainer", {
                "currency_code": this.currency_code,
                isPendingAdded: false,
                pendingTotalPayment: this.cartResponse.total,
                extra_comment: this.comment,
                delivery_instructions: this.driver_comment,
            })
    }

    //#region 
    /** BACK PRESS EVENT */
    handleBackPress = () => {
        this.promoCode = ""
        this.getCartData(this.cartResponse.items);
        this.props.navigation.goBack();
        return true;
    }
    //#endregion

    //#region ADD TO CART API
    /**
     * 
     * @param {Success Response Object } onSuccess 
     */
    onSuccessAddCart = (onSuccess) => {
        debugLog("ADD TO CART :::::", onSuccess)
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("generalWebServiceError")
            );
        } else {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.setTipArray(onSuccess.driver_tip, onSuccess.driver_tiparr)

           

                this.isRedeem = onSuccess.is_redeem
                this.subTotal = onSuccess.subtotal

                this.max_used_QR = onSuccess.min_redeem_point_order
                this.minimum_subtotal = onSuccess.minimum_subtotal

               
                this.delivery_charges = onSuccess.delivery_charge
                this.currency_code = onSuccess.currency_code
                this.table_id = onSuccess.table_id
                this.allowPayLater = onSuccess.pay_later
                this.updateUI(onSuccess);
            } else if (onSuccess.status !== COUPON_ERROR) {
                this.updateUI(onSuccess);
                showValidationAlert(onSuccess.message);
            }
            else {
                showValidationAlert(onSuccess.message);
            }
        }
        this.setState({ isLoading: false, key: this.state.key + 1 });
    }

    /**
     * 
     * @param {Failure REsponse Object} onFailure 
     */
    onFailureAddCart = (onFailure) => {
        this.setState({ isLoading: false, key: this.state.key + 1 });
        if (onFailure.status == RESTAURANT_ERROR) {
            this.props.saveCartCount(0);
            clearCurrency_Symbol(onSuccess => { }, onfailure => { })
            clearCartData(
                response => {
                },
                error => { }
            );
            showDialogue(onFailure.message, [], strings("appName"),
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
        else
            showValidationAlert(
                onFailure.message != undefined
                    ? onFailure.message
                    : strings("generalWebServiceError")
            );
    }

    /**
     * 
     * @param { Item to be added to Cart } items 
     */
    getCartData(items) {

        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                debugLog("items checkout :::: ", JSON.stringify(items));

                var objItems = { items: items };
                this.cartLength = items.length

                let objAddToCart = {
                    language_slug: this.props.lan,
                    user_id: this.props.userID || "",
                    // token: this.props.token || "",
                    restaurant_id: this.resId,
                    items: objItems,
                    cart_id: this.cart_id,
                    coupon: this.promoCode,
                    order_delivery: this.props.navigation.state.params == undefined || (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.isDineOrder !== undefined &&
                        this.props.navigation.state.params.isDineOrder == true) ? "DineIn" : this.props.navigation.state.params.delivery_status,
                    latitude: this.props.navigation.state.params == undefined ? this.latitude : this.props.navigation.state.params.latitude,
                    longitude: this.props.navigation.state.params == undefined ? this.longitude : this.props.navigation.state.params.longitude,
                    isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0
                }
                if (this.table_id !== undefined && this.table_id !== "")
                    objAddToCart.table_id = this.table_id
                addToCart(objAddToCart, this.onSuccessAddCart, this.onFailureAddCart, this.props);
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    //#endregion
    setTipArray = (driver_tip, driver_tiparr) => {
        this.tipsArray = driver_tiparr.map(v => ({ value: v, selected: driver_tip == v ? true : false }))
        if (this.tipsArray.find(e => e.selected) == undefined) {
            this.setState({ customTip: driver_tip })
        }
    }
    //#region 
    /** PASS DATA FUNCTION */
    passCurrentData = data => {
        this.promoCode = data;
        debugLog("CALLED FROM passCurrentData", data)

        this.getCartData(this.cartResponse.items);
    };
    //#endregion

    //#region 
    /** GET LIST FROM ASYNC */
    getcartDataList = () => {
        this.setState({ isLoading: true })
        if (this.props.navigation.state.params !== undefined && this.props.navigation.state.params.payment_option !== undefined) {
            this.placeOrderFromCheckout = true
        }
        getCartList(
            success => {
                this.resId = success.resId
                this.promoCode = success.coupon_name;
                this.cart_id = success.cart_id;
                this.table_id = success.table_id;
                this.state.isAsyncSync = true;
                this.cartLength = success.items.length
                this.oldItems = success.items.map(data => data.name)
                this.getCartData(success.items);
                this.setState({ isLoading: false })
            },
            emptyList => {
                this.cartResponse = { items: [] };
                this.setState({ isAsyncSync: true, isLoading: false });
                showDialogue(strings("emptyCartMsg"), [], '', () => {
                    this.props.navigation.dispatch(
                        StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                            ]
                        })
                    );
                })
            },
            error => {
                this.cartResponse = { items: [] };
                this.setState({ isAsyncSync: true, isLoading: false });
                showDialogue(strings("emptyCartMsg"), [], '', () => {
                    this.props.navigation.dispatch(
                        StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                            ]
                        })
                    );
                })
            }
        );
    }
    //#endregion

    navigatetoPending = () => {
        this.props.navigation.popToTop();
        this.props.navigation.navigate("PendingOrders")
    }

    //#region 
    /** UPDATE UI */
    updateUI(response) {
        console.log('::::::::: UPDATE UI', response)
        this.cartResponse = response;
        this.cart_id = response.cart_id;
        this.table_id = response.table_id;
        this.cartLength_updated = response.items.length
        this.cartTotal = response.subtotal

        if (response.unpaid_orders == "1")
            this.is_unpaid = true
        else
            this.is_unpaid = false

        if (response.unpaid_orders_status == "1")
            this.unpaid_orders_status = false
        else
            this.unpaid_orders_status = true

        // FEATURED ITEMS TO BE SHOWN
        if (response.menu_suggestion !== undefined && response.menu_suggestion !== null && response.menu_suggestion.length !== 0) {
            let featured_items = response.menu_suggestion
            this.featured_items = response.menu_suggestion
            this.featured_items.map(data => {
                this.featured_items_image.push({ "image": data.image })
            })
            this.featured_items = featured_items.filter(data => { return !response.items.map(itemToIterate => itemToIterate.menu_id).includes(data.menu_id) })
        } else {
            this.featured_items = []
        }

        debugLog("FEATURED ITEMS ::::", this.featured_items, this.featured_items_image)

        if (this.cartLength_updated !== 0 && this.cartLength !== this.cartLength_updated) {
            let newItems = response.items.map(data => data.name)
            this.removedItems = this.oldItems.filter(item_name => !newItems.includes(item_name))
            showValidationAlert(strings("cartUpdated"))
        }

        var updatedCart = {
            resId: this.resId,
            items: response.items,
            coupon_name: response.coupon_name,
            cart_id: response.cart_id,
            table_id: response.table_id
        };

        saveCartData(updatedCart, success => { }, fail => { });
        if (response.items.length == 0) {
            this.props.saveCartCount(0);
            clearCurrency_Symbol(onSuccess => { }, onfailure => { })
            clearCartData(
                response => {
                },
                error => { }
            );
            if (this.cartLength !== 0) {
                showDialogue(strings("itemsUnavailable"), [], strings("appName"), () => {
                    this.props.navigation.dispatch(
                        StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })
                            ]
                        })
                    );
                })
            }
            else {
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
            this.updateCount(response.items)
        }
    }
    //#endregion

    updateCount(data) {
        var count = 0;
        data.map((item, index) => {
            count = count + item.quantity;
        });
        this.props.saveCartCount(count);
    }
}

export default connect(
    state => {
        return {
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            cartCount: state.checkoutReducer.cartCount,
            lan: state.userOperations.lan,
            currency: state.checkoutReducer.currency_symbol,
            table_id: state.userOperations.table_id,
            res_id: state.userOperations.res_id,
            checkoutDetail: state.checkoutReducer.checkoutDetail,
            phoneNumberInRedux: state.userOperations.phoneNumberInRedux,
            minOrderAmount: state.userOperations.minOrderAmount,
        };
    },
    dispatch => {
        return {
            saveCheckoutDetails: checkoutData => {
                dispatch(saveCheckoutDetails(checkoutData));
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            }
        };
    }
)(CheckOutContainer);

export const style = StyleSheet.create({
    priceContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        margin: 10,
        paddingBottom: 10,
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    checkoutButtonView: {
        alignSelf: 'center',
        borderRadius: 16,
        alignSelf: 'center',
        backgroundColor: EDColors.primary,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        height: heightPercentageToDP('6%')
    },
    checkoutText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: EDFonts.medium
    },
    title: {
        fontFamily: EDFonts.semibold,
        color: "#000",
        fontSize: getProportionalFontSize(16),
        marginTop: 10,
        marginHorizontal: 10,
        marginBottom: 4
    },
    
    customTipInput: { textAlign: "center", textAlignVertical: "center", marginHorizontal: 10, fontSize: getProportionalFontSize(14) },
    divider: {
        marginVertical: 5,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: EDColors.radioSelected,
        height: 1,
        fontFamily: EDFonts.regular
    },
    discountIcon: {
        alignSelf: "center",
        marginVertical: 20,
        marginHorizontal: 5
    },
    promoCode: {
        alignSelf: "center",
        color: EDColors.blackSecondary,
        fontFamily: EDFonts.medium,
        fontSize: 14,
        marginVertical: 20,
        marginHorizontal: 5
    },
    checkOutContainer: {
        margin: 10,
        // borderRadius: 6,
        alignItems: 'center',
        // backgroundColor: "#fff"
    },
    totalPrice: {
        flex: 1,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(14),
        marginHorizontal: 10
    },
    roundButton: {
        // alignSelf: "center",
        margin: 10,
        backgroundColor: EDColors.primary,
        borderRadius: 4
    },
    button: {
        paddingTop: 10,
        paddingRight: 20,
        paddingLeft: 20,
        paddingBottom: 10,
        color: "#fff",
        fontFamily: EDFonts.regular,
    },
    cartResponseView: {
        borderRadius: 16,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#fff",

    },
    cartResponse: {
        flexDirection: "row",
        alignItems: "center",
        padding: 5,
    },
    featuredProductView: {
        flex: 1,
        width: '100%',
        marginHorizontal: 10
    },
    cartResponseTextStyle: {
        // flex: 1,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(16),
        alignSelf: "center",
        color: EDColors.black,
        textAlign: "center",
        marginHorizontal: 10,
        height: 22,
        marginVertical: 4,
    },
    walletContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginVertical: 15,
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 10,
        paddingRight: 10,
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    price: {
        fontFamily: EDFonts.regular,
        marginHorizontal: 5,
        marginVertical: 5
    },
    priceDetailView: {},
    priceLabel: { fontFamily: EDFonts.medium, fontSize: 14, color: EDColors.black, marginVertical: 2, marginHorizontal: 10 },
    alsoOrderedText: { color: EDColors.black, fontFamily: EDFonts.semiBold, fontSize: 16, marginTop: 10, marginHorizontal: 10, marginBottom: 5 },
   
});

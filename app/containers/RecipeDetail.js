import React from "react";
import { Platform, StyleSheet, View, ScrollView, Dimensions, Text } from "react-native";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { debugLog, funGetFrench_Curr, getProportionalFontSize, isRTLCheck, RESPONSE_FAIL, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import BaseContainer from "./BaseContainer";
import AutoHeightWebView from "react-native-autoheight-webview";
import { Spinner } from "native-base";
import { TouchableOpacity } from "react-native";
import { saveCartCount, saveCartPrice, saveCurrencySymbol } from "../redux/actions/Checkout";
import { saveResIDInRedux, saveTableIDInRedux } from "../redux/actions/User";
import { showConfirmationDialogue, showNoInternetAlert, showValidationAlert } from "../utils/EDAlert";
import { getCartList, saveCartData, clearCartData } from "../utils/AsyncStorageHelper";
import Toast, { DURATION } from "react-native-easy-toast";
import { connect } from "react-redux";
import { Icon } from "react-native-elements";
import { TextInput } from "react-native";
import EDPopupView from "../components/EDPopupView";
import EDCategoryOrder from "../components/EDCategoryOrder";
import { NavigationEvents } from "react-navigation";
import EDYoutubeBannerCarousel from "../components/EDYoutubeBannerCarousel";
import EDYoutubePlayer from "../components/EDYoutubePlayer";
import { SafeAreaView } from "react-native";
import { FlatList } from "react-native";
import CartItem from "../components/CartItem";
import EDButton from "../components/EDButton";
import EDRadioDailogWithButton from "../components/EDRadioDailogWithButton";
import { getRestaurantMenu } from "../utils/ServiceManager";
import { netStatus } from "../utils/NetworkStatusConnection";
import { initialWindowMetrics } from "react-native-safe-area-context";

class RecipeDetail extends React.PureComponent {

    //#region  LIFE CYCLE METHODS
    constructor(props) {
        super(props);

        this.detail = this.props.navigation.state.params.detail;
        this.item = this.props.navigation.state.params.menuitem || undefined
        this.currency_symbol = this.props.navigation.state.params.currency_symbol
        this.resId = this.props.navigation.state.params.resId
        this.content_id = this.props.navigation.state.params.contentId
        this.isOpen = this.props.navigation.state.params.isOpen
        this.takeToCheckout = false
        this.cartDataDict = {}
        this.youTubeVideID = ""


        this.fontSize = Platform.OS == "ios" ? "18px" : "18px";
        this.meta = `
        <html `+ (isRTLCheck() ? "dir=rtl" : "dir=ltr") + `><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>`;
        this.customStyle =
            this.meta +
            "<style>* {max-width: 100%;} body { font-size:" +
            this.fontSize +
            ";}</style>";
        this.endTag = "</html>"
    }

    state = {
        cartData: [],
        quantity: 1,
        isLoading: false,
        isMenuLoading: false,
        isCategory: false,
        arrayBanners: [],
        isPlayerVisible: false,
        removeModal: false,
        isCartModalVisible: false,
        item: undefined

    }

    getCartDataList = () => {
        getCartList(this.onSuccessCartListAsync, this.onCartNotFound, this.onFailureCartListAsync);
    }

    //#region 
    /**
     * @param { Success Cart List From ASync } success
     */
    onSuccessCartListAsync = (success) => {
        let count = 0
        if (success !== undefined && success !== null && success.items !== undefined && success.items.length !== 0) {
            let same_item_incart = success.items.filter(item => { return item.menu_id === this.item.menu_id })
            if (same_item_incart !== undefined && same_item_incart !== null && same_item_incart.length !== 0) {
                same_item_incart.map(data => {
                    count = count + data.quantity
                })
            }
        }
        this.cartDataDict = success
        this.setState({
            cartData: success.items,
            key: this.state.key + 1,
            quantity: count
        })
        if (success.table_id !== undefined && success.table_id !== "") {
            debugLog("TABLE ID :::::", success.table_id)
            this.takeToCheckout = true
        }
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



    componentDidMount = () => {

        let bannerImages = []
        if (this.detail.youtube_video !== undefined && this.detail.youtube_video !== null && this.detail.youtube_video.trim().length !== 0) {
            var video_id = this.detail.youtube_video.split("v=")[1].substring(0, 11)

            if (video_id.length > 0) {
                this.youTubeVideID = video_id

                let firstDic = {
                    image: "https://img.youtube.com/vi/" + video_id + "/0.jpg",
                    name: "Youtube Video",
                    youtube: true,
                };
                bannerImages.push(firstDic);
            }

        }
        bannerImages.push(
            {
                image: this.detail.image,
                name: "Recipe Image",
            }
        )
        this.setState({ arrayBanners: bannerImages })
        debugLog("MOUNTED ::::", this.state.item)
        if (this.state.item == undefined)
            this.setState({ item: this.props.navigation.state.params.menuitem })
    }

    buttonYoutubePressed = () => {
        if (this.youTubeVideID.length > 0) {
            this.setState({ isPlayerVisible: true });
        }

    };
    onDismissPlayerHandler = () => {
        this.setState({ isPlayerVisible: false });
    };
    renderYoutubePlayer = () => {
        return (
            <EDPopupView isModalVisible={this.state.isPlayerVisible}
                onRequestClose={this.onDismissPlayerHandler}
            >
                <EDYoutubePlayer
                    title={this.detail.name}
                    videoID={this.youTubeVideID} onDismissHandler={this.onDismissPlayerHandler} />
            </EDPopupView>
        );
    };

    /** RENDER CATEGORY MODEL */
    renderCategoryOrder = () => {
        return (
            <EDPopupView isModalVisible={this.state.isCategory}>
                <EDCategoryOrder
                    image={this.item.image}
                    currency={this.currency_symbol}
                    price={this.item.offer_price != "" ? this.item.offer_price : this.item.price}
                    onDismissHandler={this.onDismissHandler}
                    categoryName={this.item.name}
                    newButtomHandler={this.onNewButtonHandler}
                    repeatButtonHandler={this.onRepeatButtonHandler}
                />
            </EDPopupView>
        )
    }

    onDismissRemove = () => {
        this.setState({ removeModal: false })
    }

    deleteHandler = (index) => {
        var array = this.cartDataDict.items;
        array.splice(index, 1);
        this.updateUI(array)
    }

    //#region UPDATE UI
    updateUI(items) {
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

        let cartItems = this.cartDataDict.items || []
        if (!cartItems.map(e => e.menu_id).includes(this.item.menu_id)) {
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
                            return (
                                item.menu_id == this.item.menu_id ?
                                    <>
                                        <CartItem
                                            key={this.state.key}
                                            index-={index}
                                            items={item}
                                            currency={this.currency_symbol}
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
                                            deleteClick={() => { this.deleteHandler(index) }}
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

    loadMenu = () => {
        if (this.item !== undefined)
            netStatus(status => {
                if (status) {
                    this.setState({ isMenuLoading: true });

                    let objRestaurantData = {
                        language_slug: this.props.lan,
                        restaurant_id: this.resId,
                        content_id: this.content_id
                    }
                    getRestaurantMenu(objRestaurantData, this.onSuccessResMenuData, this.onFailureResMenuData, this.props);
                } else {
                    showNoInternetAlert()
                }
            });
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
            if (onSuccess.menu_item !== undefined && onSuccess.menu_item.length > 0) {

                onSuccess.menu_item.map(data => {
                    data.items.map(product_test => {
                        if (product_test.menu_id == this.item.menu_id) {
                            debugLog("PRODUCT TEST MENU :::::", product_test)
                            this.item = product_test
                        }
                    })

                })
            }

            this.setState({ isMenuLoading: false });

        } else {
            this.setState({ isMenuLoading: false });
        }
    }

    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureResMenuData = (onFailure) => {
        console.log('::::: RES FAILED', onFailure)
        this.setState({ isMenuLoading: false });
        showValidationAlert(
            onFailure.response != undefined
                ? onFailure.response
                : strings("generalWebServiceError")
        );
    }

    /** RENDER METHOD */
    render() {
        // debugLog("ITEM ::::::", this.item , this.isOpen)
        return (
            <BaseContainer
                title={strings("recipeTitle")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[{}, { url: "shopping-cart", name: "Cart", value: this.props.cartCount, type: "ant-design" }]}
                onRight={this._onRightPressed}
                onLeft={this.onBackEventHandler}
                loading={this.state.isMenuLoading}
            >
                {/* TOAST */}
                <Toast ref="toast" position="center" fadeInDuration={0} />

                <NavigationEvents onDidFocus={this.getCartDataList} onWillFocus={this.loadMenu} />
                {/* SCROLL VIEW */}
                <ScrollView showsVerticalScrollIndicator={false}
                    style={style.scrollViewStyle}
                >
                    {this.renderRemoveItems()}
                    {this.renderCartChangeModal()}
                    {this.renderYoutubePlayer()}
                    {this.renderCategoryOrder()}

                    {/* MAIN VIEW */}
                    <View style={style.container}>
                 
                        <EDYoutubeBannerCarousel
                            key={"1"}
                            youTubeLink={true}
                            images={this.state.arrayBanners}
                            selectedImage={this.buttonYoutubePressed}
                        />
                        <View style={style.recipeDetail}>

                            {/* <View style={style.saparterView}>
                                <View style={style.saparterLine}></View>
                            </View> */}

                            {/* TITLE NAME */}
                            <EDRTLView style={style.titleView}>
                                <EDRTLText style={style.textStyle} title={this.detail.name} />
                            </EDRTLView>

                            {/* RECIPE TYPE */}
                            <EDRTLView style={style.iconView}>
                                <EDRTLView style={style.centerView} >
                                    <Icon name={"restaurant-menu"} size={getProportionalFontSize(15)} type={'MaterialIcons'} color={'#666666'} />
                                    <EDRTLText title={strings("foodType") + this.detail.food_type_name} style={style.foodType} />
                                </EDRTLView>
                            </EDRTLView>

                            {/* RECIPE TIME */}
                            <EDRTLView style={style.iconView}>
                                {this.detail.recipe_time != undefined &&
                                    this.detail.recipe_time != null ? (
                                    <EDRTLView style={style.centerView}>
                                        <Icon name={"clockcircleo"} size={getProportionalFontSize(15)} color={'#666666'} type={'ant-design'} />
                                        <EDRTLText title={this.detail.recipe_time + " " + strings("mins")} style={style.foodType} />
                                    </EDRTLView>
                                ) : null}
                            </EDRTLView>
                        </View>
                    </View>

                    {/* WEB VIEW */}
                    <View style={style.subContainer}
                    >
                        <EDRTLText title={strings("ingredients")} style={style.header} />
                        <AutoHeightWebView
                            source={{ html: this.customStyle + this.detail.ingredients }}
                            startInLoadingState={true}
                            renderLoading={() => { return (<Spinner size="small" color={EDColors.primary} />) }}
                            style={style.webview}
                            androidHardwareAccelerationDisabled
                            scrollEnabled={false}
                        />
                        <View style={{ height: 15 }} />
                        <EDRTLText title={strings("recipeDetails")} style={style.header} />
                        <AutoHeightWebView
                            source={{ html: this.customStyle + this.detail.recipe_detail }}
                            startInLoadingState={true}
                            androidHardwareAccelerationDisabled
                            renderLoading={() => { return (<Spinner size="small" color={EDColors.primary} />) }}
                            style={style.webview}
                            scrollEnabled={false}
                        />
                    </View>

                  
                </ScrollView>
                <View style={style.bottomView} />
                {/* CHECK OUT VIEW */}
                {this.isOpen ?
                    <EDRTLView style={style.checkOutContainer}>
                        <EDRTLText style={style.totalPrice}
                            title={this.currency_symbol + funGetFrench_Curr(this.item.offer_price !== "" ? this.item.offer_price : this.item.price, 1, this.currency_symbol)}
                        />
                        {this.state.isLoading ?
                            <Spinner size={"small"} color={EDColors.primary} style={{ marginHorizontal: 50 }} />
                            : (this.cartDataDict.items !== undefined && this.cartDataDict.items.some(item => item.menu_id === this.item.menu_id && item.quantity >= 1) ?

                                <View>
                                    <EDRTLView style={style.qtyContainer}>
                                        <Icon name="remove-circle" size={getProportionalFontSize(22)} color={EDColors.primary} onPress={() => {
                                            if (parseInt(this.state.quantity == 0)) { return; }
                                            else {
                                                if (this.item.is_customize === "0") {
                                                    this.setState({ quantity: this.state.quantity - 1 });
                                                    this.onAddToCartEventHandler(-1)
                                                }
                                                else
                                                    this.setState({ removeModal: true })
                                            }
                                        }}
                                        />
                                        {/* <Text style={style.qtyText}>
                                        {count}
                                    </Text> */}
                                        <TextInput style={style.qtyInput}
                                            maxLength={3}
                                            // editable={
                                            //     this.item.addons_category_list === undefined || this.item.addons_category_list.length === 0
                                            // }
                                            editable={false}
                                            keyboardType="numeric"
                                            value={this.state.quantity.toString()}
                                            onChangeText={this.onChangeText} />
                                        <Icon name="add-circle" size={getProportionalFontSize(22)} color={EDColors.primary} onPress={() =>
                                            parseInt(this.state.quantity) < 999 ?
                                                (
                                                    this.item.is_customize === "0" ?
                                                        this.setState({ quantity: this.state.quantity + 1 }) : null,
                                                    this.onAddToCartEventHandler(1))
                                                :
                                                showValidationAlert(strings("qtyExceed"))
                                        } />

                                    </EDRTLView>
                                  

                                </View> :
                              
                                <EDButton
                                    label={strings("addToCart")}
                                    style={style.roundButton}
                                    onPress={() => {
                                        this.item.is_customize === "0" ?
                                            this.setState({ quantity:  1 }) : null
                                        this.onAddToCartEventHandler(1)
                                    }}
                                />
                            )}

                    </EDRTLView>
                    : null}

            </BaseContainer>
        );
    }
    //#endregion


    /** ON RIGHT EVENT HANDLER */
    /**
     * @param { Index Number Selected } index
     */
    _onRightPressed = (index) => {
        if (this.props.cartCount > 0) {
            if (this.takeToCheckout)
                this.props.navigation.navigate("CheckOutContainer", { isDineOrder: true });
            else
                this.props.navigation.navigate("CartContainer", { isview: false });
        } else {
            showValidationAlert(strings("cartItemNotAvailable"));
        }

    };

    onChangeText = (value) => {
        let newValue = value.replace(/\D/g, '')
        this.setState({ quantity: newValue })
    }
    

    //#region 
    /** BACK EVENT HANDLER */
    onBackEventHandler = () => {
        this.props.navigation.goBack();
    }
    //#endregion

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
        this.setState({ isCategory: false, quantity: this.state.quantity + 1 })

        this.selectedArray = this.cartDataDict.items.filter((items) => {
            return items.menu_id === this.selectedItem.menu_id
        })
        this.lastSelectedData = this.selectedArray[this.selectedArray.length - 1]
        this.storeData(this.lastSelectedData, 1);

    }

    //#region 
    /** RES DETAILS ADD EVENT */
    onResDetailsAddEvent = () => {
        // var data
        // this.menuArray.map(item => {
        //     item.items != undefined ? item.items.map(subItem => {
        //         if (subItem.menu_id == addData.menu_id) {
        //             data = subItem
        //         }
        //     }) : null
        // })
        debugLog("ITEM TEST :::", this.state.item, this.props.navigation)
        var data = this.item


        this.props.navigation.navigate("CategoryFromRecipe",
            {
                subCategoryArray: data,
                resid: this.resId,
                currency_symbol: this.currency_symbol,
                ItemName: data.name,
                extraData: data,
                refreshScreen: this.refresh
            }
        )

        this.setState({ isLoading: false })

    }
    refresh = (data) => {
        this.refs.toast.show(strings("addItemSuccess"), DURATION.LENGTH_SHORT);

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
                this.onAddToCartEventHandler()
            else
                this.storeData(this.tempArrayItem, this.tempQty)
            this.setState({ isCartModalVisible: false, isCustomItem: false })
        }
    }

    onCartAddCancelPressed = () => {
        this.setState({ isCartModalVisible: false })
    }

    onAddToCartEventHandler = (qty = 1, customQty = "") => {
        this.setState({ isLoading: true })
        if (this.item.is_customize === "0") {
            this.storeData(this.item, qty, "")
        } else {
            this.setState({ isLoading: false })
            var cartArray = [];
            getCartList(
                success => {
                    if (success !== undefined) {
                        cartArray = success.items;
                        if (cartArray.length > 0) {
                            if (success.resId !== this.resId) {
                                this.tempArrayItem = this.item
                                this.tempQty = qty
                                this.setState({ visible: false, isCartModalVisible: true, isCustomItem: true, recipeVisible: false })
                            } else {


                                if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                                    var repeatItem = this.cartDataDict.items.filter(items => {
                                        return items.menu_id == this.item.menu_id
                                    })
                                    if (repeatItem.length > 0) {
                                        this.selectedItem = this.item
                                        this.setState({
                                            isCategory: true,
                                            visible: false,
                                            recipeVisible: false
                                        })
                                    } else {
                                        this.setState({ visible: false, recipeVisible: false })
                                        this.onResDetailsAddEvent(this.item)
                                    }
                                } else {
                                    this.setState({ visible: false, recipeVisible: false })
                                    this.onResDetailsAddEvent(this.item)
                                }
                            }
                        } else {
                            if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                                var repeatItem = this.cartDataDict.items.filter(items => {
                                    return items.menu_id == this.item.menu_id
                                })

                                if (repeatItem.length > 0) {
                                    this.selectedItem = this.item
                                    this.setState({
                                        isCategory: true,
                                        visible: false,
                                        recipeVisible: false
                                    })
                                } else {
                                    this.setState({ visible: false, recipeVisible: false })
                                    this.onResDetailsAddEvent(this.item)
                                }
                            } else {
                                this.setState({ visible: false, recipeVisible: false })
                                this.onResDetailsAddEvent(this.item)
                            }
                        }
                    } else {
                        if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                            var repeatItem = this.cartDataDict.items.filter(items => {
                                return items.menu_id == this.item.menu_id
                            })

                            if (repeatItem.length > 0) {
                                this.selectedItem = this.item
                                this.setState({
                                    isCategory: true,
                                    visible: false,
                                    recipeVisible: false
                                })
                            } else {
                                this.setState({ visible: false, recipeVisible: false })
                                this.onResDetailsAddEvent(this.item)
                            }
                        } else {
                            this.setState({ visible: false, recipeVisible: false })
                            this.onResDetailsAddEvent(this.item)
                        }
                    }
                },
                notfound => {
                    if (this.cartDataDict.items !== undefined && this.cartDataDict.items.length > 0) {
                        var repeatItem = this.cartDataDict.items.filter(items => {
                            return items.menu_id == this.item.menu_id
                        })

                        if (repeatItem.length > 0) {
                            this.selectedItem = this.item
                            this.setState({
                                isCategory: true,
                                visible: false,
                                recipeVisible: false
                            })
                        } else {
                            this.setState({ visible: false, recipeVisible: false })
                            this.onResDetailsAddEvent(this.item)
                        }
                    } else {
                        this.setState({ visible: false, recipeVisible: false })
                        this.onResDetailsAddEvent(this.item)
                    }
                }
            )
        }
    }



    /** STORE DATA */
    storeData = (data, qty = 1, customQty = "") => {

        debugLog("DATA :::::", data, typeof qty, customQty)
        this.setState({ isLoading: true })
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
                                    debugLog("REPEAT ARRAY ::::", repeatArray)
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
                            this.cartDataDict = cartData

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
                        this.cartDataDict = cartData

                        this.updateCount(cartData.items, true);
                        console.log(':::::::::::::::::::cd', cartData)
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
                    this.cartDataDict = cartData

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
                this.cartDataDict = cartData

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
        if (shouldShowToast)
            this.refs.toast.show(strings("addItemSuccess"), DURATION.LENGTH_SHORT);

        var count = 0;
        var price = 0
        var array = []
        var subArray = []
        data.map((item, index) => {
            count = count + item.quantity;
            price = item.offer_price !== undefined && item.offer_price !== ''
                ? Number(price) + (item.quantity * Number(item.offer_price))
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
        this.setState({ isLoading: false })

    }
    //#endregion

    //#region SAV EDATA
    saveData(data) {
        saveCartData(data, success => { }, fail => { });
    }
}

//#region STYLES
export const style = StyleSheet.create({
    container: {
        backgroundColor: EDColors.white,
        flex: 1
    },
    titleView: {
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 5
    },
    iconView: {
        marginHorizontal: 20,
        marginVertical: 5,
    },
    centerView: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    scrollViewStyle: {
        backgroundColor: EDColors.white,
        // marginBottom: 10
    },
    foodType: {
        fontFamily: EDFonts.regular,
        color: EDColors.blackSecondary,
        fontSize: getProportionalFontSize(12),
        marginTop: 1,
        marginHorizontal: 5,
        // marginTop:10
    },
    saparterView: { width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
    saparterLine: { width: metrics.screenWidth * 0.22, backgroundColor: EDColors.separatorColorNew, borderRadius: 10, height: metrics.screenHeight * 0.0040 },
    recipeDetail: {
        backgroundColor: EDColors.white,
    },
    subContainer: {
        paddingHorizontal: 20,
        backgroundColor: EDColors.white,
        // borderRadius: 6,
        paddingTop: 10,
        flex: 1
    },
    webview: {
        width: "100%"
    },
    textStyle: {
        color: EDColors.black,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(20),
    },
    bottomView: { backgroundColor: EDColors.white, height: 10, width: metrics.screenWidth },
    header: {
        color: EDColors.black,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(18),
        // textDecorationLine: "underline",
        marginBottom: 10,

    },
    viewStyle: {
        marginVertical: 10,
        height: 1,
        backgroundColor: EDColors.black
    },
    checkOutContainer: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: "#fff",
        borderTopColor: EDColors.separatorColorNew,
        borderTopWidth: 1
    },
    totalPrice: {
        flex: 1,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(18),
        marginHorizontal: 10,
        marginVertical: 10,
        color: EDColors.black
    },
    roundButton: {
        paddingHorizontal: 20,
        marginHorizontal: 0
    },
    button: {
        paddingTop: 10,
        paddingRight: 20,
        paddingLeft: 20,
        paddingBottom: 10,
        color: EDColors.white,
        fontFamily: EDFonts.regular
    },
    qtyInput: {
        color: EDColors.black,
        borderColor: EDColors.separatorColor,
        borderWidth: 1,
        borderRadius: 5,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: getProportionalFontSize(14),
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginHorizontal: 10,
        minWidth: 50,

    },
    qtyContainer: {
        alignItems: "center",
        margin: 5,
        alignSelf: "center"
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
        // borderBottomColor: "#EDEDED",
        // borderBottomWidth: 1,
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
)(RecipeDetail);



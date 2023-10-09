import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { connect } from "react-redux";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import ItemComponent from '../components/ItemComponent';
import OrderItem from "../components/OrderItem";
import PriceDetail from "../components/PriceDetail";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCurrencySymbol } from "../redux/actions/Checkout";
import { clearCartData, getCartList, saveCartData, saveCurrency_Symbol } from "../utils/AsyncStorageHelper";
import { showDialogue } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import BaseContainer from "./BaseContainer";
import EDRadioDailogWithButton from "../components/EDRadioDailogWithButton";
import EDPopupView from "../components/EDPopupView";
import EDWriteSellerReview from "../components/EDWriteSellerReview";
import StarRating from "react-native-star-rating";
import metrics from "../utils/metrics";
import { SvgXml } from "react-native-svg";
import { cart_icon } from "../utils/EDSvgIcons";
import EDImage from '../components/EDImage'
import { saveOrderMode } from "../redux/actions/User";
import moment from "moment";

class OrderDetailContainer extends React.Component {
    constructor(props) {
        super(props);
        this.orderItem = this.props.navigation.state.params.OrderItem;
        this.tempArrayItem = []
    }

    state = {
        isLoading: false,
        isCartModalVisible: false,
        isReview: false,
        reviewStar: "",
        reviewText: "",
        cartModal: false,
        cartMsg: '',
        totalWave: 0,
        totalWidth: 0

    }

    //#region REVIEW SUBMIT MODEL
    /** RENDER REVIEW DIALOGUE */
    renderReviewSubmitDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.isReview}
                style={{ justifyContent: "flex-end" }}>
                <EDWriteSellerReview
                    containerProps={this.props}
                    orderData={this.orderItem}
                    dismissWriteReviewDialogueHandler={this.onDismissReviewSubmitHandler}
                    onDismissReviewAndReload={this.onDismissReviewAndReload}
                />
            </EDPopupView>
        )
    }
    //#endregion

    renderPopup = () => {
        return (
            <EDPopupView isModalVisible={this.state.cartModal}>
                <View style={styles.popupView}>
                    <View style={styles.popupSubView}>
                        <SvgXml xml={cart_icon} style={styles.iconStyle} />
                        <Text style={styles.paymentText}>
                            {this.state.cartMsg}
                        </Text>
                        <EDThemeButton
                            style={styles.popupBtn}
                            textStyle={styles.reorderBtnText}
                            label={strings("dialogOkay")}
                            onPress={() => {
                                this.setState({ isLoading: false, cartModal: false })
                            }}
                        />
                    </View>
                </View>
            </EDPopupView>
        )
    }


    //#region CLOSE REQUEST HANDLER
    onDismissReviewSubmitHandler = () => {
        this.setState({ isReview: false });
    }

    onAddReviewPressed = () => {
        this.setState({ isReview: true })
    }

    onDismissReviewAndReload = (rating, driver_rating, reviewObj, message) => {
        debugLog("REVIEW OBJ ::::", rating, driver_rating, reviewObj, message)
        this.setState({ isReview: false })
        showDialogue(message, [], '', () => {
            this.orderItem.rating = rating
            this.orderItem.review = reviewObj.orderRemarks
            this.orderItem.driver_rating = driver_rating
            this.orderItem.driver_review = reviewObj.driverRemarks
            this.setState({ isReview: false });
        })
    }
    //#endregion

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
            this.storeData(this.tempArrayItem)
            this.setState({ isCartModalVisible: false })
        }
    }

    onLayout = (e) => {
        // debugLog("ON LAYOUT ::::", e.nativeEvent)
        let totalWave = (e.nativeEvent.layout.width - 60) / 10
        if (totalWave % 2 !== 0)
            totalWave = totalWave + 1
        this.setState({ totalWave: totalWave, totalWidth: e.nativeEvent.layout.width - 60 })
    }


    onCartAddCancelPressed = () => {
        this.setState({ isCartModalVisible: false })
    }

    // RENDER METHOD
    render() {
        var wave = []
        let i = 0
        while (i < this.state.totalWave) {
            wave.push(
                <View style={{ marginHorizontal: 3, height: 20, width: 10, borderRadius: 10, backgroundColor: EDColors.white }} />
            )
            i++;
        }
        return (
            <BaseContainer
                title={strings("orderDetail")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onBackPressedEvent}>

                {/* SCROLL VIEW */}
                <ScrollView>

                    {/* MAIN VIEW */}
                    <View style={styles.topView}
                        pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                    >
                        {/* REVIEW MODAL */}
                        {this.renderReviewSubmitDialogue()}
                        {this.renderPopup()}
                        {this.renderCartChangeModal()}
                        <View style={styles.mainContainer}>
                            <EDRTLView style={styles.mainView} >
                                <EDImage style={styles.orderImage}
                                    source={this.orderItem.restaurant_image}
                                    resizeMode="cover"

                                />
                                <View style={styles.subView}>
                                    <EDRTLText style={styles.simpleText}
                                        title={moment(this.orderItem.order_date,"YYYY-MM-DD h:mm A").format("MM-DD-YYYY h:mm A")} />
                                    {/* RES NAME */}
                                    <EDRTLText style={styles.resText}
                                        title={this.orderItem.restaurant_name} />
                                    {/* ORDER ID AND STATUS*/}
                                    <EDRTLText style={styles.simpleText} title={strings("orderId") + " " + this.orderItem.order_id} />
                                </View>

                                {/* </View> */}
                            </EDRTLView>
                            <View style={styles.saparater} />
                            <EDRTLView style={styles.statusView}>
                                <Text style={[styles.statusText, {
                                    color: this.orderItem.order_status.toLowerCase() == "cancel" ? EDColors.error : "green"
                                }]}
                                    numberOfLines={1}>
                                    {(this.orderItem.order_status == "Delivered" ? strings("orderDelivered") : this.orderItem.order_status == "OnGoing" ? strings("onWay") : this.orderItem.order_status == "Cancel" ? strings('dialogCancel') : (this.orderItem.order_status_display || this.orderItem.order_status))}
                                </Text>
                                <Text style={styles.simpleText}>
                                    {this.orderItem.items.length == 1 ? 1 + " " + strings("itemOrdered") : this.orderItem.items.length + " " + strings("itemsOrdered")}
                                </Text>
                            </EDRTLView>

                            {/* PAYMENT TYPE VIEW */}
                            <View style={{ margin: 15, backgroundColor: EDColors.radioSelected }}>
                                <EDRTLView style={[styles.waveContainer, { marginTop: -8 }]}>
                                    {wave}
                                </EDRTLView>
                                <View style={styles.viewStyle} onLayout={this.onLayout} >

                                    <EDRTLView style={styles.textStyle}>
                                        <EDRTLText style={styles.paymentText}
                                            title={strings("orderType")}
                                        />
                                        <EDRTLText style={styles.simpleText}
                                            title={this.orderItem.delivery_flag.toLowerCase() == 'dinein' ? strings('dineinOrder')
                                                : this.orderItem.delivery_flag.toLowerCase() == 'delivery' ? strings('deliveryOrder') : strings('pickUpOrder')}
                                        />
                                    </EDRTLView>

                                    {/* ONLINE OR COD */}
                                    <EDRTLView style={styles.textStyle}>
                                        <EDRTLText style={styles.paymentText}
                                            title={strings("paymenMethod")}
                                        />
                                        <EDRTLText style={styles.simpleText}
                                            title={this.orderItem.order_type == "paid" ? strings("onlinePaid") : strings("cod")}
                                        />
                                    </EDRTLView>


                                    {this.orderItem.delivery_flag == "dinein" && this.orderItem.table_number !== null ?
                                        <EDRTLView style={styles.textStyle}>
                                            <EDRTLText style={styles.paymentText}
                                                title={strings("tableNo")}
                                            />
                                            <EDRTLText style={styles.simpleText}
                                                title={this.orderItem.table_number}
                                            />
                                        </EDRTLView> : null}

                                    {this.orderItem.cancel_reason !== '' || this.orderItem.reject_reason !== "" ?
                                        < EDRTLView style={styles.textStyle}>
                                            <EDRTLText style={styles.paymentText}
                                                title={strings("cancelReason")}
                                            />
                                            <EDRTLText style={{
                                                flex: 1, marginLeft: isRTLCheck() ? 0 : 20, marginRight: isRTLCheck() ? 20 : 0,
                                                textAlign: isRTLCheck() ? 'left' : 'right'
                                            }} title={this.orderItem.cancel_reason !== '' ? this.orderItem.cancel_reason : this.orderItem.reject_reason} numberOfLines={2} />
                                        </EDRTLView> : null}

                                    {/* SEPARATOR */}
                                    <View style={styles.priceView} />

                                    {/* ITEMS */}
                                    {this.orderItem.items !== undefined && this.orderItem.items !== null ? this.orderItem.items.map((item, index) => {
                                        return (
                                            <ItemComponent
                                                quantity={item.quantity}
                                                name={item.name}
                                                titleStyle={styles.paymentText}
                                                priceStyle={styles.paymentText}
                                                data={item}
                                                currency_symbol={this.orderItem.currency_symbol}
                                                lan={this.props.lan}
                                                price={this.orderItem.currency_symbol + funGetFrench_Curr(item.offer_price !== "" && item.offer_price !== undefined && item.offer_price !== null ? item.offer_price : item.price, item.quantity, this.orderItem.currency_symbol)}
                                            />
                                        )
                                    }) : null}

                                    {/* SEPARATOR */}
                                    <View style={styles.totalSapareter} />

                                    {/* LIST ITEMS */}
                                    <View style={{ flexDirection: "row" }}>
                                        <FlatList
                                            data={this.orderItem.price.filter(p => (p.value != 0 && p.value != "0.00"))}
                                            listKey={(item, index) => "Q" + index.toString()}
                                            renderItem={this.createItemsList}
                                            keyExtractor={(item, index) => item + index}
                                        />
                                    </View>

                                    {/* SEPARATOR */}
                                    <View style={styles.totalSapareter} />

                                    {/* PRICE DETAILS */}
                                    <PriceDetail
                                        titleStyle={styles.paymentText}
                                        priceStyle={styles.simpleText}
                                        title={strings("cartTotal")}
                                        price={this.orderItem.currency_symbol + funGetFrench_Curr(this.orderItem.total, 1, this.orderItem.currency_symbol)}
                                    />

                                    {this.orderItem.extra_comment !== undefined && this.orderItem.extra_comment !== null && this.orderItem.extra_comment !== "" ?
                                        <>
                                            <View style={styles.commentView} />
                                            <View style={styles.commentContainer}>
                                                <EDRTLText style={styles.text} title={strings("orderComment") + ': ' + this.orderItem.extra_comment} />
                                                {/* <Text style={{ color: EDColors.black }}>{data.extra_comment}</Text> */}
                                            </View>
                                        </>
                                        : null}
                                    {this.orderItem.delivery_instructions !== undefined && this.orderItem.delivery_instructions !== null && this.orderItem.delivery_instructions !== "" ?
                                        <>
                                            <View style={styles.commentView} />
                                            <View style={styles.commentContainer}>
                                                <EDRTLText style={styles.text} title={strings("deliveryInstruction") + ' : ' + this.orderItem.delivery_instructions} />
                                                {/* <Text style={{ color: EDColors.black }}>{data.extra_comment}</Text> */}
                                            </View>
                                        </>
                                        : null}

                                </View>
                                <EDRTLView style={[styles.waveContainer, { marginTop: -10 }]}>
                                    {wave}
                                </EDRTLView>
                            </View>
                            {/* REORDER BUTTON */}
                            {this.props.navigation.getParam("track") !== true ?
                                <EDRTLView style={styles.btnView}>
                                    <EDThemeButton
                                        style={styles.reorderBtn}
                                        textStyle={styles.reorderBtnText}
                                        label={strings("reOrder")}
                                        onPress={this.onOrderItemPressed}
                                    />
                                    {this.orderItem.order_status == "Delivered" || this.orderItem.order_status == "Complete" ?
                                        (this.orderItem.rating !== undefined && this.orderItem.rating !== null && this.orderItem.rating !== "" ? null :
                                            // this.orderItem.show_restaurant_reviews !== undefined && this.orderItem.show_restaurant_reviews !== null && this.orderItem.show_restaurant_reviews ?
                                            <EDThemeButton
                                                style={styles.rateBtn}
                                                textStyle={styles.rateBtnText}
                                                label={strings("rateOrder")}
                                                onPress={this.onAddReviewPressed}
                                            />
                                            // :null

                                        ) : null}
                                </EDRTLView>
                                : null}
                            {/* </View> */}
                            {this.orderItem.rating !== undefined && this.orderItem.rating !== null && this.orderItem.rating !== "" ?
                                <View style={styles.reviewContainer}>
                                    <EDRTLView style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                        <EDRTLText title={strings("orderRating")} style={styles.rating} />
                                        <StarRating
                                            containerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                                            starStyle={{}}
                                            starSize={getProportionalFontSize(22)}
                                            emptyStar={'star'}
                                            fullStar={'star'}
                                            halfStar={'star-half'}
                                            iconSet={'MaterialIcons'}
                                            maxStars={5}
                                            rating={this.orderItem.rating}
                                            emptyStarColor={EDColors.emptyStar}
                                            reversed={isRTLCheck()}
                                            disabled={true}
                                            animation='swing'
                                            halfStarEnabled={false}
                                            fullStarColor={EDColors.fullStar} />
                                    </EDRTLView>
                                    <EDRTLView style={styles.remarkView}>
                                        <EDRTLText title={strings("remark")} style={[styles.rating, { fontFamily: EDFonts.medium }]} />
                                        <EDRTLText title={this.orderItem.review} style={[styles.rating, { fontFamily: EDFonts.regular, flex: 1 }]} />
                                    </EDRTLView>

                                    {this.orderItem.driver_review !== undefined && this.orderItem.driver_review !== null && this.orderItem.driver_review !== "" ?
                                        <>
                                            <EDRTLView style={styles.rattingView}>
                                                <EDRTLText title={strings("driverRating")} style={styles.rating} />
                                                <StarRating
                                                    containerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                                                    starStyle={{}}
                                                    starSize={getProportionalFontSize(22)}
                                                    emptyStar={'star'}
                                                    fullStar={'star'}
                                                    halfStar={'star-half'}
                                                    iconSet={'MaterialIcons'}
                                                    maxStars={5}
                                                    rating={this.orderItem.driver_rating}
                                                    emptyStarColor={EDColors.emptyStar}
                                                    reversed={isRTLCheck()}
                                                    disabled={true}
                                                    animation='swing'
                                                    halfStarEnabled={false}
                                                    fullStarColor={EDColors.fullStar} />
                                            </EDRTLView>
                                            <EDRTLView style={{ marginTop: 5, flex: 1 }}>
                                                <EDRTLText title={strings("remark")} style={[styles.rating, { fontFamily: EDFonts.medium }]} />
                                                <EDRTLText title={this.orderItem.driver_review} style={[styles.rating, { fontFamily: EDFonts.regular, flex: 1 }]} />
                                            </EDRTLView>
                                        </>
                                        : null
                                    }
                                </View> : null}

                        </View>
                        {/* ====================================================================== */}
                        <EDRTLText style={styles.orderItemView} title={strings("orderedItems")} />

                        <FlatList
                            data={this.orderItem.items}
                            listKey={(item, index) => "Q" + index.toString()}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={styles.orderView}>
                                        <OrderItem
                                            imageStyle={styles.orderImage}
                                            titleStyle={styles.orderTitle}
                                            quantityStyle={styles.orderQuanText}
                                            priceStyle={styles.priceText}
                                            itemImage={item.image}
                                            itemName={item.name}
                                            quantity={strings("quantity") + ": " + item.quantity}
                                            price={this.orderItem.currency_symbol + funGetFrench_Curr(item.itemTotal, 1, this.orderItem.currency_symbol)}
                                            isVeg={item.is_veg}
                                            foodType={item.food_type_name}
                                        />
                                    </View>
                                );
                            }}
                            keyExtractor={(item, index) => item + index}
                        />
                    </View>
                </ScrollView>
            </BaseContainer >
        );
    }
    //#endregion

    //#region 
    /** ON LEFT PRESSED */
    onBackPressedEvent = () => {
        this.props.navigation.goBack();
    }
    //#endregion


    //#region 
    /** ON ORDER ITEM EVENT */
    onOrderItemPressed = () => {
        if (this.orderItem.restaurant_status == "" || this.orderItem.timings.closing.toLowerCase() !== "open") {

            this.setState({ cartModal: true, cartMsg: strings("resNotAccepting") })
        } else {
            this.setState({ isLoading: true })
            this.props.saveOrderModeInRedux(this.orderItem.delivery_flag.toLowerCase() == 'delivery' ? 0 : 1)

            this.storeData(this.orderItem);
        }
    }

    //#region 
    /** ITEM LIST */
    createItemsList = ({ item, index }) => {
        return (
            <View style={{ flex: 1 }}>
                {item !== "" ?
                    <PriceDetail
                        title={item.label}
                        titleStyle={styles.paymentText}
                        priceStyle={styles.paymentText}
                        price={
                            (item.label_key.includes("Tip") || item.label_key.includes("Delivery") || item.label_key.includes("Service")) ? item.value !== undefined && item.value != null && item.value.toString() !== undefined && item.value.toString() !== null ? item.value.toString().includes("%") ? isRTLCheck() ? item.value + ' +' : "+ " + item.value : isRTLCheck() ? this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol) + ' +' : "+ " + this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol) : ''
                                : (item.label_key.includes("Coupon") || item.label_key.includes("Discount") || item.label_key.includes("Used Earning Points") ? isRTLCheck() ? this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol) + ' -' : "- " + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol) + this.orderItem.currency_symbol : this.orderItem.currency_symbol + funGetFrench_Curr(item.value, 1, this.orderItem.currency_symbol))
                        }
                    />
                    : null}
            </View>
        );
    }
    //#endregion

    //#region 
    /** STORE DATA */
    storeData(data) {
        var cartData = {};
        getCartList(
            success => {
                if (success.items.length === 0) {
                    clearCartData(success => {
                        cartData = {
                            resId: data.restaurant_id,
                            items: data.items,
                            coupon_name: "",
                            cart_id: 0
                        };
                        console.log("cartData::", cartData)
                        this.saveData(cartData);
                    });
                } else {
                    if (success.resId == data.restaurant_id) {

                        this.setState({ cartModal: true, cartMsg: strings("alreadyInCart") })
                    } else {
                        this.tempArrayItem = data
                        this.setState({ isLoading: false, isCartModalVisible: true })
                    }

                }
            },
            onCartNotFound => {
                cartData = {
                    resId: data.restaurant_id,
                    items: data.items,
                    coupon_name: "",
                    cart_id: 0
                };
                this.saveData(cartData);
            },
            error => { }
        );
    }
    //#endregion

    //#region 
    /** UPDATE DATA */
    updateCount(data) {
        var count = 0;
        data.map((item, index) => {
            count = count + Number(item.quantity);
        });
        this.props.saveCartCount(count);
    }
    //#endregion

    //#region 
    /** SAVE DATA */
    saveData(data) {
        this.props.saveCurrencySymbol(this.orderItem.currency_symbol)
        this.updateCount(data.items)
        saveCartData(
            data,
            success => {
                saveCurrency_Symbol(this.orderItem.currency_symbol, onsuccess => {
                    this.setState({ isLoading: false })
                    this.props.navigation.popToTop()
                    this.props.navigation.navigate("CartContainer", { isview: false });
                }, onFailure => {

                    this.setState({ isLoading: false })
                })
            },
            fail => {
                this.setState({ isLoading: false })
            }
        );
    }
    //#endregion
}

const styles = StyleSheet.create({
    mainView: {
        // backgroundColor: EDColors.backgroundLight,
        padding: 5,
        marginHorizontal: 5,
        marginTop: 5,
        // borderTopLeftRadius: 5,
        // borderTopRightRadius: 5,
        // justifyContent: "space-between"
    },
    subView: {
        paddingHorizontal: 8,
        justifyContent: 'space-evenly',
        paddingVertical: 5,
        flex: 1
    },
    saparater: {
        width: '100%',
        height: 1,
        backgroundColor: EDColors.radioSelected,
        marginVertical: 5
    },
    resText: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black,
    },
    viewStyle: {
        // borderRadius: 6,
        backgroundColor: EDColors.radioSelected,
        marginVertical: 20,
        // paddingBottom:5
    },
    mainContainer: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        margin: 10
    },
    textStyle: { marginHorizontal: 10, justifyContent: "space-between", marginTop: 10, marginBottom: 5 },
    priceView: { height: 1, backgroundColor: EDColors.backgroundDark, marginVertical: 5, paddingHorizontal: 10 },
    orderImage: { borderRadius: 8, width: metrics.screenWidth * 0.22, height: metrics.screenWidth * 0.22, alignSelf: 'center' },
    orderTitle: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black },
    statusView: { justifyContent: 'space-between', marginHorizontal: 11, marginTop: 5 },
    remarkView: { marginTop: 5, flex: 1 },
    topView: { flex: 1, paddingBottom: 10 },
    rattingView: { alignItems: 'center', justifyContent: 'space-between', borderTopWidth: .75, borderTopColor: EDColors.black, marginTop: 7.5, paddingTop: 7.5 },
    statusText: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(12),
        color: 'green'
    },
    orderQuanText: { fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(12), color: EDColors.text },
    priceText: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(14), color: EDColors.black, marginTop: 5 },
    reviewContainer: {
        backgroundColor: EDColors.palePrimary,
        padding: 10,
        margin: 10
    },
    rating: {
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black
    },
    waveContainer: {
        zIndex: 1,
        marginBottom: -10,
        overflow: "hidden",
        // marginHorizontal: 3,

        borderRightColor: EDColors.offWhite,
        borderLeftColor: EDColors.offWhite,

    },
    paymentText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.black
    },
    simpleText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(12), color: EDColors.text },
    commentContainer: { marginHorizontal: 10, marginTop: 5, marginBottom: 10 },
    reorderBtn: { alignSelf: 'center', flex: 1, borderRadius: 16, height: metrics.screenHeight * 0.07, marginHorizontal: 5 },
    popupBtn: { alignSelf: 'center', borderRadius: 16, height: metrics.screenHeight * 0.07, marginHorizontal: 5, width: '100%', marginVertical: 10 },
    commentView: { height: 1, backgroundColor: EDColors.backgroundDark, marginTop: 5, marginTop: 10, },
    reorderBtnText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16) },
    rateBtn: { alignSelf: 'center', flex: 1, borderRadius: 16, backgroundColor: EDColors.offWhite, marginHorizontal: 5, height: metrics.screenHeight * 0.07 },
    rateBtnText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16), color: EDColors.black },
    orderItemView: { margin: 10, fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black, marginHorizontal: 10 },
    btnView: { justifyContent: "space-around", flex: 1, marginBottom: 10 },
    orderView: { flex: 1, margin: 10, borderRadius: 16, marginHorizontal: 15, backgroundColor: EDColors.white },
    totalSapareter: { height: 1, backgroundColor: EDColors.backgroundDark, marginVertical: 5, },
    popupView: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    text: { color: EDColors.black, marginTop: 10 },
    popupSubView: { backgroundColor: EDColors.white, borderRadius: 24, width: '90%', padding: 15, justifyContent: 'center', alignItems: 'center' },
    iconStyle: {
        marginVertical: 10
    }
})

export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            userID: state.userOperations.userIdInRedux,
        }
    },
    dispatch => {
        return {
            saveCurrencySymbol: symbol => {
                dispatch(saveCurrencySymbol(symbol))
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveOrderModeInRedux: mode => {
                dispatch(saveOrderMode(mode))
            }
        };
    }
)(OrderDetailContainer);

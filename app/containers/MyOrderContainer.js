import AsyncStorage from '@react-native-async-storage/async-storage';
import React from "react";
import { AppState, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import EDCancelReasonsList from "../components/EDCancelReasonList";
import EDOrdersViewFlatList from '../components/EDOrdersViewFlatList';
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from '../components/EDPopupView';
import EDTopTabBar from "../components/EDTopTabBar";
import EDWriteSellerReview from "../components/EDWriteSellerReview";
import { strings } from "../locales/i18n";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { saveCancellationReason } from "../redux/actions/User";
import { showDialogue, showNoInternetAlert, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, getProportionalFontSize, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { addReviewAPI, cancelOrderAPI, getCancelReasonList, getOrderListingAPI } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";

class MyOrderContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.checkoutDetail = this.props.checkoutDetail;
        var userObj = null;
        this.strOnScreenMessageInProcess = '';
        this.strOnScreenSubtitleinProcess = '';
        this.strOnScreenMessagePast = '';
        this.strOnScreenSubtitlePast = '';
        this.arrayUpcoming = [];
        this.currency_symbol = ""
        this.refreshing = false
        this.cancelReasonArray = [
            { label: strings('otherReason'), value: strings('otherReason') },
        ]



    }

    state = {
        isLoading: false,
        selectedIndex: 0,
        isEnable: false,
        isReview: false,
        reviewStar: "",
        reviewText: "",
        restaurant_id: "",
        ratingObj: undefined,
        isCancelModalVisible: false,
        isReasonLoading: false
    };

    async componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        var a = await AsyncStorage.getItem('ratingData');
        // console.log("NOTI REST ID" + JSON.stringify(a));
        // console.log("NOTI REST ID WITHOUT JSON" + a);
        if (a !== null && a !== undefined)
            this.setState({ restaurant_id: a.restaurant_id, ratingObj: a })
        console.log("IS REVIEW :::::", this.state.isReview)
        this.props.saveNavigationSelection("Order");
    }

    /**
     * @param { Applications status Active or Background } nextAppState
     */
    _handleAppStateChange = async (nextAppState) => {
        this.strOnScreenMessage = ""
        this.strOnScreenSubtitle = ""
        this.refreshing = false
        this.arrayPast = []
        this.arrayUpcoming = []
        this.setState({ isLoading: true })
        this.getOrderListingData();
        var a = await AsyncStorage.getItem('ratingData');
        if (a !== null && a !== undefined) {
            // this.scrollView.scrollTo({
            //     x: metrics.screenWidth,
            //     y: 0,
            //     animated: false,
            // });
            this.setState({ restaurant_id: a.restaurant_id, ratingObj: a })
        }
        this.props.saveNavigationSelection("Order");

    }
    //#endregion

    componentWillUnmount = () => {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    componentWillReceiveProps = async (newProps) => {
        if (this.props.screenProps.isRefresh !== newProps.screenProps.isRefresh) {
            this.strOnScreenMessage = ""
            this.strOnScreenSubtitle = ""
            this.refreshing = false
            this.arrayPast = []
            this.arrayUpcoming = []
            this.setState({ isLoading: true })
            this.getOrderListingData();
            var a = await AsyncStorage.getItem('ratingData');
            console.log("NOTI REST ID" + JSON.stringify(a));
            console.log("NOTI REST ID WITHOUT JSON" + a);
            if (a !== null && a !== undefined)
                this.setState({ restaurant_id: a.restaurant_id, ratingObj: a })
            // console.log("IS REVIEW :::::", this.state.isReview)
            this.props.saveNavigationSelection("Order");
        }
    }

    //#region 
    /** NETWORK CONNECTIVITY */
    networkConnectivityStatus = () => {

    }
    //#endregion

    //#region ON BLUR EVENT
    onDidFocusContainer = () => {
        this.checkUser()
        this.props.saveNavigationSelection("Order");
    }
    //#endregion

    //#region 
    /** ON LEFT PRESSED */
    onBackPressedEvent = () => {
        this.props.navigation.openDrawer();
    }
    //#endregion

    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("myOrder")}
                left={'menu'}
                right={[]}
                onLeft={this.onBackPressedEvent}
                onConnectionChangeHandler={this.networkConnectivityStatus}
                loading={this.state.isLoading || this.state.isReasonLoading}
            >

                {/* FOCUS EVENTS */}
                <NavigationEvents onWillFocus={this.onDidFocusContainer} />

                {/* PROGRESS LOADER */}
                {/* {this.state.isLoading || this.state.isReasonLoading ? <ProgressLoader style={{ marginBottom: 50 }} /> : null} */}

                {/* REVIEW DIALOG */}
                {this.renderReviewSubmitDialogue()}

                {/* CANCELLATION REASON DIALOGUE */}
                {this.cancelOrderModalRender()}

                <EDTopTabBar
                    data={[{ title: strings("inProcessOrder"), onPress: this.handleIndexChange, index: 0 },
                    { title: strings("pastOrder"), onPress: this.handleIndexChange, index: 1 }]}
                    selectedIndex={this.state.selectedIndex}
                />

                <ScrollView style={styles.scrollContent}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    pagingEnabled
                    ref={ref => this.scrollView = ref}
                    horizontal
                    scrollEnabled={false}
                >


                    {this.renderCurrentOrder()}
                    {this.renderPastOrders()}
                </ScrollView>
            </BaseContainer>
        );
    }
    //#endregion

    /** CURRENT ORDER TAB */
    renderCurrentOrder = () => {
        return this.arrayUpcoming !== undefined && this.arrayUpcoming.length > 0 ? (
            <EDOrdersViewFlatList
                style={styles.orderParentView}
                arrayOrders={this.arrayUpcoming}
                onPressHandler={this.navigateToCurrentOrderDetails}
                onPullToRefreshHandler={this.onPullToRefreshHandler}
                lan={this.props.lan}
                onTrackOrder={this.onTrackOrderPressHandler}
                onCancelOrder={this.cancelOrderPressed}

            />
        ) : (this.strOnScreenMessageInProcess || '').trim().length > 0 ? (
            <View>
                <ScrollView
                    contentContainerStyle={styles.scrollContainerStyle}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.refreshing || false}
                            titleColor={EDColors.textAccount}
                            title={strings("refreshing")}
                            tintColor={EDColors.textAccount}
                            colors={[EDColors.textAccount]}
                            onRefresh={this.onPullToRefreshHandler}
                        />
                    }>
                    <EDPlaceholderComponent
                        title={this.strOnScreenMessageInProcess}
                        subTitle={this.strOnScreenSubtitleinProcess}
                    />
                </ScrollView>
            </View>
        ) : null;
    };

    navigateToCurrentOrderDetails = (currentOrderDetails) => {
        this.props.navigation.navigate('CurrentOrderContainer', { currentOrder: currentOrderDetails });
    }

    /** PAST ORDERS TAB */
    renderPastOrders = () => {
        return this.arrayPast !== undefined && this.arrayPast.length > 0 ? (
            <EDOrdersViewFlatList
                forPast={true}
                style={styles.orderParentView}
                arrayOrders={this.arrayPast}
                onPressHandler={this.navigateToOrderDetails}
                onPullToRefreshHandler={this.onPullToRefreshHandler}
                lan={this.props.lan}

            />
        ) : (this.strOnScreenMessagePast || '').trim().length > 0 ? (
            <View>
                <ScrollView
                    contentContainerStyle={styles.scrollContainerStyle}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.refreshing || false}
                            title={strings("refreshing")}
                            titleColor={EDColors.textAccount}
                            tintColor={EDColors.textAccount}
                            colors={[EDColors.textAccount]}
                            onRefresh={this.onPullToRefreshHandler}
                        />
                    }
                >
                    <EDPlaceholderComponent
                        title={this.strOnScreenMessagePast}
                        subTitle={this.strOnScreenSubtitlePast}
                    />
                </ScrollView>
            </View>
        ) : null;
    };

    /** NAVIGATE TO ORDER DETAILS */
    navigateToOrderDetails = (item) => {
        this.props.navigation.navigate("OrderDetailContainer", { OrderItem: item });
    }
    //#endregion


    onPullToRefreshHandler = () => {
        this.strOnScreenMessageInProcess = ""
        this.strOnScreenSubtitleinProcess = ""
        this.strOnScreenSubtitlePast = ""
        this.strOnScreenMessagePast = ""
        this.refreshing = false
        this.arrayPast = []
        this.arrayUpcoming = []
        this.setState({ isLoading: true })
        this.getOrderListingData();
    }

    //#region CLOSE REQUEST HANDLER
    onDismissReviewSubmitHandler = () => {
        AsyncStorage.removeItem("ratingData")
        this.checkUser();
        this.setState({ isReview: false, ratingObj: undefined });
    }
    onDismissReviewAndReload = () => {
        AsyncStorage.removeItem("ratingData")
        this.checkUser();
        this.setState({ isReview: false, ratingObj: undefined });
    }
    //#endregion

    //#region REVIEW SUBMIT MODEL
    /** RENDER REVIEW DIALOGUE */
    renderReviewSubmitDialogue = () => {
        return (
            <EDPopupView isModalVisible={this.state.isReview}
                style={{ justifyContent: "flex-end" }}>
                {this.orderToRate !== undefined && this.orderToRate !== null ?
                    <EDWriteSellerReview
                        containerProps={this.props}
                        orderData={this.orderToRate[0]}
                        dismissWriteReviewDialogueHandler={this.onDismissReviewSubmitHandler}
                        onDismissReviewAndReload={this.onDismissReviewAndReload}
                    /> : null}
            </EDPopupView>
        )

    }
    //#endregion

    cancelOrderModalRender = () => {
        return (
            <EDPopupView isModalVisible={this.state.isCancelModalVisible}

            >
                <EDCancelReasonsList reasonData={this.cancelReasonArray} onDismissCancellationReasonDialogueHandler={this.onDismissCancellationReasonDialogueHandler} />
            </EDPopupView>
        )
    }

    onDismissCancellationReasonDialogueHandler = (flag) => {
        if (flag == undefined || flag == null || flag == '') {
            this.setState({ isCancelModalVisible: false })
            return;
        }
        this.strCancelReason = flag
        this.cancelOrderCheck()
    }

    cancelOrderCheck = () => {
        netStatus(status => {
            if (status) {
                this.setState({
                    isCancelModalVisible: false,
                    isLoading: true,
                })
                let objCancelParams = {
                    user_id: this.props.userID,
                    order_id: this.orderToCancel,
                    cancel_reason: this.strCancelReason,
                    language_slug: this.props.lan
                }
                cancelOrderAPI(
                    objCancelParams, this.onSuccessCancelOrder, this.onFailureCancelOrder, this.props
                )
            } else {
                this.setState({
                    isCancelModalVisible: false,
                })
                showNoInternetAlert()
            }
        })
    }

    onSuccessCancelOrder = (response) => {
        showDialogue(response.message, [], "", () => {
            this.onPullToRefreshHandler()
        })
        // this.setState({
        //     isLoading: false
        // })
    }
    onFailureCancelOrder = (response) => {
        this.setState({
            isLoading: false
        })
        showDialogue(response.message)
    }




    cancelOrderPressed = orderData => {
        this.orderToCancel = orderData.order_id
        this.setState({ isCancelModalVisible: true })
    }




    //#region 
    /** TRACK ORDER PRESSEDD */
    onTrackOrderPressHandler = (orderItem) => {
        if (orderItem.driver !== undefined) {
            this.props.navigation.navigate("TrackOrderContainer", {
                trackOrder: orderItem,
                currency_symbol: orderItem.currency_symbol
            })
        } else {
            showDialogue(strings("driverLocationError"), [], "")
        }
    }
    //#endregion



    //#region  NETWORK
    /** CHECK USER DEATILS */
    checkUser() {
        if (this.props.userID !== "" && this.props.userID !== undefined && this.props.userID !== null) {
            this.getOrderListingData();
        } else {
            showDialogue(strings("loginValidation"), [], strings("appName"), () => {
                this.props.navigation.navigate("LoginContainer")
                // this.props.navigation.dispatch(
                //     StackActions.reset({
                //         index: 0,
                //         actions: [
                //             NavigationActions.navigate({ routeName: "LoginContainer" })
                //         ]
                //     })
                // );
            });
        }
    }
    //#endregion

    fetchCancelReasons = () => {
        netStatus(status => {
            if (status) {
                let objPickUpParams = {
                    language_slug: this.props.lan,
                    reason_type: "cancel",
                    user_type: "Customer"
                }
                this.setState({ isReasonLoading: true })
                getCancelReasonList(objPickUpParams, this.onSuccessReasonList, this.onFailureReasonList, this.props)
            }
        })
    }

    onSuccessReasonList = (onSuccess) => {
        console.log('success::', onSuccess)
        if (onSuccess.status == RESPONSE_SUCCESS && onSuccess.reason_list !== undefined && onSuccess.reason_list !== null &&
            onSuccess.reason_list.length !== 0) {
            let reasons = []
            onSuccess.reason_list.map(data => {
                reasons.push({
                    label: data.reason,
                    value: data.reason
                })
            })
            this.cancelReasonArray = [...reasons, { label: strings('otherReason'), value: strings('otherReason') }]
            console.log("totle::", this.cancelReasonArray)
            this.props.saveCancellationReasons(reasons)
        } else {
            this.cancelReasonArray = [{ label: strings('otherReason'), value: strings('otherReason') }]
        }
        this.setState({ isReasonLoading: false })
    }

    onFailureReasonList = (onFailure) => {
        console.log('fail::')
        this.setState({ isReasonLoading: false })

    }

    //#region 
    /**
    * @param { Success Reponse Object } onSuccess
    */
    onSuccessOrderListing = (onSuccess) => {
        if (onSuccess != undefined && onSuccess.status == RESPONSE_SUCCESS) {
            if (onSuccess.in_process.length > 0) {
                this.arrayUpcoming = onSuccess.in_process;
                console.log('REASON::', this.props.arrayCancelReasons, this.cancelReasonArray)
                // if (this.props.arrayCancelReasons == undefined)
                this.fetchCancelReasons()
                // else
                //     this.cancelReasonArray = [...this.props.arrayCancelReasons,  { label: strings('otherReason'), value: strings('otherReason') }]

            } else {
                this.strOnScreenMessageInProcess = strings('noDataFound')
            }

            if (onSuccess.past.length > 0) {
                this.arrayPast = onSuccess.past;
            } else {
                this.strOnScreenMessagePast = strings('noDataFound')
            }
            if (this.state.ratingObj !== undefined)
                this.orderToRate = this.arrayPast.filter(data => { return data.order_id == this.state.ratingObj })
            debugLog("SCROLLVIEW REF :::::", this.state.ratingObj !== undefined && this.orderToRate[0].show_restaurant_reviews !== undefined && this.orderToRate[0].show_restaurant_reviews !== null && this.orderToRate[0].show_restaurant_reviews)


            this.scrollView.scrollTo({
                x:
                    (this.state.ratingObj !== undefined && this.orderToRate[0].show_restaurant_reviews !== undefined && this.orderToRate[0].show_restaurant_reviews !== null && this.orderToRate[0].show_restaurant_reviews ? 1 : 0) *
                    metrics.screenWidth,
                y: 0,
                animated: true,
            });
            this.setState({ selectedIndex: this.state.ratingObj !== undefined && this.orderToRate[0].show_restaurant_reviews !== undefined && this.orderToRate[0].show_restaurant_reviews !== null && this.orderToRate[0].show_restaurant_reviews ? 1 : 0, isLoading: false, isReview: this.state.ratingObj !== undefined && this.orderToRate[0].show_restaurant_reviews !== undefined && this.orderToRate[0].show_restaurant_reviews !== null && this.orderToRate[0].show_restaurant_reviews });

        } else {
            this.strOnScreenMessagePast = strings("generalWebServiceError")
            this.strOnScreenMessageInProcess = strings("generalWebServiceError")
            this.setState({ isLoading: false });
        }
    }


    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureOrderListing = (onFailure) => {
        this.strOnScreenMessagePast = strings("generalWebServiceError")
        this.strOnScreenMessageInProcess = strings("generalWebServiceError")
        this.setState({ isLoading: false });
    }

    /** GET CURRENT ORDER API */
    getOrderListingData() {
        netStatus(isConnected => {
            if (isConnected) {
                this.arrayUpcoming = []
                this.arrayPast = []
                this.strOnScreenMessageInProcess = '';
                this.strOnScreenMessagePast = '';
                this.setState({ isLoading: true });
                let param = {
                    language_slug: this.props.lan,
                    user_id: parseInt(this.props.userID) || 0,
                    // token: this.props.token
                }
                getOrderListingAPI(param, this.onSuccessOrderListing, this.onFailureOrderListing, this.props);
            } else {
                this.strOnScreenMessagePast = this.strOnScreenMessageInProcess = strings('noInternetTitle');
                this.strOnScreenSubtitlePast = this.strOnScreenSubtitleinProcess = strings('noInternet');
                this.setState({ isLoading: false })

            }
        })
    }
    //#endregion

    //#region 
    /** HANDLE INDEX SELECTION */
    handleIndexChange = index => {
        this.scrollView.scrollTo({
            x: metrics.screenWidth * index,
            y: 0,
            animated: true,
        });
        this.setState({
            selectedIndex: index
        });

    };
    //#endregion

    //#region ADD REVIEW
    /**
     * @param { Success Reponse Object For Review } onSuccess
     */
    onSuccessAddReview = (onSuccess) => {
        if (onSuccess.error != undefined) {
            showValidationAlert(
                onSuccess.error.message != undefined
                    ? onSuccess.error.message
                    : strings("generalWebServiceError")
            );
            this.setState({ isLoading: false, isReview: false, reviewText: "", reviewStar: 0 });
        } else {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                AsyncStorage.removeItem("ratingData")
                this.setState({ isLoading: false, isReview: false, reviewText: "", reviewStar: 0 });
                this.checkUser();
            } else {
                showValidationAlert(onSuccess.message);
                this.setState({ isLoading: false, isReview: false, reviewText: "", reviewStar: 0 });
                AsyncStorage.removeItem("ratingData");
                this.checkUser();
            }
        }
    }

    /**
     * @param { Failure Response Object For Rivew } onFailure
     */
    onFailureAddReview = (onFailure) => {
        AsyncStorage.removeItem("ratingData");
        this.checkUser();
    }

    /** ADD REVIEW API */
    addReview() {
        netStatus(status => {
            if (status) {
                if (this.state.reviewText !== "" && this.state.reviewStar !== 0) {

                    this.setState({ isLoading: true });
                    let param = {
                        language_slug: this.props.lan,
                        restaurant_id: this.state.restaurant_id,
                        user_id: this.props.userID,
                        rating: this.state.reviewStar,
                        review: this.state.reviewText
                    }
                    addReviewAPI(param, this.onSuccessAddReview, this.onFailureAddReview, this.props);
                }
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    //#endregion


}

const styles = StyleSheet.create({
    tabStyle: {
        backgroundColor: EDColors.white,
        borderColor: EDColors.primary,
        alignSelf: "flex-start",

    },
    tabTextStyle: {
        color: EDColors.primary,
        marginLeft: 5,
        marginRight: 5,
        alignSelf: "flex-start",
    },

    textStyle: {
        // flex: 1,
        color: EDColors.black,
        fontSize: getProportionalFontSize(20),
        fontFamily: EDFonts.regular,
        // marginHorizontal: 10
    },
    pastOrderText: {
        color: EDColors.primary,
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.regular
    },
    orderParentView: { width: metrics.screenWidth },
    scrollContainerStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: metrics.screenWidth,
    },
    scrollContent: { backgroundColor: EDColors.offWhite, flexDirection: 'row' },

})

export default connect(
    state => {
        return {
            titleSelected: state.navigationReducer.selectedItem,
            checkoutDetail: state.checkoutReducer.checkoutDetail,
            lan: state.userOperations.lan,
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            arrayCancelReasons: state.userOperations.cancellationReasons
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveCancellationReasons: dataToSave => {
                dispatch(saveCancellationReason(dataToSave));
            }
        };
    }
)(MyOrderContainer);


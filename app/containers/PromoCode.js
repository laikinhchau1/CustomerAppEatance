import React from "react";
import { BackHandler, Dimensions, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import EDCouponDetailModel from "../components/EDCouponDetailModel";
import EDPopupView from '../components/EDPopupView';
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import ProgressLoader from "../components/ProgressLoader";
import { strings } from "../locales/i18n";
import { saveCheckoutDetails } from "../redux/actions/Checkout";
import { showDialogue, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize, isRTLCheck, RESPONSE_FAIL, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { netStatus } from "../utils/NetworkStatusConnection";
import { promoCodeList } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";

class PromoCode extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.fontSize = Platform.OS == "ios" ? "18px" : "18px";
        this.meta = '<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>';
        this.customStyle = this.meta + "<style>* {max-width: 100%;} body {font-size:" + this.fontSize + ";word-break: normal}</style>";
        this.couponList = [];
        this.webviewData = undefined;
    }

    state = {
        isLoading: false,
        getData: this.props.navigation.state.params.getData,
        resId: this.props.navigation.state.params.resId,
        edValue: "",
        isDetailVisible: false
    };

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.getPromoCodeList();
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("promoCode")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.handleBackPress}>

                {/* PROGRESS LOADER */}
                {this.state.isLoading ? <ProgressLoader /> : null}

                {/* PROMO CODE DETAILS MODEL */}
                {this.promoCodeDetailModel()}

                {/* SCROLL VIEW */}
                <ScrollView>

                    

                    <EDRTLView style={[style.mainView , { borderRadius: 16 }]} >
                        <TextInput
                            style={[style.textInput, { textAlign: isRTLCheck() ? 'right' : 'left' }]}
                            keyboardType="default"
                            secureTextEntry={false}
                            onChangeText={this.onTextChangeHandler}
                            value={this.state.edValue}
                            placeholder={strings("promoPlaceholder")}
                            placeholderTextColor={EDColors.text}
                        />
                        <TouchableOpacity
                            style={style.roundButton}
                            onPress={this.onApplyFilterPressed}
                        >
                            <Text style={style.apply}>{strings("apply")}</Text>
                        </TouchableOpacity>
                    </EDRTLView>

                    <EDRTLText 
                        title={strings("availableOffer")}
                        style={{fontFamily: EDFonts.semiBold ,fontSize: getProportionalFontSize(16) , color: EDColors.black , marginTop : 20 , marginHorizontal : 15 , marginBottom:10}}
                    />


                    {/* COUPON LIST */}
                    <FlatList
                        data={this.couponList}
                        showsVerticalScrollIndicator={false}
                        renderItem={this.createCouponList}
                        keyExtractor={(item, index) => item + index}
                    />
                </ScrollView>

            </BaseContainer>
        );
    }
    //#endregion

    //#region 
    /** APPLY FILTER */
    onApplyEventHandler = (item) => {
        this.applyFilter(item.name);
    }
    //#endregion

    //#region 
    onTextChangeHandler = userText => {
        this.setState({ edValue: userText });
    }
    //#endregion

    //#region 
    /** APPLY FILTERS */
    onApplyFilterPressed = () => {
        if (this.state.edValue != undefined && this.state.edValue.trim().length == 0) {
            showValidationAlert(strings('emptyCoupon'))
        } else
            this.applyFilter(this.state.edValue);
    }
    //#endregion

    //#region 
    /** LIST OF COUPANS */
    createCouponList = ({ item, index }) => {
        return (
  
            <View style={style.couponView} >
            <EDRTLView style={style.couponViewStyle}>
                <View style={{flex:1,justifyContent: 'space-evenly' , alignItems: isRTLCheck() ? 'flex-end' : 'flex-start'}}>
                    <View>
                    <EDRTLText style={style.textStyle}
                        title={item.name} />
                        </View>
                        <View>
                    <EDRTLText
                        style={style.moreTextStyle}
                        onPress={() => this.onMoreEventhandler(item)}
                        title={strings("moreDetail")}
                    />
                     </View>
                </View>
                <View style={{ flex:1, alignItems: isRTLCheck() ? 'flex-start': 'flex-end' , justifyContent:'center'}}>
                    <EDRTLText style={style.applyTextStyle}
                        onPress={() => { this.onApplyEventHandler(item) }}
                        title={strings("apply")}
                    />
                </View>

         </EDRTLView>
        </View>
        );
    }
    //#endregion

    //#region 
    /** MORE BUTTON PRESSED */
    onMoreEventhandler = (item) => {
        if (
            item.description != undefined &&
            item.description != "" &&
            item.description != null
        ) {
            this.webviewData = item.description;
            this.couponName = item.name;
            this.setState({ isDetailVisible: true });
        }
    }
    //#endregion


    //#region 
    /** RENDER COUPON DETAILED VIEW */
    promoCodeDetailModel = () => {
        return (
            <EDPopupView isModalVisible={this.state.isDetailVisible}>
                <EDCouponDetailModel
                    couponName={this.couponName}
                    onDismissHandler={this.onDismissEventHandler}
                    source={{ html: this.customStyle + this.webviewData }}
                />
            </EDPopupView>
        )
    }

    /** CLOSE BUTTON EVENT */
    onDismissEventHandler = () => {
        this.setState({ isDetailVisible: false });
    }
    //#endregion

    //#region 
    /** BACK PESS EVENT */
    handleBackPress = () => {
        this.props.navigation.goBack();
        return true;
    }
    //#endregion

    //#region 
    /** APLLY FILTERS */
    applyFilter(data) {
        if (this.state.getData != undefined) {
            this.state.getData(data);
        }
        this.props.navigation.goBack();
    }
    //#endregion

    //#region 
    /**
     * @param { Sucess Respomnse Onject } onSuccess
     */
    onSuccessPromocode = (onSuccess) => {
        if (onSuccess.status == RESPONSE_SUCCESS) {
            this.couponList = onSuccess.coupon_list;
        } else if (onSuccess.status == RESPONSE_FAIL) {
            showDialogue(onSuccess.message, [], "",
                () => this.props.navigation.goBack()
            )
        }
        this.setState({ isLoading: false });
    }

    /**
     * @param { Failure Response Object } onFailure
     */
    onFailurePromocode = (onFailure) => {
        this.setState({ isLoading: false });
        showDialogue(onFailure.response != undefined
            ? onFailure.response
            : strings("generalWebServiceError"), [], "",
            () =>
                this.props.navigation.goBack()
        )
    }

    /** CALL PROMOCODE API */
    getPromoCodeList() {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                let param = {
                    language_slug: this.props.lan,
                    // token: this.props.token,
                    user_id: Number(this.props.userID) || '',
                    restaurant_id: Number(this.props.navigation.state.params.resId),
                    subtotal: this.props.navigation.state.params.subTotal,
                    order_delivery: this.props.navigation.state.params.order_delivery,
                    isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0
                }
                promoCodeList(param, this.onSuccessPromocode, this.onFailurePromocode, this.props);
            } else {
                showDialogue(strings("noInternet"), [], "",
                    () => this.props.navigation.goBack())
            }
        });
    }
    //#endregion
}

export default connect(
    state => {
        return {
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            lan: state.userOperations.lan
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
)(PromoCode);

export const style = StyleSheet.create({
    roundButton: {
        alignSelf: "center",
        margin: 10,
        // backgroundColor: EDColors.primary,
        borderRadius: 4
    },
    apply: {
        padding: 10,
        color: EDColors.black ,
        fontFamily: EDFonts.semiBold,
        fontSize : getProportionalFontSize(12)
    },
    couponView: {
        backgroundColor: "#fff",
        borderRadius: 16,
        margin: 10,
        padding:5
    },
    mainView: {
        backgroundColor: "#fff",
        borderRadius: 6,
        margin: 10,
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1
    },
    textInput: {
        flex: 1,
        fontFamily: EDFonts.regular,
        paddingLeft: 10
    },
    couponViewStyle: {
        justifyContent: "center",
        margin: 10,
        flex:1
    },
    textStyle: {
        flex: 1,
        fontFamily: EDFonts.semiBold,
        color: EDColors.black,
        fontSize: getProportionalFontSize(14),
        paddingTop:10
    },
    applyTextStyle: {
        fontFamily: EDFonts.semiBold,
        color: EDColors.white,
        fontSize: getProportionalFontSize(12),
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: EDColors.primary,
        borderRadius:8,
        padding:8
    },
    moreTextStyle: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(12),
        color: EDColors.text,
        paddingHorizontal: 0,
        paddingBottom: 10
    }
});

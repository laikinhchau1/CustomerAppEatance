import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import BaseContainer from "./BaseContainer";
import ProgressLoader from "../components/ProgressLoader";
import Assets from "../assets";
import EDThemeButton from "../components/EDThemeButton";
import { connect } from "react-redux";
import { saveCartCount } from "../redux/actions/Checkout";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import NavigationService from "../../NavigationService";
import { strings } from "../locales/i18n";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";


class OrderConfirm extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.forDineIn = this.props.navigation.state.params.isForDineIn
        this.resObj = this.props.navigation.state.params.resObj
    }

    currency = this.props.navigation.state.params.currecy_code

    state = {
        isLoading: false,

    };


    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("orderConfirm")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onLeftEventHandler}
            >
                {/* PROGRESS LOADER */}
                {this.state.isLoading ? <ProgressLoader /> : null}

                {/* MAIN VIEW */}
                <View style={{ flex: 1 }}>
                    {/* CONFRIM IMAGE */}
                    <View style={style.container}>
                        <View style={style.subContainer}>
                            <Image
                                source={Assets.bookingconfirm}
                                style={style.imageStyle} />
                        </View>

                        <View style={style.textView}>
                            <Text style={style.thankyouText}>{strings("orderSuccess")}</Text>
                        </View>
                    </View>
                </View>
                {/* TRACK ORDER BUTTON */}
                <View style={style.btnView}>
                    <EDThemeButton
                        label={this.props.userID !== undefined &&
                            this.props.userID !== null &&
                            this.props.userID !== "" ? strings("trackYourOrder") : strings("continue")}
                        onPress={this.forDineIn ? this.navigateToDineIn : this.onTrackOrderEventHandler}
                        style={style.btnStyle}
                        textStyle={style.btnText}
                    />
                </View>

            </BaseContainer>
        );
    }
    //#endregion

    //#region 
    /** TRACK UTTON EVENT */
    onTrackOrderEventHandler = () => {
        this.props.saveCartCount(0);
        NavigationService.navigateToSpecificRoute(
            this.props.userID !== undefined &&
                this.props.userID !== null &&
                this.props.userID !== "" ?
                "Order" : "Home")

    }
    //#endregion

    navigateToDineIn = () => {
        this.props.saveCartCount(0);
        if (this.props.navigation.state.params.navigateToOrder == true)
            NavigationService.navigateToSpecificRoute("Order")
        // this.props.navigation.popToTop();
        // this.props.navigation.navigate("Order");
    }


    //#region 
    /**ON LEFT PRESSED| */
    onLeftEventHandler = () => {
        NavigationService.navigateToSpecificRoute("Home")
    }
    //#endregion
}

export default connect(
    state => {
        return {
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            cartCount: state.checkoutReducer.cartCount,
            lan: state.userOperations.lan,
            currency: state.checkoutReducer.currency_symbol,

        };
    },
    dispatch => {
        return {
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            }
        };
    }
)(OrderConfirm);


export const style = StyleSheet.create({
    container: {
        flex: 1,
        position: "absolute",
        width: "100%",
        height: "100%"
    },
    thankyouText: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        color: '#000',
        marginTop: 25,
    },
    subContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    btnStyle: { width: ' 90%', height: metrics.screenHeight * 0.075, borderRadius: 16 },
    btnText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16) },
    imageStyle: { alignSelf: 'center' },
    textView: { flex: 1, marginTop: 10, alignItems: "center" },
    btnView: { marginBottom: 20 },
});


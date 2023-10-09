/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { Spinner } from 'native-base'
import React from 'react'
import { Alert, Dimensions, Linking, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import AutoHeightWebView from 'react-native-autoheight-webview'
import { Icon } from 'react-native-elements'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Assets from '../assets'
import { strings } from '../locales/i18n'
import { showValidationAlert } from '../utils/EDAlert'
import { EDColors } from '../utils/EDColors'
import { debugLog, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants'
import { EDFonts } from '../utils/EDFontConstants'
import EDImage from './EDImage'
import EDRTLText from './EDRTLText'
import EDRTLView from './EDRTLView'
import EDThemeButton from './EDThemeButton'


export default class EDItemDetails extends React.Component {

    constructor(props) {
        super(props)

        this.fontSize = Platform.OS == "ios" ? "14px" : "14px";
        this.meta = `
        <html `+ (isRTLCheck() ? "dir=rtl" : "dir=ltr") + `><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>`;
        this.customStyle =
            this.meta +
            "<style>* {max-width: 100%;} body { font-size:" +
            this.fontSize +
            ";}</style>";
        this.endTag = "</html>"
        this.quantity = 0
    }

    state = {
        quantity: 0,
        cartLoading: false,
        cartData: [],
        count: 0
    }


    componentDidMount() {
        this.setState({
            cartData: this.props.cartData,
        })


        let count = 0
        let same_item_incart = this.props.cartData.filter(item => { return item.menu_id === this.props.data.menu_id })
        if (same_item_incart !== undefined && same_item_incart !== null && same_item_incart.length !== 0) {
            same_item_incart.map(data => {
                count = count + data.quantity
            })
        }
        this.quantity = count
        this.setState({
            quantity: count
        })

    }

    componentWillReceiveProps(props) {
        this.setState({
            cartData: props.cartData,
            cartLoading: false
        })

        let count = 0
        let same_item_incart = this.props.cartData.filter(item => { return item.menu_id === this.props.data.menu_id })
        if (same_item_incart !== undefined && same_item_incart !== null && same_item_incart.length !== 0) {
            same_item_incart.map(data => {
                count = count + data.quantity
            })
        }
        this.quantity = count

        //   this.setState({
        //     quantity: count
        // })
    }
    onChangeText = (value) => {
        let newValue = value.replace(/\D/g, '')
        this.setState({ quantity: newValue })
    }

    render() {
        return (
            <View style={style.modalContainer}>
                <View style={style.modalSubContainer}>
                    <EDRTLView style={style.horizontalStyle} >
                        <EDRTLText
                            style={[style.textStyle, { textAlign: isRTLCheck() ? "right" : "left" }]}
                            numberOfLines={2}
                            html={this.props.html}
                            title={this.props.data.name} />

                        <TouchableOpacity
                            onPress={this.props.onDismissHandler}>
                            <Icon
                                name={"close"}
                                size={getProportionalFontSize(20)}
                                color={EDColors.grayNew}
                                containerStyle={{ margin: 10 }}
                            />
                        </TouchableOpacity>
                    </EDRTLView>

                    <View style={style.seperatorView} />
                    <ScrollView
                        style={{ flex: 1, marginBottom: 10 }}
                        // contentContainerStyle={{ flex : 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <EDImage
                            source={this.props.data.image}
                            style={style.imageStyle}
                            placeholder={Assets.logo}
                        />

                        <View>
                            {this.props.data.menu_detail !== undefined && this.props.data.menu_detail !== null && this.props.data.menu_detail.trim().length !== 0
                                ?
                                <View style={style.horizontalStyle} >
                                    <EDRTLText title={strings("menuDetails")} style={style.normalText} />

                                    <EDRTLText title={this.props.data.menu_detail} style={style.detailText} />
                                </View>
                                : null}
                            {this.props.data.ingredients !== undefined && this.props.data.ingredients !== null && this.props.data.ingredients.trim().length !== 0
                                ?
                                <View style={{ flex: 1, marginTop: 5 }}>
                                    <EDRTLText title={strings("ingredients")} style={[style.normalText, style.horizontalStyle]} />
                                    <AutoHeightWebView
                                        source={{ html: this.customStyle + this.props.data.ingredients + this.endTag }}
                                        style={{ marginHorizontal: 10, width: "92.5%" }}
                                        androidHardwareAccelerationDisabled
                                        startInLoadingState={true}
                                        // style={style.webView}
                                        scrollEnabled={false}
                                        originWhitelist={['http://*', 'https://*', 'intent://*', '*']}
                                        onShouldStartLoadWithRequest={event => {
                                            if (event.url.slice(0, 4) === 'http') {
                                                Linking.openURL(event.url);
                                                return false;
                                            } else if (event.url.slice(0, 3) === 'tel') {
                                                const callNumber = event.url.slice(-10);
                                                Linking.openURL(`tel://${callNumber}`);
                                                return false;
                                            } else if (event.url.startsWith('mailto:')) {
                                                this.openEmail(event)
                                                return false;
                                            }
                                            return true;
                                        }}

                                    //R.K 07-01-2021 Open email
                                    />
                                </View>
                                : null}
                        </View>
                    </ScrollView>

                    {this.state.cartLoading ?
                        <Spinner size="small" color={EDColors.primary} style={{ height: 37 }} /> :
                        (this.props.isOpen ?
                            (this.state.cartData.some(item => item.menu_id === this.props.data.menu_id && item.quantity >= 1) ?
                                <>
                                    <EDRTLView style={style.qtyContainer}>
                                        <Icon name="remove" style={style.iconStyle} size={getProportionalFontSize(16)} color={EDColors.black} onPress={() =>
                                            parseInt(this.state.quantity == 0) ? null :
                                                this.onPressAddtoCartHandler(-1)} />
                                        {/* <Text style={style.qtyText}>
                                        {count}
                                    </Text> */}
                                        <TextInput style={style.qtyInput}
                                            maxLength={3}
                                            editable={
                                                this.props.data.addons_category_list === undefined || this.props.data.addons_category_list.length === 0
                                            }
                                            textAlign={'center'}
                                            keyboardType="numeric"
                                            value={this.state.quantity.toString()}
                                            onChangeText={this.onChangeText} />
                                        <Icon style={style.iconStyle} name="add" size={getProportionalFontSize(16)} color={EDColors.black} onPress={() =>
                                            parseInt(this.state.quantity) < 999 ?
                                                this.onPressAddtoCartHandler(1) :
                                                showValidationAlert(strings("qtyExceed"))
                                        } />

                                    </EDRTLView>
                                    <EDRTLView style={[style.horizontalStyle, { justifyContent: 'center', marginVertical: 10 }]}>
                                        {this.props.data.addons_category_list === undefined || this.props.data.addons_category_list.length === 0 ?
                                            <EDThemeButton
                                                disabled={this.props.data.in_stock == "0"}
                                                label={this.props.data.in_stock !== "0" ? strings("addToCart") : strings("itemSoldOut")}
                                                onPress={this.onCustomAddToCart}
                                                textStyle={style.buttonTextStyle}
                                                style={{
                                                    backgroundColor: this.props.data.in_stock == "0" ? EDColors.grayNew : EDColors.primary,
                                                    width: this.props.data.is_recipes_menu !== undefined && this.props.data.is_recipes_menu == 1 ? "40%" : "90%", height: heightPercentageToDP('6%'), marginHorizontal: 10, borderRadius: 16, marginTop: 0 }}
                                            />
                                            : null}
                                        {this.props.data.is_recipes_menu !== undefined && this.props.data.is_recipes_menu == 1 ?
                                            < EDThemeButton
                                                label={strings("viewRecipe")}
                                                onPress={this.onRecipeDetails}
                                                textStyle={style.buttonTextStyle}
                                                style={{ width: this.props.data.addons_category_list !== undefined ? "90%" : "40%", height: heightPercentageToDP('6%'), borderRadius: 16, marginTop: 0 }}
                                            /> : null}
                                    </EDRTLView>
                                </>
                                :
                                <EDRTLView style={[style.horizontalStyle, { justifyContent: 'center', marginVertical: 10 }]}>
                                    <EDThemeButton
                                        disabled={this.props.data.in_stock == "0"}
                                        label={this.props.data.in_stock !== "0" ? strings("addToCart") : strings("itemSoldOut")}
                                        onPress={() => this.onPressAddtoCartHandler(1)}
                                        textStyle={style.buttonTextStyle}
                                        style={{
                                            backgroundColor: this.props.data.in_stock == "0" ? EDColors.grayNew : EDColors.primary,
                                            width: this.props.data.is_recipes_menu === undefined || this.props.data.is_recipes_menu !== 1 ? "90%" : "40%", height: heightPercentageToDP('6%'), marginHorizontal: 10, borderRadius: 16
                                        }}
                                    />
                                    {this.props.data.is_recipes_menu !== undefined && this.props.data.is_recipes_menu == 1 ?
                                        < EDThemeButton
                                            label={strings("viewRecipe")}
                                            onPress={this.onRecipeDetails}
                                            textStyle={style.buttonTextStyle}
                                            style={{ width: "40%", height: heightPercentageToDP('6%'), borderRadius: 16 }}
                                        /> : null}
                                </EDRTLView>
                            ) : null)
                    }
                </View>
            </View>
        )
    }

    onRecipeDetails = () => {
        if (this.props.onRecipeDetails !== undefined) {
            this.props.onRecipeDetails(this.props.data)
        }
    }

    onCustomAddToCart = () => {
        if (this.state.quantity.toString().trim() == "") {
            showValidationAlert(strings("qtyEmptyError"))
            this.setState({ quantity: this.quantity })
            return;
        }
        else if (parseInt(this.state.quantity) == 0) {
            showValidationAlert(strings("qtyZero"))
            this.setState({ quantity: this.quantity })
            // this.props.addOneData(this.props.data, 1)
            return;
        }

        else if (parseInt(this.state.quantity) > 999) {
            showValidationAlert(strings("qtyExceed"))
            return;
        }

        else {
            this.setState({ cartLoading: true })
            this.props.onPress(this.props.data, 1, parseInt(this.state.quantity))
            this.props.onDismissHandler()

        }
    }

    onPressAddtoCartHandler = (qty) => {
        debugLog("QTY :::::", qty)
        this.setState({ cartLoading: true })
        if ((this.props.data.is_customize === "1" || this.props.data.is_customize === 1) && parseInt(qty) == -1) {
            this.props.onDismissHandler()
            this.props.navigateToCart(this.props.data)
        }
        else {
            this.setState({ quantity: parseInt(this.state.quantity) + parseInt(qty) })
            this.props.onPress(this.props.data, 1, parseInt(this.state.quantity) + parseInt(qty))
            this.props.onDismissHandler()

        }
    }
    //R.K 07-01-2021 Open email
    openEmail = (email) => {
        Linking.openURL(email.url).catch(er => {
            Alert.alert("Failed to open Link: " + er.message);

        });
        // this.setState({ count: this.state.count + 1 })
    }
}

const style = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: EDColors.semiBlack
    },
    horizontalStyle: { marginHorizontal: 10 },
    iconStyle: { marginHorizontal: 10, marginVertical: 5 },
    buttonTextStyle: {},
    seperatorView: { borderWidth: 1, borderColor: EDColors.radioSelected, width: "95%", alignSelf: "center", marginVertical: 10 },
    modalSubContainer: {
        backgroundColor: EDColors.white,
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 24,
        width: Dimensions.get("window").width - 40,
        maxHeight: Dimensions.get("window").height - 100,
        minHeight: Dimensions.get("window").height * 0.6,
        marginTop: 50,
        marginBottom: 20,
        alignSelf: "center",
        flex: 1
    },
    textStyle: {
        flex: 1,
        alignSelf: "center",
        textAlign: "center",
        fontFamily: EDFonts.semiBold,
        color: "#000",
        fontSize: getProportionalFontSize(17),
        marginVertical: 10,
        marginTop: 20
    },
    qtyInput: {
        color: EDColors.black,
        fontSize: 14,
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginHorizontal: 5,
        fontFamily: EDFonts.medium,
        alignSelf: 'center'

    },
    detailText: {
        fontFamily: EDFonts.regular,
        color: "#000",
        fontSize: getProportionalFontSize(12),
        marginVertical: 10,
    },
    normalText: {
        fontFamily: EDFonts.medium,
        color: "#000",
        fontSize: getProportionalFontSize(14),
        marginVertical: 5,
        textDecorationLine: "underline",
    },
    imageStyle: {
        width: "95%",
        height: 200,
        marginTop: 10,
        borderRadius: 8,
        marginBottom: 15,
        marginHorizontal: 10
    },
    qtyContainer: {
        alignItems: 'center', alignSelf: 'center', borderColor: EDColors.separatorColor,
        borderWidth: 1, borderRadius: 8, backgroundColor: EDColors.white, justifyContent: 'space-evenly', paddingHorizontal: 5
    },
    qtyText: {
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(18),
        marginHorizontal: 10,
        marginVertical: 10,
    },
    webView: { flex: 1, alignSelf: "flex-start", paddingBottom: Platform.OS == "ios" ? 0 : 15, height: 50 }
})
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDImage from "./EDImage";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";

export default class ProductComponent extends React.Component {

    constructor(props) {
        super(props);
        this.quantity = 0
    }

    state = {
        quantity: 0
    }
    componentDidMount() {
    }

    render() {
        this.quantity = 0
        this.props.cartData.map((value) => {
            if (value.menu_id === this.props.data.menu_id && value.quantity >= 1) {
                this.quantity = parseInt(this.quantity) + parseInt(value.quantity)
            }
        })
        return (
            <View
                onLayout={this.props.onLayout}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={this.props.onProductPress}
                    onPressIn={this.props.onPressIn}>

                    <EDRTLView style={style.nestedContainer}>
                        <EDImage
                            source={this.props.data.image}
                            style={style.itemImage}
                            resizeMode={this.props.data.image !== undefined &&
                                this.props.data.image !== "" &&
                                this.props.data.image !== null ?
                                'cover' : 'contain'}
                        />
                        <View style={style.centerViewStyle}>
                            <View style={{ flex: 1 }}>
                                <EDRTLView>
                                    <EDRTLText style={style.nestedTitle} title={this.props.data.name} />
                                </EDRTLView>
                                <EDRTLText title={strings("foodType") + this.props.data.food_type_name} style={style.foodType} />
                                <EDRTLText title={strings("availibility") + ': ' + this.props.data.availability} style={style.foodType} />
                                <EDRTLText style={style.nestedDesc} title={this.props.data.menu_detail} />
                                {this.props.data.is_customize === "1" ?
                                    <View>
                                        <Text style={[style.customTextStyle]}>{"(" + strings("customizationAvailable") + ")"}</Text>
                                    </View>
                                    : null}
                            </View>
                            <View style={{ justifyContent: "space-between", flexDirection: isRTLCheck() ? "row-reverse" : "row" }} >
                                {this.props.data.is_customize === "1" ?
                                    <View style={style.isCustom}>
                                        <EDRTLView style={{ alignItems: 'center' }}>
                                            <EDRTLText style={[style.nestedPrice, { color: EDColors.grey, textDecorationLine: this.props.data.offer_price !== "" ? "line-through" : null }]} title={this.props.currency + funGetFrench_Curr(this.props.data.price, 1, this.props.lan)} />
                                            {this.props.data.offer_price !== "" ? <EDRTLText style={[style.nestedPrice]} title={"  " + this.props.currency + funGetFrench_Curr(this.props.data.offer_price, 1, this.props.lan)} /> : null}
                                        </EDRTLView>
                                    </View>
                                    :
                                    <View style={style.isCustom}>
                                        <EDRTLView style={{ alignItems: 'center' }}>
                                            <EDRTLText style={[style.nestedPrice, { color: EDColors.grey, textDecorationLine: this.props.data.offer_price !== "" ? "line-through" : null, }]} title={this.props.currency + funGetFrench_Curr(this.props.data.price, 1, this.props.currency)} />
                                            {this.props.data.offer_price !== "" ? <EDRTLText style={[style.nestedPrice]} title={"  " + this.props.currency + funGetFrench_Curr(this.props.data.offer_price, 1, this.props.currency)} /> : null}
                                        </EDRTLView>
                                    </View>}

                                {this.props.isOpen ?
                                    <View
                                        style={style.isOpen}
                                    >

                                        {this.props.addons_category_list === undefined || this.props.addons_category_list.length === 0 ?
                                            this.props.cartData.some(item => item.menu_id === this.props.data.menu_id && item.quantity >= 1) ?
                                                <View style={{}}>
                                                    <TouchableOpacity
                                                        onPress={() => { this.props.addOneData(this.props.data, -1) }}>
                                                        <View style={[style.minusBoxButton]}>
                                                            <Icon size={getProportionalFontSize(16)} color={EDColors.black} name={'remove'} />

                                                        </View>
                                                    </TouchableOpacity>
                                                </View> : null
                                            :
                                            this.props.cartData.length !== 0 ?
                                                <View>
                                                    {this.props.cartData.some(item => item.menu_id === this.props.data.menu_id && item.quantity >= 1) ?
                                                        <View>
                                                            <TouchableOpacity
                                                                onPress={() => { this.props.minusItems(this.props.data) }}>
                                                                <View style={[style.minusBoxButton]}>
                                                                    <Icon size={getProportionalFontSize(16)} color={EDColors.black} name={'remove'} />

                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                        : null}
                                                </View> : null}

                                        {/* <View> */}
                                        {this.quantity != undefined && this.quantity != 0 && this.quantity > 0 ?
                                            <Text style={style.qtyTextStyle}>{this.quantity}</Text>
                                            : null}
                                        {/* </View> */}

                                        {this.props.addons_category_list === undefined || this.props.addons_category_list.length === 0 ?
                                            this.props.cartData.some(item => item.menu_id === this.props.data.menu_id && item.quantity >= 1) ?
                                                <View style={{}}>
                                                    <TouchableOpacity
                                                        style={[{ marginRight: !isRTLCheck() ? 0 : 20 }]}
                                                        onPress={() => { this.props.addOneData(this.props.data, 1) }}>
                                                        <View style={[style.roundButton]}>
                                                            <Icon size={getProportionalFontSize(16)} color={EDColors.white} name={'add'} />

                                                        </View>

                                                    </TouchableOpacity>
                                                </View> :
                                                (this.props.data.in_stock !== "0" ?
                                                    <TouchableOpacity onPress={() => { this.props.addOneData(this.props.data, 1) }}>
                                                        <View style={[style.roundButton]}>
                                                            <Icon size={getProportionalFontSize(16)} color={EDColors.white} name={'add'} />

                                                        </View>
                                                    </TouchableOpacity> : <EDRTLText title={strings("itemSoldOut")} style={style.customTextStyle} />)
                                            :
                                            this.props.cartData.length !== 0 ?
                                                <View>
                                                    {this.props.cartData.some(item => item.menu_id === this.props.data.menu_id && item.quantity >= 1) ?
                                                        <View>
                                                            <TouchableOpacity
                                                                onPress={() => { this.props.plusAction() }}>
                                                                <View style={[style.roundButton]}>
                                                                    <Icon size={getProportionalFontSize(16)} color={EDColors.white} name={'add'} />

                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                        :

                                                        <TouchableOpacity
                                                            onPress={() => { this.props.addData(this.props.data) }}>
                                                            <View style={[style.roundButton]}>
                                                                <Icon size={getProportionalFontSize(16)} color={EDColors.white} name={'add'} />

                                                            </View>
                                                        </TouchableOpacity>}
                                                </View>
                                                :
                                                (this.props.data.in_stock !== "0" ?
                                                    <TouchableOpacity
                                                        onPress={() => { this.props.addData(this.props.data) }}>
                                                        <View style={[style.roundButton]}>
                                                            <Icon size={getProportionalFontSize(16)} color={EDColors.white} name={'add'} />

                                                        </View>
                                                    </TouchableOpacity> :
                                                    <EDRTLText title={strings("itemSoldOut")} style={style.customTextStyle} />
                                                )}
                                    </View>
                                    : null}
                            </View>
                        </View>
                    </EDRTLView>
                </TouchableOpacity>
            </View>
        )
    }
}

export const style = StyleSheet.create({
    container: {
        flex: 1
    },
    nestedContainer: {
        alignItems: "flex-start",
        borderRadius: 16,
        backgroundColor: "#ffffff",
        margin: 10,
        padding: 10,
        marginHorizontal: 15,
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
        flex: 1
    },
    nestedTitle: {
        fontFamily: EDFonts.semiBold,
        color: EDColors.black,
        fontSize: getProportionalFontSize(14),
    },
    foodType: {
        fontFamily: EDFonts.regular,
        color: "#000",
        fontSize: getProportionalFontSize(12),
        marginTop: 2.5,
        color: EDColors.blackSecondary
    },
    nestedDesc: {
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(12),
        marginTop: 2.5,
        color: EDColors.blackSecondary
    },
    nestedPrice: {
        fontFamily: EDFonts.semiBold,
        color: EDColors.black,
        fontSize: getProportionalFontSize(14),
        textAlign: isRTLCheck() ? 'right' : "left",
        justifyContent: 'flex-end',
        flexDirection: "row"
    },
    roundButton: {
        alignSelf: "flex-end",
        justifyContent: 'center',
        alignItems: "center",
        marginLeft: 10,
        backgroundColor: EDColors.primary,
        borderRadius: 8,
        padding: 5
    },
    minusBoxButton: {
        alignSelf: "flex-end",
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: EDColors.white,
        borderRadius: 8,
        padding: 5,
        borderWidth: 1.5,
        borderColor: EDColors.separatorColorNew,
    },
    viewStyle: {
        width: 7,
        height: 7,
        margin: 2,
        borderRadius: 6,
    },
    customTextStyle: {
        fontFamily: EDFonts.regular,
        marginTop: 5,
        color: 'red',
        fontSize: 10,
    },
    itemImage: { height: 100, width: 100, borderRadius: 8 },
    centerViewStyle: { marginHorizontal: 10, justifyContent: "space-between", flex: 1 },
    qtyTextStyle: {
        alignSelf: 'center', fontSize: getProportionalFontSize(14), marginLeft: 10,
        color: EDColors.black, fontFamily: EDFonts.medium
    },
    isOpen: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: "baseline" },
    isCustom: { flexDirection: 'column', marginTop: 5 }
});
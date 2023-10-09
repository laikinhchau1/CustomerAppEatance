import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { NavigationEvents } from "react-navigation";
import { strings } from "../locales/i18n";
import { showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import EDImage from "./EDImage";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";

export default class CartItem extends React.Component {
    constructor(props) {
        super(props);
        this.quantity = 1
    }


    UNSAFE_componentWillReceiveProps(props) {
        this.setState({
            quantity: Number(props.quantity),
            add_on_price: 0
        });
    }


    UNSAFE_componentWillMount() {
        if (this.props.items !== undefined) {
            if (this.props.items.addons_category_list !== undefined && this.props.items.quantity > 1) {
                this.quantity = Number(this.props.items.quantity)
            }
        }

        if (this.props.addonsItems.length === 0) {
            this.setState({
                rate: (this.props.price) * (this.state.quantity)
            })

        } else {
            this.props.addonsItems.map((item) => {
                {
                    item.addons_list.map((items) => {
                        if (items.add_ons_price !== undefined) {
                            this.state.rate = Number(this.state.rate) + Number(items.add_ons_price)
                        }
                    })
                }
            })
        }
    }

    state = {
        quantity: this.props.quantity > 0 ? Number(this.props.quantity) : 0,
        isRefresh: false,
        rate: this.props.price
    };

    render() {
        return (
            // Vikrant 28-07-21

            <View style={style.container}>
                <EDRTLView style={style.imageContainer}>
                    <NavigationEvents
                        onDidFocus={payload => {
                            if (this.props.items !== undefined) {
                                if (this.props.items.addons_category_list !== undefined && this.props.items.quantity > 1) {
                                    this.quantity = this.props.items.quantity
                                }
                            }

                            if (this.props.addonsItems.length === 0) {
                                this.setState({
                                    rate: (this.props.price) * (this.state.quantity)
                                })
                            } else {
                                this.props.addonsItems.map((item) => {
                                    {
                                        item.addons_list.map((items) => {
                                            if (items.add_ons_price !== undefined) {
                                                this.state.rate = parseInt(this.state.rate) + parseInt(items.add_ons_price)
                                            }
                                        })
                                    }
                                })
                            }
                        }}
                    />

                    <EDImage
                        style={style.itemImage}
                        resizeMode={
                            this.props.items.image !== undefined &&
                                this.props.items.image !== "" &&
                                this.props.items.image !== null ?
                                'cover' : 'contain'}
                        source={this.props.items.image}
                    />

                    <View style={style.viewStyle}>
                        <EDRTLView>
                            <EDRTLText style={[style.itemName]} title={this.props.items.name} />
                        </EDRTLView>
                        {this.props.items.is_combo_item == 1 && this.props.items.combo_item_details != "" && this.props.items.combo_item_details != undefined && this.props.items.combo_item_details != null ?
                            <View style={{}}>
                                <EDRTLText title={this.props.items.combo_item_details.replaceAll("+ ", "\r\n")} style={style.comboText} />
                            </View>
                            : null
                        }

                        <EDRTLText title={strings("foodType") + this.props.items.food_type_name} style={style.foodType} />

                        <EDRTLText title={this.props.currency + "" + funGetFrench_Curr(this.state.rate, this.quantity, this.props.currency)} style={[style.totalPrice]} />

                        {/* {this.props.addonsItems.length !== 0 ?
                    <View style={{ flexDirection: isRTLCheck() ? 'row' : 'row-reverse' }}>
                        <EDRTLText style={[style.currencyName, { textAlign: isRTLCheck() ? "left" : "right"}]} title={this.props.currency + funGetFrench_Curr(this.props.price, this.quantity, this.props.currency)} />
                    </View>
                    : null} */}


                        <EDRTLView style={style.qunContainer}>
                            {this.props.forRemoval !== true ?
                                <TouchableOpacity
                                    onPress={() => {
                                        if (this.state.quantity > 1) {
                                            this.setState({ quantity: this.state.quantity - 1, rate: (this.props.price) * (this.state.quantity - 1) });
                                            this.props.onMinusClick(this.state.quantity - 1, this.props.index);
                                        }
                                        else {
                                            this.props.deleteClick(this.props.index)
                                        }
                                    }}
                                    style={style.qunBtn}
                                >

                                    <View style={style.roundButton}>
                                        <MaterialIcon size={15} color={EDColors.black} name={'remove'} />
                                    </View>
                                </TouchableOpacity> : null}
                            {/* : null} */}

                            <Text style={{ margin: 5, fontFamily: EDFonts.regular }}>{(this.props.forRemoval == true ? (strings("quantity") + " - ") : "") + this.state.quantity}</Text>
                            {this.props.forRemoval !== true ?
                                <TouchableOpacity
                                    onPress={this.onPlusPressed}
                                    style={style.qunAddBtn}
                                >
                                    <View style={style.roundButton}>
                                        <MaterialIcon size={15} color={EDColors.white} name={'add'} />
                                    </View>
                                </TouchableOpacity> : null}
                        </EDRTLView>




                    </View>

                    <TouchableOpacity
                        style={[style.deleteContainer]}
                        onPress={() => this.props.deleteClick(this.props.index)}
                    >
                        <Icon
                            name={"close"}
                            size={getProportionalFontSize(20)}
                            color={EDColors.black}
                        />
                    </TouchableOpacity>



                </EDRTLView>
                <View style={style.separater} />
                <View style={style.addOnView}>
                    {this.props.addonsItems.length > 0 && this.props.addonsItems !== undefined && this.props.addonsItems !== null ?
                        <View style={style.addOnTopView}>
                            {this.props.addonsItems.map((item) => {
                                return (
                                    <View style={style.addOnMainView} >
                                        {item.addons_category != null ?
                                            <EDRTLText title={item.addons_category + ":"} style={style.addOnTitleText} /> : null}
                                        {item.addons_list.map((items) => {
                                            return (
                                                <EDRTLView style={style.addOnSubView}>
                                                    {this.quantity !== 1 ?
                                                        <EDRTLView style={{ flex: 1 }}>
                                                            <Text style={style.addOnText}>{items.add_ons_name.trim() + " (x" + this.quantity + ")"}</Text>
                                                            {/* <Text style={{ fontSize: 12 }}>{"(x"}</Text>
                                                    <Text style={{ fontSize: 12 }}>{this.quantity + ")"}</Text> */}
                                                        </EDRTLView>
                                                        :
                                                        <EDRTLText style={[style.addOnText, { flex: this.quantity !== 0 ? 1 : 1.5 }]} title={items.add_ons_name.trim()} />
                                                    }
                                                    {items.add_ons_price === undefined ?
                                                        <Text style={style.addOnPriceText}>{""}</Text> :
                                                        <Text style={[style.addOnPrice, { textAlign: isRTLCheck() ? 'left' : 'right' }]}>
                                                            {this.props.currency + funGetFrench_Curr(items.add_ons_price, this.quantity, this.props.currency)}
                                                        </Text>
                                                    }
                                                </EDRTLView>
                                            )
                                        })}
                                    </View>)
                            })}
                        </View>
                        : null}
                </View>

            </View>
        );
    }

    onPlusPressed=() => {
        if (this.state.quantity < 999 ) {
            if (this.state.quantity >= 0) {
                this.setState({ quantity: this.state.quantity + 1, rate: (this.props.price) * (this.state.quantity + 1) });
                this.props.onPlusClick(this.state.quantity + 1, this.props.index);
            }
        }else{
            showValidationAlert(strings("qtyExceed"))
        }
    }
}


export const style = StyleSheet.create({
    container: {
        margin: 10,
        borderRadius: 16,
        backgroundColor: "#fff",
        // overflow: 'hidden',
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    imageContainer: {
        borderRadius: 16,
        backgroundColor: "#fff",
        overflow: 'hidden',
    },
    foodType: {
        fontFamily: EDFonts.medium,
        color: "#000",
        fontSize: getProportionalFontSize(12),
        marginTop: 3,
        marginHorizontal: 5
    },
    itemImage: {
        flex: 1.8,
        borderRadius: 16,
        marginHorizontal: 8,
        width: metrics.screenHeight * 0.18,
        height: metrics.screenWidth * 0.23,
        marginBottom: 8,
        marginTop: 8
    },
    addOnView: { paddingHorizontal: 10 },
    itemName: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.semiBold,
        color: EDColors.black,
        flex: 1, marginHorizontal: 5
    },
    separater: { borderBottomWidth: 0.5, borderBottomColor: "#F6F6F6", width: '100%' },
    qunBtn: { borderWidth: 1, borderColor: "#EDEDED", borderRadius: 8, marginHorizontal: 5 },
    qunAddBtn: { borderWidth: 1, borderColor: "#EDEDED", borderRadius: 8, marginHorizontal: 5, backgroundColor: EDColors.primary },
    addOnTitleText: { marginBottom: 4, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.black, textDecorationLine: 'underline' },
    comboText: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, margin: 5, marginVertical: 2.5 },
    addOnMainView: { marginBottom: 5 },
    addOnSubView: { flex: 1, marginVertical: 2 },
    addOnTopView: { marginVertical: 5 },
    currencyName: {
        marginHorizontal: 10, color: EDColors.primary,
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.semiBold,
        color: EDColors.black,
    },
    qunContainer: {
        alignItems: 'center',
        marginVertical: 5,
    },
    roundButton: {
        justifyContent: "center",
        margin: 3
    },
    price: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: getProportionalFontSize(17),
        fontFamily: EDFonts.regular
    },
    deleteContainer: {
        flex: 0.8,
        // backgroundColor: EDColors.primary,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingVertical: 5
    },
    viewStyle: { flex: 4, marginTop: 5 },
    isVegView: {
        width: 7,
        height: 7,
        margin: 2,
        borderRadius: 6,
    },
    buttonStyle: { marginVertical: 9, width: 10, marginHorizontal: 5 },
    addOnText: { flex: 1, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, color: "#999999" },
    addOnPriceText: { flex: 1, marginRight: 10, textAlign: 'right', fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, color: "#999999" },
    addOnPrice: { flex: 1, color: "#999999", marginHorizontal: 10, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium },
    totalPrice: { fontSize: getProportionalFontSize(12), marginTop: 5, fontFamily: EDFonts.medium, color: EDColors.black, marginHorizontal: 5 }
});

// export const style = StyleSheet.create({
//     container: {
//         margin: 10,
//         borderRadius: 6,
//         backgroundColor: "#fff",
//         overflow: 'hidden'
//     },
//     foodType: {
//         fontFamily: EDFonts.regular,
//         color: "#000",
//         fontSize: getProportionalFontSize(12),
//         marginTop: 3
//     },
//     itemImage: {
//         flex: 2,
//         borderRadius: 6,
//         marginHorizontal: 8,
//         width: metrics.screenHeight * 0.2,
//         height: metrics.screenWidth * 0.2,
//         marginBottom: 8,
//         marginTop: 8
//     },
//     itemName: {
//         fontSize: getProportionalFontSize(16),
//         fontFamily: EDFonts.bold,
//         color: "#000",
//     },
//     qunContainer: {
//         alignItems: 'center',
//         marginTop: 10,
//     },
//     roundButton: {
//         justifyContent: "center"
//     },
//     price: {
//         marginTop: 10,
//         marginBottom: 10,
//         fontSize: getProportionalFontSize(17),
//         fontFamily: EDFonts.regular
//     },
//     deleteContainer: {
//         flex: 0.8,
//         backgroundColor: EDColors.primary,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     viewStyle: { flex: 4, marginTop: 10 },
//     isVegView: {
//         width: 7,
//         height: 7,
//         margin: 2,
//         borderRadius: 6,
//     },
//     buttonStyle: { marginVertical: 9, width: 10, marginHorizontal: 5 },
//     addOnText: { flex: 1, marginRight: 10, textAlign: 'right', fontSize: getProportionalFontSize(12) },
//     addOnPrice: { flex: 1, marginHorizontal: 10, fontSize: getProportionalFontSize(12) },
//     totalPrice: { fontSize: getProportionalFontSize(12), marginRight: isRTLCheck() ? 0 : 10, marginLeft: isRTLCheck() ? 10 : 0 }
// });

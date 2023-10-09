import React from "react";
import { View, StyleSheet } from "react-native";
import { EDColors } from "../utils/EDColors";
import { capiString, funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";

export default class ItemComponent extends React.Component {

    render() {
        return (
            <>
                <EDRTLView style={style.mainView}>
                    <EDRTLText style={[style.textStyle, this.props.titleStyle]} title={this.props.name + "  x " + this.props.quantity} />
                    <EDRTLText title={this.props.price} style={[{ fontFamily: EDFonts.bold }, this.props.priceStyle]} />
                </EDRTLView>
                {(this.props.data.is_customize == 1 || this.props.data.is_customize == "1") && this.props.data.addons_category_list !== undefined && this.props.data.addons_category_list !== null ?
                    this.props.data.addons_category_list.map(
                        category => {
                            return (
                                <View style={{ marginHorizontal: 15, marginVertical: 2 }}>
                                    <EDRTLText title={category.addons_category + ":"} style={style.addOnTitle} />
                                    {category.addons_list.map(
                                        addons => {
                                            return (
                                                <EDRTLView style={{ marginVertical: 3 }}>
                                                    <EDRTLText style={style.addOnName} title={capiString(addons.add_ons_name) + " (x" + this.props.data.quantity + ")"} />
                                                    <EDRTLText style={[style.addOnValue, { textAlign: isRTLCheck() ? "left" : "right" }]} title={this.props.currency_symbol + funGetFrench_Curr(addons.add_ons_price, this.props.data.quantity, this.props.lan)} />
                                                </EDRTLView>
                                            )
                                        }
                                    )}
                                </View>)
                        }
                    )
                    : null}
            </>
        )
    }
}

const style = StyleSheet.create({
    mainView: { marginVertical: 5, marginHorizontal: 10, justifyContent: "space-between" },
    textStyle: { flex: 1, fontFamily: EDFonts.bold, maxWidth: metrics.screenWidth * .75, color: EDColors.black },
    addOnName: { flex: 2, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.text },
    addOnValue: { flex: 1, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.text },
    addOnTitle: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.regular, color: EDColors.black },
})
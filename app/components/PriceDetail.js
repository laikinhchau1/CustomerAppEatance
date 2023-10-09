import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import { EDColors } from "../utils/EDColors";

export default class PriceDetail extends React.PureComponent {
    render() {
        return (
            <View>
                {this.props.price !== "" && this.props.price !== null && this.props.price !== undefined && this.props.label_key !== "Coupon Amount" ?
                    <EDRTLView style={[style.container, this.props.style]}>
                        <View style={{ flex: 1 }}>
                            <EDRTLText style={[style.itemTitle, this.props.titleStyle]} title={this.props.title} />
                            {this.props.subtitle !== undefined && this.props.subtitle !== null && this.props.subtitle.trim().length !== 0 ?
                                <EDRTLText style={style.subtitle} title={this.props.subtitle} />
                                : null}
                        </View>
                        <Text style={[style.price, this.props.priceStyle]} >{this.props.price}</Text>
                    </EDRTLView>
                    : <View />
                }
            </View>
        );
    }
}

export const style = StyleSheet.create({
    container: {
        marginTop: 10,
        marginLeft: 10,
        marginRight: 20,
        alignItems: 'center'
    },
    price: {
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(14),
        color: EDColors.grey,

    },
    itemTitle: {
        flex: 1,
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(14),
        color: EDColors.grey,
    },
    subtitle: {
        flex: 1,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(12),
        marginTop: 2,
        color: EDColors.grey,
        marginHorizontal: 10
        // height: 20
    }
});
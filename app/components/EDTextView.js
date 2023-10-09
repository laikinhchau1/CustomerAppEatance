import React from "react";
import { StyleSheet, Text } from "react-native";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";

export default class EDTextView extends React.Component {
    render() {
        return <Text style={[style.textview, this.props.textstyle]}>{this.props.text}</Text>;
    }
}

export const style = StyleSheet.create({
    textview: {
        color: EDColors.primary,
        fontSize: getProportionalFontSize(15),
        fontFamily: EDFonts.regular
    },
});

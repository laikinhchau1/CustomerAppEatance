import React from "react";
import { StyleSheet, Text } from "react-native";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";

export default class ETextViewNormalLable extends React.Component {
  render() {
    return <Text style={[stylesLable.textLable,{textAlign: isRTLCheck() ? 'right' : 'left'}, this.props.textStyle]}>{this.props.text}</Text>;
  }
}
const stylesLable = StyleSheet.create({
  textLable: {
    marginStart: 10,
    marginEnd: 10,
    color: "#000",
    fontSize: getProportionalFontSize(16),
    marginTop: 10,
    marginLeft: 20,
    fontFamily: EDFonts.bold
  }
});

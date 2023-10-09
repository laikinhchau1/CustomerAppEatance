import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { EDColors } from "../utils/EDColors";
import { EDFonts } from "../utils/EDFontConstants";

export default class TextviewRadius extends React.PureComponent {
    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress}>
                <View style={[style.container, this.props.style]}>
                    <Text style={[style.text, this.props.textStyle]}>{this.props.text}</Text>
                </View>
            </TouchableOpacity>

        );
    }
}

export const style = StyleSheet.create({
    container: {
        backgroundColor: EDColors.primary,
        borderRadius: 4,
        margin: 10,
        alignSelf: "flex-start",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        fontFamily: EDFonts.regular,
        color: "#fff",
        fontSize: heightPercentageToDP("2%"),
        textAlign: 'center',
        textAlignVertical: "center"
    }
});

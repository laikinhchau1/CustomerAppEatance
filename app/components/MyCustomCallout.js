import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";

export default class MyCustomCallout extends React.Component {

    render() {
        return (
            <View>
                <View style={styles.mainView}>
                    <Image source={this.props.image} style={styles.imageStyle} />
                    <View style={{ marginHorizontal: 10 }}>
                        <Text style={{ fontFamily: EDFonts.regular }}>{this.props.title}</Text>
                        <Text style={{ fontFamily: EDFonts.light }}>{this.props.discription}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.buttonStyle}>
                        <Icon
                            name="call"
                            size={getProportionalFontSize(10)}
                            color={EDColors.primary}
                            reverse
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainView: { flexDirection: 'row', width: metrics.screenWidth * 0.483 },
    buttonStyle: {
        alignSelf: 'flex-end',
        width: 40,
        height: 40,
        marginLeft: metrics.screenWidth * 0.10,
    },
    imageStyle: { borderRadius: 5, overflow: "hidden", width: metrics.screenWidth * 0.10, height: metrics.screenWidth * 0.10, borderWidth: 1 }
})
import React from "react";
import { Image, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";

export default class TextViewLeftImage extends React.PureComponent {
    render() {
        return (
            <EDRTLView style={[style.container, this.props.style]}>
                {this.props.isIcon ?
                    <Icon
                        name={this.props.icon}
                        size={this.props.size || getProportionalFontSize(20)}
                        color={this.props.color || EDColors.primary}
                        type={this.props.type || "material"}
                    />
                    :
                    <Image
                        style={style.image, this.props.imageStyle}
                        source={this.props.image}
                        resizeMode="contain"
                    />}
                <EDRTLText style={[style.text, this.props.textStyle]} numberOfLines={this.props.lines || 0} title={this.props.title} />
            </EDRTLView>
        );
    }
}

export const style = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
    },
    text: {
        color: EDColors.text,
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.regular,
        marginHorizontal: 5
    },
    image: {
        width: 15,
        height: 15,
    }
});

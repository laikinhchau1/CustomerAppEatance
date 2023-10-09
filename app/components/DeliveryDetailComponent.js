import React from "react";
import { Icon } from "react-native-elements";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import { StyleSheet } from 'react-native'

export default class DeliveryDetailComponent extends React.PureComponent {

    constructor(props) {
        super(props);

    }

    render() {
        return (
            <EDRTLView style={[{ alignItems: 'center' }, this.props.style]}>
                <Icon
                    name={this.props.source}
                    color={EDColors.primary}
                />
                <EDRTLText
                    style={[
                        style.textView,
                        this.props.textStyle
                    ]}
                    onPress={this.props.onPress}
                    title={this.props.label}
                />
            </EDRTLView>
        );
    }
}


const style = StyleSheet.create({
    textView: {
        fontSize: getProportionalFontSize(17),
        marginLeft: 5,
        marginRight: 5,
        fontFamily: EDFonts.light
    }
})
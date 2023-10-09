/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';

export default class EDRTLText extends React.Component {
    //#region LIFE CYCLE METHODS

    /** RENDER */
    render() {
        return (
            <Text style={[styles.textStyle, { textAlign: isRTLCheck() ? 'right' : 'left' }, this.props.style]}
                numberOfLines={this.props.numberOfLines}
                onPress={this.props.onPress}>
                {this.props.title}
            </Text>
        )
    }
    //#endregion
}

//#region STYLES
const styles = StyleSheet.create({
    textStyle: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.regular,
    },
})
//#endregion

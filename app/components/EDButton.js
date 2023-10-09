/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';
import { Icon } from 'react-native-elements';

export default class EDButton extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    /** RENDER */
    render() {
        return (
            <TouchableOpacity activeOpacity={this.props.activeOpacity}
                style={[style.menuBorder, this.props.style]}
                disabled={this.props.disabled}
                onPress={this.props.onPress}>
                {this.props.icon ?
                    <Icon name={this.props.icon} size={this.props.iconSize || getProportionalFontSize(20)} color={this.props.iconColor || EDColors.white} containerStyle={{ marginHorizontal: 5 }}
                        type={this.props.iconType || 'material'}
                    /> : null}
                <EDRTLText style={[style.textStyle, this.props.textStyle]}
                    title={this.props.label}
                />
            </TouchableOpacity>
        );
    }
    //#endregion
}

//#region STYLES
export const style = StyleSheet.create({
    menuBorder: {
        marginHorizontal: 20,
        backgroundColor: EDColors.primary,
        padding: 10,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: isRTLCheck() ? "row-reverse" : "row"
    },
    textStyle: {
        alignSelf: 'center',
        color: EDColors.white,
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.medium,
    },
});
//#endregion

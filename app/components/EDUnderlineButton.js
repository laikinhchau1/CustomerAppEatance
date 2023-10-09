/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLView from './EDRTLView';
import EDTextView from './EDTextView';

export default class EDUnderlineButton extends Component {
    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (
            <TouchableOpacity
                pointerEvents={this.props.pointerEvents || 'auto'}
                style={[stylesButton.themeButton, this.props.buttonStyle]}
                onPress={this.props.onPress} >
                <EDRTLView>
                    <EDTextView
                        textstyle={this.props.style}
                        text={this.props.title} />
                    <View style={[stylesButton.viewStyle, this.props.viewStyle]}>
                        <Text
                            numberOfLines={this.props.numberOfLines}
                            style={[
                                stylesButton.themeButtonText,
                                this.props.textStyle,
                            ]}>
                            {this.props.label}
                        </Text>
                    </View>
                </EDRTLView>

            </TouchableOpacity >

        );
    }
    //#endregion
}

//#region STYLES
export const stylesButton = StyleSheet.create({
    themeButton: {
        justifyContent: 'center',
        alignSelf: 'center',
    },
    themeButtonText: {
        color: EDColors.white,
        fontFamily: EDFonts.regular,
        alignSelf: 'center',
        fontSize: getProportionalFontSize(14)
    },
    viewStyle:{
        borderBottomColor: EDColors.black,
        borderBottomWidth: 1,
    }
});
//#endregion

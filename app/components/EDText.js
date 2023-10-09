/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';

export default class EDText extends Component {
    render() {
        return (
            <View
                style={[
                    styles.container,
                    this.props.style,
                    { alignItems: isRTLCheck() ? 'flex-end' : 'flex-start' },
                ]}>
                <Text style={[styles.mainText, this.props.textStyle,{ textAlign: isRTLCheck() ? 'right' : 'left'}]}
                    numberOfLines={this.props.numberOfLines}>
                    {this.props.title}
                    {this.props.isMandatory !== undefined ? (
                        <Text style={styles.asterisk}>*</Text>
                    ) : null}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
    },
    mainText: {
        color: EDColors.placeholder,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16),
    },
    asterisk: {
        color: EDColors.error,
        fontFamily: EDFonts.regular,
        padding: 10,
    },
});

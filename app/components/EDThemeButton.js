/* eslint-disable prettier/prettier */
import { Spinner } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLView from './EDRTLView';
import { Icon } from 'react-native-elements';

export default class EDThemeButton extends Component {

    //#region LIFE CYCLE METHODS
    /** RENDER */
    render() {
        return (

            <TouchableOpacity
                activeOpacity={this.props.activeOpacity}
                pointerEvents={this.props.isLoading ? 'none' : 'auto'}
                disabled={this.props.disabled}
                onLayout={this.props.onLayout}
                style={[this.props.isTransparent ? stylesButton.themeButtonTransparent : stylesButton.themeButton, this.props.style]}
                onPress={this.onPressHandler}>
                {this.props.isLoadingPermission
                    ? <Spinner style={stylesButton.spinner} color={EDColors.white} size="small" />
                    :
                    <EDRTLView style={stylesButton.rtlView}>
                        {this.props.icon ?
                            <Icon name={this.props.icon} type={this.props.iconType || 'material'} color={EDColors.white} size={getProportionalFontSize(20)} /> : null}
                        {this.props.isSimpleText ?
                            <Text style={[stylesButton.themeButtonText, this.props.textStyle]}>
                                {this.props.label}
                                {/* {this.props.label.toLowerCase().replace(/^.{1}/g, this.props.label[0].toUpperCase())} */}
                            </Text>
                            : <Text style={[stylesButton.themeButtonText, this.props.textStyle]}>
                                {this.props.label}
                                {/* {this.props.label.toUpperCase()} */}
                                {/* {this.props.label.toLowerCase().replace(/^.{1}/g, this.props.label[0].toUpperCase())} */}
                            </Text>}
                    </EDRTLView>
                }
            </TouchableOpacity>
        );
    }
    //#endregion

    onPressHandler = () => {
        if (this.props.onPress !== undefined) {
            this.props.onPress();
        }
    }
}

//#region STYLES
export const stylesButton = StyleSheet.create({
    themeButton: {
        backgroundColor: EDColors.homeButtonColor,
        borderRadius: 16,
        width: Metrics.screenWidth * 0.65,
        height: heightPercentageToDP('5.0%'),
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
    },
    themeButtonTransparent: {
        backgroundColor: EDColors.transparent,
        borderRadius: 16,
        borderColor: EDColors.white,
        borderWidth: 1,
        width: Metrics.screenWidth * 0.65,
        height: heightPercentageToDP('5.0%'),
        // alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    themeButtonText: {
        color: EDColors.white,
        textAlign: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        fontFamily: EDFonts.medium,
        // alignSelf: 'center',
        fontSize: getProportionalFontSize(15)
    },
    spinner: {
        flex: 1,
        alignSelf: 'center',
        zIndex: 1000,
    },
    rtlView: { justifyContent: "center", alignItems: "center", marginHorizontal: 10 }
});
//#endregion

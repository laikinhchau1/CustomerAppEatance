/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Assets from '../assets';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import metrics from '../utils/metrics';
import EDButton from './EDButton';
import EDRTLText from './EDRTLText';
import EDRTLImage from './EDRTLImage';

export default class EDPlaceholderComponent extends Component {
    //#region LIFE CYCLE METHODS

    /** RENDER */
    render() {
        return (
            <View style={[styles.mainContainer, this.props.style]}>

                <View style={[styles.childContainer]}>
                    <EDRTLImage style={styles.rtlImage} source={this.props.placeholderIcon || Assets.logo} resizeMode={'contain'} />
                    {this.props.title
                        ? <EDRTLText title={this.props.title} style={[styles.titleText, { color: this.props.backgroundColor ? EDColors.white : EDColors.textAccount }]} />
                        : null}
                    {this.props.subTitle
                        ? <EDRTLText title={this.props.subTitle} style={[styles.messageText, { color: this.props.backgroundColor ? EDColors.white : EDColors.text, marginTop: this.props.title ? 0 : 10 }]} />
                        : null}
                    {this.props.onBrowseButtonHandler
                        ? <EDButton onPress={this.props.onBrowseButtonHandler} style={{ marginTop: 20, backgroundColor: EDColors.homeButtonColor, paddingHorizontal: 40 }} label={this.props.buttonTitle || strings('dialogBrowse')} />
                        : null}
                </View>

            </View>
        );
    }
    //#region 
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
    childContainer: {
        borderRadius: 5,
        // borderWidth: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        width: '75%',
        alignItems: 'center',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowColor: EDColors.text,
        shadowOffset: { height: 0, width: 0 }
    },
    titleText: {
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.semiBold,
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 10
    },
    messageText: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.regular,
        textAlign: 'center'
    },
    rtlImage: {
        width: metrics.screenWidth * 0.45, height: metrics.screenWidth * 0.4,
        transform: [{
            scaleX: isRTLCheck() ? 1 : 1
        }],
        marginBottom: -10,
        marginTop:-20
        // tintColor :EDColors.white
    }
});

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Image, TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLText from './EDRTLText';
import Assets from '../assets';
import { strings } from '../locales/i18n';
import DeviceInfo from 'react-native-device-info';
import { EDColors } from "../utils/EDColors";
import { isRTLCheck, getProportionalFontSize } from '../utils/EDConstants';
import { Icon } from 'react-native-elements';
import EDImage from './EDImage';

export default class EDThemeHeader extends Component {

    render() {
        return (
            <View>
                <EDImage
                    style={styles.imageBackground}
                    source={this.props.image}
                    placeholder={Assets.bgHome}
                    resizeMode="cover"
                />


                <View style={[styles.backButtonContainer, { alignItems: isRTLCheck() ? 'flex-end' : 'flex-start' }]}>
                    <TouchableOpacity onPress={this.props.onLeftButtonPress}>
                        <Icon size={getProportionalFontSize(25)} color={EDColors.white} name={this.props.icon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.welcomeContainer}>
                    <EDRTLText style={styles.welcomeText} title={strings('welcome')} />
                    <EDRTLText numberOfLines={2} style={styles.titleText} title={this.props.title} />
                </View>
            </View>
        );
    }
}

export const styles = StyleSheet.create({
    imageBackground: {
        width: Metrics.screenWidth,
        height: (Metrics.screenWidth * 216) / 414,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    backButtonContainer: { position: 'absolute', marginHorizontal: 20, top: (DeviceInfo.hasNotch() && Platform.OS === 'ios') ? 44 : 20, width: Metrics.screenWidth - 40 },
    welcomeContainer: { position: 'absolute', marginHorizontal: 20, bottom: '10%', width: Metrics.screenWidth - 40 },
    welcomeText: { fontFamily: EDFonts.light, fontSize: getProportionalFontSize(18), color: EDColors.white },
    titleText: { fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(30), color: EDColors.white },
});

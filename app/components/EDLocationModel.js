/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Assets from '../assets'
import EDThemeButton from '../components/EDThemeButton'
import { strings } from "../locales/i18n"
import { EDColors } from '../utils/EDColors'
import { getProportionalFontSize } from '../utils/EDConstants'
import { EDFonts } from '../utils/EDFontConstants'
import metrics from '../utils/metrics'
import EDRTLText from './EDRTLText'

export default class EDLocationModel extends React.Component {
    render() {
        return (
            <View style={styles.mainView}>
                <Image source={Assets.locationerror} style={styles.locationIcon} />
                <EDRTLText style={styles.locationTextStyle}
                    title={strings("enableLocation")}
                />
                <EDRTLText style={styles.locationMessageStyle} numberOfLines={2}
                    title={strings("locationMessage")}
                />
                <EDThemeButton isLoadingPermission={this.props.isLoadingPermission} label={strings("allowLocationButton")} style={{
                    marginTop: 40,
                    height: heightPercentageToDP('6%'),
                }}
                    onPress={this.props.onLocationEventHandler}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    locationIcon: { height: metrics.screenHeight * 0.33, width: metrics.screenWidth * 0.9, resizeMode: "contain" },
    locationTextStyle: { marginTop: 20, fontFamily: EDFonts.semiBold, fontSize: 40, width: metrics.screenWidth, textAlign: "center", color : EDColors.blackSecondary },
    locationMessageStyle: { marginTop: 10, textAlign: "center", fontSize: getProportionalFontSize(17), fontFamily: EDFonts.regular, width: metrics.screenWidth * 0.80, textAlign: "center" },
    mainView: { flex: 1, backgroundColor: "white", alignItems: 'center', justifyContent: 'center' }
})
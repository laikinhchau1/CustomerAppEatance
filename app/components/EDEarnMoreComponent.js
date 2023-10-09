/* eslint-disable prettier/prettier */
import React from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, Clipboard } from 'react-native'
import { Icon } from 'react-native-elements'
import EDRTLView from '../components/EDRTLView'
import { strings } from '../locales/i18n'
import { EDColors } from '../utils/EDColors'
import { EDFonts } from '../utils/EDFontConstants'
import metrics from '../utils/metrics'
import { G, SvgXml } from 'react-native-svg';
import Toast, { DURATION } from "react-native-easy-toast";
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants'
import EDRTLText from './EDRTLText'
import { dotted_line_left, dotted_line_right, edit_icon, reward_icon, share_icon } from "../utils/EDSvgIcons";


export default class EDEarnMoreComponent extends React.Component {
    render() {
        return (

            <View>
                {/* TOAST */}
                <Toast ref="toast" position="center" fadeInDuration={0} />
                <View style={style.earningModal}>
                    <EDRTLView style={style.shareView}>
                        <Text style={[style.shareText]}>
                            {strings("earnMore")}
                        </Text>
                        {this.props.isClose ?
                            <Icon name={"close"} size={getProportionalFontSize(18)} onPress={this.props.closeEarningModal} color={EDColors.text} />
                            : null}
                    </EDRTLView>
                    <View style={style.break} />
                    <EDRTLView style={style.referBody}>
                        <SvgXml xml={share_icon} width={getProportionalFontSize(50)} height={getProportionalFontSize(50)} fill={EDColors.primary} />
                        <View style={style.valueStyle}>
                            <Text style={style.numberIcon}>
                                1
                            </Text>
                        </View>
                        <EDRTLText title={strings("referMsg1")} style={style.referText} />
                    </EDRTLView>
                    <EDRTLView style={{ justifyContent: 'center' }}>

                        <SvgXml xml={isRTLCheck() ? dotted_line_right : dotted_line_left} width={'90%'} height={getProportionalFontSize(50)}
                            preserveAspectRatio="none"
                        />

                    </EDRTLView>
                    <EDRTLView style={style.referBody}>
                        <EDRTLText title={strings("referMsg2")} style={style.referText} />
                        <SvgXml xml={edit_icon} width={getProportionalFontSize(50)}  height={getProportionalFontSize(50)} fill={EDColors.primary} />
                        <View style={style.valueStyle}>
                            <Text style={style.numberIcon}>
                                2
                            </Text>
                        </View>
                    </EDRTLView>
                    <EDRTLView style={{ justifyContent: 'center' }}>
                        <SvgXml xml={isRTLCheck() ? dotted_line_left : dotted_line_right} width={'90%'}  height={getProportionalFontSize(50)}  preserveAspectRatio="none"/>
                    </EDRTLView>
                    <EDRTLView style={style.referBody}>
                        <SvgXml xml={reward_icon} width={getProportionalFontSize(50)} height={getProportionalFontSize(50)} fill={EDColors.primary} />
                        <View style={style.valueStyle}>
                            <Text style={style.numberIcon}>
                                3
                            </Text>
                        </View>
                        <EDRTLText title={strings("referMsg3")} style={style.referText} />
                    </EDRTLView>
                    <View style={[style.break]} />
                    <EDRTLText title={strings("referralCode")} style={[style.promoText]} />
                    <TouchableOpacity onPress={this.copyToClipboard} activeOpacity={1}>
                        <EDRTLView style={style.clipboardView}>
                            <EDRTLText title={this.props.referral_code} style={style.codeBox} />
                            <EDRTLView style={[style.share]} >
                                <Icon name="hand-pointer-o" type={'font-awesome'} size={15} />
                                <EDRTLText title={strings("tapToCopy")} style={[style.copyText]} />
                            </EDRTLView>
                        </EDRTLView>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.shareApp} style={[style.shareBtn]} >
                        <EDRTLView style={style.btnView} >
                            <Icon name="sharealt" type={'ant-design'} color={EDColors.white} size={getProportionalFontSize(18)} />
                            <EDRTLText title={strings("shareNow")} style={[style.normalText]} />
                        </EDRTLView>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


    /**
     * Copy to clipboard
     */

    copyToClipboard = () => {
        this.refs.toast.show(strings("codeCopied"), DURATION.LENGTH_SHORT);
        Clipboard.setString(this.props.referral_code)
    }

}


const style = StyleSheet.create({

    earningModal: {
        backgroundColor: EDColors.white,
        borderRadius: 24,
        width: metrics.screenWidth * .9,
        alignSelf: "center",
        padding: 10,

    },
    btnView: { alignItems: 'center' },
    break: {
        height: 1,
        backgroundColor: "#F6F6F6",
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15
    },
    referBody: {
        justifyContent: "space-between",
        alignItems: "center",
        // marginVertical: 20,
        paddingHorizontal: 10
    },
    referText: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.medium,
        flex: 1,
        marginHorizontal: getProportionalFontSize(10),
        color: EDColors.black
    },
    normalText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16),
        textAlign: "center",
        color: EDColors.white,
        margin: 5
    },
    codeBox: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        textAlign: "center",
        color: EDColors.black,
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        backgroundColor: EDColors.backgroundDark,
        width: widthPercentageToDP("36%"),
        alignSelf: "center",
        borderRadius: 8,
        borderStyle: 'dashed'
    },
    share: {
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        marginTop: 10,
        borderRadius: 8,
        width: widthPercentageToDP("36%"),
        backgroundColor: EDColors.white, borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#C4C4C4'
    },
    valueStyle: {
        borderRadius: 50,
        height: getProportionalFontSize(15),
        width: getProportionalFontSize(15),
        backgroundColor: EDColors.primary,
        color: "#000",
        marginHorizontal: -getProportionalFontSize(10),
        marginBottom: getProportionalFontSize(30),
        alignItems: "center",
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: getProportionalFontSize(12),
        // position: "absolute",


    },
    shareText: { fontSize: getProportionalFontSize(16), color: EDColors.black, fontFamily: EDFonts.semiBold },
    shareView: { justifyContent: "space-between", width: "100%", paddingHorizontal: 5, paddingVertical: getProportionalFontSize(12) },
    clipboardView: { justifyContent: 'space-evenly', width: ' 100%', marginBottom: getProportionalFontSize(15) },
    promoText: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), margin: getProportionalFontSize(10), color: EDColors.black },
    copyText: { marginHorizontal: 5, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(12), margin: 0 },
    numberIcon: { color: 'white', fontSize: getProportionalFontSize(10) },
    shareBtn: { backgroundColor: EDColors.primary, alignSelf: "center", paddingVertical: 10, width: '90%', borderRadius: 16, marginVertical: 12, justifyContent: 'center', alignItems: 'center' },

})
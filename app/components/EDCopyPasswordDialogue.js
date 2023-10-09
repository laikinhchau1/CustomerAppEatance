/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Clipboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast, { DURATION } from "react-native-easy-toast";
import { Icon } from 'react-native-elements';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import {  getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Validations from '../utils/Validations';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';


export default class EDCopyPasswordDialogue extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.validationsHelper = new Validations();
        this.countryCode = this.props.countryCode
    }

    copyToClipboard = () => {
        this.refs.toast.show(strings("copyPassword"), DURATION.LENGTH_SHORT);
        Clipboard.setString(this.props.data.new_password)
        this.props.onDismissHandler()
    }

    render() {
        return (
            <View style={styles.modalContainer} >
                <Toast ref="toast" position="center" fadeInDuration={0} />
                <View style={styles.modalSubContainer}>
                    {/* <EDRTLView style={styles.headerView}> */}
                        <TouchableOpacity onPress={this.props.onDismissHandler} style={[styles.closeOpacityStyle, { alignSelf: isRTLCheck() ? 'flex-start' : 'flex-end' }]}>
                            <Icon
                                name={"close"}
                                size={getProportionalFontSize(20)}
                                color={EDColors.black}
                            />
                        </TouchableOpacity>
                    {/* </EDRTLView> */}
                    <EDRTLView style={styles.headerView}>
                        <EDRTLText style={styles.textStyle} title={this.props.data.message} />
                    </EDRTLView>
                    <EDRTLView style={styles.headerView}>
                        <EDRTLText style={styles.simpleText} title={this.props.data.new_password} />
                    </EDRTLView>
                    <TouchableOpacity onPress={this.copyToClipboard} activeOpacity={1}>
                        <EDRTLView style={styles.clipboardView}>
                            <EDRTLView style={[styles.share]} >
                                <Icon name="hand-pointer-o" type={'font-awesome'} size={15} />
                                <EDRTLText title={strings("tapToCopy")} style={[styles.copyText]} />
                            </EDRTLView>
                        </EDRTLView>
                    </TouchableOpacity>
                   
                    
                </View>
            </View>
        );
    }

   

    copyPasswordHandler = () => {
        this.copyToClipboard(this.state.strForgotPassword)
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: EDColors.transparent,
    },
    simpleText:{ flex: 1, color: EDColors.black , textAlign: 'center' , fontSize : getProportionalFontSize(12) , marginTop: 10} ,
    clipboardView: { justifyContent: 'space-evenly', width: ' 100%', marginBottom: getProportionalFontSize(15) },
    copyText: { marginHorizontal: 5, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(12), margin: 0 },
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
    textStyle:{ flex: 1, color: EDColors.black, textAlign: 'center' },
    modalSubContainer: {
        backgroundColor: EDColors.white,
        padding: 10,
        marginHorizontal: 30,
        borderRadius: 16,
        marginTop: 20,
        marginBottom: 20,
        paddingBottom: 20,
    },
   
    headerView: {
        alignItems: 'center'
    },
   
    closeOpacityStyle: {
        padding: 5
    }
});

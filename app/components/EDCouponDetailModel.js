/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import WebView from 'react-native-webview'
import { EDColors } from '../utils/EDColors'
import { getProportionalFontSize } from '../utils/EDConstants'
import { EDFonts } from '../utils/EDFontConstants'
import metrics from '../utils/metrics'
import EDRTLText from './EDRTLText'
import EDRTLView from './EDRTLView'

export default class EDCouponDetailModel extends React.Component {

    render() {
        return (
             // Vikrant 27-07-21

             <View style={styles.mainView}>
             <View style={styles.modalContainer}>
                 <EDRTLView style={styles.childView}>
                     <EDRTLText style={styles.textStyle}
                         numberOfLines={2}
                         title={this.props.couponName} />
                     <TouchableOpacity onPress={this.props.onDismissHandler}>
                         <Icon
                             name={"close"}
                             size={getProportionalFontSize(18)}
                             color={EDColors.text}
                         />
                     </TouchableOpacity>
                 </EDRTLView>
                 <View style={StyleSheet.webView} />
 
                 <WebView
                     source={this.props.source}
                     startInLoadingState={true}
                     style={styles.webView}
                     scrollEnabled={true}
                 />
             </View>
         </View>
        )
    }
}


const styles = StyleSheet.create({
    modalContainer: {
        height: "50%",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: 10,
        marginHorizontal: 15,
        borderRadius:24,
        marginBottom: 20,
        marginTop: metrics.statusbarHeight,
        paddingHorizontal:15,
    },
    webView: {
        backgroundColor: "#fff",
        alignSelf: "center",
        margin: 10,
        width: Dimensions.get("window").width - 60
    },
    textStyle: { flex: 1, width: metrics.screenWidth * 0.8, fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color: EDColors.black },
    mainView: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
    childView: { alignItems: "center", justifyContent: "space-between", height: metrics.screenHeight * 0.06 , paddingHorizontal:10 , borderBottomWidth:1, borderBottomColor:'#F6F6F6'},
    webView: { height: 1, marginTop: 5 }
})

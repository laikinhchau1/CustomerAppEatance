/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { EDColors } from '../utils/EDColors'
import { getProportionalFontSize } from '../utils/EDConstants'
import { EDFonts } from '../utils/EDFontConstants'
import metrics from '../utils/metrics'
import EDRTLText from './EDRTLText'

export default class EDNotificationModel extends React.Component {
    render() {
        return (
            // Vikrant 27-07-21

            <View style={styles.parentView}>
                <View style={styles.mainView}>
                    <View style={styles.titleText}>
                        <EDRTLText style={styles.titleTextStyle}
                            numberOfLines={2}
                            title={this.props.titleText} />
                        <TouchableOpacity onPress={this.props.dissmissHandler} >
                            <Icon
                                name={"close"}
                                size={getProportionalFontSize(20)}
                                color={EDColors.text}
                                containerStyle={styles.iconStyle}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.seperator} />
                    <ScrollView>
                        <Text style={styles.descText}>
                            {this.props.descriptiontext}
                        </Text>
                    </ScrollView>

                </View>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    mainView: {
        backgroundColor: "#fff",
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 24,
        width: Dimensions.get("window").width - 40,
        height: Dimensions.get("window").height * 0.5,
        marginTop: 20,
        marginBottom: 20
    },
    descText:{ fontSize: getProportionalFontSize(16), margin: 10 },
    seperator: { height: 2, width: "100%", backgroundColor: "#F6F6F6" , marginTop: 5 },
    iconStyle: { marginHorizontal: 10, marginBottom: 5 },
    titleText: { alignItems: 'center', flexDirection: "row", width: "100%", height: metrics.screenHeight * 0.06, justifyContent: "space-between" },
    parentView: { height: "100%", justifyContent: 'center', backgroundColor: "rgba(0,0,0,0.3)", },
    imageView: { height: 15, width: 20, marginHorizontal: 10, marginBottom: 5, resizeMode: "contain" },
    titleTextStyle: { flex: 1, width: metrics.screenWidth * 0.8, fontSize: getProportionalFontSize(20), fontFamily: EDFonts.bold, marginHorizontal: 10, color: EDColors.secondary }
})

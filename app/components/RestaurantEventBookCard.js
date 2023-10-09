import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import Assets from "../assets";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import EDImage from "./EDImage";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import IonIcon from 'react-native-vector-icons/SimpleLineIcons';
import EDText from "./EDText";


export default class RestaurantEventBookCard extends Component {
    state = {
        restObjModel: this.props.restObjModel
    };

    render() {
        // debugLog("SDHOW REVIEW :::::", this.props.isShowReview)
        return (
            //Vikrant 28-07-21
            <TouchableOpacity style={styles.mainView}
                onPress={this.onResPress}
            >
                <View style={styles.mainSubView}>
                    <View style={styles.imageView}>
                        {/* IMAGE VIEW */}
                        <EDImage
                            source={this.state.restObjModel.image}
                            placeholder={Assets.logo}
                            style={styles.imageStyle}
                           

                            resizeMode={"cover"}
                            placeholderResizeMode={"contain"}

                        />
                        {this.props.isShowReview ?
                            this.state.restObjModel.rating != undefined &&
                                this.state.restObjModel.rating != "" ? (

                                // RATING VIEW
                                <View style={[styles.rateView, {
                                    alignSelf: !isRTLCheck() ? 'flex-end' : 'flex-start',
                                }]} >
                                    <EDRTLView style={{ alignItems: 'center', }}>
                                        <Icon name={"grade"} type={'material'}
                                            color={"#FDB200"}
                                            containerStyle={{ alignSelf: 'center' }}
                                            size={getProportionalFontSize(10)}
                                        />
                                        <Text
                                            numberOfLines={1}
                                            style={styles.textStyle}>
                                            {this.state.restObjModel.rating+" ("+ this.state.restObjModel.restaurant_review_count + " " + strings("ratings")+")"} 
                                        </Text>
                                    </EDRTLView>
                                </View>
                            ) : null : null}
                    </View>

                    {/* RES NAME AND ADDRESS */}
                    <View style={styles.subView}>
                        <View style={styles.childView}>
                            <EDRTLText
                                numberOfLines={1}
                                style={styles.resNameStyle}
                                title={this.state.restObjModel.name} />
                            <EDRTLView
                                style={styles.rtlView}>
                                <IonIcon name="location-pin" color={EDColors.black} size={13}></IonIcon>
                                <EDText style={{ marginHorizontal: 0, marginTop: 0 }}
                                    numberOfLines={1}
                                    textStyle={styles.image}
                                    title={this.state.restObjModel.address} />
                            </EDRTLView>

                        </View>
                    </View>

                    {/* BUTTTONS VIEW */}
                    <EDRTLView style={[styles.buttonView, {}]}>
                        <Text style={[styles.openCloseStyle, { color: this.state.restObjModel.timings.closing == "open" ? "green" : "red" }]}>
                            {this.state.restObjModel.timings.closing == "open" ? strings("restaurantOpen") : strings("restaurantClosed")}
                        </Text>
                        <EDRTLView>
                            <Text
                                // numberOfLines={this.props.numberOfLines}
                                style={styles.eventButton}>
                                {strings("book")}
                            </Text>
                        </EDRTLView>
                    </EDRTLView>
                </View>
            </TouchableOpacity>


        );
    }
    onResPress = () => {
        this.props.onPress(this.state.restObjModel);
    }
}


const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: "white",
        borderRadius: 16
    },
    imageStyle: {
        height: "100%",
        alignSelf: "center",
        width: "100%",
        borderRadius: 16
    },
    rateView: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        // height: metrics.screenHeight * 0.03,
        // width: metrics.screenWidth * 0.13,
        paddingHorizontal : 10,
        paddingVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
        position: "absolute",
        right: 15,
        // left : isRTLCheck() ? 15 : '85%' ,
        top: 10,
        borderRadius: 5
    },
    resNameStyle: {
        fontFamily: EDFonts.semiBold, color: EDColors.black, fontSize: getProportionalFontSize(16)
    },
    textStyle: {
        paddingHorizontal: 2,
        color: "#fff",
        textAlign: "center",
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(10.5)
    },
    openCloseStyle: {
        paddingHorizontal: 5,
        overflow: 'hidden',
        paddingVertical: 5,
        borderRadius: 5, fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.bold
    },
    mainSubView: { padding: 5, marginTop: 5 },
    eventButton: { fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semiBold, color: EDColors.black, textDecorationLine: 'underline', paddingHorizontal: 8 },
    imageView: { height: metrics.screenHeight * 0.14, paddingHorizontal: 5 },
    rtlView: { marginTop: 5, alignContent: "center", },
    subView: { flexDirection: "row", marginVertical: 10, paddingHorizontal: 1 },
    childView: { flex: 1, marginHorizontal: 5 },
    image: { flex: 1, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(12), marginHorizontal: 5, color: EDColors.text },
    buttonView: { justifyContent: "space-between", alignItems: "center", paddingVertical: 5, borderTopWidth: 1, borderTopColor: EDColors.radioSelected }
})

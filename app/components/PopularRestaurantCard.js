import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import Assets from "../assets";
import { strings } from '../locales/i18n';
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import EDImage from "./EDImage";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import EDText from "./EDText";

export default class PopularRestaurantCard extends Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(props) {
        this.setState({ restObjModel: props.restObjModel.item });
    }

    state = {
        restObjModel: this.props.restObjModel.item
    };

    render() {
        return (
            <TouchableOpacity
                style={{ flex: 1, marginHorizontal: 5 }}
                activeOpacity={1}
                onPress={this._onModelPressed}>
                <View style={{ margin: 5 }}>
                    <View style={styles.container}>
                        <View>
                            <EDImage
                                source={this.state.restObjModel.image}
                                style={styles.imageStyle}
                                resizeMode={'cover'}
                                placeholder={Assets.logo}
                                placeholderResizeMode={"contain"}
                            />
                            <Text
                                style={[styles.textStyle, {
                                    left: isRTLCheck() ? null : 10,
                                    right: isRTLCheck() ? 10 : null,
                                    backgroundColor :this.state.restObjModel.timings !== undefined && this.state.restObjModel.timings !== null && this.state.restObjModel.timings.closing !== undefined && this.state.restObjModel.timings.closing.toLowerCase() === "open" ? 
                                    EDColors.open : EDColors.error
                                }]}>
                                {this.state.restObjModel.timings !== undefined && this.state.restObjModel.timings !== null && this.state.restObjModel.timings.closing !== undefined && this.state.restObjModel.timings.closing.toLowerCase() === "open" ? strings("restaurantOpen") : strings("restaurantClosed")}
                            </Text>
                            <EDRTLView style={[styles.distanceContainer, {
                                alignSelf: isRTLCheck() ? 'flex-start' : 'flex-end',
                                borderTopLeftRadius: isRTLCheck() ? 0 : 5, borderTopRightRadius: isRTLCheck() ? 5 : 0,
                                overflow: 'hidden'
                            }]}>
                                <Icon name="motorcycle" type={"font-awesome-5"} color={EDColors.white} size={getProportionalFontSize(15)} />
                                <EDRTLText title={parseFloat(this.state.restObjModel.distance).toFixed(2) + " Miles"} style={styles.newText} />

                            </EDRTLView>
                        </View>
                        <View style={styles.mainView}>
                            <EDRTLView style={{ justifyContent: "space-between", flex: 4 }}>
                                <EDText style={{ marginHorizontal: 0, marginTop: 0, flex: 3 }}
                                    textStyle={{ fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(16) }}
                                    title={this.state.restObjModel.name} />
                                {this.props.isShowReview ?
                                    <View style={{}}>
                                        <View style={styles.reviewContainer}>

                                            {this.state.restObjModel.rating != null &&
                                                this.state.restObjModel.rating > 0 ?
                                                <EDRTLView style={styles.centerView}>
                                                    <Icon name={"star"} type="ant-design" color={EDColors.white} size={getProportionalFontSize(10)} />
                                                    <EDRTLText title={this.state.restObjModel.rating + " (" + this.state.restObjModel.restaurant_review_count + " " + strings("ratings") + ")"} style={styles.newText} />
                                                </EDRTLView> :
                                                <View>
                                                    <EDRTLText title={strings("homeNew")} style={[styles.newText, { fontSize: getProportionalFontSize(11), padding: 1 }]} />
                                                </View>
                                            }
                                        </View>
                                    </View>
                                    : null}
                            </EDRTLView>

                            <EDRTLView
                                style={styles.rtlView}>
                                <Icon name={"location-pin"} type="simple-line-icon" color={EDColors.text} size={getProportionalFontSize(15)} />
                                <EDRTLText style={styles.addressStyle}
                                    numberOfLines={1}
                                    title={this.state.restObjModel.address} />
                            </EDRTLView>

                            <EDRTLView style={styles.ratingStyle}>
                                {/* <EDRTLView
                                    style={{ alignContent: "center" }}>
                                    <Icon name={"route"} color={EDColors.text} size={13} />
                                    <EDText style={{ marginHorizontal: 0, marginTop: 0, }}
                                        numberOfLines={1}
                                        textStyle={styles.addressStyle}
                                        title={parseFloat(this.state.restObjModel.distance).toFixed(2) + " KM"} />
                                </EDRTLView> */}


                            </EDRTLView>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    _onModelPressed = () => {
        this.props.onPress(this.state.restObjModel)
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,

        elevation: 1,
        marginHorizontal: 5
    },
    centerView: { justifyContent: 'center', alignItems: 'center' },
    imageStyle: { width: "100%", height: metrics.screenHeight * 0.2, alignSelf: "center" },
    textStyle: {
        marginHorizontal: 5.5,
        fontSize: getProportionalFontSize(13),
        paddingHorizontal: 10,
        paddingVertical: 5,
        overflow: 'hidden',
        padding: 5,
        textAlignVertical: 'center',
        fontFamily: EDFonts.medium,
        color: EDColors.white,
        position: "absolute",
        top: 10,
        alignSelf: "flex-end",
        borderRadius: 5,
    },
    newText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(12),
        // textAlign: 'center',
        // alignSelf: 'center',
        // textAlignVertical: 'center',
        color: EDColors.white,
        paddingHorizontal: 5,
    },
    reviewContainer: {
        padding: 5,
        backgroundColor: EDColors.grayNew,
        borderRadius: 4,
        // marginBottom: 2.5,
        justifyContent: 'center'
        // maxHeight: 25
    },
    distanceContainer: {
        backgroundColor: EDColors.distance,
        position: "absolute",
        bottom: 0,
        padding: 5,
        alignItems: 'center'
    },
    rtlView: { marginTop: 2.5 },
    mainView: { marginHorizontal: 12.5, marginTop: 10 },
    ratingStyle: { marginTop: 3, marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' },
    addressStyle: {
        marginHorizontal: 5,
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.regular,
        maxWidth: metrics.screenWidth * .85
    }
})

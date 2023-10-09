import React from "react";
import { Linking, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import StarRating from "react-native-star-rating";
import { SvgXml } from "react-native-svg";
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { strings } from "../locales/i18n";
import { showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { direction_icon } from "../utils/EDSvgIcons";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import EDText from "./EDText";

export default class RestaurantOverview extends React.PureComponent {
    render() {
        return (
            <View style={style.container}>
                <EDRTLView style={style.resHeaderStyle}>



                    {/* PHONE NUMBER */}
                    <TouchableOpacity style={[style.callbuttonStyle]} onPress={this.onCallPressed}  >
                        <Icon
                            name="call-outline"
                            style={[style.iconStyle, { backgroundColor: EDColors.primary, borderColor: EDColors.primary }]}
                            color={EDColors.white}
                            size={getProportionalFontSize(25)}
                            type={"ionicon"}
                        />
                    </TouchableOpacity>

                    {/* ADDRESS */}
                    <TouchableOpacity style={[style.iconStyle, { marginTop: 5 }]} onPress={this.onAddressPressed} activeOpacity={1}>
                        {/* <Icon
                        name="directions"
                        style={style.iconStyle}
                        color={EDColors.primary}
                        size={25}
                        type={"font-awesome-5"}
                    /> */}
                        <SvgXml xml={direction_icon} width={20} height={20} />

                    </TouchableOpacity>

                    {this.props.showRestReview ?
                        <TouchableOpacity style={[style.iconStyle, { marginTop: 5 }]} onPress={() => this.props.onButtonClick(this.props.item)} activeOpacity={1}>
                            <Icon
                                name="people-outline"
                                style={[style.iconStyle]}
                                color={EDColors.black}
                                size={getProportionalFontSize(27)}
                            // type={"feather"}
                            />
                        </TouchableOpacity> : null
                    }


                </EDRTLView>

                <View style={style.mainView}>
                    <EDText
                        style={{ marginHorizontal: 0, marginTop: 0 }}
                        textStyle={style.itemName}
                        numberOfLines={3}
                        title={this.props.item.name} />

                    <EDRTLView style={style.addressView}>
                        <EDRTLView style={{ flex: .95}}>
                            <SimpleLineIcons name="location-pin" color={EDColors.text} size={15} />
                            <EDRTLText style={{ marginHorizontal: 3, marginTop: 0 }}
                                numberOfLines={2}
                                textStyle={style.txtStyle}
                                title={this.props.item.address} />
                        </EDRTLView>
                        {/* <EDRTLView style={style.clockView}>
                            <Icon name="clockcircleo" color={EDColors.text} style={{ marginHorizontal: 3 }} size={getProportionalFontSize(13)} type={'ant-design'} />
                            <EDRTLText style={{ marginTop: 0 }}
                                numberOfLines={1}
                                textStyle={style.txtStyle}
                                title={this.props.item.timings !== undefined && this.props.item.timings !== null && this.props.item.timings.open != "" && this.props.item.timings.close != "" ? this.props.item.timings.open + "-" + this.props.item.timings.close : strings("closeForDay")}
                            />
                        </EDRTLView> */}
                    </EDRTLView>

                </View>
                <EDRTLView  style={style.rtlView}>
                {this.props.isShow?
                this.props.rating !== undefined && this.props.rating !== null && this.props.rating !== "" && this.props.rating !== '0.0' ?

                    <EDRTLView style={{ alignItems: "center", marginTop: 5 }}>
                        <StarRating
                            disabled={true}
                            starSize={getProportionalFontSize(18)}
                            maxStars={5}
                            emptyStarColor={EDColors.emptyStar}
                            containerStyle={style.ratingStyle}
                            fullStarColor={EDColors.fullStar}
                            rating={parseFloat(this.props.rating)}
                            fullStar={'star'}
                            emptyStar={'star'}
                            iconSet={'FontAwesome'}
                        />
                        <EDRTLText title={" " + this.props.total_reviews + " " + strings("ratings")} style={style.ratingText} />
                    </EDRTLView> : null
               :null }
                <EDRTLView style={style.clockView}>
                            <Icon name="clockcircleo" color={EDColors.text} style={{ marginHorizontal: 3 }} size={getProportionalFontSize(13)} type={'ant-design'} />
                            <EDRTLText style={{ marginTop: 0 }}
                                numberOfLines={1}
                                textStyle={style.txtStyle}
                                title={this.props.item.timings !== undefined && this.props.item.timings !== null && this.props.item.timings.open != "" && this.props.item.timings.close != "" ? this.props.item.timings.open + "-" + this.props.item.timings.close : strings("closeForDay")}
                            />
                        </EDRTLView>
                </EDRTLView>
            </View>

        );
    }
    onCallPressed = () => {
        var telStr = `tel:${this.props.item.phone_number}`
        if (Linking.canOpenURL(telStr)) {
            Linking.openURL(telStr).catch((error) => showValidationAlert(strings("callNotSupport")))
        } else {
            showValidationAlert(strings("callNotSupport"))
        }
    }

    onAddressPressed = () => {
        var mapString = Platform.OS == "ios" ? 'maps' + ':0,0?q=' + this.props.item.address : 'geo' + ':0,0?q=' + this.props.item.address
        if (Linking.canOpenURL(mapString)) {
            Linking.openURL(mapString).catch((error) => showValidationAlert(strings("canNotLoadDirections")))
        } else {
            showValidationAlert(strings("canNotLoadDirections"))
        }

    }
}

export const style = StyleSheet.create({
    container: {
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 8,
        paddingRight: 8,
        // backgroundColor: "#fff",
        borderRadius: 6,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.8,
        // shadowRadius: 2,
        margin: 8,
        // height: metrics.screenHeight * 0.19,
        // justifyContent: 'center',
    },
    button: {
        borderRadius: 6,
        backgroundColor: EDColors.primary,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 20,
        paddingRight: 20,
        alignSelf: "center",
        justifyContent: "center",
        marginTop: 10,
        alignItems: "center"
    },
    clockView: {  alignContent: "center", alignItems: 'center', marginTop: 5 },
    rtlView: { alignContent: "center", flex: 1, alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
    addressView: { alignContent: "center", flex: 1, alignItems: 'center', marginTop: 3 },
    resHeaderStyle: { width: '100%', marginBottom: 10, justifyContent: 'flex-end' },
    callbuttonStyle: {
        marginTop: 5,
        // width:40,
        // height:40,
        // backgroundColor:EDColors.primary
    },
    txtStyle: { fontSize: getProportionalFontSize(12), textAlignVertical: 'center', overflow: 'hidden', fontFamily: EDFonts.regular, color: EDColors.text },
   
    itemName: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(22) },
    mainView: { flex: 1, borderBottomColor: '#EDEDED', marginTop: 10, justifyContent: "space-around" },
    iconStyle: { width: 45, height: 45, borderWidth: 1, borderColor: EDColors.separatorColorNew, backgroundColor: EDColors.white, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5, alignSelf: 'center', alignContent: "center" }
    , commentIconStyle: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5, alignSelf: 'center', backgroundColor: EDColors.primary, paddingLeft: 8, paddingTop: 6 },
    ratingText :{
        fontSize : getProportionalFontSize(12),
        fontFamily : EDFonts.regular,
        color : EDColors.textNew
    }
});


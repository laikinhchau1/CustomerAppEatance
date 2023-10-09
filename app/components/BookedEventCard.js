import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Assets from "../assets";
import { Icon } from "react-native-elements";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { funGetDateStr, funGetTimeStr, getProportionalFontSize, capiString, isRTLCheck, boldify, funGetFrench_Curr } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import TextViewLeftImage from "./TextViewLeftImage";

export default class BookedEventCard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.isCancel = false
    }

    state = {
        isCancel: false
    }
    componentDidMount() {
        if (this.props.is_table == 0) {
            this.setState({ isCancel: this.props.item.event_status_key !== undefined && this.props.item.event_status_key !== null && this.props.item.event_status_key == "cancel" ? true : false })
        } else {
            this.setState({ isCancel: this.props.item.booking_status_key !== undefined && this.props.item.booking_status_key !== null && this.props.item.booking_status_key == "cancelled" ? true : false })
        }

    }

    render() {
        return (
            <View style={style.container}>
                <EDRTLView style={style.detailView}>
                <EDRTLView>
                    <EDRTLText style={style.dateText}
                        title={funGetDateStr(this.props.createdDate + "", "MMM DD, YYYY") } />
                    <EDRTLText style={style.dateText}
                        title={strings("at") } />
                   <EDRTLText style={style.dateText}
                        title={funGetTimeStr(this.props.createdDate + "", "hh:mm A")} />
                   </EDRTLView>
                    <EDRTLText style={[style.dateText, { color: EDColors.black, fontFamily: EDFonts.semiBold }]}
                        title={this.props.is_table == 0 ? strings("eventTitle") : strings("tableBooking")} />
                </EDRTLView>
                <EDRTLView style={style.subContainer}>

                    <View style={style.detail}>

                        <EDRTLText style={style.detailName} title={this.props.RestaurantName} />


                        <TextViewLeftImage
                            isIcon={true}
                            size={getProportionalFontSize(14)}
                            color={EDColors.black}
                            icon={"location-pin"}
                            type={'simple-line-icon'}
                            title={this.props.address}
                            textStyle={[style.iconText]}
                            style={style.iconStyle}
                        />
                        <TextViewLeftImage
                            isIcon={true}
                            size={getProportionalFontSize(15)}
                            color={EDColors.black}
                            icon={"person-outline"}
                            // type={ 'simple-line-icon'}
                            title={this.props.people + " " + strings("peopleTitle")}
                            textStyle={style.iconText}
                            style={style.iconStyle}
                            lines={0}
                        />

                        <TextViewLeftImage
                            isIcon={true}
                            size={getProportionalFontSize(13)}
                            color={EDColors.black}
                            icon={"calendar"}
                            type={'ant-design'}
                            title={strings('bookingDate') + ": " + funGetDateStr(this.props.timing + "", "MMM DD, YYYY")}
                            textStyle={style.iconText}
                            style={[style.iconStyle, { marginHorizontal: 2 }]}
                        />

                        {this.props.is_table == 1 && this.props.startTime !== null && this.props.endTime !== null && this.props.startTime !== undefined && this.props.endTime !== undefined ?
                            <EDRTLView style={style.centerView}>
                                <Icon name="clockcircleo" color={EDColors.black} size={getProportionalFontSize(13)} type={'ant-design'} />
                                <EDRTLView style={style.timeStyle}>
                                    <Text style={style.iconText}>
                                        {isRTLCheck() ? this.props.startTime + " :" + strings('start') : strings('start') + ": " + this.props.startTime} </Text>
                                    <Text style={style.iconText}>
                                        {isRTLCheck() ? this.props.endTime + " :" + strings('end') : strings('end') + ": " + this.props.endTime} </Text>
                                </EDRTLView>
                            </EDRTLView>
                            : null}
                        {this.props.is_table == 0 && this.props.eventTime !== null && this.props.eventTime !== null ?
                            <TextViewLeftImage
                                isIcon={true}
                                size={getProportionalFontSize(13)}
                                color={EDColors.black}
                                icon={"clockcircleo"}
                                type={'ant-design'}
                                title={isRTLCheck() ? funGetTimeStr(this.props.timing + "", "hh:mm A") + " :" + strings('bookingTime') : strings('bookingTime') + ": " + funGetTimeStr(this.props.timing + "", "hh:mm A")}
                                textStyle={style.iconText}
                                style={[style.iconStyle, { marginHorizontal: 2 }]}
                            />
                            : null}


                    </View>

                    <Image style={style.image}
                        source={this.props.pkgImage !== "" && this.props.pkgImage !== null ? { uri: this.props.pkgImage } : Assets.user_placeholder} />

                </EDRTLView>

                {this.props.additional_request !== undefined && this.props.additional_request !== null && this.props.additional_request.trim() !== '' ?
                    <EDRTLView style={style.commentView}>
                        <EDRTLText style={style.iconText}
                            title={strings("orderComment") + ": " + this.props.additional_request} />
                    </EDRTLView>
                    : null}

                <View style={style.separator} />
                {this.props.item.package_name !== undefined &&
                    this.props.item.package_name !== null &&
                    this.props.item.package_name !== "" ?

                    <EDRTLView
                        style={[style.textImageStyle, { paddingBottom: 0 }]}
                    >
                        <Text style={[style.pkgText, { textAlign: isRTLCheck() ? 'right' : 'left', color: EDColors.blackSecondary }]} >
                            {this.props.item.package_name}
                        </Text>

                        <Text style={[style.pkgText, { textAlign: !isRTLCheck() ? 'right' : 'left', color: EDColors.blackSecondary }]} >
                            {this.props.item.currency_symbol + funGetFrench_Curr(this.props.item.package_price, 1, this.props.lan)}
                        </Text>


                    </EDRTLView> : null}
                <EDRTLView
                    style={style.textImageStyle}
                >
                    <Text style={[style.pkgText, { textAlign: isRTLCheck() ? 'right' : 'left', color: EDColors.blackSecondary }]} >
                        {strings("bookingStatus")}
                    </Text>

                    <Text style={[style.pkgText, { textAlign: !isRTLCheck() ? 'right' : 'left', color: this.state.isCancel ? "red" : "#189652" }]} >
                        {this.props.is_table == 0 ? capiString(this.props.item.event_status) : capiString(this.props.item.booking_status)}
                    </Text>


                </EDRTLView>
            </View>



        );
    }
}


export const style = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1,
        shadowColor: EDColors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        margin: 5,
        marginTop: 7,
        borderRadius: 16
    },
    commentView: { marginHorizontal: 15, marginBottom: 8, marginTop: 3 },
    subContainer: { paddingHorizontal: 5, },
    separator: { width: '100%', height: 1, backgroundColor: "#F6F6F6" },
    image: {
        width: metrics.screenWidth * 0.24,
        height: metrics.screenHeight * 0.12,
        margin: 5,
        borderRadius: 8
    },
    centerView: { alignItems: 'center', justifyContent: 'center', marginHorizontal: 2, marginTop: 1 },
    dateText: { fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(12), marginHorizontal: 2, color: '#666666' },
    iconText: { fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(12), color: '#666666' },
    iconStyle: { marginVertical: 3, paddingHorizontal: 0 },
    detail: {
        flex: 4,
        marginHorizontal: 6,
        marginBottom: 5,
        // alignSelf: "center",
        justifyContent: 'space-evenly',
        alignContent: "center"
    },
    detailView: {
        flex: 4,
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 5,
        // alignSelf: "center",
        justifyContent: 'space-between',
        alignContent: "center"
    },
    timeStyle: {
        justifyContent: 'space-between',
        alignContent: "center",
        marginVertical: 3,
        flex: 1,
        marginHorizontal: 5
    },
    detailName: {
        color: EDColors.black,
        fontSize: getProportionalFontSize(16),
        // marginTop: 4,
        fontFamily: EDFonts.semiBold,
        marginHorizontal: 2,

    },
    textImageStyle: {
        flex: 1,
        paddingHorizontal: 15,
        paddingBottom: 10,
        // flexDirection: "row",
        alignContent: "center",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        // backgroundColor: EDColors.primary,
        paddingTop: 5
    },
    pkgText: {
        fontFamily: EDFonts.semiBold,
        color: "#189652",
        fontSize: getProportionalFontSize(12),
        flex: 1,
    }
});



import React from "react";
import { Dimensions, Linking, StyleSheet, Image, View, SafeAreaView } from "react-native";
import { Icon } from "react-native-elements";
import MapView, { Callout, Marker, Polyline } from 'react-native-maps';
import { connect } from "react-redux";
import Assets from "../assets";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import MyCustomCallout from "../components/MyCustomCallout";
import { strings } from "../locales/i18n";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { showDialogue, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { capiString, debugLog, DISTANCE_IN_MILES, funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import { driverTrackingAPI, getTrackTime } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import EDButton from "../components/EDButton";
import EDPopupView from "../components/EDPopupView";
import { TouchableOpacity } from "react-native";

let { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE = 23.079460;
const LONGITUDE = 72.506218;
const LATITUDE_DELTA = 0.015;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);
var timer;


class TrackOrderContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.trackOrderDict = this.props.navigation.state.params.trackOrder
    }

    watchId = null;

    /** STATE */
    state = {
        isLoading: false,
        selectedIndex: 0,
        key: 1,
        isEnable: false,
        isPickup: false,
        curr_latitude: 23.079460,
        curr_longitude: 72.506218,
        dest_latitude: 0.0,
        dest_longitude: 0.0,
        driver_latitude: 0.0,
        driver_longitude: 0.0,
        rest_latitude: 0.0,
        rest_longitude: 0.0,
        region: {
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        },
        distance: 0,
        coords: {},
        orderPopup: false,
        isFirstLoad: false
    };

    arrayUpcoming = [];

    /** DID MOUNT */
    componentDidMount() {
        if (this.state.isFirstLoad == false)
            this.setState({ isLoading: true })

        this.state.driver_latitude = parseFloat(this.trackOrderDict.driver.latitude),
            this.state.driver_longitude = parseFloat(this.trackOrderDict.driver.longitude)
        this.state.rest_latitude = parseFloat(this.trackOrderDict.resLat),
            this.state.rest_longitude = parseFloat(this.trackOrderDict.resLong)
        this.state.dest_latitude = parseFloat(this.trackOrderDict.user_latitude)
        this.state.dest_longitude = parseFloat(this.trackOrderDict.user_longitude)

        this.trackArrivalTime(this.state.dest_latitude, this.state.dest_longitude, this.state.rest_latitude, this.state.rest_longitude)

        timer = setInterval(this.driverTracking, 10000)
    }

    /** WILL UNMOUNT */
    componentWillUnmount() {
        clearInterval(timer)
    }

    /** RENDER METHOD */
    render() {
        return (
            <BaseContainer
                title={this.trackOrderDict.order_id !== undefined && this.trackOrderDict.order_id !== '' ? (strings("trackOrder") + " #" + this.trackOrderDict.order_id) : strings("trackOrder")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onBackEventHandler}
                loading={this.state.isLoading}
            >

                <SafeAreaView style={{ flex: 1, backgroundColor: EDColors.white }}>
                    {/* MAP VIEW */}
                    <MapView style={styles.mapView}
                        region={{
                            latitude: this.state.driver_latitude,
                            longitude: this.state.driver_longitude,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA
                        }}
                    >
                        {/* MARKER LAT AND LONG */}
                        <Marker
                            coordinate={{ latitude: this.state.dest_latitude, longitude: this.state.dest_longitude }}
                            image={Assets.destination}
                        />

                        {/* MARKER WITH LABEL */}
                        {this.state.driver_latitude !== 0 ?
                            <Marker
                                coordinate={{ latitude: this.state.driver_latitude, longitude: this.state.driver_longitude }}
                                image={Assets.driver}>
                                <Callout>
                                    {this.trackOrderDict.driver !== undefined ?
                                        <MyCustomCallout
                                            title={this.trackOrderDict.driver.first_name}
                                            discription={this.state.distance}
                                            image={{ uri: this.trackOrderDict.driver.image }}
                                        /> : null}
                                </Callout>
                            </Marker>
                            : null}

                        {/* POLYLINE */}
                        {this.state.rest_latitude !== 0.0 && this.state.distance !== 0 ?
                            <Polyline
                                coordinates={[...this.state.coords,]}
                                strokeColor={EDColors.primary}
                                strokeWidth={2}
                                geodesic={true}
                            />
                            : null}

                        {/* RES MARKER */}
                        {this.state.rest_latitude !== 0 ?
                            <Marker
                                coordinate={{ latitude: this.state.rest_latitude, longitude: this.state.rest_longitude }}
                                image={Assets.restaurant}>
                            </Marker>
                            : null}
                    </MapView>


                    <View style={styles.mainView}>



                        <EDRTLView style={styles.bottomView}>

                            <EDRTLText title={(this.trackOrderDict.order_type == "cod" ? capiString(strings("payAmount")) : capiString(strings("paidAmount")) + " - ") + this.trackOrderDict.currency_symbol + funGetFrench_Curr(this.trackOrderDict.total, 1, this.trackOrderDict.currency_symbol)}
                                style={[styles.address, { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), flex: 1, color: EDColors.black }]} />
                            <EDButton label={strings("viewDetails")}
                                onPress={this.expandSheet}
                                textStyle={styles.viewBtnText}
                                style={[styles.acceptButton, { flexDirection: isRTLCheck ? "row-reverse" : "row" }]}
                                icon="expand-more"
                            />
                        </EDRTLView>
                        {this.renderOrderDetails()}

                    </View>
                </SafeAreaView>
            </BaseContainer>
        )
    }
    //#endregion

    expandSheet = () => {
        // this.RBSheet.open()
        this.setState({ orderPopup: true })
    }

    dismissOrderDetails = () => {
        this.setState({ orderPopup: false })
    }

    renderOrderDetails = () => {
        return (
            <EDPopupView isModalVisible={this.state.orderPopup}
                onRequestClose={this.dismissOrderDetails}
            >

                <TouchableOpacity style={{ flex: 1 }} onPress={this.dismissOrderDetails} />
                <View style={styles.detailContainer}>
                    <EDRTLView style={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginHorizontal: 20,
                        marginTop: 15,
                    }}>
                        <Icon name={"close"} size={getProportionalFontSize(23)} color={EDColors.transparent} />
                        <EDButton style={styles.dismissBtn} onPress={this.dismissOrderDetails} />
                        <Icon name={"close"} size={getProportionalFontSize(23)} color={EDColors.blackSecondary} onPress={this.dismissOrderDetails} />
                    </EDRTLView>
                    <View style={{ margin: 20 }}>

                        <EDRTLView style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <EDRTLView style={{ alignItems: 'center', flex: 1 }}>
                                <Image style={styles.orderImageView}
                                    source={
                                        this.trackOrderDict.driver.image !== undefined &&
                                            this.trackOrderDict.driver.image !== null
                                            ? { uri: this.trackOrderDict.driver.image }
                                            : Assets.user_placeholder}
                                />
                                <EDRTLText title={(this.trackOrderDict.driver.first_name + " ") + (this.trackOrderDict.driver.last_name !== undefined &&
                                    this.trackOrderDict.driver.last_name !== null ? this.trackOrderDict.driver.last_name : '')
                                    + " " + strings("isValet")} style={[styles.popupName, { flex: 1 }]} />
                            </EDRTLView>
                            <Icon reverse raised
                                size={getProportionalFontSize(13)}
                                name={'call-outline'}
                                type="ionicon"
                                color={EDColors.primary}
                                onPress={this.connectToDriverCall}
                            />
                        </EDRTLView>
                        {this.trackOrderDict.driver.driver_temperature !== undefined && this.trackOrderDict.driver.driver_temperature !== null &&
                            this.trackOrderDict.driver.driver_temperature.trim().length !== 0 ?
                            <View>
                                <View style={styles.separator} />
                                <EDRTLText title={strings("temperature")+ this.trackOrderDict.driver.driver_temperature} style={styles.temperature} />
                            </View> : null}
                    </View>
                    <View style={styles.sepratorView} />
                    <EDRTLView style={{ alignItems: 'center', justifyContent: 'space-between', margin: 20 }}>
                        <EDRTLView style={{ alignItems: 'center', flex: 1 }}>
                            <Image style={styles.orderImageView}
                                source={
                                    this.trackOrderDict.driver.restaurant_image !== undefined &&
                                        this.trackOrderDict.driver.restaurant_image !== null
                                        ? { uri: this.trackOrderDict.driver.restaurant_image }
                                        : Assets.user_placeholder}
                            />
                            <View style={{ flex: 1 }}>
                                <EDRTLText title={this.trackOrderDict.restaurant_name} style={styles.popupName} />
                                <EDRTLText title={this.trackOrderDict.restaurant_address} style={[styles.address]} />
                            </View>
                        </EDRTLView>
                        <Icon reverse raised
                            size={getProportionalFontSize(13)}
                            name={'call-outline'}
                            type="ionicon"
                            color={EDColors.primary}
                            onPress={this.buttonCallPressed}
                        />
                    </EDRTLView>
                    <View style={[styles.separator, { marginHorizontal: 20 }]} />

                    <EDRTLView style={styles.bottomView}>

                        <EDRTLText title={(this.trackOrderDict.order_type == "cod" ? capiString(strings("payAmount")) : capiString(strings("paidAmount")) + " - ") + this.trackOrderDict.currency_symbol + funGetFrench_Curr(this.trackOrderDict.total, 1, this.trackOrderDict.currency_symbol)}
                            style={[styles.address, { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), flex: 1, color: EDColors.black }]} />
                        <EDButton label={strings("viewDetails")}
                            onPress={this.onViewEventHandler}
                            textStyle={styles.viewBtnText}
                            style={[styles.acceptButton, { flexDirection: isRTLCheck ? "row-reverse" : "row" }]}
                        />
                    </EDRTLView>
                </View>
            </EDPopupView>
        )
    }

    //#region 
    /** BACK EVENT HANDLER */
    onBackEventHandler = () => {
        this.props.navigation.goBack();
    }
    //#endregion

    //#region 
    /** CALL DRIVER */
    connectToDriverCall = () => {
        this.trackOrderDict.driver !== undefined ? this.connectToCall(this.trackOrderDict.driver.mobile_number) : showDialogue(strings('callNotSupport'))
    }
    //#endregion

    buttonCallPressed = () => {
        this.trackOrderDict.restaurant_phone_number !== undefined ? this.connectToCall(this.trackOrderDict.restaurant_phone_number) : showDialogue(strings("callNotSupport"))
    }

    //#region 
    /** VIEW BUTTON EVENT */
    onViewEventHandler = () => {
        clearInterval(timer)
        this.setState({ orderPopup: false })
        this.props.navigation.navigate("OrderDetailContainer", {
            OrderItem: this.trackOrderDict,
            track: true
        })
    }
    //#endregion

    //#region 
    /**
     * @param { Success Response Object } onSuccess
     */
    onSuccessDriverTracking = (onSuccess) => {
        this.driverLatlong = onSuccess.detail
        this.trackArrivalTime(this.state.dest_latitude, this.state.dest_longitude, parseFloat(this.driverLatlong.driverLatitude), parseFloat(this.driverLatlong.driverLongitude))
        this.setState({
            driver_latitude: parseFloat(this.driverLatlong.driverLatitude),
            driver_longitude: parseFloat(this.driverLatlong.driverLongitude)
        })
    }

    /**
     * @param { Failure Response object } onFailure
     */
    onFailureDrivertracking = (onFailure) => { }

    // CALL API
    driverTracking = () => {
        let param = {
            // token: this.props.token,
            user_id: this.props.userID,
            order_id: this.trackOrderDict.order_id
        }
        driverTrackingAPI(param, this.onSuccessDriverTracking, this.onFailureDrivertracking, this.props)
    }
    //#endregion


    //#region 
    /**
     * @param { Success Response Objwct } onSuccess
     */
    onSuccessETA = (onSuccess) => {
        var routesArray = onSuccess.routes
        if (routesArray.length > 0) {
            var legsArray = onSuccess.routes[0].legs
            if (!this.state.isPickup) {
                if (legsArray.length > 0) {
                    this.setState({
                        isPickup: true,
                        isLoading: false,
                        distance: legsArray[0].duration.text,
                        coords: this.decode(onSuccess.routes[0].overview_polyline.points),
                        isFirstLoad: true
                    })
                    console.log("ARRAY OF LAT LONG :::::::::: ", this.decode(onSuccess.routes[0].overview_polyline.points))
                }
            } else {
                if (legsArray.length > 0) {
                    onSuccess.routes[0].legs[0].duration.text
                }
            }

        }
    }

    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureETA = (onFailure) => {
        console.log("Destination Failure ::::::: ", onFailure)
    }

    /** TRACK ETA */
    trackArrivalTime = (sourceLat, sourcelong, destinationLat, destinationlong) => {
        if (sourceLat !== null && sourcelong !== null && destinationLat !== null && destinationlong !== null) {
            let arrival = `https://maps.googleapis.com/maps/api/directions/json?origin=${[sourceLat, sourcelong]}&destination=${[destinationLat, destinationlong]}&key=${this.props.googleMapKey}&units=${DISTANCE_IN_MILES ? "imperial" : "metrics"}`
            getTrackTime(arrival, this.onSuccessETA, this.onFailureETA, this.props)
        }
    }
    //#endregion

    //#region 
    /** DECODE POSITION LAT LONG */
    decode = (t, e) => { for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5); u < t.length;) { a = null, h = 0, i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o, d.push([l / c, r / c]) } return d = d.map(function (t) { return { latitude: t[0], longitude: t[1] } }) }
    //#endregion


    //#endregion
    /** CALLING FUNCTION */
    connectToCall = (calls) => {
        let strLinkToOpen = "tel:" + calls;
        // Linking.canOpenURL(strLinkToOpen).then(supported => {
        //     debugLog("SUPPORTED LLLLL", supported)
        //     if (!supported) {
        //         showValidationAlert(strings("callNotSupport"));
        //     } else {
                return Linking.openURL(strLinkToOpen).catch(err => {
                    showValidationAlert("SOS CALL ERROR " + err);
                });
        //     }
        // });
    };
    //#endregion
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: EDColors.white
    },
    bottomView: {
        backgroundColor: EDColors.white,
        padding: 10,
        alignItems: "center",
        justifyContent: "space-between",
    },
    acceptButton: {
        backgroundColor: EDColors.primary,
        justifyContent: "center",
        marginHorizontal: 0,
        paddingVertical: 15
    },
    text: {
        color: EDColors.primary,
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(13),
    },
    viewBtnText: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        marginHorizontal: 5
    },
    mainView: {
    },
    mapView: { flex: 1, width: metrics.screenWidth, alignSelf: 'center' },
    sepratorView: { backgroundColor: EDColors.offWhite, height: 8, width: "100%" },
    separator: {
        height: 1,
        backgroundColor: EDColors.offWhite,
        marginVertical: 7.5
    },
    popupName: {
        color: EDColors.black,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(14),
        // flex: 1,
        marginHorizontal: 10
    },
    address: {
        color: EDColors.blackSecondary,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(12),
        marginTop: 2.5,
        marginHorizontal: 10,

    },
    orderImageView: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        borderColor: EDColors.separatorColorNew,
        borderWidth: 1

    },
    detailContainer: {
        backgroundColor: EDColors.white,
        borderRadius: 25
    },
    dismissBtn: {
        height: 4,
        padding: 0,
        width: "25%",
        alignSelf: "center",
        backgroundColor: EDColors.separatorColorNew
    },
    temperature: {
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(12),
        // flex: 1,
        color: EDColors.blackSecondary,
        marginVertical: 10
    }
})

export default connect(
    state => {
        return {
            titleSelected: state.navigationReducer.selectedItem,
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            googleMapKey: state.userOperations.googleMapKey
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            }
        };
    }
)(TrackOrderContainer);
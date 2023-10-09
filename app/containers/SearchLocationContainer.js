import React from "react";
import { FlatList, Linking, Platform, StyleSheet, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { PERMISSIONS } from "react-native-permissions";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import AddressComponent from "../components/AddressComponent";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import { strings } from "../locales/i18n";
import { saveCurrentLocation } from "../redux/actions/User";
import { showDialogue, showNoInternetAlert, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { debugLog, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, GOOGLE_API_KEY } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { checkPermission } from "../utils/PermissionServices";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { deleteAddress, getAddress } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";

class SearchLocationContainer extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';

        this.state = {
            isLoading: false,
            addressLine1: "",
            addressLine2: "",
            latitude: 0.0,
            longitude: 0.0,
            city: "",
            zipCode: "",
            addressId: "",
            selectedIndex: -1,
            sendLocationDetailsBack: this.props.navigation !== undefined && this.props.navigation.state !== undefined && this.props.navigation.state.params !== undefined ?
                this.props.navigation.state.params.getNewLocation : undefined,
        };
    }

    /** RENDER METHOD */
    render() {
        return (
            <BaseContainer
                title={strings("changeLocation")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onBackEventHandler}
                loading={this.state.isLoading}
                onConnectionChangeHandler={this.getAddressList}>

                {/* MAIN VIEW */}
                <View pointerEvents={this.state.isLoading ? "none" : 'auto'} style={{ flex: 1 }}>

                    {/* NAVIGATION EVENTS */}
                    <NavigationEvents onDidFocus={this.getAddressList} />

                    {/* GOOGLE PLACES SEARCH */}
                    <GooglePlacesAutocomplete
                        placeholder={strings("searchLocation")}
                        minLength={2}
                        autoFocus={true}
                        returnKeyType={'default'}
                        fetchDetails={true}
                        onPress={this.saveAddressFromSearch}
                        styles={{
                            container: style.locationContainer,
                            textInput: style.searchText,
                            textInputContainer: { backgroundColor: EDColors.offWhite, height: 60, justifyContent: "center" },
                            predefinedPlacesDescription: {
                                color: '#1faadb'
                            },
                            description:{
                                fontFamily : EDFonts.regular
                            }
                        }}
                        query={{
                            key: this.props.googleMapKey || GOOGLE_API_KEY,
                            language: this.props.lan,
                        }}
                    />

                    {/* ADD ADDRESS */}
                    {this.props.userID !== undefined && this.props.userID !== null && this.props.userID.trim().length !== 0 ?
                        <EDRTLView style={style.addView} >
                            <EDRTLText style={style.titleText}
                                title={strings("addressTitle")}
                            />
                            <EDThemeButton
                                label={strings("addAddress")}
                                style={{ flex: 1, marginTop: 0, height: 40 }}
                                textStyle={{ fontSize: getProportionalFontSize(14) }}
                                onPress={this.onAddAddressEventHandler}
                            />
                        </EDRTLView> : null}

                    {/* ADDRESS LIST */}
                    {this.arrayAddress != undefined && this.arrayAddress != null && this.arrayAddress.length > 0 ? (
                        <FlatList
                            data={this.arrayAddress}
                            extraData={this.state}
                            showsVerticalScrollIndicator={false}
                            ref="flatList"
                            keyExtractor={(item, index) => item + index}
                            renderItem={this.renderAddressList}
                        />
                    ) : this.strOnScreenMessage.trim().length > 0 ? (
                        <View style={{ flex: 1 }}>
                            <EDPlaceholderComponent
                                title={this.strOnScreenMessage}
                                subTitle={this.strOnScreenSubtitle}
                            />
                        </View>) : (<View />)}

                    {this.props.userID !== undefined && this.props.userID !== null && this.props.userID.trim().length !== 0 ? null :
                        <EDPlaceholderComponent
                            style={{ marginTop: 20 }}
                            title={strings("loginValidation")}
                            subTitle={this.strOnScreenMessage}
                            buttonTitle={strings('loginTitle')}
                            onBrowseButtonHandler={this.buttonloginPressed} />
                    }
                </View>

                {/* IF SELECT ADDRESS */}
                {this.arrayAddress != undefined && this.arrayAddress != null && this.arrayAddress.length > 0 ? (
                    <View style={style.continueStyle}>
                        <EDThemeButton
                            isLoading={this.state.isLoading}
                            style={style.contButtonStyle}
                            onPress={this.saveAddressFromList}
                            label={strings("continue")}
                            textStyle={style.orderText}
                        />
                    </View>) : null}
            </BaseContainer>
        );
    }
    //#endregion
    saveAddressFromSearch = (data, details) => {
        var localArea = details.address_components.filter(
            x =>
                x.types.filter(t => t == "sublocality_level_1" || t == "locality").length > 0
        )

        if (localArea.length !== 0) {
            localArea = localArea[0].long_name;
        } else {
            localArea = "Untitled"
        }
        let addressData = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            areaName: details.formatted_address,
            address: localArea
        }

        this.props.saveCurrentLocation(addressData)
        this.navigateToBack()
    }

    saveAddressFromList = () => {
        if (this.state.selectedIndex == -1)
            showValidationAlert(strings("addressSelectionValidation"))
        else {
            let addressData = {
                latitude: this.arrayAddress[this.state.selectedIndex].latitude,
                longitude: this.arrayAddress[this.state.selectedIndex].longitude,
                areaName: this.arrayAddress[this.state.selectedIndex].landmark,
                address: this.arrayAddress[this.state.selectedIndex].address
            }
            this.props.saveCurrentLocation(addressData)
            this.navigateToBack()
        }
    }
    navigateToBack = () => {
        if (this.state.sendLocationDetailsBack !== undefined)
            this.state.sendLocationDetailsBack()
        this.props.navigation.goBack();
    };
    //#region 
    /** BACK EVENT HANDLER */
    onBackEventHandler = () => {
        this.props.navigation.goBack();
    }
    //#endregion
    buttonloginPressed = () => {
        this.props.navigation.navigate('LoginContainer')
    }
    //#region 
    /** GET DATA */
    getData = () => {
        this.getAddressList();
    };
    //#endregion

    //#region ADD ADRRESS
    onAddAddressEventHandler = () => {
        this.navigateTomap("", 1)
    }
    //#endregion

    //#region 
    /** on EDIT PRESSSEDD */

    navigateTomap = (item, index) => {

        netStatus(isConnected => {
            if (isConnected) {
                var paramPermission =
                    Platform.OS === 'ios'
                        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
                checkPermission(
                    paramPermission,
                    () => {
                        switch (index) {
                            case 1:
                                this.props.navigation.navigate("AddressMapContainer", {
                                    getData: this.getData
                                });
                            case 2:
                                var sendData = {
                                    addressId: item.address_id,
                                    addressLine2: item.landmark,
                                    addressLine1: item.address,
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    city: item.city,
                                    zipCode: item.zipcode
                                };
                                this.props.navigation.navigate("AddressMapContainer",
                                    {
                                        getDataAll: sendData,
                                        getData: this.getData
                                    }
                                );
                                break;
                        }
                    },
                    () => {
                        showDialogue(
                            strings('locationPermission'),
                            [{ text: strings("dialogCancel") ,  isNotPreferred : true }],
                            '',
                            () => {
                                Linking.openURL('app-settings:');
                            },
                        );
                    }
                )
            } else {
                showNoInternetAlert()
            }
        })
    }


    //#region 
    /** ADRESS ID EEVENT HANDLER */
    onDeleteAddressEventHandler = (address_id) => {
        showDialogue(strings("deleteAddressConfirm"), [{ text: strings("dialogCancel") ,  isNotPreferred : true }], "", () => this.deleteAddress(address_id));
    }
    //#endregion

    //#region 
    /** CREATE ADDRESS LIST */
    renderAddressList = ({ item, index }) => {
        return (
            <AddressComponent
                data={item}
                index={index}
                isSelectedAddress={this.state.isSelectAddress}
                isSelected={this.state.selectedIndex === index ? true : false}
                onPress={this.addressSelectionAction}
                deleteAddress={this.onDeleteAddressEventHandler}
                editAddress={this.navigateTomap}
            />
        );
    }
    //#endregion


    //#region LOAD ADDRESS
    /**
     * @param { Success Response Object } onSuccess
     */
    onSuccessLoadAddress = (onSuccess) => {
        this.strOnScreenMessage = ''

        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                if (onSuccess.address !== undefined && onSuccess.address.length > 0) {
                    this.arrayAddress = onSuccess.address.reverse();
                } else {
                    this.arrayAddress = []
                    this.strOnScreenMessage = strings("noDataFound")
                }

                this.setState({ isLoading: false });
            } else {
                this.strOnScreenMessage = strings("noDataFound")
                this.setState({ isLoading: false });
            }
        } else {
            this.strOnScreenMessage = strings("generalWebServiceError");
            this.setState({ isLoading: false });
        }
    }

    /**
     * @param { FAilure Response Objetc } onfailure
     */
    onFailureLoadAddress = (onFailure) => {
        this.strOnScreenMessage = ''
        this.strOnScreenSubtitle = ''
        this.strOnScreenMessage = strings("generalWebServiceError");
        this.setState({ isLoading: false });
    }

    /** GET ADDRESS API */
    getAddressList = () => {
        if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID.trim().length !== 0) {
            this.strOnScreenMessage = '';
            this.strOnScreenSubtitle = '';
            this.setState({ isLoading: true });
            netStatus(status => {
                if (status) {

                    let param = {
                        language_slug: this.props.lan,
                        user_id: this.props.userID || 0,
                        // token: this.props.token
                    }
                    getAddress(param, this.onSuccessLoadAddress, this.onFailureLoadAddress, this.props);
                } else {
                    this.strOnScreenMessage = strings("noInternetTitle");
                    this.strOnScreenSubtitle = strings("noInternet");
                    this.setState({ isLoading: false });
                }
            });
        }

    }
    //#endregion

    //#region DELETE ADDRESS
    /**
     * 
     * @param { Success Response Object } onSuccess 
     */
    onSuccessDeleteAddress = (onSuccess) => {
        console.log("Address Delete response ::::: ", onSuccess)
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.getAddressList();
            } else {
                showValidationAlert(onSuccess.message);
                this.setState({ isLoading: false });
            }
        } else {
            this.strOnScreenMessage = strings("generalWebServiceError")
            this.setState({ isLoading: false });
        }
    }

    /**
     * 
     * @param {Fauilre Response Objewtc} onFailure 
     */
    onFailureDeleteAddress = (onFailure) => {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = strings("noInternet")
    }

    /** DELETE API */
    deleteAddress(addId) {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                let param = {
                    language_slug: this.props.lan,
                    user_id: this.props.userID,
                    address_id: addId,
                    // token: this.props.token
                }
                deleteAddress(param, this.onSuccessDeleteAddress, this.onFailureDeleteAddress, this.props);
            } else {
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
            }
        });
    }
    //#endregion

    addressSelectionAction = (index) => {
        this.setState({ selectedIndex: index });
    }

}
//#endregion

//#region STYLES
const style = StyleSheet.create({
    locationContainer: {
        width: metrics.screenWidth,
        position: "absolute",
        zIndex: 999,
        backgroundColor: EDColors.white,
        justifyContent: "center",
    },
    searchText: {
        color: EDColors.secondary,
        fontSize: getProportionalFontSize(16),
        backgroundColor: EDColors.white,
        borderRadius: 6,
        height: 60,
        fontFamily : EDFonts.regular
    },
    continueStyle: { width: "100%", height: metrics.screenHeight * 0.08, backgroundColor: EDColors.backgroundLight, marginBottom: 10 },
    contButtonStyle: {
        alignSelf: "center",
        backgroundColor: EDColors.primary,
        justifyContent: "center",
        marginTop: 10,
        width: "50%",
    },
    addView: {
        alignItems: "center",
        padding: 10,
        marginTop: 60
    },
    titleText: {
        color: EDColors.primary,
        fontSize: getProportionalFontSize(15),
        fontFamily: EDFonts.regular,
        marginHorizontal: 5,
        flex: 1
    },
    textStyle: {
        fontSize: getProportionalFontSize(14),
        fontFamily: EDFonts.regular,
        flex: 1,
        padding: 5
    },
    orderText: { fontSize: getProportionalFontSize(14) },

});
//#endregion

export default connect(
    state => {
        return {
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            lan: state.userOperations.lan,
            googleMapKey: state.userOperations.googleMapKey
        };
    },
    dispatch => {
        return {
            saveCurrentLocation: data => {
                dispatch(saveCurrentLocation(data));
            }
        };
    }
)(SearchLocationContainer);

/* eslint-disable prettier/prettier */
import React from 'react';
import { AppState, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { connect } from 'react-redux';
import Assets from '../assets';
import EDButton from '../components/EDButton';
import EDRTLText from '../components/EDRTLText';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from '../components/EDRTLView';
import EDText from '../components/EDText';
import { strings } from '../locales/i18n';
import { showNoInternetAlert, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, GOOGLE_API_KEY, isRTLCheck, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { getAddress, getAddressFromAddressComponent, getCurrentLocation } from '../utils/LocationServiceManager';
import metrics from '../utils/metrics';
import Metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { addAddress } from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import BaseContainer from './BaseContainer';

let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0022;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class AddressMapContainer extends React.Component {

    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.city = '';
        this.stateName = '';
        this.country = ''
        this.zipCode = '';
        this.allData = this.props.navigation.state.params.getDataAll;
        this.isGuest = this.props.navigation.state.params.isGuest || false;

        this.address_id = '';
        this.strAddress2 = ''
        this.validationsHelper = new Validations();

    }

    render() {
        return (
            <BaseContainer
                title={this.props.navigation.state.params.isEdit == 2 ? strings("editAddress") : strings('addAddress')}
                left={'arrow-back'}
                onLeft={this.navigateToBack}
                loading={this.state.isLoading}
            >
                <View pointerEvents={this.state.isLoading ? 'none' : 'auto'} style={style.mainContainer}>
                    {/* <NavigationEvents
                        onWillFocus={this.onWillFocusEvent}
                    /> */}

                    {/* ADDRESS LINE 2 */}
                    {/* <EDRTLTextInput
                            editableBox={false}
                            initialValue={this.state.strAddress2}
                            textToDisplay={this.state.strAddress2}
                            multiline={true}
                            type={TextFieldTypes.default}
                            placeholder={strings('addressNew.line2')}
                            enablesReturnKeyAutomatically={true}
                            errorFromScreen={
                                this.state.shouldPerformValidation
                                    ? this.validationsHelper.checkForEmpty(
                                        this.state.strAddress2,
                                        strings('addressNew.emptyAddressLine2'),
                                    )
                                    : ''
                            }
                        /> */}

                    <View style={style.subContainer}>
                        <MapView
                            provider={Platform.OS == 'ios' ? null : PROVIDER_GOOGLE}
                            zoomControlEnabled={true}
                            zoomEnabled={true}
                            showsUserLocation={true}
                            zoom={100}
                            style={style.mapView}
                            region={this.state.region}
                            onRegionChangeComplete={region => this.setState({ region })}
                            onPress={this.onMapChangeHandler}
                        >
                            <Marker
                                image={Assets.restaurant}
                                coordinate={{
                                    latitude: this.state.latitude,
                                    longitude: this.state.longitude,
                                }}
                            />
                        </MapView>
                    </View>

                    <View style={style.searchView} >
                        <EDRTLText title={strings("searchLocation")} style={style.searchTitle} />
                        <EDRTLView style={{ flex: 1, alignItems: 'center' }}>
                            {/* LOCATION ICON */}
                            <GooglePlacesAutocomplete
                                placeholder={""}
                                minLength={2}
                                returnKeyType={'default'}
                                fetchDetails={true}
                                ref={(instance) => { this.locationRef = instance }}
                                renderLeftButton={() => (
                                    <View style={[style.childContianer, {

                                        marginLeft: isRTLCheck() ? 0 : 15,
                                        marginRight: isRTLCheck() ? 15 : 0,
                                    }]} >
                                        <Icon name={"location-pin"} type="simple-line-icon" color={EDColors.blackSecondary} size={20} />
                                    </View>
                                )}
                                // value={this.state.strAddress2}
                                textInputProps={{
                                    onChangeText: () => { this.setState({ strAddress2: "" }) },
                                    placeholder: this.state.strAddressNew,
                                    editable: true,
                                    selection: { start: 0 },
                                    onBlur: () => {
                                        this.setState({
                                            selection: {
                                                start: 0,
                                                end: 0
                                            }
                                        })
                                    },
                                    onFocus: () => {
                                        this.setState({
                                            selection: {
                                                start: this.state.strAddressNew.length,
                                                end: this.state.strAddressNew.length
                                            }
                                        }, () => {
                                            this.setState({ selection: null })
                                        })
                                    },
                                    selection: this.state.selection,
                                    numberOfLines:1
                                   

                                }}
                                onPress={this.saveAddressFromSearch}
                                enablePoweredByContainer={false}
                                // renderRightButton={this.renderRightBtn}
                                styles={{
                                    container: style.searchContainer,
                                    textInput: style.searchText,
                                    textInputContainer: style.searchInputContainer,
                                    predefinedPlacesDescription: {
                                        color: '#1faadb',
                                    },
                                    listView: {},
                                    description:{
                                        fontFamily : EDFonts.regular
                                    }
                                }}
                                query={{
                                    key: this.props.googleMapKey || GOOGLE_API_KEY,
                                    // key: "AIzaSyDlM-OKdvaeeHqS6wZbl1jwKtwGAfamO2s",
                                    language: this.props.lan,
                                }}
                            />
                            {/* <Icon name={"location-pin"} type="simple-line-icon" color={EDColors.blackSecondary} size={getProportionalFontSize(20)} />
                        <EDRTLText title={this.state.strAddress2 !== '' ? this.state.strAddress2 : this.state.strAddressNew} style={style.searchText} /> */}
                        </EDRTLView>
                    </View>

                    <View style={[style.bottonView, { bottom: Platform.OS == "ios" ? 10 + initialWindowMetrics.insets.bottom : 10 }]}>
                        <View style={style.checkboxView}>
                            {/* ADDRESS LINE 1 */}
                            <EDRTLTextInput
                                icon="location-pin"
                                textstyle={{ color: EDColors.black, fontSize: getProportionalFontSize(16), }}
                                defaultValue={this.state.objRegistrationDetails.strAddress1}
                                initialValue={this.state.objRegistrationDetails.strAddress1}
                                identifier={'strAddress1'}
                                containerStyle={{ marginHorizontal: 14 }}
                                customIcon={"edit-3"}
                                customIconFamily={'feather'}
                                customIconColor={EDColors.black}
                                focusOnPress={true}
                                type={TextFieldTypes.default}
                                placeholder={strings('additionalInfo')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                errorFromScreen={
                                    this.state.shouldPerformValidation
                                        ? this.validationsHelper.checkForEmpty(
                                            this.state.objRegistrationDetails.strAddress1,
                                            strings('emptyAddressLine1'),
                                        )
                                        : ''
                                }
                            />
                            {/* CHECK BOX */}
                            {this.props.UserID !== undefined && this.props.UserID !== null ?
                                <TouchableOpacity onPress={this.toggleHomeAddress}  >
                                    <EDRTLView style={style.checkStyle}>
                                        <Icon
                                            name={this.state.isHome ? "checkbox" : "square-o"}
                                            color={EDColors.primary}
                                            size={getProportionalFontSize(20)}
                                            type={this.state.isHome ? 'ionicon' : 'font-awesome'}
                                            onPress={this.toggleHomeAddress}
                                        />
                                        <Text style={style.homeaddress}>
                                            {strings("setDefaultAddress")}
                                        </Text>
                                    </EDRTLView>
                                </TouchableOpacity> : null}
                        </View>
                        <View style={style.btnView}>
                            <EDButton
                                style={style.btnStyle}
                                textStyle={style.btnText}
                                label={strings('save')}
                                onPress={this.onAddressSave}
                            />
                        </View>
                    </View>
                </View>
            </BaseContainer>
        );
    }

    //#endregion


    toggleHomeAddress = () => {
        if (this.state.totalCount !== 0)
            this.setState({ isHome: !this.state.isHome })
    }

    //#region STATE

    state = {
        isLoading: false,
        latitude: 0.0,
        longitude: 0.0,
        isHome: false,
        region: {
            latitude: 0.0,
            longitude: 0.0,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        },
        objRegistrationDetails: { strAddress1: '' },
        strAddress2: '',
        strAddressNew: '',

        appState: AppState.currentState,
        shouldPerformValidation: false,
        is_default: false,
        totalCount: this.props.navigation.state.params.totalCount,
        selection: {
            start: 0,
            end: 0
        }
    }
    //#endregion

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        debugLog("TOTAL ::::::", this.state.totalCount)
        if (this.state.totalCount == 0)
            this.setState({ isHome: true })
        this.viewUpdate();
    }
    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            debugLog('App has come to the foreground!');
            debugLog('get back result successs');
            this.viewUpdate();
        }
        this.setState({ appState: nextAppState });
    }

    viewUpdate = () => {
        debugLog("ALL DATA :::::", this.allData)
        if (this.allData != undefined && !(this.allData.addressId === '') && this.allData.addressId != undefined) {
            debugLog('Adderss Map ::::::::: ', this.allData);
            let addressData = this.allData;
            this.city = addressData.city;
            this.stateName = addressData.state;
            this.country = addressData.country;
            this.strAddress2 = addressData.addressLine2
            this.zipCode = addressData.zipCode,
                this.address_id = addressData.addressId;
            this.state.objRegistrationDetails.strAddress1 = addressData.addressLine1;
            debugLog("CALLED FROM viewUpdate")
            this.state.strAddressNew = this.allData.addressLine2
            this.setState({
                // strAddress2: addressData.addressLine2,
                region: {
                    latitude: Number(addressData.latitude),
                    longitude: Number(addressData.longitude),
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                },
                latitude: Number(addressData.latitude),
                longitude: Number(addressData.longitude),
                isHome: addressData.is_main == "1"
            });
            debugLog("TEST SET ADDRESS :::::", this.state.strAddressNew)
            // this.locationRef.setAddressText(addressData.city)

        }

        else {
            if (this.props.navigation.state.params.address_id != undefined) {

                this.address_id = this.props.navigation.state.params.address_id;
                debugLog('address_id :::::: ', this.address_id);
            }
            this.getCurrentAddressLocation();
        }
    }

    //#region TEXT CHANGE EVENTS
    /**
     *
     * @param {Value of textfield whatever user type} value
     ** @param {Unique identifier for every text field} identifier
     */

    textFieldTextDidChangeHandler = (value, identifier) => {
        this.state.objRegistrationDetails[identifier] = value;
        this.setState({ shouldPerformValidation: false });
    }

    onFailureGetAddress = onFailure => {
        debugLog('Address Fail:::::::: ', onFailure);
    }

    onMapChangeHandler = (e) => {
        debugLog('coordinat ::::::::: ', e.nativeEvent);
        this.setState({
            region: {
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
            isLoading: true,
        });
        getAddress(e.nativeEvent.coordinate.latitude,
            e.nativeEvent.coordinate.longitude,
            onSucces => {
                debugLog('address Location :::::::::: ', onSucces);
                this.city = onSucces.city;
                this.stateName = onSucces.state;
                this.country = onSucces.country;
                this.zipCode = onSucces.zipCode;
                debugLog("CALLED FROM onMapChangeHandler")
                this.setState({
                    strAddress2: onSucces.strAddress,
                    isLoading: false,
                    key: this.state.key + 1
                });
                this.locationRef.setAddressText(onSucces.strAddress) //TEMP

            },
            this.onFailureGetAddress,
            this.props.googleMapsAPIKey || GOOGLE_API_KEY
        );
    }

    saveAddressFromSearch = (data, details) => {
        debugLog("TEST ADDRESS ::::", data, details, details.geometry)
        this.setState({
            region: {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            isLoading: true,
        });
        let address = getAddressFromAddressComponent(details.address_components, details.formatted_address)
        debugLog("ADDRESS FORMATTED :::::", address)
        this.city = address.city;
        this.stateName = address.state;
        this.country = address.country;
        this.zipCode = address.zipCode;
        debugLog("CALLED FROM saveAddressFromSearch")

        this.setState({
            strAddress2: address.strAddress,
            isLoading: false,
        });
        this.locationRef.setAddressText(address.strAddress) //TEMP

    }


    //#region BUTTON EVENTS
    /**
     *
     * @param {Checking all conditions and redirect to Map screen on success}
     */

    onAddressSave = () => {
        this.setState({ shouldPerformValidation: true });
        if (this.state.objRegistrationDetails.strAddress1.trim() !== '') {

            debugLog("STR ADDRESS CITY ::::", this.state.strAddress2)
            if (this.state.strAddress2.trim() !== '' || this.state.strAddressNew.trim() !== '')
                this.callAddAddressAPI();
            else
                showValidationAlert(strings("properAddressMessage"))

        } else {
            // showDialogue(strings("addressNew.addressValidation"))
        }
    }

    /**
     *
     * @param {The success response object} objSuccess
     */
    onaddAddressSuccess = objSuccess => {
        debugLog('OBJ SUCCESS ADDRESS :: ' + JSON.stringify(objSuccess));
        this.props.navigation.goBack();
        this.setState({ isLoading: false });
    }

    /**
    *
    * @param {The success response object} objSuccess
    */
    onaddAddressFailure = objFailure => {
        this.setState({ isLoading: false });
        debugLog('OBJ FAILURE ADDRESS :: ', objFailure);
        showValidationAlert(objFailure.message);
    }

    callAddAddressAPI = () => {
        if (this.isGuest) {
            this.props.navigation.state.params.getGuestAddress({
                address: this.state.objRegistrationDetails.strAddress1,
                landmark: this.state.strAddress2.trim().length !== 0 ? this.state.strAddress2 : this.state.strAddressNew.trim().length !== 0 ? this.state.strAddressNew : "",
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                city: this.city,
                zipcode: this.zipCode,
                state: this.stateName,
                country: this.country
            })
            this.props.navigation.goBack()

        }
        else
            netStatus(isConnected => {
                if (isConnected) {
                    let objaddAddressParams = {
                        language_slug: this.props.lan,
                        address: this.state.objRegistrationDetails.strAddress1,
                        landmark: this.state.strAddress2.trim().length !== 0 ? this.state.strAddress2 : this.state.strAddressNew.trim().length !== 0 ? this.state.strAddressNew : "",
                        latitude: this.state.latitude,
                        longitude: this.state.longitude,
                        city: this.city,
                        zipcode: this.zipCode,
                        is_main: this.state.isHome ? "1" : "0",
                        user_id: this.props.UserID,
                        // token: this.props.PhoneNumber,
                        address_id: this.address_id,

                    };
                    this.setState({ isLoading: true });
                    addAddress(objaddAddressParams, this.onaddAddressSuccess, this.onaddAddressFailure, this.props);
                } else {
                    showNoInternetAlert();
                }
            });
    }

    getCurrentAddressLocation = () => {

        this.setState({
            isLoading: true,
        });
        getCurrentLocation(
            onSucces => {
                this.city = onSucces.address.city;
                this.stateName = onSucces.address.state;
                this.country = onSucces.address.country;
                this.zipCode = onSucces.address.zipCode;
                debugLog("CALLED FROM getCurrentAddressLocation::::::", onSucces)

                this.setState({
                    region: {
                        latitude: onSucces.latitude,
                        longitude: onSucces.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    },
                    latitude: onSucces.latitude,
                    longitude: onSucces.longitude,
                    strAddress2: onSucces.address.strAddress,
                    isLoading: false,
                });
                this.locationRef.setAddressText(onSucces.address.strAddress) //TEMP
            },
            onFailure => {
                debugLog('getLocation Fail ::::::::::: ', onFailure);
                this.setState({ isLoading: false });
                showValidationAlert(onFailure.message);
            },
            this.props.googleMapsAPIKey || GOOGLE_API_KEY
        );

    }
    navigateToBack = () => {
        this.props.navigation.goBack();
    }

    onWillFocusEvent = () => {
        // this.props.changeCartButtonVisibility({ shouldShowFloatingButton: false, currentScreen: this.props });
    }
}

export default connect(
    state => {
        return {
            UserID: state.userOperations.userIdInRedux,
            PhoneNumber: state.userOperations.phoneNumberInRedux,
            lan: state.userOperations.lan,
            googleMapsAPIKey: state.userOperations.googleMapKey || '',

        };
    },
    dispatch => {
        return {

        };
    }
)(AddressMapContainer);

export const style = StyleSheet.create({
    mainContainer: {
        flex: 1,
        // backgroundColor: EDColors.white,
    },
    mapView: {
        height: Metrics.screenHeight,
    },
    subContainer: {
        // height: Metrics.screenHeight / 2, padding: 20,
        flex: 1
    },
    btnStyle: {
        alignSelf: 'center', marginHorizontal: 10, backgroundColor: EDColors.primary,
        width: '90%',
        borderRadius: 16,
        height: metrics.screenHeight * 0.075,
        marginTop: 15
    },
    btnView: {
        alignItems: 'flex-end'
    },
    btnText: { textAlign: 'center', fontSize: getProportionalFontSize(16), fontFamily: EDFonts.medium },
    checkStyle: { alignItems: 'center', paddingHorizontal: 12, marginTop: 25, alignItems: 'center' },
    searchContainer: { backgroundColor: EDColors.white, marginHorizontal: 5 },
    searchInputContainer: {
        backgroundColor: EDColors.white, borderTopColor: EDColors.transparent,

        borderBottomColor: EDColors.transparent,
        borderTopWidth: 0,
        borderBottomWidth: 0,
    },
    checkboxView: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        marginHorizontal: 15,
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    homeaddress: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.black,
        paddingHorizontal: 5
    },
    searchText: {
        marginHorizontal: 10,
        flex: 1,
        // height: widthPercentageToDP('8%'),
        // marginTop: 10,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(14),
        color: EDColors.text,
        // paddingVertical: 5,
        borderBottomColor: EDColors.black,
        borderBottomWidth: 0,

    },
    searchTitle: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(12),
        color: EDColors.text,
        marginHorizontal: 15
    },
    searchView: {
        backgroundColor: EDColors.white,
        borderRadius: 16,
        position: 'absolute',
        marginVertical: 15,
        width: '90%',
        alignSelf: 'center',
        padding: 10,
        paddingTop: 10,
        paddingBottom: 0
        // alignItems: 'center'

    },
    bottonView: {
        position: 'absolute',
        bottom: 10,
        width: '100%',
    },
    childContianer: {
        // paddingHorizontal: 10,
        backgroundColor: EDColors.transparent,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

import React from 'react';
import { FlatList, Linking, Platform, StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PERMISSIONS } from 'react-native-permissions';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { NavigationEvents } from 'react-navigation';
import { connect } from 'react-redux';
import AddressComponent from '../components/AddressComponent';
import EDRTLText from '../components/EDRTLText';
import EDRTLTextInput from '../components/EDRTLTextInput';
import EDRTLView from '../components/EDRTLView';
import EDThemeButton from '../components/EDThemeButton';
import { strings } from '../locales/i18n';
import { saveCheckoutDetails, saveGuestAddress, saveGuestDetails } from '../redux/actions/Checkout';
import { showDialogue, showNoInternetAlert, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck, PAYMENT_TYPES, RESPONSE_SUCCESS, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { checkPermission } from '../utils/PermissionServices';
import { checkOrder, deleteAddress, getAddress, getPaymentList } from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import BaseContainer from './BaseContainer';


export class AddressListContainer extends React.PureComponent {
	//#region LIFE CYCLE METHODS

	constructor(props) {
		super(props);
		this.validationsHelper = new Validations()
		this.countryCode = ""

		this.strOnScreenMessage = '';
		this.strOnScreenSubtitle = '';
		this.state = {
			isLoading: false,
			isPaymentLoading: false,
			addressLine1: '',
			addressLine2: '',
			value: this.props.orderModeInRedux == 1 ? 0 : 1,
			latitude: 0.0,
			longitude: 0.0,
			city: '',
			zipCode: '',
			addressId: '',
			isSelectAddress: this.props.navigation.state.params.isSelectAddress,
			selectedIndex: -1,
			strComment: "",
			strDriverComment: "",
			selectedOption: '',
			availableOrderModes: undefined,
			strFullName: "",
			strLastName: "",
			strPhone: "",
			strEmail: '',
			shouldPerformValidation: false,
			guestAddress: undefined
		};
		this.checkoutData = this.props.checkoutDetail;
	}

	
	componentDidMount() {
        if (this.props.countryArray !== undefined && this.props.countryArray !== null && this.props.countryArray[0] !== undefined && this.props.countryArray[0].phonecode !== undefined) {
            this.countryCode = this.props.countryArray[0].phonecode
        }
    }


	onCountrySelect = country => {
		this.countryCode = country.callingCode[0]
	}

	//#region 
	onTextChangeHandler = (value) => {
		this.setState({
			strComment: value
		})
	}
	onDriverTextChangeHandler = (value) => {
		this.setState({
			strDriverComment: value
		})
	}
	//#endregion

	//#region TEXT CHANGE EVENTS
	/**
	 * @param {Value of textfield whatever user type} value
	 ** @param {Unique identifier for every text field} identifier
	 */
	textFieldTextDidChangeHandler = (value, identifier) => {
		var newText = value
		if (identifier == "strPhone") {
			newText = value.replace(/[^0-9\\]/g, "");
		}
		this.state[identifier] = newText
		this.forceUpdate()
		this.setState({ shouldPerformValidation: false })

	}
	//#endregion

	//#region
	/** RENDER METHOD */
	render() {
		return (
			<BaseContainer
				title={this.state.isSelectAddress ? strings('selectAddress') : strings('myAddress')}
				left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
				right={[]}
				onLeft={this.onBackEventHandler}
				loading={this.state.isLoading || this.state.isPaymentLoading}
				onConnectionChangeHandler={this.onWillFocus}
			>
				{/* MAIN VIEW */}
				<KeyboardAwareScrollView style={{ flex: 1, backgroundColor: EDColors.radioSelected }}
					bounces={false}
					keyboardShouldPersistTaps="handled"
					behavior="padding"
					showsVerticalScrollIndicator={false}
					enabled
					enableAutoAutomaticScroll={false}
					enableOnAndroid={true}
				>
					<View pointerEvents={this.state.isLoading ? 'none' : 'auto'} style={{ flex: 1 }}>
						<NavigationEvents onWillFocus={this.onWillFocus} />
						{this.props.userID !== undefined && this.props.userID !== null ? null :
							<View style={style.contactView}>
								<EDRTLText style={[style.titleText, {
									marginHorizontal: 0,
								}]} title={strings('contactInfo')} />
								{/* USERNAME */}
								<EDRTLTextInput
									textstyle={{ color: EDColors.black }}
									icon="person"
									type={TextFieldTypes.default}
									identifier={'strFullName'}
									placeholder={strings('firstName')}
									onChangeText={this.textFieldTextDidChangeHandler}
									initialValue={this.state.strFullName}
									errorFromScreen={
										this.state.shouldPerformValidation
											? this.validationsHelper.checkForEmpty(
												this.state.strFullName,
												strings('emptyName'),
											)
											: ''
									}
								/>

								{/* LAST NAME */}
								<EDRTLTextInput
									textstyle={{ color: EDColors.black }}
									icon="person"
									type={TextFieldTypes.default}
									identifier={'strLastName'}
									placeholder={strings('lastName')}
									onChangeText={this.textFieldTextDidChangeHandler}
									initialValue={this.state.strLastName}
									errorFromScreen={
										this.state.shouldPerformValidation
											? this.validationsHelper.checkForEmpty(
												this.state.strLastName,
												strings('emptyLastName'),
											)
											: ''
									}
								/>
								{/* PHONE NUMBER */}
								<EDRTLTextInput
									textstyle={{ color: EDColors.black }}
									icon="call"
									type={TextFieldTypes.phone}
									countryData={this.props.countryArray}
									identifier={'strPhone'}
									onCountrySelect={this.onCountrySelect}
									placeholder={strings('phoneNumber')}
									onChangeText={this.textFieldTextDidChangeHandler}
									initialValue={this.state.strPhone}
									errorFromScreen={
										this.state.shouldPerformValidation
											? this.validationsHelper.validateMobile(
												this.state.strPhone,
												strings('emptyPhone'),
												this.countryCode
											)
											: ''
									}
								/>

								<EDRTLTextInput
									icon="email"
									textstyle={{ color: EDColors.black }}
									type={TextFieldTypes.email}
									identifier={'strEmail'}
									placeholder={strings('emailOptional')}
									onChangeText={this.textFieldTextDidChangeHandler}
									initialValue={this.state.strEmail}
									errorFromScreen={
										this.state.shouldPerformValidation
											? this.validationsHelper.validateEmail(
												this.state.strEmail,
												""
											)
											: ''
									}
								/>
							</View>}

						{/* IF SELECT ADDRESS */}
						{this.state.isSelectAddress && this.state.availableOrderModes !== undefined && this.state.availableOrderModes !== null && this.state.availableOrderModes.length !== 0
							? <View>
								<EDRTLText style={style.orderView} title={strings('orderType')} />

								<View style={style.deliveryOptionView} >
									{this.state.availableOrderModes.includes("Delivery") ?
										<TouchableOpacity onPress={this.selectCod} style={[style.touchableView, { flexDirection: isRTLCheck() ? "row-reverse" : "row", marginBottom: 20 }]}>
											<EDRTLView style={style.childDeliveryOptionView}>
												<Icon name={"directions-bike"} size={getProportionalFontSize(20)} style={style.headerIconStyle} color={this.state.value == 1 ? EDColors.primary : EDColors.text} />
												<EDRTLText style={[style.deliveryTextStyle, { color: this.state.value == 1 ? EDColors.black : EDColors.text }]} title={strings('byDelivery')} ></EDRTLText>
											</EDRTLView>
											{this.state.value == 1 ? <Icon name={'done'} size={getProportionalFontSize(18)} color={EDColors.primary} /> : null}
										</TouchableOpacity> : null}
									{this.state.availableOrderModes.includes("PickUp") ?
										<TouchableOpacity onPress={this.selectPickUp} style={[style.touchableView, { flexDirection: isRTLCheck() ? "row-reverse" : "row", marginTop: 20 }]}>
											<EDRTLView style={style.childDeliveryOptionView} >
												<Icon name={"directions-walk"} size={getProportionalFontSize(20)} style={style.headerIconStyle} color={this.state.value == 0 ? EDColors.primary : EDColors.text} />
												<EDRTLText style={[style.deliveryTextStyle, { color: this.state.value == 0 ? EDColors.black : EDColors.text }]} title={strings('selfPickup')} />
											</EDRTLView>
											{this.state.value == 0 ? <Icon name={'done'} size={getProportionalFontSize(18)} color={EDColors.primary} /> : null}
										</TouchableOpacity> : null}

								</View>

							</View>
							: null}
						{this.state.value == 1 ?
							<>
								{/* ADD ADDRESS */}
								<EDRTLView style={style.addView}>
									<EDRTLText style={style.titleText} title={strings('addressTitle')} />
									<EDThemeButton
										icon={this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "" ? this.arrayAddress != undefined && this.arrayAddress != null && this.arrayAddress.length > 0 ? "edit" : "add" : (this.state.guestAddress == undefined ? "add" : "edit")}
										label={this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "" ? this.arrayAddress != undefined && this.arrayAddress != null && this.arrayAddress.length > 0 ? strings('changeAddress') : strings("addAddress") : (this.state.guestAddress == undefined ? strings("addAddress") : strings('changeAddress'))}
										style={{ flex: 1, marginTop: 0, height: 40, borderRadius: 16, paddingVertical: 0, marginHorizontal: 3 }}
										textStyle={{ fontSize: getProportionalFontSize(14), paddingLeft: 7, paddingRight: 7, }}
										onPress={this.onAddAddressEventHandler}
									/>
								</EDRTLView>

								{/* ADDRESS LIST */}
								{this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== '' ?
									(this.arrayAddress != undefined && this.arrayAddress != null && this.arrayAddress.length > 0
										?

										<AddressComponent
											data={this.arrayAddress[0]}
											index={0}
											isSelectedAddress={this.state.isSelectAddress}
											isAddressList={true}
											onPress={this.addressSelectionAction}
											deleteAddress={this.onDeleteAddressEventHandler}
											editAddress={this.navigateTomap}
										/>
										:
										this.state.isLoading ? null :
											<EDRTLText title={strings("noAddressMsg")} style={style.noAddress} />
									) : null}
								{this.props.userID == undefined || this.props.userID == null || this.props.userID == '' ?
									(this.state.guestAddress !== undefined
										?
										<AddressComponent
											data={this.state.guestAddress}
											index={0}
											isSelectedAddress={true}
											isAddressList={true}
											onPress={this.addressSelectionAction}
											deleteAddress={this.onDeleteAddressEventHandler}
											editAddress={this.navigateTomap}
										/> : this.state.isLoading || this.state.value !== 1 ? null :
											<EDRTLText title={strings("guestAddressError")} style={style.noAddress} />
									) : null}

							</> : null}
						{this.state.isSelectAddress
							?
							<View style={{ flex: 1 }}>
								{this.paymentOptions !== undefined && this.paymentOptions !== null && this.paymentOptions.length !== 0 ?
									<EDRTLText title={strings("choosePaymentOption")} style={style.paymentHeader} /> : null}
								{this.paymentOptions !== undefined && this.paymentOptions !== null && this.paymentOptions.length !== 0 ?

									<FlatList
										data={this.paymentOptions}
										extraData={this.state}
										renderItem={this.createPaymentList}
									/> : null}
								{/* COMMENT RES */}
								{/* <View style={style.subContainer}> */}
								<View style={{ marginHorizontal: 10, marginBottom: 20, marginTop: 20 }}>
									<EDRTLText style={style.titleText} title={strings("addCookingInstruction")} />
									<EDRTLView style={style.footerStyle}>
										<Icon name={"edit"} type={"feather"} color={EDColors.black} size={getProportionalFontSize(20)} style={style.editIconStyle} />
										<TextInput
											style={{
												textAlign: isRTLCheck() ? 'right' : 'left',
												flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
												marginHorizontal: 10, flex: 1, marginVertical: 20, color: EDColors.grayNew, fontFamily: EDFonts.medium
											}}
											placeholder={strings("bringCutlery")}
											value={this.state.strComment}
											onChangeText={this.onTextChangeHandler}
											maxLength={250}
										/>
									</EDRTLView>
									<Text style={[style.counterStyle, { textAlign: isRTLCheck() ? "left" : "right" }]} >
										{this.state.strComment.length}/250
									</Text>
								</View>
								{this.state.value == 1 ?
									<View style={{ marginHorizontal: 10, marginBottom: 20, marginTop: 20 }}>
										<EDRTLText style={style.titleText} title={strings("addDeliveryInstruction")} />
										<EDRTLView style={style.footerStyle}>
											<Icon name={"edit"} type={"feather"} color={EDColors.black} size={getProportionalFontSize(20)} style={style.editIconStyle} />
											<TextInput
												style={{
													textAlign: isRTLCheck() ? 'right' : 'left',
													flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
													marginHorizontal: 10, flex: 1, marginVertical: 20, color: EDColors.grayNew, fontFamily: EDFonts.medium
												}}
												placeholder={strings("doNotRing")}
												value={this.state.strDriverComment}
												onChangeText={this.onDriverTextChangeHandler}
												maxLength={250}
											/>
										</EDRTLView>
										<Text style={[style.counterStyle, { textAlign: isRTLCheck() ? "left" : "right" }]} >
											{this.state.strDriverComment.length}/250
										</Text>
									</View> : null
								}
							</View>
							:
							null}
					</View>
				</KeyboardAwareScrollView>

				{/* IF SELECT ADDRESS */}
				{this.state.isSelectAddress
					?
					<View style={style.continueStyle}>
						<EDThemeButton
							isLoading={this.state.isLoading}
							style={style.contButtonStyle}
							onPress={this.onContinueEventHandler}
							label={strings('continue')}
							textStyle={style.orderText}
						/>
					</View>
					: null}
			</BaseContainer>
		);
	}
	//#endregion
	onOptionSelection = (data) => {
		this.setState({ selectedOption: data.payment_gateway_slug })
	}
	createPaymentList = item => {
		return (
			<View>
				<TouchableOpacity style={[style.subContainer, { flexDirection: isRTLCheck() ? "row-reverse" : "row" }]}
					onPress={() => this.onOptionSelection(item.item)}>
					<EDRTLView style={{ alignItems: 'center', flex: 1 }}>
						<Icon name={item.item.payment_gateway_slug === 'paypal' ? 'paypal' : item.item.payment_gateway_slug === 'cod' ? 'account-balance-wallet' : 'cc-stripe'} type={item.item.payment_gateway_slug === 'paypal' ? 'entypo' : item.item.payment_gateway_slug === 'cod' ? 'material' : 'font-awesome'} size={20} color={this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.primary : EDColors.text} style={style.paymentIconStyle} />
						<EDRTLText style={[style.paymentMethodTitle, { color: this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.black : EDColors.blackSecondary }]} title={
							this.props.lan == 'fr' ? item.item.display_name_fr : this.props.lan == 'ar' ? item.item.display_name_ar : item.item.display_name_en} />
					</EDRTLView>
					<Icon name={"check"} size={getProportionalFontSize(16)} selectionColor={EDColors.primary} color={this.state.selectedOption == item.item.payment_gateway_slug ? EDColors.primary : EDColors.white} style={{ margin: 10 }} />
				</TouchableOpacity>

			</View>
		)
	}

	//#region
	/** BACK EVENT HANDLER */
	onBackEventHandler = () => {
		this.props.navigation.goBack();
	};
	//#endregion

	//#region
	/** GET DATA */
	getData = () => {
		this.getAddressList();
	};
	//#endregion

	selectPickUp = () => {
		// this.state.value = 0;
		this.setState({ value: 0 });
	}

	selectCod = () => {
		// this.state.value = 1;
		this.setState({ value: 1 });
	}

	//#region
	/** CONTINUE EVENT HANDLER */
	onContinueEventHandler = () => {
		netStatus(status => {
			if (status) {
				if (this.props.userID === undefined || this.props.userID === null) {
					this.setState({ shouldPerformValidation: true })
					if (this.state.strFullName.trim().length > 0 &&
						this.state.strLastName.trim().length > 0 &&
						this.validationsHelper
							.validateMobile(
								this.state.strPhone,
								strings("emptyPhone"),
								this.countryCode
							)
							.trim() == "" &&
						this.validationsHelper
							.validateEmail(
								this.state.strEmail,
								""
							)
							.trim() == ""
					) {

					} else { return }
				}
				if (this.state.selectedOption !== "") {
					if (this.state.value == 0) {
						this.props.saveCheckoutDetails(this.checkoutData);
						this.state.strFullName !== "" ?
							this.props.saveGuestDetails({
								first_name: this.state.strFullName,
								last_name: this.state.strLastName,
								phone_number: this.state.strPhone,
								phone_code: this.countryCode,
								email: this.state.strEmail
							}) : null

						this.props.navigation.navigate('CheckOutContainer', {
							delivery_status: 'PickUp',
							latitude: '',
							longitude: '',
							address_id: '',
							payment_option: this.state.selectedOption,
							comment: this.state.strComment,
							delivery_instructions: this.state.strDriverComment,
						});
					}
					else if (this.state.value == -1) {
						showValidationAlert(strings("noDeliveryOption"))
					}
					else {
						if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== '') {
							if (this.state.selectedIndex === -1)
								showValidationAlert(strings('noAddressMsg'));
							else
								this.checkOrderAPI();
						}
						else {
							if (this.state.guestAddress === undefined)
								showValidationAlert(strings('guestAddressError'));
							else
								this.checkOrderAPI();
						}

					}
				}
				else {
					if (this.paymentOptions !== undefined)
						showValidationAlert(strings("choosePaymentError"))
					else
						showValidationAlert(strings("noPaymentMethods"))
				}

			} else {
				this.strOnScreenMessage = strings('noInternetTitle');
			}
		});
	};
	//#endregion





	setGuestAddress = address => {
		this.props.saveGuestAddress(address)
		this.setState({ guestAddress: address })
	}

	//#region ADD ADDRESS
	onAddAddressEventHandler = () => {
		if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== '')
			this.props.navigation.navigate('DetailedAddressListContainer', {
				isSelectAddress: true,
				resId: this.props.navigation.state.params.resId,
			})
		else
			this.navigateTomap("", 3)
	};
	//#endregion

	//#region
	/** on EDIT PRESS */

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
								this.props.navigation.navigate('AddressMapContainer', {
									getData: this.getData,
									totalCount: this.arrayAddress.length,
									isEdit: index
								});
							case 2:
								var sendData = {
									addressId: item.address_id,
									addressLine2: item.landmark,
									addressLine1: item.address,
									latitude: item.latitude,
									longitude: item.longitude,
									city: item.city,
									zipCode: item.zipcode,
								};
								this.props.navigation.navigate('AddressMapContainer', {
									getDataAll: sendData,
									getData: this.getData,
									totalCount: this.arrayAddress.length,
									isEdit: index
								});
							case 3:
								this.props.navigation.navigate('AddressMapContainer', {
									getGuestAddress: this.setGuestAddress,
									totalCount: 0,
									isGuest: true,
									isEdit: index
								})
								break;
						}
					},
					() => {
						showDialogue(
							strings('locationPermission'),
							[{ text: strings('dialogCancel'), isNotPreferred: true }],
							'',
							() => {
								if (Platform.OS == "ios")
									Linking.openURL('app-settings:');
								else
									Linking.openSettings();
							}
						);
					}
				);
			} else {
				showNoInternetAlert();
			}
		});
	};

	//#region
	/** ADDRESS ID EVENT HANDLER */
	onDeleteAddressEventHandler = address_id => {
		showDialogue(
			strings('deleteAddressConfirm'),
			[
				{
					text: strings('dialogCancel'),
					isNotPreferred: true
				},
			],
			'',
			() => this.deleteAddress(address_id)
		);
	};
	//#endregion

	//#region
	/** CREATE ADDRESS LIST */
	renderAddressList = ({ item, index }) => {
		console.log("INDEX OF ADDRESS:::::::::::", index)
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
	};
	//#endregion

	//#region CHECK ORDER
	/**
	 * @param { Success Response Object } onSuccess
	 */
	onSucessCheckOrder = onSuccess => {
		debugLog('CHECK API SUCCESS ::::::: ', onSuccess);
		if (onSuccess.status === 0) {
			this.setState({ isLoading: false });
			showDialogue(onSuccess.message, [], '');
		} else {
			this.state.strFullName !== "" ?
				this.props.saveGuestDetails({
					first_name: this.state.strFullName,
					last_name: this.state.strLastName,
					phone_number: this.state.strPhone,
					phone_code: this.countryCode,
					email: this.state.strEmail
				}) : null
			this.props.navigation.navigate('CheckOutContainer', {
				delivery_status: this.state.value === 1 ? 'Delivery' : 'PickUp',
				latitude: this.state.guestAddress !== undefined ? this.state.guestAddress.latitude : this.arrayAddress[this.state.selectedIndex].latitude,
				longitude: this.state.guestAddress !== undefined ? this.state.guestAddress.latitude : this.arrayAddress[this.state.selectedIndex].longitude,
				address_id: this.state.guestAddress !== undefined ? undefined : this.arrayAddress[this.state.selectedIndex].address_id,
				is_cod: this.state.cash,
				comment: this.state.strComment,
				delivery_instructions: this.state.strDriverComment,
				payment_option: this.state.selectedOption
			});
		}
	};

	/**
	 * @param { Failure Response Object } onFailure
	 */
	onFailureCheckOrder = onfailure => {
		this.setState({ isLoading: false });
	};

	/** CALL API FOR CHECK ORDER */
	checkOrderAPI = () => {
		let param = {
			language_slug: this.props.lan,
			// token: this.props.token,
			user_id: this.props.userID,
			order_delivery: 'Delivery',
			users_latitude: this.state.guestAddress !== undefined ? this.state.guestAddress.latitude : this.arrayAddress[this.state.selectedIndex].latitude,
			users_longitude: this.state.guestAddress !== undefined ? this.state.guestAddress.longitude : this.arrayAddress[this.state.selectedIndex].longitude,
			restaurant_id: this.props.navigation.state.params.resId,
			isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0

		};
		this.setState({ isLoading: true });
		netStatus(status => {
			if (status) {
				checkOrder(param, this.onSucessCheckOrder, this.onFailureCheckOrder, this.props);
			} else {
				this.setState({ isLoading: false });
				this.strOnScreenMessage = strings('noInternetTitle');
			}
		});
	};
	//#endregion

	//#region LOAD ADDRESS
	/**
	 * @param { Success Response Object } onSuccess
	 */
	onSuccessLoadAddress = onSuccess => {
		console.log('[]][][][]]]][][][][ LOAD ADDRESS SUCCCESS', onSuccess);
		this.strOnScreenMessage = '';

		if (onSuccess != undefined) {
			if (onSuccess.status == RESPONSE_SUCCESS) {
				console.log("::onSuccess.address !== undefined && onSuccess.address.length > 0", onSuccess.address, onSuccess.address.length)
				if (onSuccess.address !== undefined && onSuccess.address.length > 0) {
					this.setState({ selectedIndex: 0 })
					this.arrayAddress = onSuccess.address;
					this.forceUpdate();
					console.log("Address Array[][][][]", this.arrayAddress)
				} else {
					this.arrayAddress = [];
					this.strOnScreenMessage = strings('noDataFound');
				}

				this.setState({ isLoading: false });
			} else {
				// showValidationAlert(onSuccess.message);
				this.strOnScreenMessage = strings('noDataFound');
				this.setState({ isLoading: false });
			}
		} else {
			console.log("onSuccess.status", onSuccess.status)
			// showValidationAlert(strings("generalWebServiceError"));
			this.strOnScreenMessage = strings('generalWebServiceError');
			this.setState({ isLoading: false });
		}
	};

	/**
	 * @param { FAilure Response Objetc } onfailure
	 */
	onFailureLoadAddress = onFailure => {
		console.log('[]][][][]]]][][][][ LOAD ADDRESS FAILURE', onFailure);
		this.strOnScreenMessage = '';
		this.strOnScreenSubtitle = '';
		this.strOnScreenMessage = strings('generalWebServiceError');
		this.setState({ isLoading: false });
		// showValidationAlert(strings("noInternet"));
	};

	onWillFocus = () => {
		this.setState({ isLoading: false, isPaymentLoading: false })
		if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "")
			this.getAddressList()
		this.getPaymentOptionsAPI()
	}

	/** GET ADDRESS API */
	getAddressList = () => {
		debugLog("TEST ::::::",this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "", this.props.userID )
		this.strOnScreenMessage = '';
		this.strOnScreenSubtitle = '';
		this.setState({ isLoading: true, selectedIndex: -1 });
		netStatus(status => {
			if (status) {
				let param = {
					language_slug: this.props.lan,
					user_id: this.props.userID || 0,
					// token: this.props.token,
					showonly_main: 1
				};
				getAddress(param, this.onSuccessLoadAddress, this.onFailureLoadAddress, this.props);
			} else {
				// showValidationAlert(strings("noInternet"));
				this.strOnScreenMessage = strings('noInternetTitle');
				this.strOnScreenSubtitle = strings('noInternet');
				this.setState({ isLoading: false });
			}
		});
	};
	//#endregion

	getPaymentOptionsAPI = () => {
		netStatus(isConnected => {
			if (isConnected) {
				this.setState({ isPaymentLoading: true })

				var params = {
					language_slug: this.props.lan,
					user_id: this.props.userID,
					is_dine_in: '0',
					restaurant_id: this.props.navigation.state.params.resId,
					isLoggedIn: (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") ? 1 : 0
				}
				getPaymentList(params, this.onSuccessPaymentList, this.onFailurePaymentList, this.props)
			} else {
				showNoInternetAlert()
			}
		})
	}

	onSuccessPaymentList = onSuccess => {
		console.log(':::::::: PAYMENT SUCCESS', onSuccess)
		if (onSuccess.Payment_method !== undefined && onSuccess.Payment_method !== null && onSuccess.Payment_method.length !== 0) {
			this.paymentOptions = onSuccess.Payment_method
			this.setState({ selectedOption: onSuccess.Payment_method[0].payment_gateway_slug })
			this.forceUpdate();
		}
		if (onSuccess.orderMode !== undefined && onSuccess.orderMode !== null && onSuccess.orderMode !== '') {
			let orderModes = onSuccess.orderMode.split(',')
			if (orderModes.length == 1) {
				if (orderModes.includes("Delivery") && this.state.value == 0) {
					this.setState({ value: 1 })
				}
				if (orderModes.includes("PickUp") && this.state.value == 1) {
					this.setState({ value: 0 })
				}
			}
			this.setState({ availableOrderModes: orderModes })
		}
		else {
			this.setState({ value: -1 })

		}
		this.setState({ isPaymentLoading: false })

	}

	onFailurePaymentList = onFailure => {
		console.log('::::::::::: PAYMENT FALURE', onFailure)
		showValidationAlert(onFailure.message)
		this.setState({ isPaymentLoading: false })
	}



	//#region DELETE ADDRESS
	/**
	 * 
	 * @param { Success Response Object } onSuccess 
	 */
	onSuccessDeleteAddress = onSuccess => {
		console.log('Address Delete response ::::: ', onSuccess);
		if (onSuccess != undefined) {
			if (onSuccess.status == RESPONSE_SUCCESS) {
				this.getAddressList();
			} else {
				showValidationAlert(onSuccess.message);
				this.setState({ isLoading: false });
			}
		} else {
			this.strOnScreenMessage = strings('generalWebServiceError');
			// showValidationAlert(strings("generalWebServiceError"));
			this.setState({ isLoading: false });
		}
	};

	/**
	 * 
	 * @param {Fauilre Response Objewtc} onFailure 
	 */
	onFailureDeleteAddress = onFailure => {
		this.setState({ isLoading: false });
		this.strOnScreenMessage = strings('noInternet');
	};

	/** DELETE API */
	deleteAddress(addId) {
		netStatus(status => {
			if (status) {
				this.setState({ isLoading: true });
				let param = {
					language_slug: this.props.lan,
					user_id: this.props.userID,
					address_id: addId,
					// token: this.props.token,
				};
				deleteAddress(param, this.onSuccessDeleteAddress, this.onFailureDeleteAddress, this.props);
			} else {
				this.strOnScreenMessage = strings('noInternetTitle');
				this.strOnScreenSubtitle = strings('noInternet');
			}
		});
	}
	//#endregion

	addressSelectionAction = index => {
		this.setState({ selectedIndex: index });
	};
}
//#endregion

//#region STYLES
const style = StyleSheet.create({
	selected: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: EDColors.white,
		borderRadius: 5,
		padding: 5,
		borderWidth: 1,
		borderColor: EDColors.primary,
		marginTop: 10,
		marginLeft: 10,
		marginRight: 10,
	},
	deliveryTextStyle: { color: EDColors.primary, textAlignVertical: "center", marginTop: 2, marginHorizontal: 5 },
	touchableView: { marginVertical: 15, justifyContent: "space-between", marginHorizontal: 15 },
	headerIconStyle: { marginHorizontal: 15 },
	deliveryOptionView: { marginHorizontal: 20, backgroundColor: EDColors.white, borderWidth: 2, borderRadius: 16, borderColor: EDColors.white, marginBottom: 10, shadowColor: "rgba(0, 0, 0, 0.05)", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, },
	childDeliveryOptionView: {},
	footerStyle: { marginTop: 20, marginHorizontal: 10, backgroundColor: EDColors.white, borderWidth: 2, borderColor: EDColors.separatorColorNew, borderRadius: 16, alignItems: "center" },
	editIconStyle: { marginHorizontal: 15 },
	continueStyle: {
		width: '100%',
		height: metrics.screenHeight * 0.08,
		backgroundColor: EDColors.backgroundLight,
		marginBottom: 10,
	},
	counterStyle: {
		marginHorizontal: 20,
		marginTop: 5,
		fontSize: getProportionalFontSize(12),
		color: EDColors.text
	},
	contButtonStyle: {
		alignSelf: 'center',
		backgroundColor: EDColors.primary,
		justifyContent: 'center',
		marginTop: 5,
		marginBottom: 5,
		width: '90%',
		borderRadius: 16,
		height: heightPercentageToDP('7.5%'),
		textAlignVertical: "center",
		paddingVertical: 0
	},
	addView: {
		alignItems: 'center',
		padding: 10,
	},
	titleText: {
		color: EDColors.black,
		fontSize: getProportionalFontSize(15),
		fontFamily: EDFonts.semiBold,
		marginHorizontal: 10,
		flex: 1,
	},
	noAddress: {
		color: EDColors.error,
		fontSize: getProportionalFontSize(15),
		fontFamily: EDFonts.regular,
		marginHorizontal: 15,
		marginVertical: 10
	},
	textStyle: {
		fontSize: getProportionalFontSize(14),
		fontFamily: EDFonts.regular,
		flex: 1,
		padding: 5,
	},
	orderView: { fontSize: getProportionalFontSize(15), padding: 10, margin: 10, fontFamily: EDFonts.semiBold, color: EDColors.black, },
	orderText: { fontSize: getProportionalFontSize(16) },
	subContainer: {
		flexDirection: "row",
		margin: 10,
		backgroundColor: EDColors.transparentBackground,
		// borderRadius: 6,
		padding: 10,
		// justifyContent: "center",
		marginHorizontal: 20,
		backgroundColor: EDColors.white, borderWidth: 2, borderRadius: 16, borderColor: EDColors.white, shadowColor: EDColors.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2,
	},
	paymentMethodTitle: {
		// flex: 1,
		fontFamily: EDFonts.medium,
		fontSize: getProportionalFontSize(14),
		color: "#000",
		marginVertical: 10,
		marginStart: 10
	},
	paymentIconStyle: { marginHorizontal: 10 },
	paymentHeader: {
		fontSize: getProportionalFontSize(16),
		fontFamily: EDFonts.bold,
		color: EDColors.black,
		marginHorizontal: 15,
		marginTop: 20
	},
	contactView: {
		marginVertical: 10,
		marginHorizontal: 15
	}
});
//#endregion

export default connect(
	state => {
		return {
			userID: state.userOperations.userIdInRedux,
			token: state.userOperations.phoneNumberInRedux,
			cartCount: state.checkoutReducer.cartCount,
			checkoutDetail: state.checkoutReducer.checkoutDetail,
			lan: state.userOperations.lan,
			orderModeInRedux: state.userOperations.orderMode,
			countryArray: state.userOperations.countryArray,

		};
	},
	dispatch => {
		return {
			saveCheckoutDetails: checkoutData => {
				dispatch(saveCheckoutDetails(checkoutData));
			},
			saveGuestAddress: checkoutData => {
				dispatch(saveGuestAddress(checkoutData));
			},
			saveGuestDetails: checkoutData => {
				dispatch(saveGuestDetails(checkoutData));
			},
		};
	}
)(AddressListContainer);

import React from 'react';
import { FlatList, Linking, Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import { NavigationEvents } from 'react-navigation';
import { connect } from 'react-redux';
import AddressComponent from '../components/AddressComponent';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDRTLText from '../components/EDRTLText';
import EDRTLView from '../components/EDRTLView';
import EDThemeButton from '../components/EDThemeButton';
import { strings } from '../locales/i18n';
import { saveCheckoutDetails } from '../redux/actions/Checkout';
import { showDialogue, showNoInternetAlert, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import {  getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, PAYMENT_TYPES } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { checkPermission } from '../utils/PermissionServices';
import metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { deleteAddress, getAddress, addAddress } from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';
import { Icon } from 'react-native-elements';
import Assets from '../assets';


class DetailedAddressListContainer extends React.PureComponent {
	//#region LIFE CYCLE METHODS

	constructor(props) {
		super(props);

		this.strOnScreenMessage = '';
		this.strOnScreenSubtitle = '';
		this.state = {
			isLoading: false,
			addressLine1: '',
			addressLine2: '',
			value: 0,
			latitude: 0.0,
			longitude: 0.0,
			city: '',
			zipCode: '',
			addressId: '',
			isSelectAddress: this.props.navigation.state.params.isSelectAddress,
			selectedIndex: 0,
			cash: false
		};
		this.checkoutData = this.props.checkoutDetail;
	}

	//#region




	/** RENDER METHOD */
	render() {
		return (
			<BaseContainer
				title={strings('myAddress')}
				left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
				right={[]}
				onLeft={this.onBackEventHandler}
				loading={this.state.isLoading}
				onConnectionChangeHandler={this.getAddressList}
			>
				{/* MAIN VIEW */}
				<View pointerEvents={this.state.isLoading ? 'none' : 'auto'} style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
					<NavigationEvents onWillFocus={this.getAddressList} />

					{/* ADD ADDRESS */}
					<EDRTLView style={style.addView}>
						<TouchableOpacity onPress={this.onAddAddressEventHandler} style={[style.addButtonStyle, {flexDirection: isRTLCheck() ? "row-reverse" : "row"}]} >
							<Icon name = "add" size = {getProportionalFontSize(26)} style={style.addIconStyle} color={EDColors.blackSecondary} />
							<EDRTLText title={strings('addNewAddress')} style={style.titleText} />
						</TouchableOpacity>
					</EDRTLView>

					{/* ADDRESS LIST */}
					{this.arrayAddress != undefined && this.arrayAddress != null && this.arrayAddress.length > 0
						?
						<FlatList
							data={this.arrayAddress}
							extraData={this.state}
							showsVerticalScrollIndicator={true} //R.K 07-01-2021
							ref="flatList"
							keyExtractor={(item, index) => item + index}
							renderItem={this.renderAddressList}
						/>
						:
						this.strOnScreenMessage.trim().length > 0
							? <View style={{ flex: 1 }}>
								<EDPlaceholderComponent
									title={this.strOnScreenMessage}
									subTitle={this.strOnScreenSubtitle}
									placeholderIcon={Assets.logo}
								/>
							</View>
							: <View />
					}
				</View>
				{/* IF SELECT ADDRESS */}
				{ this.arrayAddress != undefined && this.arrayAddress != null && this.arrayAddress.length > 1
					?
					<View>

						<View style={style.continueStyle}>
							<EDThemeButton
								isLoading={this.state.isLoading}
								style={style.contButtonStyle}
								onPress={this.onContinueEventHandler}
								label={strings('setAsDefault')}
								textStyle={style.orderText}
							/>
						</View>
					</View>
					: null}
			</BaseContainer>
		);
	}
	//#endregion

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

	//#region


	/** CALL API  */
	saveAddress(selectedAddress) {
		netStatus(status => {
			if (status) {

				this.setState({ isLoading: true });
				let param = {
					language_slug: this.props.lan,
					address: selectedAddress.address,
					landmark: selectedAddress.landmark,
					latitude: selectedAddress.latitude,
					longitude: selectedAddress.longitude,
					city: selectedAddress.city,
					zipcode: selectedAddress.zipcode,
					is_main: "1",
					user_id: this.props.userID,
					// token: this.props.token,
					address_id: selectedAddress.address_id,
				};
				addAddress(param, this.onSuccessSaveAddress, this.onFailureSaveAddress, this.props);

			} else {
				showValidationAlert(strings('noInternet'));
			}
		});
	}

	/**
 * @param { Success Response object } onSuccess
 */
	onSuccessSaveAddress = onSuccess => {
		if (onSuccess != undefined) {
			if (onSuccess.status == RESPONSE_SUCCESS) {
				this.props.navigation.goBack();
			} else {
				showValidationAlert(onSuccess.message);
				this.setState({ isLoading: false });
			}
		} else {
			showValidationAlert(strings('generalWebServiceError'));
			this.setState({ isLoading: false });
		}
	};

	/**
     * @param { FAiure response Object } onFailure
     */
	onFailureSaveAddress = onFailure => {
		this.setState({ isLoading: false });
		showValidationAlert(strings('generalWebServiceError'));
	};

	//#endregion

	//#region
	/** CONTINUE EVENT HANDLER */
	onContinueEventHandler = () => {
		this.saveAddress(this.arrayAddress[this.state.selectedIndex])
	};
	//#endregion

	//#region ADD ADDRESS
	onAddAddressEventHandler = () => {
		this.navigateTomap('', 1);
	};
	//#endregion

	//#region
	/** on EDIT PRESS */

	navigateTomap = (item, index) => {
		console.log("value::", index)
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
									is_main: item.is_main
								};
								this.props.navigation.navigate('AddressMapContainer', {
									getDataAll: sendData,
									getData: this.getData,
									totalCount: this.arrayAddress.length,
									isEdit: index

								});
								break;
						}
					},
					() => {
						showDialogue(
							strings('locationPermission'),
							[{ text: strings('dialogCancel') , isNotPreferred : true}],
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
					isNotPreferred : true
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
		return (
			<AddressComponent
				data={item}
				index={index}
				isSelected={this.state.selectedIndex === index ? true : false}
				onPress={this.addressSelectionAction}
				deleteAddress={this.onDeleteAddressEventHandler}
				editAddress={this.navigateTomap}
			/>
		);
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
				if (onSuccess.address !== undefined && onSuccess.address.length > 0) {
					this.arrayAddress = onSuccess.address
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

	/** GET ADDRESS API */
	getAddressList = () => {
		this.strOnScreenMessage = '';
		this.strOnScreenSubtitle = '';
		this.setState({ isLoading: true });
		netStatus(status => {
			if (status) {
				let param = {
					language_slug: this.props.lan,
					user_id: this.props.userID || 0,
					// token: this.props.token,
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
	continueStyle: {
		width: '100%',
		height: metrics.screenHeight * 0.09,
		backgroundColor: EDColors.backgroundLight,
		marginBottom: 10,
	},
	contButtonStyle: {
		alignSelf: 'center',
		backgroundColor: EDColors.primary,
		justifyContent: 'center',
		marginTop: 10,
		height: metrics.screenHeight * 0.07,
		width: '82.5%',
		borderRadius: 16
	},
	addView: {
		alignItems: 'center',
		padding: 10,
		marginHorizontal : 15
	},
	addButtonStyle: { width: "100%", borderColor: "#EDEDED", borderRadius: 16, borderWidth: 2, alignItems: "center", backgroundColor: "#F6F6F6" },
	addIconStyle: {alignSelf : "center", marginHorizontal : 15, },
	titleText: {
		color: EDColors.blackSecondary,
		fontSize: getProportionalFontSize(16),
		fontFamily: EDFonts.semiBold,
		marginHorizontal: 15,
		marginVertical: 20
	},
	textStyle: {
		fontSize: getProportionalFontSize(14),
		fontFamily: EDFonts.regular,
		flex: 1,
		padding: 5,
	},
	orderView: { fontSize: getProportionalFontSize(16), padding: 10, backgroundColor: EDColors.white, margin: 10 },
	orderText: { fontSize: getProportionalFontSize(16), fontFamily: EDFonts.medium, marginVertical: 15 },
	separatorView: { marginHorizontal: 10, borderColor: EDColors.placeholder, borderWidth: 0.5 },
	subContainer: {
		flexDirection: "row",
		margin: 10,
		backgroundColor: "#fff",
		borderRadius: 6,
		padding: 10,
		// justifyContent: "center"
	},
	paymentMethodTitle: {
		// flex: 1,
		fontFamily: EDFonts.regular,
		fontSize: getProportionalFontSize(14),
		color: "#000",
		marginVertical: 10,
		marginStart: 10
	},
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
		};
	},
	dispatch => {
		return {
			saveCheckoutDetails: checkoutData => {
				dispatch(saveCheckoutDetails(checkoutData));
			},
		};
	}
)(DetailedAddressListContainer);

import React from 'react';
import { ScrollView, StyleSheet, View , Image} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import Assets from '../assets';
import EDRTLTextInput from '../components/EDRTLTextInput';
import ProgressLoader from '../components/ProgressLoader';
import { strings } from '../locales/i18n';
import { getUserToken } from '../utils/AsyncStorageHelper';
import { showDialogue, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS, TextFieldTypes } from '../utils/EDConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import { changePassword } from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import BaseContainer from './BaseContainer';

class ChangePasswordContainer extends React.PureComponent {
	//#region  LIFE CYCLE METHODS

	/** CONSTRUCTOR */
	constructor(props) {
		super(props);
		this.validationsHelper = new Validations();
	}

	/** STATE */
	state = {
		isLoading: false,
		oldPassword: '',
		newPassword: '',
		cnfPassword: '',
		oldPasswordError: '',
		newPasswordError: '',
		cnfPasswordError: '',
		shouldPerformValidation: false,
	};

	/** WILL MOUNT */
	componentDidMount() {
		this.getUserDetails();
	}

	// RENDER METHOD
	render() {
		return (
			<BaseContainer
				title={strings('changePassword')}
				left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
				right={[{url: 'done' , type: 'MaterialIcons' }]}
				onRight={this.onRightClickEvent}
				onLeft={this.onLeftClickEvent}>

				{/* PROGRESS LOADER */}
				{this.state.isLoading ? <ProgressLoader /> : null}

				{/* MAIN VIEW */}
				<View style={{ flex: 1 }}>
				<KeyboardAwareScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1}}
                    // contentContainerStyle={{ flex: 1 }}
                    keyboardShouldPersistTaps= "handled"
                    enableAutoAutomaticScroll={false}
                    enableOnAndroid
                    enabled
                >
							{/* Image */}
							<Image
								source={Assets.bg_password}
								style={styles.imgStyle}
							/>
						<View style={styles.mainViewStyle}>
							{/* OLD PASSWORD */}
							<EDRTLTextInput
								icon="lock"
								style={{}}
								prefix={true}
								type={TextFieldTypes.password}
								identifier={'oldPassword'}
					 			placeholder={strings('oldPassword')}
								onChangeText={this.textFieldTextDidChangeHandler}
								initialValue={this.state.oldPassword}
								errorFromScreen={
									this.state.shouldPerformValidation
										? this.validationsHelper.checkForEmpty(
											this.state.oldPassword,
											strings('oldPasswordMsg')
										)
										: ''
								}
							/>

							{/* NEW PASSWORD */}
							<EDRTLTextInput
								style={{}}
								icon="lock"
								prefix={true}
								type={TextFieldTypes.password}
								identifier={'newPassword'}
								placeholder={strings('newPassword')}
								onChangeText={this.textFieldTextDidChangeHandler}
								initialValue={this.state.newPassword}
								errorFromScreen={
									this.state.shouldPerformValidation
										? this.validationsHelper.validatePassword(
											this.state.newPassword,
											strings('newPasswordMsg')
										)
										: ''
								}
							/>

							{/* CONFIRM PASSWORD */}
							<EDRTLTextInput
								icon="lock"
								style={{}}
								prefix={true}
								type={TextFieldTypes.password}
								identifier={'cnfPassword'}
								placeholder={strings('confirmPassword')}
								onChangeText={this.textFieldTextDidChangeHandler}
								initialValue={this.state.cnfPassword}
								errorFromScreen={
									this.state.shouldPerformValidation
										? this.validationsHelper.validateConfirmPassword(
											this.state.newPassword,
											this.state.cnfPassword,
											strings('passwordSameMsg')
										)
										: ''
								}
							/>
						</View>
					</KeyboardAwareScrollView>
				</View>
			</BaseContainer>
		);
	}
	//#endregion

	//#region RIGHT EVENT
	onRightClickEvent = index => {
		this.setState({ shouldPerformValidation: true });
		index == 0 ? this.checkPassword() : null;
	};
	//#endregion

	//#region LIFT CLCIK
	onLeftClickEvent = () => {
		this.props.navigation.goBack();
	};
	//#endregion

	//#region TEXT CHANGE EVENTS
	/**
     * @param {Value of textfield whatever user type} value
     ** @param {Unique identifier for every text field} identifier
     */
	textFieldTextDidChangeHandler = (value, identifier) => {
		this.setState({ identifier: value });
		this.state[identifier] = value;
		this.setState({ shouldPerformValidation: false });
	};
	//#endregion

	//#region
	/** GET USER DETAILS */
	getUserDetails = () => {
		getUserToken(
			success => {
				userObj = success;
				this.setState({
					firstName: userObj.first_name,
					PhoneNumber: userObj.PhoneNumber,
				});
			},
			failure => { }
		);
	};
	//#endregion

	//#region
	/** CHECK PASSWORD */
	checkPassword() {
		if (
			this.state.oldPassword.trim().length > 0 &&
			this.state.newPassword.trim().length > 0 &&
			this.state.cnfPassword.trim().length > 0 &&
			this.validationsHelper
				.validatePassword(this.state.newPassword, strings('passwordValidationString'))
				.trim() == '' &&
			this.validationsHelper
				.validateConfirmPassword(
					this.state.newPassword,
					this.state.cnfPassword,
					strings('passwordSameMsg')
				)
				.trim() == ''
		) {
			this.setState({ isLoading: true });
			this.changePassword();
		} else {
			return true;
		}
	}
	//#endregion

	//#region CHANGE PASSWORD API
	/**
     * @param { Success Response Object } onSuccess
     * 
     */
	onSuccessChangePassword = onSuccess => {
		if (onSuccess != undefined) {
			if (onSuccess.status == RESPONSE_SUCCESS) {
				this.setState({ isLoading: false });
				showDialogue(onSuccess.message, [], '', () => {
					this.props.navigation.goBack();
				});
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
     * @param { Failure Response Object } onFailure
     */
	onFailureChangePassword = onFailure => {
		this.setState({ isLoading: false });
		debugLog(onFailure);
		showValidationAlert(strings('noInternet'));
	};

	/** CALL API */
	changePassword() {
		netStatus(status => {
			if (status) {
				let param = {
					language_slug: this.props.lan,
					user_id: parseInt(userObj.UserID) || 0,
					// token: '' + userObj.PhoneNumber,
					old_password: this.state.oldPassword,
					password: this.state.newPassword,
					confirm_password: this.state.cnfPassword,
				};
				changePassword(param, this.onSuccessChangePassword, this.onFailureChangePassword, this.props);
			} else {
				showValidationAlert(strings('noInternet'));
			}
		});
	}
	//#endregion
}

//#region STYLES
const styles = StyleSheet.create({
	mainViewStyle: {
		backgroundColor: EDColors.white,
		borderRadius: 16,
		paddingHorizontal: 15,
		margin: 10,
		paddingBottom:35,
		justifyContent:'center',
		shadowColor: EDColors.grayNew, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 3
	
	},
	imgStyle:{
		alignSelf:'center',
		justifyContent:"center",
		alignItems:'center',
		marginVertical:getProportionalFontSize(50),
	
	}
});
//#endregion

export default connect(
	state => {
		return {
			lan: state.userOperations.lan,
		};
	},
	dispatch => {
		return {};
	}
)(ChangePasswordContainer);

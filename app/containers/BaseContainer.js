import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView, StatusBar } from "react-native";
import { View } from 'native-base';
import React from 'react';
import { NavigationEvents } from 'react-navigation';
import ProgressLoader from '../components/ProgressLoader';
import { EDColors } from '../utils/EDColors';
import NavBar from './NavBar';

export default class BaseContainer extends React.Component {
	//#region LIFE CYCLE METHODS

	/** CONSTRUCTOR */
	constructor(props) {
		super(props);
		this.connectivityChangeHandler = undefined;
		this.isConnectedToInternet = true;
	}

	componentDidMount() {}

	render() {
		return (
			// <Container>
			<View style={{ flex: 1 }}>
				<NavBar
					title={this.props.title}
					left={this.props.left}
					onLeft={this.props.onLeft}
					right={this.props.right}
					rightStyle={this.props.rightStyle}
					onRight={index => {
						this.props.onRight(index);
					}}
					onLeftFC={this.props.onLeftFC}
					isLeftFC={this.props.isLeftFC}
					menuFC={this.props.menuFC}
				/>
				<StatusBar barStyle="light-content" />

				<NavigationEvents onDidFocus={this.onDidFocusBaseContainer} onWillBlur={this.onWillBlurBaseContainer} />

				{this.props.loading || this.props.isQRLoading ? <ProgressLoader qrcode={this.props.isQRLoading} /> : null}
				<SafeAreaView style={{ flex: 1, backgroundColor: EDColors.offWhite }}>
					{this.props.children}
				</SafeAreaView>
			</View>
		);
	}
	//#endregion

	//#region
	/** NETWORK CALLBACK METHODS */
	onConnectivityChangeCallback = state => {
		if (this.props.onConnectionChangeHandler !== undefined && this.isConnectedToInternet !== state.isConnected) {
			this.isConnectedToInternet = state.isConnected;
			this.props.onConnectionChangeHandler(state.isConnected);
		}
	};

	onDidFocusBaseContainer = () => {
		if (this.props.onConnectionChangeHandler !== undefined) {
			this.connectivityChangeHandler = NetInfo.addEventListener(this.onConnectivityChangeCallback);
		}
	};

	onWillBlurBaseContainer = () => {
		if (this.props.onConnectionChangeHandler !== undefined) {
			if (this.connectivityChangeHandler !== undefined) {
				this.connectivityChangeHandler();
			}
		}
	};
	//#endregion
}

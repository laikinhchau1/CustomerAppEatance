import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import EDNotificationModel from "../components/EDNotificationModel";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDPopupView from '../components/EDPopupView';
import { strings } from "../locales/i18n";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { showDialogueNew } from "../utils/EDAlert";
import { EDColors } from '../utils/EDColors';
import { APP_NAME, debugLog, getProportionalFontSize, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { netStatus } from "../utils/NetworkStatusConnection";
import { getNotification } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";


class NotificationList extends React.PureComponent {
    //#region  LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.page_no = 1;
        this.isScrolling = false;
        this.title = ""
        this.description = ""
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
    }

    state = {
        isLoading: false,
        notificationList: undefined,
        modalVisible: false
    };

    //#region 
    /** NETWORK CONNECTIVITY */
    networkConnectivityStatus = () => {
        this.state.notificationList = undefined
        debugLog("Called from WILL networkConnectivityStatus ::::")

        this.getNotificationList()
    }
    //#endregion

    componentWillReceiveProps = newProps => {
        if (this.props.screenProps.isRefresh !== newProps.screenProps.isRefresh && !this.state.isLoading) {
            this.setState({notificationList : undefined})
            debugLog("Called from WILL RECEIVE PROPS ::::", newProps)

            this.getNotificationList()
        }
    }

    componentWillUnmount() {
    }

    onDidFocusHandler = () => {
        this.state.notificationList = undefined
        debugLog("Called from onDidFocusHandler ::::")
        
        this.getNotificationList()
        this.props.saveNavigationSelection("Notification");
    }

    onPullToRefreshHandler = () => {
        this.state.notificationList = undefined
        debugLog("Called from onPullToRefreshHandler ::::")

        this.getNotificationList()
    }

    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings('notification')}
                left={'menu'}
                right={[]}
                onLeft={this.onDrawerOpen}
                onConnectionChangeHandler={this.networkConnectivityStatus}
                loading={this.state.isLoading}
            >

                {/* NOTIFICATION DETAILED */}
                {this.renderDetailedNotifocation()}

                {/* MAIN VIEW */}
                <View style={{ flex: 1 }}>

                    <NavigationEvents onDidFocus={this.onDidFocusHandler} />

                    {/* NOTID+FICATION LIST VIEW */}
                    {this.state.notificationList != undefined && this.state.notificationList.length > 0
                        ? (
                            <FlatList
                                data={this.state.notificationList}
                                // data={ [{notification_title:'Notification', notification_description :' Warning: Accessing non-existent property  Warning: Accessing non-existent property' }]}
                                showsVerticalScrollIndicator={true}
                                extraData={this.state}
                                renderItem={this.createNotificationView}
                                onEndReached={this.onEndReached}
                                onEndReachedThreshold={0.5}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.refreshing || false}
                                        colors={[EDColors.primary]}
                                        onRefresh={this.onPullToRefreshHandler}
                                    />}
                            />)
                        : (this.strOnScreenMessage || '').trim().length > 0 ? (
                            <EDPlaceholderComponent
                                title={this.strOnScreenMessage}
                                subTitle={this.strOnScreenSubtitle}
                            />) : null
                    }
                </View>
            </BaseContainer>
        );
    }
    //#endregion

    //#region 
    /** ON LEFT PRESSED */
    onDrawerOpen = () => {
        this.props.navigation.openDrawer();
    }
    //#endregion

    //#region 
    /** RENDER NOTIFICTION DEATILS MODEL */
    renderDetailedNotifocation = () => {
        return (
            <EDPopupView isModalVisible={this.state.modalVisible}>
                <EDNotificationModel
                    dissmissHandler={this.dissMissModal}
                    titleText={this.title}
                    descriptiontext={this.description}
                />
            </EDPopupView>
        )
    }
    //#endregion

    //#region 
    /** CREATE NOTIFICATION VIEW */
    createNotificationView = ({ item, index }) => {
        return (
            // Vikrant 27-07-21
            <View style={style.notiView} >
                <TouchableOpacity onPress={() => { this.title = item.notification_title, this.description = item.notification_description, this.setState({ modalVisible: true }) }}>
                    <Text style={style.textStyle} >
                        {item.notification_title}
                    </Text>
                    <Text
                        style={style.desTextStyle}
                        numberOfLines={2}
                    // ellipsizeMode={"tail"}
                    >
                        {item.notification_description}
                    </Text>
                    {/* <Text
                        style={style.desTextStyle}
                        numberOfLines={2}
                       >
                        {item.notification_time}
                    </Text> */}
                </TouchableOpacity>
            </View>

        );
    }
    //#endregion


    //#region 
    /** END REACHED OF LIST */
    onEndReached = () => {
        if (this.isScrolling && !this.state.isLoading) {
            debugLog("Called from END REached::::")

            this.getNotificationList();
        }
    }
    //#endregion

    //#region 
    /**
     * @param { Success Notification Repsonse Object } onSuccess
     */
    onSuccessNotification = (onSuccess) => {
        if (onSuccess.status == RESPONSE_SUCCESS) {
            if (onSuccess.notification != undefined && onSuccess.notification.length > 0) {
                if (this.state.notificationList != undefined && onSuccess.notification.length >= 20 &&
                    onSuccess.notificaion_count != this.state.notificationList) {
                    this.page_no = this.page_no + 1;
                    this.isScrolling = true;
                } else {
                    this.isScrolling = false;
                }
                if (onSuccess.notification.length > 0 && this.state.notificationList == undefined) {
                    this.state.notificationList = [];
                }
                this.setState({
                    notificationList: [
                        ...this.state.notificationList,
                        ...onSuccess.notification
                    ]
                });
            } else {
                this.strOnScreenMessage = strings('noNotificationTitle')
                this.strOnScreenSubtitle = strings('noNotificationMessage')
                this.setState({ notificationList: [] });
                // this.setState({ notificationList: [{notification_title:'Notification', notification_description :' Warning: Accessing non-existent property Warning: Accessing non-existent property' }] });
            }
        } else { }
        this.setState({ isLoading: false });
    }

    /**
     * @param { Failure Notification response Object } onFailure
     */
    onFailureNotification = (onFailure) => {
        this.strOnScreenMessage = strings("generalWebServiceError")
        this.setState({ isLoading: false });
        this.strOnScreenSubtitle = ''
    }


    /** GET NOTIFICATIONA API */
    getNotificationList() {
        netStatus(status => {
            this.setState({ isLoading: true });
            if (status) {
                if (this.props.userID != "" && this.props.userID != undefined && this.props.userID.length > 0) {

                    let param = {
                        language_slug: this.props.lan,
                        // token: this.props.token,
                        user_id: parseInt(this.props.userID),
                        count: 20,
                        page_no: this.page_no
                    }
                    getNotification(param, this.onSuccessNotification, this.onFailureNotification, this.props);
                } else {
                    showDialogueNew(strings("loginValidation"), [], APP_NAME, () => {
                        this.props.navigation.navigate("LoginContainer")
                    });
                }
            } else {
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
                this.setState({ isLoading: false });
            }
        });
    }
    //#endregion

    dissMissModal = () => {
        this.setState({
            modalVisible: false
        })
    }
}

export default connect(
    state => {
        return {
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
            lan: state.userOperations.lan
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            }
        };
    }
)(NotificationList);

export const style = StyleSheet.create({
    notiView: {
        margin: 10,
        padding: 15,
        borderRadius: 16,
        backgroundColor: "white",

    },
    textStyle: {
        color: EDColors.black,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(14),
    },
    desTextStyle: {
        marginTop: 10,
        color: EDColors.text,
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(12),
    },
    notiViewStyle: { height: 1, width: "100%", marginTop: 3, backgroundColor: "#F6F6F6" }
});




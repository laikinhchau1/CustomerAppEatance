import React from "react";
import { ScrollView, StyleSheet, View , RefreshControl} from "react-native";
import { NavigationEvents } from 'react-navigation';
import { connect } from "react-redux";
import EDBookingEventFlatList from "../components/EDBookingEventFlatList";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDTopTabBar from "../components/EDTopTabBar";
import { strings } from "../locales/i18n";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { showDialogue, showDialogueNew, showValidationAlert } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize, RESPONSE_SUCCESS } from "../utils/EDConstants";
import metrics from '../utils/metrics';
import { netStatus } from "../utils/NetworkStatusConnection";
import { deleteEvent, getBookingHistory } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";


class MyBookingContainer extends React.Component {
    //#region  LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            selectedIndex: 0,
            key: 1,
            eventType:0
        };

        this.strOnScreenMessageUpcoming = '';
        this.strOnScreenSubtitleUpcoming = '';
        this.strOnScreenMessagePast = '';
        this.strOnScreenSubtitlePast = '';
        this.connectivityChangeHandler = undefined
        this.refreshing = false
        this.allEventTypes = [
            {
                label: strings("bookings"),
                size: 15,
                selected: 1
            },
            {
                label: strings("tables"),
                size: 15,
                selected: 0
            }
        ]
    }

    componentWillReceiveProps = newProps => {
        console.log('refresh:', this.props.screenProps.isRefresh , newProps.screenProps.isRefresh)
        if (this.props.screenProps.isRefresh !== newProps.screenProps.isRefresh) {
            this.arrayPast = []
            this.arrayUpcoming = []
            this.getBookingDetailsAPI()
        }
    }

    onDidFocusHandler = () => {
        if (this.props.userID !== undefined && this.props.userID !== null && this.props.userID !== "") {
            this.setState({ isLoading: true })
            this.getBookingDetailsAPI()
            this.props.saveNavigationSelection("MyBooking")
        } else {
            showDialogueNew(strings("loginValidation"), [], strings("appName"), () => {
                this.props.navigation.navigate("LoginContainer", {
                    isCheckout: true
                });
            });
        }
    }

    onPullToRefreshHandler = () => {
        this.strOnScreenMessage = ""
        this.strOnScreenSubtitle = ""
        this.refreshing = false
        this.arrayPast = []
        this.arrayUpcoming = []
        this.setState({ isLoading: true })
        this.getBookingDetailsAPI();
    }



    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("myReservations")}
                left={'menu'}
                right={[]}
                onLeft={this.onBackPressedEvent}
                onConnectionChangeHandler={this.getBookingDetailsAPI}
                loading={this.state.isLoading}
            >
                <NavigationEvents onDidFocus={this.onDidFocusHandler} />
                {/* PROGRESS LOADER */}
                {/* {this.state.isLoading ? <ProgressLoader /> : null} */}

                {/* MAIN VIEW */}
                <View style={styles.flexStyle}>

                    {/* Vikrant 29-07-21 */}
                    <EDTopTabBar
                            data={[{title: strings("upcomingBooking") , onPress : this.handleIndexChange , index : 0} , 
                                        {title: strings("pastBooking") , onPress : this.handleIndexChange , index : 1} ]}
                            selectedIndex={this.state.selectedIndex}/>

                    {/* SCROLL VIEW */}
                    <ScrollView style={styles.flexStyle}
                       refreshControl={
                        <RefreshControl
                            refreshing={this.refreshing || false}
                            colors={[EDColors.primary]}
                            onRefresh={this.onPullToRefreshHandler}
                        />}
                    > 
                        <View style={{ margin: 10 }} >

                         
                            {/* CREATE VIEWS */}
                            {this.state.selectedIndex == 0 ? (
                                <View style={styles.flexStyle}>

                                    {/* UPCOMING EVENT TAB */}
                                    {this.arrayUpcoming != undefined && this.arrayUpcoming != null && this.arrayUpcoming.length > 0 ? (
                                        <EDBookingEventFlatList key={this.state.key} arrayBookingRes={this.arrayUpcoming} onEventPressHandler={this.onUpcomingEventPressHandler} />
                                    ) : (this.strOnScreenMessageUpcoming || '').trim().length > 0 ? (
                                        <View style={styles.placholderStyle}>
                                            <EDPlaceholderComponent
                                              title={this.strOnScreenMessageUpcoming} subTitle={this.strOnScreenSubtitleUpcoming} />
                                        </View>) : null}
                                </View>
                            ) : (
                                    <View style={styles.flexStyle}>

                                        {/* PAST EVENTS TAB */}
                                        {this.arrayPast != undefined && this.arrayPast != null && this.arrayPast.length > 0 ? (
                                            <EDBookingEventFlatList arrayBookingRes={this.arrayPast} onEventPressHandler={this.onUpcomingEventPressHandler} />
                                        ) : (this.strOnScreenMessagePast || '').trim().length > 0 ? (
                                            <View style={styles.placholderStyle}>
                                                <EDPlaceholderComponent
                                                  title={this.strOnScreenMessagePast} subTitle={this.strOnScreenSubtitlePast}
                                                />
                                            </View>) : null}
                                    </View>
                                )}
                        </View>
                    </ScrollView>
                </View>
            </BaseContainer>
        );
    }
    //#endregion
    //#region 
    /** ON LEFT PRESSED */
    onBackPressedEvent = () => {
        this.props.navigation.openDrawer();
    }
    //#endregion

    //#region 
    /** ON UPCOMING EVENT PRESS */
    onUpcomingEventPressHandler = (item) => {
        showDialogue(strings("deleteEvent"), [{ text: strings("dialogCancel") ,  isNotPreferred : true}], "",
            () =>
                this.deleteEvent(item));
    }
    //#endregion

    //#region 
    /** INDEX CHANGE EVENT */
    handleIndexChange = index => {
        this.setState({
            selectedIndex: index
        });
    };
    //#endregion

    //#region LOAD DATA API
    /**
     * 
     * @param {@param { Success Repsonse Object }} onSuccess 
     */
    onSuccessBookingHistory = (onSuccess) => {
        if (onSuccess != undefined) {
            if (onSuccess.upcoming_booking.length != null && onSuccess.upcoming_booking.length > 0) {
                this.arrayUpcoming = onSuccess.upcoming_booking;
            } else {
                this.arrayUpcoming = []
                this.strOnScreenMessageUpcoming = strings("noUpComingBooking")
            }
            if (onSuccess.past_booking.length != null && onSuccess.past_booking.length > 0) {
                this.arrayPast = onSuccess.past_booking;
            } else {
                this.arrayPast = []
                this.strOnScreenMessagePast = strings("noPastBooking")

            }
            this.setState({ isLoading: false });
        } else {
            this.strOnScreenMessageUpcoming = strings("generalWebServiceError")
            this.strOnScreenMessagePast = strings("generalWebServiceError")
            this.setState({ isLoading: false });
        }
    }

    /**
     * 
     * @param {@param { Failure Response object }} onFailure 
     */
    onFailureBookingHistory = (onFailure) => {
        this.strOnScreenMessageUpcoming = strings("generalWebServiceError")
        this.strOnScreenMessagePast = strings("generalWebServiceError")
        this.setState({ isLoading: false });

    }

    /** LOAD API CALL */
    getBookingDetailsAPI = () => {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true })
                let param = {
                    language_slug: this.props.lan,
                    is_table: 1 ,
                    user_id: this.props.userID  || 0
                    // token: this.props.token
                }
                getBookingHistory(param, this.onSuccessBookingHistory, this.onFailureBookingHistory, this.props);
            } else {
                this.strOnScreenMessagePast = this.strOnScreenMessageUpcoming = strings('noInternetTitle')
                this.strOnScreenSubtitlePast = this.strOnScreenSubtitleUpcoming = strings('noInternet')
                this.setState({ isLoading: false });
            }
        });
    }
    //#endregion

    //#region DELETE EVENT API
    /**
     * 
     * @param { Success Delete Response Object } onSuccess 
     */
    onSuccessDeleteEvent = (onSuccess) => {
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.getBookingDetailsAPI();
            } else {
                showValidationAlert(onSuccess.message);
                this.setState({ isLoading: false });
            }
        } else {
            showValidationAlert(strings("generalWebServiceError"));
            this.setState({ isLoading: false });
        }
    }

    /**
     * 
     * @param { Failure Delete Response Object } onFailure
     */
    onFailureDeleteEvent = (onFailure) => {
        this.setState({ isLoading: false });
        showValidationAlert(strings("noInternet"));
    }

    /**
     * 
     * @param { Current User Details } userObj 
     * @param { Event id to be Deleted } eventId 
     */
    deleteEvent(eventId) {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                let param = {
                    user_id: this.props.userID || 0,
                    // token: this.props.token,
                    event_id: eventId
                }
                deleteEvent(param, this.onSuccessDeleteEvent, this.onFailureDeleteEvent, this.props);
            } else {
                showValidationAlert(strings("noInternet"));
            }
        });
    }
    //#endregion

}

export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            userID: state.userOperations.userIdInRedux,
            token: state.userOperations.phoneNumberInRedux,
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            }
        };
    }
)(MyBookingContainer);

const styles = StyleSheet.create({
    tabStyle: {
        backgroundColor: EDColors.white,
        borderColor: EDColors.primary,
        alignSelf: "flex-start"
    },
    radioViewStyle: {
        paddingHorizontal: 5, paddingVertical: 0, margin: 0, backgroundColor: EDColors.primary, borderRadius: 0
    },
    placholderStyle:{ flex: 1, height: metrics.screenHeight * 0.8 },
    flexStyle:{flex:1},
    tabTextStyle: {
        color: EDColors.primary,
        marginLeft: 5,
        marginRight: 5,
        alignSelf: "flex-start",
        fontSize: getProportionalFontSize(15)
    },
    activeTabStyle: {
        backgroundColor: EDColors.primary
    },
    activeTabTextStyle: {
        color: "#fff"
    },
});



import React from "react";
import { Alert, Linking, Platform, ScrollView, StyleSheet, View } from "react-native";
import AutoHeightWebView from 'react-native-autoheight-webview';
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import ProgressLoader from "../components/ProgressLoader";
import { strings } from "../locales/i18n";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { isRTLCheck, RESPONSE_SUCCESS } from "../utils/EDConstants";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { getCMSPage } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import { EDColors } from "../utils/EDColors";
import { RefreshControl } from "react-native";

class CMSContainer extends React.PureComponent {

    //#region  LIFE CYCLE METHODS

    constructor(props) {
        super(props);
        this.refreshing = false
        this.cmsData = {};
        this.fontSize = Platform.OS == "ios" ? "18px" : "18px";
        this.meta = `
        <html `+ (isRTLCheck() ? "dir=rtl" : "dir=ltr") + `><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>`;
        this.customStyle =
            this.meta +
            "<style>* {max-width: 100%;} body { font-size:" +
            this.fontSize +
            ";}</style>";
        this.endTag = "</html>"
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.getCMSContent();
    }

    state = {
        isLoading: false
    };

    onDidFocusCMS = () => {
        console.log("which route::" , this.title , this.props.navigation.state.params)
        // this.props.saveNavigationSelection(this.title)

    }

    /** CHECK IF PROPS ARE BEING UPDATED OR NOT */
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.navigation.state.params !== undefined &&
            nextProps.navigation.state.params.routeName !== undefined &&
            this.props.navigation.state.params !== undefined &&
            this.props.navigation.state.params.routeName !== undefined &&
            this.props.navigation.state.params.routeName.cmsSlug !== nextProps.navigation.state.params.routeName.cmsSlug
        ) {
            this.getCMSContent();
        }
        return true;
    }

    onPullToRefreshHandler = () => {
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.cmsData = {};
        this.getCMSContent();

    }

    // RENDER METHOD
    render() {

        this.title =
        this.props.navigation.state.params != undefined &&
            this.props.navigation.state.params.routeName != undefined
            ? this.props.navigation.state.params.routeName.screenName
            : strings("about");
        return (

            <BaseContainer
                title={this.title}
                left={'menu'}
                onLeft={this.onBackEventHandler}
                // loading={this.state.isLoading} 
                >

                {this.state.isLoading ? <ProgressLoader/> :
                    <View
                        pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                        style={style.mainContainer}>

                        {/* NAVIGATION EVENTS */}
                        <NavigationEvents onDidFocus={this.onDidFocusCMS} />

                        {/* <EDThemeHeader title={this.title}
                        image={this.cmsData.image}
                        icon={"arrow-back"}
                        onLeftButtonPress={this.onBackEventHandler}
                    /> */}


                        {/* MAIN VIEW */}
                        <ScrollView contentContainerStyle={{ width: metrics.screenWidth }} showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.refreshing || false}
                                    colors={[EDColors.primary]}
                                    onRefresh={this.onPullToRefreshHandler}
                                />}
                        >

                            {this.cmsData.description != undefined ? (
                                <AutoHeightWebView
                                    source={{ html: this.customStyle + this.cmsData.description + this.endTag }}
                                    startInLoadingState={false}
                                    style={style.webViewStyle}
                                    scrollEnabled={false}
                                    originWhitelist={['http://*', 'https://*', 'intent://*', '*']}
                                    onShouldStartLoadWithRequest={event => {
                                        if (event.url.slice(0, 4) === 'http') {
                                            Linking.openURL(event.url);
                                            return false;
                                        } else if (event.url.slice(0, 3) === 'tel') {
                        
                                            let callNumber = "+"
                                            callNumber += event.url.slice(-12);
                                            console.log("number" ,event.url ,callNumber  )
                                            Linking.openURL(`tel://${callNumber}`);
                                            return false;
                                        } else if (event.url.startsWith('mailto:')) {
                                            this.openEmail(event);
                                            return false;
                                        }
                                        return true;
                                    }}
                                //R.K 07-01-2021 Open email
                                />

                            ) : (this.strOnScreenMessage || '').trim().length > 0 ? (
                                <ScrollView contentContainerStyle={{ width: metrics.screenWidth }} showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.refreshing || false}
                                            colors={[EDColors.primary]}
                                            onRefresh={this.onPullToRefreshHandler}
                                        />}
                                >
                                    <View style={{ flex: 1, marginTop: metrics.screenHeight * .15 }}>
                                        <EDPlaceholderComponent title={this.strOnScreenMessage} subTitle={this.strOnScreenSubtitle} />
                                    </View>
                                </ScrollView>
                            ) : null}
                        </ScrollView>
                    </View>}
            </BaseContainer>
        );
    }
    //#endregion

    //#region 
    /** ON LEFT PRESSED */
    onBackEventHandler = () => {
        this.props.navigation.openDrawer()
    }
    //R.K 07-01-2021 Open email
    openEmail = email => {
        Linking.openURL(email.url).catch(er => {
            Alert.alert('Failed to open Link: ' + er.message);
        });
        this.setState({ count: this.state.count + 1 });
    };
    //#endregion

    //#region 
    /**
     * @param { Success Response Object } onSuccess
     */
    onSuccessCMSContent = (onSuccess) => {
        if (onSuccess.status == RESPONSE_SUCCESS && onSuccess.cmsData.length > 0) {
            this.cmsData = onSuccess.cmsData[0];
            this.setState({ isLoading: false });
        } else {
            // showValidationAlert(onSuccess
            this.strOnScreenMessage = strings('noDataFound');
            // this.strOnScreenSubtitle = strings('noInternet');
            this.setState({ isLoading: false });
        }
    }

    /**
     * @param { Failure Response Object } onFailure
     */
    onFailureCMSContent = (onFailure) => {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = strings("generalWebServiceError")
    }

    /** CMS API  */
    getCMSContent() {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                let param = {
                    language_slug: this.props.lan,
                    cms_slug: this.props.navigation.state.params.routeName.cmsSlug
                }
                getCMSPage(param, this.onSuccessCMSContent, this.onFailureCMSContent);
            } else {
                this.setState({ isLoading: false })
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
            }
        });
    }
    //#endregion
}


export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
        };
    }
)(CMSContainer);

//#region  STYLES
export const style = StyleSheet.create({
    webViewStyle: {
        backgroundColor: "transparent",
        margin: 5,
        width: '95%',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: EDColors.white,
    },
});
//#endregion

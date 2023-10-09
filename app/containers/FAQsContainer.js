import React from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import Carousel from "react-native-snap-carousel";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import ProgressLoader from "../components/ProgressLoader";
import { strings } from "../locales/i18n";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { getFaqsApi } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";


class FAQsContainer extends React.PureComponent {
    //#region  LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.arrayFAQs = undefined
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.refreshing = false
        this.state = {
            isLoading: false,
            selectedSection: 0,
            questionIndex: [0]
        };
    }



    //#region 
    /** NETWORK CONNECTIVITY */
    networkConnectivityStatus = () => {
        this.getFaqs()
    }
    //#endregion


    //#region 
    /** ON LEFT PRESSED */
    onDrawerOpen = () => {
        this.props.navigation.openDrawer();
    }
    //#endregion

    onWillFocusHandler = () => {
        this.arrayFAQs = []
        this.getFaqs()
        this.props.saveNavigationSelection("FAQs");
    }

    onPullToRefreshHandler = () => {
        this.arrayFAQs = []
        this.getFaqs()
    }

    setUpFaqs = data => {
        // var formatted_data = Object.keys(data).map((key) => [Number(key), data[key]]);
        var formatted_data = Object.entries(data);
        this.arrayFAQs = []
        formatted_data.map(e => {
            this.arrayFAQs.push({
                title: e[1].name,
                data: e[1].faqs
            })
        })
    }

    /** CALL FAQs API */
    getFaqs = () => {
        netStatus(isConnected => {
            this.setState({ isLoading: true });
            if (isConnected) {
                let faqsParam = {
                    language_slug: this.props.lan,
                }
                getFaqsApi(faqsParam, this.onSucessGetFaqs, this.onFailureGetFaqs)
            }
            else {
                this.strOnScreenMessage = strings("noInternetTitle")
                this.strOnScreenSubtitle = strings("noInternet")
                this.setState({ isLoading: false })
            }
        })
    }

    onSucessGetFaqs = (onSuccess) => {
        if (onSuccess.result !== undefined &&
            onSuccess.result !== null &&
            onSuccess.result.length !== 0) {
            this.setUpFaqs(onSuccess.result)
        }
        else {
            this.strOnScreenMessage = onSuccess.message
            this.strOnScreenSubtitle = ""
        }
        this.setState({ isLoading: false })
        debugLog("FAQS SUCCESS  ::::::", this.arrayFAQs)

    }

    onFailureGetFaqs = (onFailure) => {
        debugLog("FAQS FAILURE ::::::", onFailure)
        this.strOnScreenMessage = onFailure.message || strings("generalWebServiceError")
        this.strOnScreenSubtitle = ""
        this.setState({ isLoading: false })

    }

    onSectionHeaderPress = key => {
        let test = this.state.questionIndex
        if (test.includes(key))
            test = test.filter(data => data !== key)
        else
            test.push(key)
        this.setState({ questionIndex: test })
        this.forceUpdate()

    }
    // Render FAQs header

    renderFAQHeader = (item, index) => {
        return (<TouchableOpacity
            activeOpacity={1}
            onPress={() => this.onSectionHeaderPress(index)}
        >
            <EDRTLView style={[style.sectionHeader, {
                // backgroundColor: this.state.questionIndex == index ? EDColors.primary : EDColors.white
            }]}>
                <EDRTLText title={item.question} style={[style.sectionTitle, {
                    // color: this.state.questionIndex == index ? EDColors.white : EDColors.primary
                }]} />
                <Icon name={this.state.questionIndex.includes(index) ? "remove" : "add"}
                    color={EDColors.primary}
                />
            </EDRTLView>
        </TouchableOpacity>
        )
    }

    // Render FAQs header

    renderData = (item, index) => {
        return (<View>
            {this.renderFAQHeader(item, index)}
            {this.state.questionIndex.includes(index) ?
                <View style={style.sectionBody}>
                    <EDRTLText title={item.answer} style={style.answer} />
                </View> : null}
        </View>

        )
    }

    onTabPress = (index) => {
        // this.scrollView.scrollTo({
        //     x: metrics.screenWidth * index,
        //     y: 0,
        //     animated: true,
        // });
        this.scrollView.snapToItem(index)
        this.setState({ selectedSection: index, questionIndex: [0] })
    }

    renderTab = () => {
        return (
            <FlatList
                style={{
                    flexGrow: 0
                }}
                inverted={isRTLCheck()}
                data={this.arrayFAQs}
                ref={ref => this.tabRef = ref}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    return (<EDThemeButton
                        label={item.title}
                        style={[
                            style.categoryButton,
                            {
                                height: undefined,
                                width: undefined,
                                backgroundColor: this.state.selectedSection == index ? EDColors.primary : EDColors.white,
                                borderColor: this.state.selectedSection == index ? EDColors.primary : EDColors.separatorColorNew

                            }]}
                        textStyle={[
                            style.categoryButtonTitle,
                            {
                                color: this.state.selectedSection == index ? EDColors.white : EDColors.blackSecondary,
                            }]}
                        onPress={() => this.onTabPress(index)}
                    />
                    )
                }}
            />
        )
    }

    renderContent = (data) => {
        return (<View style={style.mainView}>
            <FlatList
                data={data.data}
                renderItem={({ item, index }) => this.renderData(item, index)}
                bounces={false}

                showsVerticalScrollIndicator={false}
            />

        </View>)
    }


    //#region 



    onMomentumScrollEnd = index => {
        this.setState({ selectedSection: index, questionIndex: [0] })
        this.tabRef.scrollToIndex({
            animated: true,
            index: index,
            viewPosition: 1
        })
    }

    // RENDER METHOD
    render() {
        return (<BaseContainer
            title={strings('faqs')}
            left={'menu'}
            right={[]}
            onLeft={this.onDrawerOpen}
            onConnectionChangeHandler={this.networkConnectivityStatus}
        // loading={this.state.isLoading}
        >
            {this.state.isLoading ? <ProgressLoader /> : null}
            <NavigationEvents onWillFocus={this.onWillFocusHandler} />

            {this.arrayFAQs !== undefined && this.arrayFAQs !== null && this.arrayFAQs instanceof Array && this.arrayFAQs.length !== 0 ?
                <View
                    style={{ flex: 1, paddingTop: 10 }}
                >
                    {this.renderTab()}
                    <Carousel
                        inverted={isRTLCheck()}
                        ref={(c) => { this.scrollView = c; }}
                        data={this.arrayFAQs}
                        renderItem={({ item, index }) => this.renderContent(item)}
                        sliderWidth={metrics.screenWidth}
                        itemWidth={metrics.screenWidth}
                        onSnapToItem={this.onMomentumScrollEnd}
                        lockScrollWhileSnapping={true}
                        pagingEnabled={true}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.refreshing || false}
                                titleColor={EDColors.textAccount}
                                title={strings("refreshing")}
                                tintColor={EDColors.textAccount}
                                colors={[EDColors.textAccount]}
                                onRefresh={this.onPullToRefreshHandler}
                            />
                        }
                    />


                </View>
                : (this.strOnScreenMessage || '').trim().length > 0 ? (
                    <ScrollView contentContainerStyle={{ flex: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.refreshing || false}
                                titleColor={EDColors.textAccount}
                                title={strings("refreshing")}
                                tintColor={EDColors.textAccount}
                                colors={[EDColors.textAccount]}
                                onRefresh={this.onPullToRefreshHandler}
                            />
                        }
                    >
                        <EDPlaceholderComponent
                            title={this.strOnScreenMessage}
                            subTitle={this.strOnScreenSubtitle}
                        />
                    </ScrollView>
                ) : null

            }

        </BaseContainer>
        );
    }
    //#endregion




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
)(FAQsContainer);

export const style = StyleSheet.create({
    mainView: {
        width: metrics.screenWidth,
        padding: 10,
        marginBottom: 10
    },
    categoryButton: {
        // padding: 20,
        marginHorizontal: 10,
        borderRadius: 8,
        marginTop: 5,
        marginVertical: 5,
        borderWidth: 2

    },
    sectionHeader: {
        // backgroundColor: EDColors.white,
        // borderRadius: 8,
        paddingHorizontal: 10,
        alignItems: "center",
        borderColor: EDColors.separatorColorNew,
        marginBottom: 5,
        justifyContent: "space-between",
        flex: 1,
    },
    sectionBody: {
        // backgroundColor: EDColors.white,
        paddingTop: 0,
        padding: 10,
        marginBottom: 10
    },
    categoryButtonTitle: {
        color: EDColors.black,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        paddingVertical: 0,
        marginVertical: 15
    },
    sectionTitle: {
        color: EDColors.black,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(15),
        paddingVertical: 0,
        marginVertical: 10
    },
    question: {
        color: EDColors.black,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(15),
        marginBottom: 10
    },
    answer: {
        color: EDColors.text,
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(14),
    },

});




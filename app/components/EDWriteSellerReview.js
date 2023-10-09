/* eslint-disable react-native/no-inline-styles */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Platform, StyleSheet, View, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import StarRating from "react-native-star-rating";
import { strings } from '../locales/i18n';
import { showDialogue, showNoInternetAlert, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { default as Metrics, default as metrics } from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { addOrderReviewAPI } from '../utils/ServiceManager';
import Validations from '../utils/Validations';
import EDImage from './EDImage';
import EDRTLText from './EDRTLText';
import EDRTLTextInput from './EDRTLTextInput';
import EDRTLView from './EDRTLView';
import EDThemeButton from './EDThemeButton';
import Assets from '../assets';
import { ScrollView } from 'react-native';


export default class EDWriteSellerReview extends Component {

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.validationsHelper = new Validations()
        this.orderData = this.props.orderData
    }

    state = {
        selectedOrderRating: 1,
        selectedDriverRating: 1,
        shouldPerformValidation: false,
        isLoading: false,
        objReviewDetails: { orderRemarks: '', driverRemarks: '' },
    }

    render() {
        return (
            <View style={{flex : 1, justifyContent :"flex-end"}}>
            <KeyboardAwareScrollView
                pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                // style={{backgroundColor : EDColors.white}}
                enableResetScrollToCoords={true}
                resetScrollToCoords={{ x: 0, y: 0 }}
                // contentContainerStyle ={styles.scrollContainer}
                bounces={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                behavior="padding"
                enabled
                enableOnAndroid
                style={{flexGrow :0,backgroundColor: EDColors.white, borderRadius: 15}}

                >
            {/* <ScrollView
            bounces={false}
            contentContainerStyle ={styles.scrollContainer}
            > */}
                <View pointerEvents={this.state.isLoading ? 'none' : 'auto'} style={styles.container} >
                    <View style={styles.lineView}>
                        <View style={styles.line}></View>
                    </View>
                    <EDRTLView style={styles.rtlView}>
                        <EDRTLText
                            style={styles.whatIsYourRating}
                            title={strings('howDoYouRate')} />
                        <Icon onPress={this.props.dismissWriteReviewDialogueHandler} containerStyle={{ marginHorizontal: 5 }} type={'material'} size={getProportionalFontSize(25)} name={'close'} color={EDColors.text} />
                    </EDRTLView>

                    {/* ORDER DETAILS */}
                    <EDRTLView style={{}}>
                        <EDRTLView style={[styles.imageContainer, { flex: 2.5 }]} >
                            <EDImage style={styles.orderImageView}
                                source={this.orderData.restaurant_image}
                                resizeMode="cover"

                            />
                        </EDRTLView>
                        <EDRTLView style={styles.nameView}>
                            <EDRTLView >
                                <EDRTLText
                                    style={[styles.textStyle, {marginRight: isRTLCheck() ? 0 : 45}]}
                                    title={this.orderData.restaurant_name}
                                />
                            </EDRTLView>
                            <EDRTLView>
                                <EDRTLText
                                    style={[styles.simpleStyle]}
                                    title={strings('orderID') + this.orderData.order_id}
                                />
                                {/* <EDRTLText
                                    style={styles.simpleText}
                                    title={this.orderData.order_id}
                                /> */}
                            </EDRTLView>
                            <EDRTLView >
                                <EDRTLText
                                    style={styles.priceStyle}
                                    title={this.orderData.currency_symbol + this.orderData.total}
                                />
                            </EDRTLView>
                        </EDRTLView>
                    </EDRTLView>
                    <View style={styles.sapareter} />
                    {/* ORDER RATING */}
                    <EDRTLView style={styles.ratingView}>
                        <EDRTLText
                            style={styles.textStyle}
                            title={strings('rateOrder')} />
                        <StarRating
                            containerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                            starStyle={{}}
                            starSize={getProportionalFontSize(22)}
                            emptyStar={'star'}
                            fullStar={'star'}
                            halfStar={'star-half'}
                            iconSet={'MaterialIcons'}
                            maxStars={5}
                            rating={this.state.selectedOrderRating}
                            emptyStarColor={"#D4D4D4"}
                            reversed={isRTLCheck()}
                            selectedStar={this.onOrderRatingChangeHandler}
                            animation='swing'
                            halfStarEnabled={false}
                            fullStarColor={'#FDB200'} />
                    </EDRTLView>


                    {/* ORDER REMARKS INPUT */}
                    <EDRTLTextInput
                        icon={"rate-review"}
                        initialValue={this.state.objReviewDetails.orderRemarks}
                        containerStyle={{ marginHorizontal: 10 }}
                        elevation={Platform.OS == "android" ? 1 : 0}
                        textstyle={styles.textInputStyle}
                        type={TextFieldTypes.default}
                        identifier={'orderRemarks'}
                        isMandatory={true}
                        maxLength={1000}
                        placeholder={strings('orderRemarks')}
                        onChangeText={this.textFieldTextDidChangeHandler}
                        errorFromScreen={this.state.shouldPerformValidation
                            ? this.validationsHelper.checkForEmpty(
                                this.state.objReviewDetails.orderRemarks,
                                strings('requiredField'),
                            )
                            : ''
                        }
                    />

                    {/* DRIVER DETAILS */}
                    {/* {this.orderData.delivery_flag == 'delivery' && this.orderData.driver !== undefined && this.orderData.driver !== null ? */}
                    {this.orderData.delivery_flag == 'delivery' && this.orderData.driver !== undefined && this.orderData.driver !== null ?
                     
                     <>
                            <EDRTLView style={{ marginTop: 10 }}>
                                <EDRTLView style={[styles.imageContainer, { flex: 2.5, }]} >
                                    <EDImage style={styles.orderImageView}
                                        source={this.orderData.driver.image}
                                        // source={ Assets.placeholder}
                                        resizeMode="cover"
                                    />
                                </EDRTLView>
                                <EDRTLView style={styles.firstnameStyle}>
                                    <EDRTLView  >
                                        <EDRTLText
                                            // style={[styles.ratingItem, { marginLeft: 0, color: EDColors.black, marginRight: isRTLCheck() ? 0 : 45, }]}
                                            style={styles.textStyle}
                                            title={this.orderData.driver.first_name}
                                        />
                                    </EDRTLView>
                                </EDRTLView>
                            </EDRTLView>

                            <View style={styles.sapareter} />
                            {/* DRIVER RATING */}

                            <EDRTLView style={styles.ratingView}>
                                <EDRTLText
                                    style={[styles.textStyle]}
                                    title={strings('rateDriver')} />
                                <StarRating
                                    containerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                                    starStyle={{}}
                                    starSize={getProportionalFontSize(22)}
                                    emptyStar={'star'}
                                    fullStar={'star'}
                                    halfStar={'star-half'}
                                    iconSet={'MaterialIcons'}
                                    maxStars={5}
                                    rating={this.state.selectedDriverRating}
                                    emptyStarColor={"#D4D4D4"}
                                    reversed={isRTLCheck()}
                                    selectedStar={this.onDriverRatingChangeHandler}
                                    animation='swing'
                                    halfStarEnabled={false}
                                    fullStarColor={'#FDB200'} />
                            </EDRTLView>

                            {/* DRIVER REVIEW INPUT */}
                            <EDRTLTextInput
                                icon={"rate-review"}
                                initialValue={this.state.objReviewDetails.driverRemarks}
                                containerStyle={{ marginHorizontal: 10 }}
                                type={TextFieldTypes.default}
                                identifier={'driverRemarks'}
                                textstyle={styles.inputText}
                                isMandatory={true}
                                maxLength={1000}
                                elevation={Platform.OS == "android" ? 1 : 0}
                                placeholder={strings('driverRemarks')}
                                onChangeText={this.textFieldTextDidChangeHandler}
                                errorFromScreen={this.state.shouldPerformValidation
                                    ? this.validationsHelper.checkForEmpty(
                                        this.state.objReviewDetails.driverRemarks,
                                        strings('requiredField'),
                                    )
                                    : ''
                                }
                            />
                        </>
                        : null} 

                    {/* SUBMIT REVIEW BUTTON */}
                    <EDThemeButton
                        isLoadingPermission={this.state.isLoading}
                        style={styles.btnStyle}
                        textStyle={styles.btnText}
                        label={strings('submitButton')}
                        onPress={this.buttonSubmitReviewPressed}
                        isRadius={true}
                    />

                </View>
                {/* </ScrollView> */}
             </KeyboardAwareScrollView>
             </View>
            

        )
    }

    //#region HELPER METHODS
    /** TEXT CHANGE EVENTS */
    textFieldTextDidChangeHandler = (newValue, identifier) => {
        this.state.objReviewDetails[identifier] = newValue;
        this.setState({ shouldPerformValidation: false });

    }

    /** RATING CHANGE HANDLER */
    onOrderRatingChangeHandler = (star) => {
        this.setState({ selectedOrderRating: star })
    }

    onDriverRatingChangeHandler = (star) => {
        this.setState({ selectedDriverRating: star })
    }
    //#endregion

    //#region BUTTON EVENTS
    buttonSubmitReviewPressed = () => {
        this.setState({ shouldPerformValidation: true })
        if (this.orderData.delivery_flag != 'pickup' && this.orderData.delivery_flag != 'dinein' && this.orderData.driver !== undefined && this.orderData.driver !== null && this.validationsHelper.checkForEmpty(this.state.objReviewDetails.driverRemarks.trim(), strings('requiredField')).length > 0 ||
            this.validationsHelper.checkForEmpty(this.state.objReviewDetails.orderRemarks.trim(), strings('requiredField')).length > 0) {
            return;
        }
        if (this.validationsHelper.checkForEmpty(this.state.objReviewDetails.orderRemarks.trim(), strings('requiredField')).length > 0) {
            return;
        }
        this.orderData.delivery_flag == "delivery" && this.orderData.driver !== undefined && this.orderData.driver !== null ?
            this.callDriverReviewAPI() :
            this.callOrderReviewAPI()

    }
    //#endregion

    callOrderReviewAPI = () => {
        var orderRatingToPass = parseInt(this.state.selectedOrderRating);
        netStatus(isConnected => {
            if (isConnected) {
                var addOrderReviewParams = {
                    language_slug: this.props.containerProps.lan,
                    rating: orderRatingToPass,
                    driver_rating: "",
                    review: this.state.objReviewDetails.orderRemarks,
                    driver_review: "",
                    restaurant_id: this.orderData.restaurant_id,
                    order_id: this.orderData.order_id,
                    user_id: this.props.containerProps.userID,
                    driver_id: ""
                }
                this.setState({ isLoading: true })
                addOrderReviewAPI(addOrderReviewParams, this.onSuccessAddOrderReview, this.onFailureAddOrderReview, this.props.containerProps)
            } else {
                showNoInternetAlert();
            }
        })
    }

    onSuccessAddOrderReview = (objAddReviewSuccess) => {
        this.setState({ isLoading: false });
        if (objAddReviewSuccess != undefined) {
            this.props.onDismissReviewAndReload(this.state.selectedOrderRating, this.state.selectedDriverRating, this.state.objReviewDetails, objAddReviewSuccess.message)
            // showDialogue(objAddReviewSuccess.message, [], '',
            //     () =>
            //         this.props.onDismissReviewAndReload(this.state.selectedOrderRating, this.state.selectedDriverRating, this.state.objReviewDetails));
        }
    }

    onFailureAddOrderReview = (objAddReviewFailure) => {
        this.setState({ isLoading: false });
        showValidationAlert(objAddReviewFailure.message);
    }

    //#region NETWORK
    callDriverReviewAPI = () => {
        var driverRatingToPass = parseInt(this.state.selectedDriverRating);
        var orderRatingToPass = parseInt(this.state.selectedOrderRating);
        netStatus(isConnected => {
            if (isConnected) {
                var addOrderReviewParams = {
                    language_slug: this.props.containerProps.lan,
                    rating: orderRatingToPass,
                    driver_rating: driverRatingToPass,
                    review: this.state.objReviewDetails.orderRemarks,
                    driver_review: this.state.objReviewDetails.driverRemarks,
                    restaurant_id: this.orderData.restaurant_id,
                    order_id: this.orderData.order_id,
                    user_id: this.props.containerProps.userID,
                    driver_id: this.orderData.driver.driver_id
                }
                this.setState({ isLoading: true })
                addOrderReviewAPI(addOrderReviewParams, this.onSuccessAddDriverReview, this.onFailureAddDriverReview, this.props.containerProps)
            } else {
                showNoInternetAlert();
            }
        })
    }

    onSuccessAddDriverReview = (objAddReviewSuccess) => {
        this.setState({ isLoading: false });
        if (objAddReviewSuccess != undefined) {
            this.props.onDismissReviewAndReload(this.state.selectedOrderRating, this.state.selectedDriverRating, this.state.objReviewDetails, objAddReviewSuccess.message)
        //     showDialogue(objAddReviewSuccess.message, [], '',
        //         () => this.props.onDismissReviewAndReload(this.state.selectedOrderRating, this.state.selectedDriverRating, this.state.objReviewDetails));
        }
    }

    onFailureAddDriverReview = (objAddReviewFailure) => {
        this.setState({ isLoading: false });
        showValidationAlert(objAddReviewFailure.message);
    }
    //#endregion
}

const styles = StyleSheet.create({
    lineView:{ width:'100%',
        justifyContent:'center',
        alignItems:'center'
    },
    line:{
        width: metrics.screenWidth * 0.25,
        height: metrics.screenWidth * 0.01,
        backgroundColor: "#F6F6F6",
        marginVertical: 8
    },
    imageContainer: {
        marginHorizontal: 5,
        marginTop: 10,
        width: Metrics.screenWidth / 4.8,
        height: Metrics.screenWidth / 4.8,
        alignSelf: 'center',
        borderRadius:8
    },
    orderImageView: {
        width: Metrics.screenWidth / 4.8,
        height: Metrics.screenWidth / 4.8,
        // borderColor: EDColors.primary,
         borderWidth: 1,
        // borderRadius: Metrics.screenWidth / 2.4,
        overflow: 'hidden',
        backgroundColor: EDColors.offWhite,
        borderRadius:8
    },
    
    firstnameStyle: { flexDirection: 'column', flex: 7.5, alignSelf: 'center' },
    textInputStyle:{ color: EDColors.black, fontFamily: EDFonts.black },
    inputText: { color: EDColors.black, fontFamily: EDFonts.black },
    btnStyle:{
        width:'100%',
        height: metrics.screenHeight * 0.075,
        borderRadius:16
    },
    rtlView: { justifyContent: 'space-between', marginTop: 5, 
    paddingBottom: metrics.statusbarHeight },
    btnText:{
        fontFamily:EDFonts.medium ,
        fontSize: getProportionalFontSize(16),
        color:EDColors.white
    },
    simpleText:{
        fontFamily:EDFonts.regular ,
        fontSize: getProportionalFontSize(12),
        color:EDColors.text
    },
    textStyle:{
        fontFamily:EDFonts.semiBold ,
        fontSize: getProportionalFontSize(16),
        color:EDColors.black
    }, priceStyle:{
        fontFamily:EDFonts.semiBold ,
        fontSize: getProportionalFontSize(14),
        color:EDColors.black
    },
    sapareter:{
        width:'100%',
        height:1,
        backgroundColor:'#F6F6F6',
        marginVertical: 5
    },
    scrollContainer:{ },
    container: { paddingVertical: 10,  overflow: 'scroll', borderRadius: 5, paddingHorizontal: 20, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: EDColors.white, shadowOpacity: 0.25, shadowRadius: 5, shadowColor: EDColors.text, shadowOffset: { height: 0, width: 0 } },
    whatIsYourRating: { marginHorizontal: 5, color: EDColors.primary, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.bold, textAlign: 'center' },
    ratingItem: { margin: 10, color: EDColors.primary, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.regular, },
    nameView:{ flexDirection: 'column', flex: 7.5 , justifyContent: 'space-evenly'  , paddingVertical:5 , paddingHorizontal: 2},
    textInput:{ borderRadius:16 , backgroundColor:'#F6F6F6' , height : metrics.screenHeight * 0.1 },
    ratingView:{ justifyContent: 'space-between', marginTop: 5 },

})

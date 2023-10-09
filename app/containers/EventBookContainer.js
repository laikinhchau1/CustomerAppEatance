import React from "react";
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View, Platform, BackHandler, Text } from "react-native";
import { Icon } from "react-native-elements";
import { connect } from "react-redux";
import Assets from "../assets";
import EDConfirmBookingDialog from "../components/EDConfirmBookingDialog";
import EDImage from "../components/EDImage";
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDPopupView from "../components/EDPopupView";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import EDThemeButton from "../components/EDThemeButton";
import PackageContainer from "../components/PackageContainer";
import RestaurantOverview from "../components/RestaurantOverview";
import { strings } from "../locales/i18n";
import { showValidationAlert, showDialogue } from "../utils/EDAlert";
import { EDColors } from "../utils/EDColors";
import { funGetDate, funGetDateStr, funGetTime, funGetTomorrowDate, getProportionalFontSize, isRTLCheck, RESPONSE_SUCCESS } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { netStatus } from "../utils/NetworkStatusConnection";
import { bookEvent, bookTable, checkBooking, checkTable, ResDetails } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";
import EDpackageModal from "../components/EDPackageModal";
import { TextInput } from "react-native";
import metrics from "../utils/metrics";
import { heightPercentageToDP } from "react-native-responsive-screen";
import EDDatePicker from "../components/EDDatePicker";
import EDTimePicker from "../components/EDTimePicker";
import RadioGroupWithHeader from "../components/RadioGroupWithHeader";
import { Dropdown } from 'react-native-element-dropdown';
import moment from "moment";

class EventBookContainer extends React.PureComponent {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.infoMessage = '';
        this.event_min_max_txt = '';
        this.table_min_max_txt = '';
        this.eventLimit = 1;
        this.tableLimit = 1;
        this.allBookingModes = [
            {
                label: strings("eventTitle"),
                size: 15,
                selected: 1
            },
            {
                label: strings("bookTable"),
                size: 15,
                selected: 0
            }
        ]
        this.daysArray = []
        this.isTableEnable = "0"
        this.dataObj = this.props.navigation.state.params.data || [];
        this.showRestReview = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null
            ? this.props.navigation.state.params.isShowReview : false
    }

    state = {
        isLoading: false,
        personVal: 1,
        eventTime: funGetTime(new Date().toString()),
        eventDate: moment(new Date().toString()).format('MMM DD, YYYY'),

        startTime: "",
        eventDay: moment(new Date().toString()).format('MMM DD, YYYY'),
        endTime: "",
        currentDate: new Date(),
        isDatePickerVisible: false,
        isTimePickerVisible: false,
        selectedPackage: -1,
        selectedPackageId: "",
        modelVisible: false,
        modelText: "",
        isPositive: true,
        packageModal: false,
        eventMode: 0,
        strComment: "",
        dropdownHeight: 0,
        forTime: 'event',
    };

    componentDidMount() {
        this.loadResDetails()
    }
    /**
   * Review press
   */
    onReviewPress = (item) => {
        this.props.navigation.navigate("ReviewContainer", {
            content_id: item.content_id,
            resid: item.restuarant_id,
        });
    }

    // FETCH FUTURE DAYS
    fetchDays = (forDays) => {
        Object.keys(forDays).map((item, index) => {
            if (index == 0) {
                this.setState({ eventDay: item })
            }
            this.daysArray.push({ label: item, value: index })
        })


    }

    renderCustomCalender = () => {
        return (
            <EDPopupView isModalVisible={this.state.isDatePickerVisible}>
                <EDDatePicker
                    currentDate={this.state.currentDate}
                    _handleDatePicked={this._handleDatePicked}
                    confirmDate={this.confirmDate}
                    _hideDatePicker={this._hideDatePicker}
                />
            </EDPopupView>
        )
    }

    renderCustomTimePicker = () => {
        return (
            <EDPopupView isModalVisible={this.state.isTimePickerVisible}>
                <EDTimePicker
                    onCancel={this._hideTimePicker}
                    onConfirm={this._handleTimePicked}
                    isShowInterval={this.state.eventMode == 0 ? false : true}
                    value={this.getTimeValue()}
                />
            </EDPopupView>
        )
    }

    renderPackageDesc = () => {
        return (
            <EDPopupView isModalVisible={this.state.packageModal} >
                <EDpackageModal data={this.selectedPackageToDisplay} currency={this.arrayRestaurants !== undefined ? this.arrayRestaurants[0].currency_symbol : ""} onDismissHandler={this.closePackageModal} selected={this.state.selectedPackageId} selectPackage={this.selectPkg} />
            </EDPopupView>
        )
    }
    selectPkg = (is_remove) => {
        if (is_remove == true)
            this.setState({
                selectedPackage: -1,
                selectedPackageId: ""
            });
        else
            this.setState({
                selectedPackage: this.selectedPackageToDisplay_pos,
                selectedPackageId: this.selectedPackageToDisplay.package_id
            });
        this.closePackageModal()

    }
    closePackageModal = () => {
        this.setState({ packageModal: false })
        this.selectedPackageToDisplay = undefined
        this.selectedPackageToDisplay_pos = undefined
    }
    onChangeText = (value) => {
        let newValue = value.replace(/\D/g, '')
        this.setState({ personVal: newValue })
    }

    // ON RADIO BUTTON CLICK
    onEventModeSelect = (value) => {
        this.setState({
            personVal: value == 0 ? this.eventLimit : this.tableLimit,
            eventMode: value,
            eventTime: funGetTime(new Date().toString()),
            eventDate:  moment(new Date().toString()).format('MMM DD, YYYY'),
            eventDay: this.daysArray[0].label,
            startTime: this.arrayRestaurants[0].timings.open !== "" ?
                this.arrayRestaurants[0].timings.open : moment().format("LT"),
            endTime: this.arrayRestaurants[0].timings.close !== "" ?
                this.arrayRestaurants[0].timings.close : moment().format("LT"),
            strComment: "",
        })
    }


    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings("bookOnline")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this.onBackEventHandler}
                loading={this.state.isLoading}
            >

                {/* PROGRESS LOADER * */}
                {this.renderPackageDesc()}
                {this.renderCustomCalender()}
                {this.renderCustomTimePicker()}
                {this.state.isLoading ? null :
                    // MAIN VIEW 
                    (this.arrayRestaurants !== undefined && this.arrayRestaurants.length > 0)
                        ? (<View style={styles.flexStyle}>

                            {/* CONFIRMATION DIALOG */}
                            {this.renderConfrimBookingDialog()}

                            {/* SCROLL VIEW */}

                            <ScrollView style={styles.flexStyle}>

                                {/* RESTURANT IMAGE */}
                                {this.arrayRestaurants != undefined && this.arrayRestaurants.length > 0
                                    ?
                                    <EDImage
                                        source={this.arrayRestaurants[0].image}
                                        placeholder={Assets.logo}
                                        placeholderResizeMode={'contain'}
                                        resizeMode={'cover'}
                                        style={styles.resImage}
                                    />
                                    : null}

                                <View style={styles.resDetails} >

                                    {/* RES DETAILS */}
                                    {this.arrayRestaurants != undefined ? (
                                        <RestaurantOverview
                                            item={this.arrayRestaurants[0]}
                                            onButtonClick={this.onReviewPress}
                                            showRestReview={this.showRestReview}
                                            total_reviews={this.dataObj.restaurant_review_count}
                                            rating={this.dataObj.rating}
                                            isShow={true}
                                        />
                                    ) : null}
                                </View>

                                {this.isTableEnable == "1" && this.isTableEnable == 1 ?
                                    <RadioGroupWithHeader
                                        selected={this.state.eventMode}
                                        activeColor={EDColors.black}
                                        forHome={true}
                                        radioButtonSize={18}
                                        viewStyle={styles.radioViewStyle}
                                        radioColor={EDColors.text}
                                        style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
                                        lableStyle={styles.radioText}
                                        data={this.allBookingModes}
                                        onSelected={this.onEventModeSelect}
                                    /> :
                                    <EDRTLText
                                        numberOfLines={1}
                                        style={[styles.textStyle]}
                                        title={strings("eventTitle")} />}

                                {/* VIKRANT 28-07-21 */}
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.simpleText}>
                                        {this.state.eventMode == 0 ? this.event_min_max_txt : this.table_min_max_txt}
                                    </Text>
                                </View>
                                <View style={styles.eventMainView}>

                                    {/* VIEW NUMBER OF PEOPLES */}
                                    <EDRTLView style={styles.guestView} >

                                        {/* <View> */}
                                        <EDRTLView style={[styles.dataView,]}>
                                            <Icon
                                                name="person-outline"
                                                color={EDColors.black}
                                                size={getProportionalFontSize(18)}
                                                containerStyle={styles.personIconStyle}
                                            />
                                            <EDRTLText
                                                numberOfLines={1}
                                                style={[styles.guestText]}
                                                title={strings("eventGuest")} />
                                        </EDRTLView>

                                        {/* INCREASE OR DEC COUNT */}
                                        <EDRTLView style={styles.countView}>
                                            < EDRTLView style={styles.countSubView}>

                                                <Icon
                                                    name="remove"
                                                    color={this.state.personVal != undefined && this.state.personVal > (this.state.eventMode == 0 ? this.eventLimit : this.tableLimit) ? EDColors.black : EDColors.grayNew}
                                                    size={getProportionalFontSize(15)}
                                                    onPress={this.onDecreasePersonCount}
                                                />
                                                <TextInput style={styles.qtyInput}
                                                    maxLength={3}
                                                    keyboardType="numeric"
                                                    value={this.state.personVal.toString()}
                                                    onChangeText={this.onChangeText} />
                                                <Icon
                                                    name="add"
                                                    color={EDColors.black}
                                                    size={getProportionalFontSize(15)}
                                                    onPress={this.onIncreasePersonCount}
                                                />

                                            </EDRTLView>

                                        </EDRTLView>
                                    </EDRTLView>

                                    {/* DATE PICKER VIEW */}
                                    {this.state.eventMode === 0 ?
                                        <EDRTLView style={styles.dateView}>
                                            <EDRTLView style={[styles.dataView]}>
                                                <Icon
                                                    name={"calendar"}
                                                    color={EDColors.black}
                                                    containerStyle={styles.personIconStyle}
                                                    size={getProportionalFontSize(15)}
                                                    type={'ant-design'}
                                                />
                                                <EDRTLText
                                                    numberOfLines={1}
                                                    style={[styles.dateTimeText]}
                                                    title={strings("selectDate")}

                                                />

                                            </EDRTLView>
                                            <View style={styles.datePickerView}>
                                                <TouchableOpacity onPress={this._showDatePicker}>
                                                    <EDRTLView>
                                                        <EDRTLText
                                                            numberOfLines={1}
                                                            // style={[styles.boldTextStyle]}
                                                            style={[[styles.datePickerText, { marginHorizontal: 3 }]]}
                                                            title={this.state.eventDate || moment(new Date().toString()).format('MMM DD, YYYY')} />
                                                        <Icon name={'keyboard-arrow-down'} size={getProportionalFontSize(15)} color={'#C4C4C4'} style={styles.dateIcon} />
                                                    </EDRTLView>
                                                </TouchableOpacity>
                                            </View>
                                        </EDRTLView> : null}

                                    {/* VIEW TIME EVENT */}
                                    {this.state.eventMode === 0 ?
                                        <EDRTLView style={styles.timeView}>
                                            <EDRTLView style={[styles.dataView]}>
                                                <Icon
                                                    name={"clockcircleo"}
                                                    color={EDColors.black}
                                                    size={getProportionalFontSize(15)}
                                                    containerStyle={styles.personIconStyle}
                                                    type={'ant-design'}
                                                />
                                                <EDRTLText
                                                    numberOfLines={1}
                                                    style={[styles.dateText]}
                                                    title={strings("eventDiningtime")} />

                                            </EDRTLView>

                                            {/* SELECT TIME */}
                                            <View style={styles.pickerView}>
                                                <TouchableOpacity onPress={() => this._showTimePicker('event')}>
                                                    <EDRTLText
                                                        numberOfLines={1}
                                                        style={[styles.timeTextStyle]}
                                                        title={this.state.eventTime || funGetTime(new Date().toString())} />
                                                </TouchableOpacity>
                                            </View>
                                        </EDRTLView> : null}


                                    {/* DAYS DROP DOWN */}
                                    {this.state.eventMode === 1 ?
                                        <EDRTLView style={styles.dateView}>
                                            <EDRTLView style={[styles.dataView]}>
                                                <Icon
                                                    name={"calendar"}
                                                    color={EDColors.black}
                                                    containerStyle={styles.personIconStyle}
                                                    size={getProportionalFontSize(15)}
                                                    type={'ant-design'}
                                                />
                                                <EDRTLText
                                                    numberOfLines={1}
                                                    style={[styles.dateTimeText]}
                                                    title={strings("selectDay")}

                                                />
                                            </EDRTLView>
                                            <View style={styles.centerView}>
                                                <Dropdown
                                                    style={styles.dayPickerView}
                                                    containerStyle={styles.dropdownContainer}
                                                    data={this.daysArray}
                                                    placeholderStyle={[styles.dayPickerText]}
                                                    labelField="label"
                                                    valueField="value"
                                                    placeholder={this.state.eventDay.trim().length > 0 ?
                                                        moment(this.state.eventDay, "DD MMM, YYYY").format("MMM DD, YYYY")
                                                        :
                                                        moment(this.daysArray[0].label, "DD MMM, YYYY").format("MMM DD, YYYY")}

                                                    value={this.state.eventDay}
                                                    onChange={item => {
                                                        this.setState({ eventDay: item.label })
                                                    }}
                                                    maxHeight={(this.state.dropdownHeight * this.arrayRestaurants[0].allowed_days_for_booking) < metrics.screenHeight * 0.25 ? (this.state.dropdownHeight * this.arrayRestaurants[0].allowed_days_for_booking) : metrics.screenHeight * 0.25}
                                                    renderItem={item => this.renderDropdownItem(item)}
                                                    renderLeftIcon={isRTLCheck() ? this.renderIcon : null}
                                                    renderRightIcon={isRTLCheck() ? () => { } : this.renderIcon}
                                                />
                                            </View>

                                        </EDRTLView> : null}

                                    {/* TABLE BOOK START AND END TIME */}

                                    {/* VIEW TIME EVENT */}
                                    {this.state.eventMode == 1 ?
                                        <EDRTLView style={styles.timeView}>
                                            <EDRTLView style={[styles.dataView]}>
                                                <EDRTLText
                                                    numberOfLines={1}
                                                    style={[styles.dateText]}
                                                    title={strings('start')} />

                                            </EDRTLView>

                                            {/* SELECT TIME */}
                                            <View style={styles.pickerView}>
                                                <TouchableOpacity onPress={() => this._showTimePicker('start')}>
                                                    <EDRTLText
                                                        numberOfLines={1}
                                                        style={[styles.timeTextStyle]}
                                                        title={this.state.startTime || this.arrayRestaurants[0].timings.open} />
                                                </TouchableOpacity>
                                            </View>
                                            <EDRTLView style={[styles.dataView]}>
                                                <EDRTLText
                                                    numberOfLines={1}
                                                    style={[styles.dateText]}
                                                    title={strings('end')} />

                                            </EDRTLView>

                                            {/* SELECT TIME */}
                                            <View style={styles.pickerView}>
                                                <TouchableOpacity onPress={() => this._showTimePicker('end')}>
                                                    <EDRTLText
                                                        numberOfLines={1}
                                                        style={[styles.timeTextStyle]}
                                                        title={this.state.endTime || this.arrayRestaurants[0].timings.close} />
                                                </TouchableOpacity>
                                            </View>
                                        </EDRTLView> : null}

                                </View>


                                {/* SEGEMENT VIEW */}
                                {this.state.eventMode === 0 ?
                                    this.arrayPackages != undefined && this.arrayPackages != null && this.arrayPackages.length > 0 ?
                                        <View style={styles.tabView}>

                                            <EDRTLText
                                                numberOfLines={1}
                                                style={[styles.packText]}
                                                title={strings("packages")}
                                            />

                                            <View style={styles.flexStyle}>
                                                {/* PACKAGE VIEW */}
                                                <View style={styles.flexStyle}>
                                                    <FlatList
                                                        data={this.arrayPackages}
                                                        extraData={this.state.selectedPackage}
                                                        initialNumToRender={5}
                                                        keyExtractor={(item, index) => item + index}
                                                        renderItem={this.createPackageView}
                                                    />
                                                </View>

                                            </View>

                                        </View> : null : null}

                                {/* COMMENT BOX */}
                                <View style={styles.commentView}>
                                    <EDRTLText style={styles.titleText} title={strings('addRequest')} />
                                    <EDRTLView style={styles.footerStyle}>
                                        <Icon name={"edit"} type={"feather"} color={EDColors.black} size={getProportionalFontSize(20)} style={styles.editIconStyle} />
                                        <TextInput
                                            style={[styles.textInputStyle, {
                                                textAlign: isRTLCheck() ? 'right' : 'left',
                                                flexDirection: isRTLCheck() ? 'row-reverse' : 'row',
                                            }]}
                                            placeholder={strings("addComment")}
                                            value={this.state.strComment}
                                            onChangeText={this.onTextChangeHandler}
                                        />
                                    </EDRTLView>
                                </View>

                                {this.state.eventMode == 1 && this.infoMessage !== undefined && this.infoMessage !== null && this.infoMessage.trim().length > 0 ?
                                    <View style={styles.infoView}>
                                        <Text style={styles.alertStyle}>
                                            {this.infoMessage}
                                        </Text>
                                    </View>
                                    : null}

                            </ScrollView>
                            <View style={styles.bottomFooter}>
                                <EDThemeButton
                                    isLoading={this.state.isLoading}
                                    style={styles.themBtnStyle}
                                    textStyle={styles.thenBtnText}
                                    label={strings("checkAvailability")}
                                    onPress={this.checkData}
                                />
                            </View>
                        </View>) :
                        (this.strOnScreenMessage || '').trim().length > 0 ?
                            (<View style={styles.flexStyle}>
                                <EDPlaceholderComponent
                                    title={this.strOnScreenMessage}
                                    subTitle={this.strOnScreenSubtitle}
                                />
                            </View>)
                            : null
                }
            </BaseContainer>
        );
    }
    //#endregion
    // DROPDOWN ICON
    renderIcon = () => {
        return (
            <Icon name={'keyboard-arrow-down'} size={getProportionalFontSize(15)} color={'#C4C4C4'} style={{ alignSelf: 'center' }} />
        )
    }


    onTextChangeHandler = (value) => {
        this.setState({
            strComment: value
        })
    }

    // DROPDOWN ONLOAYOUT
    onDropDownLayout = (e) => {
        this.setState({ dropdownHeight: e.nativeEvent.layout.height })
    }

    // DROPDOWN VIEW
    renderDropdownItem = (item) => {
        return (
            <View style={[styles.itemView]} onLayout={this.onDropDownLayout} >
                <Text style={styles.datePickerText}>{moment(item.label, "DD MMM, YYYY").format("MMM DD, YYYY")}</Text>
            </View>
        )
    }

    //#region 
    /** BACK EVENT HANDLER */
    onBackEventHandler = () => {
        this.props.navigation.goBack();
    }

    onBackPressed = () => {
        this.onBackEventHandler()
        return true
    }

    //#endregion

    //#region 
    /** RENDER LOGOUT DIALOGUE */
    renderConfrimBookingDialog = () => {
        return (
            <EDPopupView isModalVisible={this.state.modelVisible}>
                <EDConfirmBookingDialog
                    // source={this.state.isPositive ? "event-available" : "event-busy"}
                    source={this.state.isPositive ? "checksquareo" : "closesquareo"}
                    text={this.state.modelText}
                    isPositive={this.state.isPositive}
                    onConfirmPressedHandler={this.onConfirmPressedHandler}
                    onCancelPressedHandler={this.onCancelPressedHandler}
                />
            </EDPopupView>
        )
    }
    //#endregion

    //#region 
    // CONFIRM BUTTON PRESSED EVENT
    onConfirmPressedHandler = () => {
        if (this.state.eventMode == 0)
            this._confirmBooking();
        else if (this.state.eventMode == 1) {
            this._confirmTable();
        }
        this.setState({ modelVisible: false });
    }
    //#endregion

    // GET TIME ACCODING TO TIME PICKER PRESSED
    getTimeValue = () => {
        if (this.state.forTime == 'event') {
            return this.state.eventTime
        }
        else if (this.state.forTime == 'start') {
            if (this.state.startTime.trim() !== "")
                return this.state.startTime
            else {
                return this.arrayRestaurants[0].timings.open !== "" ? this.arrayRestaurants[0].timings.open : moment().format("LT")
            }
        }
        else if (this.state.forTime == 'end') {
            if (this.state.endTime.trim() !== "")
                return this.state.endTime
            else {
                return this.arrayRestaurants[0].timings.close !== "" ? this.arrayRestaurants[0].timings.close : moment().format("LT")
            }
        }
        return ''
    }

   
    /** CHECK FOR VALIDATION */
    validateBooking() {
        if (this.state.personVal <= 0) {
            showValidationAlert(strings("addPeopleValidation"));
            return false;
        }
        else if (this.state.eventMode === 0) {
            if (this.state.eventTime.trim() === "") {
                showValidationAlert(strings("diningTimeValidation"));
                return false;
            }
            else if (this.state.eventDate.trim() === "") {
                showValidationAlert(strings("diningDateValidation"));
                return false;
            }
        } else if (this.state.eventMode === 1) {
            if (this.state.eventDay.trim() === "") {
                showValidationAlert(strings("diningDayValidation"));
                return false;
            } else if (this.state.startTime.trim() === "") {
                showValidationAlert(strings("diningStartTimeValidation"));
                return false;
            } else if (this.state.endTime.trim() === "") {
                showValidationAlert(strings("diningEndTimeValidation"));
                return false;
            }
        }
        return true;
    }

    //#region FORGOT PASSWORD BUTTON EVENTS
    onCancelPressedHandler = () => {
        this.setState({ modelVisible: false })
    }
    //#endregion

    //#region 
    /** INCREASE PERSON COUNT */
    onIncreasePersonCount = () => {
        if (this.state.personVal == '') {
            this.setState({ personVal: 1 })
        }
        if (parseInt(this.state.personVal) >= 0) {
            this.setState({
                personVal: parseInt(this.state.personVal) + 1
            });
        }
    }
    //#endregion

    //#region 
    /** DECREASE PERSON COUNT */
    onDecreasePersonCount = () => {
        let minVal = this.state.eventMode == 0 ? this.eventLimit : this.tableLimit
        if (parseInt(this.state.personVal) > minVal) {
            this.setState({
                personVal: parseInt(this.state.personVal) - 1
            });
        }
    }
    //#endregion

    onViewMore = (pos, id) => {
        this.selectedPackageToDisplay = this.arrayPackages[pos]
        this.selectedPackageToDisplay_pos = pos
        this.setState({ packageModal: true })
    }

    //#region 
    /** CREATE WEB VIEW FOR PACKAGES */
    createPackageView = ({ item, index }) => {
        return (
            <PackageContainer
                currency={this.arrayRestaurants[0].currency_symbol}
                pkgImage={item.image}
                pkgName={item.name}
                price={item.price}
                pkgDesc={item.detail}
                pkgAvailable={item.availability}
                pos={index}
                id={item.package_id}
                onPress={this.onPackagePress}
                viewMore={this.onViewMore}
                isSelected={index == this.state.selectedPackage}
                onReview={count => { }}
            />
        );
    }

    onPackagePress = (index, id) => {
        if (this.state.selectedPackageId == id)
            this.setState({
                selectedPackage: -1,
                selectedPackageId: ""
            });
        else
            this.setState({
                selectedPackage: index,
                selectedPackageId: id
            });
    }
    //#endregion

    /** SHOW DATE PICKER */
    _showDatePicker = () => { this.setState({ isDatePickerVisible: true }) };

    /** HIDE DATE PICKER */
    _hideDatePicker = () => this.setState({ isDatePickerVisible: false });

    /** SHOW TIME PICKER */
    _showTimePicker = (value) => this.setState({ isTimePickerVisible: true, forTime: value });

    /** HIDE TIME PICKER */
    _hideTimePicker = () => this.setState({ isTimePickerVisible: false });

    confirmDate = () => {
        // var datePicked = funGetDate(this.state.currentDate)
        var datePicked = funGetDateStr(this.state.currentDate.toString(), 'MMM DD, YYYY')
        this.setState({ eventDate: datePicked, isDatePickerVisible: false })
    };

    /** DATE PICKER HANDLER */
    _handleDatePicked = date => {
        var datePicked = funGetDate(date.dateString);
        this.setState({ currentDate: date.dateString });
        // this._hideDatePicker()
    };

    /** TIME PICKER HANDLER */
    _handleTimePicked = time => {

        if (this.state.forTime == 'event') {
            this.setState({ eventTime: time });
        }
        else if (this.state.forTime == 'start') {
            this.setState({ startTime: time });
        }
        else if (this.state.forTime == 'end') {
            this.setState({ endTime: time });
        }
        this._hideTimePicker();
    };


    /** CHECK DATA FOR BOOKING */
    checkData = () => {
        if (this.validateBooking()) {
            if (this.state.eventMode == 0)
                this._checkBooking()
            else if (this.state.eventMode == 1) {
                this._checkTable()
            }
        }
    }

    //#region 
    /**
     * 
     * @param { Success Response Object } onSuccess 
     */
    onSuccessTableCheck = (onSuccess) => {
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.setState({
                    isLoading: false,
                    modelVisible: true,
                    isPositive: true,
                    modelText: onSuccess.message
                });
            } else {
                this.setState({
                    isLoading: false,
                    modelVisible: true,
                    isPositive: false,
                    modelText: onSuccess.message
                });
            }
        } else {
            this.setState({ isLoading: false });
        }

    }

    /**
     * 
     * @param { Failure Response Object } onFailure 
     */
    onFailureTableCheck = (onFailure) => {
        this.setState({ isLoading: false });
        showValidationAlert(onFailure.message)
    }

    /** CHECK AVAIBLE TABLE */
    _checkTable() {
        netStatus(status => {
            this.setState({ isLoading: true });
            if (status) {
                let param = {
                    language_slug: this.props.lan,
                    restaurant_id: parseInt(this.dataObj.restuarant_id) || 0,
                    booking_date: this.state.eventDay,
                    no_of_people: this.state.personVal,
                    start_time: this.state.startTime,
                    end_time: this.state.endTime
                }
                checkTable(param, this.onSuccessTableCheck, this.onFailureTableCheck, this.props);
            } else { }
        });
    }
    //#endregion

    //#region 
    /**
     * 
     * @param { Success Response object On booking } onSuccess 
     */
    onSuccessConfirmTable = (onSuccess) => {
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.props.navigation.navigate("BookingSuccess");
                this.setState({ isLoading: false });
            } else {
                showValidationAlert(onSuccess.message)
                this.setState({ isLoading: false });
            }
        } else {
            showValidationAlert(onSuccess.message == "404" ? strings('generalWebServiceError') : onSuccess.message || strings('generalWebServiceError'))
            this.setState({ isLoading: false });
        }
    }

    /**
     * 
     * @param { Failure Response Object on Booking } onFailure 
     */
    onFailureConfirmTable = (onFailure) => {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = strings('noInternetTitle');
    }

    /** BOOKING TABLE API */
    _confirmTable() {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                var param = {
                    language_slug: this.props.lan,
                    restaurant_id: parseInt(this.dataObj.restuarant_id) || 0,
                    user_id: parseInt(this.props.userIdFromRedux) || 0,
                    user_name: this.props.firstName + " " + this.props.lastName || '',
                    booking_date: this.state.eventDay,
                    no_of_people: this.state.personVal,
                    additional_request: this.state.strComment || '',
                    start_time: this.state.startTime,
                    end_time: this.state.endTime
                }
                bookTable(param, this.onSuccessConfirmTable, this.onFailureConfirmTable, this.props);
            } else {
                this.strOnScreenMessage = strings('noInternetTitle');
            }
        });
    }
    //#endregion



    //  CHECK FOR BOOKING AVAILABILITY
    //#region 
    /**
     * 
     * @param { Success Response Object } onSuccess 
     */
    onSuccessBookingCheck = (onSuccess) => {
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.setState({
                    isLoading: false,
                    modelVisible: true,
                    isPositive: true,
                    modelText: onSuccess.message
                });
            } else {
                this.setState({
                    isLoading: false,
                    modelVisible: true,
                    isPositive: false,
                    modelText: onSuccess.message
                });
            }
        } else {
            this.setState({ isLoading: false });
        }
    }

    /**
     * 
     * @param { Failure Response Object } onFailure 
     */
    onFailureBookingCheck = (onFailure) => {
        this.setState({ isLoading: false });
        showValidationAlert(onFailure.message)
    }

    /** CHECK AVAIBLE BOOKING */
    _checkBooking() {
        netStatus(status => {
            this.setState({ isLoading: true });
            if (status) {
                let param = {
                    language_slug: this.props.lan,
                    restaurant_id: parseInt(this.dataObj.restuarant_id) || 0,
                    user_id: parseInt(this.props.userIdFromRedux) || 0,
                    // token: "" + this.props.phoneNumber,
                    booking_date:
                        "" + this.state.eventDate + " " + this.state.eventTime,
                    package_id: this.state.selectedPackageId,
                    people: this.state.personVal
                }
                checkBooking(param, this.onSuccessBookingCheck, this.onFailureBookingCheck, this.props);
            } else { }
        });
    }
    //#endregion

    //#region 
    /**
     * 
     * @param { Success Response object On booking } onSuccess 
     */
    onSuccessConfirmBooking = (onSuccess) => {
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.props.navigation.navigate("BookingSuccess");
                this.setState({ isLoading: false });
            } else {
                showValidationAlert(onSuccess.message)
                this.setState({ isLoading: false });
            }
        } else {
            showValidationAlert(onSuccess.message == "404" ? strings('generalWebServiceError') : onSuccess.message || strings('generalWebServiceError'))
            this.setState({ isLoading: false });
        }
    }

    /**
     * 
     * @param { Failure Response Object on Booking } onFailure 
     */
    onFailureConfirmBooking = (onFailure) => {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = strings('noInternetTitle');
    }

    /** BOOKING EVENT API */
    _confirmBooking() {
        netStatus(status => {
            if (status) {
                this.setState({ isLoading: true });
                var param = {
                    language_slug: this.props.lan,
                    restaurant_id: parseInt(this.dataObj.restuarant_id) || 0,
                    user_id: parseInt(this.props.userIdFromRedux) || 0,
                    // token: "" + this.props.phoneNumber,
                    booking_date:
                        "" + this.state.eventDate + " " + this.state.eventTime,
                    people: this.state.personVal,
                    package_id: this.state.selectedPackageId,
                    additional_request: this.state.strComment || '',
                }
                bookEvent(param, this.onSuccessConfirmBooking, this.onFailureConfirmBooking, this.props);
            } else {
                this.strOnScreenMessage = strings('noInternetTitle');
            }
        });
    }
    //#endregion

    //#region 
    /**
     * @param { Succes Response object For Main Data } onSuccess
     */
    onSuccessData = (onSuccess) => {
        this.strOnScreenMessage = ''
        this.strOnScreenSubtitle = ''
        this.infoMessage = ''
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS) {
                this.arrayRestaurants = onSuccess.restaurant;
                this.isTableEnable = this.arrayRestaurants[0].enable_table_booking
                this.setState({
                    startTime:
                        this.arrayRestaurants[0].timings.open !== "" ?
                            this.arrayRestaurants[0].timings.open : moment().format("LT"), endTime: this.arrayRestaurants[0].timings.close !== "" ?
                                this.arrayRestaurants[0].timings.close : moment().format("LT")
                })
                // this.fetchDays(onSuccess.restaurant[0].allowed_days_for_booking)
                if (onSuccess.package.length > 0) {
                    this.arrayPackages = onSuccess.package;
                } else {
                    this.strOnScreenMessage = strings('noDataFound');
                }
                if (onSuccess.table_booking_note !== undefined && onSuccess.table_booking_note !== null && onSuccess.table_booking_note.trim() !== "") {
                    this.infoMessage = onSuccess.table_booking_note
                }
                if (onSuccess.restaurant[0].event_min_max_txt !== undefined && onSuccess.restaurant[0].event_min_max_txt !== null && onSuccess.restaurant[0].event_min_max_txt.trim() !== "") {
                    this.event_min_max_txt = onSuccess.restaurant[0].event_min_max_txt
                }
                if (onSuccess.restaurant[0].table_min_max_txt !== undefined && onSuccess.restaurant[0].table_min_max_txt !== null && onSuccess.restaurant[0].table_min_max_txt.trim() !== "") {
                    this.table_min_max_txt = onSuccess.restaurant[0].table_min_max_txt
                }
                if (onSuccess.restaurant[0].event_minimum_capacity !== undefined && onSuccess.restaurant[0].event_minimum_capacity !== null) {
                    this.eventLimit = onSuccess.restaurant[0].event_minimum_capacity
                    this.setState({ personVal: onSuccess.restaurant[0].event_minimum_capacity })
                }
                if (onSuccess.restaurant[0].table_minimum_capacity !== undefined && onSuccess.restaurant[0].table_minimum_capacity !== null) {
                    this.tableLimit = onSuccess.restaurant[0].table_minimum_capacity
                }
                if (onSuccess.restaurant[0].time_slots !== undefined && onSuccess.restaurant[0].time_slots !== null) {
                    this.fetchDays(onSuccess.restaurant[0].time_slots)
                }
                this.setState({ isLoading: false });
            } else {
                this.strOnScreenMessage = onSuccess.message;
                this.setState({ isLoading: false });
            }
        } else {
            this.strOnScreenMessage = ("generalWebServiceError")
            this.setState({ isLoading: false });
        }
    }

    /**
     * @param { Failure response Object } onFailure
     * 
     */
    onFailureData = (onFailure) => {
        this.setState({ isLoading: false });
        this.strOnScreenMessage = strings('noInternetTitle');
        this.strOnScreenSubtitle = strings('noInternet');
    }

    /** GET RES DATA API */
    loadResDetails() {
        this.strOnScreenMessage = ''
        this.strOnScreenSubtitle = ''

        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true });
                var param = {
                    language_slug: this.props.lan,
                    restaurant_id: this.dataObj.restuarant_id,
                    content_id: this.dataObj.content_id,
                    isEvent: 1
                }
                ResDetails(param, this.onSuccessData, this.onFailureData, this.props);
            } else {
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
                this.setState({ isLoading: false })
            }
        })
    }
    //#endregion

}
//#region STYLES
const styles = StyleSheet.create({
    tabStyle: {
        backgroundColor: EDColors.white,
        borderColor: EDColors.primary,
        alignSelf: "flex-start"
    },
    alertStyle: { color: EDColors.black, fontSize: getProportionalFontSize(12), marginVertical: 5, marginHorizontal: 5, fontFamily: EDFonts.medium },
    buttonStyle: {
        width: (metrics.screenWidth * 0.5) - 60,
        height: heightPercentageToDP('6.0%'),
        borderColor: EDColors.primary,
        paddingBottom: 0,
        backgroundColor: EDColors.primary,
        borderRadius: 16,
    },
    textStyle: {
        fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(14), color: EDColors.black, margin: 15
    },
    simpleText: { color: EDColors.black, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.semiBold, marginHorizontal: 8 },
    radioText: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(13) },
    commentView: { marginHorizontal: 5, marginBottom: 20, marginTop: 20 },
    centerView: { justifyContent: 'center', alignItems: 'center' },
    dropdownContainer: { borderRadius: 8 },
    itemView: { borderTopWidth: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 0, borderTopColor: EDColors.radioSelected, paddingVertical: 7 },
    themeButton: { color: EDColors.white, fontFamily: EDFonts.regular, paddingHorizontal: 10, },
    textInputStyle: { marginHorizontal: 10, flex: 1, marginVertical: 20, color: EDColors.grayNew, fontFamily: EDFonts.medium },
    radioViewStyle: {
        paddingHorizontal: 5, paddingVertical: 10, margin: 0, backgroundColor: EDColors.backgroundDark, borderRadius: 0, marginBottom: 10
    },
    tabTextStyle: {
        color: EDColors.primary,
        marginLeft: 5,
        marginRight: 5,
        alignSelf: "flex-start",
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(15),
    },
    infoView: { backgroundColor: EDColors.radioSelected, alignItems: 'center', marginHorizontal: 5 },
    titleText: {
        color: EDColors.black,
        fontSize: getProportionalFontSize(15),
        fontFamily: EDFonts.semiBold,
        marginHorizontal: 10,
        flex: 1,
    },
    qtyInput: {
        color: EDColors.black,
        borderColor: EDColors.separatorColor,
        // borderWidth: 1,
        borderRadius: 5,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: getProportionalFontSize(14),
        paddingVertical: 0,
        // paddingHorizontal: 0,
        // marginHorizontal: 5,
        // minWidth: 50,
        // width:'100%'

    },
    flexStyle: { flex: 1 },
    footerStyle: { marginTop: 20, marginHorizontal: 10, backgroundColor: EDColors.white, borderWidth: 2, borderColor: EDColors.separatorColorNew, borderRadius: 16, alignItems: "center" },
    editIconStyle: { marginHorizontal: 15 },
    countSubView: { flex: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
    personIconStyle: { margin: 5 },
    guestView: { margin: 5, borderRadius: 16, backgroundColor: EDColors.white, height: metrics.screenHeight * 0.08 },
    resImage: { width: "100%", height: 180 },
    eventMainView: { marginLeft: 10, marginRight: 10 },
    tabView: { flex: 1, margin: 10 },
    resDetails: { position: "relative", marginTop: -40 },
    dateText: { marginHorizontal: 5, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semiBold, color: "#000" },
    boldTextStyle: { fontWeight: "bold", color: "#000", fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(13) },
    dataView: { flex: 1, marginHorizontal: 10, alignSelf: "center", alignItems: 'center' },
    bottomFooter: { width: "100%", alignItems: "center", backgroundColor: EDColors.offWhite, justifyContent: 'center' },
    datePickerView: { paddingHorizontal: 10, alignItems: "center", alignSelf: 'center', marginHorizontal: 10, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#EDEDED' },
    dayPickerView: { backgroundColor: EDColors.white, alignItems: "center", alignSelf: 'center', marginHorizontal: 10, height: 30, width: metrics.screenWidth * 0.30, borderRadius: 8, borderWidth: 1, borderColor: '#EDEDED' },
    dateTimeText: { color: "#000", marginHorizontal: 5, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semiBold },
    dateView: { margin: 5, marginTop: 5, borderRadius: 16, backgroundColor: EDColors.white, height: metrics.screenHeight * 0.07 },
    timeTextStyle: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, color: EDColors.black, marginTop: 7, paddingHorizontal: 10 },
    pickerView: { alignItems: "center", alignSelf: 'center', marginHorizontal: 10, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#EDEDED' },
    timeView: { margin: 5, marginTop: 5, borderRadius: 16, backgroundColor: EDColors.white, height: metrics.screenHeight * 0.07 },
    datePickerText: { fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, color: EDColors.black, marginTop: 7 },
    dayPickerText: { paddingHorizontal: 4, textAlign: 'center', flex: 0, fontSize: getProportionalFontSize(12), fontFamily: EDFonts.medium, color: EDColors.black },
    packText: { margin: 5, fontSize: getProportionalFontSize(18), fontFamily: EDFonts.semiBold, color: EDColors.newColor, },
    themBtnStyle: { alignSelf: 'center', margin: 10, width: metrics.screenWidth * 0.90, height: metrics.screenHeight * 0.075, backgroundColor: EDColors.primary, borderRadius: 16 },
    dateIcon: { marginTop: 7 },
    thenBtnText: { fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semiBold },
    countView: { marginTop: 10, marginHorizontal: 10, alignItems: "center", alignSelf: "center", borderRadius: 8, width: 80, height: 30, justifyContent: 'flex-end', backgroundColor: "#fff", borderWidth: 1, borderColor: '#EDEDED' },
    guestText: { marginHorizontal: 1, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.semiBold, color: EDColors.black },
});
//#endregion


export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            currency_symbol: state.checkoutReducer.currency_symbol,
            userIdFromRedux: state.userOperations.userIdInRedux,
            phoneNumber: state.userOperations.phoneNumberInRedux,
            firstName: state.userOperations.firstName,
            lastName: state.userOperations.lastName,
        };
    },
    dispatch => {
        return {

        };
    }
)(EventBookContainer);




/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import { Animated, Easing, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { Icon } from 'react-native-elements';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck, TextFieldTypes } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export default class EDRTLTextInput extends Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.selectedCountry = undefined
        this.isActive = false
    }

    componentWillMount = () => {

    }

    componentDidMount = () => {
        if (this.props.dialCode !== undefined) {
            this.setState({ dialCode: this.props.dialCode })
        }
        else {
            if (this.props.countryData !== undefined && this.props.countryData[0] !== undefined)
                this.setState({ dialCode: this.props.countryData[0].phonecode })
            else
                this.setState({ dialCode: '' })

        }
        if (this.props.countryData !== undefined && this.props.countryData[0] !== undefined)
            this.setState({ code: this.props.countryData[0].iso })

        if (this.props.initialValue !== undefined &&
            this.props.initialValue !== null &&
            this.props.initialValue !== ""
        )
            this._toggle()

        // else if (this.props.type === TextFieldTypes.phone && this.state.dialCode !== '')
        //     this._toggle()

    }

    componentDidUpdate = () => {
        if (this.props.initialValue !== undefined &&
            this.props.initialValue !== null &&
            this.props.initialValue !== ""
        ) {
            if (this.isActive == false)
                this._toggle()
        }

        else if (this.props.type === TextFieldTypes.phone && this.state.dialCode !== '') {
            if (this.isActive == false)
                this._toggle()
        }
    }

    onCustomIconPress = () => {
        if (this.props.focusOnPress == true)
            this.textInput.focus();

        if (this.props.onCustomIconPress !== undefined)
            this.props.onCustomIconPress()
    }

    onFocus = () => {
        this._toggle()
        this._toggleBottom()
        this.setState({ focused: true })
    }
    onBlur = () => {
        if (this.props.initialValue !== undefined &&
            this.props.initialValue !== null &&
            this.props.initialValue !== ""
        )
            return;
        this._toggle(true)
        this._toggleBottom(true)

        this.setState({ focused: false })

    }


    _toggle = (isActive = false) => {
        this.isActive = !isActive
        Animated.timing(this.state.focusedAnim, {
            toValue: isActive ? 0 : 1,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start();
        if (this.props.type === TextFieldTypes.phone && this.state.dialCode !== '') {
            if (this.props.initialValue !== undefined &&
                this.props.initialValue !== null &&
                this.props.initialValue == ""
            )
                return;
        }
        else
            this._toggleBottom(isActive)
    }

    _toggleBottom = (isActive) => {
        Animated.timing(this.state.focusedBottom, {
            toValue: isActive ? 0 : 1,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start();
    }

    onParentLayout = e => {
        this.setState({ parentWidth: e.nativeEvent.layout.width })
    }

    onInputLayout = e => {
        this.setState({ parentHeight: e.nativeEvent.layout.height })
    }

    onCountrySelect = country => {
        this.setState({ code: country.cca2, dialCode: country.callingCode[0] })
        this.props.onCountrySelect !== undefined ?
            this.props.onCountrySelect(country) : {}
    }

    onLabelPress = () => {
        this.textInput.focus()
    }

    render() {
        return (
            <View
                onLayout={this.onParentLayout}
                style={[{ marginVertical: 10, overflow: 'hidden' }, this.props.containerStyle]}>
                <View
                    style={[
                        styles.subContainer,
                        this.props.style
                    ]}
                    onLayout={this.props.onLayout}
                    opacity={this.props.isDisable ? 0.75 : 1}
                    pointerEvents={this.props.isDisable ? 'none' : 'auto'}>
                    {this.props.placeholder !== undefined && this.props.placeholder !== null &&
                        this.props.placeholder !== "" ?
                        <TouchableOpacity onPress={!this.state.focused ? this.onLabelPress : null}
                            activeOpacity={1}
                        // style={{ zIndex: 1 }}
                        >
                            <Animated.View
                                style={[
                                    styles.labelContainer,
                                    {
                                        // opacity: this.state.focusedAnim.interpolate({
                                        //     inputRange: [0, 0.5, 1],
                                        //     outputRange: [1, 0, 1],
                                        // }),
                                        // marginBottom: this.state.focusedAnim.interpolate({
                                        //     inputRange: [0, 0.5, 0.51, 1],
                                        //     outputRange: [-getProportionalFontSize(16), -getProportionalFontSize(16), getProportionalFontSize(5), getProportionalFontSize(5)],
                                        // }),

                                    },
                                ]}
                            >
                                <EDRTLText title={this.props.placeholder} style={[styles.fumiLabel]} />
                            </Animated.View>
                        </TouchableOpacity>
                        : null}
                    <EDRTLView style={styles.rtlView}>
                        {this.props.prefix ? (
                            <EDRTLView style={styles.prefixContainer}>
                                <Text style={styles.prefixText}>{this.props.prefix}</Text>
                            </EDRTLView>
                        ) : null}
                        <View style={{
                            flexDirection: "row",
                            alignItems: 'center',
                            flex: 1,

                        }}>
                            {this.props.type === TextFieldTypes.phone && this.state.dialCode !== '' ?

                                <CountryPicker
                                    countryCodes={this.props.countryData !== undefined && this.props.countryData[0] !== undefined ? this.props.countryData.map(data => data.iso) : []}
                                    withFilter
                                    withCountryNameButton
                                    // withAlphaFilter
                                    withCallingCode
                                    preferredCountries={this.props.countryData !== undefined && this.props.countryData[0] !== undefined ? this.props.countryData.map(data => data.iso) : []}
                                    withEmoji
                                    visible={this.state.pickerVisible}
                                    onClose={() => this.setState({ pickerVisible: false })}
                                    countryCode={this.state.code}
                                    onSelect={this.onCountrySelect}
                                    renderFlagButton={() => {
                                        return <TouchableOpacity
                                            disabled={this.props.editableBox !== undefined &&
                                                this.props.editableBox === false
                                                ? true
                                                : false}
                                            onPress={() => { this.setState({ pickerVisible: true }) }}>
                                            <Text
                                                style={[styles.codeText, this.props.codeTextStyle,]}
                                            >{this.state.dialCode.includes("+") ? this.props.dialCode : ("+" + this.state.dialCode)}</Text>
                                        </TouchableOpacity>
                                    }}
                                />
                                : null
                            }
                            {this.props.isForTemperature
                                ? <EDRTLText numberOfLines={0} style={[styles.temperatureStyle]} title={this.props.initialValue} />
                                : <TextInput
                                    onLayout={this.onInputLayout}
                                    ref={ref => this.textInput = ref}
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                    focusText={this.props.focusText}
                                    disabled={this.props.editableBox !== undefined &&
                                        this.props.editableBox === false
                                        ? true
                                        : false}
                                    numberOfLines={this.props.numberOfLines}
                                    defaultValue={this.props.defaultValue}
                                    value={this.props.initialValue}
                                    style={[
                                        styles.textFieldStyle,
                                        {
                                            textAlign: isRTLCheck() ? 'right' : 'left',
                                            // height: getProportionalFontSize(40),
                                            textAlignVertical: "center",
                                            padding: 0,

                                        },
                                    ]}
                                    autoFocus={this.props.autoFocus || false}
                                    autoCapitalize={this.shouldAutoCapitalise()}
                                    keyboardType={this.fieldKeyboardType()}
                                    autoCorrect={false}
                                    selectionColor={EDColors.primary}
                                    onChangeText={
                                        this.props.onChangeText != undefined
                                            ? this.onTextChangeHandler
                                            : undefined
                                    }
                                    secureTextEntry={
                                        this.props.type === TextFieldTypes.password &&
                                        !this.state.showPassword
                                    }
                                    direction={isRTLCheck() ? 'rtl' : 'ltr'}
                                    maxLength={
                                        this.props.maxLength !== undefined
                                            ? this.props.maxLength
                                            : 250
                                    }
                                    editable={
                                        this.props.editableBox !== undefined &&
                                            this.props.editableBox === false
                                            ? false
                                            : true
                                    }
                                    pointerEvents={
                                        this.props.editableBox !== undefined &&
                                            this.props.editableBox === false
                                            ? 'none'
                                            : 'auto'
                                    }
                                    multiline={this.props.multiline}
                                    underlineColorAndroid={EDColors.transparent}
                                />}
                        </View>

                        {this.props.customIcon !== undefined ?
                            <EDRTLView style={{ alignItems: 'center', }}>
                                <TouchableOpacity
                                    style={{
                                        marginRight: isRTLCheck() ? 10 : 10,
                                        marginLeft: isRTLCheck() ? 10 : 0,
                                    }}
                                    onPress={this.onCustomIconPress}>
                                    <Icon
                                        type={this.props.customIconFamily || 'font-awesome'}
                                        size={20}
                                        onPress={this.onCustomIconPress}
                                        name={this.props.customIcon}
                                        color={EDColors.grayNew} />
                                </TouchableOpacity>
                            </EDRTLView> : null
                        }
                        {this.props.type === TextFieldTypes.password ? (
                            <EDRTLView style={{ alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{
                                        marginRight: isRTLCheck() ? 10 : 10,
                                        marginLeft: isRTLCheck() ? 10 : 0,

                                    }}
                                    onPress={this.showHidePassword}>
                                    <Icon
                                        type={'ionicon'}
                                        size={20}
                                        onPress={this.showHidePassword}
                                        name={this.state.showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        containerStyle={{ transform: [{ rotateX: "180deg" }] }}
                                        color={EDColors.grayNew} />
                                </TouchableOpacity>
                            </EDRTLView>
                        ) : null}

                        {this.props.isNotification
                            ? <Switch
                                onTintColor={EDColors.error}
                                trackColor={EDColors.error}
                                style={styles.notificationSwitch}
                                value={this.props.switchValue}
                                onValueChange={this.props.onSwitchValueChange} />
                            : null}
                    </EDRTLView>

                    <Animated.View
                        style={[
                            styles.border,
                            {
                                width: this.state.focusedBottom.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, this.state.parentWidth],
                                }),
                                zIndex: 1,
                                alignSelf: isRTLCheck() ? "flex-end" : "flex-start"

                            },
                            // isRTLCheck() ? {
                            //     right: 0
                            // } : {
                            //     left: 0
                            // }
                        ]}
                    />
                </View>
                {
                    this.props.errorFromScreen ? (

                        <EDRTLText style={[styles.errorTextStyle, this.props.errorMessageStyle]}
                            title={this.props.errorFromScreen} />

                    ) : null
                }
            </View >
        );
    }
    //#endregion

    //#region STATE
    state = {
        showPassword: false,
        focusedAnim: new Animated.Value(0),
        focusedBottom: new Animated.Value(0),

        parentWidth: Metrics.screenWidth * .9,
        parentHeight: undefined,
        focused: false,
        pickerVisible: false,
        dialCode: '',
        code: ''
    };
    //#endregion

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.errorFromScreen !== nextProps.errorFromScreen) {
            return true;
        }
        return true;
    }

    //#region KEYBOARD METHODS
    fieldKeyboardType() {
        if (this.props.type === TextFieldTypes.email) {
            return 'email-address';
        } else if (this.props.type === TextFieldTypes.password) {
            return 'default';
        } else if (
            this.props.type === TextFieldTypes.amount ||
            this.props.type === TextFieldTypes.phone
        ) {
            return 'number-pad';
        } else if (this.props.type === TextFieldTypes.description) {
            return 'default';
        }
    }
    shouldAutoCapitalise() {
        if (this.props.type === TextFieldTypes.email) {
            return 'none';
        } else if (this.props.type === TextFieldTypes.password) {
            return 'none';
        }
    }
    /**
     *
     * @param {Sending text to container what user type} newText
     */
    onTextChangeHandler = newText => {
        if (this.props.onChangeText !== undefined) {
            this.props.onChangeText(newText, this.props.identifier || '');
        }
    };
    //#endregion

    //#region UIBUTTON METHODS
    showHidePassword = () => {
        this.setState({ showPassword: !this.state.showPassword });
    };
}
//#endregion
const styles = StyleSheet.create({
    subContainer: {
        backgroundColor: EDColors.transparent,
        // flex: 1,
        // borderColor: 'red',
        // borderWidth: 1
    },
    labelContainer: {

    },
    textStyle: {},
    rtlView: {
        backgroundColor: EDColors.transparent, alignItems: 'center',
        // flex: 1,
        borderBottomColor: EDColors.separatorColor,
        borderBottomWidth: 1
    },
    fumiContainer: { flex: 1, backgroundColor: EDColors.transparent, alignItems: 'center' },
    fumiLabel: {
        fontFamily: EDFonts.medium,
        color: EDColors.grayNew,
        fontSize: getProportionalFontSize(14),
        // marginTop: getProportionalFontSize(2.5)
    },
    temperatureStyle: {
        marginHorizontal: 0,
        // flex: 1,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black,
        // borderWidth: 1,
        // borderColor: "green",
        marginVertical: getProportionalFontSize(8),
        // height: getProportionalFontSize(48)
    },
    textFieldStyle: {
        marginHorizontal: 0,
        flex: 1,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black,
        height: getProportionalFontSize(30)
    },
    codeText: {
        marginRight: 5.5,
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black,
        textAlignVertical: "center",
        // height : getProportionalFontSize(30)
    },
    errorTextStyle: {
        fontSize: getProportionalFontSize(12),
        fontFamily: EDFonts.regular,
        color: EDColors.error,
        marginTop: 2,
    },
    separatorView: {
        height: '50%',
        width: 1,
        backgroundColor: EDColors.text,
    },
    prefixContainer: { alignItems: 'center', height: '100%' },
    prefixText: {
        fontFamily: EDFonts.regular,
        fontSize: heightPercentageToDP('2%'),
        paddingLeft: 10,
        paddingVertical: 10,
        color: EDColors.text,
    },
    separator: {
        // position: 'absolute',
        width: 1,
        backgroundColor: EDColors.buttonUnreserve,
        top: 8,
    },
    notificationSwitch: { alignSelf: 'center', marginHorizontal: 5 },
    border: {
        backgroundColor: EDColors.black,
        height: .75,
        marginTop: -.5
    }

});


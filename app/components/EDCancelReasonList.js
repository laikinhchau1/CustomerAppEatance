/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { RadioButton, RadioGroup } from 'react-native-flexi-radio-button';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDButton from './EDButton';
import EDRTLText from './EDRTLText';
import EDRTLTextInput from './EDRTLTextInput';
import EDRTLView from './EDRTLView';

export default class EDCancelReasonsList extends Component {


    constructor(props) {
        super(props);
        this.arrayCancellationReasons = this.props.reasonData
    }

    state = {
        selectedIndex: this.props.selectedCancelReasonIndex || -1,
        strCancellationReason: '',
        shouldPerformValidation: false
    }

    componentDidMount() {
    }

    render() {
        return (
       

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={styles.productsSummaryContainer}>

                    <EDRTLText
                        style={styles.modalTitle}
                        title={strings('selectReason')} />

                    <RadioGroup
                        color={EDColors.text}
                        onSelect={this.onSelectionIndexChangeHandler}
                        style={{ marginHorizontal: 15, backgroundColor: EDColors.transparent, marginTop: 10 }}
                        selectedIndex={this.state.selectedIndex}
                        thickness={2}
                        size={16}
                        activeColor={EDColors.primary}
                    >
                        {this.arrayCancellationReasons.map(index => {
                            return (
                                <RadioButton
                                    style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' , alignItems:'center'}}
                                    key={index.label}
                                    value={index.label}
                                    color={EDColors.primary}
                                >
                                    <EDRTLText title={index.label} style={styles.itemPrice} />

                                </RadioButton>
                            )
                        })}
                    </RadioGroup>

                    {this.state.selectedIndex == this.arrayCancellationReasons.length - 1
                        ?
                        <>
                           
                            <EDRTLTextInput
                                defaultValue={this.state.strCancellationReason}
                                value={this.state.strCancellationReason}
                                placeholder={strings("enterReason")}
                                tintColor={EDColors.primary}
                                autoCorrect={false}
                                selectionColor={EDColors.primary}
                                onChangeText={this.onTextDidChangeHandler}
                                direction={isRTLCheck() ? 'rtl' : 'ltr'}
                                maxLength={250}
                                containerStyle={{
                                    marginTop: 0,
                                    marginBottom: 0,

                                }}
                                style={{
                                    marginTop: 0,
                                    marginBottom: 0,
                                    marginHorizontal: 20,
                                    overflow : "hidden"

                                }}

                            />
                            <EDRTLText style={[styles.counterStyle, { textAlign: isRTLCheck() ? "left" : "right" }]}
                                title={this.state.strCancellationReason.length + "/250"}
                            />
                        </>
                        : null}

                    {this.state.shouldPerformValidation
                        ? this.state.selectedIndex == -1
                            ? <EDRTLText style={styles.errorTextStyle}
                                title={strings('selectReason')} />
                            : this.state.selectedIndex == this.arrayCancellationReasons.length - 1 && this.state.strCancellationReason.trim().length == 0
                                ? <EDRTLText style={styles.errorTextStyle}
                                    title={strings('emptyReason')} />
                                : null
                        : null}

                    <EDRTLView style={{ justifyContent: 'center' }}>
                        <EDButton
                            style={styles.dismissButton}
                            label={strings('submitButton')}
                            textStyle={{ fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16) }}
                            onPress={this.buttonSavePressed} />
                        <EDButton
                            style={[styles.dismissButton, { backgroundColor: EDColors.offWhite }]}
                            label={strings('dismiss')}
                            textStyle={{ color: EDColors.black, fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(16) }}
                            onPress={this.buttonDismissPressed} />
                    </EDRTLView>

                </View>
            </View>
        )
    }

    onSelectionIndexChangeHandler = (selectedIndexRadioButton, selectedValue) => {
        this.setState({
            selectedIndex: selectedIndexRadioButton,
            strCancellationReason: selectedIndexRadioButton == this.arrayCancellationReasons.length - 1
                ? ''
                : selectedValue,
            shouldPerformValidation: false
        })
    }

    onTextDidChangeHandler = (reason) => {
        this.setState({ strCancellationReason: reason })
    }

    buttonDismissPressed = () => {
        if (this.props.onDismissCancellationReasonDialogueHandler !== undefined) {
            this.props.onDismissCancellationReasonDialogueHandler()
        }
    }

    buttonSavePressed = () => {
        this.setState({ shouldPerformValidation: true })
        if (this.state.selectedIndex == this.arrayCancellationReasons.length - 1 && this.state.strCancellationReason.trim().length == 0) {
            return;
        }

        if (this.state.selectedIndex == -1) {
            return;
        }

        if (this.props.onDismissCancellationReasonDialogueHandler !== undefined) {
            this.props.onDismissCancellationReasonDialogueHandler(this.state.strCancellationReason)
        }
    }
}


const styles = StyleSheet.create({
    productsSummaryContainer: { borderRadius: 24, marginBottom: 50, marginHorizontal: 15, paddingVertical: 10, backgroundColor: EDColors.white, shadowOpacity: 0.25, shadowRadius: 5, shadowColor: EDColors.text, shadowOffset: { height: 0, width: 0 } },
    modalTitle: { paddingVertical: 15, marginHorizontal: 20, color: EDColors.primary, fontSize: getProportionalFontSize(16), fontFamily: EDFonts.semiBold, fontWeight: '500', borderBottomColor: "#F6F6F6", borderBottomWidth: 1 },
    itemPrice: { marginHorizontal: 5,  color: EDColors.text, fontSize: getProportionalFontSize(14), fontFamily: EDFonts.medium, fontWeight: '500' },
    dismissButton: {
        paddingHorizontal: 0, alignSelf: 'center', marginTop: 20, marginBottom: 10, marginHorizontal: 10,
        fontSize: getProportionalFontSize(16),
        height: Metrics.screenHeight * 0.073,
        width: Metrics.screenWidth * 0.37,
        justifyContent: 'center',
        fontFamily: EDFonts.medium, borderRadius: 16
    },
    errorTextStyle: {
        fontSize: getProportionalFontSize(12),
        fontFamily: EDFonts.regular,
        color: EDColors.error,
        marginHorizontal: 20,
    },
    counterStyle: {
        marginHorizontal: 20,
        marginTop: 5,
        fontSize: getProportionalFontSize(12),
        color: EDColors.text
    },
})


/* eslint-disable prettier/prettier */
import React from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import EDRTLView from '../components/EDRTLView'
import { strings } from '../locales/i18n'
import { RadioButton, RadioGroup } from "react-native-flexi-radio-button";
import { EDColors } from '../utils/EDColors'
import { debugLog, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from '../utils/EDFontConstants'
import EDButton from './EDButton'
import EDRTLText from "./EDRTLText";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default class EDRadioDailogWithButton extends React.Component {

    state = {
        selected: "",
        value: this.props.selected || 1
    };

    sortType = [
        {
            label: strings("yesDiscard"),
            size: 15,
            selected: false
        },
        {
            label: strings("noKeep"),
            size: 15,
            selected: false
        }

    ]

    onSelectedIndex = (value) => {
        this.setState({ value: value })
    }

    render() {
        return (
            <View
                pointerEvents={this.props.isLoading ? 'none' : 'auto'}
                style={styles.modalContainer}>
                <View style={styles.modalSubContainer}>
                    <EDRTLView style={{}}>

                        {/* TITLE */}
                        <Text style={[styles.deleteTitle, { fontSize: getProportionalFontSize(16) }]}>
                            {this.props.title || ''}
                        </Text>

                        <MaterialIcon
                            name={"close"}
                            size={20}
                            color={EDColors.white}
                            onPress={this.props.onCancelPressed}
                            style={styles.iconStyle} />

                    </EDRTLView>
                    <View style={styles.seperator} />
                    <View style={[styles.container, this.props.viewStyle]}>
                        {this.props.Texttitle !== undefined && this.props.Texttitle !== null && this.props.Texttitle !== "" ?
                            <EDRTLText style={[styles.title, this.props.titleStyle]} title={this.props.Texttitle} /> : null}
                      
                            {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    alignSelf: isRTLCheck() ? "flex-start" : "flex-start",
                                }}
                            > */}
                                <RadioGroup
                                    color={EDColors.primary || EDColors.text}
                                    onSelect={this.onSelectedIndex}
                                    style={[this.props.style, {
                                       
                                    }]}
                                    selectedIndex={this.state.value}>

                                    {this.sortType.map(index => {
                                        return (
                                            <RadioButton
                                                style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
                                                key={index.label}
                                                value={index.label}>
                                                <Text style={{ marginHorizontal: 5 , fontFamily: EDFonts.regular}}>
                                                    {index.label}
                                                </Text>
                                            </RadioButton>
                                        )
                                    })}
                                </RadioGroup>
                            {/* </ScrollView> */}
                    </View>

                    {/* BUTTONS CONTAINER */}
                    <EDRTLView style={styles.optionContainer}>

                        {/* YES BUTTON */}
                        <EDButton label={this.props.label} style={styles.deleteOption}
                            textStyle={{ marginVertical: 0, fontFamily: EDFonts.bold }} onPress={this.onContinueButtonPress} />

                    </EDRTLView>
                </View>
            </View>
        )
    }

    onContinueButtonPress = () => {
        if (this.props.onContinueButtonPress != undefined) {
            this.props.onContinueButtonPress(this.state.value)
        }
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        justifyContent: 'center',
    },
    modalSubContainer: {
        backgroundColor: EDColors.offWhite,
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 6,
        marginTop: 20,
        marginBottom: 20
    },
    deleteTitle: {
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(14),
        color: '#000',
        marginTop: 10,
        alignSelf: 'center',
        textAlign: 'center',
        marginLeft: 20,
        marginRight: 20,
        padding: 10,
        flex: 1,
    },
    optionContainer: {
        justifyContent: 'flex-end',
        backgroundColor: 'white'
    },
    deleteOption: {
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(14),
        color: '#fff',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 30,
        paddingRight: 30,
        margin: 10,
        backgroundColor: EDColors.primary
    },
    container: {
        margin: 10,
        marginTop: 20
    },
    title: {
        fontFamily: EDFonts.black,
        color: EDColors.black,
        fontSize: getProportionalFontSize(14),
        marginHorizontal: 10
    },
    iconStyle: {
        alignSelf: 'center',
        textAlign: 'center', backgroundColor: EDColors.primary, padding: 2, marginTop: -10
    },
    seperator: { backgroundColor: EDColors.primary, height: 5, width: 120, alignSelf: 'center', marginLeft: -25, borderRadius: 10 },

})

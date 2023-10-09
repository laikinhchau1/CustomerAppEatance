/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import EDRTLView from '../components/EDRTLView';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from '../utils/EDFontConstants';
import Validations from '../utils/Validations';
import EDCustomRadioComponent from './EDCustomRadioComponent';

export default class EDLanguageSelect extends React.Component {
    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props)
        this.validationsHelper = new Validations();
        this.language = [
            {
                language_name: strings("en"),
            },
            {
                language_name: strings("fr"),
            },
            {
                language_name: strings("ar"),
            },
        ]
        this.selectLanguage = this.props.lan === "fr" ? 1 : this.props.lan === "ar" ? 2 : 0

    }

    state = {
        isLoading: false
    }

    render() {
        return (
            <View style={styles.modalContainer} pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
                <View style={styles.modalSubContainer}>
                    <EDRTLView style={{ justifyContent: 'space-between' }}>
                        <Text style={styles.titleTextStyle}>
                            {this.props.title}
                        </Text>
                        <TouchableOpacity onPress={this.props.onDismissHandler} style={{ alignSelf: 'center', }}>
                            <Icon
                                name={"close"}
                                size={getProportionalFontSize(20)}
                                color={EDColors.grayNew}
                            />
                        </TouchableOpacity>
                    </EDRTLView>

                    <View style={styles.separator} />
                    <EDCustomRadioComponent
                        data={this.props.languages !== undefined ? this.props.languages : this.language}
                        selectedIndex={this.selectLanguage}
                        keyName={"language_name"}
                        onSelected={value => { this.onChangeLanguageClick(value); }}

                    />
                </View>
            </View>
        );
    }

    /**
 * @param { Option selected for Launguage } language
 */
    lanSelectClick = () => {

    };

    onChangeLanguageClick = (language) => {
        this.props.onChangeLanguageHandler(language)
    }
}

//#region STYLES
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)'
    },
    modalSubContainer: {
        backgroundColor: EDColors.white,
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 24,
        marginTop: 20,
        marginBottom: 20,
    },
    titleTextStyle: { fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(18), margin: 5, color: EDColors.primary },
    separator: { height: 1, backgroundColor: EDColors.separatorColor, width: "100%", marginVertical: 10 }
})
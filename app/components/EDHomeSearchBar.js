/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import metrics from '../utils/metrics';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export default class EDHomeSearchBar extends React.Component {
  
    onCleanPress = () =>{
        this.textInput.clear()
        this.props.onCleanPress()
    }
    render() {
        return (
            <EDRTLView
                onLayout={this.props.onLayout}
                style={[styles.mainContainer, this.props.style]} pointerEvents={this.props.pointerEvent} >

                {/* SEARCH ICON */}
                <View style={styles.childContianer} >
                    <Icon name={"search1"} type="ant-design" containerStyle={{ marginVertical: 10 }} color={EDColors.blackSecondary} size={getProportionalFontSize(20)} onPress={this.props.onSearchPress} />
                </View>

                {/* SEARCH BAR */}
                <EDRTLView style={styles.searchBarView} >

                    {/* INPUT FIELD */}
                    <TextInput
                        value={this.props.value}
                        style={{ flex: 1, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(14), textAlign: isRTLCheck() ? 'right' : 'left' }}
                        numberOfLines={1}
                        ref={ref => this.textInput = ref}
                        placeholder={this.props.placeholder}
                        placeholderTextColor={EDColors.text}
                        onChangeText={userText => { this.props.onChangeValue(userText) }}
                        returnKeyType="search"
                        onSubmitEditing={this.props.onSearchPress}
                        selectionColor={EDColors.primary}
                    />
                    {/* SEARCH ICON */}
                    {this.props.showIcon ?
                        <>
                            {this.props.showClear ?

                                <TouchableOpacity
                                    style={{ paddingHorizontal: 8 }}
                                    onPress={this.onCleanPress}
                                    disabled={this.props.disabled}
                                >
                                    <View style={{
                                        height: "100%",
                                        justifyContent: "center"
                                    }} >
                                        <Icon name={"close-circle"} color={EDColors.text} type="ionicon" size={18} />
                                    </View>
                                </TouchableOpacity> : null}
                            <TouchableOpacity
                                style={{ paddingHorizontal: 8 }}
                                onPress={this.props.onClosePress}
                                disabled={this.props.disabled}
                            >
                                <View style={{
                                    height: "100%",
                                    justifyContent: "center"
                                }} >
                                    <EDRTLText title={strings("dismiss")} style={{ color: EDColors.primary, fontFamily: EDFonts.bold, fontSize: getProportionalFontSize(14) }} />
                                </View>

                            </TouchableOpacity>
                        </>
                        : null}
                </EDRTLView>
            </EDRTLView>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: EDColors.white,
        marginHorizontal: 15,
        borderRadius: 16,
        overflow: 'visible',
        alignItems: "center",
        paddingHorizontal: 10,
        height: metrics.screenHeight * 0.068,
        marginTop: -(metrics.screenHeight * 0.075) / 2,
        shadowColor: EDColors.shadow,
        shadowOffset: {
            width: 1,
            height: 1,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 2,
    },
    childContianer: {
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: EDColors.transparent,
        alignItems: "center",
        justifyContent: "center",
    },
    searchBarView: { paddingLeft: 0, flex: 1, height: '100%' },
    iconStyle: { flex: 1, marginTop: 12 }
})
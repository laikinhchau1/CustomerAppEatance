import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { RadioButton, RadioGroup } from "react-native-flexi-radio-button";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";

export default class RadioGroupWithHeader extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    state = {
        data: this.props.data,
        selected: "",
        value: this.props.selected || 0,
        isShow: true
    };

    onPress = data => { };

    handleIsShow = () => {
        this.setState({ isShow: !this.state.isShow })
    }

    onSelectedIndex = (value) => {
        this.props.onSelected(value);
        this.setState({ value: value })
    }
    render() {
        return (
            <View style={[style.container, this.props.viewStyle]}>
                {this.props.Texttitle !== undefined && this.props.Texttitle !== null && this.props.Texttitle !== "" ?
                    <View>
                        <View style={{ flexDirection: isRTLCheck() ? "row-reverse" : "row", justifyContent: "space-between" }} >
                            <EDRTLText style={[style.title, this.props.titleStyle]} title={this.props.Texttitle} />
                            {/* <Icon name = { this.state.isShow ? "expand-less" : "expand-more"} size = {30} onPress = {this.handleIsShow} /> */}
                        </View>
                        {/* <View style={{ borderWidth: 0.5, borderColor: EDColors.radioSelected, marginVertical: 5, marginHorizontal: 10 }} /> */}
                    </View> : null}
                {this.state.isShow ?
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row', }}>
                        <RadioGroup
                            color={this.props.radioColor || (EDColors.primary || EDColors.text)}
                            onSelect={this.onSelectedIndex}
                            style={this.props.style}
                            activeColor={this.props.activeColor || null}
                            size={this.props.radioButtonSize}
                            selectedIndex={this.state.value}>
                            {this.props.data.map(index => {
                                return (
                                    <RadioButton
                                        style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row', }}
                                        key={index.label}
                                        value={index.label}>
                                        <Text style={[{ marginRight: 5,fontFamily : EDFonts.regular,  color: this.props.forHome ?( this.state.value !== index.selected ? (this.props.activeColor || null) : (this.props.radioColor || (EDColors.primary || EDColors.text))) : undefined }, this.props.lableStyle]}>
                                            {index.label}
                                        </Text>
                                    </RadioButton>
                                )
                            })}
                        </RadioGroup>
                    </ScrollView> : null}
                {/* </View> */}
            </View>
        );
    }
}

export const style = StyleSheet.create({
    container: {
        borderRadius: 6,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.8,
        // shadowRadius: 2,
        // elevation: 2,
        padding: 10,
        backgroundColor: "#fff",
        margin: 10
    },
    title: {
        fontFamily: EDFonts.semiBold,
        color: EDColors.grayNew,
        fontSize: getProportionalFontSize(13),
        marginHorizontal: 10
    },
});

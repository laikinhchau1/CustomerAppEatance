import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import EDImage from "./EDImage";

export default class HomeCategoryCard extends Component {

    render() {
        this.categoryObjModel = this.props.categoryObjModel.item;

        return (
            <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={() => {
                    this.props.onPress(this.categoryObjModel);
                }}>
                <View style={[styles.mainView, {
                    backgroundColor: this.props.isSelected ? EDColors.primary : EDColors.category
                }]}>
                    <EDImage
                        source={this.categoryObjModel.image}
                        style={[styles.imageStyle, {
                            borderColor: EDColors.white
                        }]}
                        resizeMode={"cover"}
                    />
                    <Text
                        numberOfLines={1}
                        style={[styles.textStyle, { color: this.props.isSelected ? EDColors.white : EDColors.black }]}>
                        {this.categoryObjModel.name}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1, backgroundColor: EDColors.white, borderRadius: 18, alignItems: 'center', paddingHorizontal:5, paddingTop: 15, paddingBottom: 20, marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
        marginVertical: 5,
        width : metrics.screenWidth * .265
    },
    textStyle: {
        textAlign: "center",
        fontSize: getProportionalFontSize(14), fontFamily: EDFonts.medium, marginTop: 10,
        color: EDColors.black
    },
    imageStyle: {
        width: metrics.screenHeight * 0.1,
        height: metrics.screenHeight * 0.1,
        borderRadius: metrics.screenHeight * 0.1 / 2,
        alignSelf: "center",
        shadowColor: EDColors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        
        elevation: 5,
        borderWidth: 4
    }
})

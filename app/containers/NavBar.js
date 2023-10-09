
import { Title } from "native-base";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import EDRTLView from "../components/EDRTLView";
import { EDColors } from "../utils/EDColors";
import {getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import { default as Metrics, default as metrics } from "../utils/metrics";

export default class NavBar extends React.Component {
    render() {
        return (
            <SafeAreaView style={{ backgroundColor: EDColors.primary }}>
                {/* <View style={styles.parentContainer}>
                <EDRTLView style={styles.contentContainer}> */}

                <EDRTLView
                    androidStatusBarColor={EDColors.primary}
                    style={{ backgroundColor: EDColors.primary, height: metrics.screenHeight * 0.065, alignItems: 'center' }}>

                    {/* <View style={{flexDirection:'row',flex:5}}> */}
                    <EDRTLView style={{ flex: this.props.right !== undefined && this.props.right.length > 0 ? 5 : 10 }}>
                        {this.props.left ? (
                            // <View style={{  marginHorizontal: 10 }}>
                            <TouchableOpacity
                                hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                                style={{ marginHorizontal: 10, justifyContent: 'center' }}
                                onPress={this.props.onLeft}>
                                {this.props.left == 'menu' ?
                                    <View style={{ justifyContent: 'space-evenly', alignItems: isRTLCheck() ? 'flex-end' : 'flex-start' }}>
                                        <View style={{ width: metrics.screenWidth * 0.05, height: metrics.screenHeight * 0.003, backgroundColor: EDColors.white }} />
                                        <View style={{ width: metrics.screenWidth * 0.065, height: metrics.screenHeight * 0.003, backgroundColor: EDColors.white, marginVertical: 3.5 }} />
                                        <View style={{ width: metrics.screenWidth * 0.05, height: metrics.screenHeight * 0.003, backgroundColor: EDColors.white }} />
                                    </View>
                                    :
                                    // <MaterialIcon size={30} color={EDColors.white} name={isRTLCheck() ? 'keyboard-arrow-right' : 'keyboard-arrow-left'} />
                                    <Icon name={isRTLCheck() ? "arrow-forward-ios" : "arrow-back-ios"} size={getProportionalFontSize(20)} color={EDColors.white} />
                                }
                            </TouchableOpacity>
                        ) : (null)}
                        {/* TITLE VIEW */}
                        <View style={[styles.titleText, {

                        }]} >
                            <Title style={styles.titleTextStyle} >
                                {this.props.title ? this.props.title + "" : null}
                            </Title>
                        </View>
                    </EDRTLView>


                    {/* RIGHT VIEW */}
                    {/* <Right style={{ flex: 5, marginLeft: 10, borderWidth:1, borderColor:'green' }}> */}

                    <EDRTLView style={{ flex: 5, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 8 }}>
                        {this.props.isLeftFC ?
                            <TouchableOpacity
                                hitSlop={{ top: 10, left: 10, bottom: 10, right: 10, }}
                                // style={{ marginHorizontal: 3 }}
                                onPress={this.props.onLeftFC}>
                                <MaterialIcon size={27} color={EDColors.white} name={this.props.menuFC} />
                            </TouchableOpacity>
                            : null}
                        {this.props.right !== undefined && this.props.right.length > 0 ?
                            <EDRTLView>
                                {this.props.right.map((item, index) => {
                                    if (item.name != undefined && item.name == "Cart") {
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[{
                                                    width: metrics.screenWidth * 0.07,  height: 40, width: 40,
                                                    // borderColor: 'red', borderWidth: 1
                                                }, this.props.rightStyle]}
                                                onPress={() => { this.props.onRight(index) }}>
                                                <View style={{ flex: 1, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                                                    {/* <Image
                                                 source={item.url}
                                                 style={{ height: 25, width: 25 }}
                                                 resizeMode="contain"
                                             /> */}
                                                    <Icon
                                                        name={'shoppingcart'}
                                                        size={getProportionalFontSize(25)}
                                                        color={EDColors.white}
                                                        // type={"ant-design"}
                                                        type={item.type || "material"}
                                                    />
                                                </View>
                                                {item.value != undefined &&
                                                    item.value != null &&
                                                    item.value > 0 ? (
                                                    <View style={styles.valueStyle}>
                                                        <Text style={{ color: "#000", fontSize: item.value > 99 ? 7 : 9 , }}>
                                                             { item.value > 99 ? "99+" : item.value }
                                                        </Text>
                                                    </View>
                                                ) : null}
                                                {console.log(item.value)}
                                            </TouchableOpacity>
                                        );
                                    } else {
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={{ justifyContent: 'center', alignItems: "center", marginHorizontal: 1, width: 40 }}
                                                onPress={() => { this.props.onRight(index); }}>
                                                {/* <Image
                                             source={item.url}
                                             // style={{height: 20}}
                                             resizeMode="contain"
                                         /> */}
                                                <Icon
                                                    name={item.url}
                                                    size={getProportionalFontSize(27)}
                                                    color={EDColors.white}
                                                    type={item.type || "ant-design"}
                                                />
                                            </TouchableOpacity>
                                        );
                                    }
                                })}
                            </EDRTLView>
                            : <View style={{ flex: 5 }} />}
                        {/* </Right> */}
                    </EDRTLView>
                </EDRTLView>
            </SafeAreaView>

        );
    }
}

const styles = StyleSheet.create({
    navbar: {
        backgroundColor: EDColors.primary,
        flex: 0,
        width: "100%",
        height: Metrics.navbarHeight,
        borderBottomColor: EDColors.primary,
        marginTop: Metrics.statusbarHeight + 10,
        borderBottomWidth: 0.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 5,
        paddingRight: 5
    },
    content: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center"
    },
    left: {
        color: EDColors.primary,
        height: 23,
        // width: 23,
        resizeMode: "stretch"
    },
    hitSlop: { top: 20, left: 20, bottom: 20, right: 20 },
    // hitSlopStyle: { borderWidth:1 },
    titleText: {
        // flex: 8,
        paddingLeft: 5,
        paddingRight: 5,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    titleTextStyle: {
        textAlign: "center",
        alignSelf: "center",
        color: "#fff",
        fontSize: getProportionalFontSize(17),
        fontFamily: EDFonts.bold
    },
    valueStyle: {
        borderRadius: 50,
        height: metrics.screenHeight * 0.023,
        width:  metrics.screenHeight * 0.023,
        backgroundColor: "#fff",
        color: "#000",
        marginLeft: 20,
        marginBottom: 30,
        alignItems: "center",
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: getProportionalFontSize(12),
        position: "absolute",
        justifyContent: "center",


    }
});
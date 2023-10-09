/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native'
import { Icon } from 'react-native-elements'
import { strings } from '../locales/i18n'
import { EDColors } from '../utils/EDColors'
import { funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants'
import { EDFonts } from '../utils/EDFontConstants'
import metrics from '../utils/metrics'
import EDImage from './EDImage'
import EDRTLView from './EDRTLView'
import EDThemeButton from './EDThemeButton'

export default class EDCategoryOrder extends React.Component {
    render() {
        return (
            <View style={styles.modalContainer}>
                {/* <TouchableOpacity onPress={this.props.onDismissHandler} style={{ flex: 1 }} >
                    <Text>{""}</Text>
                </TouchableOpacity> */}
                
                <View style={styles.modalSubContainer}>
                    <TouchableOpacity style = {[styles.cancelButton , { alignSelf : isRTLCheck() ? 'flex-start' : 'flex-end' }]} onPress={this.props.onDismissHandler} >
                        <Icon
                        name = "close"
                        size={getProportionalFontSize(21)}
                        color={EDColors.grayNew}
                        />
                    </TouchableOpacity>
                    <EDRTLView style={[styles.topContainer]} >
                        <EDImage
                            source={this.props.image}
                            style={styles.itemImage}
                            // resizeMode={'center'}
                        />
                        <View style={styles.itemsView} >
                            <Text style={styles.categoryName}> {this.props.categoryName} </Text>
                            {this.props.currency !== undefined && this.props.currency !==null ?
                            <Text style={styles.categoryPrice}> { this.props.currency + funGetFrench_Curr(this.props.price, 1, this.props.currency) } </Text> :null}
                        </View>
                    </EDRTLView>
                    <EDRTLView style={styles.buttonViewStyle}>
                        <EDThemeButton
                            isTransparent={true}
                            style={styles.buttonStyle}
                            textStyle={styles.themeButton}
                            onPress={this.props.newButtomHandler}
                            label={strings("addNew")}
                        />
                        <EDThemeButton
                            isTransparent={true}
                            style={styles.repeatButtonStyle}
                            textStyle={styles.repeatThemeButton}
                            onPress={this.props.repeatButtonHandler}
                            label={strings("repeatLast")}
                        />
                    </EDRTLView>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.50)"
    },
    topContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
        // marginVertical: 20,
        marginHorizontal : 15,
        // paddingBottom: 20
    },
    cancelButton: {  marginHorizontal: 10, alignSelf: "flex-end", marginTop : 5 },
    modalSubContainer: {
        backgroundColor: EDColors.imgBack,
        paddingBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 24,
        width: Dimensions.get("window").width - 30,
        height: Dimensions.get("window").height * 0.25 ,
        marginTop: 50,
        marginBottom: 20,
        alignSelf: "center"
    },
    itemsView: { justifyContent: "center", flex:1 , marginHorizontal: 5},
    categoryName: {  fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16), color:EDColors.black },
    categoryPrice: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(14), color:EDColors.black  },
    themeButton: { color: EDColors.white, fontFamily: EDFonts.medium, paddingHorizontal: 10, fontSize : getProportionalFontSize(16)},
    buttonStyle: {
        // width: (metrics.screenWidth * 0.5) - 60,
        flex:1,
        height: metrics.screenHeight * 0.07, 
        borderColor: EDColors.primary,
        paddingBottom: 0,
        backgroundColor: EDColors.primary,
        borderRadius: 16,
        marginHorizontal:5
    },
    repeatThemeButton: { color: EDColors.black, fontFamily: EDFonts.medium, paddingHorizontal: 10,fontSize: getProportionalFontSize(16)},
    repeatButtonStyle: {
        // width: (metrics.screenWidth * 0.5) - 60,
        flex:1,
        height:metrics.screenHeight * 0.07,
        borderColor: EDColors.radioSelected,
        paddingBottom: 0,
        backgroundColor: EDColors.radioSelected,
        borderRadius : 16,
        marginHorizontal:5
    },
    itemImage: { height: 60, width: 60, borderRadius: 8  , alignSelf:'center'},
    buttonViewStyle: { margin: 10, justifyContent: 'space-evenly' , flex:1 ,}
})
// Vikrant 19-07-21
import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import EDRTLView from './EDRTLView';


export default class EDTopTabBar extends Component{

render(){
    return(
            <View style={{backgroundColor: EDColors.primary}}>
                <ScrollView
                    horizontal={true}
                    contentContainerStyle={{backgroundColor: EDColors.primary , flex:1 , justifyContent:isRTLCheck()? "flex-end":"flex-start"}}
                >
                <EDRTLView style={styles.tabView}>
                    {
                        this.props.data.map((item,index)=>(
                            <TouchableOpacity
                            style={[styles.buttonStyle , {borderBottomColor: this.props.selectedIndex == item.index ? 'white' : EDColors.primary }]}
                            onPress={()=>item.onPress(item.index)}
                                >
                            <Text
                                // style={styles.buttonTextStyle}
                                style={ [styles.buttonTextStyle , { color: this.props.selectedIndex == item.index ?  EDColors.white : EDColors.white }]}
                            >
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                        ))
                
                    }
                    
                </EDRTLView>
                </ScrollView>
            </View>
             )
        }
}

const styles = StyleSheet.create({
    tabView:{
        flex : 0.8 , height : Metrics.screenHeight * 0.07 , backgroundColor : EDColors.primary , alignItems:'center'
    },
    buttonTextStyle:{ paddingTop:10 ,fontSize : getProportionalFontSize(18) , fontFamily : EDFonts.semiBold , color : EDColors.white , textAlign: 'center'}
    ,
    buttonStyle:{ flex: 0.8 ,height:'100%' ,alignItems :'center' , alignSelf:'center' , marginHorizontal:10  , borderBottomWidth:3 ,}
})
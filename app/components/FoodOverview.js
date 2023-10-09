import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import { Animated, Easing } from "react-native";
import CachedImage from 'react-native-image-cache-wrapper';
import Assets from "../assets";
import { Icon } from "react-native-elements";

const AnimatedFastImage = Animated.createAnimatedComponent(CachedImage);
export default class FoodOverview extends React.PureComponent {

    constructor(props) {
        super(props);
        // this.props.cartData = []
        this.imageWidth = new Animated.Value(83)
        this.imageHeight = new Animated.Value(83)
        this.animatedTop = new Animated.Value(0)
        this.animatedRadius = new Animated.Value(8)
    }

    state = {
        animated: false,
        source: this.props.item.name,
        isAnimating: false,
    }

    onClickHandler = () => {
        this.props.onClick(this.props.item);
    }

    
    onMainLayout = e => {
        this.actualWidth = e.nativeEvent.layout.width
    }

    animateImage = () => {
        this.setState({ isAnimating: true })
        Animated.timing(this.imageHeight, {
            toValue: this.state.animated ? 85 : 125,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false
        }).start();
        Animated.timing(this.animatedRadius, {
            toValue: this.state.animated ? 8 : 16,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false
        }).start();
        Animated.timing(this.animatedTop, {
            toValue: this.state.animated ? 0 : 135,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false
        }).start();
        Animated.timing(this.imageWidth, {
            toValue: this.state.animated ? 85 : this.actualWidth - 32,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false
        }).start(() => {
            this.setState({
                animated: !this.state.animated,
                isAnimating: false,
                // , source: !this.state.animated ? this.props.data.image + "?clear" : this.props.data.image +"?low"
            })
        }
        );

    }

    render() {
        return (
             <TouchableOpacity 
             onLayout={this.onMainLayout}
             onPress={this.onClickHandler}>
             <EDRTLView style={style.container}>

                 <Animated.View style={style.centerViewStyle, {
                     }}></Animated.View>
                 <TouchableOpacity
                     activeOpacity={1}

                     onPress={this.animateImage}
                 >
                      <AnimatedFastImage
                             resizeMode={"cover"}
                             defaultSource={Assets.user_placeholder}
                             source={
                             // {uri:  this.props.item.image }}
                                 this.props.item.image !== undefined &&
                                     this.props.item.image !== null &&
                                     this.props.item.image.trim().length !== 0 ?
                                     { uri:  this.props.item.image  } : Assets.user_placeholder}

                             style={[style.sideImage, { width: this.imageWidth, height: this.imageHeight, backgroundColor: '#f1eff0',borderRadius: this.animatedRadius }]}
                         />
                 </TouchableOpacity>

                 <View style={style.subContainer}>
                     <EDRTLView>
                         <EDRTLText style={style.title} title={this.props.item.name} />
                      </EDRTLView>
                      <EDRTLText numberOfLines={2} style={style.desc} title={this.props.item.detail} />
                      <EDRTLText title={strings("foodType") + this.props.item.food_type_name} style={style.foodType} />
                      <EDRTLView >
                                {this.props.item.recipe_time != undefined && 
                                    this.props.item.recipe_time != null ? (
                                    <EDRTLView style={style.iconView}>
                                        <Icon name={"clockcircleo"} size={getProportionalFontSize(12)} color={'#666666'} type={'ant-design'} style={{marginTop:2}} />
                                        <EDRTLText title={this.props.item.recipe_time + " " + strings("mins")} style={[style.foodType , { marginHorizontal:5}]} />
                                    </EDRTLView>
                                ) : null}
                        </EDRTLView>
                  </View>
              {/* </View> */}
              </EDRTLView>
          </TouchableOpacity>

        );
    }
}

export const style = StyleSheet.create({
    container: {
        borderRadius: 16,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
        margin: 10,
        alignSelf: "flex-start",
        backgroundColor: EDColors.transparentBackground,
        overflow: 'hidden',
        flexWrap:'wrap',
        margin: 10,
        padding: 5,
        justifyContent: "space-between"
    },
    foodType: {
        fontFamily: EDFonts.regular,
        color: "#000",
        fontSize: getProportionalFontSize(12),
        marginTop: 3
    },
    sideImage: {
        // flex: 1,
        width: 83,
        height: 83,
        borderRadius:8,
        marginVertical:1,
        marginHorizontal:1
    },
    subContainer: {
        marginVertical: 10,
        marginHorizontal:10,
        flex: 1,
    },
    title: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(17),
        color: EDColors.black,
    },
    desc: {
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(14),
        marginTop: 5
    },
    iconView:{
        alignItems:'center',
    }
});

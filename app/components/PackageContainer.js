import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import {Icon} from 'react-native-elements';
import EDImage from "./EDImage";

export default class PackageContainer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {};

        this.fontSize = Platform.OS == "ios" ? "18px" : "18px";
        this.meta =
            '<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>';


        this.customStyle =
            this.meta +
            "<style>* {max-width: 100%;} body {font-size:" +
            this.fontSize +
            ";}</style>";
    }

    viewMore = () => {
        this.props.viewMore(this.props.pos, this.props.id)
    }

    render() {
        return (
            <TouchableOpacity
            style={style.mainView} 
            onPress={() => { this.props.onPress(this.props.pos, this.props.id); }}>
            <EDRTLView style={this.props.isSelected ? style.containerSelected : style.container}>
            <EDImage style={style.sideImage} source={this.props.pkgImage} />
                <View style={style.detail}>
                    <EDRTLText style={[style.pkgText]}
                        title={this.props.pkgName } />

                    <EDRTLView style={style.subView}>
                        <EDRTLText style={style.pkgAvlText}
                            title={strings("eventAvailability") + " - " + this.props.pkgAvailable} />
                        </EDRTLView>

                        <EDRTLView style={style.detailView}>
                        <EDRTLText style={style.detailName}
                            title={this.props.currency + this.props.price} />

                        <EDRTLView>
                            <EDRTLText style={style.moreView}
                            onPress={this.viewMore}
                            title={strings("viewDetails")} />
                            <Icon  name={'keyboard-arrow-down'} size={getProportionalFontSize(15)} color={EDColors.text}  style={style.arrowIcon} />
                   
                        </EDRTLView>

                        </EDRTLView>

                </View>
            </EDRTLView>
        </TouchableOpacity>
        );
    }
}


export const style = StyleSheet.create({
    container: {
        // flexDirection: "row",
        backgroundColor: "#fff",
        margin: 5,
        alignSelf: "center",
        borderRadius: 16 ,
        padding:3
    },
    mainView:{ flex: 1 , flexDirection : isRTLCheck() ? 'row-reverse' : 'row' },
    subView:{ flex: 1, justifyContent: "space-between" },
    arrowIcon:{ marginTop:7 , marginHorizontal:3},
    detailView:{ flex: 1, justifyContent: "space-between" , alignItems : 'center'},
    moreView:{  alignSelf: 'flex-end' , fontSize : getProportionalFontSize(12), fontFamily : EDFonts.regular , color : EDColors.text },
    pkgAvlText:{ marginVertical: 5, flex: 1, fontSize : getProportionalFontSize(12), fontFamily : EDFonts.regular },
    sideImage: {
                width: 80,
                height: 80,
                borderRadius:16,
                margin:5
            },
    containerSelected: {
        // flexDirection: "row",
        backgroundColor: "#fff",
        margin: 5,
        alignSelf: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: EDColors.primary,
        padding:3
    },
    image: {
        width: 80
    },
    detail: {
        flex: 4,
        marginLeft: 5,
        alignSelf: "center"
    },
    detailName: {
        color: "#000",
        fontSize: 14,
        fontFamily: EDFonts.bold,
        marginTop: 5
    },
    pkgText:{
        color: "#000",
        fontSize: 14,
        marginTop: 5,
        fontSize : getProportionalFontSize(16), fontFamily : EDFonts.semiBold},
});


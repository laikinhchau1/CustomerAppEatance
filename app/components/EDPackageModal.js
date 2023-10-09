/* eslint-disable react/no-string-refs */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react'
import { Alert, Dimensions, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import WebView from 'react-native-webview'
import { strings } from '../locales/i18n'
import { EDColors } from '../utils/EDColors'
import { debugLog, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants'
import { EDFonts } from '../utils/EDFontConstants'
import metrics from '../utils/metrics'
import EDImage from './EDImage'
import EDRTLText from './EDRTLText'
import EDRTLView from './EDRTLView'
import EDThemeButton from './EDThemeButton'
import { Spinner } from 'native-base'
import Assets from '../assets'


export default class EDpackageModal extends React.Component {

    constructor(props) {
        super(props)

        this.fontSize = Platform.OS == "ios" ? "14px" : "14px";
        this.meta = '<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>';
        this.meta = `
        <html `+ (isRTLCheck() ? "dir=rtl" : "dir=ltr") +`><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head>`;
        this.customStyle =
            this.meta +
            "<style>* {max-width: 100%;} body { font-size:" +
            this.fontSize +
            ";}</style>";
        this.endTag = "</html>"
    }

    render() {
        return (

            <View style={style.modalContainer}>
            <View style={style.modalSubContainer}>
                <EDRTLView style={style.mainView}>
                    <EDRTLText
                        style={[style.textStyle]}
                        numberOfLines={2}
                        html={this.props.html}
                        title={this.props.data.name} />

                    <TouchableOpacity
                        onPress={this.props.onDismissHandler}>
                        <Icon
                            name={"close"}
                            size={getProportionalFontSize(18)}
                            color={EDColors.text}
                            containerStyle={style.iconStyle}
                        />
                    </TouchableOpacity>
                </EDRTLView>

                <EDImage source={this.props.data.image} style={style.imageStyle}
                placeholder={Assets.logo}
                placeholderResizeMode="contain"
                />

                <View style={style.webView}>
                    <EDRTLView style={style.webSubView}>
                        <EDRTLText title={strings("menuDetails")} style={style.normalText} />
                        {/* <EDRTLText title={this.props.currency + this.props.data.price} style={style.price} /> */}
                    </EDRTLView>

                    {this.props.data.detail !== undefined && this.props.data.detail !== null && this.props.data.detail.trim().length !== 0
                        ?
                        <WebView
                            source={{ html: this.customStyle + this.props.data.detail+this.endTag }}
                            width="100%"
                            startInLoadingState={true}
                            renderLoading={() => { return (<Spinner size="small" color={EDColors.primary} style={{ flex: 1 }} />) }}
                            style={style.webViewStyle}
                            scrollEnabled={true}
                            originWhitelist={['http://*', 'https://*', 'intent://*', '*']}
                            onShouldStartLoadWithRequest={event => {
                                if (event.url.slice(0, 4) === 'http') {
                                    Linking.openURL(event.url);
                                    return false;
                                } else if (event.url.slice(0, 3) === 'tel') {
                                    const callNumber = event.url.slice(-10);
                                    Linking.openURL(`tel://${callNumber}`);
                                    return false;
                                } else if (event.url.startsWith('mailto:')) {
                                    this.openEmail(event)
                                    return false;
                                }
                                return true;
                            }}
                        //R.K 07-01-2021 Open email
                        />
                        : null}
                </View>


                <EDThemeButton
                    label={this.props.selected != this.props.data.package_id ? strings("selectPackage") : strings("unSelectPackage")}
                    onPress={this.onPackageSelection}
                    style={style.btnStyle}
                    textStyle = {style.btnText}
                />
            </View>
        </View>
        )
    }

    onPackageSelection = () => {
        if (this.props.selected !== this.props.data.package_id)
            this.props.selectPackage()
        else
            this.props.selectPackage(true)

    }
    //R.K 07-01-2021 Open email
    openEmail = (email) => {
        Linking.openURL(email.url).catch(er => {
            Alert.alert("Failed to open Link: " + er.message);

        });
        this.setState({ count: this.state.count + 1 })
    }
}



const style = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.50)"
    },
    webViewStyle:{ flex: 1, alignSelf: "flex-start", paddingBottom: Platform.OS == "ios" ? 0 : 15 },
    webView: { flex: 1,  marginTop: 10 },
    mainView: { borderBottomWidth: 1, borderBottomColor: EDColors.separatorColor },
    modalSubContainer: {
        backgroundColor: "#fff",
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 24,
        width: Dimensions.get("window").width - 40,
        height: metrics.screenHeight * 0.7,
        marginTop: 20,
        marginBottom: 20,
        padding:15
    },
    iconStyle:{ margin: 2 },
    webSubView:{ justifyContent: 'space-between', alignItems: "center" },
    btnStyle:{ borderRadius : 16, height : metrics.screenHeight * 0.065 , marginBottom: 5 , width:'100%'},
    btnText:{ fontSize : getProportionalFontSize(16) , fontFamily : EDFonts.medium },
    textStyle: {
        flex: 1,
        alignSelf: "center",
        // textAlign: "center",
        fontFamily: EDFonts.semiBold,
        color: "#000",
        fontSize: getProportionalFontSize(16),
        // marginHorizontal : 10
        margin : 15 
    },
    detailText: {
        fontFamily: EDFonts.regular,
        color: "#000",
        fontSize: getProportionalFontSize(14)
    },
    normalText: {
        fontFamily: EDFonts.semiBold,
        color: "#000",
        fontSize: getProportionalFontSize(16),
        margin: 5,
        // textDecorationLine: "underline",
    },
    price: {
        fontFamily: EDFonts.bold,
        color: "#000",
        fontSize: getProportionalFontSize(15),

    },
    imageStyle: {
        width: "100%",
        height: metrics.screenHeight * 0.15,
        marginTop: 15,
        borderRadius: 8
    }
})

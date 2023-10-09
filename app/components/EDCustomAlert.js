import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import EDRTLView from '../components/EDRTLView'
import { EDColors } from '../utils/EDColors'
import { EDFonts } from '../utils/EDFontConstants'
import EDPopupView from './EDPopupView'
import { connect } from 'react-redux'
import { saveAlertData } from '../redux/actions/User'
import { eatanceGlobalStore } from '../../App'
import { strings } from '../locales/i18n'
import { getProportionalFontSize } from '../utils/EDConstants'
import metrics from '../utils/metrics'
import EDImage from './EDImage'
import Assets from '../assets'
import { Icon } from 'react-native-elements'

export const showCustomAlert = (title = "", message = "", arrayButtonsToShow) => {
    eatanceGlobalStore.dispatch(
        saveAlertData({
            title: title,
            message: message,
            arrayButtonsToShow: arrayButtonsToShow
        })
    )
}

class EDCustomAlert extends React.Component {
    constructor(props) {
        super(props)
    }


    hidePopUp = () => {
        this.props.saveAlertData({})
    }


    render() {
        return (
            <EDPopupView
                animationType={"none"}
                isModalVisible={this.props.shouldShowAlert}>
                <View style={styles.cantainer}>
                    <EDRTLView style={styles.mainViewStyle}>

                        {/* ICON of HEADER */}
                        {this.props.Icon ?
                            <Icon
                                name={this.props.IconName}
                                type={this.props.IconType}
                                size={this.props.size || getProportionalFontSize(20)}
                                color={this.props.color || EDColors.black}
                            />
                            : <Image
                                source={Assets.logo}
                                style={styles.imageStyle}
                            />}
                        {/* TITLE OF HEADER */}
                        <EDRTLView style={styles.titleViewStyle}>
                            <Text style={styles.titleTextStyle}>
                                {this.props.alertData.title !== undefined &&
                                    this.props.alertData.title.trim().length !== 0 ?
                                    this.props.alertData.title : strings("appName")
                                }</Text>
                        </EDRTLView>

                        {/* MIDDLE TEXT VIEW */}
                        <EDRTLView style={styles.middleTextView}>
                            <Text style={styles.middleTextStyle}>{this.props.alertData.message}</Text>
                        </EDRTLView>

                        {/* BOTTOM BUTTON VIEW */}

                        <EDRTLView style={styles.bottomButtonView}>

                            {this.props.alertData.arrayButtonsToShow !== undefined ?

                                this.props.alertData.arrayButtonsToShow.map(
                                    data => {
                                        console.log("color::" , data.isNotPreferred)
                                        return <TouchableOpacity
                                            style={[styles.OkButtonView, { backgroundColor: data.isNotPreferred == true ? EDColors.offWhite : EDColors.primary }]}
                                            key={data.text}
                                            onPress={() => {
                                                this.hidePopUp();
                                                if (data.onPress !== undefined)
                                                    data.onPress();
                                            }}>
                                            <EDRTLView>
                                                <Text style={[styles.OkTextStyle, { color: data.isNotPreferred == true ? EDColors.black : EDColors.white  }]}>
                                                    {data.text}
                                                </Text>
                                            </EDRTLView>
                                        </TouchableOpacity>
                                    }
                                ) : null}


                        </EDRTLView>
                    </EDRTLView>
                </View>
            </EDPopupView>
        )
    }
}

const styles = StyleSheet.create({
    //Main top view
    mainViewStyle: {
        justifyContent: 'center',
        flexDirection: 'column',
        marginHorizontal: 15,
        borderRadius: 24,
        backgroundColor: EDColors.white,
        paddingHorizontal: 10,
        paddingBottom: 15
    },
    imageStyle: {
        alignSelf: 'center'
    },
    titleViewStyle: {
        paddingHorizontal: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    titleTextStyle: {
        color: EDColors.black,
        fontFamily: EDFonts.semiBold,
        textAlign: 'center',
        fontSize: getProportionalFontSize(16),
    },
    middleTextView: {
        backgroundColor: EDColors.white,
    },
    middleTextStyle: {
        color: EDColors.grayNew,
        fontFamily: EDFonts.medium,
        textAlign: 'left',
        fontSize: getProportionalFontSize(14),
        margin: 10,
        paddingVertical: 5,
    },
    bottomButtonView: {
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginVertical: 20
    },
    cancelTextStyle: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: metrics.screenHeight * 0.075,
        borderRadius: 16,
        backgroundColor: EDColors.offWhite,
        marginHorizontal: 5
    },
    OkButtonView: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: metrics.screenHeight * 0.075,
        borderRadius: 16,
        backgroundColor: EDColors.black,
        marginHorizontal: 5,
        borderColor: EDColors.separatorColorNew,
        borderWidth: 1
    },
    OkTextStyle: {
        color: EDColors.white,
        fontFamily: EDFonts.medium,
        textAlign: 'center',
        fontSize: getProportionalFontSize(16),
        margin: 10
    },
    cancelTextStyle: {
        color: EDColors.black,
        fontFamily: EDFonts.medium,
        textAlign: 'center',
        fontSize: getProportionalFontSize(16),
        margin: 10
    },
})


export default connect(
    state => {
        return {
            shouldShowAlert:
                state.userOperations !== undefined
                    ? state.userOperations.alertData !== undefined &&
                    state.userOperations.alertData.message !== undefined
                    : false,
            alertData: state.userOperations.alertData || {}
        };
    },
    dispatch => {
        return {
            saveAlertData: dataToSave => {
                dispatch(saveAlertData(dataToSave));
            }
        };
    },
)(EDCustomAlert);


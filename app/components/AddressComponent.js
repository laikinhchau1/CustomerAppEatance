import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export default class AddressComponent extends React.PureComponent {

    constructor(props) {
        super(props)

    }

    render() {
        return (
            <TouchableOpacity
                style={[this.props.isSelected ? style.selected : this.props.isAddressList ? style.isAddressList : style.default, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]}
                onPress={this.selectAddressHandler}
            >
                <View style={style.mainContainer}>

                    <EDRTLView style={{ justifyContent: 'center' }}>
                        <EDRTLView style={style.rtlView}>
                            {/* {this.props.data.is_main == "1" ? */}
                            <Icon name={this.props.data.is_main == "1" ? "home" : "business-outline"} type={this.props.data.is_main == "1" ? "feather" : "ionicon"} color={EDColors.primary} size={getProportionalFontSize(20)} containerStyle={{ marginEnd: 5 }} />
                            {/* : null} */}
                            <EDRTLText
                                style={[style.textStyle]}
                                title={this.props.data.address}
                            />
                        </EDRTLView>
                        {/* {!this.props.isSelectedAddress ?
                            <EDRTLView>
                                <TouchableOpacity
                                    style={style.touchableStyle}
                                    hitSlop={{ right: 10, left: 10, top: 10, bottom: 10 }}
                                    onPress={this.editAddressHandler}
                                >
                                    <Icon
                                        name="edit"
                                        color={EDColors.text}
                                        size={20}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={style.touchableStyle}
                                    hitSlop={{ right: 10, left: 10, top: 10, bottom: 10 }}
                                    onPress={this.deleteAddressHandler}
                                >
                                    <Icon
                                        name="delete"
                                        color={EDColors.text}
                                        size={22}
                                    />
                                </TouchableOpacity>
                            </EDRTLView>
                            : null} */}
                        {!this.props.isSelectedAddress ?
                            <EDRTLView style={style.footerStyle} >
                                <TouchableOpacity
                                    style={style.touchableStyle}
                                    hitSlop={{ right: 10, left: 10, top: 10, bottom: 10 }}
                                    onPress={this.editAddressHandler}
                                >
                                    <EDRTLText style={style.textButtonStyle} title={strings('edit')} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={style.touchableStyle}
                                    hitSlop={{ right: 10, left: 10, top: 10, bottom: 10 }}
                                    onPress={this.deleteAddressHandler}
                                >
                                    <EDRTLText style={style.textButtonStyle} title={strings('delete')} />
                                </TouchableOpacity>
                            </EDRTLView>
                            : null}
                    </EDRTLView>

                    <EDRTLText
                        style={[style.txtStyleLine2]}
                        title={this.props.data.landmark}
                    />

                  

                </View>
            </TouchableOpacity>
        )
    }

    editAddressHandler = () => {
        this.props.editAddress(this.props.data, 2)
    }

    deleteAddressHandler = () => {
        this.props.deleteAddress(this.props.data.address_id)
    }

    selectAddressHandler = () => {
        this.props.onPress(this.props.index)
    }
}

export const style = StyleSheet.create({
    selected: {
        alignItems: "center",
        backgroundColor: EDColors.white,
        borderRadius: 16,
        padding: 5,
        borderWidth: 1,
        borderColor: EDColors.primary,
        marginTop: 10,
        marginLeft: 25,
        marginRight: 25,
        marginVertical: 15
    },
    textButtonStyle: { fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(14) },
    footerStyle: { marginHorizontal: 20, marginBottom: 5 },
    default: {
        alignItems: "center",
        backgroundColor: EDColors.white,
        borderRadius: 16,
        padding: 5,
        marginTop: 10,
        marginLeft: 25,
        marginRight: 25,
        borderColor: EDColors.white, borderWidth: 1,
        marginVertical: 15,
        shadowColor: EDColors.grayNew,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    isAddressList: {
        alignItems: "center",
        backgroundColor: EDColors.white,
        borderRadius: 16,
        padding: 5,
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20,
        borderColor: EDColors.white, borderWidth: 1,
        marginVertical: 15,
        shadowColor: EDColors.grayNew, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5
    },
    textStyle: {
        fontSize: getProportionalFontSize(14),
        color: EDColors.black,
        fontFamily: EDFonts.medium,
        flex: 1,
        marginHorizontal: 10
    },
    txtStyleLine2: {
        color: EDColors.text,
        fontSize: getProportionalFontSize(11),
        fontFamily: EDFonts.regular,
        flex: 1,
        marginHorizontal: 40,
        marginVertical: 10
    },
    mainContainer: {
        flex: 2, padding: 10
    },
    touchableStyle: {
        margin: 5,
        marginTop: 10
    },
    rtlView: { alignItems: 'center', flex: 1, marginTop: 5, }
})
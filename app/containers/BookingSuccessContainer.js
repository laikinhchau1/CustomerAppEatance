
import React from 'react';
import { BackHandler, Image, StyleSheet, Text, View } from 'react-native';
import Assets from '../assets';
import EDThemeButton from '../components/EDThemeButton';
import { strings } from '../locales/i18n';
import { getUserToken } from '../utils/AsyncStorageHelper';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import BaseContainer from './BaseContainer';
import metrics from '../utils/metrics';

export default class BookingSuccessContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    /**CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.state = {};
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    /** DID MOUNT */
    componentDidMount() {
        this.checkUser();
    }

    /** WILL MOUNT */
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    /** WILL UNMOUNT */
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    // RENDER METHOD
    render() {
        return (
            <BaseContainer
                title={strings('orderConfirm')}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this._onLeftPressed}
            >
              
                {/* MAIN VIEW */}
                <View style={style.mainView}>
                    <View style={style.subView} >

                        <Image source={Assets.confirmation} 
                        style={style.imageStyle} 
                        />
                        {/* <View style={style.viewStyle}> */}
                                <Text style={style.thankyouText}>
                                    {' '}{strings('bookingSuccess')}{' '}
                                </Text>

                        {/* </View> */}
                        </View>
                    <View style={style.container}>
                        <View style={style.btnView}>
                                <EDThemeButton label={strings('viewBooking')} 
                                    textStyle={style.btnText}
                                    style={style.btnStyle}
                                    onPress={this._onLeftPressed} />
                            </View>
                    </View>
                </View>
            </BaseContainer>
        )
    }
    //#endregion

    /** BACK PRESS HANDLER */
    handleBackButtonClick() {
        this.props.navigation.popToTop();
        this.props.navigation.navigate('MyBooking');
        return true;
    }

    /** ON BACK PRESSED */
    _onLeftPressed = () => {
        this.props.navigation.popToTop();
        this.props.navigation.navigate('MyBooking');
    };

    /** CHECK USER DETAILS */
    checkUser() {
        getUserToken(
            success => {
                userObj = success;
                // this.loadData(success);
            },
            failure => { }
        );
    }

    /** HANDLE INDEX CHANGE */
	/**
     * @param { Index Number Selected } index
     */
    handleIndexChange = index => {
        this.setState({
            selectedIndex: index,
        });
    };
}

export const style = StyleSheet.create({
    container: {
        flex: 1,
       justifyContent:'flex-end'
    },
    subView:{ flex:5 , justifyContent:'center' , alignItems:'center'},
    imageStyle:{ alignSelf:'center' },
    thankyouText: {
        fontFamily: EDFonts.semiBold,
        fontSize:getProportionalFontSize(16),
        color: '#000',
        marginTop: 25,
    },
    mainView:{ flex: 1 },
    btnView:{ marginBottom:15 },
    btnText:{ fontFamily: EDFonts.medium , fontSize: getProportionalFontSize(16) },
    btnStyle:{width: ' 90%' , height: metrics.screenHeight * 0.075 , borderRadius: 16 },
    viewStyle: { flex: 1, marginTop: 10, alignItems: 'center' },
   });

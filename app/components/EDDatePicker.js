import  React, { Component } from "react";
import { View, StyleSheet} from "react-native";
import { strings } from "../locales/i18n";
import EDRTLView from "./EDRTLView";
import { EDColors } from "../utils/EDColors";
import { EDFonts } from "../utils/EDFontConstants";
import EDThemeButton from "./EDThemeButton";
import {Calendar} from 'react-native-calendars';
import { funGetTomorrowDate, getProportionalFontSize } from "../utils/EDConstants";
import metrics from "../utils/metrics";
import moment from "moment";
import EDRTLText from "./EDRTLText";


export default class EDDatePicker extends Component {

    constructor(props){
        super(props)
        this.maxDate = new Date(moment(new Date()).add(30, 'day'))
    }

    state={
        currentDate: new Date(),
    }

    render(){
    return(
        <View style = {styles.calenderView} >
        <EDRTLText style={styles.selectDateText} title={strings("selectDate")} />
        <View style={styles.calenderSubView}>
        <Calendar 
            style={{borderRadius:16  }}
            current={this.props.currentDate}
            minDate={funGetTomorrowDate()}
            maxDate={this.maxDate}
            onDayPress={this.props._handleDatePicked}
            onDayLongPress = {this.props._handleDatePicked}
            markedDates={{
                [this.props.currentDate]: { selected: true , marked: true , dotColor:EDColors.black },
              }}
            markingType={'simple'}
            theme= {{
                backgroundColor: EDColors.white,
                calendarBackground: EDColors.white,
                arrowColor: EDColors.white,
                monthTextColor: EDColors.white,
                textMonthFontFamily: EDFonts.medium,
                textMonthFontSize: 16,
                textDayFontFamily: EDFonts.medium,
                textDayFontSize: 14,
                dayTextColor: EDColors.black,
                selectedDayBackgroundColor: EDColors.radioSelected,
                selectedDayTextColor: EDColors.primary,
                todayTextColor: EDColors.primary,
                'stylesheet.calendar.header': {
                  header: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: "center",
                    backgroundColor: EDColors.primary,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    marginHorizontal: -5,
                    height: 50
                  },
                  dayHeader: {
                    marginVertical: 10,
                    width: 32,
                    textAlign: 'center',
                    fontSize: 14,
                    fontFamily: EDFonts.medium,
                    color: EDColors.blackSecondary,
                  },
                  week: {
                    marginTop: 7,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    paddingBottom: 2,
                    borderBottomWidth: 1,
                    borderColor: EDColors.radioSelected
                  },
                },
                'stylesheet.day.basic': {
                    base: {
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        borderRadius: 8,
                      },
                },
                'stylesheet.calendar.main': {
                    monthView: {
                        borderRadius: 16,
                        borderColor: EDColors.black
                      },
                    
                },
            }}
        />
        </View>
        <EDRTLView style = {styles.calendarButtonsView} >
            <EDThemeButton 
                style={styles.buttonStyle}
                textStyle={styles.themeButton}
                onPress={this.props.confirmDate}
                label={strings("dialogConfirm")}
            />
            <EDThemeButton
                style={styles.buttonStyle2}
                textStyle={styles.themeButton2}
                onPress={this.props._hideDatePicker}
                label={strings("dialogCancel")}
            />
        </EDRTLView>
        </View>    
    )
}

}

const styles = StyleSheet.create({
    selectDateText: { fontSize: 16, fontFamily : EDFonts.semiBold, marginVertical: 25, textAlign : "center"  , color: EDColors.black},
    calenderView: { marginHorizontal: 15, backgroundColor: EDColors.white, borderRadius: 24 },
    calenderSubView:{ marginHorizontal: 30, borderRadius: 16 ,borderWidth:1 , borderColor: EDColors.radioSelected},
    calendarButtonsView: {
        alignItems: "center",
        justifyContent: "space-around",
        marginVertical : 20,
        marginHorizontal: 10
    },
    buttonStyle: {
        width: (metrics.screenWidth * 0.5) - 60,
        height: metrics.screenHeight * 0.07, 
        borderColor: EDColors.primary,
        paddingBottom: 0,
        backgroundColor: EDColors.primary,
        borderRadius: 16,
    },
    buttonStyle2: {
        width: (metrics.screenWidth * 0.5) - 60,
        height: metrics.screenHeight * 0.07, 
        borderColor: EDColors.radioSelected,
        paddingBottom: 0,
        backgroundColor: EDColors.radioSelected,
        borderRadius: 16,
    },
    themeButton: { color: EDColors.white, fontFamily: EDFonts.regular, paddingHorizontal: 10, },
    themeButton2: { color: EDColors.black, fontFamily: EDFonts.regular, paddingHorizontal: 10, },
    tabTextStyle: {
        color: EDColors.primary,
        marginLeft: 5,
        marginRight: 5,
        alignSelf: "flex-start",
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(15),
    },
})
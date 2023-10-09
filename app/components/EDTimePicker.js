import  React, { Component } from "react";
import { View, Text , StyleSheet} from "react-native";
import { strings } from "../locales/i18n";
import EDButton from "./EDButton";
import EDRTLView from "./EDRTLView";
import { Picker} from 'react-native-wheel-datepicker';
import { funGetDateStr, funGetTimeStr, getProportionalFontSize } from "../utils/EDConstants";
import { EDColors } from "../utils/EDColors";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";


export default class EDTimePicker extends Component{

    constructor(props){
        super(props)
        this.HrArry= [1,2,3,4,5,6,7,8,9,10,11,12] 
        this.MinArry= [...Array(60).keys()]
        this.intervalArray=[]
        this.selectedHr= new Date().getHours() % 12 
        this.selectedMin= new Date().getMinutes() 
        this.selectedTime = (new Date().getHours() >= 12) ? "PM" : "AM" 
    }

    state={
        selectedHr: new Date().getHours() % 12 ,
        selectedMin: new Date().getMinutes() ,
        selectedTime : (new Date().getHours() >= 12) ? "PM" : "AM" ,
    }

    componentDidMount(){
        this.setValue();
    }

    setTimeInterval=()=>{
        let intervalValue = this.props.intervalValue || 15
        if(intervalValue % 5 == 0 ){
        this.intervalArray = []
        let startValue = 0;
        this.intervalArray[0] = startValue
        while( (startValue+intervalValue) < 60){
            startValue += intervalValue
            this.intervalArray.push(startValue)
        }
    }else{
        this.intervalArray =this.MinArry
    }
    }

    setValue=()=>{
        if(this.props.value !== undefined && this.props.value !== null && this.props.value.trim() !== ""){
            let date = new Date(Date.parse( funGetDateStr(new Date().toString(), 'MMM DD, YYYY') + " " + this.props.value))
            let hr = date.getHours() % 12 
            let min = date.getMinutes() 
            let timeZone = (date.getHours() >= 12) ? "PM" : "AM" 
            this.setState({selectedHr: hr , selectedMin : min , selectedTime : timeZone})
            this.selectedHr= hr
            this.selectedMin= min
            this.selectedTime =timeZone
        }
    }

    render(){
        this.setTimeInterval();
    return(
            <View style={styles.timePickerMainView}>
                    <View style={styles.timePickerSubView}>
                        <View style={styles.pickerText}>
                            <Text style={styles.titleText}>{strings('selectTime')}</Text>
                        </View>
                        <EDRTLView style={styles.timePickerView}>
                            <Picker
                                pickerData={this.HrArry}
                                style={[styles.spinerStyle]}
                                selectedValue={this.state.selectedHr == 0 ? 12 : this.state.selectedHr }
                                textSize={getProportionalFontSize(22)}
                                itemSpace={30}
                                onValueChange={selectedItem => this.setState({selectedHr :selectedItem })}
                                />
                                <Text style={styles.timeText}>:</Text>
                                <Picker
                                 pickerData ={ this.props.isShowInterval ? this.intervalArray : this.MinArry}
                                 style={styles.spinerStyle}
                                 itemSpace={30}
                                 textSize={getProportionalFontSize(22)}
                                selectedValue={this.state.selectedMin}
                                onValueChange={selectedItem =>  this.setState({ selectedMin  :selectedItem})}
                                />
                                 <Picker
                                  pickerData={["PM" ,"AM"]}
                                  selectedValue={ this.state.selectedTime}
                                  itemSpace={30}
                                  textSize={getProportionalFontSize(20)}
                                  style={styles.spinerStyle}
                                  onValueChange={selectedItem => this.setState({selectedTime  :selectedItem })}
                                />
                        </EDRTLView>
                        <EDRTLView style={{ margin:8, backgroundColor: EDColors.white }}>
                            <EDButton 
                                 label={strings("dialogConfirm")}
                                 onPress={this.onConfirm}
                                 style={styles.confirmButton}
                                 textStyle={styles.confirmText}
                            />
                            <EDButton 
                                 label={strings("dialogCancel")}
                                 onPress={this.onCancel}
                                 style={styles.cancelButton}
                                 textStyle={styles.cancelText}
                            />
                        </EDRTLView>
                    </View>
                </View>
    )
}

onConfirm=()=>{
    var timePicked= this.state.selectedHr + ":"+  (this.state.selectedMin > 10 ? this.state.selectedMin : '0' +this.state.selectedMin) +  " " + this.state.selectedTime
     this.setState({ eventTime: timePicked });
     if(this.props.onCancel !== undefined && this.props.onCancel !== null)
        this.props.onConfirm(timePicked)
 }
 onCancel=()=>{
     if(this.props.onCancel !== undefined && this.props.onCancel !== null)
        this.props.onCancel()
}

}

const styles = StyleSheet.create({

timePickerMainView:{flex : 1 , justifyContent : 'center' , alignItems : 'center'},
spinerStyle:{flex:1 , backgroundColor:'white' },
timePickerView:{ justifyContent : 'space-evenly' , alignItems : 'center' , marginHorizontal:70 , marginBottom:30},
timePickerSubView:{backgroundColor : EDColors.white , width:'90%' , borderRadius: 24 , paddingVertical:10},
pickerText:{alignSelf:'center' , marginBottom: 25 , marginTop:10},
confirmButton:{ flex: 1 , borderRadius: 16 , backgroundColor : EDColors.primary , height: metrics.screenHeight * 0.075 , marginHorizontal:10 },
cancelButton:{ flex: 1 , borderRadius: 16 , backgroundColor : EDColors.offWhite, height: metrics.screenHeight * 0.075 , marginHorizontal:10 },
confirmText:{fontFamily : EDFonts.medium , color : EDColors.white , fontSize : getProportionalFontSize(16)},
cancelText:{fontFamily : EDFonts.medium , color : EDColors.black , fontSize : getProportionalFontSize(16)},
timeText:{fontSize: getProportionalFontSize(16), fontFamily : EDFonts.medium , color : EDColors.black ,},
titleText:{fontSize: getProportionalFontSize(16), fontFamily : EDFonts.semiBold , color : EDColors.black },
})
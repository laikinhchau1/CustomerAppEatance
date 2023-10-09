import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { RadioButton, RadioGroup } from "react-native-flexi-radio-button";
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { debugLog, funGetFrench_Curr, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import metrics from "../utils/metrics";

export default class CategoryComponent extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: -1,
            isChange: false,
            selectedFruits: [],
            indexArray: []
        }
        this.cat_Array = []
        this.c_Array = []

        if (this.props.categorydata.is_multiple == '1') {


        }
    }

    componentWillReceiveProps = newProps => {
        // this.props = newProps
    }

    onSelectedIndex = (value) => {
        this.cat_Array = []
        this.cat_Array.push({ add_ons_id: this.props.categorydata.data[value].add_ons_id, add_ons_name: this.props.categorydata.data[value].add_ons_name, add_ons_price: this.props.categorydata.data[value].add_ons_price })
        this.CategoryDict = {
            addons_category: this.props.categorydata.addons_category,
            addons_category_id: this.props.categorydata.addons_category_id,
            addons_list: this.cat_Array
        }

        this.props.onChangedata(this.CategoryDict)
    }

    render() {
        // console.log("category::" , this.props.categorydata)
        return (
            <View style={{ flex: 1 }}>
                {this.props.categorydata.is_multiple === "0" ?
                    <RadioGroup
                        color={EDColors.primary || EDColors.text}
                        onSelect={this.onSelectedIndex}
                        style={styles.radioStyle}
                        selectedIndex={this.state.value}
                        // size={12}
                    >
                        {this.props.categorydata.data.map(index => {
                            return (
                                <RadioButton
                                    key={index.add_ons_name}
                                    style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
                                    value={this.props.currency_symbol + index.add_ons_price}>
                                    <View style={[styles.radioButton, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row', justifyContent: 'space-between' }]}>
                                        <Text style={styles.radioButtonText}>{index.add_ons_name}</Text>
                                        {index.add_ons_price === undefined ?
                                            <Text style={{ fontSize: getProportionalFontSize(13), color: EDColors.blackSecondary }}>{""}</Text>
                                            : isRTLCheck() ?
                                                <Text style={{ fontSize: getProportionalFontSize(13), color: EDColors.blackSecondary }}>{this.props.currency_symbol + funGetFrench_Curr(index.add_ons_price, 1, this.props.currency_symbol) + ' + '}</Text>
                                                :
                                                <Text style={{ fontSize: getProportionalFontSize(13), color: EDColors.blackSecondary }}>{'+ ' + this.props.currency_symbol + funGetFrench_Curr(index.add_ons_price, 1, this.props.currency_symbol)}</Text>}
                                    </View>

                                </RadioButton>
                            )
                        })}
                    </RadioGroup>
                    :
                    <View>
                        {this.props.categorydata.data.map((item, index) => {
                            return (
                                <View style={{ flexDirection: 'row', padding: 10 }}>
                                    <TouchableOpacity
                                        style={[styles.multiRadioView, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row', justifyContent: 'space-between' }]}
                                        onPress={() => {
                                            debugLog("INDEX ARRAY :::::", this.state.indexArray)
                                            if (this.state.indexArray.includes(index)) {
                                                var indexs = this.state.indexArray.indexOf(index); // get index if value found otherwise -1

                                                if (this.state.indexArray.length === 1) {


                                                    this.state.indexArray = []
                                                    this.CategoryDict = {
                                                        addons_category: this.props.categorydata.addons_category,
                                                        addons_category_id: this.props.categorydata.addons_category_id,
                                                        addons_list: this.state.indexArray
                                                    }
                                                    this.props.onChangedata(this.CategoryDict)
                                                } else {
                                                    if (indexs > -1) { //if found
                                                        this.state.indexArray.splice(indexs, 1);
                                                        this.cat_Array.splice(indexs, 1)
                                                    }
                                                    this.CategoryDict = {
                                                        addons_category: this.props.categorydata.addons_category,
                                                        addons_category_id: this.props.categorydata.addons_category_id,
                                                        addons_list: this.cat_Array
                                                    }
                                                    this.props.onChangedata(this.CategoryDict)
                                                }
                                                this.setState({
                                                    isChange: !this.state.isChange
                                                })
                                            } else {
                                                // debugLog("CATEGORY ARRAY ::::::", this.props.savedCategory, this.props.categorydata.addons_category_id)
                                                // Find saved category
                                                // let filteredArray = []
                                                // filteredArray = this.props.savedCategory.filter(data => {
                                                //     return data.addons_category_id === this.props.categorydata.addons_category_id
                                                // })
                                                // // debugLog("filter array ::::::", filteredArray)
                                                // if (filteredArray.length !== 0) {
                                                //     if (this.props.categorydata.max_selection_limit !== undefined &&
                                                //         this.props.categorydata.max_selection_limit !== null &&
                                                //         this.props.categorydata.max_selection_limit !== "0"
                                                //     ) {
                                                //         if (filteredArray[0].addons_list.length >= this.props.categorydata.max_selection_limit)
                                                //             return;
                                                //     }
                                                // }

                                                if (this.state.indexArray.length !== 0) {
                                                    if (this.props.categorydata.max_selection_limit !== undefined &&
                                                        this.props.categorydata.max_selection_limit !== null &&
                                                        this.props.categorydata.max_selection_limit !== "0"
                                                    ) {
                                                        if (this.state.indexArray.length >= this.props.categorydata.max_selection_limit) {
                                                            if (this.props.showError !== undefined)
                                                                this.props.showError(strings("max") + " " + this.props.categorydata.max_selection_limit + " " + strings("categoryMaxSelected"))
                                                            return;
                                                        }
                                                    }
                                                }


                                                this.cat_Array.push({ add_ons_id: this.props.categorydata.data[index].add_ons_id, add_ons_name: this.props.categorydata.data[index].add_ons_name, add_ons_price: this.props.categorydata.data[index].add_ons_price })
                                                this.CategoryDict = {
                                                    addons_category: this.props.categorydata.addons_category,
                                                    addons_category_id: this.props.categorydata.addons_category_id,
                                                    addons_list: this.cat_Array
                                                }
                                                this.state.indexArray.push(index)
                                                this.setState({
                                                    isChange: !this.state.isChange
                                                })
                                                this.props.onChangedata(this.CategoryDict)
                                            }
                                        }}>

                                        <Icon
                                            color={EDColors.primary}
                                            containerStyle={{ marginTop: -3.5 }}
                                            size={getProportionalFontSize(22)}
                                            name={this.state.indexArray.includes(index) ? "check-box" : "check-box-outline-blank"}
                                        />

                                        <View style={{ justifyContent: 'space-between', flexDirection: isRTLCheck() ? 'row-reverse' : 'row', flex: 1 }}>
                                            <Text style={[styles.addOnsText, { marginHorizontal: 10 }]}>{item.add_ons_name}</Text>
                                            {item.add_ons_price === undefined ?
                                                <Text style={styles.addonRightText}>{""}</Text>
                                                : isRTLCheck()
                                                    ?
                                                    <Text style={[styles.addonRightText, { color: EDColors.blackSecondary, marginLeft: 25 }]}>{this.props.currency_symbol + funGetFrench_Curr(item.add_ons_price, 1, this.props.currency_symbol) + ' +'}</Text>
                                                    :
                                                    <Text style={[styles.addonRightText, { color: EDColors.blackSecondary, marginRight: 25 }]}>{'  + ' + this.props.currency_symbol + funGetFrench_Curr(item.add_ons_price, 1, this.props.currency_symbol)}</Text>}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                    </View>
                }

            </View>
        )
    }
}

const styles = StyleSheet.create({
    radioStyle: { marginLeft: 10, marginRight: 10, flexDirection: 'column' },
    radioButton: { width: metrics.screenWidth * 0.8 },
    radioButtonText: { marginHorizontal: 10, fontSize: getProportionalFontSize(13), color: EDColors.blackSecondary },
    multiRadioView: { flex: 1, marginLeft: 10 },
    addOnsText: { fontSize: getProportionalFontSize(13), color: EDColors.blackSecondary },
    addonRightText: { marginRight: 10, fontSize: getProportionalFontSize(13), color: EDColors.blackSecondary }
})
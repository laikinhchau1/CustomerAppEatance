import React from "react";
import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import EDFilterCheckBox from "../components/EDFilterCheckBox";
import EDRTLText from "../components/EDRTLText";
import EDRTLView from "../components/EDRTLView";
import ETSlider from "../components/ETSlider";
import RadioGroupWithHeader from "../components/RadioGroupWithHeader";
import TextviewRadius from "../components/TextviewRadius";
import { strings } from "../locales/i18n";
import { saveFoodType } from "../redux/actions/User";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import BaseContainer from "./BaseContainer";

class FilterContainer extends React.Component {
    constructor(props) {
        super(props);

        this.cookTime = this.props.navigation.state.params.time || 30;
        this.recipeType = this.props.navigation.state.params.food === 0 ? 2 : this.props.navigation.state.params.food === "" ? 0 : this.props.navigation.state.params.food;
        this.distance = this.props.navigation.state.params.distance === "" ? (this.props.navigation.state.params.maxFilterDistance || 10000) : this.props.navigation.state.params.distance;
        this.priceType = this.props.navigation.state.params.price === 0 ? 0 : this.props.navigation.state.params.price === "" ? 0 : 1
        this.isShowReview = this.props.navigation.state.params !== undefined &&
            this.props.navigation.state.params.isShowReview !== undefined ?
            this.props.navigation.state.params.isShowReview : true
        this.selectedAvail = this.props.navigation.state.params.availType || 0

        this.minFilterDistance = this.props.navigation.state.params.minFilterDistance || 0
        this.maxFilterDistance = this.props.navigation.state.params.maxFilterDistance || 10000

        this.selectedSort = this.props.navigation.state.params.sortType === 0 ? 0 : this.props.navigation.state.params.sortType === 1 ? 1 : 0

        if (this.isShowReview)
            this.sortType = [
                {
                    label: strings("filterDistance"),
                    size: 15,
                    selected: this.props.navigation.state.params.sortType === 0 ? true : false
                },
                {
                    label: strings("filterRating"),
                    size: 15,
                    selected: this.props.navigation.state.params.sortType == 1 ? true : false
                }

            ]
        else
            this.sortType = [
                {
                    label: strings("filterDistance"),
                    size: 15,
                    selected: this.props.navigation.state.params.sortType === 0 ? true : false
                },
            ]

        this.availType = [
            {
                label: strings("filterAll"),
                size: 15,
                selected: this.props.navigation.state.params.availType === 0 ? true : false
            },
            {
                label: strings("breakfast"),
                size: 15,
                selected: this.props.navigation.state.params.availType === 1 ? true : false
            },
            {
                label: strings("lunch"),
                size: 15,
                selected: this.props.navigation.state.params.availType == 2 ? true : false
            },
            {
                label: strings("dinner"),
                size: 15,
                selected: this.props.navigation.state.params.availType == 3 ? true : false
            }

        ]

    }

    state = {
        priceSort: [
            {
                label: strings("lowToHigh"),
                size: 15,
                selected: this.props.navigation.state.params.price === 0 ? true : false
            },
            {
                label: strings("highToLow"),
                size: 15,
                selected: this.props.navigation.state.params.price === 1 ? true : false
            }
        ],
        sendFilterDetailsBack: this.props.navigation.state.params.getFilterDetails,
        filterType: this.props.navigation.state.params.filterType,
        isLoading: false,
        foodArray: this.props.navigation.state.params.foodArray || [],
        isShowDistance: true,
        isShow: true
    };

    applyFilter(data) {
        if (this.state.isShowDistance == false) {
            this.distance = this.props.navigation.state.params.distance === ""
                ? (this.props.navigation.state.params.maxFilterDistance || 10000)
                : this.props.navigation.state.params.distance;
        }
        if (this.state.sendFilterDetailsBack != undefined) {
            this.state.sendFilterDetailsBack(data);
        }
        this.props.navigation.goBack();
    }

    addToFoodType = (data) => {
        let foodArray = this.state.foodArray
        foodArray.push(data.food_type_id)
        this.setState({ foodArray: foodArray })
    }

    removeFromFoodType = (item) => {
        let temp = this.state.foodArray.filter(data => {
            return item.food_type_id !== data
        })
        this.setState({ foodArray: temp })
    }

    handleIsShow = () => {
        this.setState({ isShow: !this.state.isShow })
    }

    renderFoodType = (data) => {
        return (
            <SafeAreaView style={{ marginHorizontal: 5 }} >
                <EDFilterCheckBox
                    isSelected={this.state.foodArray.includes(data.food_type_id)}
                    data={data}
                    addToFoodType={this.addToFoodType}
                    removeFromFoodType={this.removeFromFoodType}
                />
            </SafeAreaView>
        )
    }

    componentWillMount() {
        if (this.selectedSort == 1)
            this.setState({ isShowDistance: false })
        else
            this.setState({ isShowDistance: true })
    }

    render() {
        return (
            <BaseContainer
                title={strings("filterTitle")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={() => { this.props.navigation.goBack() }}
                loading={this.state.isLoading}>

                <ScrollView>
                    {this.state.filterType == "Main" ?
                        <RadioGroupWithHeader
                            selected={this.selectedSort}
                            style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
                            data={this.sortType}
                            Texttitle={strings("sortBy")}
                            titleStyle={{ color: EDColors.black }}
                            onSelected={selected => {
                                if (selected == 1)
                                    this.setState({ isShowDistance: false })
                                else
                                    this.setState({ isShowDistance: true })

                                this.selectedSort = selected;
                            }}
                        />
                        : null}

                    <View style={{ flex: 6 }}>

                        {this.state.filterType == "Main" ? (
                            this.state.isShowDistance ?
                                <View>
                                    <ETSlider
                                        title={strings("filterByDistance")}
                                        onSlide={values => {
                                            this.distance = values;
                                        }}
                                        min={parseInt(this.minFilterDistance)}
                                        max={parseInt(this.maxFilterDistance)}
                                        initialValue={this.distance}
                                        valueType={strings("km")}
                                    />
                                </View> : null
                        ) : this.state.filterType == "Recipe" ? (
                            <ETSlider
                                title={strings("filterByTime")}
                                onSlide={values => {
                                    this.cookTime = values;
                                }}
                                max={240}
                                min={5}
                                initialValue={this.cookTime}
                                valueType={strings("min")}
                            />
                        ) : (null)}
                    </View>

                    {this.props.foodType !== undefined &&
                        this.props.foodType !== null &&
                        this.props.foodType.length !== 0 ?

                        <View style={style.checkBoxcontainer}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
                                <EDRTLText title={
                                    this.state.filterType == "Main" || this.state.filterType == "menu"
                                        ? strings("typeOfFood")
                                        : strings("typeOfRecipe")
                                } style={style.checkTitle} />
                                {/* <Icon name = { this.state.isShow ? "expand-less" : "expand-more"} size = {30} onPress = {this.handleIsShow} /> */}
                            </View>
                            <View style={{flex:1, borderWidth: 1, borderColor: EDColors.radioSelected, marginTop: 20, marginBottom: 15, marginHorizontal: 10 }} />
                            {this.state.isShow ?
                                // <FlatList
                                //     data={this.props.foodType}
                                //     renderItem={this.renderFoodType}
                                //     horizontal = {false}
                                //     numColumns = {2}
                                // /> 
                                <EDRTLView style={{  flexWrap: "wrap" , justifyContent:"flex-start" }}>
                                    {this.props.foodType.map(data => {
                                        return this.renderFoodType(data)
                                    })}
                                </EDRTLView>
                                : null}
                        </View>
                        : null}

                    {this.state.filterType == "menu" ?
                        <RadioGroupWithHeader
                            data={this.availType}
                            style={{ flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }}
                            selected={this.selectedAvail}
                            Texttitle={strings("sortAvailibility")}
                            onSelected={selected => {
                                this.selectedAvail = selected;
                            }}
                        /> : null}

                </ScrollView>
                <EDRTLView
                    style={{ alignSelf: "center", marginBottom: Platform.OS == 'ios' ? 20 : 0, }}>
                    <TextviewRadius
                        text={strings("filterApply")}
                        style={{ height: heightPercentageToDP('6%'), width: metrics.screenWidth * 0.4, textAlignVertical: "center", borderRadius: 16 }}
                        onPress={() => {
                            if (this.state.filterType == "Main") {
                                var data = {
                                    distance: this.distance !== "" ? this.distance : "",
                                    foodArray: this.state.foodArray,
                                    sortType: this.selectedSort,
                                    applied: true

                                };
                                this.applyFilter(data);
                            } else if (this.state.filterType == "Recipe") {
                                var data = {
                                    timing: this.cookTime != "" ? this.cookTime : "",
                                    foodArray: this.state.foodArray,
                                    applied: true

                                };
                                this.applyFilter(data);
                            } else {
                                var data = {
                                    foodArray: this.state.foodArray,
                                    price: this.priceType,
                                    applied: true,
                                    availType: this.selectedAvail

                                };
                                this.applyFilter(data);
                            }

                        }}
                    />
                    <TextviewRadius
                        text={strings("filterReset")}
                        style={{ height: heightPercentageToDP('6%'), width: metrics.screenWidth * 0.4, backgroundColor: EDColors.white, textAlignVertical: "center", borderRadius: 16 }}
                        textStyle={{ color: EDColors.black }}
                        onPress={() => {
                            if (this.state.filterType == "Main") {
                                var data = {
                                    foodArray: [],
                                    distance: "",
                                    sortType: 0
                                };
                                this.applyFilter(data);
                            } else if (this.state.filterType == "Recipe") {
                                var data = {
                                    foodArray: [],
                                    timing: ""
                                };
                                this.applyFilter(data);
                            } else {
                                var data = {
                                    foodArray: [],
                                    price: "",
                                    availType: 0
                                };
                                this.applyFilter(data);
                            }
                        }}
                    />
                </EDRTLView>
            </BaseContainer>
        );
    }
}

export const style = StyleSheet.create({
    checkTitle: {
        fontFamily: EDFonts.semiBold,
        color: EDColors.black,
        fontSize: getProportionalFontSize(16),
        marginHorizontal: 10,
        marginBottom: 5
    },
    checkBoxcontainer: {
        borderRadius: 6,
        // shadowColor: EDColors.black,
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.8,
        // shadowRadius: 2,
        // elevation: 2,
        padding: 10,
        backgroundColor: EDColors.white,
        margin: 10,
        flex : 1
    },
});


// CONNECT FUNCTION
export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            foodType: state.userOperations.foodType
        };
    },
    dispatch => {
        return {
            saveFoodTypeInRedux: food_type => {
                dispatch(saveFoodType(food_type))
            },
        }
    }
)(FilterContainer);
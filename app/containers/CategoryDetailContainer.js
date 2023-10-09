import React from 'react';
import { SafeAreaView, ScrollView, SectionList, StyleSheet, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { NavigationEvents } from "react-navigation";
import { connect } from 'react-redux';
import Assets from '../assets';
import CategoryComponent from '../components/CategoryComponent';
import EDImage from '../components/EDImage';
import EDPopupView from "../components/EDPopupView";
import EDRadioDailogWithButton from "../components/EDRadioDailogWithButton";
import EDRTLText from '../components/EDRTLText';
import EDRTLView from '../components/EDRTLView';
import EDText from '../components/EDText';
import EDThemeButton from '../components/EDThemeButton';
import ProgressLoader from '../components/ProgressLoader';
import RestaurantOverview from '../components/RestaurantOverview';
import { strings } from '../locales/i18n';
import { saveCartCount, saveCartPrice } from '../redux/actions/Checkout';
import { saveResIDInRedux, saveTableIDInRedux } from '../redux/actions/User';
import { clearCartData, getCartList, saveCartData } from '../utils/AsyncStorageHelper';
import { showConfirmationDialogue, showDialogue, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from "../utils/EDFontConstants";
import metrics from '../utils/metrics';
import BaseContainer from './BaseContainer';
import Toast, { DURATION } from "react-native-easy-toast";

class CategoryDetailContainer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.setState({ isLoading: true })
        this.tempArrayItem = []
        this.tempQty = 0
        this.category_array = [];
        this.state = {
            value: 1,
            quantity: 1
        };
        this.ItemName = this.props.navigation.state.params.ItemName;
        this.resId = this.props.navigation.state.params.resid;
        this.content_id = this.props.navigation.state.params.content_id;
        this.subCategoryArray = this.props.navigation.state.params.subCategoryArray.addons_category_list || [];
        this.productDetail = this.props.navigation.state.params.subCategoryArray;
        this.restaurantDetails = this.props.navigation.state.params.restaurantDetails || []
        this.arr = []
        this.subCategoryArray.map(item => {
            if (item.data === undefined) {
                item.data = item['addons_list'];
                this.arr.push(item.data)
                delete item.addons_list;
            }
        });

        this.state = {
            isCartModalVisible: false,
            isLoading: false,
            quantity: 1,
            btnHeight: metrics.screenHeight * 0.060,
            counterHeight: undefined
        }

    }

    componentWillUnmount() {
        this.props.navigation.state.params.subCategoryArray = undefined;
    }
    storeData(data) {
        var cartArray = [];
        var cartData = {};
        if (this.props.res_id !== undefined && this.props.res_id !== this.resId) {
            showConfirmationDialogue(strings("activeDineInSession"), [], "", () => {
                this.props.saveTableID(undefined);
                this.props.saveResID(undefined);
                this.storeData(data)

            })
        }
        else
            //demo changes
            getCartList(
                success => {
                    if (success != undefined) {
                        cartArray = success.items;

                        if (cartArray.length > 0) {
                            if (success.resId == this.resId) {
                                data.quantity = parseInt(this.state.quantity);
                                cartArray.push(data);
                                cartData = {
                                    resId: this.resId,
                                    items: cartArray,
                                    coupon_name: success.coupon_name.length > 0 ? success.coupon_name : '',
                                    cart_id: success.cart_id,
                                    table_id: success.table_id !== undefined ? success.table_id : this.props.table_id

                                };
                                this.updateCount(cartData.items);
                                this.saveData(cartData);
                            } else {
                                this.tempArrayItem = data
                                this.setState({ isCartModalVisible: true })
                            }
                        } else if (cartArray.length == 0) {
                            //cart empty
                            data.quantity = parseInt(this.state.quantity);
                            cartData = {
                                resId: this.resId,
                                items: [data],
                                coupon_name: '',
                                cart_id: 0,
                                table_id: this.props.table_id

                            };
                            this.updateCount(cartData.items);
                            this.saveData(cartData);
                        }
                    } else {
                        //cart has no data
                        data.quantity = parseInt(this.state.quantity);
                        cartData = {
                            resId: this.resId,
                            items: [data],
                            coupon_name: '',
                            cart_id: 0,
                            table_id: this.props.table_id

                        };
                        this.updateCount(cartData.items);
                        this.saveData(cartData);
                    }
                },
                onCartNotFound => {
                    data.quantity = parseInt(this.state.quantity);
                    cartData = {
                        resId: this.resId,
                        items: [data],
                        coupon_name: '',
                        cart_id: 0,
                        table_id: this.props.table_id

                    };
                    this.updateCount(cartData.items);
                    this.saveData(cartData);
                },
                error => {
                }
            );
    }

    updateCount(data) {
        var count = 0;
        var count = 0;
        var price = 0
        var array = []
        var subArray = []
        data.map((item, index) => {
            count = count + item.quantity;
            price = item.offer_price !== undefined && item.offer_price !== ''
                ? Number(price) + (item.quantity * Number(item.offer_price))
                : Number(price) + (item.quantity * Number(item.price))
            if (item.addons_category_list != undefined && item.addons_category_list != []) {
                array = item.addons_category_list
                array.map(data => {
                    subArray = data.addons_list
                    subArray.map(innerData => {
                        price = Number(price) + Number(innerData.add_ons_price)
                    })
                })
            }
        });
        this.props.saveCartCount(count);
        this.props.saveCartPrice(price);
    }

    saveData(data) {
        saveCartData(
            data,
            success => {
                this.props.navigation.state.params.refreshScreen !== undefined ?
                    this.props.navigation.state.params.refreshScreen() : null
                this.props.navigation.goBack();
                this.subCategoryArray = []
                this.props.navigation.state.params.subCategoryArray = undefined;
            },
            fail => { }
        );
    }

    renderCartChangeModal = () => {
        return (
            <EDPopupView isModalVisible={this.state.isCartModalVisible}>
                <EDRadioDailogWithButton
                    title={strings('askAddToCart')}
                    Texttitle={strings('cartClearWarningMsg')}
                    titleStyle={styles.cartWarningText}
                    label={strings('dialogConfirm')}
                    onCancelPressed={this.onCartAddCancelPressed}
                    onContinueButtonPress={this.onCartAddContinuePressed} />

            </EDPopupView>
        )
    }

    onCartAddContinuePressed = value => {
        if (value != undefined && value == 1) {
            this.setState({ isCartModalVisible: false })
            this.props.navigation.goBack()
        } else {
            this.props.saveCartCount(0);
            clearCartData(success => { }, failure => { })
            this.storeData(this.tempArrayItem)
            this.setState({ isCartModalVisible: false })
            this.props.navigation.goBack()
        }
    }

    onCartAddCancelPressed = () => {
        this.setState({ isCartModalVisible: false })
    }

    showErrorMessage = err => {
        if (this.toast !== undefined)
            this.toast.show(err, DURATION.LENGTH_SHORT);
    }

    render() {
        return (
            <BaseContainer
                title={this.ItemName != undefined ? this.ItemName : strings('restaurantCategoryTitle')}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                onLeft={() => {
                    this.props.navigation.goBack();
                }}
            // right={[{ url: "shopping-cart", name: "Cart", value: this.props.cartCount, type: "ant-design" }, { url: "filter", name: "filter", type: "ant-design" }]}
            >

                {/* PROGRESS LOADER */}
                {this.state.isLoading ? <ProgressLoader /> : null}

                <NavigationEvents onDidFocus={this.onDidFocusEvents} />

                <SafeAreaView style={styles.commonFlexView} >
                    {/* TOAST */}
                    <Toast ref={ref => this.toast = ref} position="center" fadeInDuration={0} />

                    {this.renderModal()}

                    {this.renderCartChangeModal()}

                </SafeAreaView>

            </BaseContainer>
        )
    }

    onBtnLayout = e => {
        this.setState({ btnHeight: e.nativeEvent.layout.height })
    }

    onCounterLayout = e => {
        this.setState({ counterHeight: e.nativeEvent.layout.height })
    }


    renderModal() {
        return (
            <>

                <ScrollView>
                    <View style={{ margin: 10 }}>
                        <EDImage
                            source={this.productDetail.image}
                            style={styles.placeholderStyle}
                            placeholderStyle={[styles.placeholderStyle, {
                                height: metrics.screenHeight * 0.1,
                                paddingVertical: metrics.screenHeight * 0.15
                            }]}
                            placeholder={Assets.logo}
                            resizeMode="cover"
                            placeholderResizeMode="contain"

                        />
                    </View>

                    <SectionList
                        sections={this.subCategoryArray}
                        keyExtractor={(item, index) => item + index}
                        stickySectionHeadersEnabled={false} //R.K 11-01-2021
                        renderSectionHeader={({ section }) => {
                            return (
                                <View>
                                    <View style={styles.sectionListViewStyle}>

                                        <EDRTLView style={{ alignItems: 'center', marginHorizontal: 10 }}>
                                            <EDText
                                                style={{ marginHorizontal: 0, marginTop: 0 }}
                                                isMandatory={section.is_mandatory == "1" && section.is_mandatory !== undefined &&
                                                    section.is_mandatory !== null && section.is_mandatory !== "0" ? true : undefined}
                                                textStyle={[styles.sectionListTextStyle, { color: EDColors.black, fontFamily: EDFonts.semiBold }]}
                                                title={section.addons_category != undefined && section.addons_category != '' ?
                                                    (section.addons_category.toUpperCase()) : ''}
                                            />
                                            <EDText
                                                style={{ marginHorizontal: 0, marginTop: 0 }}

                                                textStyle={[styles.sectionListTextStyle, { color: EDColors.black, fontFamily: EDFonts.semiBold, marginHorizontal: 5, }]}
                                                title={section.is_multiple == "1" && section.max_selection_limit !== undefined &&
                                                    section.max_selection_limit !== null && section.max_selection_limit !== "0" ?
                                                    ("(" + strings("chooseAny") + " " + section.max_selection_limit + ")") : ""}
                                            />
                                        </EDRTLView>

                                    </View>
                                    <View style={styles.seperatorView} />
                                    <CategoryComponent
                                        currency_symbol={this.props.navigation.state.params.currency_symbol}
                                        categorydata={section}
                                        savedCategory={this.category_array}
                                        showError={this.showErrorMessage}
                                        onChangedata={item => {
                                            this.category_array.push(item)
                                            this.category_array = [
                                                ...new Map(
                                                    this.category_array.map(item => [item['addons_category_id'], item])
                                                ).values(),
                                            ];

                                            this.category_array.map((value, index) => {
                                                if (value.addons_list.length === 0) {
                                                    this.category_array.splice(index, 1);
                                                }
                                            });

                                            this.category_array.filter((items, index) => {
                                                if (items.addons_category_id === item.addons_category_id) {
                                                    items.addons_list[0].add_ons_id = item.addons_list[0].add_ons_id;
                                                    items.addons_list[0].add_ons_name =
                                                        item.addons_list[0].add_ons_name;
                                                    items.addons_list[0].add_ons_price =
                                                        item.addons_list[0].add_ons_price;
                                                }
                                            });
                                            debugLog("CATEGORY ARRAY OUTER::::::", this.category_array)
                                            this.forceUpdate()
                                        }}

                                    />
                                </View>
                            );
                        }}
                        renderItem={({ item, index, section }) => {
                            return <View style={{}} />;
                        }}
                    />
                </ScrollView>

                <View style={styles.footerView}>

                    <View style={styles.seperatorView} />
                    <EDRTLView style={styles.bottomView}>
                        <EDRTLView
                            onLayout={this.onCounterLayout}
                            style={[styles.subItemView, {
                                height: this.state.counterHeight > this.state.btnHeight ? this.state.counterHeight : this.state.btnHeight
                            }]}
                        >
                            <TouchableOpacity
                                style={styles.roundButton}
                                onPress={() => {
                                    if (parseInt(this.state.quantity) <= 1)
                                        return;
                                    this.setState({ quantity: parseInt(this.state.quantity) - 1 })
                                }}
                            >
                                <MaterialIcon size={18} style={{ marginHorizontal: 10 }} color={EDColors.black} name={'remove'} />
                            </TouchableOpacity>

                            <TextInput
                                style={styles.qtyInput}
                                maxLength={3}
                                keyboardType="numeric"
                                textAlign={'center'}
                                value={this.state.quantity.toString()} onChangeText={this.onChangeText} />
                            <TouchableOpacity
                                style={styles.roundButton}
                                onPress={() => {
                                    parseInt(this.state.quantity) < 999 ?
                                        this.setState({ quantity: parseInt(this.state.quantity) + 1 }) :
                                        showValidationAlert(strings("qtyExceed"))

                                }}
                            >
                                <MaterialIcon size={18} style={{ marginHorizontal: 10 }} color={EDColors.black} name={'add'} />
                            </TouchableOpacity>
                        </EDRTLView>
                        <EDThemeButton
                            label={strings('submitButton')}
                            style={[styles.submitButtonStyle, {
                                height: this.state.counterHeight > this.state.btnHeight ? this.state.counterHeight : this.state.btnHeight
                            }]}
                            onLayout={this.onBtnLayout}
                            textStyle={{ fontSize: getProportionalFontSize(18) }}
                            fontSizeNew={15}
                            onPress={() => {
                                let all_okay = 1
                                this.data = this.props.navigation.state.params.subCategoryArray;
                                this.data.addons_category_list = [];
                                this.category_array.map(item => {
                                    this.data.addons_category_list.push(item);
                                });
                                this.subCategoryArray.map(
                                    e => {

                                        if (e.is_mandatory == "1") {
                                            debugLog("TEST ADDON :::", this.data.addons_category_list.map(f => f.addons_category_id), e.addons_category_id, this.data.addons_category_list.map(f => f.addons_category_id).includes(e.addons_category_id))
                                            if (!this.data.addons_category_list.map(f => f.addons_category_id).includes(e.addons_category_id)) {
                                                all_okay = all_okay + 1
                                            }

                                        }
                                    }
                                )
                                if (all_okay == 1)
                                    this.addData(this.data)
                                else
                                    showDialogue(strings('mandatoryItemError'), [], '')
                            }}
                        />
                    </EDRTLView>
                </View>

            </>
        );
    }
    onChangeText = (value) => {
        let newValue = value.replace(/\D/g, '')
        this.setState({ quantity: newValue })
    }
    addData = (data) => {
        if (this.state.quantity.toString().trim() == "") {
            showValidationAlert(strings("qtyEmptyError"))
            return;
        }
        else if (this.state.quantity == 0) {
            showValidationAlert(strings("qtyZero"))
            return;
        }
        else {
            this.storeData(data)
        }
    }

}

const styles = StyleSheet.create({
    commonFlexView: { flex: 1, backgroundColor: EDColors.white },
    subItemView: { borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginVertical: 5, alignSelf: 'center', borderWidth: 1, borderColor: EDColors.separatorColor },
    qtyInput: { fontSize: getProportionalFontSize(16) },
    cartWarningText: { fontFamily: EDFonts.bold, marginBottom: 20 },
    roundButton: { padding: 2, margin: 2, justifyContent: "center" },
    sectionListTextStyle: { fontSize: getProportionalFontSize(16) },
    sectionListViewStyle: { flex: 1, padding: 10, marginTop: 10, },
    submitButtonStyle: { borderRadius: 16, width: '40%', height: metrics.screenHeight * 0.060, marginTop: undefined },
    footerView: { alignSelf: 'center', backgroundColor: EDColors.white, width: metrics.screenWidth },
    seperatorView: { borderWidth: 0.5, borderColor: EDColors.grayNew, width: "90%", alignSelf: "center", marginVertical: 10 },
    bottomView: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 5,  },
    placeholderStyle: { borderRadius: 8, height: metrics.screenHeight * 0.25, width: "100%", alignSelf: 'center', },
})

export default connect(
    state => {
        return {
            cartPrice: state.checkoutReducer.cartPrice,
            table_id: state.userOperations.table_id,
            res_id: state.userOperations.res_id
        };
    },
    dispatch => {
        return {
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveCartPrice: data => {
                dispatch(saveCartPrice(data));
            },
            saveTableID: table_id => {
                dispatch(saveTableIDInRedux(table_id))
            },
            saveResID: table_id => {
                dispatch(saveResIDInRedux(table_id))
            }
        };
    }
)(CategoryDetailContainer);

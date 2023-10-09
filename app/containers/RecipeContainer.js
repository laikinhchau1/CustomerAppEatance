import { Spinner } from "native-base";
import React from "react";
import { AppState, FlatList, Linking, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import Assets from "../assets";
import EDHomeSearchBar from "../components/EDHomeSearchBar";
import EDImage from "../components/EDImage";
import EDLocationModel from "../components/EDLocationModel";
import EDPlaceholderComponent from "../components/EDPlaceholderComponent";
import FoodOverview from "../components/FoodOverview";
import ProgressLoader from "../components/ProgressLoader";
import { strings } from "../locales/i18n";
import { saveCartCount, saveCartPrice } from "../redux/actions/Checkout";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { saveResIDInRedux, saveTableIDInRedux } from "../redux/actions/User";
import { getCartList } from "../utils/AsyncStorageHelper";
import { EDColors } from "../utils/EDColors";
import { API_PAGE_SIZE, debugLog, RESPONSE_SUCCESS } from "../utils/EDConstants";
import metrics from "../utils/metrics";
import { netStatus } from "../utils/NetworkStatusConnection";
import { getRecipe } from "../utils/ServiceManager";
import BaseContainer from "./BaseContainer";


class RecipeContainer extends React.Component {
    //#region LIFE CYCLE METHODS

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            itemSearch: "",
            appState: AppState.currentState,
            locationError: false,
            isPermissionLoading: false,
            isMoreLoading: false
        };
        this.isFilter = false

        this.isAndroidPermission = false;
        this.food = "";
        this.timing = "";
        this.foodData = undefined;
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';
        this.foodArray = []
        this.is_filter = false
        this.shouldLoadMore = false
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.getRecipeList()
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    /**
     * @param { Applications status Active or Background } nextAppState
     */
    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            if (Platform.OS === 'android' && this.isAndroidPermission === true) {
                this.setState({ isPermissionLoading: false })
            } else {
                if (this.isAllowPermission === false) {

                    this.getRecipeList()
                }
            }
        }
        this.setState({ appState: nextAppState });
    }

    //#region 
    /** NETWORK CONNECTIVITY */
    networkConnectivityStatus = () => {
        this.getRecipeList()
    }
    //#endregion

    onLocationEventHandler = () => {
        this.setState({ isPermissionLoading: true })
        this.isAllowPermission = false
        this.isAndroidPermission = false
        Linking.openSettings();
    }

    onWillFocusHandler = () => {
        this.props.saveNavigationSelection("Recipe")
        this.getCartList();

    }

    /** GET LIST OF CART ITEMS */
    getCartList = () => {
        getCartList(this.onSuccessCartList, onCartNotFound => {
            this.props.saveCartCount(0);
        }, error => { });
    }

    //#region GET CART ITEMS
    /**
     * @param { Success Response Object } success
     */
    onSuccessCartList = (success) => {
        if (success != undefined) {
            let cartData = success.items;
            this.table_id = success.table_id;
            debugLog("TABEL ID :::", this.table_id, success)
            if (cartData.length > 0) {
                let count = 0;
                let price = 0
                cartData.map((item, index) => {
                    count = count + item.quantity;
                    price = Number(price) + (item.quantity * Number(item.price))
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
                this.props.saveCartPrice(price);
                this.props.saveCartCount(count);
            } else if (cartData.length == 0) {
                this.props.saveCartPrice(0);
                this.props.saveCartCount(0);
            }
        } else { }
    }
    //#endregion

    onLoadMore = () => {
        if (this.shouldLoadMore && !this.state.isMoreLoading && !this.state.isLoading) {
            this.getRecipeList()
        }
    }

    renderFooter = () => {
        return (
            this.state.isMoreLoading ?
                <Spinner color={EDColors.primary} size="large" /> : null
        )
    }

    renderHeader = () => {
        return (
            <>
                <EDImage
                    placeholder={Assets.logo}
                    style={style.imgStyle}
                    resizeMode={'cover'}
                    placeholderResizeMode={'contain'}

                />

                {/* SEARCH BOX */}
                <View style={style.searchBox}>
                    <EDHomeSearchBar
                        value={this.state.itemSearch}
                        placeholder={strings("searchFood")}
                        onChangeValue={this.onChangeTextHandler}
                        onSearchPress={this.onSearchClick}
                        style={{ borderColor: EDColors.radioSelected  ,borderWidth: 0.5 }}
                    />
                </View>

            </>
        )
    }

    /** RENDER METHOD */
    render() {
        return (
            <BaseContainer
                title={strings("recipeTitle")}
                left={'menu'}
                right={this.props.cartCount > 0 ? [{ url: "filter", name: "filter", type: "ant-design" }, { url: "shopping-cart", name: "Cart", value: this.props.cartCount, type: "ant-design" }] : [{ url: "filter", name: "filter", type: "ant-design" }]}
                onLeft={this.onBackEventHandler}
                onRight={this.rightClickHanlder}
                onConnectionChangeHandler={this.networkConnectivityStatus}>

                <NavigationEvents onWillFocus={this.onWillFocusHandler} />

                {this.state.locationError ?
                    <EDLocationModel
                        isLoadingPermission={this.state.isPermissionLoading}
                        onLocationEventHandler={this.onLocationEventHandler}
                    />
                    :
                    <View style={{ flex: 1 }}>

                        {/* PROGRESS LOADER */}
                        {this.state.isLoading ? <ProgressLoader /> : null}


                        {/* RECIPE LIST */}
                        {this.foodData != undefined && this.foodData.length > 0 ? (
                            <FlatList
                                data={this.foodData}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={true}
                                renderItem={this.renderFoodOverview}
                                keyExtractor={(item, index) => item + index}
                                onEndReached={this.onLoadMore}
                                onEndReachedThreshold={.4}
                                refreshControl={<RefreshControl colors={[EDColors.primary]} refreshing={false} onRefresh={this.getRefreshHandler} />}
                                ListFooterComponent={this.renderFooter}
                                ListHeaderComponent={this.renderHeader}
                            />
                        ) : 
                        (this.strOnScreenMessage || '').trim().length > 0 ? (
                            <ScrollView
                                style={style.scrollView}
                                showsVerticalScrollIndicator={true}
                                refreshControl={<RefreshControl colors={[EDColors.primary]} refreshing={false} onRefresh={this.getRefreshHandler} />}
                            >
                                {/* {this.renderHeader()} */}
                                <View style={{ height: metrics.screenHeight * 0.8 }}>
                                {this.renderHeader()}
                                <View style= {{flex:1 , marginTop:50}} >
                                    <EDPlaceholderComponent
                                        title={this.strOnScreenMessage}
                                        subTitle={this.strOnScreenSubtitle}
                                    />
                                    </View>
                                </View>
                            </ScrollView>
                        ) : null
                    }

                    </View>
                }
            </BaseContainer>
        );
    }
    //#endregion

    //#region 
    /** ON RIGHT CLICK EVENT */
    rightClickHanlder = index => {

        if (index == 0) {
            this.props.navigation.navigate("Filter", {
                getFilterDetails: this.testFunction,
                filterType: "Recipe",
                food: this.food,
                time: this.timing,
                foodArray: this.foodArray,
            });
        }
        else {
            if (this.table_id !== undefined && this.table_id !== "")
                this.props.navigation.navigate("CheckOutContainer");
            else
                this.props.navigation.navigate("CartContainer", { isview: false });
        }
    };
    //#endregion

    //#region 
    /** MENU EVENT HANDLER */
    onBackEventHandler = () => {
        this.props.navigation.openDrawer();
    }
    //#endregion

    //#region 
    /** TEXT DID CHANGE */
    onChangeTextHandler = (text) => {
        this.setState({
            itemSearch: text
        })
    }
    //#endregion

    //#region 
    /** FOOD OVERVIEEW CARD */
    renderFoodOverview = ({ item, index }) => {
        return (
            <FoodOverview
                item={item}
                onClick={this.onRecipeEventhandler}
            />
        );
    }
    //#endregion

    //#region 
    /** DETAILS RECIPE */
    onRecipeEventhandler = (item) => {
        this.props.navigation.navigate("RecipeDetail", {
            detail: item,
            "menuitem": item.is_recipes_menu !== undefined && item.is_recipes_menu !== null && item.is_recipes_menu == 1 ? item.recipes_menu[0].items[0] : {},
            "currency_symbol": item.is_recipes_menu !== undefined && item.is_recipes_menu !== null && item.is_recipes_menu == 1 ? item.restaurant.currency_symbol : "",
            "resId": item.is_recipes_menu !== undefined && item.is_recipes_menu !== null && item.is_recipes_menu == 1 ? item.restaurant.restaurant_id : "",
            "contentId": item.is_recipes_menu !== undefined && item.is_recipes_menu !== null && item.is_recipes_menu == 1 ? item.restaurant.restaurant_content_id : "",

            "isOpen": item.is_recipes_menu !== undefined && item.is_recipes_menu !== null && item.is_recipes_menu == 1 ? item.restaurant.restaurant_timings !== undefined && item.restaurant.restaurant_timings !== null && item.restaurant.restaurant_status !== undefined && item.restaurant.restaurant_status !== null ? (item.restaurant.restaurant_timings.closing.toLowerCase() == "close" || item.restaurant.restaurant_status == "0" || item.restaurant.restaurant_status == 0  ? false : true) : false : false
        });
    }

    //#region RECIPE API
    /**
     * @param { Success Repsonse Object } onSuccess
     */
    onSuccessRecipeList = (onSuccess) => {
        if (onSuccess != undefined) {
            if (onSuccess.status == RESPONSE_SUCCESS && onSuccess.recipes.length > 0) {
                let recipeData = onSuccess.recipes || []
                let totalRecordCount = onSuccess.total_recipes || 0
                this.shouldLoadMore = this.foodData.length + recipeData.length < totalRecordCount
                this.foodData = [...this.foodData, ...recipeData]
                this.setState({ isLoading: false, isMoreLoading: false });
            } else {
                this.foodData = []
                this.strOnScreenMessage = strings('noDataFound')
                this.setState({ isLoading: false, isMoreLoading: false });
            }
        } else {
            this.strOnScreenMessage = strings("generalWebServiceError")
            this.setState({ isLoading: false, isMoreLoading: false });
        }
    }

    /**
     * @param { Failure Response Object } onFailure
     */
    onfailureRecipeList = (onFailure) => {
        this.strOnScreenMessage = strings("generalWebServiceError")
        this.foodData = [];
        this.setState({ isLoading: false, isMoreLoading: false });
    }

    /**CALL RECIPE API */
    getRecipeList = (isForRefresh = false) => {
        this.strOnScreenMessage = ""
        this.isFilter = false

        if (this.foodData == undefined) {
            this.foodData = []
        }

        if (this.foodData.length == 0)
            this.setState({ isLoading: true })
        else
            this.setState({ isMoreLoading: true })

        netStatus(status => {
            if (status) {
                let param = {
                    language_slug: this.props.lan,
                    recipe_search: this.state.itemSearch,
                    food: "" + this.foodArray,
                    timing: "" + this.timing,
                    count: API_PAGE_SIZE,
                    page_no: (this.foodData && !isForRefresh) ? parseInt(this.foodData.length / API_PAGE_SIZE) + 1 : 1,

                }
                getRecipe(param, this.onSuccessRecipeList, this.onfailureRecipeList);
            } else {
                this.setState({ isLoading: false });
                this.strOnScreenMessage = strings('noInternetTitle');
                this.strOnScreenSubtitle = strings('noInternet');
            }
        });
    }
    //#endregion

    //#endregion
    /** SEARCH EVENT HANDLER */
    onSearchClick = () => {
        if (this.state.itemSearch == "" || !(/\S/.test(this.state.itemSearch))) {
            return
        } else {
            this.foodData = undefined
            this.getRecipeList(true);
        }
    }
    //#endregion

    //#region 
    /** TEST FUNCTION */
    testFunction = data => {
        if (!this.state.isLoading && !this.state.isMoreLoading) {
            this.foodData = undefined
            this.food = data.food;
            this.foodArray = data.foodArray
            this.timing = data.timing;
            this.isFilter = true
            this.is_filter = data.applied
            this.getRecipeList(true);
        }
    };
    //#endregion

    getRefreshHandler = () => {
        this.foodData = undefined
        this.state.itemSearch = ""
        this.getRecipeList(true)
    }
}

export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
            googleMapKey: state.userOperations.googleMapKey,
            cartCount: state.checkoutReducer.cartCount,

        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveTableID: table_id => {
                dispatch(saveTableIDInRedux(table_id))
            },
            saveResID: table_id => {
                dispatch(saveResIDInRedux(table_id))
            },
            saveCartCount: data => {
                dispatch(saveCartCount(data));
            },
            saveCartPrice: data => {
                dispatch(saveCartPrice(data));
            },
        };
    }
)(RecipeContainer);

const style = StyleSheet.create({
    searchBox: {
        position: "relative",
    },
    scrollView: { paddingBottom: 20, flex:1 },
    imgStyle: { width: "100%", height: 180 },
});

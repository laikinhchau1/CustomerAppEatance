
import AsyncStorage from "@react-native-community/async-storage";
import React from "react";
import { RefreshControl } from "react-native";
import { ScrollView } from "react-native";
import { Keyboard } from "react-native";
import { Animated, FlatList, StyleSheet, Text, View } from "react-native";
import SearchBar from "react-native-elements/dist/searchbar/SearchBar-ios";
import { heightPercentageToDP } from "react-native-responsive-screen";
import ProductComponent from '../components/ProductComponent';
import { strings } from "../locales/i18n";
import { getMenu } from "../utils/AsyncStorageHelper";
import { EDColors } from "../utils/EDColors";
import { debugLog, getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import metrics from "../utils/metrics";
import EDButton from "./EDButton";
import EDHomeSearchBar from "./EDHomeSearchBar";
import EDPlaceholderComponent from "./EDPlaceholderComponent";

export default class EDMenuListComponent extends React.PureComponent {
    constructor(props) {
        super(props)
        this.refreshing = false
        this.sectionData = []
        this.lastProductHeight = 0
        this.startingHeight = metrics.screenHeight
        this.animatedHeight = new Animated.Value(200)
        this.animatedValue = new Animated.Value(0)
        this.scrollY = React.createRef()
        this.scrollY.current = new Animated.Value(0)
        this.scrollFlag = false
        this.state = {
            selectedID: -1,
            enableScrollViewScroll: false,
            totalHeight: 0,
            initialHeight: metrics.screenHeight,
            key: 1,
            headerHeight: metrics.screenHeight * .26,
            tabHeight: 45,
            enableSectionScroll: true,
            topMargin: undefined,
            measurements: new Array(this.sectionData.length).fill(0),
            scrollY: new Animated.Value(0),
            strSearch: "",
            isSearchVisible: this.props.isSearchVisible,
            searchHeight: 0,
            data: this.props.data
        }
        this.bottomPadding = 0
    }

    componentWillMount = () => {
        this.sectionData = this.props.data
        if (this.props.popularItems != undefined & this.props.popularItems != null && this.props.popularItems.length > 0) {
            // this.sectionData.push({ category_id: -1, title: strings("popularItems"), data: this.props.popularItems })
            this.setState({ selectedID: -1 })
        }
        else
            this.setState({ selectedID: undefined })


        this.props.data.map(item => {
            if (this.state.selectedID == undefined)
                this.setState({ selectedID: item.category_id })
            // this.sectionData.push(
            //     { category_id: item.category_id, title: item.category_name, data: item.items }
            // )
        })

    }

    componentWillReceiveProps = (newProps) => {
        if (newProps.isSearchVisible == true) {
            if (this.sectionRef !== undefined && this.sectionRef !== null) {
                this.sectionRef.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewOffset: 55, viewPosition: 0 })
                setTimeout(() => {
                    if (this.textInput)
                        this.textInput.textInput.focus()
                }, 100)
            }
        }
    }


    onProductPress = (item) => {
        this.props.onProductPress(item)
    }

    menuItemsRender = (item, section) => {
        return (
            <ProductComponent
                currency={this.props.currency_Symbol}
                data={item}
                addons_category_list={item.addons_category_list === undefined ? [] : item.addons_category_list}
                cartData={this.props.cartData.length === 0 ? [] : this.props.cartData}
                isLoading={this.props.isLoading}
                isOpen={this.props.isOpen}
                plusAction={() => this.props.plusAction(item)}
                minusItems={this.props.minusItems}
                addData={this.props.addData}
                addOneData={this.props.addOneData}
                onProductPress={() => this.onProductPress(item)}
                onLayout={(e) => this.onProductLayout(e, section)}
            />
        )
    }

    onProductLayout = (e, section) => {

        if (this.lastProductHeight !== undefined) {
            this.lastProductHeight = e.nativeEvent.layout.height
            let total_products = 0
            this.sectionData.map(data => [
                total_products = total_products + data.data.length
            ])
            this.setState({ initialHeight: total_products * (this.lastProductHeight) })
        }
        // if (section.category_id == this.sectionData.reverse()[0].category_id) {
        //     this.bottomPadding = this.bottomPadding + e.nativeEvent.layout.height
        //     debugLog("PADDING SUCCESS :::::", section.category_id, this.sectionData.reverse()[0].category_id)

        // }
        // debugLog("TOTAL PADDING :::::", this.bottomPadding, section.category_id, this.sectionData.reverse()[0].category_id)

    }

    onScrollViewScrolll = event => {
        if (event.nativeEvent.contentOffset.y >= this.state.headerHeight) {
            if (this.state.enableScrollViewScroll == false) {
                this.setState({ enableScrollViewScroll: true })
            }
        }
        else if (event.nativeEvent.contentOffset.y < this.state.headerHeight - this.state.tabHeight) {
            if (this.state.enableScrollViewScroll == true) {
                if (this.props.popularItems != undefined & this.props.popularItems != null && this.props.popularItems.length > 0) {
                    this.setState({ selectedID: -1, enableScrollViewScroll: false })
                }
                else {
                    let id = this.sectionData.map(data => data.category_id)[0]
                    this.setState({ selectedID: id, enableScrollViewScroll: false })
                }
            }
        }
    }

    onCheckViewableItem = ({ viewableItems, changed }) => {
        if (viewableItems !== undefined && viewableItems !== null && viewableItems.length !== 0) {
            let index = this.sectionData.map(data => data.category_id).indexOf(viewableItems.reverse()[0].section.category_id)
            if (index !== -1) {
                try {
                    this.tabRef.scrollToIndex({ animated: true, index: index, viewPosition: 1 })
                    this.tabRef2.scrollToIndex({ animated: true, index: index, viewPosition: 1 })
                }
                catch { (err => { debugLog("TAB SCROLL ERROR :::::", err) }); }
            }
            this.setState({ selectedID: viewableItems.reverse()[0].section.category_id })
        }
    }

    onHeaderLayout = e => {
        this.setState({ headerHeight: e.nativeEvent.layout.height - this.state.tabHeight })
    }

    ListHeaderComponent = () => {
        return (
            <View style={{}}
                onLayout={this.onHeaderLayout}>
                {this.props.ListHeaderComponent()}
                {this.renderTab(2)}
            </View>
        )
    }

    onTabPress = index => {
        this.setState({ enableScrollViewScroll: true })
        this.sectionRef.scrollToLocation({ sectionIndex: index, itemIndex: 0, animated: true, viewOffset: this.props.isSearchVisible ? this.state.searchHeight : 0, viewPosition: 0 })
    }
    renderFooter = () => {
        return (
            <View
                // source={Assets.logo}
                style={[
                    styles.footerImage,
                    {
                        marginTop: metrics.screenHeight - this.bottomPadding - this.state.tabHeight - metrics.navbarHeight - this.state.headerHeight - 20
                        // marginTop: this.startingHeight - this.state.headerHeight
                    }]} />
        )
    }

    onSectionListScrollDrag = e => {
    }

    onSectionListScroll = e => {
    }

    onSectionHeaderLayout = e => {
    }

    childSection = () => {

        return (
            <Animated.SectionList
                style={[styles.sectionList, {
                    position: "relative"
                }]}

                bounces={false}
                sections={this.sectionData}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: this.scrollY.current } } }],
                    {
                        useNativeDriver: true,
                        listener: () => {
                            Keyboard.dismiss()
                        }
                    },

                )}

                refreshControl={<RefreshControl
                    refreshing={this.refreshing || false}
                    colors={[EDColors.primary]}
                    onRefresh={this.onPullToRefreshHandler} />
                }
                scrollEventThrottle={16}
                ListFooterComponent={this.renderFooter}
                ListHeaderComponent={this.ListHeaderComponent}

                ref={ref => this.sectionRef = ref}
                onScrollToIndexFailed={() => {
                    debugLog("SCROLL FAILED:::")
                }}
                onViewableItemsChanged={this.onCheckViewableItem}
                viewabilityConfig={{
                    viewAreaCoveragePercentThreshold: 100,
                }}
                renderSectionHeader={({ section }) => {
                    return (
                        <View
                        >
                            <View style={styles.sectionHeaderContainer} />
                            <Text style={[styles.sectionHeaderText, { textAlign: isRTLCheck() ? "right" : "left" }]}>{section.title != undefined ? section.title.toUpperCase() : ''}</Text>
                        </View>
                    )
                }}
                renderItem={({ item, section }) => this.menuItemsRender(item, section)}
                stickySectionHeadersEnabled={false}
            />
        )
    }

    onTabLayout = (e) => {
        this.setState({ tabHeight: e.nativeEvent.layout.height })
    }

    renderTab = (key = 1) => {
        return (
            <FlatList
                key={key}
                inverted={isRTLCheck()}
                data={this.sectionData}
                onLayout={this.onTabLayout}
                style={{ backgroundColor: EDColors.offWhite }}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                ref={ref => key == 1 ? this.tabRef = ref : this.tabRef2 = ref}
                horizontal
                // contentContainerStyle={{ flexDirection: isRTLCheck() ? "row-reverse" : "row" }}
                showsHorizontalScrollIndicator={false}
                renderItem={item => {
                    return (
                        <EDButton
                            label={item.item.title}
                            style={{
                                borderWidth: 1,
                                borderColor: EDColors.separatorColorNew,
                                marginHorizontal: 5, paddingHorizontal: 20, height: heightPercentageToDP("6%"), paddingVertical: 0, borderRadius: 10,
                                backgroundColor: this.state.selectedID == item.item.category_id ? EDColors.primary : EDColors.white
                            }}
                            textStyle={{
                                fontSize: getProportionalFontSize(12), fontFamily: EDFonts.semiBold, color: this.state.selectedID == item.item.category_id ? EDColors.white : EDColors.black,
                            }}
                            onPress={() => this.onTabPress(item.index)}
                        />
                    )
                }}
            />
        )
    }

    onLayout = (e) => {
        this.startingHeight = e.nativeEvent.layout.height
        this.forceUpdate()
    }

    onPullToRefreshHandler = () => {
        // this.refreshing = false
        // this.forceUpdate();
        if (this.props.onPullToRefreshHandler)
            this.props.onPullToRefreshHandler()
    }

    refreshControl = () => {
        if (this.props.refreshControl !== undefined) {
            this.refreshing = false
            this.props.refreshControl()
        }
    }

    onSearch = async text => {
        let menu = []
        await getMenu(data => menu = data)
        menu.map((item, index) => {
            menu[index].data = menu[index].data.filter(data => {
                return data.name.toLowerCase().includes(text.toLowerCase())
            })
        })
        menu = menu.filter(data => {
            return data.data.length !== 0
        })
        this.sectionData = menu
        this.setState({ strSearch: text.trim() })
    }

    cancelSearch = async () => {
        await getMenu(data => this.sectionData = data)
        this.setState({ strSearch: "", isSearchVisible: false })
        this.props.cancelSearch()
    }

    clearSearch = async () => {
        await getMenu(data => this.sectionData = data)
        this.setState({ strSearch: "", })
        if (this.sectionRef !== undefined && this.sectionRef !== null) {
            setTimeout(() =>
                this.sectionRef.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewOffset: 55, viewPosition: 0 }), 50)
        }
    }


    onSearchLayout = e => {
        this.setState({ searchHeight: e.nativeEvent.layout.height })
    }


    render() {
        const imageOpacity = this.scrollY.current.interpolate({
            inputRange:
                [0, this.state.headerHeight - (this.props.isSearchVisible ? 50 : 0), 1 * (this.state.headerHeight - (this.props.isSearchVisible ? 50 : 0))],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
        });
        return (
            <View style={styles.container}>
                {imageOpacity !== 0 ?
                    <Animated.View style={{ opacity: imageOpacity, position: "absolute", top: 0, zIndex: 1, width: metrics.screenWidth }}>
                        {this.props.isSearchVisible ?
                            <EDHomeSearchBar
                                ref={ref => this.textInput = ref}
                                onClosePress={this.cancelSearch}
                                showIcon={true}
                                onLayout={this.onSearchLayout}
                                onCleanPress={this.clearSearch}
                                onChangeValue={this.onSearch}
                                showClear={this.state.strSearch.length !== 0}
                                // value={this.state.strSearch}
                                placeholder={strings("searchFood")}
                                style={{ marginTop: 0, marginHorizontal: 0, borderRadius: 0 }} />
                            : null}
                        {this.renderTab()}
                    </Animated.View> : null}
                {this.sectionData.length !== 0 ?
                    this.childSection() :
                    <ScrollView>
                        {this.ListHeaderComponent()}
                        <EDPlaceholderComponent title={strings("noDataFound")} />
                    </ScrollView>
                }
            </View >
        )
    }
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: EDColors.transparent
    },
    searchContainer: {
        backgroundColor: EDColors.white,
        padding: 0
    },
    tabBar: {
        backgroundColor: '#fff',
        borderBottomColor: '#f4f4f4',
        borderBottomWidth: 1,
    },
    tabContainer: {
        borderBottomColor: '#090909'
    },
    tabText: {
        padding: 15,
        color: '#9e9e9e',
        fontSize: 18,
        fontWeight: '500'
    },
    separator: {
        height: 0.5,
        width: '96%',
        alignSelf: 'flex-end',
        backgroundColor: '#eaeaea'
    },
    sectionHeaderContainer: {
        height: 12,
        backgroundColor: EDColors.offWhite,
    },
    sectionHeaderText: {
        color: EDColors.black,
        fontSize: getProportionalFontSize(16),
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontFamily: EDFonts.bold
    },
    itemContainer: {
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff'
    },
    itemTitle: {
        flex: 1,
        fontSize: 20,
        color: '#131313'
    },
    itemPrice: {
        fontSize: 18,
        color: '#131313'
    },
    itemDescription: {
        marginTop: 10,
        color: '#b6b6b6',
        fontSize: 16
    },
    itemRow: {
        flexDirection: 'row'
    },
    sectionList: { backgroundColor: EDColors.offWhite },
    tabView: { marginHorizontal: 5, height: heightPercentageToDP('4.5%'), textAlignVertical: "center", textAlign: "center", borderWidth: 1, borderColor: "#EDEDED", borderRadius: 12 },

    footerImage: { height: 160, width: 160, alignSelf: 'center', marginBottom: 20 }
})

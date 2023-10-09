import React, { Component } from "react";
import { FlatList, RefreshControl, Image, StyleSheet } from 'react-native';
import { EDColors } from "../utils/EDColors";
import PopularRestaurantCard from "./PopularRestaurantCard";
import Assets from "../assets";
import EDRTLView from "./EDRTLView";
import { Icon } from "react-native-elements";
import { View } from "react-native";
import { Spinner } from "native-base";

export default class EDRestaurantDeatilsFlatList extends Component {
    onPullToRefreshHandler = () => {
        if (this.props.onPullToRefreshHandler !== undefined) {
            this.props.onPullToRefreshHandler()
        }
    }
    render() {
        return (
            this.props.isLoading == true ?
            <Spinner color={EDColors.primary} size={"large"}/> :
                this.props.arrayRestaurants ?
                    <FlatList
                        data={this.props.arrayRestaurants}
                        extraData={this.props.arrayRestaurants}
                        showsVerticalScrollIndicator={false} //R.K 07-01-2021 On indicator
                        keyExtractor={(item, index) => item + index}
                        renderItem={this.renderPopularResList}
                        // ListFooterComponent={this.renderFooter}
                        onEndReached={this.props.onEndReached}
                        onEndReachedThreshold={.4}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.props.refreshing || false}
                                colors={[EDColors.primary]}
                                onRefresh={this.onPullToRefreshHandler}
                            />
                        }
                    />
                    : null
        )
    }


    renderFooter = () => {
        return (
            <View style={{ height: 80 }} />
        )
    }

    renderPopularResList = (item, index) => {
        return (
            <PopularRestaurantCard
                restObjModel={item}
                onPress={restObjModel => { this.props.onPopularResEvent(restObjModel) }}
                isShowReview={this.props.isShowReview}
            />
        );
    }
}

const styles = StyleSheet.create({
    footerImage: { height: 100, width: 120, alignSelf: 'center', marginVertical: 10 }
})
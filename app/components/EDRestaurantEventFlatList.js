import React, { Component } from "react";
import { FlatList, RefreshControl } from 'react-native';
import { EDColors } from "../utils/EDColors";
import RestaurantEventBookCard from "./RestaurantEventBookCard";

export default class EDRestaurantEventFlatList extends Component {
    render() {
        return (
            <FlatList
                style={{marginBottom:10}}  //VIKRANT 28-07-21
                data={this.props.arrayRestaurants}
                keyExtractor={(item, index) => item + index}
                renderItem={this.renderRestaurantEventCard}
                ListHeaderComponent={this.renderHeaderComponent}
                ListFooterComponent={this.renderFooterComponent}
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
        )
    }

    onPullToRefreshHandler = () => {
        if (this.props.onPullToRefreshHandler !== undefined) {
            this.props.onPullToRefreshHandler()
        }
    }

    renderHeaderComponent = () => {
        return (
            this.props.ListHeaderComponent !== undefined ?
                this.props.ListHeaderComponent() : null
        )
    }
    renderFooterComponent = () => {
        return (
            this.props.ListFooterComponent !== undefined ?
                this.props.ListFooterComponent() : null
        )
    }

    //#region 
    /** RENDER CARD VIEW */
    renderRestaurantEventCard = ({ item, index }) => {
        return (
            <RestaurantEventBookCard
                restObjModel={item}
                lan={this.props.lan}
                onPress={model => { this.props.onPressedBookEvent(model) }}
                isShowReview={this.props.isShowReview}
            />
        );
    }
    //#endregion

}
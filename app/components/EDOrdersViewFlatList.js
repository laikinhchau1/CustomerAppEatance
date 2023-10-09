import React, { Component } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { strings } from '../locales/i18n';
import { EDColors } from '../utils/EDColors';
import EDOrderDetailsView from './EDOrderDetailsView';

export default class EDOrdersViewFlatList extends Component {

    onPullToRefreshHandler = () => {
        if (this.props.onPullToRefreshHandler !== undefined) {
            this.props.onPullToRefreshHandler()
        }
    }
    render() {
        return (
            this.props.arrayOrders
                ? <FlatList
                    showsVerticalScrollIndicator={false}
                    style={this.props.style}
                    data={this.props.arrayOrders}
                    renderItem={this.renderOrderDetailsView}
                    keyExtractor={(item, index) => item + index}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.props.refreshing || false}
                            title={strings("refreshing")}
                            titleColor={EDColors.textAccount}
                            tintColor={EDColors.textAccount}
                            colors={[EDColors.textAccount]}
                            onRefresh={this.onPullToRefreshHandler}
                        />
                    }
                    onEndReached={this.props.onEndReached}
                />
                : null
        )
    }
    // RENDER ITEM METHOD FOR FLATLIST
    renderOrderDetailsView = (order) => {
        return <EDOrderDetailsView
            forPast={this.props.forPast}
            orderDetails={order.item}
            lan={this.props.lan}
            onPress={this.props.onPressHandler}
            onTrackOrder={this.props.onTrackOrder} 
            cancelOrder={this.props.onCancelOrder} 
            
            />
    }
}
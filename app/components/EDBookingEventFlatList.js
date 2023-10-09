import React, { Component } from "react";
import { FlatList } from 'react-native';
import BookedEventCard from "./BookedEventCard";

export default class EDBookingEventFlatList extends Component {
    render() {
        return (
            <FlatList
                key={this.props.key}
                data={this.props.arrayBookingRes}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={true}
                keyExtractor={(item, index) => item + index}
                renderItem={this.createViewEvent} />
        )
    }

    //#region 
    /** UPOCMING EVENTS */
    createViewEvent = ({ item, index }) => {
        return (
            <BookedEventCard
                item={item}
                pkgImage={item.image}
                RestaurantName={item.name}
                address={item.address}
                pos={index}
                rating={item.rating !== null && item.rating !== "" ? parseFloat(item.rating) : 0}
                timing={item.booking_date}
                people={item.no_of_people}
                pkg={item.package_name}
                currency_symbol={item.currency_symbol}
                pkgPrice={item.package_price}
                onPress={item => { this.props.onEventPressHandler(item) }}
                isSelected={true}
                onReview={() => { }}
                startTime={ item.start_time !== undefined && item.start_time !== null ? item.start_time :null}
                endTime= { item.end_time !== undefined && item.end_time !== null ? item.end_time : null }
                is_table = {item.is_table !== undefined && item.is_table !== null && item.is_table == 1 ? item.is_table : 0}
                additional_request={item.additional_request}
                eventTime={item.start_time}
                createdDate={item.created_date}
            />
        );
    }
    //#endregion
}

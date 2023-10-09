import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { EDFonts } from '../utils/EDFontConstants';
import ReviewComponent from './ReviewComponent';

export default class EDReviewListComponent extends React.PureComponent {

    /** RENDER */
    render() {
        return (
            <View>
                <FlatList
                    style={style.mainView}
                    data={this.props.data.reverse()}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        return (
                            <ReviewComponent
                                item={item}
                                size={15}
                                keyExtractor={(item, index) => item + index}
                                onReview={count => { }}
                                readonly={true}
                            />
                        );
                    }}
                />
            </View>
        )
    }
}

export const style = StyleSheet.create({
    mainView: { margin: 10 },
    txtStyle: {
        marginStart: 10,
        marginEnd: 10,
        color: "#000",
        fontSize: 16,
        marginTop: 8,
        marginLeft: 20,
        fontFamily: EDFonts.bold
    }
})
import moment from "moment";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import StarRating from 'react-native-star-rating';
import { getProportionalFontSize } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";
import EDRTLView from "./EDRTLView";

export default class ReviewComponent extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            stars: 7
        };
    }

    onStarRatingPress(rating) {
        this.setState({ stars: rating });
    }

    render() {
        return (
            <View style={style.container} >
                <EDRTLView style={style.SubContainer}>
                    {/* <EDImage style={style.image} source={this.props.item.image} /> */}
                    <View style={style.detail}>
                        <EDRTLText style={style.detailName} title={this.props.item.first_name + " " + this.props.item.last_name} />
                        <EDRTLView >
                            <StarRating
                                disabled={this.props.readonly}
                                starSize={this.props.size}
                                maxStars={5}
                                emptyStarColor={'#D4D4D4'}
                                containerStyle={style.ratingStyle}
                                fullStarColor={'#FDB200'}
                                rating={parseFloat(this.props.item.rating)}
                                selectedStar={star => {
                                    this.props.onReview(star);
                                }}
                                fullStar={'star'}
                                emptyStar={'star'}
                                iconSet={'FontAwesome'}
                            />
                            <Text style={style.commanView} />
                        </EDRTLView>
                    </View>
                    <View>
                        <Text style={style.date}>{moment(this.props.item.created_date, "DD-MM-YYYY").format("MM-DD-YYYY")}</Text>
                    </View>
                </EDRTLView>
                <EDRTLText style={style.review} title={this.props.item.review} />
            </View>
        );
    }
}


export const style = StyleSheet.create({
    container: {
        alignSelf: "flex-start",
        paddingTop: 10,
        paddingBottom: 15,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#fff",
        borderRadius: 16,
        shadowColor: "#F6F6F6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        margin: 7,
        flex: 1,

    },
    SubContainer: {
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        flex: 1,
        marginBottom: 10
    },
    image: {
        width: 55,
        height: 55,
        borderRadius: 10,
        alignSelf: "center",
    },
    detail: {
        flex: 1,
        // marginHorizontal: 10,
        justifyContent: 'space-evenly'
    },
    detailName: {
        color: "#000",
        fontSize: getProportionalFontSize(16),
        fontFamily: EDFonts.semiBold
    },
    review: {
        fontFamily: EDFonts.regular,
        fontSize: getProportionalFontSize(12),
        color: '#666666',
        paddingHorizontal: 5
    },
    date: {
        flex: 1,
        fontSize: getProportionalFontSize(10),
        alignSelf: "center",
        fontFamily: EDFonts.regular
    },
    ratingStyle: {
        margin: 2
    },
    commanView: { flex: 1 }
});


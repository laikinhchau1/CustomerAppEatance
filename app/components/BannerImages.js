/* eslint-disable prettier/prettier */
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-banner-carousel';
import Assets from '../assets';
import { default as Metrics, default as metrics } from '../utils/metrics';
import EDImage from './EDImage';

const BannerHeight = 190;

export default class BannerImages extends React.PureComponent {

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.currentSliderIndex = 0;
    }
    onPageChanged = (currentIndex) => {
        this.currentSliderIndex = currentIndex;
    }

    onImageSelectionHandler = () => {
        if (this.props.onImageSelectionHandler !== undefined) {
            this.props.onImageSelectionHandler(this.currentSliderIndex)
        }
    }

    renderImage(image, index) {
        return (
            <View key={index}>
                <EDImage
                    style={{ width: Metrics.screenWidth, height: BannerHeight }}
                    source={image.image}
                    placeholder={Assets.logo}
                    placeholderResizeMode="cover"

                    resizeMode="cover"
                />
            </View>
        );
    }

    render() {
        return (
            <View>
                {this.props.images !== undefined && this.props.images.length > 0 ? (
                    <Carousel
                        autoplay
                        autoplayTimeout={5000}
                        loop
                        showsPageIndicator={false}
                        index={0}
                        pageSize={Metrics.screenWidth}
                    >
                        {this.props.images.map((image, index) =>
                            this.renderImage(image, index),
                        )}
                    </Carousel>
                ) : <Image source={Assets.logo} style={style.imageStyle} resizeMode={"contain"} />
                }
            </View>
        );
    }
}

//#region STYLES
const style = StyleSheet.create({
    imageStyle: {
        alignItems: 'center',
        width: metrics.screenWidth,
        height: BannerHeight,
    },
});

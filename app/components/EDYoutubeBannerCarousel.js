/* eslint-disable prettier/prettier */
import React from 'react';
import Carousel from 'react-native-snap-carousel';
import { Image, View, StyleSheet } from 'react-native';
import Assets from '../assets';
import Metrics from '../utils/metrics';
import { debugLog, isRTLCheck } from '../utils/EDConstants';
import EDBannerImage from './EDBannerImage';
import { EDColors } from '../utils/EDColors';

const DOT_OFFSET = 5;
const MIN_WIDTH_DOT = 12;


export default class EDYoutubeBannerCarousel extends React.PureComponent {

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.currentSliderIndex = 0;
    }

    onImageSelectionHandler = () => {
        if (this.props.onImageSelectionHandler !== undefined) {
            this.props.onImageSelectionHandler(this.currentSliderIndex)
        }
    }

    state = {
        activeSlideIndex: 0
    }

    renderCustomDots = () => {
        const { images, activeSlideColor, inactiveSlideColor } = this.props;
        const totalDotOffset = (images.length - 1) * DOT_OFFSET
        const dotWidth = Math.min((Metrics.screenWidth - 40 - totalDotOffset) / images.length, MIN_WIDTH_DOT)
        return (
            images !== undefined && images.length > 1
                ? <View style={[style.dotContainer, { flexDirection: isRTLCheck() ? 'row-reverse' : 'row' }]}>
                    {images.map((imageToIterate, indexToIterate) =>
                        <View style={{
                            width: dotWidth, marginRight: DOT_OFFSET, height: 2,
                            backgroundColor: this.state.activeSlideIndex == indexToIterate
                                ? activeSlideColor || EDColors.black
                                : inactiveSlideColor || EDColors.blackOpaque
                        }}></View>
                    )}
                </View>
                : null
        )
    }

    onSnapToItem = (currentIndex) => {
        this.setState({ activeSlideIndex: currentIndex })
    }
    onSelectionHandler = (currentItem) => {
        if (this.props.selectedImage !== undefined) {
            this.props.selectedImage(currentItem)
        }
    }



    render() {
        return (
            <View style={[{ height: Metrics.screenHeight * 0.25 }]}>
                {this.props.images !== undefined && this.props.images.length > 0 ? (
                    <>
                        <Carousel
                            data={this.props.images}
                            renderItem={this.renderParallaxBanner}
                            keyExtractor={(item, index) => (item.banner_id || (item.id || item)) + index}
                            sliderWidth={(Metrics.screenWidth)}
                            itemWidth={Metrics.screenWidth}
                            style={{ alignItems: 'center', justifyContent: 'center' }}
                            hasParallaxImages={true}
                            pagingEnabled={false}
                            inactiveSlideScale={1}
                            lockScrollWhileSnapping={true}
                            onSnapToItem={this.onSnapToItem}
                            inactiveSlideOpacity={1}
                            autoplay
                            loop
                        />
                        {this.renderCustomDots()}
                    </>
                ) : this.props.images == undefined
                        ? null
                        : <Image resizeMode='contain' 
                         source={Assets.logo}  style={style.imageStyle} />
                }
            </View>
        );
    }

    renderParallaxBanner = ({ item }, parallaxProps) => {
        var bannerType = this.props.bannerType || 'home';
        var resizeMode = '';
        var imageSource = '';
        var placeholderResizeMode = 'contain';
        var backgroundColor = EDColors.offWhite;
        if (bannerType === 'home') {
            resizeMode = 'cover';
            imageSource = item.image;
            // imageSource = BASE_URL + "pub/media/" + item.image;
        } else if (bannerType === 'product') {
            resizeMode = 'contain';
            placeholderResizeMode = 'center'
            imageSource = item.file;
            backgroundColor = EDColors.white;
        } else if (bannerType === 'seller') {
            resizeMode = 'contain';
            placeholderResizeMode = 'center'
            imageSource = item;
            backgroundColor = EDColors.white;
        }
        return <EDBannerImage youTubeLink={item.youtube !== undefined ? this.props.youTubeLink : undefined} backgroundColor={backgroundColor} placeholderResizeMode={placeholderResizeMode} resizeMode={resizeMode} imageSource={imageSource} parallaxProps={parallaxProps} data={item} onPress={this.onSelectionHandler} />
    }


}

//#region STYLES
const style = StyleSheet.create({
    imageStyle: {
        alignItems: 'center',
        width: '100%',
        height: 180,
    },
    dotContainer: { width: '100%', paddingHorizontal: 20, height: 40, marginTop: -40, alignItems: 'center' }
});

/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import Assets from '../assets';
import { EDColors } from '../utils/EDColors';

export default class EDImage extends React.PureComponent {

    state = {
        shouldShowPlaceholder: false,
    }
    showPlaceholder = () => {
            this.setState({ shouldShowPlaceholder: true })
    }

    render() {
        return this.props.source !== undefined &&
            this.props.source !== null &&
            this.props.source.trim().length > 0 ? (
            <FastImage style={[this.props.style, { overflow: 'hidden', backgroundColor: EDColors.white }]}
                source={
                    this.state.shouldShowPlaceholder ? Assets.user_placeholder :
                        {
                            uri: this.props.source,
                            priority: FastImage.priority.normal,
                        }}
                resizeMode={this.props.resizeMode || FastImage.resizeMode.cover}
                onError={this.showPlaceholder}
            />
        ) : (
            <Image
                style={[this.props.style, { overflow: 'hidden', backgroundColor: EDColors.white },this.props.placeholderStyle]}
                resizeMode={this.props.placeholderResizeMode ||"cover"}
                source={this.props.placeholder || Assets.user_placeholder}
            />
        );
    }
}

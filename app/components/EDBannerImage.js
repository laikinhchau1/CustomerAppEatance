import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize } from "../utils/EDConstants";
import EDImage from "./EDImage";
export default class EDBannerImage extends React.PureComponent {
  onImageSelectionHandler = () => {
    if (this.props.onPress !== undefined) {
      this.props.onPress(this.props.data);
    }
  };

  render() {
    return (
      <View style={style.container}>
        <TouchableOpacity
          activeOpacity={1}
          style={style.flexStyle}
          onPress={this.onImageSelectionHandler}
        >
          {this.props.youTubeLink !== undefined
            ? <View
              style={{
                justifyContent: "center",
              }}
            >
              <EDImage
                backgroundColor={this.props.backgroundColor}
                placeholderResizeMode={this.props.placeholderResizeMode}
                resizeMode={this.props.resizeMode}
                style={style.image}
                source={this.props.imageSource}
              />
              <Icon
                containerStyle={style.imagePlay}
                name={"play-arrow"}
                color={EDColors.white}
                size={getProportionalFontSize(40)}
                style={{borderColor: EDColors.black}}
              
              
              />
            </View>
            : <EDImage
              backgroundColor={this.props.backgroundColor}
              placeholderResizeMode={this.props.placeholderResizeMode}
              resizeMode={this.props.resizeMode}
              style={style.image}
              source={this.props.imageSource}
            />}
        </TouchableOpacity>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'blue',
    alignSelf: "flex-start",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  icon: {
    backgroundColor: "#ccc",
    position: "absolute",
    //right: 0,
    bottom: 80,
    alignSelf: "center",
  },
  image: {
    // borderWidth: 10,
    // borderColor: 'green',
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  imagePlay: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor : EDColors.primary,borderRadius :22.5,
    overflow:"hidden",
    height :45,
    width :45,
    justifyContent:'center',
    alignItems:'center'
  },
  flexStyle: {
    flex: 1,
  },
});

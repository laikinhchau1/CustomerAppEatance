import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';


export default class EDYoutubePlayer extends React.Component {
  //#region LIFE CYCLE METHODS
  constructor(props) {
    super(props);
  }
  state = {
    status: '',
    quality: '',
    error: '',
    isReady: true,
  };
  onFullScreen = fullScreen => {
    console.log("fullscreen ", fullScreen);
  };
  render() {
    return (
      <View
        style={styles.modalContainer}
        pointerEvents={this.state.isLoading ? 'none' : 'auto'}>
        <View style={styles.modalSubContainer}>
          <EDRTLView style={{ alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: EDColors.separatorColor, marginBottom: 10 }}>
            <EDRTLText title={this.props.title} style={styles.title} />
            <MaterialIcon
              onPress={this.props.onDismissHandler}
              size={22}
              color={EDColors.homeButtonColor}
              name={'close'}
              style={{ marginVertical: 5 }}
            />
          </EDRTLView>

          <YoutubePlayer
            height={200}
            play={true}
            videoId={this.props.videoID}
          />

          {/* <YouTube
          apiKey={API_KEY}
            videoId={"Z6XvWKqqsiw"} // The YouTube video ID
            play={true} // control playback of video with true/false
            fullscreen={false} 
            loop={false}
            controls = {1}
                onReady  = {this.handleReady}
            // onError={e => {console.log("Got error in you tube",e)}}
            style={{alignSelf: 'stretch', height: 300}}
          /> */}
        </View>
      </View>
    );
  }
}

//#region STYLES
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: EDColors.transparent,
  },
  modalSubContainer: {
    backgroundColor: EDColors.white,
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 6,
    marginTop: 20,
    // marginBottom: 20,
    // paddingBottom: 20,

  },
  title: {
    fontFamily: EDFonts.semiBold,
    color: EDColors.black,
    flex: 1,
    fontSize: getProportionalFontSize(14)
  }
});
//#endregion

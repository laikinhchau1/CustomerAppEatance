'use strict';

import { Dimensions, Platform } from 'react-native';
import { isTablet } from 'react-native-device-info';
import { getProportionalFontSize } from './EDConstants';

const { width, height } = Dimensions.get('window');

const metrics = {
  screenWidth: width,
  screenHeight: height,
  statusbarHeight : Platform.OS === 'ios' ? 20 : 0,
  navbarHeight: isTablet()?getProportionalFontSize(70) :70,
  padding: 10,
  bottomButtonWidth: width - 20,
  avatarWidth: 60,
  spinnerSize: width * 0.5,
};

export default metrics;

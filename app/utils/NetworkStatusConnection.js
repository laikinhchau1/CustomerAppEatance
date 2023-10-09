import NetInfo from "@react-native-community/netinfo";

export const netStatus = (callback) => {
  NetInfo.fetch().then(isConnected => {
    callback(isConnected.isConnected);
  });
};

export const netStatusEvent = (callback) => {
  NetInfo.addEventListener("connectionChange", status => {
    callback(status);
  });
};

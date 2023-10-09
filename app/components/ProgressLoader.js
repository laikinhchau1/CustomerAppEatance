import { Spinner } from "native-base";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { EDColors } from "../utils/EDColors";
import LottieView from 'lottie-react-native';

export default class ProgressLoader extends React.Component {
    render() {
        return (
            <View style={STYLES.container}>
                <View style={STYLES.containerOpac} />
                {this.props.qrcode ?
                    <View style={STYLES.qrLoader}>
                        <LottieView
                            source={require('../assets/qr_loader.json')}
                            style={{ height: 150, width: 150 }}
                            autoPlay
                            loop
                            speed={1} />
                    </View> :
                    <Spinner style={STYLES.spinner} color={EDColors.primary} />
                }
            </View>
        );
    }
}

const STYLES = StyleSheet.create({
    container: {
        position: "absolute",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        zIndex: 997,
        flex: 1
    },
    containerOpac: {
        position: "absolute",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height + 100,
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 998
    },
    spinner: {
        flex: 1,
        alignSelf: "center",
        zIndex: 1000
    },
    qrLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
});



/* eslint-disable jsx-quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Image, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS } from 'react-native-permissions';
import Assets from '../assets';
import { strings } from '../locales/i18n';
import { showDialogue, showValidationAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import { checkPermission } from '../utils/PermissionServices';
import EDPopupView from './EDPopupView';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';
import EDUnderlineButton from './EDUnderlineButton';
import ImageResizer from 'react-native-image-resizer';


export default class EDProfilePicture extends Component {

    //#region LIFE CYCLE METHODS
    constructor(props) {
        super(props);
        this.options = {
            quality: 0.99,
            maxWidth: 500,
            maxHeight: 500,
            mediaType: "photo",
            rotation: 360,
            storageOptions: {
                skipBackup: true,
                path: 'images',
                cameraRoll: true,
                waitUntilSaved: true,
                privateDirectory: true,

            },
        };


    }

    launchCamera = () => {
        this.dismissImagePicker()
        setTimeout(() => {
            var paramPermission = Platform.OS == "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
            checkPermission(paramPermission, () => {
                launchCamera(this.options, this.onImageSelectionHandler)
            }, () => {
                showDialogue(
                    strings('cameraPermissionError'),
                    [{ text: strings("dialogCancel"), buttonColor: EDColors.offWhite ,  isNotPreferred : true }],
                    "",
                    () => {
                        if (Platform.OS == "ios")
                            Linking.openURL('app-settings:');
                        else
                            Linking.openSettings()
                    },
                );
            })
        }, 500);
    }

    launchGalleryPicker = () => {
        this.dismissImagePicker()
        setTimeout(() => {
            var paramPermission = Platform.OS == "ios" ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
            checkPermission(paramPermission,
                () => {
                    launchImageLibrary(this.options, this.onImageSelectionHandler);
                },
                () => {
                    showDialogue(
                        strings('mediaPermissionError'),
                        [{ text: strings("dialogCancel"), buttonColor: EDColors.offWhite ,  isNotPreferred : true }],
                        "",
                        () => {
                            if (Platform.OS == "ios")
                                Linking.openURL('app-settings:');
                            else
                                Linking.openSettings()
                        },
                    );
                })
        }, 500);
    }

    dismissImagePicker = () => {
        this.setState({ showImagePicker: false })
    }

    renderPickerModal = () => {
        return (
            <EDPopupView
                isModalVisible={this.state.showImagePicker}
                onRequestClose={this.dismissImagePicker}
            >
                <View style={styles.pickerPopUp}>
                    <EDRTLText title={strings('selectAvatar')} style={styles.pickerTitle} />
                    <TouchableOpacity onPress={this.launchCamera}>
                        <EDRTLView style={styles.optionContainer}>
                            <Icon name="camera" color={EDColors.primary} size={getProportionalFontSize(20)} />
                            <EDRTLText title={strings('capturePhoto')} style={styles.optionTitle} />
                        </EDRTLView>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.launchGalleryPicker}>
                        <EDRTLView style={styles.optionContainer} >
                            <Icon name="image" color={EDColors.primary} size={getProportionalFontSize(20)} />
                            <EDRTLText title={strings('selectFromLibrary')} style={styles.optionTitle} />
                        </EDRTLView>
                    </TouchableOpacity>
                    <EDUnderlineButton
                        label={
                            strings('dialogCancel')
                        }
                        textStyle={styles.cancel}
                        buttonStyle={{ alignSelf: isRTLCheck() ? 'flex-start' : 'flex-end' }}
                        onPress={this.dismissImagePicker}
                        viewStyle={{ borderBottomWidth: 0 }}
                    />
                </View>
            </EDPopupView>
        )
    }

    /** RENDER METHOD */
    render() {
        return (
            //  PARENT CONTAINER
            <View>

                {this.renderPickerModal()}
                <TouchableOpacity style={styles.touchableImageContainer} onPress={this.buttonChangeProfilePicturePressed}>

                    {/* PROFILE IMAGE  */}
                    {this.state.avatarSource || this.props.imagePath ?
                        <Image source={this.state.avatarSource
                            ? { uri: this.state.avatarSource.uri }
                            : this.props.imagePath
                                ? { uri: this.props.imagePath }
                                : this.props.placeholder || Assets.user_placeholder}
                            style={styles.profileImage}
                        />
                        :
                        <View style={styles.placeholderImage}>
                            <Icon
                                name="ios-shapes"
                                size={getProportionalFontSize(30)}
                                color={EDColors.grayNew}
                                type="ionicon"


                            />
                        </View>
                    }
                    {/* CAMERA ICON */}
                    <View style={styles.cameraIconContainer}>
                        <Icon
                            name={"photo-camera"}
                            size={getProportionalFontSize(15)}
                            color={EDColors.white}
                        />
                    </View>

                </TouchableOpacity>
            </View>
        );
    }

    state = {
        avatarSource: undefined,
        showImagePicker: false
    }
    //#endregion

    //#region
    /** BUTTON EVENTS */
    buttonChangeProfilePicturePressed = () => {
        this.setState({ showImagePicker: true })
       
    }
    //#endregion

    //#region HELPER FUNCTIONS
    /**
     *
     * @param {The image response received from image picker} response
     */
    onImageSelectionHandler = (response) => {
        debugLog("onImageSelectionHandler RESPONSE ::::", response)
        if (response.didCancel) {
        } else if (response.errorMessage) {
            showValidationAlert(response.errorMessage + '', true);
        } else if (response.assets !== undefined && response.assets.length > 0){
            this.resizeImage(response.assets[0].uri)
            // this.setState({ avatarSource: response.assets[0] });
            // if (this.props.onImageSelectionHandler !== undefined) {
            //     this.props.onImageSelectionHandler(response.assets[0]);
            // }
        }
    }

    resizeImage = (image) => {
        ImageResizer.createResizedImage(image, 500, 500, "JPEG", 50, 0, null, false).then(
            success => {
                this.setState({ avatarSource: success });
                if (this.props.onImageSelectionHandler !== undefined) {
                    this.props.onImageSelectionHandler(success);
                }
            }
        ).catch(
            err => showTopDialogue(err + '', true)
        )
    }
}

//#region STYLES
const styles = StyleSheet.create({
    touchableImageContainer: {
        alignSelf: 'center', marginVertical: 20,
    },

    placeholderImage: {
        width: Metrics.screenWidth * 0.20,
        height: Metrics.screenWidth * 0.20,
        borderRadius: 16,
        backgroundColor: EDColors.profileBG,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: -7.5,
        right: -7.5,
        width: getProportionalFontSize(30),
        height: getProportionalFontSize(30),
        backgroundColor: EDColors.blackSecondary,
        borderRadius: getProportionalFontSize(15),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: EDColors.white
    },
    pickerPopUp: {
        margin: 20,
        padding: 10,
        backgroundColor: EDColors.white
    },
    pickerTitle: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(20),
        color: EDColors.black,
        marginBottom: 10
    },
    optionTitle: {
        fontFamily: EDFonts.medium,
        fontSize: getProportionalFontSize(16),
        color: EDColors.black,
        marginHorizontal: 5
    },
    optionContainer: {
        alignItems: 'center',
        paddingVertical: 10
    },
    cancel: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(18),
        color: EDColors.black,
        alignSelf: "flex-end",
        borderBottomWidth: 0
    },

    profileImage: {
        borderWidth: 1,
        borderColor: EDColors.primary,
        width: Metrics.screenWidth * 0.20,
        height: Metrics.screenWidth * 0.20,
        borderRadius: 16,
        // transform: [{ rotate: '90deg' }]
    },


});
//#endregion


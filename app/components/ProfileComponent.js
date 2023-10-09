/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import EDRTLText from './EDRTLText';
import EDRTLView from './EDRTLView';

export default class ProfileComponent extends React.Component {
    //#region LIFE CYCLE METHODS

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.secondTextInputRef = React.createRef();
    }

    onChangeTextHandler = (newText) => {
        if (this.props.onChangeValue !== undefined) {
            this.props.onChangeValue(newText, this.props.identifier || '');
        }
    }

    /** RENDER FUNCTION */
    render() {
        return (
            <EDRTLView style={styles.mainContainer}>

                {/* LEFT IMAGE */}
                <Icon
                    name={this.props.source}
                    color={EDColors.primary}
                    containerStyle={{ marginHorizontal: 10, alignSelf: "center" }}
                    type={this.props.type || 'material'}
                    size={this.props.size || getProportionalFontSize(20)}
                />

                {/* SEPARATOR */}
                {this.props.isNotification ? null : (<View style={[styles.separator, { left: isRTLCheck() ? 0 : 40, right: isRTLCheck() ? 40 : 0 }]} />)}

                {/* CHECK IF IT'S A TEXT OR TEXT INPUT */}
                {this.props.isText
                    ? <EDRTLText style={styles.titleStyle} title={this.props.text} />
                    : <TextInput
                        style={[styles.titleStyle, { textAlign: isRTLCheck() ? 'right' : 'left' }]}
                        ref={this.assignRefSecondTextInput}
                        maxLength={40}
                        numberOfLines={1}
                        placeholder={this.props.placeholder}
                        onChangeText={this.onChangeTextHandler}>
                        {this.props.text}
                    </TextInput>
                }

                {/* RENDER EDIT ICON OR NOTIFICATION SWTICH */}
                {this.props.isHidden
                    ? <TouchableOpacity
                        onPress={this.onPressHandler}>
                        <Icon
                            name={"edit"}
                            size={18}
                            color={EDColors.text}
                        />
                    </TouchableOpacity>
                    : this.props.isNotification
                        ? <Switch
                            onTintColor={EDColors.error}
                            trackColor={EDColors.error}
                            style={styles.notificationSwitch}
                            value={this.props.value}
                            onValueChange={this.props.onValueChange} />
                        : null}
            </EDRTLView>
        );
    }
    //#endregion

    //#region HELPER METHODS
    assignRefSecondTextInput = (input) => {
        this.secondTextInput = input;
    }

    onPressHandler = () => {
        if (this.props.isTouchable) {
            this.secondTextInput.focus();
        } else {
            this.props.onPress()
        }
    }
}

//#region STYLES
const styles = StyleSheet.create({
    mainContainer: { alignItems: 'center', height: heightPercentageToDP('6.5%') },
    leftImage: { marginHorizontal: 10, height: 20, width: 20, tintColor: EDColors.primary, alignSelf: 'center' },
    separator: { position: 'absolute', backgroundColor: EDColors.separatorColor, height: 1, bottom: 1 },
    titleStyle: { fontSize: getProportionalFontSize(14), fontFamily: EDFonts.regular, flex: 1, color: EDColors.textAccount },
    editIcon: { marginHorizontal: 5, tintColor: EDColors.pencilColor },
    notificationSwitch: { alignSelf: 'center', marginHorizontal: 5 },
});
//#endregion

import React from 'react'
import { TouchableOpacity } from 'react-native'
import { FlatList, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'
import { EDColors } from '../utils/EDColors'
import { getProportionalFontSize } from '../utils/EDConstants'
import { EDFonts } from '../utils/EDFontConstants'
import EDRTLText from './EDRTLText'
import EDRTLView from './EDRTLView'
export default class EDCustomRadioComponent extends React.Component {
    data = this.props.data

    state = {
        selectedIndex: this.props.selectedIndex || 0
    }
    render() {
        return (
            <FlatList
                data={this.data}
                keyExtractor={(item, index) => index}
                renderItem={this.renderRadioItem}
                showsVerticalScrollIndicator={false}
            />
        )
    }

    renderRadioItem = (data) => {
        return (
            <TouchableOpacity onPress={() => this.onSelectedIndex(data.index)}>
                <EDRTLView style={[styles.container, {
                    backgroundColor: this.state.selectedIndex == data.index ? EDColors.radioSelected : EDColors.transparent
                }]}>
                    {this.props.icon ?
                        <Icon name={this.props.icon} color={EDColors.primary} />
                        : null}
                    <EDRTLText title={data.item[this.props.keyName || "name"]} style={[styles.title, {
                        color: this.state.selectedIndex == data.index ? EDColors.black : EDColors.blackSecondary
                    }]} />
                </EDRTLView>
            </TouchableOpacity>
        )
    }

    onSelectedIndex = (value) => {
        this.props.onSelected(value)
        this.setState({
            selectedIndex: value
        })
    }
}

const styles = StyleSheet.create({
    title: {
        fontFamily: EDFonts.semiBold,
        fontSize: getProportionalFontSize(16)
    },
    container: {
        alignItems: "center",
        padding: 15,
        borderRadius: 16
    }
})
import React, { Component } from "react";
import { FlatList, StyleSheet } from 'react-native';
import { strings } from "../locales/i18n";
import { EDColors } from "../utils/EDColors";
import { getProportionalFontSize, isRTLCheck } from "../utils/EDConstants";
import { EDFonts } from "../utils/EDFontConstants";
import EDRTLText from "./EDRTLText";
import HomeCategoryCard from "./HomeCategoryCard";

export default class EDRestaurantDeatilsFlatList extends Component {
    render() {
        return (

            this.props.arrayCategories !== undefined &&
                this.props.arrayCategories !== null &&
                this.props.arrayCategories.length !== 0 ?
                <>
                    <EDRTLText title={strings("categoryInHome")} style={styles.title} />
                    <FlatList
                        style={{ marginStart: 10, marginEnd: 10 }}
                        horizontal={true}
                        inverted={isRTLCheck()}

                        extraData={this.state}
                        data={this.props.arrayCategories}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => item + index}
                        renderItem={this.renderCategoryList}
                    />
                </> : null

        )
    }


    renderCategoryList = (item, index) => {
        return (
            <HomeCategoryCard
                categoryObjModel={item}
                onPress={model => { this.props.onCategoryPressed(item) }}
                isSelected={this.props.modelSelected == item.item.category_id ? true : false}
            />
        );
    }
}

const styles = StyleSheet.create({
    title: {
        fontFamily: EDFonts.bold,
        fontSize: getProportionalFontSize(18),
        color: EDColors.black,
        marginVertical: 10,
        marginHorizontal: 15
    }
})
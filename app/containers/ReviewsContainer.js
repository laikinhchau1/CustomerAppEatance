import React from 'react';
import { connect } from 'react-redux';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDReviewListComponent from '../components/EDReviewListComponent';
import { strings } from '../locales/i18n';
import { isRTLCheck, RESPONSE_SUCCESS } from '../utils/EDConstants';
import { netStatus } from '../utils/NetworkStatusConnection';
import { getReviewsAPI } from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';

export class ReviewsContainer extends React.Component {

    resId = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.resid : ""
    content_id = this.props.navigation.state.params !== undefined && this.props.navigation.state.params !== null ? this.props.navigation.state.params.content_id : null
    strOnScreenMessage = '';
    strOnScreenSubtitle = '';
    reviewsArray = undefined

    //#region STATE
    state = {
        isLoading: false
    }
    //#endregion

    //#region  Connectivity
    networkConnectivityStatus = () => {
        if (this.reviewsArray == undefined)
            this.getResReviews()
    }

    componentDidMount = () => {
        this.getResReviews();
    }
    //#endregion

    //#region Navbar Buttons
    _onLeftPressed = () => {
        this.props.navigation.goBack();
    }

    //#endregion

    /** GET RES REVIEWS */
    getResReviews() {
        this.strOnScreenMessage = '';
        this.strOnScreenSubtitle = '';

        netStatus(isConnected => {
            if (isConnected) {
                this.setState({ isLoading: true });
                let param = {
                    language_slug: this.props.lan,
                    restaurant_id: this.resId,
                    content_id: this.content_id,
                }
                getReviewsAPI(param, this.onSuccessGetReview, this.onFailureGetReview);
            } else {
                this.strOnScreenMessage = strings("noInternetTitle");
                this.strOnScreenSubtitle = strings("noInternet");
            }
        })
    }

    onSuccessGetReview = (onSuccess) => {
        if (onSuccess.status == RESPONSE_SUCCESS) {
            if (onSuccess.reviews !== undefined && onSuccess.reviews !== null && onSuccess.reviews.length !== 0)
                this.reviewsArray = onSuccess.reviews.reverse()
            else
                this.strOnScreenMessage = strings('noReviews');
        }
        else {
            this.strOnScreenMessage = strings('noDataFound');
        }
        this.setState({ isLoading: false })
    }
    onFailureGetReview = onFailure => {
        this.strOnScreenMessage = onFailure.response != undefined ? onFailure.response : strings("generalWebServiceError")
        this.setState({ isLoading: false })
    }
    //#endregion

    //#region  Render
    render() {
        return (
            <BaseContainer
                title={strings("reviewsTitle")}
                left={isRTLCheck() ? 'arrow-forward' : 'arrow-back'}
                right={[]}
                onLeft={this._onLeftPressed}
                onConnectionChangeHandler={this.networkConnectivityStatus}
                loading={this.state.isLoading}>

                {this.reviewsArray != undefined && this.reviewsArray != null && this.reviewsArray.length > 0 ? (
                    <EDReviewListComponent
                        data={this.reviewsArray}
                    />
                ) : (this.strOnScreenMessage || '').trim().length > 0 ? (
                    <EDPlaceholderComponent
                        style={{ marginVertical: 10 }}
                        title={this.strOnScreenMessage}
                    />) : null}
            </BaseContainer>
        )
    }
    //#endregion
}
//#region  REDUX

export default connect(
    state => {
        return {
            lan: state.userOperations.lan,
        };
    },
    dispatch => {
        return {
        };
    }
)(ReviewsContainer);

//#endregion
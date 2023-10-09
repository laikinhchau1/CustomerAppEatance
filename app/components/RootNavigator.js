import React from "react";
import { createAppContainer, withNavigation } from "react-navigation";
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import AddressListContainer from "../containers/AddressListContainer";
import AddressMapContainer from "../containers/AddressMapContainer";
import BookingAvailabilityContainer from "../containers/BookingAvailabilityContainer";
import BookingSuccessContainer from "../containers/BookingSuccessContainer";
import CartContainer from "../containers/CartContainer";
import CategoryDetailContainer from "../containers/CategoryDetailContainer";
import ChangePasswordContainer from "../containers/ChangePasswordContainer";
import CheckOutContainer from "../containers/CheckOutContainer";
import CMSContainer from "../containers/CMSContainer";
import DetailedAddressListContainer from '../containers/DetailedAddressListContainer';
import EventBookContainer from "../containers/EventBookContainer";
import FAQsContainer from "../containers/FAQsContainer";
import FilterContainer from "../containers/FilterContainer";
import LoginContainer from "../containers/LoginContainer";
import MainContainer from "../containers/MainContainer";
import MyBookingContainer from "../containers/MyBookingContainer";
import MyOrderContainer from "../containers/MyOrderContainer";
import NotificationList from "../containers/NotificationList";
import OrderConfirm from "../containers/OrderConfirm";
import OrderDetailContainer from "../containers/OrderDetailContainer";
import PasswordRecoveryContainer from "../containers/PasswordRecoveryContainer";
import PaymentGatewayContainer from "../containers/PaymentGatewayContainer";
import ProfileContainer from "../containers/ProfileContainer";
import PromoCode from "../containers/PromoCode";
import RecipeContainer from "../containers/RecipeContainer";
import RecipeDetail from "../containers/RecipeDetail";
import Restaurant from "../containers/Restaurant";
import ReviewsContainer from "../containers/ReviewsContainer";
import SearchLocationContainer from "../containers/SearchLocationContainer";
import SignupContainer from "../containers/SignupContainer";
import SplashContainer from "../containers/SplashConainer";
import TrackOrderContainer from "../containers/TrackOrderContainer";
import metrics from "../utils/metrics";
import SideBar from "./SideBar";

const MAIN_NAVIGATOR = createStackNavigator(
    {
        MainContainer: {
            screen: MainContainer
        },
        searchLocation: {
            screen: SearchLocationContainer
        },
        RestaurantContainer: {
            screen: Restaurant
        },
        ReviewContainer: {
            screen: ReviewsContainer
        },
        RecipeDetail: {
            screen: RecipeDetail
        },
        ProfileContainer: {
            screen: ProfileContainer
        },
        ChangePasswordContainer: {
            screen: ChangePasswordContainer
        },
        Filter: {
            screen: FilterContainer
        },
        CartContainer: {
            screen: CartContainer
        },
        PromoCodeContainer: {
            screen: PromoCode
        },
        AddressListContainer: {
            screen: AddressListContainer
        },
        AddressMapContainer: {
            screen: AddressMapContainer
        },
        DetailedAddressListContainer: {
            screen: DetailedAddressListContainer
        },
        PaymentGatewayContainer: {
            screen: PaymentGatewayContainer
        },
        CheckOutContainer: {
            screen: CheckOutContainer
        },
        OrderConfirm: {
            screen: OrderConfirm
        },
        SplashContainer: {
            screen: SplashContainer
        },
        LoginContainer: {
            screen: LoginContainer
        },
        CategoryDetailContainer: {
            screen: CategoryDetailContainer
        },

        
    },
    {
        initialRouteName: "MainContainer",
        headerMode: "none"
    }
);

const RECIPE_NAVIGATOR = createStackNavigator(
    {
        RecipeContainer: {
            screen: RecipeContainer
        },
        CategoryFromRecipe: {
            screen: CategoryDetailContainer
        },
        FilterContainer: {
            screen: Restaurant
        },
        RecipeDetail: {
            screen: RecipeDetail
        },
        Filter: {
            screen: FilterContainer
        }
    },
    {
        initialRouteName: "RecipeContainer",
        headerMode: "none"
    }
);

const EVENT_NAVIGATOR = createStackNavigator(
    {
        EventContainer: {
            screen: BookingAvailabilityContainer
        },
        searchLocation: {
            screen: SearchLocationContainer
        },
        EventBookContainer: {
            screen: EventBookContainer
        },
        ReviewContainer: {
            screen: ReviewsContainer
        },
        BookingSuccess: {
            screen: BookingSuccessContainer
        }
    },
    {
        initialRouteName: "EventContainer",
        headerMode: "none"
    }
);

const MY_BOOKING_NAVIGATOR = createStackNavigator(
    {
        MyBookingContainer: {
            screen: MyBookingContainer
        },

        SplashContainer: {
            screen: SplashContainer
        }
    },
    {
        initialRouteName: "MyBookingContainer",
        headerMode: "none"
    }
);

const MY_ORDER_NAVIGATOR = createStackNavigator(
    {
        MyOrderContainer: {
            screen: MyOrderContainer
        },
        TrackOrderContainer: {
            screen: TrackOrderContainer
        },
        ProfileContainer: {
            screen: ProfileContainer
        },
        AddressListContainer: {
            screen: AddressListContainer
        },
        DetailedAddressListContainer: {
            screen: DetailedAddressListContainer
        },
        AddressMapContainer: {
            screen: AddressMapContainer
        },
        OrderDetailContainer: {
            screen: OrderDetailContainer
        }

    },
    {
        initialRouteName: "MyOrderContainer",
        headerMode: "none"
    }
);


const NOTIFICATION_NAVIGATOR = createStackNavigator(
    {
        NotificationContainer: {
            screen: NotificationList
        }
    },
    {
        initialRouteName: "NotificationContainer",
        headerMode: "none"
    }
);



export const HOME_SCREEN_DRAWER = createDrawerNavigator(
    {
        Home: {
            screen: MAIN_NAVIGATOR
        },
        Recipe: {
            screen: RECIPE_NAVIGATOR
        },
        Event: {
            screen: EVENT_NAVIGATOR
        },
        MyBooking: {
            screen: MY_BOOKING_NAVIGATOR
        },
        Notification: {
            screen: NOTIFICATION_NAVIGATOR
        },
        Order: {
            screen: MY_ORDER_NAVIGATOR
        },
        CMSContainer: {
            screen: CMSContainer
        },
        FAQs: {
            screen: FAQsContainer
        }
    },
    {
        initialRouteName: "Home",
        initialRouteParams: "Home",
        drawerLockMode: "locked-closed",
        drawerWidth: metrics.screenWidth * .66,
        contentComponent: props => <SideBar {...props} />
    }
);

export const HOME_SCREEN_RIGHT_DRAWER = createDrawerNavigator(
    {
        Home: {
            screen: MAIN_NAVIGATOR
        },
        Recipe: {
            screen: RECIPE_NAVIGATOR
        },
        Event: {
            screen: EVENT_NAVIGATOR
        },
        MyBooking: {
            screen: MY_BOOKING_NAVIGATOR
        },
        Notification: {
            screen: NOTIFICATION_NAVIGATOR
        },
        Order: {
            screen: MY_ORDER_NAVIGATOR
        },
        CMSContainer: {
            screen: CMSContainer
        },
        FAQs: {
            screen: FAQsContainer
        }
    },
    {
        initialRouteName: "Home",
        initialRouteParams: "Home",
        drawerLockMode: "locked-closed",
        drawerPosition: 'right',
        drawerWidth: metrics.screenWidth * .66,
        contentComponent: props => <SideBar {...props} />
    }
);

export const BASE_STACK_NAVIGATOR = createStackNavigator(
    {

        SplashContainer: {
            screen: SplashContainer
        },
        LoginContainer: {
            screen: LoginContainer
        },
        SignupContainer: {
            screen: SignupContainer
        },
        CMSContainer: {
            screen: CMSContainer
        },
        MainContainer: {
            screen: HOME_SCREEN_DRAWER
        },
        MainContainer_Right: {
            screen: HOME_SCREEN_RIGHT_DRAWER
        },
        MY_ORDER_NAVIGATOR: {
            screen: MyOrderContainer
        },
     
       
        PasswordRecovery: {
            screen: PasswordRecoveryContainer
        }
    },
    {
        initialRouteName: "SplashContainer",
        headerMode: "none"
    }
);

export const BASE_NAVIGATOR = createAppContainer(withNavigation(BASE_STACK_NAVIGATOR));
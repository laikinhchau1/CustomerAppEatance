// It is used when we have to navigate to a screen from a file which is not in our Root navigator
// We have used it in our App.js file.
import { NavigationActions, StackActions } from "react-navigation";
import { debugLog, isRTLCheck } from "./app/utils/EDConstants";

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigateToSpecificRoute(specifiedRouteName) {

  // CHANGE THE ROOT SCREEN
  if (_navigator !== undefined && _navigator !== null)
    setTimeout(() => {
      _navigator.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: isRTLCheck() ? "MainContainer_Right" : "MainContainer" })]
        })
      );

      _navigator.dispatch(
        NavigationActions.navigate({
          routeName: specifiedRouteName
        })
      );
    }, 0)
}

function navigateToRoute(specifiedRouteName) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName: specifiedRouteName,
    })
  );
}


function navigate(routeName, action) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      action,
    }));
}

function getCurrentRoute() {
  let route = {}
  if (_navigator !== undefined && _navigator !== null &&
    _navigator.state !== undefined && _navigator.state !== null) {
    route = _navigator.state.nav
    while (route.routes) {
      route = route.routes[route.index]
    }
  }
  return route
}


// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
  navigateToSpecificRoute,
  navigateToRoute,
  getCurrentRoute
};

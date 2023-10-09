import { PERMISSIONS, check, RESULTS, request } from 'react-native-permissions';

export async function requestLocationPermission(paramPermission,onSuccess, onFailure) {

    request(paramPermission)
        .then((result) => {
            switch (result) {
                case RESULTS.UNAVAILABLE:
                    onFailure(result)
                    break;
                case RESULTS.DENIED:
                    onFailure(result)
                    break;
                case RESULTS.GRANTED:
                    onSuccess(result)
                    break;
                case RESULTS.BLOCKED:
                    onFailure(result)
                    break;
            }
        })
}

export async function checkLocationPermission(paramPermission, onSuccess, onFailure) {

    check(paramPermission)
        .then((result) => {
            switch (result) {
                case RESULTS.UNAVAILABLE:
                    requestLocationPermission(paramPermission, onSuccess, onFailure)
                    break;
                case RESULTS.DENIED:
                    requestLocationPermission(paramPermission, onSuccess, onFailure)
                    break;
                case RESULTS.GRANTED:
                    requestLocationPermission(paramPermission, onSuccess, onFailure)
                    break;
                case RESULTS.BLOCKED:
                    requestLocationPermission(paramPermission, onSuccess, onFailure)
                    break;
            }
        })
}
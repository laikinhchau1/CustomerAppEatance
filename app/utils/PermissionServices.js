import { check, request, RESULTS } from 'react-native-permissions';

export async function requestPermission(paramPermission, onSuccess, onFailure) {
    request(paramPermission)
        .then((result) => {
            switch (result) {
                case RESULTS.UNAVAILABLE: {
                    console.log('::: REQUEST UNAVAILABLE :::')
                    onFailure(result)
                    break;
                }
                case RESULTS.DENIED: {
                    console.log('::: REQUEST DENIED :::')
                    onFailure(result)
                    break;
                }
                case RESULTS.GRANTED: {
                    console.log('::: REQUEST GRANTED :::')
                    onSuccess(result)
                    break;
                }
                case RESULTS.BLOCKED: {
                    console.log('::: REQUEST BLOCKED :::')
                    onFailure(result)
                    break;
                }
            }
        })
}

export async function checkPermission(paramPermission, onSuccess, onFailure) {
    console.log("::: CHECK paramPermission :::", paramPermission)

    check(paramPermission)
        .then((result) => {
            switch (result) {
                case RESULTS.UNAVAILABLE: {
                    console.log("::: CHECK UNAVAILABLE :::")
                    requestPermission(paramPermission, onSuccess, onFailure)
                    break;
                }
                case RESULTS.DENIED: {
                    console.log("::: CHECK DENIED :::")
                    requestPermission(paramPermission, onSuccess, onFailure)
                    break;
                }
                case RESULTS.GRANTED: {
                    console.log("::: CHECK GRANTED :::")
                    onSuccess(result)
                    // requestPermission(paramPermission, onSuccess, onFailure)
                    break;
                }
                case RESULTS.BLOCKED: {
                    console.log("::: CHECK BLOCKED :::")
                    onFailure(result)
                    // requestPermission(paramPermission, onSuccess, onFailure)
                    break;
                }
            }
        })
}
// import { check, request, RESULTS } from 'react-native-permissions';

// export async function requestPermission(paramPermission,onSuccess, onFailure) {
//     request(paramPermission)
//         .then((result) => {
//             switch (result) {
//                 case RESULTS.UNAVAILABLE:
//                     onFailure(result)
//                     break;
//                 case RESULTS.DENIED:
//                     onFailure(result)
//                     break;
//                 case RESULTS.GRANTED:
//                     onSuccess(result)
//                     break;
//                 case RESULTS.BLOCKED:
//                     onFailure(result)
//                     break;
//             }
//         })
// }

// export async function checkPermission(paramPermission, onSuccess, onFailure) {
//     check(paramPermission)
//         .then((result) => {
//             switch (result) {
//                 case RESULTS.UNAVAILABLE:
//                     requestPermission(paramPermission, onSuccess, onFailure)
//                     break;
//                 case RESULTS.DENIED:
//                     requestPermission(paramPermission, onSuccess, onFailure)
//                     break;
//                 case RESULTS.GRANTED:
//                     requestPermission(paramPermission, onSuccess, onFailure)
//                     break;
//                 case RESULTS.BLOCKED:
//                     requestPermission(paramPermission, onSuccess, onFailure)
//                     break;
//             }
//         })
// }
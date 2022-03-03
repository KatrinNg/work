import * as redesignBookingActionType from './redesignBookingActionType';

// export const redesignListAppointment = (params, callback = null) => {
//     return {
//         type: redesignBookingActionType.REDESIGN_LIST_APPOINTMENT,
//         params,
//         callback
//     };
// };

export const redesignListRemarkCode = (params) => {
    return {
        type: redesignBookingActionType.REDESIGN_LIST_REMARK_CODE,
        params: params
    };
};

export const bookConfirm = (params, callback) => {
    return {
        type: redesignBookingActionType.REDESIGN_BOOK_CONFIRM,
        params,
        callback
    };
};
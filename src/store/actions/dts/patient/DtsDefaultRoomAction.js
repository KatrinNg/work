import * as defaultRoomType from './DtsDefaultRoomActionType';

export const resetAll = () => {
    return {
        type: defaultRoomType.RESET_ALL
    };
};

export const updateState = updateData => {
    return {
        type: defaultRoomType.UPDATE_STATE,
        updateData
    };
};

export const resetDialogInfo = () => {
    return {
        type: defaultRoomType.RESET_DIALOGINFO
    };
};

export const putDefaultRoom = (defaultRoom, callback = null) => {
    return {
        type: defaultRoomType.PUT_DEFAULT_ROOM,
        defaultRoom,
        callback
    };
};

export const deleteDefaultRoom = (defaultRoomId, callback = null) => {
    return {
        type: defaultRoomType.DELETE_DEFAULT_ROOM,
        defaultRoomId,
        callback
    };
};

// export const putDefaultRoomList = (defaultRoomList, callback = null) => {
//     return {
//         type: defaultRoomType.PUT_DEFAULT_ROOM_LIST,
//         defaultRoomList,
//         callback
//     };
// };

// export const getDefaultRoom = (defaultRoomId) => {
//     return {
//         type: defaultRoomType.GET_DEFAULT_ROOM,
//         defaultRoomId
//     };
// };

export const getDefaultRoomList = (patientKey, activeOnly) => {
    return {
        type: defaultRoomType.GET_DEFAULT_ROOM_LIST,
        patientKey,
        activeOnly
    };
};

export const getDefaultRoomLogList = defaultRoomId => {
    return {
        type: defaultRoomType.GET_DEFAULT_ROOM_LOG_LIST,
        defaultRoomId
    };
};

export const getGdDefaultRoom = params => {
    return {
        type: defaultRoomType.GET_GD_DEFAULT_ROOM,
        params
    };
};

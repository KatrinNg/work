const PREFFIX = 'ROOM_MANAGEMENT';
export const RESET_ALL = `${PREFFIX}_RESET_ALL`;
export const RESET_ROOM_DATA = `${PREFFIX}_RESET_ROOM_DATA`;
export const UPDATE_STATE = `${PREFFIX}_UPDATE_STATE`;
export const GET_ENCT_LIST = `${PREFFIX}_GET_ENCT_LIST`;
export const PUT_ENCT_LIST = `${PREFFIX}_PUT_ENCT_LIST`;
export const GET_ROOMS = `${PREFFIX}_GET_ROOMS`;
export const PUT_ROOMS = `${PREFFIX}_PUT_ROOMS`;
export const GET_ROOM_BY_ID = `${PREFFIX}_GET_ROOM_BY_ID`;
export const LOAD_ROOM_DATA = `${PREFFIX}_LOAD_ROOM_DATA`;
export const CREATE_ROOM = `${PREFFIX}_CREATE_ROOM`;
export const UPDATE_ROOM = `${PREFFIX}_UPDATE_ROOM`;
export const DELETE_ROOM = `${PREFFIX}_DELETE_ROOM`;

export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};

export const updateState = (updateData) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_STATE,
            updateData
        });
        return Promise.resolve();
    };
};

export const getEnctList = () => {
    return {
        type: GET_ENCT_LIST
    };
};

export const listRoom = () => {
    return {
        type: GET_ROOMS
    };
};

export const getRoomById = (rmId) => {
    return {
        type: GET_ROOM_BY_ID,
        rmId
    };
};

export const createRoom = (params) => {
    return {
        params,
        type: CREATE_ROOM
    };
};

export const updateRoom = (params) => {
    return {
        params,
        type: UPDATE_ROOM
    };
};

export const deleteRoom = (params) => {
    return {
        params,
        type: DELETE_ROOM
    };
};



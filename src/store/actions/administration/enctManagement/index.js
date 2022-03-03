const PREFFIX = 'ENCT_MANAGEMENT';
export const RESET_ALL = `${PREFFIX}_RESET_ALL`;
export const UPDATE_STATE = `${PREFFIX}_UPDATE_STATE`;
export const GET_ENCT_LIST = `${PREFFIX}_GET_ENCT_LIST`;
export const UPDATE_ENCT_LIST = `${PREFFIX}_UPDATE_ENCT_LIST`;
export const INIT_ENCT_INFO = `${PREFFIX}_INIT_ENCT_INFO`;
export const INIT_ROOMS = `${PREFFIX}_INIT_ROOMS`;
export const LOAD_ROOMS = `${PREFFIX}_LOAD_ROOMS`;
export const CREATE_ENCT = `${PREFFIX}_CREATE_ENCT`;
export const GET_ENCT_BY_ID = `${PREFFIX}_GET_ENCT_BY_ID`;
export const INSERT_ENCT = `${PREFFIX}_INSERT_ENCT`;
export const UPDATE_ENCT = `${PREFFIX}_UPDATE_ENCT`;
export const DELETE_ENCT = `${PREFFIX}_DELETE_ENCT`;

export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};

export const updateState = (updateData) => {
    return {
        type: UPDATE_STATE,
        updateData
    };
};

export const getEnctList = () => {
    return {
        type: GET_ENCT_LIST
    };
};

export const getEnctById = (encntrTypeId) => {
    return {
        type: GET_ENCT_BY_ID,
        encntrTypeId
    };
};

export const createEnct = () => {
    return {
        type: CREATE_ENCT
    };
};

export const insertEnct = (enctDto) => {
    return {
        type: INSERT_ENCT,
        enctDto
    };
};


export const updateEnct = (enctDto) => {
    return {
        type: UPDATE_ENCT,
        enctDto
    };
};


export const deleteEnct = (encntrTypeIds) => {
    return {
        type: DELETE_ENCT,
        encntrTypeIds
    };
};

export const initRooms = () => {
    return {
        type: INIT_ROOMS
    };
};
const PREFFIX = 'APPOINTMENT_GENERATETIMESLOT';
export const RESET_ALL = `${PREFFIX}_RESET_ALL`;
export const INIT_PAGE = `${PREFFIX}_INIT_PAGE`;
export const UPDATE_STATE = `${PREFFIX}_UPDATE_STATE`;
export const GENERATE_TIMESLOT = `${PREFFIX}_GENERATE_TIMESLOT`;
export const PUT_TEMPLATE_DATA = `${PREFFIX}_PUT_TEMPLATE_DATA`;
export const UPDATE_TEMPLATELIST = `${PREFFIX}_UPDATE_TEMPLATELIST`;

export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};

export const initPage = () => {
    return {
        type: INIT_PAGE
    };
};

export const updateState = (updateData) => {
    return {
        type: UPDATE_STATE,
        updateData
    };
};


export const generateTimeSlot = (params) => {
    return {
        type: GENERATE_TIMESLOT,
        params
    };
};

export const updateTemplateList = () => {
    return {
        type: UPDATE_TEMPLATELIST
    };
};
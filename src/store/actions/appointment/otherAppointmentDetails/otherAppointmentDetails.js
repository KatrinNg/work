const PRE = 'FHS_OTHER_APPOINTMENT';

export const LIST_OTHER_APPOINTMENT_TYPE=`${PRE}_LIST_OTHER_APPOINTMENT_TYPE`;
export const LIST_OTHER_APPOINTMENT_DETAILS = `${PRE}_LIST_OTHER_APPOINTMENT_DETAILS`;
export const LIST_OTHER_APPOINTMENT_DETAILS_LOG = `${PRE}_LIST_OTHER_APPOINTMENT_DETAILS_LOG`;
export const SAVE_OTHER_APPOINTMENT_DETAILS = `${PRE}_SAVE_OTHER_APPOINTMENT_DETAILS`;


export const listOtherAppointmentType=(params,callback)=>{
    return {
        type:LIST_OTHER_APPOINTMENT_TYPE,
        params,
        callback
    };
};

export const listOtherAppointmentDetail = (params, callback) => {
    return {
        type: LIST_OTHER_APPOINTMENT_DETAILS,
        params,
        callback
    };
};

export const listOtherAppointmentDetailLog = (params, callback) => {
    return {
        type: LIST_OTHER_APPOINTMENT_DETAILS_LOG,
        params,
        callback
    };
};

export const saveOtherAppointmentDetails = (params, callback) => {
    return {
        type: SAVE_OTHER_APPOINTMENT_DETAILS,
        params,
        callback
    };
};
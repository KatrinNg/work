import * as type from './apptEnquiryActionType';


export const restAll = () => {
    return ({
        type: type.RESET_ALL
    });
};

export const updateField = (updateData) => {
    return {
        type: type.UPDATE_FIELD,
        updateData
    };
};

export const fetchEnquiryResult = (param) => {
    return {
        type: type.FETCH_ENQUIRY_RESULT,
        param
    };
};

export const loadEnquiryResult = (result) => {
    return {
        type: type.LOAD_ENQUIRY_RESULT,
        result
    };
};

export const printApptReport = (param, callback) => {
    return {
        type: type.PRINT_APPT_REPORT,
        param,
        callback
    };
};
import * as actionType from './gscEnquiryActionType';

export const getGscEnquiry = ({ params = {}, callback }) => {
    return {
        type: actionType.GET_GSC_ENQUIRY,
        params,
        callback
    };
};
export const getGscEnquiryReport = ({ params = {}, callback }) => {
    return {
        type: actionType.GET_GSC_ENQUIRY_REPORT,
        params,
        callback
    };
};
export const saveGscEnquiry = ({ params = {}, callback }) => {
    return {
        type: actionType.SAVE_GSC_ENQUIRY,
        params,
        callback
    };
};
export const saveGscEnquiryReport = ({ params = {}, callback }) => {
    return {
        type: actionType.SAVE_GSC_ENQUIRY_REPORT,
        params,
        callback
    };
};
export const getGscEnquirySelect = ({ params = {}, callback }) => {
    return {
        type: actionType.GET_GSC_ENQUIRY_SELECT,
        params,
        callback
    };
};
export const printChtGspdReport = ({ params = {}, callback }) => {
    return {
        type: actionType.PRINT_CHT_GSPD_REPORT,
        params,
        callback
    };
};

export const getGscEnquirySaveViewLog = (updateData) => {
    return ({
        type: actionType.GSC_ENQUIRY_SAVE_VIEW_LOG,
        updateData
    });
};

export const saveClinicalDoc = ({ params = {}, callback }) => {
    return {
        type: actionType.SAVE_GSC_CLINICAL_DOC,
        params,
        callback
    };
};

export const getClinicalDoc = ({ params = {}, callback }) => {
    return {
        type: actionType.GET_CLINICAL_DOC_LOAD,
        params,
        callback
    };
};


export const saveLabReportCreate = ({ params = {}, callback }) => {
    return {
        type: actionType.SAVE_GSC_LAB_REPORT_CREATE,
        params,
        callback
    };
};

export const saveLabReport = ({ params = {}, callback }) => {
    return {
        type: actionType.SAVE_GSC_LAB_REPORT,
        params,
        callback
    };
};

export const getLabReportPatientKey = ({ params = {}, callback }) => {
    return {
        type: actionType.GET_GSC_LAB_REPORT_PATIENTKEY,
        params,
        callback
    };
};

export const getGscLabReportPdf = ({ params = {}, callback }) => {
    return {
        type: actionType.GET_GSC_LAB_REPORT_PDF,
        params,
        callback
    };
};

export const getGscReferralLetter = ({ params = {}, callback }) => {
    return {
        type: actionType.GET_GSC_REFERRAL_LETTER,
        params,
        callback
    };
};

export const saveGscReferralLetter = ({ params = {}, callback }) => {
    return {
        type: actionType.SAVE_GSC_REFERRAL_LETTER,
        params,
        callback
    };
};

export const getHospitalList = ({ callback }) => {
    return {
        type: actionType.GET_GSC_HOSPITAL_LIST,
        callback
    };
};
export const getScReferralLetterPrintData = ({params={}, callback }) => {
    return {
        type: actionType.GET_GSC_REFERRAL_LETTER_PRINT_DATA,
        params,
        callback
    };
};
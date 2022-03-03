import * as clinicalDocActionType from './clinicalDocActionType';

export const uploadDocument = (params, callback = null) => {
    return {
        type: clinicalDocActionType.UPLOAD_DOCUMENT,
        params,
        callback
    };
};

export const getDocumentList = (patientKey) => {
    return {
        type: clinicalDocActionType.GET_DOCUMENT_LIST,
        patientKey: patientKey
    };
};

export const getEncntrDocumentList = (patientKey, encntrId) => {
    return {
        type: clinicalDocActionType.GET_ENCNTR_DOCUMENT_LIST,
        patientKey: patientKey,
        encntrId: encntrId
    };
};

export const getSingleDocument = (inDocId, callback) => {
    return {
        type: clinicalDocActionType.GET_SINGLE_DOCUMENT,
        inDocId: inDocId,
        callback: callback
    };
};

export const getDocumentTypeList = (svcCd) => {
    return {
        type: clinicalDocActionType.GET_DOCUMENT_TYPE_LIST,
        svcCd: svcCd
    };
};

export const deleteSingleDocument = (inDocumentDto) => {
    return {
        type: clinicalDocActionType.DELETE_SINGLE_DOCUMENT,
        inDocumentDto: inDocumentDto
    };
};




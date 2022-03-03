import * as clinicalDocActionType from '../../actions/clinicalDoc/clinicalDocActionType';

const initState = {
    clinicalDocList: [],
    clinicalEncntrDocList: [],
    clinicalDocTypeList: [],
    currentPDFViewerDoc: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case clinicalDocActionType.SAVE_DOCUMENT_LIST: {
            return {
                ...state,
                clinicalDocList: action.data
            };
        }
        case clinicalDocActionType.SAVE_ENCNTR_DOCUMENT_LIST: {
            return {
                ...state,
                clinicalEncntrDocList: action.data
            };
        }
        case clinicalDocActionType.SAVE_DOCUMENT_TYPE_LIST: {
            return {
                ...state,
                clinicalDocTypeList: action.data
            };
        }
        case clinicalDocActionType.SAVE_SINGLE_DOCUMENT: {
            return {
                ...state,
                currentPDFViewerDoc: action.data
            };
        }
        default: {
            return state;
        }
    }
};


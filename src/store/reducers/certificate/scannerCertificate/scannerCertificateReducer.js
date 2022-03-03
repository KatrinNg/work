import * as scannerCertificateActionType from '../../../actions/certificate/scannerCertificate/scannerCertificateActionType';
// import _ from 'lodash';
import { PAGESTATUS } from '../../../../enums/certificate/scannerCertificateEnum.js';

export const INITAL_STATE = {
    pageStatus: PAGESTATUS.SCANNER_CERT_VIEWING,
    //Def Scanner tab iformation
    scannerParams: {
        open: false,
        svcCd: '',
        siteId: ''
        // dateFrom: null,
        // dateTo: null,
    },
    // Api GET Result Data
    scannerUploadResult: null,
    // History List
    scannerHistoryList: null
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case scannerCertificateActionType.RESET_ALL: {
            return INITAL_STATE;
        }
        case scannerCertificateActionType.CLOSE_SCANNER_HISTORY:
            return {
                ...state,
                scannerParams: {
                    ...state.scannerParams,
                    open: false
                }
            };
        case scannerCertificateActionType.UPDATE_SCANNER_DOC_LIST:
            return {
                ...state,
                scannerHistoryList: action.data
        };
        case scannerCertificateActionType.PUT_HISTORY_CONTAINER_OPEN_CLOSE:
            return {
                ...state,
                scannerParams: {
                    open: !state.scannerParams.open,
                    svcCd: state.scannerParams.svcCd,
                    siteId: state.scannerParams.siteId
                }
            };
        default:
        return state;
    }
};

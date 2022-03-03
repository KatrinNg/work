import * as type from '../../../actions/certificate/certificateEform';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import { PAGESTATUS } from '../../../../enums/certificate/certEformEnum';

export const INITAL_STATE = {
    contactPerson: null,
    pageStatus: PAGESTATUS.CERT_VIEWING,
    eformParams: {
        open: false,
        svcCd: '',
        siteId: '',
        // dateFrom: null,
        // dateTo: null,
        selected: null
    },
    eformResult: null,
    eformList: null,
    eformGroupId: '',
    eformTempId: '',
    eformTemplate: null,
    eformObject: null,
    eformSubmission: null,
    eformSubmissionOriginal: null,
    eformSubmissionSync: false,
    eformSiteId: null,
    copyList: _.cloneDeep(Enum.CERT_NO_OF_COPY),
    copyNum: 1,
    outDocId: null,
    importOutDocId: null,
    allOutDocList: [],
    clinicalDocImportDialogOpen: false
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case type.RESET_ALL: {
            return INITAL_STATE;
        }
        case type.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }
        case type.OPEN_DOCUMENT_IMPORT_DIALOG: {
            return {
                ...state,
                clinicalDocImportDialogOpen: true
            };
        }
        case type.CLOSE_DOCUMENT_IMPORT_DIALOG: {
            return {
                ...state,
                clinicalDocImportDialogOpen: false
            };
        }
        default:
            return state;
    }
};

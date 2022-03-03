import _ from 'lodash';
import * as CTPTypes from '../../../actions/consultation/careAndTreatmentPlan/ctpActionType';
import { hlthEduRcmdBasic } from '../../../../constants/consultation/careAndTreatmentPlan/ctpConstants';


const INITAL_STATE = {
    rfrDetails: null,
    flwUpDetails: null,
    hlthEduRcmdList: null,
    openCreateAndUpdate: false,
    rfrLetterPreviewData: null,
    openRfrPreviewDialog: false,
    flwUp: '',
    tdHlthEduRcmdList: null,
    hasTdCTP: false
};

export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
    switch (action.type) {
        case CTPTypes.RESET_ALL: {
            return _.cloneDeep(INITAL_STATE);
        }

        case CTPTypes.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case CTPTypes.CTRL_CREATE_AND_UPDATE_DIALOG: {
            return {
                ...state,
                openCreateAndUpdate: action.status
            };
        }

        case CTPTypes.LOAD_REFERRAL_LETTER: {
            return {
                ...state,
                rfrDetails: action.data
            };
        }

        case CTPTypes.LOAD_FOLLOW_UP: {
            return {
                ...state,
                flwUpDetails: action.data
            };
        }

        case CTPTypes.LOAD_HLTH_EDU_RCMD: {
            return {
                ...state,
                hlthEduRcmdList: action.data
            };
        }

        case CTPTypes.LOAD_RFR_LETTER_64: {
            return {
                ...state,
                rfrLetterPreviewData: action.data
                // openRfrPreviewDialog: true
            };
        }

        case CTPTypes.LOAD_FLW_UP_FORM_ENCNTR: {
            const encntr = action.data;
            let flwUp = '';
            if (encntr) {
                flwUp = encntr.flwUp ? encntr.flwUp : '';
            }
            return {
                ...state,
                flwUp
            };
        }

        case CTPTypes.LOAD_TODAY_EDU_RCMD: {
            let tdHlthEduRcmdList = [];
            const rawData = action.data;
            if (rawData.length === 0) {
                tdHlthEduRcmdList.push(_.cloneDeep(hlthEduRcmdBasic));
            } else {
                rawData.forEach(el => {
                    let hlthEduRcmd = _.cloneDeep(hlthEduRcmdBasic);
                    hlthEduRcmd.eduRcmdId = el.eduRcmdId;
                    hlthEduRcmd.eduCatgryCd = el.eduCatgryCd || '';
                    hlthEduRcmd.eduRcmdDesc = el.eduRcmdDesc || '';
                    hlthEduRcmd.hlthEduTypeCd = el.hlthEduTypeCd || '';
                    hlthEduRcmd.version = el.version;

                    tdHlthEduRcmdList.push(hlthEduRcmd);

                });
            }
            tdHlthEduRcmdList.sort((a, b) => { return a.eduRcmdId - b.eduRcmdId; });
            return {
                ...state,
                openCreateAndUpdate: true,
                tdHlthEduRcmdList
            };
        }

        default: {
            return { ...state };
        }
    }
};

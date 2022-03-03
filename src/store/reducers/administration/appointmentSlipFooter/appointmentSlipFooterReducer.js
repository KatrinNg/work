import ButtonStatusEnum from '../../../../enums/administration/buttonStatusEnum';
import * as AppointmentSlipFooterActionType from '../../../actions/administration/appointmentSlipFooter/appointmentSlipFooterActionType';
//import _ from 'lodash';

function initRemarkDetails() {
    let tempArr = [];

    for (let i = 0; i < 20; i++) {
        tempArr.push({
            disPlayOrder: '',
            content: '',
            encounterTypeCd: '',
            subEncounterTypeCd: ''
        });
    }

    return tempArr;
}

const INITAL_STATE = {
    status: ButtonStatusEnum.VIEW,
    fieldMap: {
        encounterTypeCd: '*ALL',
        subEncounterTypeCd: '*ALL',
        encounterTypeCdShortName: '',
        subEncounterTypeCdShortName: '',

        // encounterList: [],
        // subEncounterList: [],
        remarkDetails: initRemarkDetails(),
        remarkDetailsBK: initRemarkDetails()

    },
    encounterList: [],
    subEncounterList: [],
    selectedEncounterIdx: 0

};



export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case AppointmentSlipFooterActionType.RESET_ALL: {
            let tempRemarkDetails = [];
            //let tempRemarkDetailsBK = [];
            let tempState = INITAL_STATE;

            tempRemarkDetails = initRemarkDetails();
            tempState = {
                ...tempState,
                remarkDetails: tempRemarkDetails
            };
            return tempState;
        }

        case AppointmentSlipFooterActionType.LOAD_ENCOUNTER_SUCCESS: {
            let { encounterList } = action;
            // let fieldMap = { ...state.fieldMap };
            let tempEncounterList = [];
            let tempSubEncounterList = [];
            let tempSelectedEncounterIdx = state.selectedEncounterIdx;

            if (encounterList && encounterList.length > 0) {
                // fieldMap.encounterList = encounterList;
                // fieldMap.subEncounterList = encounterList[tempSelectedEncounterIdx].subEncounterTypeList;
                tempEncounterList = encounterList;
                tempSubEncounterList = encounterList[tempSelectedEncounterIdx].subEncounterTypeList;
            }

            return {
                ...state,
                // fieldMap
                encounterList: tempEncounterList,
                subEncounterList: tempSubEncounterList
            };


        }

        case AppointmentSlipFooterActionType.EDIT_REMARK_DETAILS: {
            return {
                ...state,
                status: ButtonStatusEnum.EDIT
            };
        }

        case AppointmentSlipFooterActionType.LOAD_REMARK_DETAILS: {
            let tempRemarkDetails = [];
            let { remarks } = action;
            let fieldMap = { ...state.fieldMap };

            if (remarks && remarks.length > 0) {
                remarks.forEach(r => {
                    let tempRemark = {};
                    tempRemark.disPlayOrder = r.disPlayOrder;
                    tempRemark.content = r.content;
                    tempRemark.encounterTypeCd = r.encounterTypeCd;
                    tempRemark.subEncounterTypeCd = r.subEncounterTypeCd;
                    tempRemarkDetails.push(tempRemark);
                });
            }
            else {
                tempRemarkDetails = initRemarkDetails();
            }

            fieldMap.remarkDetails = tempRemarkDetails;


            return {
                ...state,
                status: ButtonStatusEnum.VIEW,
                fieldMap
            };
        }

        case AppointmentSlipFooterActionType.CANCEL_EDIT: {
            let tempRemarkDetailsBK = state.fieldMap.remarkDetailsBK;
            let fieldMap = { ...state.fieldMap };
            fieldMap.remarkDetails = tempRemarkDetailsBK;

            return {
                ...state,
                status: ButtonStatusEnum.VIEW,
                fieldMap
            };
        }

        case AppointmentSlipFooterActionType.UPDATE_FIELD: {
            let fieldMap = { ...state.fieldMap };
            const { para } = action;
            for (let p in para) {
                fieldMap[p] = para[p];
            }
            return {
                ...state,
                fieldMap
            };
        }

        case AppointmentSlipFooterActionType.RELOAD_REMARKS_DETAILS: {
            let { remarks } = action;
            let tempRemarkDetails = initRemarkDetails();
            let tempStatus = '';

            if (remarks) {
                tempRemarkDetails = remarks;

            }
            tempStatus = ButtonStatusEnum.VIEW;

            return {
                ...state,
                remarkDetails: tempRemarkDetails,
                remarkDetailsBK: tempRemarkDetails,
                status: tempStatus
            };
        }

        case AppointmentSlipFooterActionType.CLEAR_REMARK_DETAILS: {
            let remarkDetails = initRemarkDetails();
            let fieldMap = { ...state.fieldMap, remarkDetails };

            return {
                ...state,
                fieldMap
            };
        }

        default: {
            return state;
        }
    }
};
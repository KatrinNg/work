import _ from 'lodash';
import * as types from '../../../actions/payment/clientServiceView/clientServiceViewActionType';

const INITAL_STATE = {
    rcpCsnHistoryList: null,
    selectedSite: '',
    selectedHistoryIdx: '',
    open: false,
    curCsn: null,
    openRemarkFlag: false,
    thsCharges: [],
    noteData: null,
    noteDataBk: null,
    totalAmount: 0,
    waiveAllType: '',
    isPaidAll: false,
    latestUpdateDtm: null,
    remark: null,
    remarkBk: null,
    autoFocusIdx: -1
};

export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
    switch (action.type) {
        case types.RESET_ALL: {
            return _.cloneDeep(INITAL_STATE);
        }
        case types.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        case types.PUT_THS_CHARGES: {
            return {
                ...state,
                thsCharges: action.data
            };
        }
        case types.PUT_RCP_CSN_HISTORY: {
            const { rcpCsnHistoryList } = action;
            let curCsn = null;
            let selectedHistoryIdx = action.selectedHistoryIdx > -1 ? `${action.selectedHistoryIdx}` : '';
            let remark = '';
            let remarkBk = '';
            if (rcpCsnHistoryList.length > 0 && action.selectedHistoryIdx > -1) {
                curCsn = rcpCsnHistoryList[selectedHistoryIdx];
                remark = rcpCsnHistoryList[selectedHistoryIdx].remark;
                remarkBk = rcpCsnHistoryList[selectedHistoryIdx].remark;
            }
            return {
                ...state,
                rcpCsnHistoryList,
                curCsn,
                selectedHistoryIdx,
                remark,
                remarkBk
            };
        }
        case types.PUT_RCP_CSN_ITEM: {
            const { rcpCsnItem } = action;
            return {
                ...state,
                noteData: rcpCsnItem,
                noteDataBk: rcpCsnItem
            };
        }
        default: {
            return { ...state };
        }
    }
};
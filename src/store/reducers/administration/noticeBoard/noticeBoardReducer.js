import _ from 'lodash';
import * as types from '../../../actions/administration/noticeBoard/noticeBoardActionType';
import { initNotice } from '../../../../constants/administration/noticeBoard/noticeBoardConstants';

const INITAL_STATE = {
    noticesList: [],
    curSelNotice: _.cloneDeep(initNotice),
    file: null,
    pastEfftDate:false,
    pastExpyDate:false,
    efftDateSameOrGreater:false,
    expyDateSameOrEarly:false
};

export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
    switch (action.type) {
        case types.RESET_ALL: {
            return _.cloneDeep(INITAL_STATE);
        }
        case types.PUT_NOTICE_LIST: {
            let noticesList = _.cloneDeep(action.noticesList);
            noticesList.forEach(notice => {
                notice.isEnable = notice.isEnable.toString();
            });
            return {
                ...state,
                noticesList: noticesList
            };
        }
        case types.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        case types.LOAD_FILE: {
            return {
                ...state,
                file: action.file
            };
        }
        default: {
            return { ...state };
        }
    }
};
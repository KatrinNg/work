import * as type from '../../../actions/certificate/sickLeave/sickLeaveActionType';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import _ from 'lodash';

export const INITAL_STATE = {
    newLeaveInfo: {
        to: 'Whom it may concern',
        sufferFrom: '',
        dateRange: {
            leaveFrom: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            leaveTo: null,
            period: '',
            leaveFromSection: '',
            leaveToSection:''
        },
        remark: '',
        issueDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
        attnDate:moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
        isMaskHKID:'1'            //0:true  1:false
    },
    allowCopyList: _.cloneDeep(Enum.CERT_NO_OF_COPY),
    copyPage: 1,
    handlingPrint: false,
    sickLeaveCertList: null,
    closeTabFunc: null
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case type.RESET_ALL: {
            return INITAL_STATE;
        }

        case type.UPDATE_FIELD: {
            let lastAction = { ...state };

            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case type.PUT_LIST_LEAVE_CERTIFICATES : {
            return {
                ...state,
                sickLeaveCertList: _.cloneDeep(action.data.filter(item => item.status === 'A'))
            };
        }

        default:
            return state;
    }
};

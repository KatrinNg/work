import * as type from '../../../actions/certificate/vaccineCert/vaccineCertActionType';
import _ from 'lodash';
import Enum from '../../../../enums/enum';

const INITAL_STATE = {
    allowCopyList: _.cloneDeep(Enum.CERT_NO_OF_COPY),
    copyPage: 1,
    handlingPrint: false,
    historyList: null,
    isReissue:false,
    closeTabFunc: null
};


export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
    switch (action.type) {
        case type.RESET_ALL: {
            return _.cloneDeep(INITAL_STATE);
        }
        case type.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        case type.PUT_LIST_VACCINE_CERT: {
            return {
                ...state,
                historyList: _.cloneDeep(action.data.filter(item => item.status === 'A'))
            };
        }
        default: {
            return state;
        }
    }
};


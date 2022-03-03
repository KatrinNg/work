import * as type from '../../../actions/certificate/yellowFever/yellowFeverActionType';
import _ from 'lodash';
import Enum from '../../../../enums/enum';

export const INITAL_STATE = {
    newYellowFeverInfo: {
        nationality: '',
        issuedCountry: '',
        passportNumber: '',
        exemptionReason: '',
        patientName: ''
    },
    allowCopyList: _.cloneDeep(Enum.CERT_NO_OF_COPY),
    copyPage: 1,
    handlingPrint: false,
    letterList: null,
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
        case type.PUT_LIST_YELLOWFEVER_EXEMPT_CERTIFICATES: {
            return {
                ...state,
                letterList: _.cloneDeep(action.data.filter(item => item.status === 'A'))
            };
        }
        default: {
            return state;
        }
    }
};


import * as type from '../../../actions/certificate/generalLetter/generalLetterActionType';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import moment from 'moment';

export const INITAL_STATE = {
    newLetterInfo: {
        letterTo: 'Whom it may concern',
        letterDate: moment(),
        subject: '',
        content: '',
        yourRef1: '',
        yourRef2: '',
        attnGroup: {
            groupCd: '',
            hosptialClinicName: '',
            desc: ''
        }
    },
    allowCopyList: _.cloneDeep(Enum.CERT_NO_OF_COPY),
    copyPage: 1,
    handlingPrint: false,
    generalLetterList: null,
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

        case type.PUT_LIST_GENERALLETTER_CERT: {
            return {
                ...state,
                generalLetterList: _.cloneDeep(action.data.filter(item => item.status === 'A'))
            };
        }

        default:
            return state;
    }
};

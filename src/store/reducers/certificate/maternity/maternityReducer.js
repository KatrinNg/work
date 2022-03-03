import * as type from '../../../actions/certificate/maternity/maternityActionType';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import moment from 'moment';

export const INITAL_STATE = {
    newLeaveInfo: {
        txt_To: 'Whom it may concern',
        dpk_CertDate: moment(),
        rdo_MaternityStatus: '',
        dpk_MaternityDelivered: null,
        cbo_DateOfConfinement: false,
        dpk_DateOfConfinement: null,
        cbo_Disease: false,
        rdo_Disease: '',
        txt_DiseaseRemark: '',
        cbo_LeaveDate: false,
        dpk_LeaveFrom: null,
        dpk_LeaveTo: null
    },
    allowCopyList: _.cloneDeep(Enum.CERT_NO_OF_COPY),
    copyPage: 1,
    handlingPrint: false,
    maternityCertList: null,
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

        case type.PUT_LIST_MATERNITY_CERT: {
            return {
                ...state,
                maternityCertList: _.cloneDeep(action.data.filter(item => item.status === 'A'))
            };
        }

        default:
            return state;
    }
};

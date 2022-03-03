import * as type from '../../../actions/certificate/referralLetter/referralLetterActionType';
import _ from 'lodash';
import Enum from '../../../../enums/enum';
export const INITAL_STATE = {
    newLetterInfo: {
        to: 'The Professor / Doctor',
        problem: '',
        medications: '',
        result: '',
        appointmentType: '',
        referTo: {
            groupCd: null,
            hosptialClinicName: null,
            specialty: null,
            letterSvcCd: null,
            details: '',
            others: '',
            rfrHcinstId: null,
            specialtyName:null
        },
        familyHistory: ''
    },
    allowCopyList: _.cloneDeep(Enum.CERT_NO_OF_COPY),
    copyPage: 1,
    handlingPrint: false,
    referToOpts: [],
    specialtyList: [],
    referralLetterList: null,
    closeTabFunc: null,
    pullInitData: 0
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
        case type.PUT_LIST_REFERRAL_LETTERS: {
            return {
                ...state,
                referralLetterList: _.cloneDeep(action.data.filter(item => item.status === 'A'))
            };
        }
        default: {
            return state;
        }
    }
};
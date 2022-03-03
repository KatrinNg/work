import * as templateType from '../../../actions/appointment/timeslotTemplate';
import { StatusEnum } from '../../../../enums/appointment/timeslot/timeslotTemplateEnum';
import { initTempDetailItem, initTempDetailInfo, initBatchCreate } from '../../../../constants/appointment/timeslotTemplate/timeslotTemplateConstants';
import _ from 'lodash';

const INSTAL_STATE = {
    status: StatusEnum.NEW,
    templateList: null,
    templateListSelected: -1,
    templateDetailList: [_.cloneDeep(initTempDetailItem)],
    templateDetailInfo: _.cloneDeep(initTempDetailInfo),
    batchCreateDialog: _.cloneDeep(initBatchCreate),
    isOpenBatchCreate: false
};

export default (state = INSTAL_STATE, action = {}) => {
    switch (action.type) {
        case templateType.RESET_ALL: {
            return { ...INSTAL_STATE };
        }
        case templateType.UPDATE_STATE: {
            return { ...state, ...action.updateData };
        }
        case templateType.UPDATE_TEMPLATE_LIST: {
            return { ...state, templateList: _.cloneDeep(action.data) };
        }
        default: return state;
    }
};
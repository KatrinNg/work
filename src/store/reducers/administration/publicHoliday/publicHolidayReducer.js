import * as type from '../../../actions/administration/publicHoliday/publicHolidayActionType';
import moment from 'moment';
import _ from 'lodash';

const INITAL_STATE = {
    holidayList: null,
    yearFrom: moment().format('YYYY'),
    yearTo: moment().format('YYYY'),
    handlingPrint: false
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
        case type.LOAD_HOLIDAY_LIST: {
            let tempHolidayList = action.holidayList;
            return {
                ...state,
                holidayList: tempHolidayList
            };
        }
        default: {
            return state;
        }
    }
};
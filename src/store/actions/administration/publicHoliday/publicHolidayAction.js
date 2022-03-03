import * as type from './publicHolidayActionType';

export const listHoliday = (param, callback) => {
    return {
        type: type.LIST_HOLIDAY,
        param,
        callback
    };
};

export const updateField = (updateData) => {
    return {
        type: type.UPDATE_FIELD,
        updateData
    };
};

export const resetAll = () => {
    return {
        type: type.RESET_ALL
    };
};

export const loadHolidayList = (holidayList) => {
    return {
        type: type.LOAD_HOLIDAY_LIST,
        holidayList
    };
};

export const printHolidayList = (param) => {
    return {
        type: type.PRINT_HOLIDAY_LIST,
        param
    };
};
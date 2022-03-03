import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';
// import { calendarList } from 'pages/calendar/mockData';

const initState = {
    calendar_list: [],
    category_list: [],
    patient_list_info: {
        // 'category_group_name_0': []
    }
}

const calendar = (state = initState, action = null) => {
    switch(action.type) {
        case ActionTypes.SET_CALENDAR_LIST:
            const update_calendar_list_state = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                })
            })
            return update_calendar_list_state;
        case ActionTypes.SET_CATEGORY_LIST:
            const update_category_list_state = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                })
            })
            return update_category_list_state;
        case ActionTypes.SET_NAME_LIST:
            const update_name_list_state = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                })
            })
            return update_name_list_state;
        case ActionTypes.SET_PATIENT_LIST_INFO:
            const set_patient_list_info_state = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                })
            })
            return set_patient_list_info_state;
        case ActionTypes.UPDATE_PATIENT_INFO:
            const { patient_key, patient_list_info, callback } = action.payload;
            const new_patient_list_info = state.patient_list_info;
            const calendar_list = state.calendar_list;
            const update_patient_list_info_state = produce(new_patient_list_info, (draft) => {
                draft[patient_key] = patient_list_info;
            })
            const update_calendar_list = produce(calendar_list, (draft) => {
                draft.forEach((i, idx) => {
                    if (update_patient_list_info_state[i.patient_key]) {
                        i.personCount = update_patient_list_info_state[i.patient_key].length;
                        i.personList = update_patient_list_info_state[i.patient_key];
                    }
                })
            })
            const resultState = {...state, calendar_list: update_calendar_list, patient_list_info: update_patient_list_info_state};
            console.log(update_calendar_list)
            callback(update_calendar_list);
            return resultState;
        default:
            return state;
    }
}

export default calendar
import { takeLatest, all, put, call, takeEvery } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';
import * as _ from 'lodash';

function* getCalendarList(action) {
    const { callback = () => { }, params } = action.payload;
    const {start_date, end_date} = params;
    try {
        const data = {
            login_id: "@CMSIT",
            dept: "PT",
            start_date,
            end_date,
            room_id: "ALL",
            hosp_code: "TPH"
        }
        const result = yield call(api.calender.getCalendarList, data);
        const response = result?.data?.response;
//         const response = {
//             "therapeutic_group_dept": [
//                 {
//                     "hosp_code": "TPH",
//                     "dept": "OT",
//                     "category": "Caregiver training",
//                     "group_name": "Caregiver Education",
//                     "group_date": "18/01/2022",
//                     "start_date": "01/01/2022",
//                     "end_date": "30/01/2022",
//                     "start_time": "11:00",
//                     "end_time": "12:00",
//                     "remarks": "test remarks 1",
//                     "room_id": "G037",
//                     "recurrent": "Y",
//                     "recurrent_details": "MON;TUE;FRI"
//                 }, {
//                     "hosp_code": "TPH",
//                     "dept": "OT",
//                     "category": "Caregiver training",
//                     "group_name": "Caregiver Education",
//                     "group_date": "22/01/2022",
//                     "start_date": "01/01/2022",
//                     "end_date": "30/01/2022",
//                     "start_time": "11:00",
//                     "end_time": "12:00",
//                     "remarks": "test remarks 2",
//                     "room_id": "G037",
//                     "recurrent": "Y",
//                     "recurrent_details": "MON;TUE;FRI"
//                 }, {
//                     "hosp_code": "TPH",
//                     "dept": "OT",
//                     "category": "COPD",
//                     "group_name": "COPD",
//                     "group_date": "01/01/2022",
//                     "start_date": "01/01/2022",
//                     "end_date": "30/01/2022",
//                     "start_time": "11:00",
//                     "end_time": "12:00",
//                     "remarks": "test remarks 3",
//                     "room_id": "G037",
//                     "recurrent": "N"
//                 }, {
//                     "hosp_code": "TPH",
//                     "dept": "OT",
//                     "category": "COPD",
//                     "group_name": "COPD",
//                     "group_date": "02/01/2022",
//                     "start_date": "01/01/2022",
//                     "end_date": "30/01/2022",
//                     "start_time": "11:00",
//                     "end_time": "12:00",
//                     "remarks": "test remarks 4",
//                     "room_id": "G037",
//                     "recurrent": "N"
//                 }
//             ]
//         }
        const { therapeutic_group_dept } = response;
        therapeutic_group_dept.forEach((i,d) => {
            i.patient_key = `${i.category}_${i.group_name}_${d}`;
            i.personCount = '-';
            i.personList = [];
        })
        const cloneData = _.cloneDeep(therapeutic_group_dept);
        callback(cloneData)

        const patientInfoBase = {}
        for (const key in therapeutic_group_dept) {
            if (Object.hasOwnProperty.call(therapeutic_group_dept, key)) {
                const element = therapeutic_group_dept[key];
                patientInfoBase[`${element.category}_${element.group_name}_${key}`] = [];
            }
        }

        yield put(
            { type: ActionTypes.SET_CALENDAR_LIST, payload: { calendar_list: therapeutic_group_dept } },
        );
        yield put(
            { type: ActionTypes.SET_PATIENT_LIST_INFO, payload: { patient_list_info: patientInfoBase } }
        );
        for(let index = 0; index < therapeutic_group_dept.length; index++) {
            yield put(
                {type: ActionTypes.FETCH_PATIENT_INFO,
                    payload: {
                        item: therapeutic_group_dept[index],
                        index,
                        callback,
                    }
                }
            )
        }

    } catch (error) {
    }
}

function* getSinglePatientInfo(action) {
    const { item, index, callback } = action.payload;
    try {
        const params = {
            login_id: '@CMSIT',
            dept: 'OT',
            hosp_code: 'TPH',
            category: item.category,
            group_name: item.group_name,
        }
        const response = yield call(api.patientDetail.getTherapeuticGroupPatientList, params);
        const result = response?.data?.response;
        // const response = {
        //     "therapeutic_patient_data": [
        //         {
        //             "case_no":"HN05000078T",
        //             "patient_name":"Chan Tai Man",
        //             "category":"Caregiver training",
        //             "group_name":"Caregiver Education",
        //             "selective_join":"Y",
        //             "remarks":"Join 01/11 as trail"
                
        //         }, {
        //             "case_no":"HN06000037Z",
        //             "patient_name":"Wong Tai Man",
        //             "category":"Caregiver training",
        //             "group_name":"Caregiver Education",
        //             "selective_join":"N"
        //         }
        //     ]

        // }
        const { therapeutic_patient_data } = result;
        if (Array.isArray(therapeutic_patient_data)) {
            yield put(
                {
                    type: ActionTypes.UPDATE_PATIENT_INFO,
                    payload: {
                        patient_list_info: therapeutic_patient_data,
                        patient_key: `${item.category}_${item.group_name}_${index}`,
                        callback,
                    }
            });
        }
    } catch (e) {
    }
}

function* getCategoryList(action) {
    const { callback = () => { } } = action.payload;
    try {
          const params = {
//                login_id: "@CMSIT",
                dept: "OT",
                hosp_code: "TPH"
            }
         const response = yield call(api.calender.getCategoryAndNameList, params);
//        const response = {
//            "therapeutic_group_name": [
//                {
//                    "category": "Caregiver training",
//                    "group_name": "Caregiver Education",
//                },
//                {
//                    "category": "Adaptive Coping Strategies",
//                    "group_name": "Assistive Device",
//                }
//            ]
//
//        }
        const { therapeutic_group_name } = response.data.response;
        callback(therapeutic_group_name)
        yield put(
            {
                type: ActionTypes.SET_CATEGORY_LIST,
                payload: { category_list: therapeutic_group_name }
            });

    } catch (error) {

    }
}

function* getNameList(action) {
    const { callback = () => { } } = action.payload;
    try {
        // const response = yield call(api.patientDetail.getCalendarList, {});
        const response = {
            "therapeutic_group_dept": [
                {
                    "hosp_code": "TPH",
                    "dept": "OT",
                    "category": "Caregiver training",
                    "group_name": "Caregiver Education",
                    "group_date": "18/01/2022",
                    "start_date": "01/01/2022",
                    "end_date": "30/01/2022",
                    "start_time": "11:00",
                    "end_time": "12:00",
                    "remarks": "test remarks 1",
                    "room_id": "G037",
                    "recurrent": "Y",
                    "recurrent_details": "MON;TUE;FRI"
                }, {
                    "hosp_code": "TPH",
                    "dept": "OT",
                    "category": "Caregiver training",
                    "group_name": "Caregiver Education",
                    "group_date": "22/01/2022",
                    "start_date": "01/01/2022",
                    "end_date": "30/01/2022",
                    "start_time": "11:00",
                    "end_time": "12:00",
                    "remarks": "test remarks 2",
                    "room_id": "G037",
                    "recurrent": "Y",
                    "recurrent_details": "MON;TUE;FRI"
                }, {
                    "hosp_code": "TPH",
                    "dept": "OT",
                    "category": "COPD",
                    "group_name": "COPD",
                    "group_date": "01/01/2022",
                    "start_date": "01/01/2022",
                    "end_date": "30/01/2022",
                    "start_time": "11:00",
                    "end_time": "12:00",
                    "remarks": "test remarks 3",
                    "room_id": "G037",
                    "recurrent": "N"
                }, {
                    "hosp_code": "TPH",
                    "dept": "OT",
                    "category": "COPD",
                    "group_name": "COPD",
                    "group_date": "02/01/2022",
                    "start_date": "01/01/2022",
                    "end_date": "30/01/2022",
                    "start_time": "11:00",
                    "end_time": "12:00",
                    "remarks": "test remarks 4",
                    "room_id": "G037",
                    "recurrent": "N"
                }
            ]
        }
        const { therapeutic_group_dept } = response;
        callback(therapeutic_group_dept)
        yield put(
            {
                type: ActionTypes.SET_NAME_LIST,
                payload: { calendar_list: therapeutic_group_dept }
            });

    } catch (error) {

    }
}

function* watchCalendar() {
    yield takeLatest(ActionTypes.FETCH_CALENDAR_LIST, safeSaga(getCalendarList));
    yield takeLatest(ActionTypes.FETCH_CATEGORY_LIST, safeSaga(getCategoryList));
    yield takeLatest(ActionTypes.FETCH_NAME_LIST, safeSaga(getNameList));
    yield takeEvery(ActionTypes.FETCH_PATIENT_INFO, safeSaga(getSinglePatientInfo));
}

export function* watchers() {
    yield all([
        watchCalendar(),
    ]);
}
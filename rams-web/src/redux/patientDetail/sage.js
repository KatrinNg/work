import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';
import * as _ from 'lodash';

function* getPatientPrescription(action) {
    const {
        login_id,
        dept,
        case_no,
        hosp_code
    } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_PATIENT_DETAIL, payload: { isLoading: true } });
        const res = yield call(api.patientDetail.getPatientPrescription, {
            login_id,
            dept,
            case_no,
            hosp_code
        });
        const { data, status } = res;
        const { response } = data;
        
        let { patient_details = {}, treatment_data = [], request_no = '' } = response;

        if (typeof treatment_data === 'string') {
            treatment_data = [];
        }

        yield put({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                treatmentActivities: treatment_data,
                patientDetail: { request_no, ...patient_details },
                isLoading: false,
                cloneData: {
                    treatmentActivities: _.cloneDeep(treatment_data),
                    patientDetail: _.cloneDeep({ request_no, ...patient_details }),
                }
            }
        });

    } catch (error) {

    }
}
function* getRoomList(action) {
    const { login_id, hosp_code = 'TPH', dept = 'OT' } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const response = yield call(api.patientDetail.getRoomList, { login_id, hosp_code, dept });
        const result = response.data.response
        /*        const response = {
                    "room_list": [
                        {
                            "room_id": "G037",
                            "room_hosp": "TPH",
                            "status": "ACTIVE"
                        },
                        {
                            "room_id": "G046",
                            "room_hosp": "TPH",
                            "status": "ACTIVE"
                        }
                    ]
                }*/
        let { room_list } = result;
        room_list = room_list.filter((item) => {
            return  item.status === 'ACTIVE'
        })

        yield put({ type: ActionTypes.SET_PATIENT_DETAIL, payload: { roomList: room_list } });

    } catch (error) {

    }
}


function* getPatientDetailMasterList(action) {
    const { login_id, hosp_code, dept } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.patientDetail.getPatientMasterList, { login_id, hosp_code, dept });
        const { data, status } = res;
        const { response } = data;

        
        let { paitent_detail_type = [], precaution = [], therapist_list = [] } = response;

        if (typeof paitent_detail_type === 'string') {
            paitent_detail_type = [];
        }
        if (typeof precaution === 'string') {
            precaution = [];
        }
        if (typeof therapist_list === 'string') {
            therapist_list = [];
        }

        let precautionList = {}

        precaution.forEach(item => {
            precautionList[`${item.precaution_id}`] = true
        })

        const tempObj = {}
        paitent_detail_type.forEach((item) => {
            if (tempObj[item.type]) {
                tempObj[item.type].push({
                    name: item.value,
                    value: item.value,
                    subtype: item.subtype
                })
            } else {
                tempObj[item.type] = [{
                    name: item.value,
                    value: item.value,
                    subtype: item.subtype
                }]
            }
        })

        yield put({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                wheelchairList: tempObj?.wheelchair || [],
                patientConditionsList: tempObj?.patient_conditions || [],
                o2List: tempObj?.o2 || [],
                // statusList: tempObj?.status || [],
                precaution: precautionList,
                therapistList: therapist_list,
                precautionList: precaution
            }
        });

    } catch (error) {

    }
}
function* getMasterListStatic(action) {
    const { login_id, hosp_code, dept, room_id } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.patientDetail.getMasterListStatic, { login_id, hosp_code, dept, room_id });
        const { data, status } = res;
        const { response } = data;

        
        let { room_treatment = [], treatment_properties = [], therapeutic_group_dept = [], health_ref_value = {} } = response;

        if (typeof room_treatment === 'string') {
            room_treatment = [];
        }
        if (typeof treatment_properties === 'string') {
            treatment_properties = [];
        }
        if (typeof therapeutic_group_dept === 'string') {
            therapeutic_group_dept = [];
        }

        const tempObj = {}
        const formatNameFunc = (type, value) => {
            if (type === 'duration') {
                return value + ' mins'
            }
            return value
        }
        treatment_properties.forEach((item) => {
            if (item.status === 'ACTIVE') {
                if (tempObj[item.type]) {
                    tempObj[item.type].push({
                        name: formatNameFunc(item.type, item.value),
                        value: item.value,
                    })
                } else {
                    tempObj[item.type] = [{
                        name: formatNameFunc(item.type, item.value),
                        value: item.value,
                    }]
                }
            }
        })

        const tempObj2 = {}
        //therapeutic_group_dept.forEach((item) => {
        //    if (tempObj2[item.category]) {
        //        tempObj2[item.category].group.push(item)
        //    } else {
        //        tempObj2[item.category] = { selected: false, group: [item] }
        //    }
        //})

        therapeutic_group_dept.forEach((item) => {

            if (tempObj2[item.category]) {
                tempObj2[item.category].group = { ...tempObj2[item.category].group, [item.group_name]: item}
            } else {
                tempObj2[item.category] = { selected: false, group: { [item.group_name]: item }}
            }
        })


        for (const data in tempObj2) {
            tempObj2[data][`group`] = Object.entries(tempObj2[data][`group`]).map(item => {

                return item[1]/*group_name: item[0], category: data, dept: dept, hosp_code: hosp_code, room_id: room_id, start_date: item[1].start_date, end_date: item[1].end_date*/
            })
        }

        yield put({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                treatmentActivitiesLists: {
                    positionList: tempObj?.position || [],
                    categoryList: room_treatment || [],
                    sideList: tempObj?.side || [],
                    durationList: tempObj?.duration || [],
                    assistanceList: tempObj?.assistance || [],
                    walkingAidsList: tempObj?.walking_aids || [],
                    assistiveDeviceList1: tempObj?.assistive_device_1 || [],
                    assistiveDeviceList2: tempObj?.assistive_device_2 || [],
                    weightBearingStatusList1: tempObj?.weight_bearing_status_1 || [],
                    weightBearingStatusList2: tempObj?.weight_bearing_status_2 || [],
                    resistanceList: tempObj?.resistance || [],
                    resistanceUnitList: tempObj?.resistance_unit || [],
                    repetitionList: tempObj?.repetition || [],
                    regionList: tempObj?.region || [],
                    setList: tempObj?.treatment_set || [],
                },
                masterHealthRef: health_ref_value,
                therapeuticGroupList: tempObj2
            }
        });

    } catch (error) {

    }
}

function* getProtocolList(action) {
    const { login_id, hosp_code, dept } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.patientDetail.getProtocolList, { login_id, hosp_code, dept });
        const { data, status } = res;
        const { response } = data;
        
        const { protocol_data = {} } = response;

        yield put({ type: ActionTypes.SET_PATIENT_DETAIL, payload: { protocolList: protocol_data } });

    } catch (error) {

    }

}
function* getTherapeuticGroupPatientList(action) {
    const { callback, login_id, dept, hosp_code, category, group_name } = action.payload
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
         const response = yield call(api.patientDetail.getTherapeuticGroupPatientList, {
            login_id, dept, hosp_code, category, group_name
        });
        console.log(response,"saga patient")
        if(response.status === 200){
            callback(response.data.response.therapeutic_patient_data)
        }


    } catch (error) {

    }

}
function* getTherapeuticGroupCalendarList(action) {

    const { login_id, dept, start_date, end_date, room_id, hosp_code } = action.payload

    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const response = yield call(api.patientDetail.getTherapeuticGroupCalendarList, {
            login_id, dept, start_date, end_date, room_id, hosp_code
        });

        console.log(response,"saga calendar")


    } catch (error) {

    }
}
function* getTherapeuticGroupPatientData(action) {

    const { login_id, dept, case_no, hosp_code } = action.payload
    console.log(action,"saga check")
    try {

        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.patientDetail.getTherapeuticGroupPatientData, {
            login_id, dept, case_no, hosp_code
        });

        const { data, status } = res;
        const { response } = data;



       
        let { therapeutic_group_patient } = response;

        if (typeof therapeutic_group_patient === 'string') {
            therapeutic_group_patient = [];
        }

        yield put({
            type: ActionTypes.SET_PATIENT_DETAIL, payload: {
                selectedTherapeuticGroup: therapeutic_group_patient
            }
        });



    } catch (error) {

    }
}
function* savePrecautions(action) {
    const { } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.patientDetail.savePrecautions, { ...action.payload });
        // const { therapeutic_group_data } = response;
        const { data, status } = res;
        const { statusCode } = data;
        if (statusCode !== '400') {
            action?.callback()
            yield put({ type: ActionTypes.SET_PATIENT_DETAIL, payload: {roomChange: false, treatmentChange: false} });
        }

    } catch (error) {

    }
}


function* watchPatientDetail() {
    yield takeEvery(ActionTypes.FETCH_PATIENT_PRESCRIPTION, safeSaga(getPatientPrescription));
    yield takeEvery(ActionTypes.FETCH_ROOT_LIST, safeSaga(getRoomList));
    yield takeEvery(ActionTypes.FETCH_PATIENT_DETAIL_MASTER_LIST, safeSaga(getPatientDetailMasterList));
    yield takeEvery(ActionTypes.FETCH_PROTOCOL_LIST, safeSaga(getProtocolList));
    yield takeEvery(ActionTypes.FETCH_THERAPEUTIC_GROUP_CALENDAR_LIST, safeSaga(getTherapeuticGroupCalendarList));
    yield takeEvery(ActionTypes.FETCH_THERAPEUTIC_GROUP_PATIENT_LIST, safeSaga(getTherapeuticGroupPatientList));
    yield takeEvery(ActionTypes.FETCH_SAVE_PRECAUTIONS, safeSaga(savePrecautions));
    yield takeEvery(ActionTypes.FETCH_MASTER_LIST_STATIC, safeSaga(getMasterListStatic));
    yield takeEvery(ActionTypes.FETCH_THERAPEUTIC_GROUP_PATIENT_DATA, safeSaga(getTherapeuticGroupPatientData));

}

export function* watchers() {
    yield all([
        watchPatientDetail(),
    ]);
}
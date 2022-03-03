import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';


function* getPatientDetail(action) {
    const { callback = () => { } } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_DETAIL, payload: { isLoading: true } });

        const params_patient_prescription = {
            login_id: "@CMSIT",
            dept: "OT",
            case_no: "HN06000037Z",
            hosp_code: "TPH",
            room_id: 'G046'
        }
        const params_treatment_record = {
            login_id: "@CMSIT",
            dept: "OT",
            case_no: "HN06000037Z",
            hosp_code: "TPH",
        }
        // const result = yield call(api.patientDetail.getPatientPrescription, params);
        const [result_patient_prescription, result_treatment_record] = yield all([
            call(api.patientDetail.getPatientPrescription, params_patient_prescription),
            call(api.patientDetail.getTreatmentRecord, params_treatment_record),
        ])
        const response_patient_prescription = result_patient_prescription.data.response;
        const response_treatment_record = result_treatment_record.data.response;
        //        const response = {
        //            "request_no": "22TPHPT00001",
        //            "last_updated": "18/11/2021 16:04:23",
        //            "patient_details": {
        //                "patient_name": "Chan Tai Man",
        //                "ward": "5D",
        //                "bed": "10",
        //                "room_id": "4BC",
        //                "therapist_id": "Y2KMED",
        //                "patient_conditions": "Fall",
        //                "status": "Active",
        //                "o2": "1.5",
        //                "wheelchair": "",
        //                "assistive_device_1": "",
        //                "assistive_device_2": "",
        //                "weight_bearing_status_1": "",
        //                "weight_bearing_status_2": "",
        //                "patient_details_remarks": "ABC",
        //                "fall_risk": "Y",
        //                "precaution_selected": "PT01;PT03",
        //                "precaution_remarks_1": "ABC",
        //                "precaution_remarks_2": "ABC",
        //                "sbp_lower": "90",
        //                "sbp_upper": "180",
        //                "dbp_lower": "50",
        //                "dbp_upper": "100",
        //                "spo2": "88",
        //                "pulse_lower": "60",
        //                "pulse_upper": "120",
        //                "continuous_spo2": "Y",
        //                "first_attend_login": "YYYY",
        //                "first_attend_logout": "YYYY",
        //                "subsequent_attend_login": "NNNN",
        //                "subsequent_attend_logout": "NNNN"
        //            },
        //            "treatment_data": [
        //                {
        //                    "treatment_seq": "1",
        //                    "treatment_optional": "",
        //                    "category": "Mobilization and strengthening",
        //                    "treatment_name": "Power Trainer",
        //                    "treatment_doc": "Limb Mobilization and Strengthening",
        //                    "position": "Plinth",
        //                    "side": "Left",
        //                    "region": "Upper Limb",
        //                    "set": "5",
        //                    "repetition": "As tolerated",
        //                    "resistance": "Red",
        //                    "resistance_unit": "lb",
        //                    "walking_aids": "Stick Left",
        //                    "assistive_device_1": "AFO",
        //                    "assistive_device_2": "AFO",
        //                    "weight_bearing_status_1": "FWB",
        //                    "weight_bearing_status_2": "",
        //                    "assistance_device_2": "1 Assistant",
        //                    "distance": "",
        //                    "duration": "10 mins",
        //                    "befor_bp": "Y",
        //                    "befor_spo2": "Y",
        //                    "after_bp": "Y",
        //                    "after_spo2": "Y",
        //                    "handheld_remark": "Y",
        //                    'remark': '',
        //                },
        //                {
        //                    "treatment_seq": "2",
        //                    "treatment_optional": "1",
        //                    "category": "Mobilization and strengthening",
        //                    "treatment_name": "Mini-press",
        //                    "treatment_doc": "Limb Mobilization and Strengthening",
        //                    "position": "Stand",
        //                    "side": "Left",
        //                    "region": "Upper Limb",
        //                    "set": "1",
        //                    "repetition": "As tolerated",
        //                    "resistance": "Red",
        //                    "resistance_unit": "lb",
        //                    "walking_aids": "Stick Left",
        //                    "assistive_device_1": "AFO",
        //                    "assistive_device_2": "AFO",
        //                    "weight_bearing_status_1": "FWB",
        //                    "weight_bearing_status_2": "",
        //                    "assistance": "2 Assistant",
        //                    "distance": "",
        //                    "duration": "5 mins",
        //                    "befor_bp": "Y",
        //                    "befor_spo2": "Y",
        //                    "after_bp": "Y",
        //                    "after_spo2": "Y",
        //                    "handheld_remark": "Y",
        //                    'remark':'',
        //                }
        //            ]
        //        }
        const { patient_details, treatment_data, request_no } = response_patient_prescription;
        const { treatment_record } = response_treatment_record;

        treatment_data.forEach((item, i) => {
            item.recordList = treatment_record.filter(v => item.treatment_name === v.treatment_name);
        })

        yield put({ type: ActionTypes.SET_DETAIL, payload: { treatment_data: treatment_data, patientDetail: { request_no, ...patient_details }, isLoading: false } });
        callback(response_patient_prescription);
    } catch (error) {

    }
}

function* getPrecautionsIconList(action) {
    const { } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_DETAIL, payload: { isLoading: true } });
        const params = {
            login_id: '@CMSIT',
            hosp_code: 'HAH',
            dept: 'OT'
        }
        const result = yield call(api.patientDetail.getPrecautionsIconList, params);
        const response = result.data.response;
        const { precaution = [] } = response;
        if (Array.isArray(precaution)) {
            yield put({ type: ActionTypes.SET_DETAIL, payload: { precautionList: precaution } });
        }
    } catch (error) {

    }
}

function* getCurrentTreatment(action) {
    const { } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_DETAIL, payload: { isLoading: true } });
        const params = {
            login_id: "@CMSIT",
            dept: "OT",
            case_no: "HN06000037Z",
            hosp_code: "TPH",
            room_id: "G046",
        }
        const result = yield call(api.patientDetail.getCurrentTreatmentInGymRoomForPatient, params);
        const response = result.data.response;
        //        const response = {
        //            "treatment_data":[
        //                {
        //                "case_no":"HN05000078T",
        //                "req_no":"22TPHOT00000001",
        //                "patient_name_chi":"陳大文",
        //                "patient_name_eng":"Chan Tai Man",
        //                "ward":"5D",
        //                "bed":"20",
        //                "spo2":88,
        //                "continuous_spo2":"N",
        //                "pulse_lower":40,
        //                "pulse_upper":140,
        //                "precautions":"OT01;OT02",
        //                "current_treatment":"Mini-press",
        //                "treatment_duration":"10 mins",
        //                "last_updated":"18/11/2021 11:22:33"
        //                }]
        //
        //        }
        const { treatment_data } = response;
        const currentTreatment = treatment_data.length === 0 ? null : treatment_data[0].current_treatment
        yield put({ type: ActionTypes.SET_DETAIL, payload: { currentTreatment: currentTreatment, isLoading: false } });

    } catch (error) {

    }
}

function* setTreatmentDetail(action) {
    const { callback, actionType } = action.payload;
    try {
        const params = {
            login_id: "@CMSIT",
            hosp_code: "TPH",
            dept: "OT",
            room_id: "G046",    //G046     4BC
            case_no: "HN06000037Z",     //HN06000037Z     HN01108000T
            barcode: "8880539",  // 8880539
            action: actionType
        }
        console.log(params,"params")
        const result = yield call(api.patientDetail.setTreatmentDetail, params);
        console.log(result, "result")

        if (result?.data?.StatusCode === 400) {
            // callback && callback();
        } else {
            callback && callback(result.data)
        }
    } catch (error) {
    }
}

function* updateTreatmentRemarks(action) {
    const { callback } = action.payload;

    try {
        const params = {
            login_id: "@CMSIT",
            hosp_code: "TPH",
            dept: "OT",
            room_id: "G046",
            case_no: "HN06000037Z",
            treatment_record_id: "22TPHOTTM00000009",
            handheld_remark_details: "This is test remark"
        }

        const result = yield call(api.patientDetail.updateTreatmentRemarks, params);

        // const response = result.data.response;
        const response = {
            "request": {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "OT",
                "room_id": "G046",
                "case_no": "HN06000037Z",
                "treatment_record_id": "22TPHOTTM00000009",
                "handheld_remark_details": "This is remark"
            },
            "response": {
                "treatment_record": [
                    {
                        "treatment_record_id": "22TPHOTTM00000009",
                        "treatment_start_dt": "2021/11/18 11:22:33",
                        "treatment_end_dt": "",
                        "treatment_start_by": "@CMSIT",
                        "treatment_end_by": "",
                        "treatment_seq": "1",
                        "treatment_optional": "2",
                        "treatment_category": "Mobilization and strengthening",
                        "treatment_name": "Power Trainer",
                        "treatment_doc": "Limb Mobilization and Strengthening",
                        "position": "Plinth",
                        "side": "Left",
                        "region": "Upper Limb",
                        "treatment_set": "5",
                        "repetition": "As tolerated",
                        "resistance": "Red",
                        "resistance_unit": "lb",
                        "walking_aids": "Stick Left",
                        "assistive_device_1": "AFO",
                        "assistive_device_2": "AFO",
                        "weight_bearing_status_1": "FWB",
                        "weight_bearing_status_2": "",
                        "assistance_device_2": "1 Assistant",
                        "distance": "",
                        "duration": "10",
                        "remarks": "AAAAA",
                        "before_bp": "Y",
                        "before_spo2": "Y",
                        "after_bp": "Y",
                        "after_spo2": "Y",
                        "handheld_remark": "Y",
                        "handheld_remark_details": "This is remark"
                    }
                ]
            }
        }
        if (result?.data?.StatusCode === 400) {
            callback && callback();
        } else {
            callback && callback(response)
        }
    } catch (error) {

    }
}


function* getPatientDetailsMasterList(action) {
    const { } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_DETAIL, payload: { isLoading: true } });
        // const response1 = yield call(api.patientDetail.getPatientPrescription, {});
        const response = {
            "therapist_list": [
                {
                    "therapist_id": "Y2KMED",
                    "therapist_name": "Wong Tai Man",
                    "therapist_rank": "OT II",
                },
                {
                    "therapist_id": "@ABCDE",
                    "therapist_name": "Cheung Tai Man",
                    "therapist_rank": "OT I",
                }
            ],
            "paitent_detail_type": [
                {
                    "type": "o2",
                    "value": "0.5"
                },
                {
                    "type": "o2",
                    "value": "0"
                },
                {
                    "type": "patient_conditions",
                    "value": "Upper Limb Amputee",
                    "subtype": "Amputee"
                },
                {
                    "type": "patient_conditions",
                    "value": "Lower Limb Amputee",
                    "subtype": "Amputee"
                },
                {
                    "type": "wheelchair",
                    "value": "W/C Standard 18 inch"
                },
                {
                    "type": "wheelchair",
                    "value": "W/C Standard 16 inch"
                }
            ],
            "precaution": [
                {
                    "precaution_name": "Contact Precaution",
                    "precaution_id": "OT01"
                },
                {
                    "precaution_name": "Droplet Precaution",
                    "precaution_id": "OT02"
                }
            ]

        }
        const { precaution } = response;

        // callback && callback();
        yield put({ type: ActionTypes.SET_DETAIL, payload: { precautionList: precaution, isLoading: false } });

    } catch (error) {

    }
}

function* getEVitalRecord(action) {
    // const { callback } = action.payload;
    const {
        login_id = '@CMSIT',
        case_no = 'HN06000037Z',
        hosp_code = 'TPH' } = action.payload;
    try {
        yield put({
            type: ActionTypes.SET_DETAIL,
            payload: { isLoading: true }
        });
        const params = { login_id, case_no, hosp_code }
        const res = yield call(api.patientDetail.getEVitalRecord, params);
        // const res = {
        //     "request": {
        //         "login_id": "@CMSIT",
        //         "hosp_code": "TPH",
        //         "case_no": "HN06000037Z"
        //     },
        //     "response": {
        //         "evital_record_bp": [
        //             {
        //                 "sbp": 90,
        //                 "dbp": 170,
        //                 "pulse": 80,
        //                 "o2": 1,
        //                 "record_datetime": '2022/02/18 11: 22: 33.000',
        //                 "position": 'SIT',
        //                 "record_from": 'HANDHELD'
        //             },
        //             {
        //                 "sbp": 90,
        //                 "dbp": 170,
        //                 "pulse": 80,
        //                 "o2": 1,
        //                 "record_datetime": '2022 / 02 / 18 11: 22: 33.000',
        //                 "position": 'SIT',
        //                 "record_from": 'HANDHELD'
        //             }
        //         ],
        //         "evital_record_spo2": [
        //             {
        //                 "spo2": 80,
        //                 "pulse": 80,
        //                 "record_datetime": '2022/02/18 11: 22: 33.000',
        //                 "record_from": 'HANDHELD'
        //             },
        //             {
        //                 "spo2": 80,
        //                 "pulse": 80,
        //                 "record_datetime": '2022 / 02 / 18 11: 22: 33.000',
        //                 "record_from": 'HANDHELD'
        //             }
        //         ]
        //     }
        // }
        const response = res.data.response;
        const { evital_record_sbp, evital_record_spo2 } = response;
        // callback && callback(response);
        yield put({
            type: ActionTypes.SET_DETAIL,
            payload: { bpList: evital_record_sbp, spList: evital_record_spo2, isLoading: false }
        });

    } catch (error) {
        // console.log(error)
    }
}

function* updateEVitalRecord(action) {
    const { callback, login_id, hosp_code, case_no,type,sbp,dbp,spo2,o2,pulse,position,record_datetime} = action.payload;
    try{
        const params = {
            login_id:'@CMSIT',
            hosp_code:'TPH',
            case_no:'HN06000037Z',
            type:'CONTINUOUS',
            evital_record:{
                sbp,dbp,spo2,o2,pulse,record_datetime,position,record_from:'HANDHELD'
            }
        }
        const response = yield call (api.patientDetail.updateEVitalRecord,params);
        const res = response?.data?.response?.status;
        if(res === 'SUCCESS'){
            callback&&callback(res);
        }
        else{
            callback&&callback();
        }
    }catch(error){

    }
}


function* watchPatientDetail() {
    yield takeLatest(ActionTypes.FETCH_PATIENT_DETAIL, safeSaga(getPatientDetail));
    yield takeLatest(ActionTypes.FETCH_PATIENT_PRECAUTION_ICON_LIST, safeSaga(getPrecautionsIconList));
    yield takeLatest(ActionTypes.FETCH_CURRENT_TREATMENT, safeSaga(getCurrentTreatment));
    yield takeLatest(ActionTypes.FETCH_SET_TREATMENT, safeSaga(setTreatmentDetail));
    yield takeLatest(ActionTypes.FETCH_UPDATE_TREATMENT_REMARKS, safeSaga(updateTreatmentRemarks));
    yield takeLatest(ActionTypes.FETCH_PATIENT_DETAILS_MASTER_LIST, safeSaga(getPatientDetailsMasterList));
    yield takeLatest(ActionTypes.FETCH_E_VITAL_LIST, safeSaga(getEVitalRecord));
    yield takeLatest(ActionTypes.SET_E_VITAL_LIST,safeSaga(updateEVitalRecord));
}

export function* watchers() {
    yield all([
        watchPatientDetail(),
    ]);
}
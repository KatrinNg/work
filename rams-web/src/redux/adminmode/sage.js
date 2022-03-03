import { takeLatest, takeEvery, all, put, call, takeLeading, select } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';

function* getSideList(action) {
    const state = yield select();
    const { loginInfo } = state.global;
    const { login_id, hosp_code, dept } = loginInfo;
    try {
        const response = yield call(api.adminMode.getSideList, { login_id, hosp_code, dept, type: "side" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { sideList: response.data.response.treatment_properties_dept } });
        }
    } catch (error) {
        console.log(error)
    }
}

function* updateSideList(action) {
    const state = yield select();
    const { loginInfo } = state.global;
    const { login_id, hosp_code, dept } = loginInfo;
    const { treatment_properties_dept } = action.payload
    try {
        const res = yield call(api.adminMode.updateSideList, { login_id, hosp_code, dept, treatment_properties_dept })
        console.log('side res', res);
    } catch (error) {

    }
}

function* getHotList(action) {
    const { dept } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const response = yield call(api.adminMode.getHotList, {...action.payload});
//        const response = {
//            req_no: '21TPHOT00000001',
//            hot_items:
//                dept === 'OT'
//                    ? [
//                        { sort: 1, treatment_name: 'APT 2', display: 'Y' },
//                        { sort: 2, treatment_name: 'Power Trainer', display: 'Y' },
//                        { sort: 3, treatment_name: 'Shoulder Board', display: 'Y' },
//                        { sort: 7, treatment_name: 'Cycle', display: 'Y' },
//                        { sort: 5, treatment_name: 'Double Prostretch', display: 'Y' },
//                        { sort: 4, treatment_name: 'Balance Trainer', display: 'Y' },
//                        { sort: 8, treatment_name: 'Standing Frame', display: 'Y' },
//                        { sort: 6, treatment_name: 'E-sanding', display: 'Y' },
//                        { sort: 9, treatment_name: 'Shoulder Area', display: 'Y' },
//                    ]
//                    : [
//                        { sort: 1, treatment_name: 'APT 2', display: 'Y' },
//                        { sort: 2, treatment_name: 'Power Trainer', display: 'Y' },
//                        { sort: 3, treatment_name: 'Shoulder Board', display: 'Y' },
//                        { sort: 7, treatment_name: 'Cycle', display: 'Y' },
//                        { sort: 5, treatment_name: 'Double Prostretch', display: 'Y' },
//                        { sort: 4, treatment_name: 'Balance Trainer', display: 'Y' },
//                        { sort: 8, treatment_name: 'Standing Frame', display: 'Y' },
//                        { sort: 6, treatment_name: 'E-sanding', display: 'Y' },
//                        { sort: 9, treatment_name: 'Shoulder Area', display: 'Y' },
//                    ],
//        };
        //const { prescription_data } = response;    //SET_HOTLIST_DATA
        const result = response?.data?.response?.hot_items;
        console.log(result)
        if (Array.isArray(result)) {
            yield put({
                type: ActionTypes.SET_ADMINMODE_DATA, payload: { hotList: result, hotList_treatment_name: [{ treatment_name: '--' }, ...result] }
            });
        } else if (typeof result === 'string') {
            const noDataArray = [
                { sort: 1, treatment_name: '--', display: 'Y' },
                { sort: 2, treatment_name: '--', display: 'Y' },
                { sort: 3, treatment_name: '--', display: 'Y' },
                { sort: 4, treatment_name: '--', display: 'Y' },
                { sort: 5, treatment_name: '--', display: 'Y' },
                { sort: 6, treatment_name: '--', display: 'Y' },
                { sort: 7, treatment_name: '--', display: 'Y' },
                { sort: 8, treatment_name: '--', display: 'Y' },
                { sort: 9, treatment_name: '--', display: 'Y' },
            ]
            console.log(noDataArray)
            yield put({
                type: ActionTypes.SET_ADMINMODE_DATA, payload: { hotList: noDataArray, hotList_treatment_name: [{ treatment_name: '--' }, ...noDataArray] }
            });
        }
    } catch (error) { }
}
function* updateHotList(action) {
    const { login_id, hosp_code, dept, hot_items, room_id } = action.payload;
    console.log(login_id, hosp_code, dept ,hot_items, room_id)
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const response = yield call(api.adminMode.updateHotList, {login_id, hosp_code, dept ,hot_items, room_id});
        // const response = {};
        if (response.status === 200) {
            action?.callback();
        }
        // const payload = { updateHotList: response.protocol_data };
        // yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: action.payload });
    } catch (error) { }
}
function* getGroupList(action) {
    try {
        const res = yield call(api.adminMode.getGroupList, action.payload);
        const response = res.data.response

        // const response = {
        //     therapeutic_group_name:[
        //         {
        //             group_name:'pT testing1',
        //             category:'cacdafadad',
        //             status:'ACTIVE'
        //         },
        //         {
        //             group_name:'p112T testing1',
        //             category:'casdwvcxxcadad',
        //             status:'ACTIVE'
        //         },
        //         {
        //             group_name:'p321T testing1',
        //             category:'cacdabdad',
        //             status:'ACTIVE'
        //         },
        //     ]
        // }
        const request = {
            login_id: "@CMSIT",
            dept: "OT",
            hosp_code: "TPH"
        };
        yield put({ type: ActionTypes.SET_GROUPLIST_DATA, payload: { groupList: response.therapeutic_group_name } });
    } catch (error) { }
}

function* updateGroupList(action) {
    const { login_id, hosp_code, dept, therapeutic_group_name } = action.payload
    try {
        const res = yield call(api.adminMode.updateGroupList, { login_id, hosp_code, dept, action:action.payload?.action, therapeutic_group_name })
        console.log('side res', res);
    } catch (error) {

    }
}

function* getVitalSignTypeList(action) {
    try {
        const res = yield call(api.adminMode.getVitalSignTypeList, action.payload);
        const response = res.data.response
        const request = {
            login_id: '@CMSIT',
            hosp_code: 'TPH',
            dept: 'OT',
        };
        // const response1 = {
        //     evital_default:[
        //         {
        //             dbp_lower:75,
        //             dbp_upper:105,
        //             sbp_lower:80,
        //             sbp_upper:185,
        //             spo2:90,
        //             updated_by:'@CMSIT'
        //         }
        //     ]
        // }
        yield put({
            type: ActionTypes.SET_VITALSIGNTYPELIST_DATA,
            payload: { vitalSignTypeList: response.evital_default[0] },
        });
    } catch (error) { }
}

function* getProtocolList(action) {
    const { login_id, hosp_code, dept } = action.payload;
    try {
        const response = yield call(api.adminMode.getProtocolList, { login_id, hosp_code, dept });
        // const response = {
        //     protocol_data: [
        //         {
        //             protocol_name: 'Training',
        //             protocol_status: 'ACTIVE',
        //             protocol_treatment_list: [
        //                 {
        //                     treatment_sort: '1',
        //                     treatment_category: 'Mobilization and strengthening',
        //                     treatment_name: 'Power Trainer',
        //                     treatment_doc: 'Limb Mobilization and Strengthening',
        //                     position: 'Plinth',
        //                     side: 'Left',
        //                     region: 'Upper Limb',
        //                     treatment_set: '5',
        //                     repetition: 'As tolerated',
        //                     resistance: 'Red',
        //                     resistance_unit: 'lb',
        //                     walking_aids: 'Stick Left',
        //                     assistive_device_1: 'AFO',
        //                     assistive_device_2: 'AFO',
        //                     weight_bearing_status_1: 'FWB',
        //                     weight_bearing_status_2: '',
        //                     assistance_device_2: '1 Assistant',
        //                     distance: '',
        //                     duration: '10',
        //                     befor_bp: 'Y',
        //                     befor_spo2: 'Y',
        //                     after_bp: 'Y',
        //                     after_spo2: 'Y',
        //                     handheld_remark: 'Y',
        //                 },
        //                 {
        //                     treatment_sort: '2',
        //                     treatment_category: 'Mobilization and strengthening',
        //                     treatment_name: 'Mini-press',
        //                     treatment_doc: 'Limb Mobilization and Strengthening',
        //                     position: 'Stand',
        //                     side: 'Left',
        //                     region: 'Upper Limb',
        //                     treatment_set: '1',
        //                     repetition: 'As tolerated',
        //                     resistance: 'Red',
        //                     resistance_unit: 'lb',
        //                     walking_aids: 'Stick Left',
        //                     assistive_device_1: 'AFO',
        //                     assistive_device_2: 'AFO',
        //                     weight_bearing_status_1: 'FWB',
        //                     weight_bearing_status_2: '',
        //                     assistance_device_2: '2 Assistant',
        //                     distance: '',
        //                     duration: '5',
        //                 },
        //             ],
        //         },
        //         {
        //             protocol_name: 'Training 2',
        //             protocol_status: 'ACTIVE',
        //             protocol_treatment_list: [
        //                 {
        //                     treatment_sort: '1',
        //                     treatment_category: 'Mobilization and strengthening',
        //                     treatment_name: 'APT2',
        //                     treatment_doc: 'Limb Mobilization and Strengthening',
        //                     position: 'Plinth',
        //                     side: 'Left',
        //                     region: 'Upper Limb',
        //                     treatment_set: '5',
        //                     repetition: 'As tolerated',
        //                     resistance: 'Red',
        //                     resistance_unit: 'lb',
        //                     walking_aids: 'Stick Left',
        //                     assistive_device_1: 'AFO',
        //                     assistive_device_2: 'AFO',
        //                     weight_bearing_status_1: 'FWB',
        //                     weight_bearing_status_2: '',
        //                     assistance_device_2: '1 Assistant',
        //                     distance: '',
        //                     duration: '10',
        //                 },
        //                 {
        //                     treatment_sort: '2',
        //                     treatment_category: 'Mobilization and strengthening',
        //                     treatment_name: 'Cycle',
        //                     treatment_doc: 'Limb Mobilization and Strengthening',
        //                     position: 'Stand',
        //                     side: 'Left',
        //                     region: 'Upper Limb',
        //                     treatment_set: '1',
        //                     repetition: 'As tolerated',
        //                     resistance: 'Red',
        //                     resistance_unit: 'lb',
        //                     walking_aids: 'Stick Left',
        //                     assistive_device_1: 'AFO',
        //                     assistive_device_2: 'AFO',
        //                     weight_bearing_status_1: 'FWB',
        //                     weight_bearing_status_2: '',
        //                     assistance_device_2: '2 Assistant',
        //                     distance: '',
        //                     duration: '5',
        //                 },
        //             ],
        //         },
        //     ],
        // };

        if (response.status === 200) {
            const res = Array.isArray(response.data.response.protocol_data)?response.data.response.protocol_data:[];
            const payload = dept === 'OT' ? { protocolOTData : res } : { protocolList : res }
        yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: payload });}
    } catch (error) { }
}

function* updateProtocolList(action) {
    const { login_id, hosp_code, dept, protocol_data, callback = () => { } } = action.payload;
    try {
        const res = yield call(api.adminMode.updateProtocolList, { login_id, hosp_code, dept, protocol_data, action: action.payload?.action });
        callback(res.data?.response?.status);
        if (res.data?.response?.status === 'SUCCESS') {
            const res2 = yield call(api.adminMode.getProtocolList, { login_id, hosp_code, dept });
            if (res2.status === 200) {
                const res = Array.isArray(res2.data.response.protocol_data)?res2.data.response.protocol_data:[];
                const payload = dept === 'OT' ? { protocolOTData : res } : { protocolList : res }
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: payload });}
        }
    } catch (error) { }
}

function* getRoomList(action) {
    const { login_id, hosp_code, dept } = action.payload;
    try {
        const response = yield call(api.adminMode.getRoomListInActivity, { login_id, hosp_code, dept });
        const payload = { roomList: response.data.response.room_list };
        if (response.status === 200) {
        yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: payload });}
    } catch (err) { }
}

function* getActivityListByRoom(action) {
    const { login_id, hosp_code, dept, room_id } = action.payload;

    try {
        const response = yield call(api.adminMode.getActivityListByRoom, { login_id, hosp_code, dept, room_id });

        if (response.status === 200){
        const payload = { activityListByRoom: response.data.response.room_treatment };
        yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: payload });}
    } catch (error) { }
}

function* getWeightBearingStatus1List(action) {
    const { login_id, hosp_code, dept } = action.payload

    try {
        const response = yield call(api.adminMode.getWeightBearingStatus1List, { login_id, hosp_code, dept, type: "weight_bearing_status_1" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { weightBearingStatus1List: response.data.response.treatment_properties_dept } });
        }
    } catch (error) {
        console.log(error)
    }
}

function* getWeightBearingStatus2List(action) {
    const { login_id, hosp_code, dept } = action.payload

    try {
        const response = yield call(api.adminMode.getWeightBearingStatus2List, { login_id, hosp_code, dept, type:'weight_bearing_status_2' });
        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { weightBearingStatus2List: response.data.response.treatment_properties_dept } });
        }
    } catch (error) {
        console.log(error)
    }
}

function* saveActivityList(action) {
    const { callback = () => { }, room_treatment, login_id, hosp_code, dept, room_id } = action.payload;
    try {
        const res = yield call(api.adminMode.saveActivityList, {room_treatment, login_id, hosp_code, dept, room_id});
        const response = res.data.response;
        if(res.status === 200)
        {
            callback(response);
            if (response?.status === 'SUCCESS') {
                const res = yield call(api.adminMode.getActivityListByRoom, { login_id, hosp_code, dept, room_id });
                const payload = { activityListByRoom: res.data.response.room_treatment };
                yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: payload });
            }
        }
        
    } catch (error) {
        console.log(error);
    }
}

function* getCategoryList(action) {

    const { login_id, hosp_code, dept } = action.payload
    try {
        const response = yield call(api.adminMode.getCategoryList, { login_id, hosp_code, dept });

        if(response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { categoryList: response.data.response.category_dept } });
        }


    } catch (error) {
        console.log(error)
    }
}
function* saveCategoryList(action) {

    const {callback, login_id, hosp_code, dept, category_dept } = action.payload
    try {
        const response = yield call(api.adminMode.updateCategoryList, { login_id, hosp_code, dept, category_dept });

        if (response.status === 200) {
            callback(response.data.response.status)
        }


    } catch (error) {
        console.log(error)
    }
}

function* getPositionList(action) {
    const { login_id, hosp_code, dept } = action.payload

    try {
        const response = yield call(api.adminMode.getPositionList, { login_id, hosp_code, dept, type: "position" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { positionList: response.data.response.treatment_properties_dept } });
        }


    } catch (error) {
        console.log(error)
    }
}

function* getDurationList(action) {
    const { login_id, hosp_code, dept } = action.payload

    try {
        const response = yield call(api.adminMode.getDurationList, {login_id, hosp_code, dept, type: "duration"});
        if(response.status === 200){
        yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { durationList: response.data.response.treatment_properties_dept } });
        }
    } catch (error) {
        console.log(error)
    }
}

function* getSetList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getSetList, { login_id, hosp_code, dept, type: "treatment_set" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { setList: response.data.response.treatment_properties_dept } });
        }
    } catch (error) {
        console.log(error)
    }
}

function* getRepetitionList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getRepetitionList, { login_id, hosp_code, dept, type: "repetition" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { repetitionList: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}

function* getResistanceList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getResistanceList, { login_id, hosp_code, dept, type: "resistance" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { resistanceList: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}

function* getResistanceUnitList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getResistanceUnitList, { login_id, hosp_code, dept, type: "resistance_unit" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { resistanceUnitList: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}
function* getWalkingAidsList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getWalkingAidsList, { login_id, hosp_code, dept, type: "walking_aids" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { walkingAidsList: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}
function* getAssistiveDevice1List(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getAssistiveDevice1List, { login_id, hosp_code, dept, type: "assistive_device_1" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { assistiveDevice1List: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}
function* getAssistiveDevice2List(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getAssistiveDevice2List, { login_id, hosp_code, dept, type: "assistive_device_2" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { assistiveDevice2List: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}
function* getAssistanceList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getAssistanceList, { login_id, hosp_code, dept, type: "assistance" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { assistanceList: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}

function* getRegionList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {

        const response = yield call(api.adminMode.getAssistanceList, { login_id, hosp_code, dept, type: "region" });

        if (response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { regionList: response.data.response.treatment_properties_dept } });
        }

    } catch (error) {
        console.log(error)
    }
}

function* saveTreatmentProperties(action) {
    const { callback, login_id, hosp_code, dept, treatment_properties_dept } = action.payload
    try {
        const response = yield call(api.adminMode.saveTreatmentProperties, {
            login_id, hosp_code, dept, treatment_properties_dept
        });

        if (response.status === 200) {
            callback(response.data.response.status)
        }

    } catch (error) {
        console.log(error)
    }
}

function* getCategoryGroupList(action) {
    const { login_id, hosp_code, dept } = action.payload
    try {
        const response = yield call(api.adminMode.getCategoryGroupList, { login_id, hosp_code, dept });

        if(response.status === 200) {
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: { categoryGroupList: response.data.response.therapeutic_category_hosp } });
        }

    } catch (error) {
        console.log(error)
    }
}

function* saveCategoryGroupList(action) {
    const { callback, login_id, hosp_code, dept, therapeutic_category_hosp } = action.payload
    try {
        const response = yield call(api.adminMode.updateCategoryGroupList, {
            login_id, hosp_code, dept, therapeutic_category_hosp
        });

        if (response.status === 200) {
            callback(response.data.response.status)
        }

    } catch (error) {
        console.log(error)
    }
}

function* updateVitalSignTypeList(action) {
    const { login_id, hosp_code, dept,evital_default,callback } = action.payload
    let request = {
        login_id, hosp_code, dept
    }
    try {
        const res = yield call(api.adminMode.updateVitalSignTypeList, { login_id, hosp_code, dept ,evital_default});
        // callback(res.data?.response?.status);
        if (res.data?.response?.status === 'SUCCESS') {
            const res2 = yield call(api.adminMode.getVitalSignTypeList, { ...request });
            callback();
            let payload = {vitalSignTypeList: res2.data.response.evital_default[0]};
            yield put({ type: ActionTypes.SET_ADMINMODE_DATA, payload: payload });
        }
    } catch (error) {
        console.log(error)
    }
}

function* getTreatmentList(action) {
      
}




function* watchAdminModeDetail() {
    yield takeLatest(ActionTypes.FETCH_HOTLIST_DATA, safeSaga(getHotList));
    yield takeLatest(ActionTypes.FETCH_GROUPLIST_DATA, safeSaga(getGroupList));
    yield takeLatest(ActionTypes.UPDATE_GROUPLIST_DATA, safeSaga(updateGroupList));
    yield takeLatest(ActionTypes.FETCH_CATEGORY_GROUPLIST_DATA, safeSaga(getCategoryGroupList));
    yield takeLatest(ActionTypes.SAVE_CATEGORY_GROUPLIST_DATA, safeSaga(saveCategoryGroupList));
    yield takeLatest(ActionTypes.FETCH_VITALSIGNTYPELIST_DATA, safeSaga(getVitalSignTypeList));
    yield takeLatest(ActionTypes.UPDATE_VITALSIGNTYPELIST_DATA, safeSaga(updateVitalSignTypeList));
    yield takeLatest(ActionTypes.FETCH_PROTOCOL_DATA, safeSaga(getProtocolList));
    yield takeLatest(ActionTypes.UPDATE_PROTOCOL_DATA, safeSaga(updateProtocolList));
    yield takeLatest(ActionTypes.UPDATE_HOTLIST_DATA, safeSaga(updateHotList));
    yield takeLatest(ActionTypes.FETCH_ROOM_LIST_IN_ACTIVITY, safeSaga(getRoomList));
    yield takeLatest(ActionTypes.FETCH_ACTIVITY_LIST_BY_ROOM, safeSaga(getActivityListByRoom));
    yield takeLatest(ActionTypes.UPDATE_ACTIVITY_LIST, safeSaga(saveActivityList));
    yield takeLatest(ActionTypes.FETCH_SIDELIST_DATA, safeSaga(getSideList));
    yield takeLatest(ActionTypes.UPDATE_SIDELIST_DATA, safeSaga(updateSideList));
    yield takeLatest(ActionTypes.FETCH_WEIGHT_BEARING_Status_1, safeSaga(getWeightBearingStatus1List));
    yield takeLatest(ActionTypes.FETCH_WEIGHT_BEARING_STATUS_2, safeSaga(getWeightBearingStatus2List));
    yield takeLatest(ActionTypes.FETCH_ADMIN_CATEGORY_LIST, safeSaga(getCategoryList));
    yield takeLatest(ActionTypes.SAVE_ADMIN_CATEGORY_LIST, safeSaga(saveCategoryList));
    yield takeLatest(ActionTypes.FETCH_POSITION_LIST, safeSaga(getPositionList));
    yield takeLatest(ActionTypes.FETCH_DURATION_LIST, safeSaga(getDurationList));
    yield takeLatest(ActionTypes.FETCH_SET_LIST, safeSaga(getSetList));
    yield takeLatest(ActionTypes.FETCH_REPETITION_LIST, safeSaga(getRepetitionList));
    yield takeLatest(ActionTypes.FETCH_RESISTANCE_LIST, safeSaga(getResistanceList));
    yield takeLatest(ActionTypes.FETCH_RESISTANCE_UNIT_LIST, safeSaga(getResistanceUnitList));
    yield takeLatest(ActionTypes.FETCH_WALKING_AIDS_LIST, safeSaga(getWalkingAidsList));
    yield takeLatest(ActionTypes.FETCH_ASSISTIVE_DEVICE_1_LIST, safeSaga(getAssistiveDevice1List));
    yield takeLatest(ActionTypes.FETCH_ASSISTIVE_DEVICE_2_LIST, safeSaga(getAssistiveDevice2List));
    yield takeLatest(ActionTypes.FETCH_ASSISTANCE_LIST, safeSaga(getAssistanceList));
    yield takeLatest(ActionTypes.FETCH_REGION_LIST, safeSaga(getRegionList));
    yield takeLatest(ActionTypes.FETCH_TREATMENT_LIST, safeSaga(getTreatmentList));
    yield takeLatest(ActionTypes.SAVE_TREATMENT_PROPERTIES, safeSaga(saveTreatmentProperties));
}

export function* watchers() {
    yield all([watchAdminModeDetail()]);
}

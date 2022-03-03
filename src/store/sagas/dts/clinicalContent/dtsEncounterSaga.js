import { take, call, put, select, all } from 'redux-saga/effects';
import * as encounterActionType from '../../../actions/dts/clinicalContent/encounterActionType';
import { maskAxios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';
import * as dentalCCService from '../../../../services/dts/dentalCCService';
import _ from 'lodash';

function* updateEncounter() {

    while(true){
         let { params, callback, maskMode } = yield take(encounterActionType.UPDATE_ENCOUNTER);
        //

        console.log('dtsEncounterSaga.js > updateEncounter() > '+JSON.stringify(params));

       // let data = {respCode:1};
         let { data } = yield call(dentalCCService.updateEncounter, params, true);

        if (data.respCode === 0) {
            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });

             //yield put({ type: encounterActionType.GET_ENCOUNTER, params});
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* updatePractitioner() {

    while(true){
         let { params, callback, maskMode } = yield take(encounterActionType.UPDATE_PRACTITIONER);


        //console.log('dtsEncounterSaga.js > updatePractioner() > '+JSON.stringify(params));

        let { data } = yield call(dentalCCService.updatePractitioner, params, true);

        if (data.respCode === 0) {
            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getLatestEncounter() {
    while(true){
        let { params, callback} = yield take(encounterActionType.GET_LATEST_ENCOUNTER);

         console.log('dtsEncounterSaga.js > getLatestEncounter() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-cc/encounter/getLatestEncounter', {params:{patientKey: params.patientKey}});

        // console.log('getMedicialHistoryByEncounter.js > '+JSON.stringify(data));
        if (data.respCode === 0){

             if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }

            let latestEncounter = {latestEncounter: data.data};
            yield put({ type: encounterActionType.GET_LATEST_ENCOUNTER_SAGA, latestEncounter: latestEncounter });



        } else if (data.respCode == 100){ // no snapshot record found
            callback && callback({});
        } else {
            // console.log('getMedicialHistoryByEncounter.js > '+JSON.stringify(data));
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}


        // if (data.respCode === 0) {
        //     let latestEncounter = data.data;
        //     console.log('getLatestEncounter: ' + JSON.stringify(latestEncounter));
        //     yield put({ type: encounterActionType.GET_LATEST_ENCOUNTER_SAGA, latestEncounter: latestEncounter });

        //     callback && callback();
        //     // if (callback && typeof callback === 'function'){
        //     //     callback();
        //     // }
        // } else {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '110031'
        //         }
        //     });
        // }



function* getRoomList() {
    while(true){
        let { params } = yield take(encounterActionType.GET_ROOM_LIST);

        // console.log('dtsAppointmentBookingSaga.js > mockRoomList() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/cmn/sites/'+params.siteId+'/rooms');
        // let { data } = yield call(maskAxios.post, '/dental/mockRoomList', {clinicCd:params.clinicCd});
        if (data.respCode === 0) {
            let roomList = {roomList : data.data};
            yield put({ type: encounterActionType.GET_ROOM_LIST_SAGA, roomList: roomList });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}
function* getEncounterTypeList() {
    while(true){
        let action = yield take(encounterActionType.GET_ENCOUNTER_TYPE_LIST);
        let inputParams = action.params;


        let { data } = yield call(dentalCCService.getEncounterTypeList,
                {
                    params: {
                        roomIdList: (inputParams.roomIdList == null || inputParams.roomIdList.includes('*All')) ?
                                            null : _.join(inputParams.roomIdList, ','),
                        clinicId: inputParams.clinicId
                    }
                });

        if (data.respCode === 0) {
            let encounterTypeList = {encounterTypeList : data.data};
            yield put({ type: encounterActionType.GET_ENCOUNTER_TYPE_LIST_SAGA, encounterTypeList: encounterTypeList });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* insertEncounter() {
    while(true) {
        let { params, callback } = yield take(encounterActionType.INSERT_ENCOUNTER);

        let { data } = yield call(dentalCCService.insertEncounter, params, true);
        if (data.respCode === 0) {

            callback && callback();
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110915',
                    showSnackbar: true
                }
            });

        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* getPatientAppointment(){
    while(true){
        let { params, callback } = yield take(encounterActionType.GET_PATIENT_APPOINTMENT);


        let {data} = yield call(dentalCCService.getAppointmentByPatient, params);
        if (data.respCode === 0){
            let patientAppointmentList = {patientAppointmentList : data.data};
            callback && callback(data.data);
        }else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* getProblemAndQualifier() {
    while (true) {

        let { params} = yield take(encounterActionType.GET_PROBLEM_AND_QUALIFER);
        let { data } = yield call(maskAxios.get, '/dts-cc/encounter/getProblemAndQualifier/' + params.encntrId + '/' + params.patientKey);

        if (data.respCode === 0) {
            let problemQualifierList = {problemQualifierList: data.data};
            yield put({type: encounterActionType.GET_PROBLEM_AND_QUALIFER_SAGA, problemQualifierList: problemQualifierList});
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getProceduresAndQualifiers() {
    while (true) {
        let { params} = yield take(encounterActionType.GET_PROCEDURES_AND_QUALIFERS);
        let { data } = yield call(maskAxios.get, '/dts-cc/encounter/getProceduresAndQualifiers/' + params.encntrId + '/' + params.patientKey);

        if (data.respCode === 0) {
            let proceduresQualifiersList = {proceduresQualifiersList: data.data};
            yield put({type: encounterActionType.GET_PROCEDURES_AND_QUALIFERS_SAGA, proceduresQualifiersList: proceduresQualifiersList});
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}


function* getMedicialHistoryByEncounter(){
    while(true){
        let { params, callback } = yield take(encounterActionType.GET_MEDICIAL_HISTORY_SNAPSHOT_BY_ENCOUNTER);


        let {data} = yield call(dentalCCService.getMedicicalHistorySnapShotByEncounter, params.encounterId);
        // console.log('getMedicialHistoryByEncounter.js > '+JSON.stringify(data));
        if (data.respCode === 0){
            callback && callback(data.data);
        } else if (data.respCode == 100){ // no snapshot record found
            callback && callback({});
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* createMedicialHistory(){
    while(true){
        let { params, callback } = yield take(encounterActionType.CREATE_MEDICIAL_HISTORY_SNAPSHOT);


        let {data} = yield call(dentalCCService.createMedicicalHistorySnapShot, params);
        // console.log('createMedicialHistory.js > '+JSON.stringify(data));
        if (data.respCode === 0){
            callback && callback(data.data);
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110021',
                    showSnackbar: true
                }
            });
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* updateMedicialHistory(){
    while(true){
        let { params, callback } = yield take(encounterActionType.UPDATE_MEDICIAL_HISTORY_SNAPSHOT);

        let {data} = yield call(dentalCCService.updateMedicicalHistorySnapShot, params.snapshotId, params);
        // console.log('updateMedicialHistory.js > '+JSON.stringify(data));
        if (data.respCode === 0){
            callback && callback(data.data);
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* getCarryForwardData() {
    while (true) {


        let { params, callback} = yield take(encounterActionType.GET_CARRY_FORWARD_DATA);
        //let { data } = yield call(maskAxios.get, '/dts-cc/encounter/getCarryForwardData/' + params.encntrId + '/' + params.patientKey + '/' + params.sdt);

           let { data } = yield call(maskAxios.get, '/dts-cc/encounter/getCarryForwardData', {
            params:{
                encntrId: params.encntrId,
                patientKey: params.patientKey,
                sdt: params.sdt
            }
        });
        if (data.respCode === 0){
            callback && callback(data.data);
        } else if (data.respCode == 100){ // no snapshot record found
            callback && callback({});
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

        // if (data.respCode === 0) {

        //     //let carryFowardDataList = {carryFowardDataList: data.data};


        //     callback && callback(data.data);

        //     //yield put({type: encounterActionType.GET_CARRY_FORWARD_DATA_SAGA, carryFowardDataList: carryFowardDataList});


        // }

    }
}

function* getMedicialHistoryRfi(){
    while(true){
        let { params, callback } = yield take(encounterActionType.GET_MEDICIAL_HISTORY_RFI);


        let {data} = yield call(dentalCCService.getMedicicalHistoryRfi, params.patientKey,params.serviceCd);
        // console.log('getMedicialHistoryByEncounter.js > '+JSON.stringify(data));
        if (data.respCode === 0){
            callback && callback(data.data);
        }
        else if (data.respCode == 100){ // no rfi record found
            callback && callback({});
        }
        else {
            // console.log('getMedicialHistoryByEncounter.js > '+JSON.stringify(data));
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* createMedicialHistoryRfi(){
    while(true){
        let { params, callback } = yield take(encounterActionType.CREATE_MEDICIAL_HISTORY_RFI);


        let {data} = yield call(dentalCCService.createMedicicalHistoryRfi, params);
        // console.log('createMedicialHistory.js > '+JSON.stringify(data));
        if (data.respCode === 0){
            callback && callback(data.data);
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110021',
                    showSnackbar: true
                }
            });
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    }
}

function* getNotesAndProcedures() {
    while (true) {
        let { params} = yield take(encounterActionType.GET_NOTES_AND_PROCEDURES);

         let { data } = yield call(maskAxios.get, '/dts-cc/encounter/getMultiClinicalNoteAndProcedures', {
            params:{
                encntrId: params.encntrId,
                patientKey: params.patientKey,
                sRow: params.sRow,
                eRow: params.eRow
            }
        });

        if (data.respCode === 0) {

            let notesAndProceduresList = {notesAndProceduresList: data.data};
            yield put({type: encounterActionType.GET_NOTES_AND_PROCEDURES_SAGA, notesAndProceduresList: notesAndProceduresList});
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getDoseInstruction() {
    while (true) {
        let { params, callback} = yield take(encounterActionType.GET_DOSEINSTRUCTION);

        let { data } = yield call(maskAxios.post, '/moe/listPatientOrderDetail', params);
        if (data.respCode === 0) {
            let medProfileDtoList = data.data.prescriptionDto.map(item => item.medProfileDto);
            let doseInstructionList = [];
            medProfileDtoList.forEach(element => {
                element.forEach(item => {
                    item.doseInstruction && doseInstructionList.push(item.doseInstruction);
                });
            });
            let doseInstruction = doseInstructionList && doseInstructionList.join('\n');
            callback && callback(doseInstructionList);
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getLoginUserInfo() {
    while (true) {
        let { params,callback } = yield take(encounterActionType.GET_LOGIN_USERINFO);

        //let { data } = yield call(maskAxios.get, '/user/users', { data: params });
        let { data } = yield call(maskAxios.get, '/user/users', {params:{loginNames: params.loginNames, svcCds: params.svcCds}});
            if (data.respCode === 0) {
                 let userLoginInfo = {userLoginInfo: data.data};
                 yield put({type: encounterActionType.GET_LOGIN_USERINFO_SAGA, userLoginInfo: userLoginInfo});

                callback && callback(data);
            }else{
                yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });

            }
    }
}



export const dtsEncounterSaga = [updateEncounter,
                                 getLatestEncounter,
                                 updatePractitioner,
                                 getRoomList,
                                 getEncounterTypeList,
                                 insertEncounter,
                                 getPatientAppointment,
                                 getProblemAndQualifier,
                                 getProceduresAndQualifiers,
                                 getMedicialHistoryByEncounter,
                                 createMedicialHistory,
                                 updateMedicialHistory,
                                 getCarryForwardData,
                                 getMedicialHistoryRfi,
                                 createMedicialHistoryRfi,
                                 getNotesAndProcedures,
                                 getDoseInstruction,
                                 getLoginUserInfo];

import { take, put, call } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as messageActionType from '../../../actions/message/messageActionType';
import * as appointmentSlipFooterActionType from '../../../actions/administration/appointmentSlipFooter/appointmentSlipFooterActionType';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';

function* fetchRemarkDetails() {
    while (true) {
        let { para } = yield take(appointmentSlipFooterActionType.FETCH_REMARK_DETAILS);
        try{
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/appointment/getSlipRemark', para);

            if (data.respCode === 0) {
                let tempRemarks = data.data.appointmentSlipDetailDto || [];
                let length = tempRemarks.length;

                tempRemarks.forEach(remark => {
                    if (!remark.disPlayOrder) {
                        remark.disPlayOrder = '';
                    }
                    if (!remark.content) {
                        remark.content = '';
                    }
                });

                for (let i = length; i < 20; i++) {
                    tempRemarks.push({
                        disPlayOrder: '',
                        content: '',
                        encounterTypeCd: para.encounterTypeCd,
                        subEncounterTypeCd: para.subEncounterTypeCd
                    });
                }

                yield put({
                    type: appointmentSlipFooterActionType.LOAD_REMARK_DETAILS,
                    remarks: tempRemarks
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
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* loadEncounterTypeList() {
    while (true) {
        try{
            let { encounterTypeList } = yield take(appointmentSlipFooterActionType.LOAD_ENCOUNTER_TYPE_LIST);
            yield put(alsStartTrans());
            let tempEncounterList = [];
            if (encounterTypeList.length > 0) {
                encounterTypeList.forEach(d => {
                    tempEncounterList.push({
                        clinic: d.clinic,
                        subEncounterTypeList: [{ subEncounterTypeCd: '', shortName: '', isAll: true }, ...d.subEncounterTypeList],
                        description: d.description,
                        encounterTypeCd: d.encounterTypeCd,
                        existCode: d.existCode,
                        service: d.service,
                        shortName: d.shortName
                    });
                });
            }
            tempEncounterList = [
                { encounterTypeCd: '', shortName: '', subEncounterTypeList: [{ subEncounterTypeCd: '', shortName: '', isAll: true }], isAll: true },
                ...tempEncounterList
            ];
            yield put({
                type: appointmentSlipFooterActionType.LOAD_ENCOUNTER_SUCCESS,
                encounterList: tempEncounterList
            });
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* updateSlipFooter() {
    while (true) {
        try{
            let { para } = yield take(appointmentSlipFooterActionType.UPDATE_SLIP_FOOTER);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, 'appointment/insertSlipRemark', para);
            if (data.respCode === 0) {
                yield put({
                    type: messageActionType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110021'
                    }
                });
                yield put({
                    type: appointmentSlipFooterActionType.RELOAD_REMARKS_DETAILS,
                    remarks: data.data.appointmentSlipDetailDto
                });
            } else if (data.respCode === 1) {
                //todo parameterException
            } else if (data.respCode === 3) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032'
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

        }finally{
            yield put(alsEndTrans());
        }
    }
}


export const appointmentSlipFooterSaga = [
    fetchRemarkDetails,
    loadEncounterTypeList,
    updateSlipFooter
];
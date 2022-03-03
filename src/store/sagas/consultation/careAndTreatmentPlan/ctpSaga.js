import { takeLatest, take, call, put, select, all } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as CTPTypes from '../../../actions/consultation/careAndTreatmentPlan/ctpActionType';
import { OPEN_COMMON_MESSAGE } from '../../../actions/message/messageActionType';
import * as CTPUtil from '../../../../utilities/ctpUtilities';
import { codeList as codeType } from '../../../../constants/codeList';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../../als/alsLogSaga';

function* ctpSummary() {
    while (true) {
        let { rfrPara, flwupPara, hlthEduRcmdPara,callback } = yield take(CTPTypes.CTP_SUMAMRY);
        try{
            yield put(alsStartTrans());
            let rfrUrl = '/clinical-doc/referralLetter?';
            let flwupUrl = '/ana/Encounter?';
            let hlthEduRcmdUrl = '/ana/ctpEduRcmd?';
            for (let p in rfrPara) {
                rfrUrl += `${p}=${rfrPara[p]}&`;
            }
            rfrUrl = rfrUrl.substring(0, rfrUrl.length - 1);

            for (let flwP in flwupPara) {
                flwupUrl += `${flwP}=${flwupPara[flwP]}&`;
            }
            flwupUrl = flwupUrl.substring(0, flwupUrl.length - 1);

            for (let rcmdP in hlthEduRcmdPara) {
                hlthEduRcmdUrl += `${rcmdP}=${hlthEduRcmdPara[rcmdP]}&`;
            }
            hlthEduRcmdUrl = hlthEduRcmdUrl.substring(0, hlthEduRcmdUrl.length - 1);
            const [rfrLetter, flwup, hlthEduRcmd] = yield all([
                call(maskAxios.get, rfrUrl),
                call(maskAxios.get, flwupUrl),
                call(maskAxios.get, hlthEduRcmdUrl)
            ]);

            const service = yield select(state => state.common.serviceList);
            const clinic = yield select(state => state.common.clinicList);
            //load rfr letter data
            const rfrLetterData = rfrLetter.data;
            if (rfrLetterData && rfrLetterData.respCode === 0) {
                const group = yield select(state => state.common.group);
                const hospital = yield select(state => state.common.hospital);
                const specialty = yield select(state => state.common.specialty);
                let rfrLetterList = CTPUtil.loadRfrLetter(rfrLetterData.data, group, service, hospital, clinic, specialty);
                yield put({
                    type: CTPTypes.LOAD_REFERRAL_LETTER,
                    data: rfrLetterList
                });
            } else {
                yield put({
                    type: OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

            //load flwup data
            const flwUpData = flwup.data;
            if (flwUpData && flwUpData.respCode === 0) {
                const encntrTypes = yield select(state => state.common.encounterTypes);
                let flwUpList = CTPUtil.loadFlwUp(flwUpData.data.list, service, clinic, encntrTypes);
                yield put({
                    type: CTPTypes.LOAD_FOLLOW_UP,
                    data: flwUpList
                });
            } else {
                yield put({
                    type: OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

            //load hlth edu rcmd data
            const hlthEduRcmdData = hlthEduRcmd.data;
            if (hlthEduRcmdData && hlthEduRcmdData.respCode === 0) {
                const eudCatgry = yield select(state => state.common.commonCodeList[codeType.edu_catgry]);
                const hlthEduType = yield select(state => state.common.commonCodeList[codeType.hlth_edu_type]);
                let hlthEduRcmdList = CTPUtil.loadHlthEduRcmd(hlthEduRcmdData.data, eudCatgry, hlthEduType);
                yield put({
                    type: CTPTypes.LOAD_HLTH_EDU_RCMD,
                    data: hlthEduRcmdList
                });
            } else {
                yield put({
                    type: OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

            callback&&callback();
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* fetchReferralLetter64(action) {
    const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
    let {params, callback} = action;
    params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'Referral Letter').outDocTypeId;
    //let { data } = yield call(maskAxios.post, '/appointment/getReferralLetter', action.params);
    let { data } = yield call(maskAxios.get, `/doc-upload/docUpload/outDocuments/${params.outDocId}/file`, params);
    //let { data } = yield call(maskAxios.post, '/clinical-doc/referralLetter', params);
    if (data.respCode === 0) {
        // print({ base64: data.data, callback: action.callback, copies: action.copies });
        yield put({
            type: CTPTypes.LOAD_RFR_LETTER_64,
            data: data.data
        });

        callback && callback(data);
    }
    else if(data.respCode === 101){
        yield put({
            type: OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '70891'
            }
        });
    }
    else {
        yield put({
            type: OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getRfrLetterBase64() {
    yield alsTakeLatest(CTPTypes.PREVIE_RFR_LETTER, fetchReferralLetter64);
}

function* getTodayEncntrCTP() {
    // yield takeLatest(CTPTypes.GET_CTP_BY_TODAY_ENCNTR, fetchTodayEncntrCTP);
    while (true) {
        try{
            let { encntrId } = yield take(CTPTypes.GET_CTP_BY_TODAY_ENCNTR);
            yield put(alsStartTrans());

            const eduRcmdUrl = `/ana/CtpEduRcmd/${encntrId}`;
            const encntrUrl = `/ana/Encounter/${encntrId}`;
            const [encntr, eduRcmd] = yield all([
                call(maskAxios.get, encntrUrl),
                call(maskAxios.get, eduRcmdUrl)
            ]);

            //load flw up form encntrUrl
            const encntrData = encntr.data;
            if (encntrData && encntrData.respCode === 0) {
                yield put({
                    type: CTPTypes.LOAD_FLW_UP_FORM_ENCNTR,
                    data: encntrData.data
                });
            } else {
                yield put({
                    type: OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

            //load edu rcmd
            const eduRcmdData = eduRcmd.data;
            if (eduRcmdData && eduRcmdData.respCode === 0) {
                yield put({
                    type: CTPTypes.LOAD_TODAY_EDU_RCMD,
                    data: eduRcmdData.data
                });
            } else {
                yield put({
                    type: OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

            let hasTdCTP = true;
            if (!encntrData.data.flwUp && eduRcmdData.data.length === 0) {
                hasTdCTP = false;
            }
            yield put({
                type: CTPTypes.UPDATE_FIELD,
                updateData: { hasTdCTP }
            });
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* submitTdCTP() {
    while (true) {
        try{
            let { params, hasTdCTP, callback } = yield take(CTPTypes.SUBMIT_TODAY_CTP_DATA);
            yield put(alsStartTrans());

            const url = '/ana/CtpEduRcmd';
            if (hasTdCTP) {
                // update ctp
                let { data } = yield call(maskAxios.put, url, params);
                if (data.respCode === 0) {
                    yield put({
                        type: OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110023',
                            showSnackbar: true
                        }
                    });
                    yield put({
                        type: CTPTypes.UPDATE_FIELD,
                        updateData: { openCreateAndUpdate: false }
                    });
                    callback && callback();
                } else if (data.respCode === 1) {
                    yield put({
                        type: OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110053'
                        }
                    });
                } else {
                    yield put({
                        type: OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110031'
                        }
                    });
                }
            } else {
                let { data } = yield call(maskAxios.post, url, params);
                if (data.respCode === 0) {
                    yield put({
                        type: OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110021',
                            showSnackbar: true
                        }
                    });
                    yield put({
                        type: CTPTypes.UPDATE_FIELD,
                        updateData: { openCreateAndUpdate: false }
                    });
                    callback && callback();
                } else if (data.respCode === 1) {
                    yield put({
                        type: OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110053'
                        }
                    });
                } else {
                    yield put({
                        type: OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110031'
                        }
                    });
                }
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

export const ctpSaga = [
    ctpSummary,
    getRfrLetterBase64,
    getTodayEncntrCTP,
    submitTdCTP
];

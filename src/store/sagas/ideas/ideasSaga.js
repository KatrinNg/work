import * as types from '../../actions/ideas/ideasActionType';
import { take, call, put, fork, cancel, cancelled } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as registrationUtilities from '../../../utilities/registrationUtilities';
import * as sysConfig from '../../../configs/config';
import CommonMessage from '../../../constants/commonMessage';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from './../als/alsLogSaga';
import { updateState } from '../../actions/ideas/ideasAction';
import storeConfig from '../../storeConfig';
import pureAxios from 'axios';

function* getSmartCardToken() {
    while (true) {
        const { callback, errorCallback } = yield take(types.GET_SMART_CARD_TOKEN);
        try {
            yield put(alsStartTrans());

            let { data } = yield call(axios.get, '/ideas-ra/api/smartcard/token', { timeout: sysConfig.RequestTimedoutLong });

            if (data) {
                callback && callback(data?.data);
            }
        } catch (error) {
            // console.log(error);
            errorCallback && errorCallback('1');
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getSmartCardTokenV2() {
    while (true) {
        const { callback, errorCallback } = yield take(types.GET_SMART_CARD_TOKEN_V2);
        try {
            yield put(alsStartTrans());

            const { data } = yield call(axios.get, '/ideas-ra/api/smartcardv2/token', { timeout: sysConfig.RequestTimedoutLong });
            if (data) {
                const { tokenUrl } = data?.data;
                if (tokenUrl) {
                    callback && callback(tokenUrl);
                }
            }
        } catch (error) {
            // console.log(error);
            errorCallback && errorCallback('2');
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getCardType() {
    while (true) {
        yield take(types.GET_CARD_TYPE);
        try {
            // yield put(alsStartTrans());

            // let data=yield call(maskAxios.post,'/patient/retrievalIVRS',formData);
            const url = 'https://ideas:8000/jws';
            const param = new FormData();
            param.append('serv', 'getCardType');
            param.append('p1', null);
            param.append('p2', null);
            param.append('p3', null);
            param.append('p4', null);

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Access-Control-Allow-Origin': '*'
            };

            // fetch(
            //     url, {
            //         method: 'POST',
            //         headers: headers,
            //         body: JSON.stringify(param)
            //     }
            // ).then((data) => {
            //     if (data) {
            //         callback && callback(data);
            //     }
            // }).catch((error) => {
            //     console.log(error);
            //     callback && callback('error');
            // });
            let { data } = yield call(pureAxios.post, url, param, { headers: headers, responseType: 'text' });

            // console.log('getCardType done: ' + data);
            if (data) {
                storeConfig.store.dispatch(
                    updateState({
                        detectCardResult: data
                            .toString()
                            .replace(/(\r\n|\n|\r)/gm, '')
                            .replace(/\s+/g, '')
                    })
                );
            }
        } catch (error) {
            // console.log(error);
            storeConfig.store.dispatch(updateState({ detectCardResult: 'error' }));
        } finally {
            // yield put(alsEndTrans());
        }
    }
}

export const ideasSaga = [getSmartCardToken, getSmartCardTokenV2, getCardType];

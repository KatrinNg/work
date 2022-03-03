import { call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/administration/publicHoliday/publicHolidayActionType';
import * as commonType from '../../../actions/common/commonActionType';
import { print } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import {alsTakeLatest} from '../../als/alsLogSaga';


export function* fetchHolidayList(action) {
    let { param, callback } = action;
    let url = `/appointment/listHolidays/${param.yearFrom}/${param.yearTo}`;
    let { data } = yield call(maskAxios.get, url);

    if (data.respCode === 0) {
        yield put({ type: type.LOAD_HOLIDAY_LIST, holidayList: data.data });
        callback && callback();
    } else if (data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110319'
            }
        });
    } else if (data.respCode === 101) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110320'
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

function* getHolidayList() {
    yield alsTakeLatest(type.LIST_HOLIDAY, fetchHolidayList);
}

export function* printHolidayList(action) {
    let { param } = action;
    let url = `/appointment/getHolidayReport/${param.yearFrom}/${param.yearTo}`;
    let { data } = yield call(maskAxios.get, url);
    //let { data } = yield call(maskAxios.post, '/appointment/getYellowFeverExemptionLetter', action.params);
    if (data.respCode === 0) {
        yield print({ base64: data.data, callback: action.callback });
        yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
    } else if (data.respCode === 100) {
        yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110319'
            }
        });
    } else if (data.respCode === 101) {
        yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110320'
            }
        });
    } else {
        yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
        // yield put({
        //     type: type.UPDATE_FIELD,
        //     updateData: { handlingPrint: false }
        // });
    }
}

function* handleHolidayListPrinting() {
    yield alsTakeLatest(type.PRINT_HOLIDAY_LIST, printHolidayList);
}

export const publicHolidaySaga = [
    getHolidayList,
    handleHolidayListPrinting
];
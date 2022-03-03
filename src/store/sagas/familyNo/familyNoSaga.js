import { call, put, select } from '@redux-saga/core/effects';
import { format } from 'date-fns';
import { maskAxios } from '../../../services/axiosInstance';
import * as familyNoActionType from '../../actions/familyNo/familyNoActionType';
import { alsTakeEvery } from '../als/alsLogSaga';

// worker Saga
export function* getFamilyDataAsync(action) {
    const result = yield call(maskAxios.get, `/patient/cgs/familyNo/${action.payload.id}/patients`);

    if (result.data.respCode === 0)
        yield put({ type: familyNoActionType.UPDATE_STATE, payload: { familyData: result.data.data } });
    else yield put({ type: familyNoActionType.UPDATE_STATE, payload: { familyData: [] } });
}

export function* getBase64StringExcelData(action) {
    const familyData = yield select((state) => state.familyNo.familyData);

    const dto = {
        members: familyData,
        pass: action.payload.pass,
        reConfirmPass: action.payload.reConfirmPass
    };

    const result = yield call(maskAxios.post, '/patient/cgs/patients/xls', dto);

    if (result.data.respCode === 0) {
        yield put({ type: familyNoActionType.DIALOG_TOGGLE });

        const linkSource = `data:application/vnd.ms-excel;base64,${result.data.data}`;
        const downloadLink = document.createElement('a');
        const fileName = `cgsAppointment_${format(new Date(), 'dd_MM_yyyy')}`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }
}

// Our watcher Saga
export function* watcherAsync() {
    yield alsTakeEvery(familyNoActionType.GET_DATA, getFamilyDataAsync);
    yield alsTakeEvery(familyNoActionType.GET_BASE64_EXCEL_DATA, getBase64StringExcelData);
}

export const familyNoSaga = [watcherAsync];

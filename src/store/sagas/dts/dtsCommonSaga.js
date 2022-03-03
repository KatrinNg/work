import { take, call, put, all } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import moment from 'moment';
import * as messageType from '../../actions/message/messageActionType';
// import * as commonType from '../../../actions/common/commonActionType';
import * as attendanceActionType from '../../actions/dts/appointment/attendanceActionType';
import * as dtsCommonActionType from '../../actions/dts/dtsCommonActionType';
import * as remindAppointmentActionType from '../../actions/dts/appointment/remindAppointmentActionType';
import * as dentalService from '../../../services/dts/dentalService';
import {
    DTS_APPT_TEL_CNTCT_HX_NOTES,
    DTS_APPT_MAIL_CNTCT_HX_NOTES
} from '../../../constants/dts/appointment/DtsContactHistoryConstant';


function* getAnaCode(){
    while(true){
        let { params, callback } = yield take(dtsCommonActionType.GET_ANA_CODE);
        console.log('dtsCommonSaga.js > getAnaCode() > ' + JSON.stringify(params));

        // let { data } = yield call(dentalService.getAnaCode, params);
        let dataList = yield all(params.map(param => call(dentalService.getAnaCode, param))) ;
        for(let i=0;i<dataList.length;i++) {
            if (dataList[i].data.respCode === 0){
                let result =dataList[i].data.data;

                switch (result[0].category) {
                    case 'DTS ECS PERMIT REASON':
                        yield put({type: attendanceActionType.GET_ECS_PERMIT_REASON_LIST_SAGA, ecsPermitReasonList: result });
                        break;
                    case DTS_APPT_TEL_CNTCT_HX_NOTES:
                        yield put({type: remindAppointmentActionType.GET_TEL_NOTES_CODE_SAGA, contactHistoryTelNotesList: result });
                        break;
                    case DTS_APPT_MAIL_CNTCT_HX_NOTES:
                        yield put({type: remindAppointmentActionType.GET_MAIL_NOTES_CODE_SAGA, contactHistoryMailNotesList: result });
                        break;
                    default:
                        break;
                }

                if(callback){
                    if(Array.isArray(callback)){
                        callback.forEach(item => item());
                    }
                    else
                        callback();
                }
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
}

export const dtsCommonSaga = [
    getAnaCode
];

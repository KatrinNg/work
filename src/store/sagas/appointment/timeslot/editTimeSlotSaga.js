import { call, put, take } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as editTimeSlotActionType from '../../../actions/appointment/editTimeSlot';
// import * as commonType from '../../../actions/common/commonActionType';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../../als/alsLogSaga';
import moment from 'moment';
import { DateUtil } from '../../../../utilities';
// import _ from 'lodash';
// import moment from 'moment';
// import * as CommonUtilities from '../../../../utilities/commonUtilities';
// import storeConfig from '../../../storeConfig';
// import Enum from '../../../../enums/enum';

// function* fetchListTimeSlot(action) {
//     let { data } = yield call(maskAxios.post, '/appointment/listTimeSlot', action.params);
//     if (data.respCode === 0) {
//         yield put({ type: editTimeSlotActionType.PUT_LIST_TIME_SLOT, data: data.data });
//     } else if (data.respCode === 1) {
//         //todo parameterException
//     } else {
//         yield put({ type: editTimeSlotActionType.PUT_LIST_TIME_SLOT, data: [] });
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110031'
//             }
//         });
//     }
// }

// function* listTimeSlot() {
//     yield takeLatest(editTimeSlotActionType.LIST_TIME_SLOT, fetchListTimeSlot);
// }

// function* fetchinsertTimeSlot(action) {
//     let { data } = yield call(maskAxios.post, '/appointment/insertTimeSlot', action.params);
//     if (data.respCode === 0) {
//         yield put({ type: editTimeSlotActionType.LIST_TIME_SLOT, params: action.searchParams });
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110915'
//             }
//         });
//     } else if (data.respCode === 3) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110032'
//             }
//         });
//     } else if (data.respCode === 100) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110907'
//             }
//         });
//     } else if (data.respCode === 101) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110906'
//             }
//         });
//     } else if (data.respCode === 102) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110905'
//             }
//         });
//     } else {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110031'
//             }
//         });
//     }
// }

// function* insertTimeSlot() {
//     yield takeLatest(editTimeSlotActionType.INSERT_TIME_SLOT, fetchinsertTimeSlot);
// }

// function* fetchUpdateTimeSlot(action) {
//     let { data } = yield call(maskAxios.post, '/appointment/updateTimeSlot', action.params);
//     if (data.respCode === 0) {
//         yield put({ type: editTimeSlotActionType.LIST_TIME_SLOT, params: action.searchParams });
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110913'
//             }
//         });
//     } else if (data.respCode === 1) {
//         //todo parameterException
//     } else if (data.respCode === 3) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110032'
//             }
//         });
//     } else if (data.respCode === 100) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110906'
//             }
//         });
//     } else if (data.respCode === 101) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110905'
//             }
//         });
//     } else if (data.respCode === 102) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110904'
//             }
//         });
//     } else if (data.respCode === 103) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110903'
//             }
//         });
//     } else if (data.respCode === 104) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110930'
//             }
//         });
//     } else {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110031'
//             }
//         });
//     }
// }

// function* updateTimeSlot() {
//     yield takeLatest(editTimeSlotActionType.UPDATE_TIME_SLOT, fetchUpdateTimeSlot);
// }

// function* fetchDeleteTimeSlot(action) {
//     let { data } = yield call(maskAxios.post, '/appointment/deleteTimeSlot', action.params);
//     if (data.respCode === 0) {
//         yield put({ type: editTimeSlotActionType.LIST_TIME_SLOT, params: action.searchParams });
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110926'
//             }
//         });
//     } else if (data.respCode === 100) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110902'
//             }
//         });
//     } else if (data.respCode === 101) {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110903'
//             }
//         });
//     } else {
//         yield put({
//             type: messageType.OPEN_COMMON_MESSAGE,
//             payload: {
//                 msgCode: '110031'
//             }
//         });
//     }
// }

// function* deleteTimeSlot() {
//     yield takeLatest(editTimeSlotActionType.DELETE_TIME_SLOT, fetchDeleteTimeSlot);
// }

// function* fetchMultipleUpdate(action) {
//     let { data } = yield call(maskAxios.post, '/appointment/multipleUpdateTimeSlot', action.params);
//     if (data.respCode === 0) {
//         yield put({ type: editTimeSlotActionType.LIST_TIME_SLOT, params: action.searchParams });
//         yield put({ type: editTimeSlotActionType.PUT_MULTIPLE_UPDATE, data: data.data, updateParams: action.params });

//         let isWarning = false;
//         let multipleUpdateForm = _.cloneDeep(action.params);
//         let multipleUpdateData = _.cloneDeep(data.data);
//         if (multipleUpdateForm.delete) {
//             if (multipleUpdateData.booked && multipleUpdateData.booked.length > 0) {
//                 let updateDetails = '';
//                 for (let i = 0; i < multipleUpdateData.booked.length; i++) {
//                     const bookedItem = multipleUpdateData.booked[i];
//                     updateDetails += `- ${moment(bookedItem).format(Enum.DATE_FORMAT_24_HOUR)} `;
//                 }
//                 yield put({
//                     type: messageType.OPEN_COMMON_MESSAGE,
//                     payload: {
//                         msgCode: '110920',
//                         params: [{ name: 'SLOT_STR', value: updateDetails }]
//                     }
//                 });
//             } else {
//                 if (parseInt(multipleUpdateData.totalSuccessNum) > 0) {
//                     yield put({
//                         type: messageType.OPEN_COMMON_MESSAGE,
//                         payload: {
//                             msgCode: '110918',
//                             params: [{ name: 'ACTION', value: 'deleted' }],
//                             showSnackbar: true
//                         }
//                     });
//                 } else {
//                     yield put({
//                         type: messageType.OPEN_COMMON_MESSAGE,
//                         payload: {
//                             msgCode: '110919',
//                             params: [{ name: 'ACTION', value: 'Delete' }],
//                             showSnackbar: true
//                         }
//                     });
//                 }
//             }
//         } else {
//             let updateDetails = '', messageCode = '110917';
//             // if update on time block
//             if (multipleUpdateForm.newStartTime) {
//                 messageCode = '110929';
//                 // when overlapped
//                 if (multipleUpdateData.alreadyExist && multipleUpdateData.alreadyExist.length > 0) {
//                     updateDetails += 'Below timeslot overlapped! ';
//                     for (let i = 0; i < multipleUpdateData.alreadyExist.length; i++) {
//                         const existItem = multipleUpdateData.alreadyExist[i];
//                         updateDetails += `- ${moment(existItem).format(Enum.DATE_FORMAT_24_HOUR)} `;
//                     }
//                 }

//                 //when booked
//                 if (multipleUpdateData.booked && multipleUpdateData.booked.length > 0) {
//                     updateDetails += ' Update not allowed for the below booked Slot! ';
//                     for (let i = 0; i < multipleUpdateData.booked.length; i++) {
//                         const bookedItem = multipleUpdateData.booked[i];
//                         updateDetails += `- ${moment(bookedItem).format(Enum.DATE_FORMAT_24_HOUR)} `;
//                     }
//                 }
//             } else {
//                 if (multipleUpdateData.overBookedQuota && multipleUpdateData.overBookedQuota.length > 0) {
//                     updateDetails += 'New quota is less than booked appointment for the below Slot: ';
//                     let detailArr = [];
//                     let state = storeConfig.store.getState();
//                     const clinicConfig = state.common.clinicConfig;
//                     const service = state.login.service;
//                     const clinic = state.login.clinic;

//                     const where = {
//                         serviceCd: service.serviceCd,
//                         clinicCd: clinic.clinicCd,
//                         encounterCd: multipleUpdateForm.encounterTypeCd,
//                         subEncounterCd: multipleUpdateForm.subEncounterTypeCd
//                     };
//                     let quotaDescArray = CommonUtilities.getQuotaDescArray(clinicConfig, where);
//                     for (let i = 0; i < multipleUpdateData.overBookedQuota.length; i++) {
//                         const bookedItem = multipleUpdateData.overBookedQuota[i];
//                         let str = `   ${moment(bookedItem.slotDate).format(Enum.DATE_FORMAT_EDMY_VALUE)} ${bookedItem.startTime} Quota [${bookedItem.newQuota}]/Booked [${bookedItem.bookedQuota}] `;
//                         let index = detailArr.findIndex(item => item.name === `${bookedItem.caseType}${bookedItem.quotaType}`);
//                         let detailDto = {};
//                         if (index > -1) {
//                             detailDto = detailArr[index];
//                             detailDto.content = detailDto.content + str;
//                             detailArr[index] = detailDto;
//                         } else {
//                             const quotaDesc = quotaDescArray && quotaDescArray.find(item => item.code === bookedItem.quotaType);
//                             detailDto = {
//                                 name: `${bookedItem.caseType}${bookedItem.quotaType}`,
//                                 label: `- ${CommonUtilities.getCaseTypeDesc(bookedItem.caseType)} ${quotaDesc && quotaDesc.engDesc}: `,
//                                 content: str
//                             };
//                             detailArr.push(detailDto);
//                         }
//                     }
//                     detailArr.forEach(item => {
//                         updateDetails += `${item.label} ${item.content}`;
//                     });
//                 }
//             }

//             if (updateDetails) {
//                 if (messageCode === '110929') {
//                     isWarning = true;
//                 }
//                 yield put({
//                     type: messageType.OPEN_COMMON_MESSAGE,
//                     payload: {
//                         msgCode: messageCode,
//                         params: [{ name: 'SLOT_STR', value: updateDetails }]
//                     }
//                 });
//             } else {
//                 if (parseInt(multipleUpdateData.totalSuccessNum) > 0) {
//                     yield put({
//                         type: messageType.OPEN_COMMON_MESSAGE,
//                         payload: {
//                             msgCode: '110918',
//                             params: [{ name: 'ACTION', value: 'updated' }],
//                             showSnackbar: true
//                         }
//                     });
//                 } else {
//                     yield put({
//                         type: messageType.OPEN_COMMON_MESSAGE,
//                         payload: {
//                             msgCode: '110919',
//                             params: [{ name: 'ACTION', value: 'Update' }],
//                             showSnackbar: true
//                         }
//                     });
//                 }
//             }
//         }

//         action.callback && action.callback(isWarning);
//     } else if (data.respCode === 1) {
//         //todo parameterException
//     } else {
//         yield put({
//             type: commonType.OPEN_ERROR_MESSAGE,
//             error: data.errMsg ? data.errMsg : 'Service error',
//             data: data.data
//         });
//     }
// }

// function* multipleUpdate() {
//     yield takeLatest(editTimeSlotActionType.MULTIPLE_UPDATE, fetchMultipleUpdate);
// }

function* getTimeSlotList() {
    while (true) {
        try{
            let { params, callback } = yield take(editTimeSlotActionType.GET_TIMESLOT_LIST);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/ana/timeslots', { params: params });
            if (data.respCode === 0) {
                yield put({ type: editTimeSlotActionType.PUT_LIST_TIME_SLOT, data: data.data });
                callback && callback(data.data);
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

function* insertTimeSlot() {
    while (true) {
        try{
            let { params, callback } = yield take(editTimeSlotActionType.INSERT_TIMESLOT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/ana/timeslots', params);
            if (data.respCode === 0) {
                callback && callback();
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110915',
                        showSnackbar: true
                    }
                });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110907',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110901',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110906',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 104) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110908',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 105) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110909',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 107) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
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

function* updateTimeSlot() {
    while (true) {
        try{
            let { params, callback } = yield take(editTimeSlotActionType.UPDATE_TIMESLOT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.put, '/ana/timeslots/' + params.id, params);
            if (data.respCode === 0) {
                callback && callback();
            } else if (data.respCode === 3) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110032' } });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110907',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110901',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110906',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 104) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110908',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            }else if (data.respCode === 105) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110909',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 107) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
            } else if (data.respCode === 108) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110910',
                        showSnackbar: true,
                        variant: 'warning'
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

function* deleteTimeSlot() {
    while (true) {
        try{
            let { id, callback } = yield take(editTimeSlotActionType.DELETE_TIMESLOT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.delete, '/ana/timeslots/' + id);
            if (data.respCode === 0) {
                callback && callback();
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110926',
                        showSnackbar: true
                    }
                });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110904'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110901',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110910',
                        showSnackbar: true,
                        variant: 'warning'
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

function* multiUpdateSave() {
    yield alsTakeLatest(editTimeSlotActionType.MULTI_UPDATE_SAVE, function*(actions) {
        const { funcName, params, callback } = actions;
        let { data } = yield call(maskAxios.post, '/ana/multipleUpdate', params);
        if (data.respCode === 0) {
            let msg = '';
            if (data.data.overlapTimeRanges && data.data.overlapTimeRanges.length > 0) {
                msg += 'The following timeslot(s) is overlapped: <br />';
                data.data.overlapTimeRanges.forEach(item => {
                    msg += `<b>${DateUtil.getFormatDate(item.date)}</b>&nbsp;&nbsp;&nbsp;Start Time: <b>${item.stime}</b>&nbsp;&nbsp;&nbsp;End Time: <b>${item.etime}</b><br />`;
                });
            }
            if (data.data.sessNotMatchTimeRanges && data.data.sessNotMatchTimeRanges.length > 0) {
                msg += 'The following start/end time is session not match time ranges: <br />';
                data.data.sessNotMatchTimeRanges.forEach(item => {
                    msg += `Start Time: <b>${item.stime}</b>&nbsp;&nbsp;&nbsp;End Time: <b>${item.etime}</b><br />`;
                });
            }
            if (data.data.bookedTimeRanges && data.data.bookedTimeRanges.length > 0) {
                msg += 'The following timeslot(s) had been booked: <br />';
                data.data.bookedTimeRanges.forEach(item => {
                    msg += `<b>${DateUtil.getFormatDate(item.date)}</b>&nbsp;&nbsp;&nbsp;Start Time: <b>${item.stime}</b>&nbsp;&nbsp;&nbsp;End Time: <b>${item.etime}</b><br />`;
                });
            }
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110808',
                    params: [
                        { name: 'FUNC_NAME', value: funcName },
                        { name: 'PARAGRAPH', value: msg },
                        { name: 'INSERT_NUM', value: data.data.insertNum || 0 },
                        { name: 'UPDATE_NUM', value: data.data.updateNum || 0 },
                        { name: 'DELETE_NUM', value: data.data.deleteNum || 0 }
                    ],
                    btnActions: {
                        btn1Click: () => {
                            callback && callback();
                        }
                    }
                }
            });
        }
    });
}

export const editTimeSlotSaga = [
    // listTimeSlot,
    insertTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    // multipleUpdate
    getTimeSlotList,
    multiUpdateSave
];
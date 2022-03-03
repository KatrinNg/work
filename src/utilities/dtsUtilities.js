import moment from 'moment';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import _ from 'lodash';
import * as CommonUtilities from './commonUtilities';
import { axios } from '../services/axiosInstance';
import * as DtsBookingConstant from '../constants/dts/appointment/DtsBookingConstant';
import storeConfig from '../store/storeConfig';
import { getPatientById as getPatient } from '../store/actions/patient/patientAction';
import { checkPatientUnderCare } from '../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import { openCommonMessage } from '../store/actions/message/messageAction';
import { getPatientAppointment } from '../store/actions/dts/appointment/bookingAction';
import { skipTab } from '../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../enums/accessRightEnum';

export const formatDateParameter = (obj, format = null) => {
    const formatFunc = momentObj => {
        if (format) {
            return momentObj.format(format);
        } else {
            return momentObj.format(); // YYYY-MM-DDTHH:mm:ss+08:00
        }
    };

    if (typeof obj === 'string') {
        if (/^\d{4}-(?:0[1-9]|1[0-2])-(?:[0-2]\d|30|31)$/.test(obj)) {
            return formatFunc(moment(obj, 'YYYY-MM-DD'));
        } else if (/^\d{4}-(?:0[1-9]|1[0-2])-(?:[0-2]\d|30|31)\s(?:[0-1]\d|2[0-3]):[0-5]\d$/.test(obj)) {
            return formatFunc(moment(obj, 'YYYY-MM-DD HH:mm'));
        } else if (
            /^\d{4}-(?:0[1-9]|1[0-2])-(?:[0-2]\d|30|31)T(?:[0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\.\d{3})?\+08:00$/.test(obj) ||
            /^\d{4}-(?:0[1-9]|1[0-2])-(?:[0-2]\d|30|31)T(?:[0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\.\d{3})?Z$/.test(obj)
        ) {
            return formatFunc(moment(obj));
        } else {
            return null;
        }
    } else if (obj instanceof moment && obj.isValid()) {
        return formatFunc(obj);
    } else {
        return null;
    }
};

export const getAllAppointmentTimeslot = (appointment, commonAna = false) => {
    return _.flatten(
        appointment.appointmentDetlBaseVoList
            .filter(item => commonAna ? !item.isObs : !item.isObsolete)[0]
            .mapAppointmentTimeSlotVosList.filter(item => commonAna ? !item.isObs : !item.isObsolete)
            .map(item => commonAna ? item : item.timeslotVo)
    );
};

export const getAppointmentDuration = (appointment, commonAna = false) => {
    let appointmentTimeSlot = getAllAppointmentTimeslot(appointment, commonAna);
    let duration = 0;
    if (!commonAna) {
        duration = appointmentTimeSlot.map(item => moment(item.endTime, 'HH:mm').diff(moment(item.startTime, 'HH:mm'), 'minutes')).reduce((a, b) => a + b);
    } else {
        duration = appointmentTimeSlot.map(item => moment(item.edtm).diff(moment(item.sdtm), 'minutes')).reduce((a, b) => a + b);
    }
    return duration;
};

export const formatUndefinedToZero = obj => {
    if (typeof obj === 'undefined') return 0;
    return obj;
};

export const getAppointmentStartTime = appointment => {
    let time = moment(
        _.min(
            appointment.appointmentDetlBaseVoList
                .filter(d => !d.isObsolete)[0]
                .mapAppointmentTimeSlotVosList.filter(d => !d.isObsolete)
                .map(d => d.startDtm)
        )
    );

    return moment(appointment.appointmentDateTime).set({ hour: time.get('hour'), minute: time.get('minute') });
};

export const getAppointmentEncounterTypeId = appointment => {
    return appointment.appointmentDetlBaseVoList.filter(appointment => !appointment.isObsolete)[0].encounterTypeId;
};

export const getPatientName = patient => {
    let patientEngName = CommonUtilities.getFullName(patient.engSurname, patient.engGivename);
    let patientChiName = patient.nameChi;

    let patientName = patientChiName;
    if (patientName) {
        patientName += ' ' + patientEngName;
    } else {
        patientName = patientEngName;
    }

    return patientName;
};
//getPatientNameWithBracket
export const getPatientNameWithOrder = (engName, chiName, chineseNameFirst) => {
    if (chineseNameFirst) {
        let patientName = chiName;
        if (patientName) {
            patientName += ' ' + engName;
        } else {
            patientName = engName;
        }
        return patientName;
    } else {
        let patientName = chiName;
        if (patientName) {
            patientName = engName + ' (' + patientName + ')';
        } else {
            patientName = engName;
        }
        return patientName;
    }
};
export const getInitial = name => {
    let nameParts = name.split(' ');

    return nameParts
        .filter(s => s && s.trim() != '')
        .map(s => s.trim())
        .map(s => s.trim().charAt(0).toUpperCase())
        .join();
};

export const appointmentHasDifferenceOn = (type, appointment, value) => {
    let checkValue = null;
    let dateTimeFormatter = 'HH:mm';
    switch (type) {
        case DtsBookingConstant.DTS_APPOINTMENT_DATE:
            return !moment(value).isSame(moment(appointment.appointmentDateTime), 'day');
        case DtsBookingConstant.DTS_APPOINTMENT_START_TIME:
            checkValue = getAppointmentStartTime(appointment).format(dateTimeFormatter);
            value = value ? moment(value.timeslotDate).format(dateTimeFormatter) : null;
            break;
        case DtsBookingConstant.DTS_APPOINTMENT_DURATION:
            checkValue = getAppointmentDuration(appointment);
            break;
        case DtsBookingConstant.DTS_APPOINTMENT_SURGERY:
            checkValue = appointment.roomId;
            break;
        case DtsBookingConstant.DTS_APPOINTMENT_ENCTR_TYPE:
            checkValue = getAppointmentEncounterTypeId(appointment);
            break;
        case DtsBookingConstant.DTS_APPOINTMENT_JUSTIFICATION:
            checkValue = appointment.appointmentJustificationVo.exemptReason;
            break;
        case DtsBookingConstant.DTS_APPOINTMENT_SPECIAL_REQUEST:
            checkValue = appointment.appointmentSpecialRequestVo.remark;
            break;
        default:
            break;
    }
    return checkValue !== value;
};

export const maskDocNo = docNo => (docNo && docNo.length > 4 ? docNo.replace(/.(?!.{4})/gm, '*') : docNo);

export const formatPatientKey = patient => `${patient && patient.idSts === 'T' ? 'T' : ''}${patient && patient.patientKey ? ('' + patient.patientKey).padStart(10, '0') : null}`;

export const formatDtsRoomListToSurgery = (roomList) => {
    return {
        rmId: roomList.roomId,
        rmCd: roomList.roomCode,
        rmDesc: roomList.roomDescription,
        phn: roomList.phone,
        phnExt: roomList.phoneExt,
        remark: roomList.remark,
        efftDate: roomList.efftectiveDate,
        expyDate: roomList.expiryDate,
        status: roomList.status,
        createBy: roomList.createBy,
        createDtm: roomList.createDtm,
        updateBy: roomList.updateBy,
        updateDtm: roomList.updateDtm,
        version: roomList.version,
        isPhys: roomList.isPhysical,
        rmType: roomList.roomType,
        isRfr: roomList.isReferral,
        rmDescVds: roomList.isExactMatchTimeslotSearch,
        isExactMatchTmsltSrch: roomList.roomDescriptionVds,
        siteId: roomList.siteId,
        sspecId: roomList.specialtyId
    };
};

//input : list of category Ids
//output : list of Descriptions
export const getCodeDescriptionByCategory = (categoryList, codeList, codeType) => {
    let result = [];
    let type = codeType.toLowerCase();
    if (type == 'ana') {
        for (let i = 0; i < categoryList.length; i++) {
            codeList.map(list => {
                if (list.category === categoryList[i]) {
                    result.push({ 'codAnaId': list.codAnaId, 'code': list.code, 'description': list.remark });
                }
            });
        }
        return result;
    }
    if (type == 'cnc') {
        for (let i = 0; i < categoryList.length; i++) {
            codeList.map(list => {
                if (list.category === categoryList[i]) {
                    result.push({ 'codCncId': list.codCncId, 'code': list.code, 'description': list.remark });
                }
            });
        }
        return result;
    }
};

export const getCodeDescriptionByCodeId = (codeIds, codeList, codeType) => {
    let result = [];
    let type = codeType.toLowerCase();
    if (type == 'ana') {
        for (let i = 0; i < codeIds.length; i++) {
            codeList.map(list => {
                if (list.codAnaId === codeIds[i]) {
                    result.push({ 'codAnaId': list.codAnaId, 'code': list.code, 'description': list.remark });
                }
            });
        }
        return result;
    }
    if (type == 'cnc') {
        for (let i = 0; i < codeIds.length; i++) {
            codeList.map(list => {
                if (list.codCncId === codeIds[i]) {
                    result.push({ 'codCncId': list.codCncId, 'code': list.code, 'description': list.remark });
                }
            });
        }
        return result;
    }
};

export const formatDateChineseDayOfWeekLabel = obj => {
    // let tempDate = obj;
    // let loIsDate = new Date(obj);
    // let weekday = ['(日)', '(一)', '(二)', '(三)', '(四)', '(五)', '(六)'];
    // let tempDay = '';
    // if (loIsDate != 'Invalid Date') {
    //     tempDay = loIsDate.getDay();
    // } else {
    //     tempDay = 0;
    // }
    // tempDate = tempDate.split('-').reverse().join('-') + '   ' + weekday[tempDay];
    console.log('formatDateChineseDayOfWeekLabel-obj:' + obj);
    let weekday = ['(日)', '(一)', '(二)', '(三)', '(四)', '(五)', '(六)'];
    let tempDay = weekday[moment(obj).day()];
    let tempDate = moment(obj).format('DD-MM-YYYY');
    let formatDate = tempDate + '   ' + tempDay;
    //console.log('formatDateChineseDayOfWeekLabel-tempDate:' + formatDate);

    return formatDate;
};
export const getPrintParam = (params, queue, orientation, tray, size, clinicList, config) => {
    // let queue = `${FORM_NAME}_PRINT_QUEUE`;
    // let orientation = `${FORM_NAME}_PRINT_ORIENTATION`;
    // let tray = `${FORM_NAME}_PRINT_TRAY`;
    // let size = `${FORM_NAME}_PRINT_PAPER_SIZE`;
    console.log('check print queue');
    const printQueueParam = CommonUtilities.getHighestPrioritySiteParams(queue, clinicList, config);
    params = printQueueParam && printQueueParam.paramValue ? { ...params, printQueue: printQueueParam.paramValue } : params;

    const orientationParam = CommonUtilities.getHighestPrioritySiteParams(orientation, clinicList, config);
    params = orientationParam && orientationParam.paramValue ? { ...params, orientation: parseInt(orientationParam.paramValue) } : params;

    const printTrayParam = CommonUtilities.getHighestPrioritySiteParams(tray, clinicList, config);
    params = printTrayParam && printTrayParam.paramValue ? { ...params, printTray: parseInt(printTrayParam.paramValue) } : params;

    const paperSizeParam = CommonUtilities.getHighestPrioritySiteParams(size, clinicList, config);
    params = paperSizeParam && paperSizeParam.paramValue ? { ...params, paperSize: parseInt(paperSizeParam.paramValue) } : params;
    return params;
};

export const TooltipWrapper = (props) => {
    const base = props.base;
    const message = props.message;
    const placement = props.placement;
    if (_.isEmpty(message)) {
        return base;
    }
    return (
        <Tooltip title={message} placement={placement}>
            {base}
        </Tooltip>
    );
};

export const getClinicRoomLabel = (defaultRoomId, roomList, clinicList) => {
    let defaultRoomObj = defaultRoomId && roomList.find(room => room.rmId === defaultRoomId);
    let defaultClinicObj = defaultRoomObj && clinicList.find(clinic => clinic.siteId === defaultRoomObj.siteId);
    let defaultRoomLabel = (defaultRoomObj && defaultClinicObj) ? (defaultClinicObj.siteCd + ' ' + defaultRoomObj.rmCd) : 'Nil';

    return defaultRoomLabel;
};

// Update patient object for promise function.
export async function getPatientById(patientKey) {
    let result = false;
    if (!patientKey)
        return true;

    let response = await axios.post('/patient/listPatientByIds', [patientKey]);
    if (response.status === 200) {
        if (response.data.respCode === 0) {
            result = response.data.data;
        }
    }
    return result;
}

export const checkEcsStatus = (checkEcsStatusRecord) => {
    if (checkEcsStatusRecord) {
        if (checkEcsStatusRecord.isValid // For HA state.ecs.selectedPatientEcsStatus
            || checkEcsStatusRecord.checkResult == 'Y') { // For DTS appointment.appointmentECSChk
            if (checkEcsStatusRecord.eligibleDental1 == 'Y' || checkEcsStatusRecord.eligibleDental2 == 'Y' // For HA state.ecs.selectedPatientEcsStatus
                || checkEcsStatusRecord.isEligibleDental1 || checkEcsStatusRecord.isEligibleDental2) { // For DTS appointment.appointmentECSChk
                return 'Y';
            } else {
                return 'N';
            }
        } else {
            return '?';
        }
    } else {
        return '';
    }
};

export const isEcsPassed = (patientEcsResult /* Result of checkEcsStatus */) => {
    return patientEcsResult == 'Y';
};

export const emptyInputMessage = (bookingInputType) => {
    const errorMessageDict = DtsBookingConstant.DTS_APPOINTMENT_EMPTY_INPUT_MSG;
    const defaultMessageKey = DtsBookingConstant.DTS_APPOINTMENT_VALUE;
    return errorMessageDict[bookingInputType] || errorMessageDict[defaultMessageKey];
};

export const getPatientInfo = (item, nonCheckPUC, reset, justificationAction = openCommonMessage({ msgCode: '140016' })) => {
    const loadPatientPanel = () => {
        let callBack = (patient) => {
            storeConfig.store.dispatch(getPatientAppointment(
                {
                    patientKey: patient.patientKey,
                    appointmentDateFrom: formatDateParameter(moment().subtract(5, 'years').set('hour', 0).set('minute', 0)),
                    appointmentDateTo: formatDateParameter(moment().add(5, 'years').set('hour', 23).set('minute', 59)),
                    includeDeletedAppointments: 1
                }
                , item.callback
                , { patient }
            ));
        };
        let params = {
            patientKey: item.patientKey,
            appointmentId: item.appointmentId,
            caseNo: item.caseNo,
            callBack: callBack,
            resetPatientList: reset
        };
        storeConfig.store.dispatch(getPatient(params));
    };
    if (!nonCheckPUC) {
        storeConfig.store.dispatch(checkPatientUnderCare(loadPatientPanel, reset, item, justificationAction));
    } else {
        loadPatientPanel();
    }
};

export const utilizationCalculation = (usableTimeSlot, totalTimeSlot) => {
    let result = 0;
    result = Math.round(usableTimeSlot / totalTimeSlot * 100);
    return result;
};
export const getAppointmentTypeDescription = (appointment) => (appointment.isUrgentSqueeze && appointment.isUrgentSqueeze == 1 ? 'Urgent Squeeze-In' : appointment.isUrgent && appointment.isUrgent == 1 ? 'Urgent' : appointment.isSqueeze && appointment.isSqueeze == 1 ? 'Squeeze-In' : 'Normal');

export const formatDocNo = (docTypeCd, docTypeNo) =>{
    if(docTypeCd === 'ID'){
        docTypeNo = docTypeNo.substring(0,8)+'('+docTypeNo.substring(8)+')';
        return docTypeNo;
    } else {
        return docTypeNo;
    }
};

export const getAppointmentStartEndTime = (selectedAppointmentTask) =>{
    return (
        moment.min(selectedAppointmentTask.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.map((item) => moment(item.startDtm || item.sdtm))).format('HH:mm') + '-' +
        moment.max(selectedAppointmentTask.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.map((item) => moment(item.endDtm || item.edtm))).format('HH:mm')
    );
};

export const getDocTypeDescByDocTypeCd = (docTypeCd) => {
    const state = storeConfig.store.getState();
    const docTypeList = state.common.commonCodeList.doc_type;
    if (docTypeList) {
        const docTypeDesc = docTypeList.find(item => item.code === docTypeCd);
        return docTypeDesc && docTypeDesc.engDesc;
    }
    return null;
};

export const getFutureAppointmentListDateWithTimeWeekInChinese = (list) => {
    let formatDateTimeInChinese = '';
    let tempDate = formatDateParameter(list.appointmentDateTime, 'DD-MMM-YYYY');
    let tempTime = moment.min(list.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.map((item) => moment(item.startDtm || item.sdtm))).format('HH:mm');
    let tempSession = ' AM/上午 ';
    if(tempTime.substring(0,2) - 12 > 0 ){
        tempTime = tempTime.substring(0,2) - 12 + tempTime.substring(2,5);
        tempSession = ' PM/下午 ';
    }
    let weekday = ['Sun/星期日', 'Mon/星期一', 'Tue/星期二', 'Wed/星期三', 'Thu/星期四', 'Fri/星期五', 'Sat/星期六'];
    let tempDay = weekday[moment(list.appointmentDateTime).day()];
    // let tempDate = moment(list.appointmentDateTimeobj).format('DD-MM-YYYY');

    formatDateTimeInChinese = tempDate + ' ' + tempTime + tempSession + tempDay;
    return formatDateTimeInChinese;
};

export const openEncounterPage = () => {
    storeConfig.store.dispatch(skipTab(accessRightEnum.CurrentEncounter, {patientKey: '', action: 'treatmentPlan', apptInfo: null}, true));
};

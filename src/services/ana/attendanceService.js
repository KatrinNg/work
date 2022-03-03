import {maskAxios} from '../axiosInstance';
import Enum from '../../enums/enum';
import moment from 'moment';
import * as encounterService from './encounterService';
import * as commonUtil from '../../utilities/commonUtilities';
import * as messageType from '../../store/actions/message/messageActionType';
import {dispatch} from '../../store/util';

const url = {
    attendance: '/ana/Attendances',
    familyAttendance: '/ana/cgs/attendances/batch/take'
};

export const takeAttendance = (params) => {
    return maskAxios.post(
        url.attendance,
        params
    );
};

export const takeFamilyAttendance = (params) => {
    return maskAxios.post(
        url.familyAttendance,
        params
    );
};

export const walkIn = (params) => {
    return maskAxios.patch(
        url.attendance,
        params
    );
};

export const markArrival = (params) => {
    params.shouldNotCreateEncounter = true;
    return maskAxios.post(
        url.attendance,
        params
    );
};

export const markFamilyArrival = (params) => {
    return maskAxios.post(
        url.familyAttendance,
        params
    );
};

export const editAttendance = (atndId ,params) => {
    return maskAxios.put(
        `${url.attendance}/${atndId}` ,
        params
    );
};

export const isPatientCanTakeAttendance = (clinic, clinicConfig, patientInfo) => {
    const {siteId, serviceCd} = clinic;
    const checkIdStsParam = commonUtil.getHighestPrioritySiteParams(
        Enum.CLINIC_CONFIGNAME.ATND_CHECK_ID_STS,
        clinicConfig,
        {siteId, serviceCd}
    );

    const checkIdSts = checkIdStsParam && checkIdStsParam.paramValue ? checkIdStsParam.paramValue === 'Y' : true;
    return checkIdSts && patientInfo.idSts !== 'N';
};

export const takeAttendanceResponseToConfirmReduxState = ({
    encounter,
    attendance,
    caseDto
}, curAppt, clinicList, encounterTypes, rooms) => {

    let site = null;
    let firstEncounterType = null;
    let firstRoom = null;

    if(curAppt && curAppt.siteId && clinicList){
        site = clinicList.find(s => s.siteId === curAppt.siteId);
    }

    if(curAppt && curAppt.appointmentDetlBaseVoList && curAppt.appointmentDetlBaseVoList.length && curAppt.appointmentDetlBaseVoList.length > 0){
        firstEncounterType = encounterTypes.find(et => et.encntrTypeId === curAppt.appointmentDetlBaseVoList[0].encntrTypeId);
        firstRoom = rooms.find(r => r.rmId === curAppt.appointmentDetlBaseVoList[0].rmId);
    }else if(curAppt && curAppt.encounterTypeId && curAppt.rmId){
        firstEncounterType = {
            encntrTypeId: curAppt.encounterTypeId,
            encounterTypeCd: curAppt.encounterTypeId
        };

        firstRoom = {
            rmId: curAppt.rmId,
            rmCd:curAppt.rmCd
        };
    }

    return {
        encounter: encounter? encounterService.encounterToReduxStore(encounter, site): null,
        attendance,
        atndId: attendance.atndId,
        appointmentId: attendance.apptId,
        patientKey: curAppt.patientKey,
        clinicCd: site ? site.siteCd: '',
        siteId: curAppt.siteId,
        encntrTypeId: firstEncounterType ? firstEncounterType.encntrTypeId : null,
        encounterTypeCd: firstEncounterType ? firstEncounterType.encounterTypeCd : '',
        encounterTypeId: firstEncounterType ? firstEncounterType.encntrTypeId : null,
        subEncounterTypeCd: '',
        rmId: firstRoom ? firstRoom.rmId : '',
        rmCd: firstRoom ? firstRoom.rmCd : '',
        appointmentDate: attendance.arrivalTime,
        appointmentTime: moment(attendance.arrivalTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
        caseTypeCd: null,
        patientStatusCd: '',
        attnTime: attendance.arrivalTime,
        caseNo: attendance.caseNo ? attendance.caseNo : '',
        discNumber: attendance.discNum,
        encntrTypeDesc: encounter && encounter.encntrTypeDesc,
        rmDesc: encounter && encounter.rmDesc,
        caseDto: caseDto || null,
        alias: attendance.alias || '',
        encntrGrpCd: caseDto ? caseDto.encntrGrpCd || '' : attendance.encntrGrpCd || ''
    };
};

export const editAttendanceResponseToReduxStore = (attendance, curAppt, clinicList, encounterTypes, rooms) => {

    let site = null;
    let firstEncounterType = null;
    let firstRoom = null;

    if(curAppt && curAppt.siteId && clinicList){
        site = clinicList.find(s => s.siteId === curAppt.siteId);
    }

    if(curAppt && curAppt.appointmentDetlBaseVoList && curAppt.appointmentDetlBaseVoList.length && curAppt.appointmentDetlBaseVoList.length > 0){
        firstEncounterType = encounterTypes.find(et => et.encntrTypeId === curAppt.appointmentDetlBaseVoList[0].encntrTypeId);
        firstRoom = rooms.find(r => r.rmId === curAppt.appointmentDetlBaseVoList[0].rmId);
    }else if(curAppt && curAppt.encounterTypeId && curAppt.rmId){
        firstEncounterType = {
            encntrTypeId: curAppt.encounterTypeId,
            encounterTypeCd: curAppt.encounterTypeId
        };

        firstRoom = {
            rmId: curAppt.rmId,
            rmCd:curAppt.rmCd
        };
    }

    return {
        attendance,
        atndId: attendance.atndId,
        appointmentId: attendance.apptId,
        patientKey: curAppt.patientKey,
        clinicCd: site ? site.siteCd: '',
        siteId: curAppt.siteId,
        encntrTypeId: firstEncounterType ? firstEncounterType.encntrTypeId : null,
        encounterTypeCd: firstEncounterType ? firstEncounterType.encounterTypeCd : '',
        encounterTypeId: firstEncounterType ? firstEncounterType.encntrTypeId : null,
        subEncounterTypeCd: '',
        rmId: firstRoom ? firstRoom.rmId : '',
        rmCd: firstRoom ? firstRoom.rmCd : '',
        appointmentDate: curAppt.apptDateTime,
        appointmentTime: curAppt.appointmentTime,
        attnTime: attendance.arrivalTime,
        caseNo: attendance.caseNo ? attendance.caseNo : '',
        discNumber: attendance.discNum

    };
};

export const handleOperationFailed=(respCode,headerName,moduleName,data)=>{
    if (respCode === 144) {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111243',
                params: [
                    { name: 'HEADER', value: headerName },
                    { name: 'MODULE_NAME', value: moduleName }
                ]
            }
        });
    } else if (respCode === 145) {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111244',
                params: [
                    { name: 'HEADER', value: headerName },
                    { name: 'MODULE_NAME', value: moduleName }
                ]
            }
        });
    } else if (respCode === 146) {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110155',
                params: [
                    { name: 'HEADER', value: headerName },
                    { name: 'MODULE_NAME', value: moduleName }
                ]
            }
        });
    } else if (respCode === 147) {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111242',
                params: [
                    { name: 'HEADER', value: headerName },
                    { name: 'MODULE_NAME', value: moduleName }
                ]
            }
        });
    }else if (respCode === 148) {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110139',
                params: [
                    { name: 'HEADER', value: headerName },
                    { name: 'MODULE_NAME', value: moduleName }
                ]
            }
        });
    } else if (respCode === 149) {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110140',
                params: [
                    { name: 'HEADER', value: headerName },
                    { name: 'MODULE_NAME', value: moduleName }
                ]
            }
        });
    } else if (respCode === 150) {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110153',
                params: [
                    { name: 'HEADER', value: headerName },
                    { name: 'MODULE_NAME', value: moduleName }
                ]
            }
        });
    } else if (respCode === 153) {
        let message = '';
        data.data.map((item,index)=>{
            message += (index+1)+'.'+item+'<br/>';
        });
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110076',
                params: [
                    { name: 'HEADER', value: data.errMsg },
                    { name: 'MESSAGE', value: message }
                ]
            }
        });
    } else {
        dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
};
import _ from 'lodash';
import moment from 'moment';
import { dispatch } from '../store/util';
import { openCommonMessage } from '../store/actions/message/messageAction';
import { UPDATE_ATTN_FAMILY_MEMBER, UPDATE_DATE_BACK_FAMILY_MEMBER, UPDATE_FAMILY_MEMBER, UPDATE_SELECTED_ATTN_FAMILY_MEMBER, UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER, UPDATE_SELECTED_FAMILY_MEMBER } from '../store/actions/appointment/booking/bookingActionType';

export function getPaitentStatusOption(patientStatus) {
    if (patientStatus) {
        let dataList = _.cloneDeep(patientStatus);
        dataList.splice(0, 0, { code: 'None', label: 'None' });
        return dataList;
    }
    return null;
}

export function showPsoReminder(patientInfo, callback) {
    if (patientInfo && patientInfo.psoInfo) {
        const { psoInfo } = patientInfo;
        if (psoInfo.withPsoriasis === 1) {
            if (psoInfo.withPASI === 1) {
                if (moment().diff(moment(psoInfo.dueDateOfLastPASI), 'days') >= 0) {
                    dispatch(openCommonMessage({
                        msgCode: '111017',
                        params: [{ name: 'CONTENT', value: psoInfo.reminderMsg || '' }],
                        btnActions:
                        {
                            btn1Click: () => {
                                callback && callback();
                            }
                        }
                    }));
                }
            } else if (psoInfo.withPASI === 0) {
                dispatch(openCommonMessage({
                    msgCode: '111017',
                    params: [{ name: 'CONTENT', value: psoInfo.reminderMsg || '' }],
                    btnActions:
                    {
                        btn1Click: () => {
                            callback && callback();
                        }
                    }
                }));
            }
        }
    }
}

export const attendancePatientParamsGenerator = (props, caseNoVal) => {
    const { currentAppointment, patientStatus, patientInfo, siteId, serviceCd, ecsChkId, restlChkId } = props;
    const isCaseDto = typeof caseNoVal === 'object';

    const patientParams = {
        apptId: currentAppointment.appointmentId,
        discNum:
            currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.discNum,
        isRealtime: true,
        patientKey: patientInfo.patientKey,
        patientStatusCd: patientStatus,
        //caseNo: params.caseNo || (caseDto ? null : caseNoInfo.caseNo),
        caseNo: isCaseDto ? null : caseNoVal,
        siteId: siteId,
        svcCd: serviceCd,
        ecsChkId: ecsChkId,
        restlChkId: restlChkId,
        nepRemark:
            currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep
                ? currentAppointment &&
                  currentAppointment.attendanceBaseVo &&
                  currentAppointment.attendanceBaseVo.nepRemark
                : null,
        isNep: currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep,
        apptVersion: currentAppointment.version,
        atndSrc: 'C',
        //caseDto: caseDto || null
        caseDto: isCaseDto ? caseNoVal : null
    };

    return patientParams;
};

export const attendanceFamilyParamsGenerator = (params, selectedFamilyMember) => {
    let familyMemberParams = selectedFamilyMember.map((member) => ({
        apptId: member.appts[0].appointmentId,
        discNum: params.discNum,
        isRealtime: true,
        patientKey: member.patientKey,
        patientStatusCd: params.patientStatusCd,
        //caseNo: params.caseNo || (caseDto ? null : caseNoInfo.caseNo),
        caseNo: params.caseNo,
        siteId: params.siteId,
        svcCd: params.svcCd,
        ecsChkId: params.ecsChkId,
        restlChkId: params.restlChkId,
        nepRemark: params.nepRemark,
        isNep: params.isNep,
        apptVersion: member.appts[0].version,
        atndSrc: 'C',
        //caseDto: caseDto || null
        caseDto: params.caseDto
    }));

    familyMemberParams.push(params);

    return { attendanceTakeDtos: familyMemberParams, isFamilyAttend: true };
};

export const markArrivalPatientParamsGenerator = (props, arrivalTime, discNum) => {
    const { isNep, nepRemark, currentAppointment, patientStatus, patientInfo, siteId, serviceCd, ecsChkId, restlChkId } = props;

    const patientParams = {
        apptId: currentAppointment.appointmentId,
        discNum: discNum,
        isRealtime: true,
        patientKey: patientInfo.patientKey,
        patientStatusCd: patientStatus,
        arrivalTime: arrivalTime ? arrivalTime.format(moment.HTML5_FMT.DATETIME_LOCAL_MS) : null,
        caseNo: currentAppointment.caseNo,
        siteId: siteId,
        svcCd: serviceCd,
        ecsChkId: ecsChkId,
        restlChkId: restlChkId,
        nepRemark: isNep ? nepRemark : null,
        isNep: isNep,
        apptVersion: currentAppointment.version,
        atndSrc: 'C',
        shouldNotCreateEncounter: true
    };

    return patientParams;
};

export const markArrivalFamilyParamsGenerator = (params, selectedFamilyMember) => {
    let familyMemberParams = selectedFamilyMember.map((member) => ({
        apptId: member.appts[0].appointmentId,
        discNum: params.discNum,
        isRealtime: true,
        patientKey: member.patientKey,
        patientStatusCd: params.patientStatusCd,
        arrivalTime: params.arrivalTime,
        caseNo: params.caseNo,
        siteId: params.siteId,
        svcCd: params.svcCd,
        ecsChkId: params.ecsChkId,
        restlChkId: params.restlChkId,
        nepRemark: params.nepRemark,
        isNep: params.isNep,
        apptVersion: member.appts[0].version,
        atndSrc: 'C',
        shouldNotCreateEncounter: true
    }));

    familyMemberParams.push(params);

    return { attendanceTakeDtos: familyMemberParams, isFamilyArrival: true };
};

export const initFamilyMemberInfo = (doNotInit = '') => {
    if (doNotInit !== 'attn') {
        dispatch({ type: UPDATE_ATTN_FAMILY_MEMBER, payload: { familyMember: [] } });
        dispatch({ type: UPDATE_SELECTED_ATTN_FAMILY_MEMBER, payload: { selectedData: [] } });
    }

    if (doNotInit !== 'dateBack') {
        dispatch({ type: UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER, payload: { selectedData: [] } });
        dispatch({ type: UPDATE_DATE_BACK_FAMILY_MEMBER, payload: { familyMember: [] } });
    }

    dispatch({ type: UPDATE_SELECTED_FAMILY_MEMBER, payload: { selectedData: [] } });
    dispatch({ type: UPDATE_FAMILY_MEMBER, payload: { familyMember: [] } });
};
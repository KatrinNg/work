import * as EcsUtilities from '../../utilities/ecsUtilities';
import Enums from '../../enums/enum';

export const regPatientInfoSelector = (state) => {
    let result = {...state.registration.patientBaseInfo};
    if(!result.documentPairList || (result.documentPairList && result.documentPairList.length == 0)){
        result.documentPairList = [];
        if(result.hkid){
            result.documentPairList.push(
                {
                    docTypeCd: Enums.DOC_TYPE.HKID_ID,
                    docNo: result.hkid
                }
            );
        }

        if(result.otherDocNo && result.docTypeCd){
            result.documentPairList.push(
                {
                    docTypeCd: result.docTypeCd,
                    docNo: result.otherDocNo
                }
            );
        }
    }

    if(result.primaryDocTypeCd && result.primaryDocNo){
        result.documentPairList.push(
            {
                docTypeCd: result.primaryDocTypeCd,
                docNo: result.primaryDocNo
            }
        );
    }
    return result;
} ;
export const regPatientKeySelector = (state) =>state.registration.patientById.patientKey? state.registration.patientById.patientKey: null;

export const summaryPatientInfoSelector = (state) =>state.patient.patientInfo ;
export const summaryPatientKeySelector = (state) => state.patient.patientInfo ? state.patient.patientInfo.patientKey : null;

export const patientInfoSelector = (state) =>state.patient.patientInfo;
export const patientKeySelector = (state) =>state.patient.patientInfo?state.patient.patientInfo.patientKey:null;

export const ecsSelector = (state, fnPatientInfo, fnPatientKey) => {
    const patientInfo = fnPatientInfo(state);
    const patientKey = fnPatientKey(state);
    return {
        accessRights: state.login.accessRights?state.login.accessRights:[],
        ecsUserId: state.login.loginInfo.ecsUserId,
        ecsLocCode: state.login.clinic.ecsLocCd,
        ecsServiceStatus: state.ecs.ecsServiceStatus,
        selectedPatientEcsStatus: state.ecs.selectedPatientEcsStatus,
        atndId: state.attendance.currentAppointment ?
            ( state.attendance.currentAppointment.attendanceBaseVo ?
                state.attendance.currentAppointment.attendanceBaseVo.atndId:
                null
            ) : null,
        docTypeCds: patientInfo && patientInfo.documentPairList? patientInfo.documentPairList.map(item => item.docTypeCd): [],
        docTypeCd: EcsUtilities.getProperDocTypeCdForEcs(patientInfo),
        hkicForEcs: EcsUtilities.getProperHkicForEcs(patientInfo),
        engSurname: patientInfo && patientInfo.engSurname,
        engGivename: patientInfo && patientInfo.engGivename,
        nameChi: patientInfo && patientInfo.nameChi,
        dob: patientInfo && patientInfo.dob,
        exactDobCd: patientInfo && patientInfo.exactDobCd,
        patientKey: patientKey,
        codeList: state.ecs.codeList,
        assoPersHkid: patientInfo && patientInfo.assoPersHkid
    };
};

export const ocsssSelector = (state, fnPatientInfo, fnPatientKey) => {
    const patientInfo = fnPatientInfo(state);
    const patientKey = fnPatientKey(state);
    return {
        accessRights: state.login.accessRights,
        ocsssServiceStatus: state.ecs.ocsssServiceStatus,
        atndId: state.attendance.currentAppointment ?
        ( state.attendance.currentAppointment.attendanceBaseVo ?
            state.attendance.currentAppointment.attendanceBaseVo.atndId:
            null
        ) : null,
        docTypeCds: patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.map(item => item.docTypeCd),
        docTypeCd: EcsUtilities.getProperDocTypeCdForEcs(patientInfo),
        hkicForEcs: EcsUtilities.getProperHkicForEcs(patientInfo),
        selectedPatientOcsssStatus: state.ecs.selectedPatientOcsssStatus,
        patientKey: patientKey,
        ecsUserId: state.login.loginInfo.ecsUserId,
        ecsLocId: state.login.clinic.ecsLocId
    };
};

export const mwecsSelector = (state, fnPatientInfo, fnPatientKey) => {
    const patientKey = fnPatientKey(state);
    const patientInfo = fnPatientInfo(state);
    let idNum = EcsUtilities.getProperHkicForEcs(patientInfo);
    let idType = Enums.MWECS_ID_TYPE_KEYS.hkid;

    if (!idNum && patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.length > 0){
        idType = Enums.MWECS_ID_TYPE_KEYS.otherDoc;
        idNum = patientInfo.documentPairList[0].docNo;
    }
    return {
        idType: idType,
        idNum: idNum,
        appointmentId: state.patient.appointmentInfo ? state.patient.appointmentInfo.appointmentId: null,
        serviceStatus: state.ecs.mwecsServiceStatus,
        accessRights: state.login.accessRights,
        selectedPatientMwecsStatus: state.ecs.selectedPatientMwecsStatus,
        openDialog: state.ecs.selectedPatientMwecsStatus.openDialog,
        activeComponent: state.ecs.selectedPatientMwecsStatus.activeComponent,
        patientKey: patientKey,
        ecsUserId: state.login.loginInfo.ecsUserId,
        ecsLocId: state.login.clinic.ecsLocId
    };
};
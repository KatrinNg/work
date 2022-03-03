import {maskAxios} from '../axiosInstance';

const url = {
    encounter: '/ana/encounter'
};

export const getEncounterById = (encounterId) => {
    return maskAxios.get(
        `${url.encounter}/${encounterId}`
    );
};

export const encounterToReduxStore = (encounter, site ) => {
    return {
        encounterId: encounter.encntrId,
        serviceCd: site?site.svcCd: '',
        clinicCd: site?site.siteCd: '',
        patientKey: encounter.patientKey,
        siteId: encounter.siteId,
        isRealTime: encounter.isRealtime,
        encounterDate: encounter.sdt,
        isClose: encounter.isClose,
        isCancel: encounter.isCancel,
        isDtsPmiDschrgCmplt: encounter.isDtsPmiDschrgCmplt,
        isDtsScrCalcCmplt: encounter.isDtsScrCalcCmplt,
        encntrTypeId: encounter.encntrTypeId,
        rmId: encounter.emId,
        sspecId: encounter.sppecId,
        atndId: encounter.atndId,
        sdt: encounter.sdt,
        edt: encounter.edt,
        drtn: encounter.drtn,
        cimsUserPract: encounter.cimsUserPract,
        asmtTime: encounter.asmtTime,
        flwUp: encounter.flwUp,
        encntrSts: encounter.encntrSts,
        isCgsCaseCnfrnc: encounter.isCgsCaseCnfrnc,
        cgsInpatientCnsltLocCd: encounter.cgsInpatientCnsltLocCd,
        aasmtTime: encounter.aasmtTime,
        caseNo: encounter.caseNo,
        version: encounter.version,
        encntrGrpCd:encounter.encntrGrpCd||'',
        alias:encounter.alias||''
    };
};
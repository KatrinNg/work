import Enum from '../enums/enum';
import * as CommonUtil from './commonUtilities';
import memoize from 'memoize-one';

export const getIsNewPmiSearchResultDialogSiteParams = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_NEW_PMI_SEARCH_RESULT_DIALOG);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue) ? true : false;
    }
    return false;
});

export const getIsEnableTmsltMultipleUpdate = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_ENABLE_TMSLT_MULTIPLE_UPDATE);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue) ? true : false;
    }
    return false;
});

export const getIsEnableUnavailPerdMultipleUpdate = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_ENABLE_UNAVAIL_PERD_MULTIPLE_UPDATE);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue) ? true : false;
    }
    return false;
});

export const getIsPMICaseNoAliasGen = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_PMI_CASENO_ALIAS_GEN);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue) ? true : false;
    }
    return false;
});

export const getIsPMICaseWithEnctrGrp = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_PMI_CASENO_WITH_ENCTR_GRP);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue) ? true : false;
    }
    return false;
});

export function getIsEnableScanner(clinicConfig, svcCd, siteId) {
    let where = {
        serviceCd: svcCd,
        clinicCd: siteId
    };
    const siteParam = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IS_ENABLE_SCANNER, clinicConfig, where);

    if (siteParam && siteParam.configValue === 'Y') {
        return true;
    }
    return false;
}

export function getIsFilterReportByRole(clinicConfig, svcCd, siteId) {
    let where = {};
    if (svcCd) {
        where = {
            ...where,
            serviceCd: svcCd
        };
    }
    if (siteId) {
        where = {
            ...where,
            clinicCd: siteId
        };
    }
    const siteParam = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.FILTER_REPORT_BY_ROLE, clinicConfig, where);

    if (siteParam && siteParam.configValue === 'Y') {
        return true;
    }
    return false;
}

export const getIsAtndResetDisplayCancelSts = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_ATND_RESET_DISPLAY_CANCEL_STS);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue)===1 ? true : false;
    }
    return true;
});

export const getIsAtndGenEncntrChargeableControlVal = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_ATND_GEN_ENCNTR_CHARGEABLE_CONTROL);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue) === 1 ? true : false;
    }
    return false;
});

export const getIsEnableEformAccessControl = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_ENABLE_EFORM_ACCESS_CONTROL);
    if (siteParam && siteParam.siteParamId) {
        return parseInt(siteParam.paramValue) ? true : false;
    }
    return false;
});
export const getApptSearchCriteriaDefault = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.ANA_DAYS_OF_WEEK_DEFAULT);
    if (siteParam && siteParam.siteParamId) {
        return siteParam.paramValue;
    }
    return '1111111';
});

export const getUseDH65PrinterValue = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.CMN_CERT_DH65_PRINT_QUEUE);
    if (siteParam && siteParam.siteParamId) {
        return siteParam.paramValue || '';
    }
    return '';
});

export const getUseCustAtndCertSess = memoize((siteParams, svcCd, siteId) => {
    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.USE_CUST_ATND_CERT_SESS);
    if (siteParam && siteParam.siteParamId) {
        return siteParam.paramValue === 'Y' ? true : false;
    }
    return false;
});

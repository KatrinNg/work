import Enum from '../enums/enum';
import moment from 'moment';
import * as caseNoActionType from '../store/actions/caseNo/caseNoActionType';
import * as patientActionType from '../store/actions/patient/patientActionType';
import * as CommonUtil from '../utilities/commonUtilities';
import { getState, dispatch } from '../store/util';
import { openCommonMessage } from '../store/actions/message/messageAction';
import { openCaseNoDialog, listPatientCase, updateState, saveCaseNo } from '../store/actions/caseNo/caseNoAction';
import { getIsPMICaseNoAliasGen,getIsPMICaseWithEnctrGrp } from '../utilities/siteParamsUtilities';
import { caseSts } from '../enums/anSvcID/anSvcIDEnum';


export function pmiCaseNoAliasGenSiteVal() {
    const siteParams = getState(state => state.common.siteParams);
    const serviceCd = getState(state => state.login.service.serviceCd);
    const siteId = getState(state => state.login.clinic.siteId);
    const isPMICaseNoAliasGen = getIsPMICaseNoAliasGen(siteParams, serviceCd, siteId);

    return isPMICaseNoAliasGen;
}

export function pmiCaseNoAliasShowVal() {
    const siteParams = getState(state => state.common.siteParams);
    const serviceCd = getState(state => state.login.service.serviceCd);
    const siteId = getState(state => state.login.clinic.siteId);

    const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, serviceCd, siteId, Enum.CLINIC_CONFIGNAME.PMI_CASENO_ALIAS_SHOW);
    if (siteParam && siteParam.siteParamId) {
        return siteParam.paramValue;
    }
}

export function pmiCaseWithEnctrGrpVal(){
    const siteParams = getState(state => state.common.siteParams);
    const serviceCd = getState(state => state.login.service.serviceCd);
    const siteId = getState(state => state.login.clinic.siteId);
    const isPmiCaseWithEnctrGrp=getIsPMICaseWithEnctrGrp(siteParams, serviceCd, siteId);

    return isPmiCaseWithEnctrGrp;
}

export function checkIsAutoGen(params) {
    let isAutoGen = 'N';
    const isPMICaseNoAliasGen = pmiCaseNoAliasGenSiteVal();
    const isPmiWithEncntrGrp = pmiCaseWithEnctrGrpVal();
    if (isPMICaseNoAliasGen) {
        if (isPmiWithEncntrGrp) {
            return params.isAutoGen || 'N';
        } else {
            let autoGenRule = params.filter(item => item.isAutoGen === 'Y' && item.isAutoSeq === 'Y');
            if (autoGenRule.length === 1) {
                isAutoGen = 'Y';
            }
        }
    } else {
        let autoGenRule = params.filter(item => item.isAutoGen === 'Y' && item.isAutoSeq === 'Y');
        if (autoGenRule.length === 1) {
            isAutoGen = 'Y';
        }
    }
    return isAutoGen;
}

export function getFormatCaseNo(caseNo) {
    if (caseNo) {
        caseNo = caseNo.substr(0, 4) + '-' + caseNo.substr(4, 2) + '-' + caseNo.substr(6, caseNo.length - 7) + '(' + caseNo.substr(caseNo.length - 1, 1) + ')';
    }
    return caseNo;
}



export function getCaseNoStatus(status) {
    const obj = Enum.CASE_STATUS_LIST.find(item => item.value === status);
    return obj && obj.label;
}

export function getCaseNoPromptStr(status) {
    const obj = Enum.CASE_STATUS_LIST.find(item => item.value === status);
    return obj && obj.promptUpStr;
}

export function genPMICaseNoAction(patientInfo) {
    const serviceCd = getState(state => state.login.service.serviceCd);
    const isPMICaseNoAliasGen = pmiCaseNoAliasGenSiteVal();
    const genderCd = patientInfo && patientInfo.genderCd ? patientInfo.genderCd : '';
    let genPMIAction = Enum.CASE_NO_GEN_ACTION.EXISTING;
    if (isPMICaseNoAliasGen) {
        if (serviceCd === 'ANT') {
            if (genderCd !== Enum.GENDER_FEMALE_VALUE) {
                genPMIAction = Enum.CASE_NO_GEN_ACTION.NOT_GEN;
            } else {
                genPMIAction = Enum.CASE_NO_GEN_ACTION.FHS_GEN_CASE;
            }
        } else {
            genPMIAction = Enum.CASE_NO_GEN_ACTION.GEN_WITH_ALIAS;
        }
    }

    return genPMIAction;
}

export function getTargetCaseNoInfo(patientKey, caseNo, encntrGrpCd, siteCd) {
    return new Promise((funcResolve) => {
        let targetCaseNo = null;
        const isPmiCaseWithEnctrGrp = pmiCaseWithEnctrGrpVal();
        new Promise((resolve) => {
            dispatch(listPatientCase({ patientKey: patientKey }, (data) => {
                let caseList = data;
                resolve(caseList);
            }));
        }).then((caseList) => {
            if (isPmiCaseWithEnctrGrp === true) {
                if (caseNo) {
                    targetCaseNo = caseList.find(x => x.caseNo === caseNo);
                } else {
                    if (encntrGrpCd) {
                        targetCaseNo = caseList.find(x => x.encntrGrpCd === encntrGrpCd && x.statusCd === 'A');
                    }
                }
            } else {
                const caseNoInfo = getState(state => state.patient.caseNoInfo);
                if (caseNo) {
                    targetCaseNo = caseList.find(x => x.caseNo === caseNo);
                } else if (caseNoInfo && caseNoInfo.caseNo) {
                    targetCaseNo = caseList.find(x => x.caseNo === caseNoInfo.caseNo);
                } else {
                    targetCaseNo = caseList.find(x => x.ownerClinicCd === siteCd && x.statusCd === 'A');
                }
            }
            funcResolve(targetCaseNo);
        });
    });
}

/**
 * Special case number process handling,
 * If the patient has a case number, it will be selected by default,
 * If the patient has no case number, it will call the create case function,
 * If the patient has more than one case number, it will call the case number selector
 * @author JustinLong
 * @param {Object} patientInfo not null
 * @param {Function} func the function will be called after case no selected, not null
 */
export function caseNoHandleProcess(patientInfo, func, isNoPopup = false, genOthGrpCase = false) {
    let isUseCaseNo = CommonUtil.isUseCaseNo();
    if (isUseCaseNo) {
        const caseActiveDtos = (patientInfo.caseList && patientInfo.caseList.filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE)) || [];
        if (caseActiveDtos.length === 0 || genOthGrpCase === true) {
            dispatch({
                type: caseNoActionType.OPEN_CASENO_DIALOG,
                caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
                caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts },
                isNoPopup: isNoPopup,
                caseCallBack: (data) => {
                    let caseNo = '';
                    const isPMICaseNoAliasGen = pmiCaseNoAliasGenSiteVal();
                    if (isPMICaseNoAliasGen) {
                        caseNo = data && data.caseDto ? data.caseDto.caseNo || '' : '';
                    } else {
                        caseNo = data && data.caseNo || '';
                    }
                    if (caseNo) {
                        dispatch({
                            type: patientActionType.GET_PATIENT_CASENO,
                            caseList: caseActiveDtos,
                            caseNo: caseNo
                        });
                        func && func(caseNo);
                    }
                }
            });
        } else if (caseActiveDtos.length === 1) {
            dispatch({
                type: patientActionType.GET_PATIENT_CASENO,
                caseList: caseActiveDtos,
                caseNo: caseActiveDtos[0].caseNo
            });
            func && func(caseActiveDtos[0].caseNo);
        } else {
            const caseNoInfo = getState(state => state.patient.caseNoInfo);
            if (JSON.stringify(caseNoInfo) === {}) {
                dispatch({
                    type: caseNoActionType.SELECT_CASE_TRIGGER,
                    trigger: true,
                    caseSelectCallBack: (caseNoInfo) => {
                        func && func(caseNoInfo && caseNoInfo.caseNo);
                    }
                });
            } else {
                dispatch({
                    type: patientActionType.GET_PATIENT_CASENO,
                    caseList: caseActiveDtos,
                    caseNo: caseActiveDtos[0].caseNo
                });
                func && func(caseActiveDtos[0].caseNo);
            }
        }
    } else {
        func && func();
    }
}

export function readyCaseDto(patientInfo, isCloseOld, encntrGrpCd) {
    const casePrefixList = getState(state => state.caseNo.casePrefixList);
    const service = getState(state => state.login.service);
    const clinic = getState(state => state.login.clinic);
    const aliasRule = getState(state => state.caseNo.aliasRule);
    const isPMICaseNoAliasGen = pmiCaseNoAliasGenSiteVal();
    const isPMICaseNoWithEncntrGrp = pmiCaseWithEnctrGrpVal();
    let caseDto = null;
    if (isPMICaseNoAliasGen === true) {
        if (isPMICaseNoWithEncntrGrp === true) {
            const rule = aliasRule.find(x => x.encntrGp === encntrGrpCd);
            if (rule) {
                caseDto = {
                    patientKey: patientInfo.patientKey,
                    patientStatus: patientInfo.patientSts,
                    // isCloseOld: isCloseOld!==undefined?isCloseOld:false,
                    casePrefixCd: rule.casePrefix,
                    serviceCd: service.svcCd,
                    ownerClinicCd: clinic.clinicCd,
                    regDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                    ruleId: rule.ruleId,
                    statusCd: 'A',
                    siteId: rule.siteId,
                    encntrGrpCd
                };
            } else {
                //prompt up no active rule is found.
                return null;
            }

        } else {
            caseDto = {
                patientKey: patientInfo.patientKey,
                patientStatus: patientInfo.patientSts,
                // isCloseOld: isCloseOld!==undefined?isCloseOld:false,
                casePrefixCd: aliasRule[0].casePrefix,
                serviceCd: service.svcCd,
                ownerClinicCd: clinic.clinicCd,
                regDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                ruleId: aliasRule[0].ruleId,
                statusCd: 'A',
                siteId: aliasRule[0].siteId
            };
        }
    } else {
        caseDto = {
            patientKey: patientInfo.patientKey,
            patientStatus: patientInfo.patientSts,
            // isCloseOld: isCloseOld!==undefined?isCloseOld:false,
            casePrefixCd: casePrefixList[0].casePrefixCd,
            serviceCd: service.svcCd,
            ownerClinicCd: clinic.clinicCd,
            regDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            statusCd: 'A'
        };
    }
    if (isCloseOld) {
        caseDto.isCloseOld = isCloseOld;
    }

    return caseDto;
}

export function handleGenCaseNoAction(patientInfo, caseNoInfo, callback, manualGenFunc, isCloseOld) {
    const isUseCaseNo = CommonUtil.isUseCaseNo();
    const genCaseNoAction = genPMICaseNoAction(patientInfo);
    if (isUseCaseNo) {
        switch (genCaseNoAction) {
            case Enum.CASE_NO_GEN_ACTION.NOT_GEN: {
                callback && callback(null, genCaseNoAction);
                break;
            }
            case Enum.CASE_NO_GEN_ACTION.FHS_GEN_CASE: {
                const clcAntCurrent = patientInfo && patientInfo.antSvcInfo ? patientInfo.antSvcInfo.clcAntCurrent : null;
                if (clcAntCurrent && clcAntCurrent.sts === caseSts.ACTIVE) {
                    callback && callback(caseNoInfo.caseNo, genCaseNoAction);
                } else {
                    callback && callback(null, genCaseNoAction);
                }
                break;
            }
            case Enum.CASE_NO_GEN_ACTION.GEN_WITH_ALIAS: {
                const caseNo = caseNoInfo && caseNoInfo.caseNo ? caseNoInfo.caseNo : '';
                if (caseNo) {
                    callback && callback(caseNoInfo.caseNo, genCaseNoAction);
                } else {
                    callback && callback(null, genCaseNoAction);
                }
                break;
            }
            case Enum.CASE_NO_GEN_ACTION.EXISTING:
            default: {
                const caseNo = caseNoInfo && caseNoInfo.caseNo ? caseNoInfo.caseNo : '';
                const isAutoGen = getState(state => state.caseNo.isAutoGen);
                if (caseNo) {
                    callback && callback();
                } else {
                    if (isAutoGen === 'Y') {
                        //auto gen
                        // const caseDto = { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts };
                        const caseDto = readyCaseDto(patientInfo, isCloseOld);
                        callback && callback(caseDto);
                    } else {
                        manualGenFunc && manualGenFunc();
                    }
                }
            }
        }
    } else {
        callback && callback();
    }
}


/**handle new case flow before click Anonymous Booking Book/Link Patient Book */
export function handleNewCaseNoBeforeAnonBookOrLinkPatient(patientInfo, callback) {
    if (!patientInfo) return;
    let activeCases = patientInfo.caseList && patientInfo.caseList.filter(x => x.statusCd === 'A');
    if (activeCases && activeCases.length > 1) {
        dispatch(openCommonMessage({ msgCode: '111236' }));
        return;
    } else {
        const manualGenFunc = () => {
            dispatch(openCaseNoDialog({
                caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
                isNoPopup: true,
                caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts, isCloseOld: true },
                caseCallBack: (data) => {
                    if (data && data.caseNo) {
                        callback(data.caseNo);
                    }
                }
            }));
        };
        handleGenCaseNoAction(patientInfo, null, callback, manualGenFunc, true);
    }
}


/**handle case no before taking walk-in attendance*/
export function handleCaseNoBeforeBook(caseNoInfo, patientInfo, callback) {
    //const isAutoGen = getState(state => state.caseNo.isAutoGen);
    //const isUseCaseNo = CommonUtil.isUseCaseNo();
    const manualGenFunc = () => {
        dispatch(openCaseNoDialog({
            caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
            caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts },
            isNoPopup: true,
            caseCallBack: (data) => {
                if (data && data.caseNo) {
                    callback(data.caseNo);
                }
            }
        }));
    };
    handleGenCaseNoAction(patientInfo, caseNoInfo, callback, manualGenFunc, false);
}



/**handle new case no flow before click Booking book button */
export function handleNewCaseNoBeforeBook(patientInfo, callback) {
    const manualGenFunc = () => {
        dispatch(openCaseNoDialog({
            caseDialogStatus: Enum.CASE_DIALOG_STATUS.CREATE,
            isNoPopup: false,
            caseNoForm: { patientKey: patientInfo.patientKey, patientStatus: patientInfo.patientSts, isCloseOld: true },
            caseCallBack: (data) => {
                if (data && data.caseNo) {
                    callback(data.caseNo);
                }
            }
        }));
    };

    handleGenCaseNoAction(patientInfo, null, callback, manualGenFunc, true);
}

export function handleCaseNoBeforeAttend(patientInfo, appointment, serviceCd, callback) {
    const isPMICaseNoAliasGen = pmiCaseNoAliasGenSiteVal();
    const isPmiCaseWithEnctrGrp = pmiCaseWithEnctrGrpVal();
    const { caseNo, encntrGrpCd, siteCd } = appointment;
    const { patientKey } = patientInfo;
    let isUseCaseNo = CommonUtil.isUseCaseNo();
    if (isUseCaseNo) {
        if (caseNo) {
            getTargetCaseNoInfo(patientKey, caseNo, encntrGrpCd, siteCd).then((caseNoInfo) => {
                if (caseNoInfo && caseNoInfo.statusCd === 'A') {
                    callback && callback(caseNoInfo.caseNo);
                } else {
                    //fail
                    callback && callback(null, 'fail');
                }
            });
        } else {
            if (isPMICaseNoAliasGen === true) {
                if (isPmiCaseWithEnctrGrp === true) {
                    getTargetCaseNoInfo(patientKey, caseNo, encntrGrpCd).then((caseNoInfo) => {
                        if (caseNoInfo && caseNoInfo.statusCd === 'A') {
                            callback && callback(caseNoInfo.caseNo);
                        } else {
                            if (serviceCd === 'ANT') {
                                if (patientInfo.genderCd === Enum.GENDER_FEMALE_VALUE) {
                                    // fail
                                    callback && callback(null, 'fail');
                                } else {
                                    callback && callback(null);
                                }
                            } else {
                                const aliasRule = getState(state => state.caseNo.aliasRule);
                                const rule = aliasRule.find(x => x.encntrGp === encntrGrpCd);
                                const encntrGrpList = getState(state => state.caseNo.encntrGrpList);
                                if (rule) {
                                    if (rule.isAutoGen === 'Y') {
                                        const caseDto = readyCaseDto(patientInfo, false, encntrGrpCd);
                                        callback && callback(caseDto);
                                    } else {
                                        //manual gen. set appointment encntrGrp first.
                                        new Promise((resolve) => {
                                            const encntrGrp = encntrGrpList.find(x => x.encntrGrpCd === encntrGrpCd);
                                            dispatch(updateState({ encntrGrp: encntrGrp }));
                                            resolve();
                                        }).then(() => {
                                            caseNoHandleProcess(patientInfo, callback, false, true);
                                        });
                                    }
                                } else {
                                    //prompt no active rule.
                                    callback && callback(null, 'no active rule');
                                }
                            }
                        }
                    });
                }
            } else {
                getTargetCaseNoInfo(patientKey, caseNo, encntrGrpCd, siteCd).then((caseNoInfo) => {
                    if (caseNoInfo && caseNoInfo.statusCd === 'A') {
                        callback && callback(caseNoInfo.caseNo);
                    } else {
                        const isAutoGen = getState(state => state.caseNo.isAutoGen);
                        if (isAutoGen === 'Y') {
                            //auto gen
                            const caseDto = readyCaseDto(patientInfo, false);
                            callback && callback(caseDto);
                        } else {
                            caseNoHandleProcess(patientInfo, callback, false, false);
                        }
                    }
                });
            }
        }
    } else {
        callback && callback();
    }
}


/**
 * Handling display Case No. section,
 * @param {list} list target list
 * @param {sectionName} sectionName case No. section name in target list
 * @param {sectionStr} sectionStr section name string
 */
export function handleCaseNoSection(list, sectionName, sectionStr) {
    const useCaseNo = CommonUtil.isUseCaseNo();
    const sectionIdx = list.findIndex(x => x[sectionName] === sectionStr);
    if (useCaseNo) {
        return list;
    } else {
        if (sectionIdx > -1) {
            list.splice(sectionIdx, 1);
        }
        return list;
    }
}


export function getCaseNoColTitle() {
    const serviceCd = getState(state => state.login.service.serviceCd);
    let title = 'Case No.';
    if (serviceCd === 'ANT') {
        title = 'AN Service ID';
    }
    return title;
}

export function getCaseAlias(rowData, withEnctrGrp = true) {
    if (!rowData) {
        return '';
    }
    const { caseNo, alias, encntrGrpCd } = rowData;
    let result = '';
    const isPMICaseNoAliasGen = pmiCaseNoAliasGenSiteVal();
    const pmiCaseNoAliasShow = pmiCaseNoAliasShowVal();
    const isPmiCaseWithEnctGp = pmiCaseWithEnctrGrpVal();
    if (isPMICaseNoAliasGen) {
        if (pmiCaseNoAliasShow === 'ALIAS') {
            if (alias) {
                if (isPmiCaseWithEnctGp === true) {
                    if (withEnctrGrp) {
                        if (encntrGrpCd) {
                            result = `${encntrGrpCd} ${alias}`;
                        } else {
                            result = alias;
                        }
                    } else {
                        result = alias;
                    }
                } else {
                    result = alias;
                }
            }
        } else {
            result = getFormatCaseNo(caseNo || '');
        }
    } else {
        result = getFormatCaseNo(caseNo || '');
    }
    return result;
}


export function getCaseAliasSts(rowData){
    if (!rowData) {
        return '';
    }
    const {  aliasStatusDesc,statusCd } = rowData;
    let result = '';
    const isPMICaseNoAliasGen = pmiCaseNoAliasGenSiteVal();
    const pmiCaseNoAliasShow = pmiCaseNoAliasShowVal();
    if (isPMICaseNoAliasGen) {
        if (pmiCaseNoAliasShow === 'ALIAS') {
            result = aliasStatusDesc || '';
        } else {
            result= getCaseNoStatus(statusCd);
        }
    } else {
        result= getCaseNoStatus(statusCd);
    }
    return result;
}
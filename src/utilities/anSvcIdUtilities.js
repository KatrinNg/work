import _ from 'lodash';
import moment from 'moment';
import { caseSts, pageSts, recSts } from '../enums/anSvcID/anSvcIDEnum';
import { getState, dispatch } from '../store/util';
import { getGestWeekByLmp, getGestWeekByEdc } from '../utilities/appointmentUtilities';
import { setChCode, setChChineseName } from '../utilities/registrationUtilities';
import { MODIFY_AN_SERVICE_ID_INFO } from '../store/actions/anServiceID/anServiceID';

export const filterRsnTypeList = (rsnTypeList, antInfo, antInfoBk, curAntInfoIdx) => {
    let sts = antInfo.sts;
    let bkSts = antInfoBk.sts;
    //if (curAntInfoIdx > -1) {
    sts = antInfo.sts;
    bkSts = antInfoBk.sts;
    //}
    let rsnType = '';
    let rsnTypeOpt = _.cloneDeep(rsnTypeList);
    if (sts === caseSts.INVALIDATE) {
        rsnType = 'INVD';
    } else if (sts === caseSts.ACTIVE && bkSts === caseSts.INVALIDATE
        || sts === caseSts.ACTIVE && bkSts === caseSts.EXPIRY) {
        rsnType = 'RECOVER';
    }
    rsnTypeOpt = rsnTypeOpt.filter(rsn => rsn.rsnType === rsnType);
    return rsnTypeOpt;
};

export const disableChangeCaseSts = (data, dataBk, type, ccCodeChiChar) => {
    if (type === pageSts.EDIT) {
        if (dataBk.sts === caseSts.ACTIVE) {
            return !_.isEqual(data, dataBk) || ccCodeChiChar.length > 0;
        } else if (data.sts === caseSts.INVALIDATE && dataBk.sts === caseSts.INVALIDATE) {
            return false;
        } else if (dataBk.sts === caseSts.EXPIRY) {
            return true;
        } else {
            return true;
        }
    } else {
        return false;
    }
};

export const getCurAntInfoIdx = (antenatalInfo) => {
    if (antenatalInfo && antenatalInfo.clcAntSrcs.length > 0) {
        let curAntInfoIdx = antenatalInfo.clcAntSrcs.findIndex(x => x.recSts === recSts.CURRENT);
        return curAntInfoIdx;
    } else {
        return -1;
    }
};


export const isInvalidCase = (antenatalInfo, antenatalInfoBk, curAntInfoIdx) => {
    let isInvalidCase = false;
    // if (curAntInfoIdx > -1) {
    if (antenatalInfoBk.sts === caseSts.INVALIDATE || antenatalInfoBk.sts === caseSts.EXPIRY) {
        isInvalidCase = true;
    } else {
        if (antenatalInfo.sts === caseSts.INVALIDATE || antenatalInfo.sts === caseSts.EXPIRY) {
            isInvalidCase = true;
        }
    }
    return isInvalidCase;
};

export const genAliasPrefix = (rule) => {
    const clinic = getState(state => state.login.clinic);
    //let rule = aliasRule.find(item => item.svcCd === service.svcCd);
    let siteId = clinic.siteId.toString();
    if (siteId.length === 1) {
        siteId = siteId.padStart(1, '0');
    }
    return `${moment().format(rule.aliasYearPattern)}-9${siteId.slice(-2)}`;
};


export const calcSvcInfoGestWeek = (clcAntFullList) => {
    clcAntFullList.forEach(ant => {
        // if (ant.lmp && moment(ant.lmp).isValid()) {
        //     const { currentGestWeek, currentGestDay } = getGestWeekByLmp(ant.lmp);
        //     ant.gestWeek = _.toString(currentGestWeek) && _.toString(currentGestDay) ? `${currentGestWeek}-${currentGestDay}` : '';

        // }
        if (ant.wrkEdc && moment(ant.wrkEdc).isValid()) {
            const { currentGestWeek, currentGestDay } = getGestWeekByEdc(ant.wrkEdc);
            ant.gestWeek = _.toString(currentGestWeek) && _.toString(currentGestDay) ? `${currentGestWeek}-${currentGestDay}` : '';
        }
    });
    return clcAntFullList;
};

export const mapAntSvcInfo = (spcAntInfo, alias = '', encntrGrpCd) => {
    //const antSvcId = antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.antSvcId || alias;
    let clcAntCurrent = null;
    let clcAntFullList = spcAntInfo.clcAntDtos;
    clcAntFullList = calcSvcInfoGestWeek(clcAntFullList);
    if (alias) {
        let antSelected = clcAntFullList.find(ant => ant.antSvcId === alias);
        clcAntCurrent = antSelected || null;
        if(clcAntCurrent){
            clcAntCurrent.encntrGrpCd=encntrGrpCd;
        }
    }
    return {
        clcAntCurrent,
        clcAntFullList
    };
};

export const updateFopChiName = (ccCodeList, clcAntInfo, ccCodeChar, charIndex, char) => {
    let { patientInfo, ccCodeChiChar } = setChCode(ccCodeList || [], clcAntInfo.clcFopDto, ccCodeChar);
    let updateData = setChChineseName(patientInfo, ccCodeChiChar, charIndex, char);
    return updateData;
};

export const curANSvcIdIsActive = (anSvcInfo) => {
    if (!anSvcInfo) {
        return false;
    }
    if (!anSvcInfo.clcAntCurrent) {
        return false;
    }
    return anSvcInfo.clcAntCurrent.sts === caseSts.ACTIVE;
};

export const updateAntInfoInOtherPage = (updateData, callback) => {
    const patientInfo = getState(state => state.patient.patientInfo);
    const clinic = getState(state => state.login.clinic);
    const service = getState(state => state.login.service);
    const aliasRule = getState(state => state.caseNo.aliasRule);
    const rule = aliasRule.find(item => item.svcCd === service.svcCd);
    const encntrGp = rule && rule.encntrGp ? rule.encntrGp : null;
    if (patientInfo.antSvcInfo && patientInfo.antSvcInfo.clcAntCurrent) {
        let currentInfo = _.cloneDeep(patientInfo.antSvcInfo.clcAntCurrent);
        for (let i in updateData) {
            currentInfo[i] = updateData[i];
        }
        currentInfo.siteId = clinic.siteId;
        currentInfo.isClcAntChange = 1;
        delete currentInfo.deliveryHosp;
        const submitData = {
            //siteId: clinic.siteId,
            patientKey: patientInfo.patientKey,
            svcCd: service.svcCd,
            encntrGp: encntrGp,
            clcAntDto: currentInfo
        };
        dispatch({
            type: MODIFY_AN_SERVICE_ID_INFO,
            params: submitData,
            callback: callback
        });
    }
};

export const isPatientFullCase = (clcAntFullList) => {
    return clcAntFullList && clcAntFullList.some(x => (x.sts === caseSts.ACTIVE || x.sts === caseSts.EXPIRY) && x.isFullCase === 1);
};

export const getAliasRule = (aliasRule, encntrGrp) => {
    let rule = null;
    if (encntrGrp) {
        rule = aliasRule.find(item => item.encntrGp === encntrGrp.encntrGrpCd);
    } else {
        rule = aliasRule[0];
    }
    return rule;
};
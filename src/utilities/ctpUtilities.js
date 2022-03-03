
import _ from 'lodash';
import moment from 'moment';
import Enum from '../enums/enum';
// import Enum from '../enums/enum';
// import PatinetUtil from '../utilities/patientUtilities';
// import CommonUtil from '../utilities/commonUtilities';

function getInst(groupCd, instCd, hospital, clinic) {
    let instObj = null;
    if (groupCd === 'DH') {
        instObj = clinic.find(item => item.clinicCd === instCd);
    }
    else {
        instObj = instCd;
    }
    return instObj;
}

export function loadRfrLetter(list, group, serviceList, hospital, clinic, specialty) {
    let rfrLetterList = [];
    list = list.filter(item => item.status === 'A');
    list.forEach(el => {
        let rfrLetter = _.cloneDeep(el);
        let selGroup = group.find(item => item.groupCd === el.groupCd);
        let selSvc = serviceList.find(item => item.svcCd === el.svcCd);
        let inst = getInst(el.groupCd, el.instCd, hospital, clinic);
        let selSpecialty = specialty.find(item => item.specialtyCd === el.specialityCd);
        rfrLetter.group = selGroup ? selGroup.groupName : '';
        rfrLetter.service = selSvc ? selSvc.serviceName : '';
        rfrLetter.inst = inst ? (el.groupCd === 'DH' ? inst.siteEngName : inst) : '';
        rfrLetter.specialty = selSpecialty ? selSpecialty.specialtyName : '';
        rfrLetterList.push(rfrLetter);
    });
    return rfrLetterList;
}

export function loadFlwUp(list, serviceList, clinic, encntrTypes) {
    let flwUpList = [];
    list.forEach(el => {
        let flwUp = _.cloneDeep(el);
        let selSvc = serviceList.find(item => item.svcCd === el.svcCd);
        let selClinic = clinic.find(item => item.siteId === el.siteId);
        let selEncntr = encntrTypes.find(item => item.encntrTypeId === el.encntrTypeId);
        flwUp.service = selSvc ? selSvc.serviceName : '';
        flwUp.clinic = selClinic ? selClinic.siteEngName : '';
        flwUp.encntr = selEncntr ? selEncntr.encntrTypeDesc : '';
        flwUpList.push(flwUp);
    });
    return flwUpList;
}

export function loadHlthEduRcmd(list, eduCatgry, hlthEduType) {
    let hlthEduRcmdList = [];
    list.forEach(el => {
        let hlthEduRcmd = _.cloneDeep(el);
        let selCatgry = eduCatgry.find(item => item.code === el.eduCatgryCd);
        let selType = hlthEduType.find(item => item.code === el.hlthEduTypeCd);
        hlthEduRcmd.catgry = selCatgry ? selCatgry.engDesc : '';
        hlthEduRcmd.hlthEduType = selType ? selType.engDesc : '';
        hlthEduRcmdList.push(hlthEduRcmd);
    });
    return hlthEduRcmdList;
}

// export function hasTodayEncounter(encounterInfo) {
//     if (!encounterInfo || !encounterInfo.encounterId) {
//         return false;
//     } else {
//         const encntrDateDMYStr = moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
//         const todayDateDMYStr = moment().format(Enum.DATE_FORMAT_EDMY_VALUE);
//         return encntrDateDMYStr === todayDateDMYStr;
//     }
// }

export function checkCtpDataIsBlank(flwUp, tdHlthEduRcmdList, hasTdCTP) {
    let flag = false;
    let eduRcmdNotDirtyCount = 0;
    if (hasTdCTP) {
        flag = false;
    } else {
        tdHlthEduRcmdList && tdHlthEduRcmdList.forEach(el => {
            if (el.eduRcmdId === 0) {
                if (el.eduCatgryCd || el.eduRcmdDesc || el.hlthEduTypeCd) {
                    eduRcmdNotDirtyCount++;
                }
            } else {
                eduRcmdNotDirtyCount++;
            }
        });
        if (!flwUp && eduRcmdNotDirtyCount === 0) {
            flag = true;
        }
    }

    return flag;
}

export function checkCTPDataIsDirty(flwUp, flwUpBK, ctpData, bkData) {
    let dirtyCount = 0;
    if (ctpData.length !== bkData.length) {
        return true;
    } else {
        for (let i = 0; i < ctpData.length; i++) {
            let ctp = ctpData[i];
            let ctpBK = bkData[i];
            if (ctp.eduRcmdId !== ctpBK.eduRcmdId || ctp.eduCatgryCd !== ctpBK.eduCatgryCd || ctp.hlthEduTypeCd !== ctpBK.hlthEduTypeCd || ctp.eduRcmdDesc !== ctpBK.eduRcmdDesc) {
                dirtyCount++;
            }
        }
        return dirtyCount > 0 || (flwUp !== flwUpBK);
    }

}


export function disableRemoveCTPBtn(ctpData) {
    if (ctpData.length === 1) {
        let ctp = ctpData[0];
        if (ctp.eduRcmdId === 0) {
            if (!ctp.eduCatgryCd && !ctp.hlthEduTypeCd && !ctp.eduRcmdDesc) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}
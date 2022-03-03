import moment from 'moment';

export const TimeslotTemplateDTO={
    description: '',
    encounterTypeCd: '',
    newNormal: 0,
    newPublic: 0,
    newForce: 0,
    oldNormal: 0,
    oldPublic: 0,
    oldForce: 0,
    overallQuota: 9999,
    slotProfileCode: '',
    slotTemplateId: 0,
    startTime: moment().format('HH:mm'),
    subEncounterTypeCd: '',
    version: '',
    week: '0000000'
};

export const initTempDetailInfo = {
    templateName: '',
    templateDesc: ''
};

export const initTempDetailItem = {
    startTime: '',
    endTime: '',
    wkd0: 0,
    wkd1: 0,
    wkd2: 0,
    wkd3: 0,
    wkd4: 0,
    wkd5: 0,
    wkd6: 0,
    overallQt: '',
    qt1: '',
    qt2: '',
    qt3: '',
    qt4: '',
    qt5: '',
    qt6: '',
    qt7: '',
    qt8: '',
    updateDtm: '',
    updateBy: '',
    createDtm: '',
    createBy: ''
};

export const initBatchCreate = {
    startTime: '',
    endTime: '',
    timeLen: '',
    overallQt: '',
    qt1: '',
    qt2: '',
    qt3: '',
    qt4: '',
    qt5: '',
    qt6: '',
    qt7: '',
    qt8: ''
};
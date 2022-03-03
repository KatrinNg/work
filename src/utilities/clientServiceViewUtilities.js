import moment from 'moment';
import _ from 'lodash';
import Enum from '../enums/enum';
import ClientServiceViewEnum from '../enums/payment/clientServiceView/clientServiceViewEnum';
import * as CommonUtil from './commonUtilities';
import { getState } from '../store/util';
import { hasSpecificRole } from '../utilities/userUtilities';

/**get charge by item code*/
export function getSelectCharge(chargeList, chargeCd) {
    const charge = chargeList.find(item => item.chargeCd === chargeCd);
    return charge;
}

export function countItemAmount(item) {
    let course = item.course;
    let unitCharge = item.unitCharge;
    let itemAmount = '0';
    if (item.waiveType) {
        return '0';
    }
    if (!unitCharge) {
        return '0';
    }
    if (typeof unitCharge === 'string') {
        unitCharge = parseInt(_.clone(unitCharge));
    }
    // if (item.isPaid === 1 || item.isComplete === 1) {
    //     itemAmount = item.totalCharge ? item.totalCharge.toString() : (course * unitCharge).toString();
    // } else {
    itemAmount = (course * unitCharge).toString();
    // }
    return itemAmount;
}

/**transfer notes dto into array */
export function transferNoteData(noteData, chargeList) {
    let noteList = [];
    const loginInfo = getState(state => state.login.loginInfo);
    const hasDoctorBaseRole = hasSpecificRole(loginInfo.userDto, 'CIMS-DOCTOR');
    const hasNurseBaseRole = hasSpecificRole(loginInfo.userDto, 'CIMS-NURSE');
    for (let i in noteData) {
        let noteItemList = noteData[i];
        if (Array.isArray(noteItemList)) {
            if (noteItemList.length > 0) {
                noteItemList.forEach(note => {
                    const chargeUpdated = note.isChangeChargeCd === 'Y';
                    let charge = getSelectCharge(chargeList, note.chargeCd);
                    if (charge) {
                        note.unitCharge = note.unitCharge ? note.unitCharge || '0' : charge.unitCharge;
                        // note.unitCharge = note.unitCharge.toString();
                        note.chargeDesc = note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate ? note.chargeDesc || '' : charge.chargeDesc || '';
                        if (note.unitCharge === 0) {
                            note.unitCharge = '0';
                        }
                        note.course = note.course || 1;
                        note.waiveType = chargeUpdated ? '' : note.waiveType || '';
                        note.isPaid = chargeUpdated ? '' : note.isPaid || '';
                        note.paidDtm = chargeUpdated ? '' : note.paidDtm || '';
                        note.isComplete = chargeUpdated ? '' : note.isComplete || '';
                        note.completeDtm = chargeUpdated ? '' : note.completeDtm || '';
                        if (hasDoctorBaseRole || hasNurseBaseRole) {
                            note.treatmentDtm = chargeUpdated ? note.encounterDate : note.treatmentDtm || note.encounterDate;
                        } else {
                            note.treatmentDtm = chargeUpdated ? null : note.treatmentDtm || null;
                        }
                        note.totalCharge = countItemAmount(note);
                        noteList.push(note);
                    }
                });
            }
        }
    }
    return noteList;
}

export function checkItemIsDirty(value, other) {
    let _value = _.cloneDeep(value);
    let _other = _.cloneDeep(other);
    return !_.isEqual(_value, _other);
}

export function countTotalAmount(noteData, noteDataBk) {
    let totalAmount = 0;
    let amount = 0;
    let _noteData = _.cloneDeep(noteData);
    let _noteDataBk = _.cloneDeep(noteDataBk);
    if (!_noteData || _noteData.length === 0) {
        return totalAmount;
    }
    let excess = _noteData.splice(_noteDataBk.length);
    //count new add reissue item total amount.
    if (excess.length > 0) {
        excess.forEach(item => {
            if (item.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate) {
                if (item.paidDtm) {
                    amount = parseInt(item.totalCharge) || 0;
                } else {
                    amount = 0;
                }
                totalAmount += amount;
            }
        });
    }
    //count other item total amount.
    if (_noteData.length > 0) {
        for (let i = 0; i < _noteData.length; i++) {
            let note = _.cloneDeep(_noteData[i]);
            let noteBk = _.cloneDeep(_noteDataBk[i]);
            if (note.status === 'D') {
                totalAmount += 0;
            } else {
                delete note.version;
                delete note.updateDtm;
                delete noteBk.version;
                delete noteBk.updateDtm;
                let newPaidAction = checkItemIsDirty(note.paidDtm, noteBk.paidDtm);
                if (note.isPaid === 1 && newPaidAction === true) {
                    if (typeof note.totalCharge === 'string') {
                        amount = parseInt(note.totalCharge) || 0;
                    } else {
                        amount = note.totalCharge || 0;
                    }
                    totalAmount += amount;
                }
            }

        }
    }
    return totalAmount;
}

export function getNoteStatus(note, isDirty, noteBk) {
    let status = '';
    if (note.csnItemId && noteBk) {
        if (note.isPaid === 1) {
            if (note.isComplete !== 1) {
                if (note.paidDtm) {
                    const paidDtm = moment(note.paidDtm).format(Enum.DATE_FORMAT_EYMD_VALUE);
                    if (paidDtm === moment().format(Enum.DATE_FORMAT_EYMD_VALUE)) {
                        if (!isDirty || (noteBk.isPaid === 1 && note.paidDtm === noteBk.paidDtm)) {
                            status = ClientServiceViewEnum.NOTE_STATUS.REFUND;
                        }
                    } else {
                        status = ClientServiceViewEnum.NOTE_STATUS.PAID;
                    }
                }
            }
        }

        if (note.isComplete === 1) {
            status = ClientServiceViewEnum.NOTE_STATUS.COMPLETED;
        }
    }
    else if (note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate) {
        if (note.isComplete === 1) {
            status = ClientServiceViewEnum.NOTE_STATUS.COMPLETED;
        }
    }
    return status;
}

export function splitNoteSDto(noteData) {
    const _noteData = _.cloneDeep(noteData);
    let result = [];
    for (let i in _noteData) {
        const notes = _noteData[i];
        if (Array.isArray(notes)) {
            notes.forEach(n => {
                result.push(n);
            });
        }
    }
    return result;
}

export function isNoItemData(noteData) {
    if (!noteData) {
        return true;
    }
    else {
        const noConsItems = noteData.consultationItems ? noteData.consultationItems.length === 0 : true;
        const noMoeItems = noteData.medicationItems ? noteData.medicationItems.length === 0 : true;
        const noVacItems = noteData.vaccineItems ? noteData.vaccineItems.length : true;
        const noIoeItems = noteData.investigationItems ? noteData.investigationItems.length : true;
        return noConsItems && noMoeItems && noVacItems && noIoeItems;
    }

}

export function itemIsPaid(item, isDirty) {
    const paidDtm = item.paidDtm ? moment(item.paidDtm).format(Enum.DATE_FORMAT_EYMD_VALUE) : '';
    if (item.isPaid === 1) {
        if (paidDtm === moment().format(Enum.DATE_FORMAT_EYMD_VALUE) || moment(paidDtm).isBefore(moment())) {
            return !isDirty;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

export function itemIsCompleted(item, isDirty) {
    const completedDtm = item.completedDtm ? moment(item.completedDtm).format(Enum.DATE_FORMAT_EYMD_VALUE) : '';
    if (item.isComplete === 1) {
        if (completedDtm === moment().format(Enum.DATE_FORMAT_EYMD_VALUE) || moment(completedDtm).isBefore(moment())) {
            return !isDirty;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

export function checkPaidAll(data) {
    let isPaidAll = true;
    if (data && data.length > 0) {
        if (data.findIndex(item => item.isPaid !== 1) > -1) {
            isPaidAll = false;
        }
    } else {
        isPaidAll = false;
    }
    return isPaidAll;
}

export function getLatestUpdateDtm(noteData) {
    let targetList = splitNoteSDto(noteData);
    targetList = targetList.filter(item => item.updateDtm !== undefined);
    targetList = CommonUtil.sortByDtm(targetList, 'updateDtm', 'desc');
    return targetList.length > 0 ? targetList[0].updateDtm : null;
}


export function loadReissueItem(noteData, chargeCd, thsCharges, encounterInfo) {
    if (JSON.stringify(encounterInfo) === '{}') {
        return noteData;
    }
    let charge = thsCharges.find(item => item.chargeCd === chargeCd);
    const { patientKey, encounterId, encounterDate } = encounterInfo;
    if (noteData && charge) {
        let reissueItem = {
            catgryCd: charge.catgryCd,
            chargeCd: charge.chargeCd,
            chargeDesc: ClientServiceViewEnum.NOTE_TYPE.REISSUE,
            itemInstruction: charge.chargeCd.indexOf('OTHER') > -1 ? '' : charge.chargeDesc,
            course: charge.course || 1,
            unitCharge: charge.unitCharge.toString(),
            waiveType: charge.waiveType || '',
            isPaid: charge.isPaid || '',
            paidDtm: charge.paidDtm || '',
            isComplete: charge.isComplete || '',
            completeDtm: charge.completeDtm || '',
            encounterDate: moment(encounterDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            patientKey,
            encntrId: encounterId,
            status: 'A'
        };
        // reissueItem.totalCharge = charge.totalCharge ? charge.totalCharge.toString() : countItemAmount(reissueItem);
        reissueItem.totalCharge = countItemAmount(reissueItem);
        noteData.push(reissueItem);
    }
    return noteData;
}

export function checkHasIncompleteItem(noteData) {
    if (!noteData || noteData.length === 0) {
        return false;
    }
    let inCompleteNote = null;

    noteData.forEach(note => {
        if (note.isPaid === 1 && !note.isComplete) {
            inCompleteNote = note;
        }
    });

    return inCompleteNote !== null;
}
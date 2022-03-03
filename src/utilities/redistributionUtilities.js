import _ from 'lodash';
import moment from 'moment';
import * as PatientUtil from './patientUtilities';
import * as CommonUtil from './commonUtilities';

export function getPatientSummary(patient) {
    let pmiNo = PatientUtil.getFormatDHPMINO(patient.patientKey, patient.idSts);
    let engName = CommonUtil.getFullName(patient.engSurname, patient.engGivenName, ' ');
    let chiName = patient.nameChi || '';
    return `${pmiNo} - ${engName} ${chiName}`;
}

export function findApptsInSlot(apptId, slots) {
    let result = [];
    if (slots && _.toString(apptId)) {
        for (let i = 0; i < slots.length; i++) {
            let appt = slots[i]['appts'] && slots[i]['appts'].find(x => x.apptId === apptId);
            if (appt) {
                result.push({
                    ...slots[i],
                    appts: [appt]
                });
            }
        }
    }
    return result;
}

export function findExactTimeInSlot(target, qtType, slots) {
    let slotId = -1;
    if (slots) {
        let availableSlot = slots.find(x => x.stime === target.stime && x.etime === target.etime && x.overallQt > 0 && (x[_.toLower(qtType)] || 0) > (x[`${_.toLower(qtType)}Booked`] || 0));
        if (availableSlot) {
            slotId = availableSlot.tmsltId;
        }
    }
    return slotId;
}

export function isExactMatch(apptId, fromData, toData) {
    let isExact = false;
    const targetSlots = findApptsInSlot(apptId, fromData);
    if (targetSlots.length > 0) {
        if (targetSlots.every(i => findExactTimeInSlot(i, i['appts'][0]['qtType'], toData) !== -1)) {
            isExact = true;
        }
    }
    return isExact;
}

export function moveExactItemToRight(apptId, fromData, toData) {
    let _fromData = _.cloneDeep(fromData);
    let _toData = _.cloneDeep(toData);
    for (let i = 0; i < _fromData.length; i++) {
        let index = _fromData[i]['appts'].findIndex(x => x.apptId === apptId);
        if (index !== -1) {
            let targetSlotId = findExactTimeInSlot(_fromData[i], _fromData[i]['appts'][index]['qtType'], toData);
            if (targetSlotId !== -1) {
                let targetIndex = _toData.findIndex(x => x.tmsltId === targetSlotId);
                let targetAppt = _fromData[i]['appts'][index];
                targetAppt.tmsltId = _toData[targetIndex]['tmsltId'];
                _toData[targetIndex]['appts'].push(_.cloneDeep(targetAppt));
                _toData[targetIndex][`${_.toLower(targetAppt.qtType)}Booked`] = (_toData[targetIndex][`${_.toLower(targetAppt.qtType)}Booked`] || 0) + 1;
                _fromData[i]['appts'].splice(index, 1);
            }
        }
    }
    return { fromData: _fromData, toData: _toData };
}

export function moveItemToLeft(apptId, fromData, toData, fromOriginalData) {
    let _fromData = _.cloneDeep(fromData), _toData = _.cloneDeep(toData);
    let targetSlots = findApptsInSlot(apptId, fromOriginalData);
    for (let i = 0; i < _toData.length; i++) {
        let index = _toData[i]['appts'].findIndex(x => x.apptId === apptId);
        if (index !== -1) {
            let targetAppt = _toData[i]['appts'][index];
            _toData[i][`${_.toLower(targetAppt.qtType)}Booked`] = (_toData[i][`${_.toLower(targetAppt.qtType)}Booked`] || 0) - 1;
            _toData[i]['appts'].splice(index, 1);
        }
    }
    for (let i = 0; i < targetSlots.length; i++) {
        let index = _fromData.findIndex(x => x.tmsltId === targetSlots[i]['tmsltId']);
        if (index !== -1) {
            _fromData[index]['appts'] = _fromData[index]['appts'].concat(targetSlots[i]['appts']);
        }
    }
    return { fromData: _fromData, toData: _toData };
}

export function moveSuggestItemToRight(targetSlots, suggestSlots, fromData, toData) {
    let _fromData = _.cloneDeep(fromData), _toData = _.cloneDeep(toData);
    if (targetSlots.length === suggestSlots.length) {
        for (let i = 0; i < suggestSlots.length; i++) {
            let targetSlotIndex = _fromData.findIndex(x => x.tmsltId === targetSlots[i]['tmsltId']);
            let targetApptIndex = _fromData[targetSlotIndex]['appts'].findIndex(x => x.apptId === targetSlots[i]['appts'][0]['apptId']);
            let suggestSlotIndex = _toData.findIndex(x => x.tmsltId === suggestSlots[i]['tmsltId']);
            if (targetApptIndex > -1 && suggestSlotIndex > -1) {
                let targetAppt = _.cloneDeep(targetSlots[i]['appts'][0]);
                targetAppt.tmsltId = suggestSlots[i]['tmsltId'];
                _toData[suggestSlotIndex]['appts'].push(targetAppt);
                _toData[suggestSlotIndex][`${_.toLower(targetAppt.qtType)}Booked`] = (_toData[suggestSlotIndex][`${_.toLower(targetAppt.qtType)}Booked`] || 0) + 1;
                _fromData[targetSlotIndex]['appts'].splice(targetApptIndex, 1);
            }
        }
    }
    return { fromData: _fromData, toData: _toData };
}

export function isValidCriteria(criteria) {
    return moment(criteria.date).isValid() && criteria.room && criteria.session;
}

export function isSameCriteria(fromCriteria, toCriteria) {
    return moment(fromCriteria.date).isSame(moment(toCriteria.date), 'day')
        && fromCriteria.room === toCriteria.room
        && fromCriteria.session === toCriteria.session;
}

export function findSuggestSlots(qtType, bookingUnit, toData) {
    let suggestSlot = [];
    if (bookingUnit === 1) {
        let availableSlot = toData.find(x => x.overallQt > 0 && (x[_.toLower(qtType)] || 0) > (x[`${_.toLower(qtType)}Booked`] || 0));
        if (availableSlot) {
            suggestSlot.push(availableSlot);
        }
    } else if (bookingUnit > 1) {
        let result = [[]];
        toData.reduce((previousValue, currentValue) => {
            let tempArray = result[result.length - 1];
            if (previousValue.overallQt > 0
                && currentValue.overallQt > 0
                && (previousValue[_.toLower(qtType)] || 0) > (previousValue[`${_.toLower(qtType)}Booked`] || 0)
                && (currentValue[_.toLower(qtType)] || 0) > (currentValue[`${_.toLower(qtType)}Booked`] || 0)) {
                if (tempArray.length === 0) {
                    tempArray.push(previousValue);
                }
                tempArray.push(currentValue);
            } else {
                if (tempArray.length > 0) {
                    result.push([]);
                } else {
                    result[result.length - 1] = [];
                }
            }
            return currentValue;
        });
        let availableSlot = result.find(x => x.length >= bookingUnit);
        if (availableSlot) {
            suggestSlot = availableSlot.slice(0, bookingUnit);
        }
    }
    return suggestSlot.length > 0 ? suggestSlot : null;
}

export function updateMismatchQuota(suggestSlots, qtType, toData) {
    suggestSlots && suggestSlots.forEach(x => {
        let index = toData.findIndex(i => i.tmsltId === x.tmsltId);
        if (index !== -1) {
            toData[index][`${_.toLower(qtType)}Booked`] = (toData[index][`${_.toLower(qtType)}Booked`] || 0) + 1;
        }
    });
}

export function getFailureMoveTo(targetSlots, toData) {
    let apptMoveTo = [];
    if (targetSlots.length === 1) {
        let index = toData.findIndex(x => x.stime === targetSlots[0].stime && x.etime === targetSlots[0].etime);
        if (index !== -1) {
            apptMoveTo.push(toData[index]);
        } else {
            apptMoveTo.push(toData[0]);
        }
    } else if (targetSlots.length > 1) {
        if (targetSlots.length <= toData.length) {
            if (targetSlots.every(i => toData.findIndex(x => x.stime === i.stime && x.etime === i.etime) > -1)) {
                let index = toData.findIndex(x => x.stime === targetSlots[0].stime);
                apptMoveTo = toData.splice(index, targetSlots.length);
            } else {
                apptMoveTo = toData.splice(0, targetSlots.length);
            }
        }
    }
    return apptMoveTo.length > 0 ? apptMoveTo : null;
}

export function getMismatchData(apptId, fromData, toData) {
    let targetSlots = findApptsInSlot(apptId, fromData);
    let firstTarget = targetSlots[0]['appts'][0];
    let patientInfo = getPatientSummary(firstTarget);
    let originalAppt = `${targetSlots[0].date} ${targetSlots[0].stime} - ${targetSlots[targetSlots.length - 1].etime}`;
    let suggestSlots = findSuggestSlots(firstTarget.qtType, targetSlots.length, toData);
    if (suggestSlots) {
        let suggestedAppt = `${suggestSlots[0].date} ${suggestSlots[0].stime} - ${suggestSlots[suggestSlots.length - 1].etime}`;
        updateMismatchQuota(suggestSlots, firstTarget.qtType, toData);
        return {
            targetSlots,
            suggestSlots,
            patientInfo,
            originalAppt,
            suggestedAppt,
            proceed: 1,
            succeed: true
        };
    } else {
        let apptMoveTo = getFailureMoveTo(targetSlots, toData);
        let apptMoveToInfo = null, failureReason = 'Others';
        if(apptMoveTo){
            apptMoveToInfo = `${apptMoveTo[0].date} ${apptMoveTo[0].stime} - ${apptMoveTo[apptMoveTo.length - 1].etime}`;
            failureReason = 'No Quota';
        }
        return {
            patientInfo,
            originalAppt,
            apptMoveTo: apptMoveToInfo,
            failureReason,
            succeed: false
        };
    }
}


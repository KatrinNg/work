import {
    ORDER_LINE_TYPE
} from '../../enums/moe/moeEnums';

function checkAdvancedDuplicate(item, data) {
    switch (data.orderLineType) {
        case ORDER_LINE_TYPE.ADVANCED: {
            if (item.ddlPrep == data.ddlPrep
                && item.ddlActionStatus == data.ddlActionStatus
                && item.ddlSite == data.ddlSite
                && item.txtStartFrom == data.txtStartFrom)
                return true;
            return false;
        }
        case ORDER_LINE_TYPE.MULTIPLE_LINE: {
            if (item.moeMedMultDoses
                && data.moeMedMultDoses
                && data.moeMedMultDoses.length !== 0
                && item.moeMedMultDoses.length == data.moeMedMultDoses.length
                && item.ddlPrep == data.ddlPrep
                && item.ddlActionStatus == data.ddlActionStatus
                && item.ddlSite == data.ddlSite
                && item.txtStartFrom == data.txtStartFrom) {
                let mulDuplicate = data.moeMedMultDoses.filter(m => {
                    return item.moeMedMultDoses.filter(n =>
                        m.txtDosage == n.txtDosage
                        && m.txtDosageModu == n.txtDosageModu
                        && m.ddlFreq == n.ddlFreq
                        && m.freq1 == n.freq1);
                });
                if (mulDuplicate && mulDuplicate.length > 0)
                    return true;
            }
            return false;
        }
        case ORDER_LINE_TYPE.STEP_UP_AND_DOWN: {
            if (item.moeMedMultDoses
                && data.moeMedMultDoses
                && data.moeMedMultDoses.length !== 0
                && item.moeMedMultDoses.length == data.moeMedMultDoses.length
                && item.ddlPrep == data.ddlPrep
                && item.ddlActionStatus == data.ddlActionStatus
                && item.ddlSite == data.ddlSite
                && item.txtStartFrom == data.txtStartFrom) {
                let stepDuplicate = data.moeMedMultDoses.filter(m => {
                    return item.moeMedMultDoses.filter(n =>
                        m.txtDosage == n.txtDosage
                        && m.txtDosageModu == n.txtDosageModu
                        && m.ddlFreq == n.ddlFreq
                        && m.freq1 == n.freq1
                        && m.chkPRN == n.chkPRN
                        && m.txtDuration == n.txtDuration
                        && m.ddlDurationUnit == n.ddlDurationUnit);
                });
                if (stepDuplicate && stepDuplicate.length > 0)
                    return true;
            }
            return false;
        }
        case ORDER_LINE_TYPE.SPECIAL_INTERVAL: {
            if (item.specialInterval
                && data.specialInterval
                && item.ddlPrep == data.ddlPrep
                && item.ddlActionStatus == data.ddlActionStatus
                && item.ddlSite == data.ddlSite
                && item.txtStartFrom == data.txtStartFrom) {
                if (data.specialInterval.regimen == 'D'
                    && data.specialInterval.supplFreqId == 2
                    && item.specialInterval.regimen == 'D'
                    && item.specialInterval.supplFreqId == 2) {
                    if (data.specialInterval.supFreqText[0] == item.specialInterval.supFreqText[0]
                        && data.specialInterval.txtDosage == item.specialInterval.txtDosage
                        && data.specialInterval.txtDosageModu == item.specialInterval.txtDosageModu
                        && data.specialInterval.ddlFreq == item.specialInterval.ddlFreq
                        && data.specialInterval.freq1 == item.specialInterval.freq1)
                        return true;
                } else {
                    if (data.specialInterval.supFreqText[0] == item.specialInterval.supFreqText[0])
                        return true;
                }
            }
            return false;
        }
        default: break;
    }
}

//Check that all fields are equal
export function checkFavDuplicate(list, data) {
    let duplicate = [];
    if (!data || !list) return;
    if (list.length == 0) return;
    duplicate = list.filter(item => {
        if (item.txtDosage == data.txtDosage
            && item.txtDosageModu == data.txtDosageModu
            && item.ddlFreq == data.ddlFreq
            && item.freq1 == data.freq1
            && item.chkPRN == data.chkPRN
            && item.ddlRoute == data.ddlRoute
            && item.txtDuration == data.txtDuration
            && item.ddlDurationUnit == data.ddlDurationUnit
            && item.txtSpecInst == data.txtSpecInst
            && item.txtQty == data.txtQty
            && item.ddlQtyUnit == data.ddlQtyUnit
            && item.orderLineType == data.orderLineType
        ) {
            if (data.orderLineType !== ORDER_LINE_TYPE.NORMAL) {
                if (checkAdvancedDuplicate(item, data)) return item;
            }else{
                return item;
            }
        }
        return null;
    });
    return duplicate;
}
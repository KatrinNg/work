import moment from 'moment';
import React from 'react';
import _ from 'lodash';
import {
    ORDER_LINE_TYPE,
    DANGER_DRUG_DEFAULT_VALUE,
    MOE_DRUG_STATUS,
    ACTION_STATUS_TYPE
    // PANEL_DISPLAY_FIELD
} from '../enums/moe/moeEnums';
import * as moeUtilities from './moe/moeUtilities';
import Enum from '../enums/enum';

export function checkIsDecimal(value) {
    if (!value) return true;
    value = String(value);
    if (value.indexOf('.') === 0) return false;
    let reg = /^(([^0-][0-9]{0,10}|0)\.([0-9]{1,4})$)|^(([^0-][0-9]{0,10}|0)$)|^(([1-9]+)\.([0-9]{1,4})$)|^(([1-9]{0,10})$)/;
    if (reg.test(value)) {
        try {
            //eslint-disable-next-line
            let dd = eval(value);
            return dd > 0 ? true : false;
        } catch (error) {

            return false;
        }
    }
    return false;
}

function getDuplicateOrdDrug(orign, target) {
    if (!orign.vtm || !target.vtm) return;
    if (orign.vtm === target.vtm && orign.ddlRoute === target.ddlRoute) {
        if (orign.ddlSite && orign.ddlSite === target.ddlSite) {
            target.type = orign.vtm + orign.ddlRoute + orign.ddlSite;
            orign.type = orign.vtm + orign.ddlRoute + orign.ddlSite;
            target.isNewForDelete = true;
            return orign;
        } else if (!orign.ddlSite && !target.ddlSite) {
            target.type = orign.vtm + orign.ddlRoute;
            orign.type = orign.vtm + orign.ddlRoute;
            target.isNewForDelete = true;
            return orign;
        }
    }
    // if (!orign.drugName || !target.drugName) return;
    // if (orign.drugName === target.drugName && orign.ddlRoute === target.ddlRoute) {
    //     if (orign.ddlSite && orign.ddlSite === target.ddlSite) {
    //         target.type = orign.drugName + orign.ddlRoute + orign.ddlSite;
    //         orign.type = orign.drugName + orign.ddlRoute + orign.ddlSite;
    //         target.isNewForDelete = true;
    //         return orign;
    //     } else if (!orign.ddlSite && !target.ddlSite) {
    //         target.type = orign.drugName + orign.ddlRoute;
    //         orign.type = orign.drugName + orign.ddlRoute;
    //         target.isNewForDelete = true;
    //         return orign;
    //     }
    // }
    return null;
}
export function checkDrugDuplicate(list, curObj) {
    if (!curObj || curObj.length === 0) {
        return null;
    }
    let duplicateList = [];

    if (!Array.isArray(curObj)) {
        duplicateList = list.filter(item => {
            // if (item.drugName === curObj.drugName && item.ddlRoute === curObj.ddlRoute) {
            //     if (item.ddlSite && item.ddlSite === curObj.ddlSite) {
            //         curObj.type = item.drugName + item.ddlRoute + item.ddlSite;
            //         item.type = item.drugName + item.ddlRoute + item.ddlSite;
            //         return item;
            //     } else if (!item.ddlSite && !curObj.ddlSite) {
            //         curObj.type = item.drugName + item.ddlRoute;
            //         item.type = item.drugName + item.ddlRoute;
            //         return item;
            //     }
            // }
            // return null;
            return getDuplicateOrdDrug(item, curObj);
        });
        if (duplicateList && duplicateList.length > 0) {
            curObj.isNewForDelete = true;
            duplicateList.push(curObj);
        }
        return duplicateList;
    }

    list = list.filter(item => item.apiData && item.apiData.itemStatus === MOE_DRUG_STATUS.NORMAL || item.convertData && item.convertData.itemStatus === MOE_DRUG_STATUS.NORMAL);
    // if (Array.isArray(curObj)) {
    curObj.filter(function (ele) {
        let duplicateItems = list && list.filter(item => {
            // if (item.drugName === ele.drugName && item.ddlRoute === ele.ddlRoute) {
            //     if (item.ddlSite && item.ddlSite === ele.ddlSite) {
            //         ele.type = item.drugName + item.ddlRoute + item.ddlSite;
            //         item.type = item.drugName + item.ddlRoute + item.ddlSite;
            //         return item;
            //     } else if (!item.ddlSite && !ele.ddlSite) {
            //         ele.type = item.drugName + item.ddlRoute;
            //         item.type = item.drugName + item.ddlRoute;
            //         return item;
            //     }
            // }
            // return null;
            return getDuplicateOrdDrug(item, ele);
        });
        if (duplicateItems && duplicateItems.length > 0) {
            let ddList = duplicateItems.filter(dupItem => {
                if (duplicateList && duplicateList.find(dupListItem => dupListItem.cmsItemNo === dupItem.cmsItemNo)) {
                    return null;
                }
                if (dupItem.cmsItemNo === ele.cmsItemNo)
                    return null;
                return dupItem;
            });
            duplicateList = duplicateList.concat(ddList);
            ele.isNewForDelete = true;
            duplicateList.push(ele);
        }
        return null;
    });

    let drugSetDuplicateList = curObj.filter(ele => {
        // let duplicateItems = curObj && curObj.filter(item => {
        //     if (ele.cmsItemNo !== item.cmsItemNo && item.drugName === ele.drugName && item.ddlRoute === ele.ddlRoute) {
        //         if (item.ddlSite && item.ddlSite === ele.ddlSite) {
        //             ele.type = item.drugName + item.ddlRoute + item.ddlSite;
        //             return ele;
        //         } else if (!item.ddlSite && !ele.ddlSite) {
        //             ele.type = item.drugName + item.ddlRoute;
        //             return ele;
        //         }
        //     }
        //     return null;
        // });
        // return duplicateItems;
        const rel = curObj.filter(item => {
            return getDuplicateOrdDrug(ele, item);
        });
        if (rel && rel.length > 1)
            return rel;
        return null;
        // for (let i = 0; i < curObj.length; i++) {
        //     let item = curObj[i];
        //     if (ele.cmsItemNo !== item.cmsItemNo && item.drugName === ele.drugName && item.ddlRoute === ele.ddlRoute) {
        //         if (item.ddlSite && item.ddlSite === ele.ddlSite) {
        //             ele.type = item.drugName + item.ddlRoute + item.ddlSite;
        //             return ele;
        //         } else if (!item.ddlSite && !ele.ddlSite) {
        //             ele.type = item.drugName + item.ddlRoute;
        //             return ele;
        //         }
        //         break;
        //     }
        // }
    });

    if (drugSetDuplicateList && drugSetDuplicateList.length > 0) {
        let diffDupList = drugSetDuplicateList.filter(item => {
            let tempObj = duplicateList.find(ele => ele.cmsItemNo === item.cmsItemNo);
            if (tempObj)
                return null;
            return item;
        });
        if (diffDupList && diffDupList.length > 0)
            duplicateList = duplicateList.concat(diffDupList);
    }

    return duplicateList;
}

export function getSelectValue(list, code, inputValue) {
    let obj = list && list.find(item => item.code === code);
    let value = obj ? obj.engDesc : '';
    if (inputValue && obj && obj.useInputValue === 'Y') {
        value = obj.code.replace('__', ' ' + inputValue + ' ');
    }
    return value;
}

export function getFreqString(freqDesc, freq1) {
    if (freq1 > 0) {
        let flagIndex = freqDesc.indexOf('_');
        let flagLastIndex = freqDesc.lastIndexOf('_');
        return freqDesc.slice(0, flagIndex + 1) + freq1 + freqDesc.slice(flagLastIndex);
    }
    return freqDesc;
}

export function getErrorMessageList(errorMessageList) {
    let errorList = [];
    for (let i = 0; i < errorMessageList.length; i++) {
        const errorObj = errorList.find(item => item.fieldName === errorMessageList[i].fieldName);
        if (!errorObj)
            errorList.push(errorMessageList[i]);
    }
    return errorList;
}

export function getPrepSelectValue(list, code, inputValue) {
    let obj = list && list.find(item => item.ampId === code);
    let value = obj ? obj.strength : '';
    if (inputValue && obj && obj.useInputValue === 'Y') {
        value = obj.code.replace('__', ' ' + inputValue + ' ');
    }
    return value;
}

// export function getPrepSelectCode(list, value) {
//     let obj = list && list.find(item => item.strength === value);
//     let code = obj ? obj.ampId : '';
//     return code;
// }

export function getPrepSelectText(list, value) {
    let obj = list && list.find(item => item.ampId === value);
    let code = obj ? obj.strength : '';
    return code;
}

export function getFreqSelectValue(list, code, inputValue) {
    let obj = list && list.find(item => item.code === code);
    let value = obj ? obj.freqEng : '';
    if (inputValue && obj && obj.useInputValue === 'Y') {
        value = obj.code.replace('__', ' ' + inputValue + ' ');
    }
    return value;
}

export function getFreqSelectIdByText(list, text) {
    let obj = list && list.find(item => item.freqCode === text);
    return obj ? obj.freqId : null;
}

export function getSiteSelectValue(list, code, inputValue) {
    let obj = list && list.find(item => item.siteId === code);
    let value = obj ? obj.siteEng : '';
    if (inputValue && obj && obj.useInputValue === 'Y') {
        value = obj.code.replace('__', ' ' + inputValue + ' ');
    }
    return value;
}

export function getDrugPartTitle(drug) {
    let vtm = (drug.vtm && drug.vtm !== '' ? ' (' + drug.vtm + ')' : '');
    let strength = drug.freeText === 'F' ? drug.txtStrength : drug.isShowAdvanced && drug.ddlPrep;
    let form = drug.txtForm ? ' ' + drug.txtForm : null;
    let drugTitle = drug.drugName + vtm + (strength ? ' ' + strength : '') + form;
    return drugTitle;
}

export function getMultipleLineTitle(drug, codeList) {
    let separator = ' — ';
    let arryMultipleLine = [];
    let multipleIndex = -1;
    // if (/*drug.dangerDrug === 'Y' &&*/ drug.multipleLine && drug.multipleLine.length > 0)
    if (/*drug.dangerDrug === 'Y' &&*/ drug.moeMedMultDoses && drug.moeMedMultDoses.length > 0)
        multipleIndex = 0;
    /*else if (drug.dangerDrug === 'N' && drug.multipleLine && drug.multipleLine.length > 0)
        multipleIndex = 0;*/
    if (multipleIndex >= 0) {
        // for (let i = multipleIndex; i < drug.multipleLine.length; i++) {
        //     let mulLine = [];
        //     if ((drug.multipleLine[i].txtDosage && drug.txtDosageModu) || drug.multipleLine[i].ddlFreq) {
        //         if (drug.multipleLine[i].txtDosage && drug.txtDosageModu) {
        //             mulLine.push(<b key={drug.multipleLine[i].txtDosage}>{drug.multipleLine[i].txtDosage + ' ' + drug.txtDosageModu}</b>);
        //             mulLine.push(separator);
        //         }
        //         if (drug.multipleLine[i].ddlFreq) {
        //             mulLine.push(getFreqSelectValue(codeList.freq_code, drug.multipleLine[i].ddlFreq, drug.multipleLine[i].freq1));
        //             mulLine.push(separator);
        //         }
        //         if (drug.chkPRN === 'Y') {
        //             mulLine.push('as required');
        //             mulLine.push(separator);
        //         }
        //         if (drug.dangerDrug === 'Y' && drug.multipleLine[i].txtDangerDrugQty) {
        //             mulLine.push('( prescribe ' + drug.multipleLine[i].txtDangerDrugQty + ' dose )');
        //             mulLine.push(separator);
        //         }
        //         if (i !== drug.multipleLine.length - 1) {
        //             mulLine.push('and');
        //         }
        //         if (mulLine[mulLine.length - 1] === separator) {
        //             mulLine.pop();
        //         }
        //     }
        //     if (mulLine && mulLine.length > 0) {
        //         arryMultipleLine.push(mulLine);
        //     }
        // }
        for (let i = multipleIndex; i < drug.moeMedMultDoses.length; i++) {
            let mulLine = [];
            if ((drug.moeMedMultDoses[i].txtDosage && drug.txtDosageModu) || drug.moeMedMultDoses[i].ddlFreq) {
                if (drug.moeMedMultDoses[i].txtDosage && drug.txtDosageModu) {
                    mulLine.push(<b key={drug.moeMedMultDoses[i].txtDosage}>{drug.moeMedMultDoses[i].txtDosage + ' ' + drug.txtDosageModu}</b>);
                    mulLine.push(separator);
                }
                if (drug.moeMedMultDoses[i].ddlFreq) {
                    mulLine.push(getFreqSelectValue(codeList.freq_code, drug.moeMedMultDoses[i].ddlFreq, drug.moeMedMultDoses[i].freq1));
                    mulLine.push(separator);
                }
                if (drug.chkPRN === 'Y') {
                    mulLine.push('as required');
                    mulLine.push(separator);
                }
                if (drug.dangerDrug === 'Y' && drug.moeMedMultDoses[i].txtDangerDrugQty) {
                    mulLine.push('( prescribe ' + drug.moeMedMultDoses[i].txtDangerDrugQty + ' dose )');
                    mulLine.push(separator);
                }
                if (i !== drug.moeMedMultDoses.length - 1) {
                    mulLine.push('and');
                }
                if (mulLine[mulLine.length - 1] === separator) {
                    mulLine.pop();
                }
            }
            if (mulLine && mulLine.length > 0) {
                arryMultipleLine.push(mulLine);
            }
        }
    }
    return arryMultipleLine;
}

export function getStepUpDownTitle(drug, codeList, panelStartFrom, isHideDose) {
    let separator = ' — ';
    let arryStepUpDown = [];
    let stepUpDownIndex = -1;
    // if (/*drug.dangerDrug === 'Y' &&*/ drug.stepUpDown && drug.stepUpDown.length > 0)
    if (/*drug.dangerDrug === 'Y' &&*/ drug.moeMedMultDoses && drug.moeMedMultDoses.length > 0)
        stepUpDownIndex = 0;
    /*else if (drug.dangerDrug === 'N' && drug.stepUpDown && drug.stepUpDown.length > 0)
        stepUpDownIndex = 0;*/
    if (stepUpDownIndex >= 0) {
        // for (let i = stepUpDownIndex; i < drug.stepUpDown.length; i++) {
        //     let mulLine = [];
        //     if ((drug.stepUpDown[i].txtDosage && drug.txtDosageModu) || drug.stepUpDown[i].ddlFreq || drug.stepUpDown[i].chkPRN || (drug.stepUpDown[i].txtDuration && drug.stepUpDown[i].ddlDurationUnit)) {
        //         if (drug.stepUpDown[i].txtDosage && drug.txtDosageModu) {
        //             mulLine.push(<b key={drug.stepUpDown[i].txtDosage}>{drug.stepUpDown[i].txtDosage + ' ' + drug.txtDosageModu}</b>);
        //             mulLine.push(separator);
        //         }
        //         if (drug.stepUpDown[i].ddlFreq) {
        //             mulLine.push(getFreqSelectValue(codeList.freq_code, drug.stepUpDown[i].ddlFreq, drug.stepUpDown[i].freq1));
        //             mulLine.push(separator);
        //         }
        //         if (drug.stepUpDown[i].chkPRN === 'Y') {
        //             mulLine.push('as required');
        //             mulLine.push(separator);
        //         }
        //         if (!isHideDose && drug.dangerDrug === 'Y' && drug.stepUpDown[i].txtDangerDrugQty) {
        //             mulLine.push('( prescribe ' + drug.stepUpDown[i].txtDangerDrugQty + ' dose )');
        //             mulLine.push(separator);
        //         }
        //         if (drug.ddlRoute) {
        //             mulLine.push(getSelectValue(codeList.route, drug.ddlRoute)
        //                 + (drug.ddlSite && drug.ddlSite !== 'others' && drug.ddlRoute !== '' ? ' ('
        //                     + getSiteSelectValue(codeList.site, drug.ddlSite) + ')' : ''));
        //             mulLine.push(separator);
        //         }
        //         if (drug.stepUpDown[i].txtDuration && drug.stepUpDown[i].ddlDurationUnit) {
        //             mulLine.push('for ' + drug.stepUpDown[i].txtDuration + ' '
        //                 // + getSelectValue(codeList.duration_unit, drug.stepUpDown[i].ddlDurationUnit ? drug.stepUpDown[i].ddlDurationUnit : 'd'));
        //                 + getSelectValue(codeList.duration_unit, drug.stepUpDown[i].ddlDurationUnit ?
        //                     drug.stepUpDown[i].ddlDurationUnit : moeUtilities.getHospSetting().defaultDurationUnit));
        //             mulLine.push(separator);
        //         }
        //         if (i == 0 && panelStartFrom) {
        //             mulLine.push(panelStartFrom);
        //         }
        //         if (i !== drug.stepUpDown.length - 1) {
        //             if (mulLine[mulLine.length - 1] === separator) {
        //                 mulLine[mulLine.length - 1] = <b key={Math.random()}>{', then'}</b>;
        //             } else {
        //                 mulLine.push(<b key={Math.random()}>{', then'}</b>);
        //             }
        //         }
        //         else if (mulLine[mulLine.length - 1] === separator) {
        //             mulLine.pop();
        //         }
        //     }
        //     if (mulLine && mulLine.push()) {
        //         arryStepUpDown.push(mulLine);
        //     }
        // }
        for (let i = stepUpDownIndex; i < drug.moeMedMultDoses.length; i++) {
            let mulLine = [];
            if ((drug.moeMedMultDoses[i].txtDosage && drug.txtDosageModu) || drug.moeMedMultDoses[i].ddlFreq || drug.moeMedMultDoses[i].chkPRN || (drug.moeMedMultDoses[i].txtDuration && drug.moeMedMultDoses[i].ddlDurationUnit)) {
                if (drug.moeMedMultDoses[i].txtDosage && drug.txtDosageModu) {
                    mulLine.push(<b key={drug.moeMedMultDoses[i].txtDosage}>{drug.moeMedMultDoses[i].txtDosage + ' ' + drug.txtDosageModu}</b>);
                    mulLine.push(separator);
                }
                if (drug.moeMedMultDoses[i].ddlFreq) {
                    mulLine.push(getFreqSelectValue(codeList.freq_code, drug.moeMedMultDoses[i].ddlFreq, drug.moeMedMultDoses[i].freq1));
                    mulLine.push(separator);
                }
                if (drug.moeMedMultDoses[i].chkPRN === 'Y') {
                    mulLine.push('as required');
                    mulLine.push(separator);
                }
                if (!isHideDose && drug.dangerDrug === 'Y' && drug.moeMedMultDoses[i].txtDangerDrugQty) {
                    mulLine.push('( prescribe ' + drug.moeMedMultDoses[i].txtDangerDrugQty + ' dose )');
                    mulLine.push(separator);
                }
                if (drug.ddlRoute) {
                    mulLine.push(getSelectValue(codeList.route, drug.ddlRoute)
                        + (drug.ddlSite && drug.ddlSite !== 'others' && drug.ddlRoute !== '' ? ' ('
                            + getSiteSelectValue(codeList.site, drug.ddlSite) + ')' : ''));
                    mulLine.push(separator);
                }
                if (drug.moeMedMultDoses[i].txtDuration && drug.moeMedMultDoses[i].ddlDurationUnit) {
                    mulLine.push('for ' + drug.moeMedMultDoses[i].txtDuration + ' '
                        // + getSelectValue(codeList.duration_unit, drug.stepUpDown[i].ddlDurationUnit ? drug.stepUpDown[i].ddlDurationUnit : 'd'));
                        + getSelectValue(codeList.duration_unit, drug.moeMedMultDoses[i].ddlDurationUnit ?
                            drug.moeMedMultDoses[i].ddlDurationUnit : moeUtilities.getHospSetting().defaultDurationUnit));
                    mulLine.push(separator);
                }
                if (i == 0 && panelStartFrom) {
                    mulLine.push(panelStartFrom);
                }
                if (i !== drug.moeMedMultDoses.length - 1) {
                    if (mulLine[mulLine.length - 1] === separator) {
                        mulLine[mulLine.length - 1] = <b key={Math.random()}>{', then'}</b>;
                    } else {
                        mulLine.push(<b key={Math.random()}>{', then'}</b>);
                    }
                }
                else if (mulLine[mulLine.length - 1] === separator) {
                    mulLine.pop();
                }
            }
            if (mulLine && mulLine.push()) {
                arryStepUpDown.push(mulLine);
            }
        }
    }
    return arryStepUpDown;
}

export function isDisplayRoute(list, value) {
    if (list) {
        let map = new Map(Object.entries(list));
        return map.has(value) ? map.get(value) === 'Y' : false;
    }
    return false;
}

export function generatePanelTitle(drug, codeList, isHideDose, ordDate) {
    if (!drug) return;
    let separator = ' — ';
    let formRoute = (drug.formEng || drug.txtForm) + ' ' + drug.routeEng;
    let displayRoute = isDisplayRoute(codeList.form_route_map, formRoute);
    let panelDrugName = moeUtilities.getDrugName(drug, displayRoute); //20191206 Rewrite drug name method by Louis Chen
    //let panelVTM = drug.vtm ? (moeUtilities.isMultipleIngredient(drug.vtm) ? moeUtilities.getDisplayString(drug, PANEL_DISPLAY_FIELD) : ' (' + drug.vtm + ')') : '';
    // let panelStrength = drug.freeText === 'F' ? (drug.txtStrength || '') : (drug.isShowAdvanced && drug.ddlPrep) || '';
    // let panelForm = drug.txtForm || '';
    let panelDosage = drug.txtDosage && drug.txtDosageModu && drug.txtDosage + ' ' + (drug.txtDosageModu ? drug.txtDosageModu : drug.prescribeUnit);
    let panelFreq = drug.ddlFreq ? getFreqSelectValue(codeList.freq_code, drug.ddlFreq, drug.freq1) : '';
    let panelPRN = drug.chkPRN === 'Y' ? 'as required' : '';
    let panelRoute = drug.ddlRoute && getSelectValue(codeList.route, drug.ddlRoute) + ((drug.isShowAdvanced || drug.freeText === 'F') && drug.ddlSite && drug.ddlSite !== 'others' && drug.ddlRoute !== '' ? ' (' + getSiteSelectValue(codeList.site, drug.ddlSite) + ')' : '');
    let panelDuration = drug.txtDuration && drug.ddlDurationUnit ? 'for ' + drug.txtDuration + ' ' + getSelectValue(codeList.duration_unit, drug.ddlDurationUnit ?
        drug.ddlDurationUnit :
        // 'd'
        moeUtilities.getHospSetting().defaultDurationUnit
    ) : '';
    // let panelStartFrom = drug.freeText !== 'F' && (drug.isShowAdvanced || (drug.multipleLine && drug.multipleLine.length > 0)) ?
    let panelStartFrom = drug.freeText !== 'F' && (drug.isShowAdvanced || (drug.moeMedMultDoses && drug.moeMedMultDoses.length > 0)) ?
        // (drug.txtStartFrom && moment(drug.txtStartFrom).format('DD-MMM-YYYY') !== moment(new Date()).format('DD-MMM-YYYY') ?
        //     '(Start from: ' + moment(drug.txtStartFrom).format('DD-MMM-YYYY') + ')' : '')
        // : '';
        (drug.txtStartFrom && moment(drug.txtStartFrom).format(Enum.DATE_FORMAT_EDMY_VALUE) !== moment(ordDate).format(Enum.DATE_FORMAT_EDMY_VALUE) ?
            '(Start from: ' + moment(drug.txtStartFrom).format(Enum.DATE_FORMAT_EDMY_VALUE) + ')' : '')
        : '';
    let panelQty = drug.dangerDrug === 'Y' ?
        (!isHideDose && drug.txtDangerDrugQty ? '( prescribe ' + drug.txtDangerDrugQty + ' dose )' : null)
        : (drug.txtQty && drug.ddlQtyUnit && drug.txtQty + ' ' + getSelectValue(codeList.base_unit, drug.ddlQtyUnit));
    let panelSpecInst = drug.txtSpecInst && '(' + drug.txtSpecInst + ')';
    let panelActionStatus = (drug.isShowAdvanced || drug.freeText === 'F')
        && drug.ddlActionStatus
        && drug.ddlActionStatus !== ACTION_STATUS_TYPE.DISPENSE_PHARMACY
        && '[' + getSelectValue(codeList.action_status, drug.ddlActionStatus) + ']';
    // let arryMultipleLine = getMultipleLineTitle(drug, codeList);
    // let arryStepUpDown = getStepUpDownTitle(drug, codeList, panelStartFrom, isHideDose);
    let arryMultipleLine = drug.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE && getMultipleLineTitle(drug, codeList);
    let arryStepUpDown = drug.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN && getStepUpDownTitle(drug, codeList, panelStartFrom, isHideDose);
    let matchingResult = null;
    // let displayString = (panelStrength && ' ' + panelStrength) + (panelForm && ' ' + panelForm);
    if (drug.multipleLine && drug.multipleLine.length > 0 && arryMultipleLine.length > 0) {
        return <div style={{ wordBreak: 'break-all' }}>
            <p style={{ margin: '0' }}>{panelDrugName}{separator}</p>
            {arryMultipleLine.map((line, index) => {
                if (arryMultipleLine.length === index + 1) {
                    return <p key={drug.ordNo + '_' + drug.orgItemNo + '_' + index} style={{ paddingLeft: '15px', margin: '0' }}>{line}
                        {panelRoute && separator + panelRoute}
                        {panelDuration && separator + panelDuration}
                        {panelStartFrom && ' ' + panelStartFrom}
                        <b>{drug.dangerDrug !== 'Y' && panelQty ? separator + panelQty : ''}</b>
                    </p>;
                } else {
                    return <p key={drug.ordNo + '_' + drug.orgItemNo + '_' + index} style={{ paddingLeft: '15px', margin: '0' }}>{line}</p>;
                }
                // return <p key={drug.ordNo + '_' + drug.orgItemNo + '_' + index} style={{ paddingLeft: '15px', margin: '0' }}>{line}
                //     {arryMultipleLine.length === index + 1 ? (panelRoute ? separator + panelRoute : '')
                //         + (panelDuration ? separator + panelDuration : '')
                //         + (panelStartFrom ? separator + panelStartFrom : '')
                //         + (drug.dangerDrug !== 'Y' && panelQty ? separator + panelQty : '') : ''}</p>;
            })}
            <p style={{ paddingLeft: '15px', margin: '0' }}>{panelSpecInst}</p>
            <p style={{ paddingLeft: '15px', margin: '0' }}>{panelActionStatus}</p></div>;

    } else if (drug.stepUpDown && drug.stepUpDown.length > 0 && arryStepUpDown.length > 0) {
        return <div style={{ wordBreak: 'break-all' }}>
            <p style={{ margin: '0' }}>{panelDrugName}{separator}</p>
            {arryStepUpDown.map((line, index) => {
                // if (index === 0) {
                //     return <p key={drug.ordNo + '_' + drug.orgItemNo + '_' + index} style={{ paddingLeft: '15px', margin: '0' }}>
                //         <b key={Math.random()}>{panelDosage}</b>
                //         {panelFreq && separator + panelFreq}
                //         {panelPRN && separator + panelPRN}
                //         {panelRoute && separator + panelRoute}
                //         {panelDuration && separator + panelDuration}
                //         {panelStartFrom && ' ' + panelStartFrom}
                //         {/* {panelSpecInst && '\n' + panelSpecInst}
                //         {panelActionStatus && '\n' + panelActionStatus} */}
                //         <b key={Math.random()}>{', then'}</b>
                //     </p>;
                // } else
                if (arryStepUpDown.length === index + 1) {
                    return <p key={drug.ordNo + '_' + drug.orgItemNo + '_' + index} style={{ paddingLeft: '15px', margin: '0' }}>{line}{separator}</p>;
                } else {
                    return <p key={drug.ordNo + '_' + drug.orgItemNo + '_' + index} style={{ paddingLeft: '15px', margin: '0' }}>{line}</p>;
                }
            })}
            <p style={{ margin: '0' }}><b>{drug.dangerDrug !== 'Y' && panelQty}</b></p>
            <p style={{ margin: '0' }}>{panelSpecInst}</p>
            <p style={{ margin: '0' }}>{panelActionStatus}</p></div>;

    } else if (drug.specialInterval && drug.specialInterval !== null && drug.specialInterval.specialIntervalText && drug.specialInterval.specialIntervalText.length > 0) {
        if (drug.specialInterval.specialIntervalText.length === 1) {
            const freqSpecText = drug.specialInterval.displayWithFreq[0] === 'Y' ? panelFreq + '(' + drug.specialInterval.specialIntervalText[0] + ')' : drug.specialInterval.specialIntervalText[0];
            return <div style={{ wordBreak: 'break-all' }}>{panelDrugName}
                {panelDosage && separator + panelDosage}
                {panelFreq && freqSpecText && separator + freqSpecText}
                {panelPRN && separator + panelPRN}
                {panelRoute && separator + panelRoute}
                {panelDuration && separator + panelDuration}
                {panelStartFrom ? panelDuration ? ' ' + panelStartFrom : separator + panelStartFrom : ''}
                {panelQty && separator + panelQty}
                {panelSpecInst && '\n' + panelSpecInst}
                {panelActionStatus && '\n' + panelActionStatus}</div>;
        } else {
            const specInterDosage = drug.specialInterval.txtDosage && drug.txtDosageModu && drug.specialInterval.txtDosage + ' ' + (drug.txtDosageModu ? drug.txtDosageModu : drug.prescribeUnit);
            const secondFreq = drug.specialInterval.ddlFreq && getFreqSelectValue(codeList.freq_code, drug.specialInterval.ddlFreq, drug.specialInterval.freq1);
            const firstFreqSpecText = drug.specialInterval.displayWithFreq[0] === 'Y' ? panelFreq + '(' + drug.specialInterval.specialIntervalText[0] + ')' : drug.specialInterval.specialIntervalText[0];
            const secondFreqSpecText = drug.specialInterval.displayWithFreq[1] === 'Y' ? secondFreq + '(' + drug.specialInterval.specialIntervalText[1] + ')' : drug.specialInterval.specialIntervalText[1];
            const thirdText = (panelPRN ? separator + panelPRN : '') + (panelRoute ? separator + panelRoute : '')
                + (panelDuration ? separator + panelDuration : '') + (panelStartFrom ? panelDuration ? ' ' + panelStartFrom : separator + panelStartFrom : '');
            if (drug.dangerDrug === 'Y') {
                const firstLine = (panelDosage ? panelDosage + separator : '') + (panelFreq ? firstFreqSpecText + separator : '') + (!isHideDose && drug.txtDangerDrugQty ? '( prescribe ' + drug.txtDangerDrugQty + ' dose )' + separator : '');
                const secondeLine = (specInterDosage ? specInterDosage + separator : '') + (secondFreq ? secondFreqSpecText + separator : '') + (!isHideDose && drug.specialInterval.txtDangerDrugQty ? '( prescribe ' + drug.specialInterval.txtDangerDrugQty + ' dose )' + separator : '');
                matchingResult = <div style={{ wordBreak: 'break-all' }}>{panelDrugName}{separator}
                    <p style={{ paddingLeft: '15px', margin: '0', whiteSpace: 'pre' }}>
                        {firstLine ? firstLine + 'and' : ''}
                        {firstLine ? '\n' + secondeLine.substring(0, secondeLine.length - 3) : secondeLine ? secondeLine + 'and' : ''}
                        {secondeLine ? thirdText : thirdText ? thirdText.substring(3, thirdText.length) : ''}
                    </p>
                    <p style={{ margin: '0' }}>{panelSpecInst}</p>
                    <p style={{ margin: '0' }}>{panelActionStatus}</p></div>;
            } else {
                const firstLine = (panelDosage ? panelDosage + separator : '') + (panelFreq ? firstFreqSpecText + separator : '');
                const secondeLine = (specInterDosage ? specInterDosage + separator : '') + (secondFreq ? secondFreqSpecText + separator : '');
                matchingResult = <div style={{ wordBreak: 'break-all' }}>{panelDrugName}{separator}
                    <p style={{ paddingLeft: '15px', margin: '0', whiteSpace: 'pre' }}>
                        {firstLine ? firstLine + 'and' : ''}
                        {firstLine ? '\n' + secondeLine.substring(0, secondeLine.length - 3) : secondeLine ? secondeLine + 'and' : ''}
                        {secondeLine ? thirdText : thirdText ? thirdText.substring(3, thirdText.length) : ''}
                        {panelQty && separator + panelQty}
                    </p>
                    <p style={{ margin: '0' }}>{panelSpecInst}</p>
                    <p style={{ margin: '0' }}>{panelActionStatus}</p></div>;
            }
            return matchingResult;
        }
    } else {
        //20191206 Rewrite drug name method by Louis Chen
        //return matchingResult = <div>{panelDrugName}&nbsp;{panelVTM}&nbsp;{displayString}
        return <div style={{ wordBreak: 'break-all' }}>{panelDrugName}
            {panelDosage && separator + panelDosage}
            {panelFreq && separator + panelFreq}
            {panelPRN && separator + panelPRN}
            {panelRoute && separator + panelRoute}
            {panelDuration && separator + panelDuration}
            {panelStartFrom && ' ' + panelStartFrom}
            {panelQty && separator + panelQty}
            {panelSpecInst && '\n' + panelSpecInst}
            {panelActionStatus && '\n' + panelActionStatus}</div>;
    }
}

/*
export function getPanelTitle(drug, codeList) {
    let arryTitle = [];
    let strTitle = '';
    arryTitle[0] = drug.drugName && drug.drugName + (drug.vtm && drug.vtm !== '' ? ' (' + drug.vtm + ')' : '');
    // arryTitle[0] = moeUtilities.getDisplayString(drug);
    arryTitle[1] = drug.freeText === 'F' ? drug.txtStrength : drug.isShowAdvanced && drug.ddlPrep;
    arryTitle[2] = drug.txtForm;
    arryTitle[3] = drug.txtDosage && drug.txtDosageModu && drug.txtDosage + ' ' + (drug.txtDosageModu ? drug.txtDosageModu : drug.prescribeUnit);
    arryTitle[4] = drug.ddlFreq && getFreqSelectValue(codeList.freq_code, drug.ddlFreq, drug.freq1);
    arryTitle[5] = drug.chkPRN === 'Y' ? 'as required' : '';
    arryTitle[6] = drug.ddlRoute && getSelectValue(codeList.route, drug.ddlRoute) + ((drug.isShowAdvanced || drug.freeText === 'F') && drug.ddlSite && drug.ddlSite !== 'others' && drug.ddlRoute !== '' ? ' (' + getSiteSelectValue(codeList.site, drug.ddlSite) + ')' : '');
    arryTitle[7] = drug.txtDuration && drug.ddlDurationUnit && 'for ' + drug.txtDuration + ' ' + getSelectValue(codeList.duration_unit, drug.ddlDurationUnit ? drug.ddlDurationUnit : 'd');
    arryTitle[8] = drug.freeText !== 'F' && (drug.isShowAdvanced || (drug.multipleLine && drug.multipleLine.length > 0)) ?
        // (drug.txtStartFrom && moment(drug.txtStartFrom).format('DD-MMM-YYYY') !== moment(new Date()).format('DD-MMM-YYYY') ?
        //     '(Start from: ' + moment(drug.txtStartFrom).format('DD-MMM-YYYY') + ')' : '')
        // : '';
        (drug.txtStartFrom && moment(drug.txtStartFrom).format(Enum.DATE_FORMAT_EDMY_VALUE) !== moment(new Date()).format(Enum.DATE_FORMAT_EDMY_VALUE) ?
        '(Start from: ' + moment(drug.txtStartFrom).format(Enum.DATE_FORMAT_EDMY_VALUE) + ')' : '')
    : '';
    arryTitle[9] = drug.dangerDrug === 'Y' ? (drug.txtDangerDrugQty ? '( prescribe ' + drug.txtDangerDrugQty + ' dose )' : null) : (drug.txtQty && drug.ddlQtyUnit && drug.txtQty + ' ' + getSelectValue(codeList.base_unit, drug.ddlQtyUnit));
    arryTitle[10] = drug.txtSpecInst && '(' + drug.txtSpecInst + ')';
    arryTitle[11] = (drug.isShowAdvanced || drug.freeText === 'F') && drug.ddlActionStatus && drug.ddlActionStatus !== 'Y' && '[' + getSelectValue(codeList.action_status, drug.ddlActionStatus) + ']';
    //arryTitle[12] = drug.remarkText ? 'Note: ' + drug.remarkText : null;
    let arryMultipleLine = [];
    let multipleIndex = -1;
    if (drug.dangerDrug === 'Y' && drug.multipleLine && drug.multipleLine.length > 1)
        multipleIndex = 1;
    else if (drug.dangerDrug === 'N' && drug.multipleLine && drug.multipleLine.length > 0)
        multipleIndex = 0;
    if (multipleIndex >= 0) {
        for (let i = multipleIndex; i < drug.multipleLine.length; i++) {
            let mulLine = '';
            if ((drug.multipleLine[i].txtDosage && drug.txtDosageModu) || drug.multipleLine[i].ddlFreq) {
                if (drug.multipleLine[i].txtDosage && drug.txtDosageModu) {
                    mulLine = drug.multipleLine[i].txtDosage + ' ' + drug.txtDosageModu + ' - ';
                }
                if (drug.multipleLine[i].ddlFreq) {
                    mulLine += getFreqSelectValue(codeList.freq_code, drug.multipleLine[i].ddlFreq, drug.multipleLine[i].freq1) + ' - ';
                }
                if (drug.chkPRN === 'Y') {
                    mulLine += 'as required - ';
                }
                if (drug.dangerDrug === 'Y' && drug.multipleLine[i].txtDangerDrugQty) {
                    mulLine += '( prescribe ' + drug.multipleLine[i].txtDangerDrugQty + ' dose ) - ';
                }
                if (i !== drug.multipleLine.length - 1) {
                    mulLine += 'and';
                }
                else if (mulLine.substring(mulLine.length - 3) !== ' - ') {
                    mulLine += ' - ';
                }
            }
            if (mulLine) {
                arryMultipleLine[i] = mulLine;
            }
        }
    }
    let stepUpDownIndex = -1;
    if (drug.dangerDrug === 'Y' && drug.stepUpDown && drug.stepUpDown.length > 1)
        stepUpDownIndex = 1;
    else if (drug.dangerDrug === 'N' && drug.stepUpDown && drug.stepUpDown.length > 0)
        stepUpDownIndex = 0;
    if (stepUpDownIndex >= 0) {
        for (let i = stepUpDownIndex; i < drug.stepUpDown.length; i++) {
            let mulLine = '';
            if ((drug.stepUpDown[i].txtDosage && drug.txtDosageModu) || drug.stepUpDown[i].ddlFreq || drug.stepUpDown[i].chkPRN || (drug.stepUpDown[i].txtDuration && drug.stepUpDown[i].ddlDurationUnit)) {
                if (drug.stepUpDown[i].txtDosage && drug.txtDosageModu) {
                    mulLine = drug.stepUpDown[i].txtDosage + ' ' + drug.txtDosageModu + ' - ';
                }
                if (drug.stepUpDown[i].ddlFreq) {
                    mulLine += getFreqSelectValue(codeList.freq_code, drug.stepUpDown[i].ddlFreq, drug.stepUpDown[i].freq1) + ' - ';
                }
                if (drug.stepUpDown[i].chkPRN === 'Y') {
                    mulLine += 'as required - ';
                }
                if (drug.dangerDrug === 'Y' && drug.stepUpDown[i].txtDangerDrugQty) {
                    mulLine += '( prescribe ' + drug.stepUpDown[i].txtDangerDrugQty + ' dose ) - ';
                }
                if (drug.ddlRoute) {
                    mulLine += getSelectValue(codeList.route, drug.ddlRoute) + (drug.ddlSite && drug.ddlSite !== 'others' && drug.ddlRoute !== '' ? ' (' + getSiteSelectValue(codeList.site, drug.ddlSite) + ')' : '') + ' - ';
                }
                if (drug.stepUpDown[i].txtDuration && drug.stepUpDown[i].ddlDurationUnit) {
                    mulLine += 'for ' + drug.stepUpDown[i].txtDuration + ' ' + getSelectValue(codeList.duration_unit, drug.stepUpDown[i].ddlDurationUnit ? drug.stepUpDown[i].ddlDurationUnit : 'd') + ' - ';
                }
                if (i !== drug.stepUpDown.length - 1) {
                    mulLine = mulLine.substring(0, mulLine.length - 3) + ', then';
                }
            }
            if (mulLine) {
                arryMultipleLine[i] = mulLine;
            }
        }
    }
    for (let i = 0; i < arryTitle.length; i++) {
        if (arryTitle[i] && arryTitle[i] !== '') {
            //special interval
            if (i === 4 && drug.specialInterval && drug.specialInterval !== null && drug.specialInterval.specialIntervalText && drug.specialInterval.specialIntervalText.length > 0) {
                strTitle += drug.specialInterval.displayWithFreq && drug.specialInterval.displayWithFreq.length > 0 && drug.specialInterval.displayWithFreq[0] !== null && drug.specialInterval.displayWithFreq[0] === 'Y' ?
                    arryTitle[4] + '(' + drug.specialInterval.specialIntervalText[0] + ') - ' + (drug.dangerDrug === 'Y' && drug.specialInterval.supplFreqId === 2 && drug.specialInterval.regimen === 'D' && drug.txtDangerDrugQty ? '( prescribe ' + drug.txtDangerDrugQty + ' dose ) - ' : '')
                    : drug.specialInterval.specialIntervalText[0] + ' - ' + (drug.dangerDrug === 'Y' && drug.specialInterval.supplFreqId === 2 && drug.specialInterval.regimen === 'D' && drug.txtDangerDrugQty ? '( prescribe ' + drug.txtDangerDrugQty + ' dose ) - ' : '');
            }
            //danger drug
            else if (drug.dangerDrug === 'Y' && i === 9 && ((drug.multipleLine && drug.multipleLine.length > 0 && arryMultipleLine.length > 0) || (drug.stepUpDown && drug.stepUpDown.length > 0 && arryMultipleLine.length > 0) || (drug.specialInterval && drug.specialInterval !== null && drug.specialInterval.supplFreqId === 2 && drug.specialInterval.regimen === 'D')))
                // eslint-disable-next-line
                strTitle = strTitle || '';
            else
                strTitle += arryTitle[i] + ' - ';

            //drug name
            if ((i === 0 && arryTitle[1] && arryTitle[1] !== '') || (i === 0 && arryTitle[2] && arryTitle[2] !== '') || (i === 1 && arryTitle[2] && arryTitle[2] !== '')) {
                strTitle = strTitle.substring(0, strTitle.length - 3) + ' ';
            }
            if (i === 7 && arryTitle[8] !== '') {
                strTitle = strTitle.substring(0, strTitle.length - 3) + ' ';
            }
        }
        //special interval on odd / even days

        if (drug.specialInterval && drug.specialInterval !== null && drug.specialInterval.supplFreqId === 2 && drug.specialInterval.regimen === 'D') {
            if (i === 2) strTitle += '\n    ';
            if (i === 4) {
                const spTxtDosage = drug.specialInterval.txtDosage && drug.txtDosageModu && drug.specialInterval.txtDosage + ' ' + (drug.txtDosageModu ? drug.txtDosageModu : drug.prescribeUnit);
                const freqText = drug.specialInterval.displayWithFreq && drug.specialInterval.displayWithFreq.length > 1 && drug.specialInterval.displayWithFreq[1] === 'Y' ?
                    drug.specialInterval.ddlFreq && getFreqSelectValue(codeList.freq_code, drug.specialInterval.ddlFreq, drug.specialInterval.freq1) + '(' + drug.specialInterval.specialIntervalText[1] + ')' + (drug.dangerDrug === 'Y' && drug.specialInterval.supplFreqId === 2 && drug.specialInterval.regimen === 'D' && drug.specialInterval.txtDangerDrugQty ? ' - ( prescribe ' + drug.specialInterval.txtDangerDrugQty + ' dose )' : '')
                    :
                    drug.specialInterval.specialIntervalText[1] + (drug.dangerDrug === 'Y' && drug.specialInterval.supplFreqId === 2 && drug.specialInterval.regimen === 'D' && drug.specialInterval.txtDangerDrugQty ? ' - ( prescribe ' + drug.specialInterval.txtDangerDrugQty + ' dose )' : '');
                strTitle += 'and \n    ' + (spTxtDosage && (spTxtDosage + ' - ')) + (freqText && (freqText + ' - '));
            }
        }
        //end special interval on odd / even days
        if (arryMultipleLine.length > 0 && i === 2 && (arryTitle[3] || arryTitle[4] || arryTitle[5])) {
            strTitle += '\n    ';
        }
        if (i === 5 && drug.multipleLine && drug.multipleLine.length > 0 && arryMultipleLine.length > 0) {
            if (drug.dangerDrug === 'Y' && arryTitle[9])
                strTitle += arryTitle[9] + ' - and';
            else
                strTitle += 'and';
            for (let a = 0; a < arryMultipleLine.length; a++) {
                if (arryMultipleLine[a])
                    strTitle += '\n    ' + arryMultipleLine[a];
            }
        }
        if (i === 4 && arryTitle[9] && drug.stepUpDown && drug.stepUpDown.length > 1 && arryMultipleLine.length > 1 && drug.dangerDrug === 'Y') {
            strTitle += arryTitle[9] + ' - ';
        }
        if (i === 9) {
            if (drug.dangerDrug === 'N' && drug.stepUpDown && drug.stepUpDown.length > 0 && arryMultipleLine.length > 0) {
                strTitle = strTitle.substring(0, strTitle.length - 3) + ', then';
                for (let a = 0; a < arryMultipleLine.length; a++) {
                    strTitle += '\n    ' + arryMultipleLine[a];
                }
            } else if (drug.dangerDrug === 'Y' && drug.stepUpDown && drug.stepUpDown.length > 1 && arryMultipleLine.length > 1) {
                strTitle = strTitle.substring(0, strTitle.length - 3) + ', then';
                for (let a = 1; a < arryMultipleLine.length; a++) {
                    strTitle += '\n    ' + arryMultipleLine[a];
                }
            }
            let c = 0;
            for (let a = 10; a < arryTitle.length; a++) {
                if (arryTitle[a] && arryTitle[a] !== '') {
                    c++;
                }
            }
            if (c > 0) {
                // eslint-disable-next-line
                strTitle = strTitle.substring(0, strTitle.length - 3) + '\n';
            }
        }
        // if (i === 10) {
        //     let c = 0;
        //     for (let a = 8; a <= 10; a++) {
        //         if (arryTitle[a] && arryTitle[a] !== '') {
        //             c++;
        //         }
        //     }
        //     if (c > 0) {
        //             strTitle = strTitle.substring(0, strTitle.length - 3) + '\n';
        //     }
        // }
        if (i === 10 && arryTitle[11] && arryTitle[10]) {
            strTitle = strTitle.substring(0, strTitle.length - 3) + '\n';
        }
        // if (i === 11 && arryTitle[12]) {
        //     if (strTitle.substring(strTitle.length - 2) === '\n') {
        //         strTitle = strTitle.substring(0, strTitle.length - 2);
        //     } else if(strTitle.substring(strTitle.length - 3) === ' - ') {
        //         strTitle = strTitle.substring(0, strTitle.length - 3) + '\n';
        //     }
        // }
    }
    if (strTitle.substring(strTitle.length - 3) === ' - ') {
        strTitle = strTitle.substring(0, strTitle.length - 3);
    }
    return strTitle;
}*/

export function getSelectedPrescriptionData(item, childItem) {
    let prescriptionData = {
        orderDetailId: null,
        displayNameType: item.displayNameType,
        displayString: item.displayString,
        localDrugId: item.localDrugId,
        drugName: item.tradeName,
        ddlRoute: item.routeId,
        routeEng: item.routeEng,
        prescribeUnit: item.prescribeUnit,
        baseUnit: item.baseUnit,
        txtStrength: item.strength,
        ddlActionStatus: ACTION_STATUS_TYPE.DISPENSE_PHARMACY,
        txtForm: item.formEng,
        ddlQtyUnit: item.baseUnitId,
        freeText: item.displayNameType || null,
        strengthCompulsory: item.strengthCompulsory,
        ddlSite: '',
        txtStartFrom: '',
        isShowAdvanced: false,
        vtm: item.vtm,
        vtmId: item.vtmId,
        tradeNameVtmId: item.tradeNameVtmId,
        dangerDrug: item.dangerDrug || DANGER_DRUG_DEFAULT_VALUE,
        txtDangerDrugQty: '',
        drugDto: item.drugDto,
        allergyCheckFlag: item.allergyCheckFlag,
        doseFormExtraInfo: item.doseFormExtraInfo,
        doseFormExtraInfoId: item.doseFormExtraInfoId,
        orderLineType: ORDER_LINE_TYPE.NORMAL
    };
    let moeEhrMedProfile = {};
    moeEhrMedProfile.screenDisplay = item.displayString;
    prescriptionData.moeEhrMedProfile = moeEhrMedProfile;

    if (childItem) {
        prescriptionData.txtDosage = childItem.dosage;
        prescriptionData.txtDosageModu = childItem.dosageUnit;
        prescriptionData.ddlFreq = childItem.freqCode;
        prescriptionData.freq1 = childItem.freq1;
        prescriptionData.ddlDurationUnit = childItem.durationUnit;
        prescriptionData.txtDuration = childItem.durationValue;
        prescriptionData.chkPRN = childItem.prn;
        prescriptionData.drugDto = childItem.drugDto;
        prescriptionData.ddlRoute = childItem.routeId;
        prescriptionData.routeEng = childItem.routeEng;
    }
    if (!childItem) {
        prescriptionData.children = [];
        prescriptionData.txtDosageModu = item.prescribeUnit;//20190927 Should show prescribe unit on UI by Louis Chen
    }

    return prescriptionData;
}

export function getSearchResult(data) {
    let hospSetting = moeUtilities.getHospSetting();
    let result = [];
    let allParentList = data.filter(item => item.parent);
    let allChildList = data.filter(item => !item.parent);
    for (let i = 0; i < allParentList.length; i++) {
        let obj = {};
        let parentItem = allParentList[i];
        obj.parentId = i;

        obj.localDrugId = parentItem.localDrugId || '';
        obj.displayString = parentItem.displayString || '';
        obj.tradeName = parentItem.tradeName || '';
        obj.vtm = parentItem.vtm || '';
        if (parentItem.route) {
            obj.routeId = parentItem.route.routeId || '';
            obj.routeEng = parentItem.route.routeEng || '';
        }
        obj.prescribeUnit = parentItem.prescribeUnit || '';
        obj.baseUnit = parentItem.baseUnit || '';
        obj.formEng = parentItem.formEng || '';

        obj.prescribeUnit = parentItem.prescribeUnit || '';

        if (parentItem.baseUnitId) {
            obj.baseUnitId = parentItem.baseUnitId.baseUnitId;
        }

        obj.strengthCompulsory = parentItem.strengthCompulsory || '';
        obj.vtm = parentItem.vtm;
        obj.vtmId = parentItem.vtmId;
        obj.tradeNameVtmId = parentItem.tradeNameVtmId;
        obj.displayNameType = parentItem.displayNameType;

        obj.dangerDrug = parentItem.dangerDrug || DANGER_DRUG_DEFAULT_VALUE;
        obj.moQty = '';
        // if(obj.dangerDrug === 'Y')
        // obj.baseUnitId = 7700304;
        obj.freeText = parentItem.freeText;
        obj.allergyCheckFlag = parentItem.allergyCheckFlag;
        obj.doseFormExtraInfo = parentItem.doseFormExtraInfo;
        obj.doseFormExtraInfoId = parentItem.doseFormExtraInfoId;
        //20191209 Update get drug name method by Louis Chen
        obj.genericIndicator = parentItem.genericIndicator;
        obj.ingredientList = parentItem.ingredientList;
        obj.manufacturer = parentItem.manufacturer;
        obj.screenDisplay = parentItem.screenDisplay;
        obj.strengths = parentItem.strengths;
        obj.nameType = parentItem.displayNameType;
        obj.txtForm = parentItem.formEng;
        obj.aliasName = parentItem.tradeNameAlias;
        obj.drugName = parentItem.tradeName;
        obj.strength = parentItem.strength;
        obj.strengthLevelExtraInfo = parentItem.strengths[0].strengthLevelExtraInfo;
        //20191209 Update get drug name method by Louis Chen
        obj.aliasNames = parentItem.aliasNames; // add for display alias name in drug by mk

        let childList = allChildList.filter(item => item.localDrugId === parentItem.localDrugId);
        obj.children = [];
        for (let j = 0; j < childList.length; j++) {
            let childObj = {};
            let childItem = childList[j];
            obj.childId = j;
            if (childItem.commonDosages && childItem.commonDosages.length > 0) {
                let commonDosages = childItem.commonDosages[0];
                childObj.dosage = commonDosages.dosage || '';
                childObj.dosageUnit = commonDosages.dosageUnit || '';
                childObj.dosageEng = commonDosages.dosageEng || '';
                childObj.freq1 = commonDosages.freq1 || 0;
                childObj.freqCode = commonDosages.freqCode || '';
                childObj.freqEng = commonDosages.freqEng || '';
                childObj.freqString = getFreqString(childObj.freqEng, childObj.freq1);
                childObj.prn = commonDosages.prn;
                childObj.prnDesc = commonDosages.prn && commonDosages.prn === 'Y' ? 'as required' : null;
                childObj.routeId = commonDosages.routeId || '';
                childObj.routeEng = commonDosages.routeEng || '';
                if (commonDosages.freq) {
                    childObj.durationUnit = commonDosages.freq.durationUnit || '';
                    childObj.durationValue = commonDosages.freq.durationValue || '';
                }
                childObj.drugDto = childItem;
            }
            obj.children.push(childObj);
        }

        if (obj.children.length > 0 && hospSetting.expandPreDosage)
            obj.open = true;
        obj.drugDto = parentItem;
        result.push(obj);
    }
    return result;
}

export function parseIntByVal(value) {
    if (value) {
        const valueParse = parseInt(value);
        if (!isNaN(valueParse)) {
            return valueParse;
        }
    }
    return null;
}

export function sortList(array, key, desc) {
    if (!array || array.length <= 0)
        return null;
    if (desc) {
        array.sort(function (a, b) {
            if (a[key] > b[key]) {
                return -1;
            } else if (a[key] < b[key]) {
                return 1;
            }
            return 0;
        });
    } else {
        array.sort(function (a, b) {
            if (a[key] < b[key]) {
                return -1;
            } else if (a[key] > b[key]) {
                return 1;
            }
            return 0;
        });
    }
}

export function getFreqCodeList(string) {
    let codeList = [];
    let startNum = 0;
    let endNum = 0;
    if (string.search('a.m.') !== -1 || string.search('p.m.') !== -1) {
        startNum = 1;
        endNum = 12;
    } else if (string.search('times') !== -1 || string.search('day') !== -1) {
        startNum = 6;
        endNum = 48;
    } else if (string.search('hour') !== -1) {
        startNum = 1;
        endNum = 72;
    }
    for (let i = startNum; i <= endNum; i++) {
        codeList.push({ code: i });
    }
    return codeList;
}

export function getSiteCodeListByRoute(prescriptionData, codeList) {
    let sitesCodeList = [];
    if (prescriptionData) {
        let isShowAll = false;
        let curRoute = codeList &&
            codeList.route &&
            codeList.route.find(i => i.code === prescriptionData.ddlRoute);

        if (curRoute) sitesCodeList = _.cloneDeep(curRoute.sites);
        if (prescriptionData.ddlSite && prescriptionData.ddlSite !== ''
            && ((!sitesCodeList || sitesCodeList.length === 0) || (sitesCodeList && !sitesCodeList.find(item => item.siteId === prescriptionData.ddlSite)))) {
            isShowAll = true;
        }
        if (isShowAll) {
            // const allRouteCodeList = this.props.codeList.route;
            // sitesCodeList = prescriptionUtilities.getAllSiteCodeList(allRouteCodeList);
            if (codeList)
                sitesCodeList = codeList.site;
        } else {
            if (sitesCodeList.length !== 0) {
                sitesCodeList.push({ siteId: 'others', siteEng: 'others' });
            }
        }
    }
    return sitesCodeList;
}

export function getPrepForUI(data) {
    let result = {};
    result.ddlPrepCodeList = [];
    result.ddlPrep = '';
    if (data) {
        let strength = '';

        if (data.strength && data.moeEhrMedProfile) {
            if (data.moeEhrMedProfile.strengthCompulsory === 'N') {
                strength = data.strength || '';
            } else if (data.moeEhrMedProfile.strengthCompulsory === 'Y' && data.strength) {
                let strengths = data.strength.split('+');
                if (strengths.length > 0) strength = strengths[0];
            }
        }
        if (data.prep) {
            result.ddlPrepCodeList = data.prep;
            if (strength) {
                for (let i = 0; i < data.prep.length; i++) {
                    if (strength === data.prep[i].strength) {
                        result.ddlPrep = data.prep[i].strength;
                        data.prep[i].selected = true;
                    } else {
                        data.prep[i].selected = false;
                    }
                }
            } else if (data.moeEhrMedProfile && data.moeEhrMedProfile.strengthCompulsory == 'Y') {
                for (let i = 0; i < data.prep.length; i++) {
                    if (data.prep[i].selected) {
                        result.ddlPrep = data.prep[i].strength;
                        break;
                    }
                }
            }
        }
    }
    return result;
}

export function getDrugDetailItemForUI(data, backDate, moduleName) {
    let isShowAdvanced = (data.moeEhrMedProfile.orderLineType && data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.NORMAL ? false : true);
    let item = {};
    //DAC params
    // if (data.freeText !== 'F') {
    //     item.aliasName = data.moeEhrMedProfile.aliasName;
    //     item.doseFormExtraInfoId = data.moeEhrMedProfile.doseFormExtraInfoId;
    //     item.doseFormExtraInfo = data.moeEhrMedProfile.doseFormExtraInfo;
    //     item.genericIndicator = data.moeEhrMedProfile.genericIndicator;
    //     item.ingredientList = data.moeEhrMedProfile.ingredientList;
    //     item.manufacturer = data.moeEhrMedProfile.manufacturer;
    //     item.nameType = data.nameType;
    //     item.drugRouteEng = data.moeEhrMedProfile.drugRouteEng;
    //     item.screenDisplay = data.moeEhrMedProfile.screenDisplay;
    //     item.strengthLevelExtraInfo = data.moeEhrMedProfile.strengthLevelExtraInfo;
    //     item.prepCodeList = data.prep;
    //     item.strengths = data.strengths;
    // }
    //end DAC params
    item.apiData = data;
    item.ordNo = data.ordNo ? data.ordNo : moduleName;
    item.cmsItemNo = data.cmsItemNo;
    item.orgItemNo = data.orgItemNo;
    item.orderDetailId = moduleName ? null : data.cmsItemNo;
    item.chkPRN = data.prn || 'N';
    item.localDrugId = data.moeEhrMedProfile.drugId || '';
    item.drugName = data.tradename || '';
    item.ddlRoute = parseIntByVal(data.routeCode);
    item.routeEng = data.routeDesc;
    item.prescribeUnit = data.modu || '';
    item.baseUnit = data.baseunit || '';
    item.txtStrength = data.freqText || '';
    // item.ddlActionStatus = data.actionStatus || 'Y';
    item.ddlActionStatus = data.actionStatus;
    item.txtForm = data.formDesc || '';
    item.ddlQtyUnit = parseIntByVal(data.moQtyUnit);
    item.freeText = data.nameType;
    item.displayNameType = data.nameType;
    item.ddlSite = parseIntByVal(data.siteCode);
    item.children = [];
    item.txtDosageModu = data.modu || '';
    item.txtDosage = data.dosage || '';
    item.txtQty = data.moQty || '';
    item.txtDuration = data.duration || '';
    // item.ddlDurationUnit = data.durationUnit || 'd';
    item.ddlDurationUnit = data.durationUnit || moeUtilities.getHospSetting().defaultDurationUnit;
    item.ddlFreq = data.freqCode || '';
    item.freq1 = data.freq1 || 0;
    item.txtSpecInst = data.specInstruct || '';
    // item.txtStartFrom = data.startDate || moment(backDate ? backDate : new Date(), 'YYYY-MM-DD').valueOf();
    // item.txtStartFrom = data.startDate || moment(backDate ? backDate : new Date(), Enum.DATE_FORMAT_EYMD_VALUE).valueOf();
    item.txtStartFrom = data.startDate;
    item.dangerDrug = data.dangerdrug;
    item.txtDangerDrugQty = data.moQty;
    item.isShowAdvanced = isShowAdvanced;
    item.myFavouriteId = data.myFavouriteId;
    item.itemStatus = data.itemStatus;
    item.strength = data.strength;//20191205 Add strength to drugList by Louis Chen

    if (data.moeEhrMedProfile) {
        item.vtm = data.moeEhrMedProfile.vtm;
        item.vtmId = data.moeEhrMedProfile.vtmId;
        item.tradeNameVtmId = data.moeEhrMedProfile.tradeNameVtmId;
        item.displayString = data.moeEhrMedProfile.screenDisplay;
        item.orderLineType = data.moeEhrMedProfile.orderLineType;
        item.doseFormExtraInfo = data.moeEhrMedProfile.doseFormExtraInfo;
        item.doseFormExtraInfoId = data.moeEhrMedProfile.doseFormExtraInfoId;

        item.aliasName = data.moeEhrMedProfile.aliasName;
        item.genericIndicator = data.moeEhrMedProfile.genericIndicator;
        item.ingredientList = data.moeEhrMedProfile.ingredientList;
        item.manufacturer = data.moeEhrMedProfile.manufacturer;
        item.drugRouteEng = data.moeEhrMedProfile.drugRouteEng;
        item.screenDisplay = data.moeEhrMedProfile.screenDisplay;
        item.strengthLevelExtraInfo = data.moeEhrMedProfile.strengthLevelExtraInfo;
        item.ddlQtyUnit = data.moeEhrMedProfile.moQtyUnitId;
        //Added by Renny 20191210 DHCIMSB-1799 start
        item.ddlModuId = data.moeEhrMedProfile.moduId || '';
        item.drugId = data.moeEhrMedProfile.drugId || '';
        item.formId = data.moeEhrMedProfile.formId || '';
        item.freqId = data.moeEhrMedProfile.freqId || '';
        //Added by Renny 20191210 DHCIMSB-1799 end
    }
    item.nameType = data.nameType;
    item.prepCodeList = data.prep;
    item.strengths = data.strengths;

    if (data.dangerdrug === 'Y' && data.moeMedMultDoses && data.moeMedMultDoses.length > 0 && (data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE || data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN)) {
        item.txtDangerDrugQty = data.moeMedMultDoses[0].moQty;
    } else if (data.dangerdrug === 'Y' && data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
        item.txtDangerDrugQty = data.moQty;
    }
    if (data.moeEhrMedAllergens && data.moeEhrMedAllergens.length > 0) {
        item.allergens = data.moeEhrMedAllergens;
    }
    item.remarkText = data.remarkText;
    item.strengthCompulsory = data.moeEhrMedProfile.strengthCompulsory;
    let prep = getPrepForUI(data);
    item.ddlPrep = prep.ddlPrep;
    item.ddlPrepCodeList = prep.ddlPrepCodeList;
    if (data.moeMedMultDoses) {
        if (data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE
            || data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
        ) {
            let tempList = data.moeMedMultDoses.map(temp => ({
                multDoseNo: temp.multDoseNo,
                txtDosage: temp.dosage,
                ddlFreq: temp.freqCode,
                ddlDurationUnit: temp.durationUnit,
                txtDuration: temp.duration,
                chkPRN: temp.prn,
                freq1: temp.freq1,
                txtDangerDrugQty: temp.moQty
            }));
            // sortList(tempList, 'stepNo');
            item.moeMedMultDoses = tempList;
            // if (data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
            //     let tempList = data.moeMedMultDoses.map(temp => ({
            //         stepNo: temp.stepNo,
            //         multDoseNo: temp.multDoseNo,
            //         txtDosage: temp.dosage,
            //         ddlFreq: temp.freqCode,
            //         freq1: temp.freq1,
            //         txtDangerDrugQty: temp.moQty
            //     }));
            //     // sortList(tempList, 'stepNo');
            //     item.multipleLine = tempList;
            // } else if (data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
            //     let tempList = data.moeMedMultDoses.map(temp => ({
            //         stepNo: temp.stepNo,
            //         multDoseNo: temp.multDoseNo,
            //         txtDosage: temp.dosage,
            //         ddlFreq: temp.freqCode,
            //         // ddlDurationUnit: temp.durationUnit || 'd',
            //         ddlDurationUnit: temp.durationUnit || moeUtilities.getHospSetting().defaultDurationUnit,
            //         txtDuration: temp.duration,
            //         chkPRN: temp.prn,
            //         freq1: temp.freq1,
            //         txtDangerDrugQty: temp.moQty
            //     }));
            //     // sortList(tempList, 'stepNo');
            //     item.stepUpDown = tempList;
        } else if (data.moeEhrMedProfile.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            let arryFreqText = [];
            arryFreqText.push(data.supFreqText);
            let specialInterval = {
                supFreq1: data.supFreq1 || '',
                supFreq2: data.supFreq2 || '',
                regimen: data.regimen || '',
                supFreqCode: data.supFreqCode || '',
                dayOfWeek: data.dayOfWeek || '',
                supFreqText: arryFreqText,
                supplFreqId: parseIntByVal(data.moeEhrMedProfile.supplFreqId),
                cycleMultiplier: data.moeEhrMedProfile.cycleMultiplier || '',
                displayWithFreq: data.displayWithFreq,
                specialIntervalText: data.specialIntervalText,
                txtDangerDrugQty: ''
            };
            if (data.regimen === 'D' && data.moeEhrMedProfile.supplFreqId === 2) {
                specialInterval.freq1 = data.moeMedMultDoses[1].freq1;
                specialInterval.txtDosage = data.moeMedMultDoses[1].dosage;
                specialInterval.ddlFreq = data.moeMedMultDoses[1].freqCode;
                specialInterval.freqText = data.moeMedMultDoses[1].freqText;
                arryFreqText.push(data.moeMedMultDoses[1].supFreqText);
                specialInterval.supFreqText = arryFreqText;
                specialInterval.txtDangerDrugQty = data.moeMedMultDoses[1].moQty;
            }
            item.specialInterval = specialInterval;
        }
    }
    return item;
}

export function getDrugDataForUI(dataApi, moduleName) {
    let dataSource = {};
    switch (moduleName) {
        case 'F': {
            dataSource = dataApi;
            break;
        }
        default: {
            dataSource = dataApi.moeOrder;
            break;
        }
    }

    if (!dataSource) return null;

    let result = [];
    for (let i = 0; i < dataSource.moeMedProfiles.length; i++) {
        let item = getDrugDetailItemForUI(dataSource.moeMedProfiles[i], dataSource.backDate, moduleName);
        result.push(item);
    }
    sortList(result, 'orgItemNo');
    return result;
}

export function getStrengthForBackend(ddlPrepCodeList, ddlPrep, strengthCompulsory) {
    let result = '';
    let flag = '+';
    if (ddlPrepCodeList && ddlPrep) {
        let selectedItem = ddlPrepCodeList && ddlPrepCodeList.find(item => item.strength === ddlPrep);
        if (strengthCompulsory === 'N') {
            result = selectedItem ? `${selectedItem.strength}` : '';
        } else if (strengthCompulsory === 'Y') {
            let selectedText = selectedItem ? `${selectedItem.strength}${flag}` : '';
            result = selectedText;
            if (selectedText) {
                let unSelectedItems = ddlPrepCodeList && ddlPrepCodeList.filter(item => item.strength !== ddlPrep);
                for (let i = 0; i < unSelectedItems.length; i++) {
                    let tempText = unSelectedItems[i].strength;
                    result += `${tempText}${flag}`;
                }
            }
        }
    }
    return result;
}


export function getDrugDataForBackend(drugList, orderData, patient, orderRemark, codeList) {
    let version = 0;
    let ordNo = 0;
    let result = {};
    let moeMedProfilesList = [];
    let isUpdate = false;
    if (orderData && orderData.moeOrder) {
        // version = orderData.version;
        // ordNo = orderData.ordNo;
        version = orderData.moeOrder.version;
        ordNo = orderData.moeOrder.ordNo;
        result = orderData;
        isUpdate = orderData.moeOrder.moeMedProfiles && orderData.moeOrder.moeMedProfiles.length > 0 ? true : false;
        //isUpdate = true;
    } else {
        result = {
            'moeCaseNo': patient.moeCaseNo,
            'moePatientKey': patient.moePatientKey,
            'moeOrder': {
                'ordNo': ordNo,
                'version': version,
                'moeMedProfiles': []
            }
        };
        isUpdate = false;
    }

    //order remark
    result.moeOrder.remarkText = orderRemark || (orderData && orderData.moeOrder && orderData.moeOrder.remarkText);
    for (let i = 0; i < drugList.length; i++) {
        let data = drugList[i];

        let existDrug = {};

        let isExist = false;
        if (isUpdate) {
            existDrug = result.moeOrder && result.moeOrder.moeMedProfiles && result.moeOrder.moeMedProfiles.find(item => item.cmsItemNo === data.cmsItemNo);
            if (!existDrug) {
                existDrug = {};
                if (data.convertData) {
                    existDrug = _.cloneDeep(data.convertData);
                }
            } else {
                isExist = true;
            }
        } else {
            if (data.convertData) {
                existDrug = _.cloneDeep(data.convertData);
            }
        }

        let orderLineType = data.orderLineType;
        // let orderLineType = ORDER_LINE_TYPE.NORMAL;
        // if (data.isShowAdvanced) {
        //     if (data.multipleLine && data.multipleLine.length > 0) { orderLineType = ORDER_LINE_TYPE.MULTIPLE_LINE; }
        //     else if (data.stepUpDown && data.stepUpDown.length > 0) { orderLineType = ORDER_LINE_TYPE.STEP_UP_AND_DOWN; }
        //     else if (data.specialInterval && data.specialInterval !== null) { orderLineType = ORDER_LINE_TYPE.SPECIAL_INTERVAL; }
        //     else { orderLineType = ORDER_LINE_TYPE.ADVANCED; }
        // }

        existDrug.myFavouriteId = data.myFavouriteId;
        existDrug.actionStatus = data.ddlActionStatus || '';
        existDrug.baseunit = data.baseUnit || '';
        existDrug.cmsItemNo = data.cmsItemNo;
        existDrug.orgItemNo = data.orgItemNo || '';
        existDrug.formDesc = data.txtForm || '';
        existDrug.freqCode = data.ddlFreq || '';
        //Added by Renny 20191219 DHCIMSB-1934 start
        // existDrug.freqText = data.txtStrength || '';
        existDrug.freqText = getFreqSelectValue(codeList.freq_code, data.ddlFreq, data.freq1);
        if (data.convertData) {
            existDrug.trueDisplayname = data.convertData.trueDisplayname || '';
        } else if (data.apiData) {
            existDrug.trueDisplayname = data.apiData.trueDisplayname || '';
        }
        //Added by Renny 20191210 DHCIMSB-1934 end
        existDrug.itemcode = data.localDrugId || '';
        // existDrug.drugId = data.ddlPrep || '';
        existDrug.moQty = data.dangerDrug === 'Y' ? data.txtDangerDrugQty : (data.ddlQtyUnit && data.txtQty ? data.txtQty : '');
        result.moQtyUnit = getSelectValue(codeList.base_unit, data.ddlQtyUnit) || '';
        // if(data.dangerDrug && data.dangerDrug === 'Y')
        // data.ddlQtyUnit = 7700304;
        existDrug.moQtyUnitId = data.freeText && data.freeText === 'F' ?
            (data.ddlQtyUnit && data.txtQty ? data.ddlQtyUnit : '')
            : data.ddlQtyUnit || '';
        existDrug.moQtyUnit = data.freeText && data.freeText === 'F' ?
            (data.ddlQtyUnit && data.txtQty ? getSelectValue(codeList.base_unit, data.ddlQtyUnit) : '')
            : getSelectValue(codeList.base_unit, data.ddlQtyUnit) || '';
        existDrug.modu = data.freeText && data.freeText === 'F' ? (data.txtDosage && data.txtDosageModu ? data.txtDosageModu : '') : data.txtDosageModu || '';
        existDrug.dosage = data.txtDosage && data.txtDosageModu ? data.txtDosage : '';

        if ((data.ddlDurationUnit && data.txtDuration) || orderLineType == ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            existDrug.duration = data.txtDuration || '';
            existDrug.durationUnit = data.ddlDurationUnit || '';
        }

        existDrug.freq1 = data.freq1 || 0;
        existDrug.prn = data.chkPRN || '';
        existDrug.dangerdrug = data.dangerDrug || DANGER_DRUG_DEFAULT_VALUE;

        if (!existDrug.moeEhrMedProfile) {
            existDrug.moeEhrMedProfile = {};
        }
        existDrug.moeEhrMedProfile.screenDisplay = data.displayString || '';
        existDrug.moeEhrMedProfile.siteId = data.ddlSite || '';
        existDrug.moeEhrMedProfile.strengthCompulsory = data.strengthCompulsory || '';
        existDrug.moeEhrMedProfile.orderLineType = orderLineType;
        existDrug.moeEhrMedProfile.vtm = data.vtm;
        existDrug.moeEhrMedProfile.vtmId = data.vtmId;
        existDrug.moeEhrMedProfile.tradeNameVtmId = data.tradeNameVtmId;
        existDrug.moeEhrMedProfile.tradeName = data.drugName;
        existDrug.moeEhrMedProfile.doseFormExtraInfo = data.doseFormExtraInfo;
        existDrug.moeEhrMedProfile.doseFormExtraInfoId = data.doseFormExtraInfoId;
        existDrug.moeEhrMedProfile.moQtyUnitId = data.ddlQtyUnit;
        existDrug.moeEhrMedProfile.aliasName = data.aliasName; //Added by Mankit
        //Added by Renny 20191210 DHCIMSB-1799 start
        existDrug.moeEhrMedProfile.manufacturer = data.manufacturer || '';
        existDrug.moeEhrMedProfile.genericIndicator = data.genericIndicator || '';
        existDrug.moeEhrMedProfile.routeId = data.ddlRoute || '';
        if (!existDrug.moeEhrMedProfile.moduId)
            existDrug.moeEhrMedProfile.moduId = data.ddlModuId || '';
        if (!existDrug.moeEhrMedProfile.drugId)
            existDrug.moeEhrMedProfile.drugId = data.drugId || '';
        if (!existDrug.moeEhrMedProfile.formId)
            existDrug.moeEhrMedProfile.formId = data.formId || '';
        if (!existDrug.moeEhrMedProfile.freqId)
            existDrug.moeEhrMedProfile.freqId = data.freqId || '';
        //Added by Renny 20191210 DHCIMSB-1799 end

        existDrug.startDate = data.txtStartFrom || '';
        existDrug.specInstruct = data.txtSpecInst || '';
        existDrug.routeCode = data.ddlRoute || '';
        existDrug.routeDesc = getSelectValue(codeList.route, data.ddlRoute);
        existDrug.siteCode = data.ddlSite || '';
        existDrug.siteDesc = getSiteSelectValue(codeList.site, data.ddlSite);
        if (data.apiData) {
            //for save from favourite
            if (data.apiData.moeEhrMedProfile) {
                existDrug.moeEhrMedProfile.drugRouteEng = data.apiData.moeEhrMedProfile.drugRouteEng;
                existDrug.moeEhrMedProfile.drugRouteId = data.apiData.moeEhrMedProfile.drugRouteId;
            }
            //existDrug.strength = getPrepSelectCode(data.ddlPrepCodeList, data.apiData.strength) || data.ddlPrep || '';
            // existDrug.strength = getStrengthForBackend(data.ddlPrepCodeList, data.ddlPrep, data.strengthCompulsory) || data.apiData.strength;
            existDrug.strength = getStrengthForBackend(data.ddlPrepCodeList, data.ddlPrep, data.strengthCompulsory);
        } else {
            //existDrug.strength = data.ddlPrep || '';
            existDrug.strength = getStrengthForBackend(data.ddlPrepCodeList, data.ddlPrep, data.strengthCompulsory);
        }
        if (data.apiData && data.apiData.prep) existDrug.prep = data.apiData.prep;
        if (data.apiData && data.apiData.maxDuration) existDrug.maxDuration = data.apiData.maxDuration;
        if (data.apiData && data.apiData.minDosages) {
            existDrug.minDosages = data.apiData.minDosages;
            existDrug.minDosagesMessage = data.apiData.minDosagesMessage;
        }
        // existDrug.strength = existDrug.strength.trim('+') + '+';
        existDrug.tradename = data.drugName || '';
        existDrug.itemStatus = data.itemStatus;
        existDrug.version = data.version ? data.version : 0;
        // existDrug.nameType = data.displayNameType;
        existDrug.nameType = data.freeText;
        existDrug.remarkText = data.remarkText;
        existDrug.moeEhrMedAllergens = data.allergens || [];
        if (data.dangerDrug && data.dangerDrug === 'Y' && orderLineType !== ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            existDrug.moeMedMultDoses = [];
            let content = {
                multDoseNo: 1,
                moQty: data.txtDangerDrugQty
            };
            existDrug.moeMedMultDoses.push(content);
        }

        if (orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
            existDrug.displayWithFreq = data.specialInterval.displayWithFreq;
            existDrug.specialIntervalText = data.specialInterval.specialIntervalText;
            existDrug.regimen = data.specialInterval.regimen;
            existDrug.supFreq1 = data.specialInterval.supFreq1;
            existDrug.supFreq2 = data.specialInterval.supFreq2;
            existDrug.supFreqCode = data.specialInterval.supFreqCode;
            existDrug.dayOfWeek = data.specialInterval.dayOfWeek;
            existDrug.supFreqText = data.specialInterval && data.specialInterval.supFreqText && data.specialInterval.supFreqText.length !== 0 ? data.specialInterval.supFreqText[0] : null;
            existDrug.moeEhrMedProfile.supplFreqId = data.specialInterval.supplFreqId;
            existDrug.moeEhrMedProfile.cycleMultiplier = data.specialInterval.regimen === 'C' ? data.specialInterval.cycleMultiplier : null;
            if (data.dangerDrug === 'Y') {
                existDrug.moQty = data.txtDangerDrugQty;
            }
            if (data.specialInterval.supplFreqId === 2 && data.specialInterval.regimen === 'D') {
                existDrug.moeMedMultDoses = [];
                let content = {
                    dosage: data.txtDosage,
                    freqCode: data.ddlFreq,
                    freq1: data.freq1,
                    supFreqCode: data.specialInterval.supFreqCode,
                    //Added by Renny 20191219 DHCIMSB-1934 start
                    //freqText: data.freqText,
                    freqText: getFreqSelectValue(codeList.freq_code, data.ddlFreq, data.freq1),
                    //Added by Renny 20191210 DHCIMSB-1934 end
                    supFreqText: data.specialInterval.supFreqText[0],
                    moQty: data.txtDangerDrugQty,
                    moeEhrMedMultDose: {
                        freqId: getFreqSelectIdByText(codeList.freq_code, data.ddlFreq)
                    }
                };
                existDrug.moeMedMultDoses.push(content);
                content = null;
                content = {
                    dosage: data.specialInterval.txtDosage,
                    freqCode: data.specialInterval.ddlFreq,
                    freq1: data.specialInterval.freq1,
                    supFreqCode: data.specialInterval.supFreqCode,
                    //Added by Renny 20191219 DHCIMSB-1934 start
                    //freqText: data.specialInterval.supFreqCode,
                    freqText: getFreqSelectValue(codeList.freq_code, data.specialInterval.ddlFreq, data.specialInterval.freq1),
                    //Added by Renny 20191210 DHCIMSB-1934 end
                    supFreqText: data.specialInterval.supFreqText[1],
                    moQty: data.specialInterval.txtDangerDrugQty,
                    moeEhrMedMultDose: {
                        freqId: getFreqSelectIdByText(codeList.freq_code, data.specialInterval.ddlFreq)
                    }
                };
                existDrug.moeMedMultDoses.push(content);
            } else {
                existDrug.moeMedMultDoses = [];
            }
        }

        if (orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE || orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
            if (!existDrug.moeMedMultDoses) existDrug.moeMedMultDoses = [];

            // let lineData = [];
            // if (orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE)
            //     lineData = data.multipleLine;
            // if (orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN)
            //     lineData = data.stepUpDown
            let lineData = data.moeMedMultDoses;

            //intersection list
            let interList = lineData.filter(function (ele) {
                return existDrug.moeMedMultDoses.indexOf(ele.multDoseNo) !== -1;
            });
            let diffList = lineData.filter(function (ele) {
                return existDrug.moeMedMultDoses.indexOf(ele.multDoseNo) === -1;
            });

            if (interList && interList.length > 0) {
                existDrug.moeMedMultDoses.map((item, i) => {
                    let curDrug = interList.find(ele => ele.multDoseNo === item.multDoseNo);
                    if (curDrug) {
                        item.stepNo = curDrug.stepNo;
                        item.multDoseNo = curDrug.multDoseNo;
                        item.dosage = i === 0 ? data.txtDosage : curDrug.txtDosage;
                        item.freqCode = i === 0 ? data.ddlFreq : curDrug.ddlFreq;
                        item.freq1 = i === 0 ? data.freq1 : curDrug.freq1;
                        item.moQty = i === 0 ? data.txtDangerDrugQty : curDrug.txtDangerDrugQty;
                        if (orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
                            let temp_duration = i === 0 ? data.txtDuration : curDrug.txtDuration;
                            let temp_durationUnit = i === 0 ? data.ddlDurationUnit : curDrug.ddlDurationUnit;
                            if (temp_duration && temp_durationUnit) {
                                item.duration = temp_duration;
                                item.durationUnit = temp_durationUnit;
                            }
                            item.prn = i === 0 ? data.chkPRN : curDrug.chkPRN;
                        } else {
                            item.duration = '';
                            // item.durationUnit = 'd';
                            item.durationUnit = moeUtilities.getHospSetting().defaultDurationUnit;
                            item.prn = '';
                        }
                        //Added by Renny 20191219 DHCIMSB-1934 start
                        item.freqText = getFreqSelectValue(codeList.freq_code, i === 0 ? data.ddlFreq : curDrug.ddlFreq, i === 0 ? data.freq1 : curDrug.freq1);
                        //Added by Renny 20191210 DHCIMSB-1934 end
                        let moeEhrMedMultDose = {};
                        moeEhrMedMultDose.freqId = getFreqSelectIdByText(codeList.freq_code, i === 0 ? data.ddlFreq : curDrug.ddlFreq);
                        item.moeEhrMedMultDose = moeEhrMedMultDose;
                    }
                    return item;
                });
            } else {
                existDrug.moeMedMultDoses = [];
            }
            if (diffList) {
                let tempList = diffList.map((item, i) => {
                    let newItem = {};
                    newItem.stepNo = item.stepNo;
                    newItem.multDoseNo = item.multDoseNo;
                    newItem.dosage = i === 0 ? data.txtDosage : item.txtDosage;
                    newItem.freqCode = i === 0 ? data.ddlFreq : item.ddlFreq;
                    newItem.freq1 = i === 0 ? data.freq1 : item.freq1;
                    newItem.moQty = i === 0 ? data.txtDangerDrugQty : item.txtDangerDrugQty;
                    if (orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
                        let temp_duration = i === 0 ? data.txtDuration : item.txtDuration;
                        let temp_durationUnit = i === 0 ? data.ddlDurationUnit : item.ddlDurationUnit;
                        if (temp_duration && temp_durationUnit) {
                            newItem.duration = temp_duration;
                            newItem.durationUnit = temp_durationUnit;
                        }
                        newItem.prn = i === 0 ? data.chkPRN : item.chkPRN;
                    } else {
                        item.duration = '';
                        // item.durationUnit = 'd';
                        item.durationUnit = moeUtilities.getHospSetting().defaultDurationUnit;
                        item.prn = '';
                    }
                    //Added by Renny 20191219 DHCIMSB-1934 start
                    newItem.freqText = getFreqSelectValue(codeList.freq_code, i === 0 ? data.ddlFreq : item.ddlFreq, i === 0 ? data.freq1 : item.freq1);
                    //Added by Renny 20191210 DHCIMSB-1934 end
                    let moeEhrMedMultDose = {};
                    moeEhrMedMultDose.freqId = getFreqSelectIdByText(codeList.freq_code, i === 0 ? data.ddlFreq : item.ddlFreq);
                    newItem.moeEhrMedMultDose = moeEhrMedMultDose;
                    return newItem;
                });
                existDrug.moeMedMultDoses = existDrug.moeMedMultDoses.concat(tempList);
            }
            // sortList(existDrug.moeMedMultDoses, 'stepNo');
        }

        if (isUpdate) {
            if (isExist) {
                result.moeOrder.moeMedProfiles = result.moeOrder.moeMedProfiles.map(element => {
                    if (element.cmsItemNo === data.cmsItemNo)
                        element = existDrug;
                    return element;
                });
            } else {
                result.moeOrder.moeMedProfiles.push(existDrug);
            }
        } else {
            moeMedProfilesList.push(existDrug);
        }
    }

    if (!isUpdate) {
        sortList(moeMedProfilesList, 'orgItemNo');
        result.moeOrder.moeMedProfiles = moeMedProfilesList;
    } else {
        sortList(result.moeOrder.moeMedProfiles, 'orgItemNo');
    }
    return result;
}

export function transferJsonToArr(data) {
    let result = [];
    for (let index = 0; index < data.length; index++) {
        const item = data[index];
        result.push(item);
    }
    return result;
}

function getFavouriteList(data, defaultOpen) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        item.open = false;//20191206 Set my favourite drug set default close by Louis Chen
        if (defaultOpen) {
            item.open = true;
        }
        item.moeMedProfiles = getDrugDataForUI(item, 'F');
        item.moeMedProfiles.map(ele => {
            ele.frontMyFavouriteId = item.frontMyFavouriteId;
            ele.myFavouriteId = item.myFavouriteId;
            return ele;
        });
        result.push(item);
    }
    return result;
}

//my favourite start
export function getMyFavouriteList(data) {
    let hospSetting = moeUtilities.getHospSetting();
    return getFavouriteList(data, hospSetting.expandMyFav);
}

export function getDeptFavouriteList(data) {
    let hospSetting = moeUtilities.getHospSetting();
    return getFavouriteList(data, hospSetting.expandDptFav);
}



function getParamsObjForMyFavourite(object, codeList) {
    let result = {};
    let orderLineType = object.orderLineType;
    // let orderLineType = ORDER_LINE_TYPE.NORMAL;
    // if (object.isShowAdvanced) {
    //     if (object.multipleLine && object.multipleLine.length > 0) orderLineType = ORDER_LINE_TYPE.MULTIPLE_LINE;
    //     else if (object.stepUpDown && object.stepUpDown.length > 0) orderLineType = ORDER_LINE_TYPE.STEP_UP_AND_DOWN;
    //     else if (object.specialInterval && object.specialInterval !== null) orderLineType = ORDER_LINE_TYPE.SPECIAL_INTERVAL;
    //     else orderLineType = ORDER_LINE_TYPE.ADVANCED;
    // }
    result.actionStatus = object.ddlActionStatus || '';
    result.baseunit = object.baseUnit || '';
    result.cmsItemNo = object.cmsItemNo;
    result.orgItemNo = object.orgItemNo || '';
    result.durationUnit = object.ddlDurationUnit || '';
    result.formDesc = object.txtForm || '';
    result.freqCode = object.ddlFreq || '';
    //Added by Renny 20191219 DHCIMSB-1934 start
    //result.freqText = object.txtStrength || '';
    result.freqText = getFreqSelectValue(codeList.freq_code, object.ddlFreq, object.freq1);
    if (object.apiData) {
        result.trueDisplayname = object.apiData.trueDisplayname || '';
    }
    result.itemcode = object.localDrugId || '';
    //Added by Renny 20191210 DHCIMSB-1934 end
    // result.drugId = object.localDrugId || '';
    result.moQty = object.dangerDrug === 'Y' ? object.txtDangerDrugQty : (object.ddlQtyUnit && object.txtQty ? object.txtQty : '');
    result.moQtyUnit = getSelectValue(codeList.base_unit, object.ddlQtyUnit) || '';
    // result.moQty = object.txtQty || '';
    // result.moQtyUnit = getSelectValue(codeList.base_unit, object.ddlQtyUnit);
    // result.moQtyUnitId = object.ddlQtyUnit || '';
    result.modu = object.txtDosageModu || '';
    result.dosage = object.txtDosage || '';
    result.duration = object.txtDuration || '';
    result.freq1 = object.freq1 || 0;
    result.prn = object.chkPRN || '';
    result.remarkText = object.remarkText;
    result.nameType = object.freeText;
    result.dangerdrug = object.dangerDrug;
    result.routeDesc = getSelectValue(codeList.route, object.ddlRoute);
    //moeEhrMedProfile start
    let moeEhrMedProfile = {};
    moeEhrMedProfile.aliasName = object.aliasName; // Added by Mankit
    moeEhrMedProfile.drugId = object.drugId;
    moeEhrMedProfile.tradeName = object.drugName;
    moeEhrMedProfile.screenDisplay = object.displayString || '';
    moeEhrMedProfile.siteId = parseIntByVal(object.ddlSite) || 0;
    moeEhrMedProfile.strengthCompulsory = object.strengthCompulsory || '';
    moeEhrMedProfile.orderLineType = orderLineType;
    moeEhrMedProfile.vtm = object.vtm;
    moeEhrMedProfile.vtmId = object.vtmId;
    moeEhrMedProfile.tradeNameVtmId = object.tradeNameVtmId;
    moeEhrMedProfile.routeId = object.routeId;
    moeEhrMedProfile.doseFormExtraInfo = object.doseFormExtraInfo;
    moeEhrMedProfile.doseFormExtraInfoId = object.doseFormExtraInfoId;
    moeEhrMedProfile.strengthLevelExtraInfo = object.strengthLevelExtraInfo;
    moeEhrMedProfile.genericIndicator = object.genericIndicator;
    moeEhrMedProfile.moQtyUnitId = object.ddlQtyUnit;
    //Added by Renny 20191210 DHCIMSB-1799 start
    moeEhrMedProfile.manufacturer = object.manufacturer || '';
    moeEhrMedProfile.moduId = object.ddlModuId || '';
    moeEhrMedProfile.formId = object.formId || '';
    moeEhrMedProfile.freqId = object.freqId || '';
    //Added by Renny 20191210 DHCIMSB-1799 end

    if (object.apiData && object.apiData.moeEhrMedProfile) {
        moeEhrMedProfile.drugRouteEng = object.apiData.moeEhrMedProfile.drugRouteEng;
        moeEhrMedProfile.drugRouteId = object.apiData.moeEhrMedProfile.drugRouteId;
    }

    result.moeEhrMedProfile = moeEhrMedProfile;
    //moeEhrMedProfile end

    result.startDate = object.txtStartFrom || '';
    result.specInstruct = object.txtSpecInst || '';
    result.routeCode = object.ddlRoute || '';
    result.siteCode = parseIntByVal(object.ddlSite) || 0;
    result.siteDesc = getSiteSelectValue(codeList.site, object.ddlSite);
    //result.strength = getPrepSelectValue(object.ddlPrepCodeList, object.ddlPrep) || '';
    result.strength = getStrengthForBackend(object.ddlPrepCodeList, object.ddlPrep, object.strengthCompulsory) || '';
    result.tradename = object.drugName || '';
    result.itemStatus = object.itemStatus;
    result.version = object.version ? object.version : 0;

    // if (object.dangerDrug && object.dangerDrug === 'Y' && object.orderLineType !== ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
    //     result.moeMedMultDoses = [];
    //     let content = {
    //         multDoseNo: 1,
    //         moQty: object.txtDangerDrugQty
    //     };
    //     result.moeMedMultDoses.push(content);
    // }

    if (orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
        result.regimen = object.specialInterval.regimen;
        result.supFreq1 = object.specialInterval.supFreq1;
        result.supFreq2 = object.specialInterval.supFreq2;
        result.supFreqCode = object.specialInterval.supFreqCode;
        result.dayOfWeek = object.specialInterval.dayOfWeek;
        result.supFreqText = object.specialInterval && object.specialInterval.supFreqText && object.specialInterval.supFreqText.length !== 0 ? object.specialInterval.supFreqText[0] : null;
        result.moeEhrMedProfile.supplFreqId = object.specialInterval.supplFreqId;
        result.moeEhrMedProfile.cycleMultiplier = object.specialInterval.regimen === 'C' ? object.specialInterval.cycleMultiplier : null;
        if (object.dangerDrug === 'Y') {
            result.moQty = object.txtDangerDrugQty;
        }
        if (object.specialInterval.supplFreqId === 2 && object.specialInterval.regimen === 'D') {
            result.moeMedMultDoses = [];
            let content = {
                dosage: object.txtDosage,
                freqCode: object.ddlFreq,
                freq1: object.freq1,
                supFreqCode: object.specialInterval.supFreqCode,
                //Added by Renny 20191219 DHCIMSB-1934 start
                //freqText: object.freqText,
                freqText: getFreqSelectValue(codeList.freq_code, object.ddlFreq, object.freq1),
                //Added by Renny 20191210 DHCIMSB-1934 end
                supFreqText: object.specialInterval.supFreqText[0],
                moQty: object.txtDangerDrugQty,
                moeEhrMedMultDose: {
                    freqId: getFreqSelectIdByText(codeList.freq_code, object.ddlFreq)
                }
            };
            result.moeMedMultDoses.push(content);
            content = null;
            content = {
                dosage: object.specialInterval.txtDosage,
                freqCode: object.specialInterval.ddlFreq,
                freq1: object.specialInterval.freq1,
                supFreqCode: object.specialInterval.supFreqCode,
                //Added by Renny 20191219 DHCIMSB-1934 start
                //freqText: object.specialInterval.supFreqCode,
                freqText: getFreqSelectValue(codeList.freq_code, object.specialInterval.ddlFreq, object.specialInterval.freq1),
                //Added by Renny 20191210 DHCIMSB-1934 end
                supFreqText: object.specialInterval.supFreqText[1],
                moQty: object.specialInterval.txtDangerDrugQty,
                moeEhrMedMultDose: {
                    freqId: getFreqSelectIdByText(codeList.freq_code, object.specialInterval.ddlFreq)
                }
            };
            result.moeMedMultDoses.push(content);
        }
    }

    if (orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE || orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
        if (!result.moeMedMultDoses) result.moeMedMultDoses = [];

        // let lineData = [];
        // if (orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE)
        //     lineData = object.multipleLine;
        // if (orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN)
        //     lineData = object.stepUpDown;
        let lineData = object.moeMedMultDoses;

        if (lineData.length) {
            let tempList = lineData.map((item, i) => {
                let newItem = {};
                // newItem.stepNo = item.stepNo;
                newItem.multDoseNo = item.multDoseNo;
                newItem.dosage = i === 0 ? object.txtDosage : item.txtDosage;
                newItem.freqCode = i === 0 ? object.ddlFreq : item.ddlFreq;
                newItem.freq1 = i === 0 ? object.freq1 : item.freq1;
                newItem.moQty = i === 0 ? object.txtDangerDrugQty : item.txtDangerDrugQty;
                if (orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
                    let temp_duration = i === 0 ? object.txtDuration : item.txtDuration;
                    let temp_durationUnit = i === 0 ? object.ddlDurationUnit : item.ddlDurationUnit;
                    if (temp_duration && temp_durationUnit) {
                        newItem.duration = temp_duration;
                        newItem.durationUnit = temp_durationUnit;
                    }
                    newItem.prn = i === 0 ? object.chkPRN : item.chkPRN;
                } else {
                    item.duration = '';
                    // item.durationUnit = 'd';
                    item.durationUnit = moeUtilities.getHospSetting().defaultDurationUnit;
                    item.prn = '';
                }
                //Added by Renny 20191219 DHCIMSB-1934 start
                newItem.freqText = getFreqSelectValue(codeList.freq_code, i === 0 ? object.ddlFreq : item.ddlFreq, i === 0 ? object.freq1 : item.freq1);
                //Added by Renny 20191210 DHCIMSB-1934 end
                let moeEhrMedMultDose = {};
                moeEhrMedMultDose.freqId = getFreqSelectIdByText(codeList.freq_code, i === 0 ? object.ddlFreq : item.ddlFreq);
                newItem.moeEhrMedMultDose = moeEhrMedMultDose;
                return newItem;
            });
            result.moeMedMultDoses = result.moeMedMultDoses.concat(tempList);
        }
        // sortList(result.moeMedMultDoses, 'stepNo');
    }
    return result;
}
export function getParamsForMyFavourite(data, drugSet, codeList) {
    let result = {};
    result.department = false;

    result.moeMyFavouriteHdr = {
        moeMedProfiles: []
    };

    if (drugSet) {
        if (drugSet.myFavouriteId && drugSet.myFavouriteId !== -1) {
            result.moeMyFavouriteHdr = _.cloneDeep(drugSet);
            result.moeMyFavouriteHdr.moeMedProfiles = [];
            // result.moeMyFavouriteHdr.myFavouriteId = drugSet.myFavouriteId;
            // result.moeMyFavouriteHdr.version = drugSet.version;
        } else {
            result.moeMyFavouriteHdr.myFavouriteName = drugSet.myFavouriteName;
        }
    }

    let isArray = Array.isArray(data);
    if (isArray) {
        for (let i = 0; i < data.length; i++) {
            let obj = getParamsObjForMyFavourite(data[i], codeList);
            result.moeMyFavouriteHdr.moeMedProfiles.push(obj);
        }
    } else {
        result.moeMyFavouriteHdr.moeMedProfiles.push(getParamsObjForMyFavourite(data, codeList));
    }
    return result;
}
//my favourite end

export function getGroupForArray(arr, groupby) {
    let dest = [];
    for (let i = 0; i < arr.length; i++) {
        let ai = arr[i];
        let type = ai[groupby];
        if (!dest.find(item => item[groupby] === type)) {
            dest.push({
                [groupby]: type,
                data: [ai]
            });
        } else {
            dest = dest.filter(item => {
                if (item[groupby] === type) {
                    item.data.push(ai);
                }
                return item;
            });
        }
    }
    return dest;
}

export function getMaxId(allList, fileName) {
    let list = [];
    let maxcnt = 0;
    if (allList && allList.length) {
        for (let item in allList) {
            list.push(allList[item][fileName]);
        }
        list.sort(function (num1, num2) {
            return num1 - num2;
        });
        // eslint-disable-next-line
        maxcnt = eval(list[list.length - 1]);
    }
    return maxcnt;
}

export function getMaxCmsItemNoByDrugList(list) {
    if (list && list.length > 0) {
        let lastObj = list[list.length - 1];
        return lastObj.cmsItemNo;
    }
    return 0;
}

export function reassignCmsItemNoForList(targetList, sourceList) {
    let newCmsItemId = getMaxId(sourceList, 'cmsItemNo') + 1;
    targetList = targetList.filter(item => {
        if (!item) return null;
        if (!item.orderDetailId) {
            item.cmsItemNo = newCmsItemId;
            newCmsItemId++;
        }
        return item;
    });
    return targetList;
}

//Reorder the cmsItemNo of the order
export function getNewOrderDrugListOrObject(moeMedProfiles, drugList) {
    let orgItemNo = drugList ? drugList.length : 1;
    let newCmsItemId = getMaxId(drugList, 'cmsItemNo');
    if (Array.isArray(moeMedProfiles)) {
        let newDrugList = [];
        if (!newDrugList) newDrugList = [];
        for (let i = 0; i < moeMedProfiles.length; i++) {
            let ele = moeMedProfiles[i];
            ele.orgItemNo = orgItemNo + (i + 1);
            ele.cmsItemNo = newCmsItemId + (i + 1);
            ele.isFavouriteToPre = true;
            ele.itemStatus = MOE_DRUG_STATUS.NORMAL;
            newDrugList.push(ele);
        }
        return newDrugList;
    } else {
        let item = _.cloneDeep(moeMedProfiles);
        item.cmsItemNo = newCmsItemId + 1;
        item.orgItemNo = drugList ? drugList.length + 1 : 1;
        item.isFavouriteToPre = true;
        item.itemStatus = MOE_DRUG_STATUS.NORMAL;
        return item;
    }
}

export function showEditAllDurationMenu(rightClickItem) {
    if (rightClickItem && (rightClickItem.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN ||
        rightClickItem.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL ||
        rightClickItem.dangerdrug === 'Y'))
        return false;
    return true;
}

// export function getFreqInputText(specialIntervalData, specialIntervalText, weekDay) {
//     let supFreqInputText = [];
//     let flag = '__';
//     let includeFlag = false;

//     if (specialIntervalData.supFreqCode.indexOf(flag) >= 0) includeFlag = true;
//     if (includeFlag) {
//         let temp = specialIntervalData.supFreqCode;
//         if (specialIntervalData.supFreq1) temp = temp.replace(flag, ` ${specialIntervalData.supFreq1} `);
//         if (specialIntervalData.supFreq2) temp = temp.replace(flag, ` ${specialIntervalData.supFreq2} `);
//         supFreqInputText.push(temp);
//     } else if (specialIntervalData.regimen === 'D' && specialIntervalData.supplFreqId === 2) {
//         supFreqInputText = ['on odd days', 'on even days'];
//     } else if (specialIntervalData.regimen === 'W' && specialIntervalData.supplFreqId === 21) {
//         supFreqInputText = weekDay;
//     } else {
//         supFreqInputText.push(specialIntervalText);
//     }
//     return supFreqInputText;
// }

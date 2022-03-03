import React from 'react';
import {
    Tooltip
} from '@material-ui/core';
import infoIcon from '../images/moe/icon-info.gif';
import styles from '../views/moe/moeStyles';
import {
    DRUG_DISPLAY_NAME,
    SEARCH_MOE_DISPLAY_FIELD,
    NO_OF_ING_SHOW_ICON,
    DRUG_GENERIC_IND_YES,
    PANEL_DISPLAY_FIELD,
    ORDER_LINE_TYPE,
    DURATION_UNIT
} from '../enums/moe/moeEnums';
import _ from 'lodash';
import ReactDOMServer from 'react-dom/server';
import * as prescriptionUtilities from '../utilities/prescriptionUtilities';

export function getMoeSetting() {
    let reloginParamsString = window.sessionStorage.getItem('reloginParams');
    let reloginParams = reloginParamsString ? JSON.parse(reloginParamsString) : null;
    let actionCd = window.sessionStorage.getItem('moeActionCd');
    let result = {
        reloginParams: reloginParams,
        isEnquiry: actionCd === 'enquiry' || actionCd === 'lock',
        isCreate: actionCd === 'create',
        isEdit: actionCd === 'editWithRemark',
        isBackdate: actionCd === 'backdate',
        isLock: actionCd === 'lock'
    };
    return result;
}

export function getLoginInfo() {
    let loginInfoString = window.sessionStorage.getItem('moeLoginInfo');
    let loginInfo = loginInfoString ? JSON.parse(loginInfoString) : { user: null };
    let result = {
        ...loginInfo.user
    };
    return result;
}

export function getHospSetting() {
    let result = {
        enableMds: false,
        enableCcp: false,
        expandHistory: false,
        expandMyFav: false,
        expandDptFav: false,
        expandPreDosage: false,
        defaultDurationUnit: ''
    };
    let hospSettingString = window.sessionStorage.getItem('moeHospSetting');
    if (hospSettingString) {
        let hospSetting = JSON.parse(hospSettingString);
        result.enableMds = hospSetting.enable_mds && (hospSetting.enable_mds.paramValue === 'Y' ? true : false);
        result.enableCcp =/*false;*/ hospSetting.enable_ccp && (hospSetting.enable_ccp.paramValue === 'Y' ? true : false);
        result.expandHistory = hospSetting.expand_history && (hospSetting.expand_history.paramValue === 'Y' ? true : false);
        result.expandMyFav = hospSetting.expand_myfavourite && (hospSetting.expand_myfavourite.paramValue === 'Y' ? true : false);
        result.expandDptFav = hospSetting.expand_departmental_favourite && (hospSetting.expand_departmental_favourite.paramValue === 'Y' ? true : false);
        result.expandPreDosage = hospSetting.expand_predefined_dosage && (hospSetting.expand_predefined_dosage.paramValue === 'Y' ? true : false);
        result.defaultDurationUnit = hospSetting.default_duration_unit && _.toLower(hospSetting.default_duration_unit.paramValue);
    }
    return result;
}

export function getSysSettingByParamName(sysSettingList, paramName) {
    if (!sysSettingList || sysSettingList.length == 0) return;
    return sysSettingList.find(item => item.paramName == paramName);
}

export function getDACReasonCodelist() {
    const DACReason = [
        {
            id: 1,
            value: 'Patient is administering this drug without allergy reaction'
        },
        {
            id: 2,
            value: 'No other alternative avaliable'
        },
        {
            id: 3,
            value: 'Desensitizing the patient with this drug'
        },
        {
            id: 4,
            value: 'Doubts about the reported history of drug allergy'
        },
        {
            id: 5,
            value: 'Patient can tolerate the drug at lower dose'
        },
        {
            id: 6,
            value: 'Others (Please specify reason below)'
        }
    ];
    return DACReason;
}
export function getParentsByAttr(children, attrId, attrVal) {
    let tempDom = children;
    if (!(tempDom.getAttribute(attrId) && tempDom.getAttribute(attrId) === attrVal)) {
        let parentEle = tempDom.parentNode;
        while (!(parentEle.getAttribute(attrId) && parentEle.getAttribute(attrId) === attrVal)) {
            parentEle = parentEle.parentNode;
        }

        tempDom = parentEle;
    }
    return tempDom;
}

export function getAllParentsScrollTop(children) {
    let tempDom = children.parentNode;
    let tempScrollTop = 0;
    while (tempDom !== document.body) {
        tempDom = tempDom.parentNode;
        tempScrollTop = tempScrollTop + tempDom.scrollTop;
    }
    return tempScrollTop;
}

export function insertAfter(newElement, targentElement) {
    let parent = targentElement.parentNode;
    if (parent.lastChild === targentElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targentElement.nextSibling);
    }
}

export function offset(e) {
    let offest = {
        top: 0,
        left: 0
    };

    let _position;

    function getOffset(node, init) {
        if (node.nodeType !== 1) {
            return;
        }
        _position = window.getComputedStyle(node)['position'];

        if (typeof (init) === 'undefined' && _position === 'static') {
            getOffset(node.parentNode);
            return;
        }
        offest.top = node.offsetTop + offest.top - node.scrollTop;
        offest.left = node.offsetLeft + offest.left - node.scrollLeft;

        if (_position === 'fixed') {
            return;
        }

        getOffset(node.parentNode);
    }

    getOffset(e, true);

    return offest;
}

export function getOffsetHeight(dptid) {
    let ele = document.querySelector('[dptid="' + dptid + '"]');
    return document.body.clientHeight - offset(ele).top;
}

export function resizeHeight(dptid, minuend) {
    let height = getOffsetHeight(dptid) - minuend;
    let ele = document.querySelector('[dptid="' + dptid + '"]');
    ele.style.height = ele.style.minHeight = ele.style.maxHeight = height + 'px';
    return height;
}

export function isSiblilngNode(node1, node2) {
    return node1.parentNode === node2.parentNode;
}

export function getPatientAllergen() {
    const patientAllergies = [
        {
            additionalInfo: '',
            allergen: 'paracetamol',
            allergenTermID: '',
            allergenType: 'D',
            allergySeqNo: '2c918b43639696dc0163a513d13f00c8',
            certainty: 'Certain',
            displayName: 'paracetamol',
            manifestations: [
                {
                    listType: '',
                    manifestationDesc: 'Part of body puffy',
                    manifestationSeqNo: '00090',
                    status: ''
                }
            ],
            reactionLevel: 'string'
        }, {
            additionalInfo: '',
            allergen: 'haloperidol',
            allergenTermID: '',
            allergenType: 'D',
            allergySeqNo: '2c918b436cdc8abc016cf57ea18f0340',
            certainty: 'Certain',
            displayName: 'haloperidol',
            manifestations: [
                {
                    listType: '',
                    manifestationDesc: 'Part of body puffy',
                    manifestationSeqNo: '00090',
                    status: ''
                }
            ]
        }, {
            additionalInfo: '',
            allergen: 'diclofenac potassium',
            allergenTermID: '',
            allergenType: 'D',
            allergySeqNo: '2c918b436cdc8abc016cf57f47170343',
            certainty: 'Certain',
            displayName: 'diclofenac potassium',
            manifestations: [
                {
                    listType: '',
                    manifestationDesc: 'Photosensitivity',
                    manifestationSeqNo: '00006',
                    status: ''
                }
            ],
            reactionLevel: ''
        }, {
            additionalInfo: '',
            allergen: 'amoxicillin (as trihydrate)',
            allergenTermID: '',
            allergenType: 'D',
            allergySeqNo: '2c918b37554e0ef201557c071b150924',
            certainty: 'Certain',
            displayName: 'amoxicillin (as trihydrate)',
            manifestations: [
                {
                    listType: '',
                    manifestationDesc: 'Rash',
                    manifestationSeqNo: '00007',
                    status: ''
                }
            ]
        }
    ];
    return patientAllergies;
}

export function isMultipleIngredient(vtm) {
    if (vtm == null)
        return false;
    if (vtm.indexOf('+') == -1)
        return false;
    if (vtm.split('+').length - 1 < 2)
        return false;
    if (vtm.indexOf('(') < vtm.indexOf('+') && vtm.indexOf('+') < vtm.indexOf(')'))
        return false;
    return true;
}

//From GWT: Formatter.getPlusIndex()
function getPlusIndex(screenDisplay, count) {
    let found = 0;
    for (let i = 0; i < screenDisplay.length; i++) {
        if (screenDisplay.charAt(i) == '(' && found == count) {
            return i;
        }
        if (screenDisplay.charAt(i) == '(') {
            found++;
        }
    }
    return 0;
}

//From GWT: Formatter.getStartSearchIndex()
function getStartSearchIndex(screenDisplay) {
    let openIndex = screenDisplay.indexOf('(');
    let plusIndex = screenDisplay.indexOf('+');
    let count = 0;
    while (plusIndex < openIndex) {
        plusIndex = getPlusIndex(screenDisplay, count);
        count++;
    }
    let closeFound = 0;
    let stringBeforePlus = screenDisplay.substring(0, plusIndex);
    for (let i = stringBeforePlus.length - 1; i >= 0; i--) {
        if (stringBeforePlus.charAt(i) == ')') {
            closeFound++;
        } else if (stringBeforePlus.charAt(i) == '(') {
            if (closeFound != 0) {
                closeFound--;
            } else if (stringBeforePlus.substring(i, stringBeforePlus.length).length > 3 && stringBeforePlus.substring(i, i + 3) != '(as') {
                return i;
            }
        }
    }
    return openIndex;
}

//From GWT: Formatter.findVTM()
function findVtm(screenDisplay) {
    let openCount = 0;
    for (let i = screenDisplay.lastIndexOf('+'); i < screenDisplay.length; i++) {
        let c = screenDisplay.charAt(i);
        if (c == '(') {
            openCount++;
        } else if (c == ')' && openCount == 0) {
            return screenDisplay.substring(getStartSearchIndex(screenDisplay) + 1, i);
        } else if (c == ')') {
            openCount--;
        }
    }
    return '';
}

export function displayStringCom(item, displayField) {
    let vtmDisplay = (findVtm(item.displayString) || item.vtm);
    return <React.Fragment>
        {displayField === SEARCH_MOE_DISPLAY_FIELD ? item.tradeName + ' ' : ''}
        <Tooltip title={vtmDisplay} classes={{ tooltipPlacementBottom: styles.tooltipPlacementBottom }}>
            <img width={16} height={16} src={infoIcon} />
        </Tooltip>
    </React.Fragment>;
}

export function getDisplayString(item, displayField) {
    // const con = <React.Fragment>
    //     {item.tradeName}&nbsp;
    //     <Tooltip title={item.vtm} classes={{ tooltipPlacementBottom: styles.tooltipPlacementBottom }}>
    //         <img width={16} height={16} src={infoIcon} />
    //     </Tooltip>
    // </React.Fragment>;
    if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_VTM === item.displayNameType
        || DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_BAN === item.displayNameType
        || DRUG_DISPLAY_NAME.ALIAS_NAME_TYPE_LOCAL_DRUG === item.displayNameType
    ) {
        if (isMultipleIngredient(item.vtm) && (item.tradeName || item.drugName)) {
            return displayStringCom(item, displayField);
        }
        else {
            return item[displayField];
        }
    } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_TRADENAME === item.displayNameType ||
        DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_ABB === item.displayNameType ||
        DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_OTHER === item.displayNameType
    ) {
        return displayStringCom(item, displayField);
    } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_ALLERGENGROUP === item.displayNameType) {
        return item[displayField];
    } else {
        return item[displayField];
    }

    // if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_VTM === item.displayNameType) {
    //     if (isMultipleIngredient(item.vtm) && item.tradeName)
    //         return con;
    //     else
    //         return displayString;
    // } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_TRADENAME === item.displayNameType) {
    //     return con;
    // } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_BAN === item.displayNameType) {
    //     if (isMultipleIngredient(item.vtm) && item.tradeName)
    //         return con;
    //     else return displayString;
    // } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_ABB === item.displayNameType) {
    //     return con;
    // } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_OTHER === item.displayNameType) {
    //     return con;
    // } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_ALLERGENGROUP === item.displayNameType) {
    //     return displayString;
    // }

    // return displayString;
}

function getOverrideReasonHtml(i, item, key) {
    return (<div key={key + i} style={{ fontSize: '13px', width: '100%' }}>{i + 1 + '. ' + item.overrideReason}</div>);
}

export function getDACReason(allergens) {
    if (allergens && allergens.length > 0) {
        let dacReason = allergens.filter((item) => {
            return (item.matchType === 'A');
        });
        let hlabReason = allergens.filter((item) => {
            return (item.matchType === 'H');
        });
        return (
            <div>
                {
                    dacReason && dacReason.length > 0 &&
                    <div>
                        <div style={{ width: '100%', fontSize: '13px' }}>
                            Allergy prompt is overridden, for the following reason(s):
                        </div>
                        {
                            dacReason.map((item, i) => {
                                return getOverrideReasonHtml(i, item, 'dacReason');
                            })
                        }
                    </div>
                }
                {
                    dacReason && dacReason.length > 0 && hlabReason && hlabReason.length > 0 &&
                    <br />
                }
                {
                    hlabReason && hlabReason.length > 0 &&
                    <div>
                        {
                            hlabReason.find((item) => {
                                return (item.screenMsg && item.screenMsg.indexOf('This patient is <b>positive</b> for HLA-B*1502.') > -1);
                            })
                                ?
                                <div style={{ width: '100%', fontSize: '13px' }}>
                                    Contra-indication due to HLA-B*1502 positive has been overridden, for the followings reason(s):
                            </div>
                                :
                                <div style={{ width: '100%', fontSize: '13px' }}>
                                    HLA-B*1502 lab test reminder has been acknowledged with the followings reason(s):
                            </div>
                        }
                        {
                            hlabReason.map((item, i) => {
                                return getOverrideReasonHtml(i, item, 'hlabReason');
                            })
                        }
                    </div>
                }
            </div>
        );
    } else {
        return '';
    }
}

//From GWT: Formatter.showRoute()
//function showRoute(form, route) {
//TODO showRoute()
//let value = codelist.filter(item => {return item.key == form + ' ' + route ? item.value : null} );
//let value = 'n';//20191211 need back end data to compare by Louis Chen
//return value == null || value.toLowerCase() == 'y';
//}

//From GWT: Formatter.wordToDiv()
// function wordToDiv(input, addMDash) {
//     let str = input;
//     let resultStr = '';

//     // remove all div tag if any
//     //str = str.replaceAll("<div class='view-item-div'>", "");
//     str = str.replace(new RegExp('<div class="view-item-div">', 'g'), '');
//     // str = str.replaceAll("</div>", "");
//     str = str.replace(new RegExp('</div>', 'g'), '');
//     //str = str.replaceAll("&nbsp;", " ");
//     str = str.replace(new RegExp('&nbsp;', 'g'), ' ');

//     let words = str.split('\\s+');
//     let addBold = false;
//     if (words.length > 0) {
//         for (let i = 0; i < words.length; i++) {
//             resultStr += '<div class="view-item-div">';
//             if (words[i].startsWith('<b>')) {
//                 addBold = true;
//             } else if (addBold) {
//                 resultStr += '<b>';
//             }
//             resultStr += words[i];
//             if (i == words.length - 1) {
//                 if (addMDash) {
//                     resultStr += '&nbsp;&mdash;&nbsp;';
//                 }
//             } else {
//                 resultStr += '&nbsp;';
//             }
//             if (addBold) {
//                 if (words[i].indexOf('</b>') >= 0) {
//                     addBold = false;
//                 } else {
//                     resultStr += '</b>';
//                 }
//             }
//             resultStr += '</div>';
//         }
//     } else {
//         resultStr += str;
//     }
//     return resultStr.toString();
// }

//From GWT: Formatter.replaceLast()
// function replaceLast(str, toReplace, replacement) {
//     let pos = str.lastIndexOf(toReplace);
//     if (pos > -1) {
//         return str.substring(0, pos)
//             + replacement
//             + str.substring(pos + toReplace.length, str.length);
//     } else {
//         return str;
//     }
// }

//For Get Object Length
//function getLength(obj) {
//    let i = 0;
//    for (const index in this) {
//        i++;
//    }
//    return i;
//}

//From GWT: Formatter.countOccurrences()
function countOccurrences(haystack, needle) {
    let count = 0;
    for (let i = 0; i < haystack.length; i++) {
        if (haystack.charAt(i) == needle.charAt(0)) {
            count++;
        }
    }
    return count;
}

//From GWT: Formatter.findGenericDrugTradeName()
function findGenericDrugTradeName(tradeName) {
    let openCount = 0;
    let start = 0;
    let close = 0;
    if (tradeName == null || tradeName.indexOf('(') < 0) return;
    for (let i = 0; i < tradeName.length; i++) {
        let c = tradeName.charAt(i);
        if (c == '('
            && tradeName.substring(i, tradeName.length).length > 3
            && tradeName.substring(i, i + 3) == '(as') {
            openCount++;
        }
        if (openCount == 0 && c == '(') {
            start = i;
        }
        if (openCount == 0 && c == ')') {
            close = i;
        }
        else if (c == ')') {
            openCount--;
        }
        if (start != 0 && close != 0 && openCount == 0) {
            break;
        }
    }
    return tradeName.substring(start, close + 1);
}

//From GWT: Formatter.getVtmString()
//function getVtmString(vtm, ingredients, strengthList, isStrengthCompulsoryInput, screenDisplay) {

//    let isStrengthCompulsory = isStrengthCompulsoryInput == null ? true : isStrengthCompulsoryInput;

//    if (vtm == null || isMultipleIngredient(vtm) || !isStrengthCompulsory) {
//        return vtm;
//    }
//    if (isMultipleIngredient(vtm) && strengthList.length > 1) {
//        return screenDisplay;
//    }
//    if (ingredients || strengthList) {
//        return vtm;
//    }

//     let result = '';
//     for (let i = 0; i < ingredients.length; i++) {
//         result += '<div class="view-item-div drugDiv">';
//         result += i == 0 ? '(' : '';
//         result += ingredients[i];
//         if (i < strengthList.length) {
//             result += '&nbsp;<b>' + strengthList[i].strength + '</b>';
//         }
//         if (i < ingredients.length - 1) {
//             result += ' + ';
//         }
//         else if (i == ingredients.length - 1) {
//             result += ')';
//         }
//         result += '</div>';
//     }

//     return result.toString;
// }

//From GWT: Formatter.getVtmHtml()
// function getVtmHtml(vtm) {
//     let result = [];
//     let items = vtm && vtm.split('+');

//     if (items && items.length > 1) {
//         for (let i = 0; i < items.length; i++) {
//             result.push(<span>{i==0? '(':''}{items[i]}{(items.length > 1 && i != items.length - 1) ? ' + ' : ')'}</span>);
//             // result += <div class='view-item-div drugDiv'>;
//             // result += {i==0? '(':''};
//             // result += {items[i]};
//             // result += {(items.length > 1 && i != items.length - 1) ? ' + ' : ')'};
//             // result += </div>;
//         }
//     } else {
//         // result += <div class='view-item-div drugDiv'>;
//     result.push(<span>{vtm}</span>);
//         // result += </div>;
//     }
//     return result;
// }

//From GWT: Formatter.toAmpScreenDisplay()
// function toAmpScreenDisplay(screenDisplay, isSearchMyFavourite) {
//     if (isSearchMyFavourite) {
//         return wordToDiv(screenDisplay, false);
//     }
//     if (countOccurrences(screenDisplay, '(') != countOccurrences(screenDisplay, ')')) {
//         return screenDisplay;
//     }
//     let vtm = findVtm(screenDisplay);
//     if (screenDisplay == null || screenDisplay == '') {
//         return screenDisplay + '&nbsp;&mdash;&nbsp;';
//     }
//     let tempString = screenDisplay.replace(vtm, '<%STRING-SCREENDISPLAY%>');

//     let iconTag = vtm;
//     if (countOccurrences(vtm, '+') > 2) {
//         //TODO icon-info.gif
//         iconTag = <img width={16} height={16} src={infoIcon} />;
//         tempString = wordToDiv(tempString, false);
//         tempString = '<b>' + replaceLast(tempString, '&mdash;', '');
//         return tempString.replace('<%STRING-SCREENDISPLAY%>', '</b>' + iconTag);
//     } else {
//         tempString = '<b>' + replaceLast(tempString, '&mdash;', '');
//         tempString = tempString.replace('<%STRING-SCREENDISPLAY%>', '</b>' + iconTag);
//         return wordToDiv(tempString, false);
//     }
// }

//From GWT: Formatter.toAmpScreenDisplayNoFormat()
// function toAmpScreenDisplayNoFormat(screenDisplay, isSearchMyFavourite, isShowAmpIcon) {
//     if (isSearchMyFavourite) {
//         return screenDisplay;
//     }
//     if (countOccurrences(screenDisplay, '(') != countOccurrences(screenDisplay, ')')) {
//         return screenDisplay;
//     }
//     let vtm = findVtm(screenDisplay);
//     if (vtm == null || vtm == '') {
//         return screenDisplay;
//     }

//     let iconTag;
//     if (countOccurrences(vtm, '+') > 2 && isShowAmpIcon) {
//         //TODO icon-info.gif

//         iconTag = <React.Fragment key={screenDisplay}><b >{screenDisplay.substring(0,screenDisplay.indexOf(vtm))}</b>
//         <Tooltip title={vtm.substring(1, vtm.length - 1)} classes={{ tooltipPlacementBottom: styles.tooltipPlacementBottom }}>
//             <img width={16} height={16} src={infoIcon}/>
//         </Tooltip>
//         {screenDisplay.substring(screenDisplay.indexOf(vtm) + vtm.length,screenDisplay.length)}
//         </React.Fragment>;
//     }

//     return iconTag;
//}

export function getDrugName(moeMedProfile, isDisplayRoute) {

    let panelVTM = moeMedProfile.vtm ? (isMultipleIngredient(moeMedProfile.vtm) && countOccurrences(moeMedProfile.vtm, '+') >= NO_OF_ING_SHOW_ICON ? displayStringCom(moeMedProfile, PANEL_DISPLAY_FIELD) : '(' + (findVtm(moeMedProfile.displayString) || moeMedProfile.vtm) + ') ') : '';
    let manufacturer = moeMedProfile.genericIndicator == DRUG_GENERIC_IND_YES ? <i>{findGenericDrugTradeName((moeMedProfile.tradeName || moeMedProfile.drugName))} </i> : '';
    let tradeName = moeMedProfile.genericIndicator == DRUG_GENERIC_IND_YES ? <span>{moeMedProfile.vtm} </span> : <b>{(moeMedProfile.tradeName || moeMedProfile.drugName)} </b>;
    let aliasName = moeMedProfile.aliasNames && moeMedProfile.aliasNames[0] ? moeMedProfile.aliasNames[0].aliasName : moeMedProfile.aliasName;
    let tradeNameAlias = (moeMedProfile.tradeNameAlias || moeMedProfile.aliasName);
    let formEng = <span>{(moeMedProfile.formEng || moeMedProfile.txtForm)} </span>;
    let routeEng = isDisplayRoute ? <span>{moeMedProfile.routeEng} </span> : '';
    // let strength = <span>{((moeMedProfile.ddlPrep || moeMedProfile.strength) || (moeMedProfile.strengthCompulsory === 'Y' ? (moeMedProfile.strengths && moeMedProfile.strengths[0] ? moeMedProfile.strengths[0].strength : '') : ''))} </span>;
    let strength = <span>{
        (moeMedProfile.strengthCompulsory === 'Y' ?
            (moeMedProfile.ddlPrep || moeMedProfile.strength)
            || (moeMedProfile.strengths && moeMedProfile.strengths[0] ? moeMedProfile.strengths[0].strength : '')
            : (moeMedProfile.ddlPrep || ''))} </span>;
    let doseFormExtraInfo = moeMedProfile.doseFormExtraInfo ? '(' + moeMedProfile.doseFormExtraInfo + ') ' : '';
    let strengthLevelExtraInfo = moeMedProfile.strengthLevelExtraInfo ? '(' + moeMedProfile.strengthLevelExtraInfo + ') ' : '';

    //getVtmString(moeMedProfile.vtm, moeMedProfile.ingredientList, moeMedProfile.strengths, moeMedProfile.strengthCompulsory, moeMedProfile.displayString); //console.log(vtmDisplay);
    //console.log(vtmDisplay);

    //"displayNameType": "V"
    if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_VTM === moeMedProfile.displayNameType) {
        return <span>{tradeName}{moeMedProfile.genericIndicator !== DRUG_GENERIC_IND_YES ? panelVTM : ''}{manufacturer}{strength}{routeEng}{formEng}{doseFormExtraInfo}{strengthLevelExtraInfo}</span>;

        //"displayNameType": "A & B"
    } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_ABB === moeMedProfile.displayNameType || DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_BAN === moeMedProfile.displayNameType) {
        return <span>{tradeName}{manufacturer}{' (' + aliasName + ') '}{strength}{routeEng}{formEng}{doseFormExtraInfo}{strengthLevelExtraInfo}</span>;

        //"displayNameType": "N"
    } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_TRADE_NAME_ALIAS === moeMedProfile.displayNameType) {
        return <span><b>{'[' + tradeNameAlias + '] '}</b>{tradeName}{moeMedProfile.genericIndicator === DRUG_GENERIC_IND_YES ? manufacturer : panelVTM}{strength}{routeEng}{formEng}{doseFormExtraInfo}{strengthLevelExtraInfo}</span>;

        //"displayNameType": "O"
    } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_OTHER === moeMedProfile.displayNameType) {
        return <span>{tradeName}{manufacturer}{'(' + aliasName + ') '}{strength}{routeEng}{formEng}{doseFormExtraInfo}{strengthLevelExtraInfo}</span>;

        //"displayNameType": "F"
    } else if (DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_FREE_TEXT === moeMedProfile.displayNameType) {
        return moeMedProfile.displayString;
    }

    //"displayNameType": "L" {tradeName} {panelVTM} {strength} {formEng}
    return <span>{moeMedProfile.displayString}</span>;
    //"displayNameType": "L"
    // return <span>{tradeName} {panelVTM} {strength} {formEng}</span>;

}

export function getDrugNameHtml(moeMedProfile, codeList) {
    let formRoute = (moeMedProfile.formEng || moeMedProfile.txtForm) + ' ' + moeMedProfile.routeEng;
    let displayRoute = prescriptionUtilities.isDisplayRoute(codeList.form_route_map, formRoute);
    let panelDrugName = getDrugName(moeMedProfile, displayRoute);
    return ReactDOMServer.renderToString(panelDrugName);
}

export function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offSet = 0; offSet < byteCharacters.length; offSet += sliceSize) {
        let slice = byteCharacters.slice(offSet, offSet + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

export function getSystemSetting(data) {
    let result = {};
    for (let i = 0; i < data.length; i++) {
        let paramName = data[i].paramName;
        //let paramValue = data[i].paramValue;
        result[paramName] = data[i];
    }
    return result;
}

export function checkAllDuration(drugItem, allDurationDto) {
    if (drugItem.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
        || drugItem.dangerDrug === 'Y'
    )
        return false;
    if (drugItem.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
        return (allDurationDto.ddlDurationUnit === DURATION_UNIT.DAY || allDurationDto.ddlDurationUnit === DURATION_UNIT.WEEK) &&
            (drugItem.ddlDurationUnit === DURATION_UNIT.DAY || drugItem.ddlDurationUnit === DURATION_UNIT.WEEK);
    }
    return true;
}

export function editAllDuration(drugItem, allDurationDto) {
    if (drugItem.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
        || drugItem.dangerDrug === 'Y'
    )
        return drugItem;
    if (drugItem.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
        if ((allDurationDto.ddlDurationUnit === DURATION_UNIT.DAY || allDurationDto.ddlDurationUnit === DURATION_UNIT.WEEK) &&
            (drugItem.ddlDurationUnit === DURATION_UNIT.DAY || drugItem.ddlDurationUnit === DURATION_UNIT.WEEK)) {
            drugItem.txtDuration = allDurationDto.txtDuration;
            drugItem.ddlDurationUnit = allDurationDto.ddlDurationUnit;
            return drugItem;
        } else {
            return drugItem;
        }
    }
    drugItem.txtDuration = allDurationDto.txtDuration;
    drugItem.ddlDurationUnit = allDurationDto.ddlDurationUnit;
    return drugItem;
}

//Incomplete Mandatory fields checking and complement for adding drug(s) from History / My favorite / Department favorite start
function isInValidDosage(dosage, dosageUnit) {
    if (dosageUnit && !dosage) return true;
    return false;
}
// eslint-disable-next-line no-unused-vars
function isInValidFreq(ddlFreq, freq1) {//NOSONAR
    if (!ddlFreq)
        return true;
    // if (ddlFreq && ddlFreq.indexOf('_') > -1 && !freq1)
    //     return true;
    return false;
}
function isInValidDuration(txtDuration, ddlDurationUnit) {
    if (!txtDuration || !ddlDurationUnit)
        return true;
    return false;
}
export function getMandaFieldsItem(data) {
    let fieldsList = [];
    let isDosage = isInValidDosage(data.txtDosage, data.txtDosageModu),
        isFreq = isInValidFreq(data.ddlFreq, data.freq1),
        isDuration = isInValidDuration(data.txtDuration, data.ddlDurationUnit);

    if (data.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE
        || data.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN
    ) {
        const isStepUpDown = data.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN;
        const condition = isStepUpDown ?
            isDosage && isFreq && isDuration
            : isDosage && isFreq;
        for (let i = 1; i < data.moeMedMultDoses.length; i++) {
            if (condition) return;
            let drug = data.moeMedMultDoses[i];
            if (!isDosage)
                isDosage = isInValidDosage(drug.txtDosage, data.txtDosageModu);
            if (!isFreq)
                isFreq = isInValidFreq(drug.ddlFreq, drug.freq1);
            if (isStepUpDown && !isDuration)
                isDuration = isInValidDuration(drug.txtDuration, drug.ddlDurationUnit);
        }
    }
    // if (data.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE) {
    //     for (let i = 1; i < data.multipleLine.length; i++) {
    //         if (isDosage && isFreq) break;
    //         let drug = data.multipleLine[i];
    //         if (!isDosage)
    //             isDosage = isInValidDosage(drug.txtDosage, data.txtDosageModu);
    //         if (!isFreq)
    //             isFreq = isInValidFreq(drug.ddlFreq, drug.freq1);
    //     }
    // }
    // if (data.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN) {
    //     for (let i = 1; i < data.stepUpDown.length; i++) {
    //         if (isDosage && isFreq && isDuration) break;
    //         let drug = data.stepUpDown[i];
    //         if (!isDosage)
    //             isDosage = isInValidDosage(drug.txtDosage, data.txtDosageModu);
    //         if (!isFreq)
    //             isFreq = isInValidFreq(drug.ddlFreq, drug.freq1);
    //         if (!isDuration)
    //             isDuration = isInValidDuration(drug.txtDuration, drug.ddlDurationUnit);
    //     }
    // }
    if (data.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL
        && data.specialInterval.regimen === 'D'
        && data.specialInterval.supplFreqId === 2
        && (!isDosage && !isFreq)) {
        const specialInterval = data.specialInterval;
        if (!isDosage)
            isDosage = isInValidDosage(specialInterval.txtDosage, data.txtDosageModu);
        if (!isFreq)
            isFreq = isInValidFreq(specialInterval.ddlFreq, specialInterval.freq1);
    }
    if (isDosage) fieldsList.push('Dosage');
    if (isFreq) fieldsList.push('Frequency');
    if (isDuration) fieldsList.push('Duration');
    let mandatoryFieldsItem = {
        fieldsList: fieldsList,
        drug: _.cloneDeep(data)
    };
    return mandatoryFieldsItem;
}
//Incomplete Mandatory fields checking and complement for adding drug(s) from History / My favorite / Department favorite end

export function isAvailable(item) {
    let result = false;
    if (item.apiData && item.apiData.moeEhrMedProfile && item.apiData.moeEhrMedProfile.currentExist && item.apiData.moeEhrMedProfile.notSuspend) {
        result = true;
    }
    return result;
}

export function getUnavailableMsg(item) {
    let msgTmpNotExist = ' is no longer available because of inventory updates.You may contact the pharmacy for their available alternatives.';
    let msgTmpSuspend = ' is suspended by the Pharmacy Department.You may contact the pharmacy for their available alternatives.';
    if (item.apiData && item.apiData.moeEhrMedProfile && !item.apiData.moeEhrMedProfile.currentExist) {
        return msgTmpNotExist;
    }
    if (item.apiData && item.apiData.moeEhrMedProfile && !item.apiData.moeEhrMedProfile.notSuspend) {
        return msgTmpSuspend;
    }
}

// export function isSuspend(item) {
//     return item.apiData && item.apiData.moeEhrMedProfile && !item.apiData.moeEhrMedProfile.notSuspend;
// }

// export function isNotExist(item) {
//     return item.apiData && item.apiData.moeEhrMedProfile && !item.apiData.moeEhrMedProfile.currentExist;
// }

export function getUnavailableList(item) {
    // let drugList = { available: [], unavailable: [] };
    // for (let i = 0; i < item.moeMedProfiles.length; i++) {
    //     if (isAvailable(item.moeMedProfiles[i])) {
    //         drugList.available.push(item.moeMedProfiles[i]);
    //     } else {
    //         drugList.unavailable.push(item.moeMedProfiles[i]);
    //     }
    // }
    // return drugList;
    return item.moeMedProfiles.filter(subItem => { if (!isAvailable(subItem)) return subItem; });
}
export function getAvailableList(item) {
    return item.moeMedProfiles.filter(subItem => { if (isAvailable(subItem)) return subItem; });
}

// export function getShortName(drug) {
//     if (!drug) return;
//     const separator = ' ';
//     const drugName = drug.drugName;
//     const vtm = drug.vtm;
//     const doseFormExtraInfo = drug.doseFormExtraInfo;
//     return <div>
//         <span style={{ fontWeight: 'bold' }}>{drugName}</span>
//         {vtm && '(' + vtm + ')'}
//         {doseFormExtraInfo && separator + doseFormExtraInfo}</div>;
// }

// minimum quantiry check start
//true:poup
export function minQuantityCheck(data, minDosages) {
    let result = true;
    let dosage = 0;
    if (data.txtDosage) {
        dosage = parseInt(data.txtDosage);
        let dosageF = parseFloat(data.txtDosage);
        if (dosage != dosageF) {
            return true;
        }
    } else {
        return false;
    }
    if (minDosages) {
        for (let i = 0; i < minDosages.length; i++) {
            let min_dosage = 0;
            let item = minDosages[i];
            if (item) min_dosage = parseInt(item);
            if (dosage >= min_dosage && dosage % min_dosage === 0) {
                result = false;
                break;
            }
        }
    }
    return result;
}
export function getMinQuantityCheckItem(data) {
    let minQuantityRows = [];
    let minDosages = null;
    let minDosagesMessage = '';
    if (data.apiData) {
        minDosages = data.apiData.minDosages;
        minDosagesMessage = data.apiData.minDosagesMessage;
    } else if (data.convertData) {
        minDosages = data.convertData.minDosages;
        minDosagesMessage = data.convertData.minDosagesMessage;
    }

    if (!minDosages || minDosages.length == 0) {
        return;
    }
    //row 1 check
    if (minQuantityCheck(data, minDosages)) {
        minQuantityRows.push(1);
    }

    //other rows check
    let otherRows = [];
    let orderLineType = data.orderLineType;
    let startIndex = 1;
    let showMultiLine = false;
    // if (data.dangerDrug === 'Y') startIndex = 1;
    if (data.moeMedMultDoses && data.moeMedMultDoses.length > startIndex) {
        otherRows = data.moeMedMultDoses;
        showMultiLine = true;
    }
    // if (data.multipleLine && data.multipleLine.length > startIndex) {
    //     otherRows = data.multipleLine;
    //     showMultiLine = true;
    // } else if (data.stepUpDown && data.stepUpDown.length > startIndex) {
    //     otherRows = data.stepUpDown;
    //     showMultiLine = true;
    // }
    else if (orderLineType === 'R' && data.specialInterval) {
        if (data.specialInterval.supFreqCode === 'on odd / even days') {
            otherRows = [
                { multDoseNo: 1, txtDosage: data.txtDosage },
                { multDoseNo: 2, txtDosage: data.specialInterval.txtDosage }
            ];
            showMultiLine = true;
        }
    }
    for (let i = startIndex; i < otherRows.length; i++) {
        if (minQuantityCheck(otherRows[i], minDosages)) {
            minQuantityRows.push(i + 2 - startIndex);
        }
    }

    return {
        minDosages: minDosages,
        minDosagesMessage: minDosagesMessage,
        drugName: data.displayString,
        showMultiLine: showMultiLine,
        rowNums: minQuantityRows,
        orderLineType: orderLineType,
        drug: _.cloneDeep(data)
    };
}
// minimum quantiry check end

//max duration checking start
//true:poup
export function maxDurationCheck(data, maxDuration, codeList, allDurationDto) {
    let result = true;
    let duration = 0;
    let max_duration = 0;
    let unit = 1;
    if (allDurationDto) {
        if (codeList.duration_unit_map && allDurationDto.ddlDurationUnit) unit = parseInt(codeList.duration_unit_map[0][allDurationDto.ddlDurationUnit]);
        duration = allDurationDto.txtDuration;
    } else {
        if (!data.txtDuration || !data.ddlDurationUnit) return false;
        if (codeList.duration_unit_map && data.ddlDurationUnit) unit = parseInt(codeList.duration_unit_map[0][data.ddlDurationUnit]);
        // if (data.txtDuration)
        duration = parseInt(data.txtDuration);
    }
    if (maxDuration) max_duration = parseInt(maxDuration);

    if (duration * unit <= max_duration) {
        result = false;
    }
    return result;
}
export function getMaxDurationCheckingItem(drugDatas, rowIndex, maxDurationDataList, codeList, allDurationDto) {
    let data = drugDatas[rowIndex];
    let maxDurationRows = [];
    let maxDuration = null;

    if (data.apiData) {
        maxDuration = data.apiData.maxDuration;
    } else if (data.convertData) {
        maxDuration = data.convertData.maxDuration;
    }

    //for edit all duration start
    if (allDurationDto) {
        if (data.itemStatus === 'D') return;
        let _orderLineType = data.orderLineType;
        if (checkAllDuration(data, allDurationDto)) {
            if (maxDuration && maxDurationCheck(data, maxDuration, codeList, allDurationDto)) {
                maxDurationRows.push(1);
                let _maxDurationDataItem = {
                    drugData: data,
                    unit: parseInt(codeList && codeList.duration_unit_map[0][data.ddlDurationUnit]),
                    allDurationUnit: parseInt(codeList && codeList.duration_unit_map[0][allDurationDto.ddlDurationUnit]),
                    maxDuration: maxDuration,
                    drugName: data.displayString,
                    itemIndex: rowIndex,
                    rowNums: maxDurationRows,
                    orderLineType: _orderLineType
                };
                maxDurationDataList.push(_maxDurationDataItem);
            } else {
                if (_orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
                    const unit = parseInt(codeList && codeList.duration_unit_map[0][data.ddlDurationUnit]);
                    data.txtDuration = allDurationDto.txtDuration / unit;
                } else {
                    // data = moeUtilities.editAllDuration(data, allDurationDto);
                    data.txtDuration = allDurationDto.txtDuration;
                    data.ddlDurationUnit = allDurationDto.ddlDurationUnit;
                }
                drugDatas[rowIndex] = data;
            }
        }
        return;
    }
    //for edit all duration end

    if (!maxDuration) {
        return;
    }
    //row 1 check
    if (maxDurationCheck(data, maxDuration, codeList)) {
        maxDurationRows.push(1);
    }
    let orderLineType = data.orderLineType;
    let otherRows = [];
    let startIndex = 1;
    // if (data.dangerDrug === 'Y') startIndex = 1;

    // if (data.multipleLine && data.multipleLine.length > startIndex) {
    //     otherRows = [data.multipleLine[0]];
    // } else if (data.stepUpDown && data.stepUpDown.length > startIndex) {
    //     otherRows = data.stepUpDown;
    // }
    if (data.moeMedMultDoses && data.moeMedMultDoses.length > startIndex) {
        otherRows = [data.moeMedMultDoses[0]];
    }

    for (let i = startIndex; i < otherRows.length; i++) {
        if (maxDurationCheck(otherRows[i], maxDuration, codeList)) {
            maxDurationRows.push(i + 2 - startIndex);
        }
    }
    let maxDurationDataItem = {
        drugData: data,
        unit: parseInt(codeList && codeList.duration_unit_map[0][data.ddlDurationUnit]),
        maxDuration: maxDuration,
        drugName: data.displayString,
        itemIndex: rowIndex,
        rowNums: maxDurationRows,
        orderLineType: orderLineType
    };

    if (maxDurationDataItem.rowNums.length) maxDurationDataList.push(maxDurationDataItem);
}
//max duration checking end

//get selected freq option in freq code list start
export const getFreqOption = (drug, freqCodeList) => {
    let option;
    if (drug.ddlFreq) {
        option = freqCodeList.find(item => item.freqCode == drug.ddlFreq);
    }
    return option;
};
//get selected freq option in freq code list end

//get duration unit code list start
export const getDurationUnitCodeList = (drug, durationUnitCodeList, freqCodeList, orderLineType) => {
    let list;
    const freqOption = getFreqOption(drug, freqCodeList);
    if (freqOption && freqOption.durationUnit && orderLineType != ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
        list = durationUnitCodeList.filter(item => item.durationUnitDesc == freqOption.durationUnit);
    } else {
        list = durationUnitCodeList.filter(item => {
            let regimen = (drug.specialInterval && drug.specialInterval.regimen) || DURATION_UNIT.DAY;
            if (item.code === DURATION_UNIT.DAY || item.code === DURATION_UNIT.WEEK || item.code === regimen.toLowerCase())
                return item;
            return null;
        });
    }
    return list;
};
//get duration unit code list end

//set duration for drug start
export const autoSetDurationByFreq = (drug, freqOption, durationUnitCodeList, orderLineType) => {
    if (orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL)
        return;
    if (freqOption.durationUnit) {
        const duration = durationUnitCodeList.find(item => item.durationUnitDesc === freqOption.durationUnit);
        if (duration)
            drug.ddlDurationUnit = duration.durationUnit;
    } else {
        drug.ddlDurationUnit = null;
    }
    if (freqOption.durationValue) {
        drug.txtDuration = freqOption.durationValue;
    } else {
        drug.txtDuration = null;
    }
};
//set duration for drug end

//params for getMaxDosage api start
export const getParamsForDose = (lineId, prescriptionData) => {
    let curItem = prescriptionData;
    let params = {
        duration: prescriptionData.txtDuration,
        durationUnit: prescriptionData.ddlDurationUnit,
        freq1: prescriptionData.freq1,
        freqCode: prescriptionData.ddlFreq,
        moeEhrMedProfile: {
            orderLineType: prescriptionData.orderLineType,
            siteId: prescriptionData.ddlSite || null
        },
        moeMedMultDoses: [{
            multDoseNo: 1,
            duration: prescriptionData.txtDuration,
            durationUnit: prescriptionData.ddlDurationUnit,
            freq1: prescriptionData.freq1,
            freqCode: prescriptionData.ddlFreq
        }]
    };
    if (lineId && (prescriptionData.orderLineType === ORDER_LINE_TYPE.MULTIPLE_LINE
        || prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN)
    ) {
        const isSteUpDown = prescriptionData.orderLineType === ORDER_LINE_TYPE.STEP_UP_AND_DOWN;
        curItem = prescriptionData.moeMedMultDoses[lineId];
        params = {
            duration: isSteUpDown ? curItem.txtDuration : prescriptionData.txtDuration,
            durationUnit: isSteUpDown ? curItem.ddlDurationUnit : prescriptionData.ddlDurationUnit,
            freq1: curItem.freq1,
            freqCode: curItem.ddlFreq,
            moeEhrMedProfile: {
                orderLineType: prescriptionData.orderLineType,
                siteId: prescriptionData.ddlSite || null
            },
            moeMedMultDoses: [{
                multDoseNo: curItem.multDoseNo,
                duration: isSteUpDown ? curItem.txtDuration : prescriptionData.txtDuration,
                durationUnit: isSteUpDown ? curItem.ddlDurationUnit : prescriptionData.ddlDurationUnit,
                freq1: curItem.freq1,
                freqCode: curItem.ddlFreq
            }]
        };
    }
    if (prescriptionData.orderLineType === ORDER_LINE_TYPE.SPECIAL_INTERVAL) {
        curItem = lineId ? prescriptionData.specialInterval : prescriptionData;
        params = {
            duration: prescriptionData.txtDuration,
            durationUnit: prescriptionData.ddlDurationUnit,
            freq1: prescriptionData.freq1,
            freqCode: prescriptionData.ddlFreq,
            supFreqCode: prescriptionData.specialInterval.supFreqCode,
            supplFreqId: prescriptionData.specialInterval.supplFreqId,
            supFreq1: prescriptionData.specialInterval.supFreq1,
            supFreq2: prescriptionData.specialInterval.supFreq2,
            regimen: prescriptionData.specialInterval.regimen,
            dayOfWeek: prescriptionData.specialInterval.dayOfWeek || null,
            moeEhrMedProfile: {
                orderLineType: prescriptionData.orderLineType || ORDER_LINE_TYPE.SPECIAL_INTERVAL,
                siteId: prescriptionData.ddlSite || null,
                supplFreqId: prescriptionData.specialInterval.supplFreqId,
                cycleMultiplier: prescriptionData.specialInterval.cycleMultiplier
            },
            moeMedMultDoses: [
                {
                    freq1: prescriptionData.freq1,
                    freqCode: prescriptionData.ddlFreq,
                    multDoseNo: 1,
                    moeEhrMedMultDose: {
                        supplFreqId: prescriptionData.specialInterval.supplFreqId
                    }

                },
                {
                    freq1: prescriptionData.specialInterval.freq1,
                    freqCode: prescriptionData.specialInterval.ddlFreq,
                    multDoseNo: 2,
                    moeEhrMedMultDose: {
                        supplFreqId: prescriptionData.specialInterval.supplFreqId
                    }
                }
            ]
        };
    }
    return {
        params,
        curItem
    };
};
//params for getMaxDosage api emd

//Updates the first row of the moeMedMultDoses array start
export const updateMultDoseFirstRow = (drug, name, value) => {
    if (!drug || !drug.orderLineType) return;
    if (drug.orderLineType !== ORDER_LINE_TYPE.MULTIPLE_LINE
        || drug.orderLineType !== ORDER_LINE_TYPE.STEP_UP_AND_DOWN)
        return;
    if (name == 'ddlFreq') {
        drug.moeMedMultDoses[0]['freq1'] = drug.freq1;
        drug.moeMedMultDoses[0]['freqId'] = drug.freqId;
        drug.moeMedMultDoses[0]['freqText'] = drug.freqText;
        drug.moeMedMultDoses[0][name] = value;
        drug.moeMedMultDoses[0]['ddlDurationUnit'] = drug.ddlDurationUnit;
        drug.moeMedMultDoses[0]['txtDuration'] = drug.txtDuration;
        return;
    }
    // if (name == 'ddlRoute') {
    //     drug.moeMedMultDoses[0][name] = name;
    //     drug.moeMedMultDoses[0]['routeEng'] = drug.routeEng;
    //     return;
    // }
    drug.moeMedMultDoses[0][name] = value;
};
//Updates the first row of the moeMedMultDoses array end

//add first row to moeMedMultDoses start
export const addRowToMultDoses = (drug, multDoseNo, defaultDurationUnit) => {
    if (!drug) return;
    if (!drug.moeMedMultDoses) drug.moeMedMultDoses = [];
    let arryMulti = {
        multDoseNo: multDoseNo,
        txtDosage: multDoseNo == 1 ? drug.txtDosage : '',
        txtDosageModu: drug.txtDosageModu,
        ddlFreq: multDoseNo == 1 ? drug.ddlFreq : '',
        chkPRN: 'N',
        txtDuration: multDoseNo == 1 ? drug.txtDuration : '',
        ddlDurationUnit: multDoseNo == 1 ?
            drug.ddlDurationUnit :
            (drug.orderLineType == ORDER_LINE_TYPE.STEP_UP_AND_DOWN && defaultDurationUnit),
        freq1: multDoseNo == 1 ? drug.freq1 : 0,
        frequencyItem: multDoseNo == 1 ? drug.frequencyItem : '',
        txtDangerDrugQty: multDoseNo == 1 ? drug.txtDangerDrugQty : ''
    };
    drug.moeMedMultDoses.push(arryMulti);
};
//add first row to moeMedMultDoses end

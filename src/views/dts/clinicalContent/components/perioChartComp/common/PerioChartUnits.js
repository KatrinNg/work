import { date } from "yup";

export const getPockToothInputType = 'pockToothInput';
export const getRecToothInputType = 'recToothInput';
export const getPCViewTypeForId = "dts-cc-periochart-view-id";
export const getList32WithTwo = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
export const getList32WithSix = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
let sR = false;

export const getTthEnum = 
['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28', '48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

export const getEptEnum = 
['NIL', 'POS', 'NEG'];

export const getMobEnum = 
['NIL', '1', '2', '3'];

export const getPCIRes = {
    val: "",
    stay: false,
    color: null
};

export const getPDStateObj = {
    left: {val: 0},
    top: {val: 0},
    right: {val: 0},
    bottom: {val: 0},
    midLeft: {val: 0},
    midRight: {val: 0},
    topLeft: {val: 0},
    props: {isExtract: false, isImplant: false, isSupp: false}
};

export const getDtoPCToothObj = {
    clcPerioChartHdrId:'',
    toothNum:'',
    ept:'',
    mobility:'',
    furcation:'',
    isNC:'',
    isMissing:'',
    s1Pocket:'',
    s1IsBleed:'',
    s2Pocket:'',
    s2IsBleed:'',
    s3Pocket:'',
    s3IsBleed:'',
    s4Pocket:'',
    s4IsBleed:'',
    s5Pocket:'',
    s5IsBleed:'',
    s6Pocket:'',
    s6IsBleed:'',
    s1Recess:'',
    s2Recess:'',
    s3Recess:'',
    s4Recess:'',
    s5Recess:'',
    s6Recess:'',
    s7Recess:'',
    s8Recess:''
};

export const getDtoPCObj = {
    clcPerioChartHdrId : 0,
    encntrId : 0,
    clcEncntrChartId : 0,
    dspTooth : '',
    is2RecInput : false,
    remark : '',
    isPerioTeam : 0,
    isCmplChart: 0,
    perioChartToothDto : [],
    createBy : ''
};

export function getNewDtoPCObj() {
    let obj = getDtoPCObj;
    let i;
    for (i = 0; i < getTthEnum.length; i++) {
        let tthObj = {...getDtoPCToothObj}; 
        tthObj.toothNum = getTthEnum[i];
        obj.perioChartToothDto[i] = tthObj;
    }
    return obj;
}

export function getListPDStateObj() {
    return [
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj)),
        JSON.parse(JSON.stringify(getPDStateObj)), JSON.parse(JSON.stringify(getPDStateObj))
    ];
}

export function getToothNumByInputId(id) {
    let ids = id.split('_');
    return parseInt(ids[1]);
}

export function getNextPCInputBoxId(id, isFullSeq, isSixInput) {
    let ids = id.split('_');
    let type = ids[0];
    let otn = parseInt(ids[1]);
    let ots = parseInt(ids[2]);
    let ntn;
    let nts;
    
    if (!isSixInput && (type === 'pcInput-' + getRecToothInputType)){
        if (isFullSeq) {
            if (otn === 15) {
                if (ots === 10) { ntn = otn; nts = ++ots; } else { ntn = --otn; nts = ots; }
            } else if ((otn === 31) && (ots === 10)) { 
                if (sR) { ntn = 0; nts = ots; sR = false; } else { ntn = otn; nts = 11; sR = true; }
            } else if ((otn === 16) && (ots === 11)) { ntn = otn; nts = 10;
            } else if ((otn === 0) && (ots === 11)) { 
                if (sR) { ntn = 31; nts = ots; sR = false; } else { ntn = otn; nts = 10; sR = true; }
            } else {
                if (ots === 10) { ntn = ++otn; nts = ots; } else { ntn = --otn; nts = ots; }
            }
        } else {
            if ((otn === 7) || (otn === 15)) {
                if (ots === 10) { ntn = otn; nts = ++ots; } else { ntn = --otn; nts = ots; }
            } else if (((otn === 16)) && (ots === 11)) { ntn = otn; nts = --ots;
            } else if (((otn === 0)) && (ots === 11)) { 
                if (sR) { ntn = 8; nts = 10; sR = false; } else { ntn = otn; nts = 10; sR = true; }
            } else if (((otn === 8)) && (ots === 11)) { 
                if (sR) { ntn = 31; nts = 11; sR = false; } else { ntn = 8; nts = 10; sR = true; }
            } else if (((otn === 24)) && (ots === 11)) { 
                ntn = otn; nts = --ots;
            } else if (((otn === 31)) && (ots === 10)) { 
                if (sR) { ntn = 23; nts = 11; sR = false; } else { ntn = 31; nts = 11; sR = true; }
            } else if (((otn === 23)) && (ots === 10)) { 
                if (sR) { ntn = 0; nts = 10; sR = false; } else { ntn = 23; nts = 11; sR = true; }
            } else {
                if (ots === 10) { ntn = ++otn; nts = ots; } else { ntn = --otn; nts = ots; }
            }
        }
    } else {
        if (ots < 2) { ntn = otn; nts = ++ots;
        } else if ((isFullSeq) && (ots === 2)) {
            if (otn === 15) { ntn = otn; nts = 5; } 
            else if (otn === 31) {
                if (sR) { ntn = 0; nts = 0; sR = false; } else { ntn = 31; nts = 5; sR = true; }
            } else { ntn = ++otn; nts = 0; }
        } else if ((isFullSeq) && (ots > 2) && (ots < 6) && (ots !== 3)) { ntn = otn; nts = --ots;
        } else if ((isFullSeq) && (ots === 3)) {
            if (otn !== 0 && otn !== 16) { ntn = --otn; nts = 5; } 
            else if (otn === 0) { 
                if (sR) { ntn = 31; nts = 5; sR = false; } else { ntn = 0; nts = 0; sR = true; }
            }
            else if (otn === 16) { ntn = 16; nts = 0; } 
            else { ntn = otn; nts = 3;}
        }  else if ((!isFullSeq) && (ots === 2)) {
            if ((otn === 7) || (otn === 15)) { ntn = otn; nts = 5;
            } else if (otn === 31) {
                if (sR) { ntn = 23; nts = 5; sR = false; } else { ntn = 31; nts = 5; sR = true; }
            } else if (otn === 23) {
                if (sR) { ntn = 0; nts = 0; sR = false; } else { ntn = 23; nts = 5; sR = true; }
            } else { ntn = ++otn; nts = 0;}
        } else if ((ots > 2) && (ots < 6) && (ots !== 3) && (!isFullSeq)) { ntn = otn; nts = --ots;
        } else if ((ots === 3) && (!isFullSeq)) {
            if (otn !== 0 && otn !== 8 && otn !== 16 && otn !== 24 && otn !== 31) { ntn = --otn; nts = 5;
            } else if (otn === 0) {
                if (sR) { ntn = 8; nts = 0; sR = false; } else { ntn = otn; nts = 0; sR = true; }
            } else if (otn === 8) {
                if (sR) { ntn = 31; nts = 5; sR = false; } else { ntn = otn; nts = 0; sR = true; }
            } else if (otn === 24) {
                ntn = otn; nts = 0; 
            } else if (otn === 31) {
                ntn = --otn; nts = 5; 
            } else if (otn === 16) {
                ntn = otn; nts = 0; 
            } else { ntn = otn; nts = 3;}
        } 
    }
    return type + '_' + ntn + '_' + nts;
}

export function getPrevPCInputBoxId(id, isFullSeq, isSixInput) {
    let ids = id.split('_');
    let type = ids[0];
    let otn = parseInt(ids[1]);
    let ots = parseInt(ids[2]);
    let ntn;
    let nts;

    if (!isSixInput && (type === 'pcInput-' + getRecToothInputType)){
        if (isFullSeq) {
            if (otn === 0) {
                if (ots === 10) { if (sR) { ntn = otn; nts = 11; sR = false; } else { ntn = 31; nts = 10; sR = true; }
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 15) {
                if (ots === 11) {  ntn = otn; nts = 10;
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 16) {
                if (ots === 10) { ntn = otn; nts = 11;
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 31) {
                if (ots === 11) { if (sR) { ntn = otn; nts = 10; sR = false; } else { ntn = 0; nts = 11; sR = true; }
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else {
                let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts;
            }
        } else {
            if (otn === 0) {
                if (ots === 10) {
                    if (sR) { ntn = otn; nts = 11; sR = false; } else { ntn = 23; nts = 10; sR = true; }
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 7) {
                if (ots === 11) {  ntn = otn; nts = 10; 
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 8) {
                if (ots === 10) { if (sR) { ntn = otn; nts = 11; sR = false; } else { ntn = 0; nts = 11; sR = true; }
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 15) {
                if (ots === 11) {  ntn = otn; nts = 10;
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 16) {
                if (ots === 10) { ntn = otn; nts = 11;
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 23) {
                if (ots === 11) { if (sR) { ntn = otn; nts = 10; sR = false; } else { ntn = 31; nts = 10; sR = true; }
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 24) {
                if (ots === 10) { ntn = otn; nts = 11;
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 31) {
                if (ots === 11) { if (sR) { ntn = otn; nts = 10; sR = false; } else { ntn = 8; nts = 11; sR = true; }
                } else { let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else {
                let obj = subGetPrevInputId_2(otn, ots); ntn = obj.ntn; nts = obj.nts;
            }
        }
    } else {
        if (isFullSeq) {
            if (otn === 0) {
                if (ots === 0) { if (sR) { ntn = otn; nts = 3; sR = false; } else { ntn = 31; nts = 2; sR = true; }
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 15) {
                if (ots === 5) { ntn = otn; nts = 2;
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 16) {
                if (ots === 0) { ntn = otn; nts = 3;
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 31) {
                if (ots === 5) { if (sR) { ntn = otn; nts = 2; sR = false; } else { ntn = 0; nts = 3; sR = true; }
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else {
                let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts;
            }
        } else {
            if (otn === 0) {
                if (ots === 0) { if (sR) { ntn = otn; nts = 3; sR = false; } else { ntn = 23; nts = 2; sR = true; }
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 7) {
                if (ots === 5) { ntn = otn; nts = 2;
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 8) {
                if (ots === 0) { if (sR) { ntn = otn; nts = 3; sR = false; } else { ntn = 0; nts = 3; sR = true; }
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 15) {
                if (ots === 5) { ntn = otn; nts = 2;
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 16) {
                if (ots === 0) { ntn = otn; nts = 3;
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 23) {
                if (ots === 5) { if (sR) { ntn = otn; nts = 2; sR = false; } else { ntn = 31; nts = 2; sR = true; }
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 24) {
                if (ots === 0) { ntn = otn; nts = 3;
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else if (otn === 31) {
                if (ots === 5) { if (sR) { ntn = otn; nts = 2; sR = false; } else { ntn = 8; nts = 3; sR = true; }
                } else { let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts; }
            } else {
                let obj = subGetPrevInputId_6(otn, ots); ntn = obj.ntn; nts = obj.nts;
            }
        }
    }

    return type + '_' + ntn + '_' + nts;
}

export function subGetPrevInputId_2(otn, ots) {
    let ntn;
    let nts;
    if (ots === 10) {
        ntn = --otn; nts = ots;
    } else if (ots === 11) {
        ntn = ++otn; nts = ots;
    } else {
        ntn = -1;
        nts = -1;
    }
    return {ntn, nts};
}

export function subGetPrevInputId_6(otn, ots) {
    let ntn;
    let nts;
    if (ots === 1 || ots === 2 ) {
        ntn = otn; nts = --ots;
    } else if (ots === 3 || ots === 4) {
        ntn = otn; nts = ++ots;
    } else if (ots === 0) {
        ntn = --otn; nts = 2;
    } else if (ots === 5) {
        ntn = ++otn; nts = 3;
    } else {
        ntn = -1;
        nts = -1;
    }
    return {ntn, nts};
}

export function getTypeFromInputId(id) {
    let ids = id.split('_');
    let inputType = ids[0];
    let idSplit = inputType.split('-');
    return idSplit[1];
}

export function cleanPockInputBoxVal() {
    let i;
    let j;
    for (i = 0; i < 32; i++) {
        for (j = 0; j < 6; j++) {
            document.getElementById('pcInput-' + getPockToothInputType + '_' + i + '_' + j).value = '';
        }
    }
}

export function cleanRecInputBoxVal(sixN) {
    let i;
    let j;
    if (sixN) {
        for (i = 0; i < 32; i++) {
            for (j = 0; j < 6; j++) {
                document.getElementById('pcInput-' + getRecToothInputType + '_' + i + '_' + j).value = '';
            }
        }
    } else {
        for (i = 0; i < 32; i++) {
            document.getElementById('pcInput-' + getRecToothInputType + '_' + i + '_10').value = '';
            document.getElementById('pcInput-' + getRecToothInputType + '_' + i + '_11').value = '';
        }
    }
}

export function removeArrItem(arr, item) {
    let index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
}

export function getInputPock(oVal, nVal) {
    let res = nVal.replace(oVal, '');
    let pcIR = { ...getPCIRes};
    switch(true) {
        case (res === "*"): pcIR.val = "10"; pcIR.stay = false; return pcIR;
        case (res.includes("*")): pcIR.val = "10"; pcIR.stay = false; return pcIR;
        case (res === "."): pcIR.val = ""; pcIR.stay = false; return pcIR;
        case (res === " "): pcIR.val = ""; pcIR.stay = false; return pcIR;
        case (res === "2"):
        case (res === "3"): pcIR.val = ""; pcIR.stay = true; return pcIR;
        case (parseInt(res) >= 4 && parseInt(res) <= 10): pcIR.val = res; pcIR.stay = false; return pcIR;
        case (res === "1"): pcIR.val = oVal; pcIR.stay = true; pcIR.color = '#FFA07A'; return pcIR;
        case (res === "0"): pcIR.val = oVal; pcIR.stay = true; pcIR.color = '#ffffff'; return pcIR;
        case (res === "+"): pcIR.val = res; pcIR.stay = false; return pcIR;
        case (parseInt(nVal) > 10): 
            if (nVal.charAt(0) === nVal.charAt(1)) {
                pcIR.val = nVal.charAt(0); pcIR.stay = false; return pcIR;
            } else if ((nVal.length === 3) && nVal.charAt(0) === "1" && nVal.charAt(2) === "0") {
                pcIR.val = nVal.charAt(1); pcIR.stay = false; return pcIR;
            } else {
                pcIR.val = res; pcIR.stay = false; return pcIR;
            }
        default: pcIR.val = ""; pcIR.stay = true; return pcIR;
    }
}

export function getInputRec(oVal, nVal) {
    let res = nVal.replace(oVal, '');
    let pcIR = { ...getPCIRes};
    switch(true) {
        case (nVal.length === 2 && nVal.charAt(1) === ".") : pcIR.val = nVal.replace('.', ''); pcIR.stay = false; return pcIR;
        case (nVal.length === 2 && nVal.charAt(0) === "1" && parseInt(nVal) <= 15): pcIR.val = nVal; pcIR.stay = false; return pcIR;
        case (nVal.length === 2 && nVal.charAt(0) === nVal.charAt(1)): pcIR.val = nVal.charAt(0); pcIR.stay = false; return pcIR;
        case (res === "*"): pcIR.val = ""; pcIR.stay = false; return pcIR;
        case (res === "."): pcIR.val = ""; pcIR.stay = false; return pcIR;
        case (res === " "): pcIR.val = ""; pcIR.stay = false; return pcIR;
        case (parseInt(res) > 1 && parseInt(res) <= 9): pcIR.val = res; pcIR.stay = false; return pcIR;
        case (res === "1"): pcIR.val = res; pcIR.stay = true; return pcIR;
        case (res === "+"): pcIR.val = res; pcIR.stay = false; return pcIR;
        case (parseInt(nVal) > 15): pcIR.val = ""; pcIR.stay = true; return pcIR;
        default: pcIR.val = ""; pcIR.stay = true; return pcIR;
    }
}

export function chkPCInputId(id) {
    if (id === "") {
        return false;
    } else if (((id.indexOf(getPockToothInputType) > -1) || (id.indexOf(getRecToothInputType) > -1))) {
        return true;
    } else {
        return false;
    }
}

export function getNum(oVal, nVal) {
    return nVal.replace(oVal, '');
}

export function getBoolByNum(num) {
    return (num === 1) ? true : false;
}

export function getNumByBool(bool) {
    return (bool) ? 1 : 0;
}

export function getFurcationStr(getPDStateObj) {
    return 'L' + getPDStateObj.left.val + 'R' + getPDStateObj.right.val + 'T' + getPDStateObj.top.val + 'B' + getPDStateObj.bottom.val;
}

export function getInputBoxVal(tthNum, surface, type) {
    let val;
    if (surface === 7 && type === getRecToothInputType) {
        val = document.getElementById('pcInput-' + type + '_' + tthNum + '_10').value;
        return (val === '') ? 'NIL' : val.toString();
    } else if (surface === 8 && type === getRecToothInputType) {
        val = document.getElementById('pcInput-' + type + '_' + tthNum + '_11').value;
        return (val === '') ? 'NIL' : val.toString();
    } else {
        surface = surface - 1;
        val = document.getElementById('pcInput-' + type + '_' + tthNum + '_' + surface).value;
        return (val === '') ? 'NIL' : val.toString();
    }
}

export function getInputBoxBleed(tthNum, surface, type) {
    if (type === getPockToothInputType) {
        surface = surface - 1;
        let result = document.getElementById('pcInput-' + type + '_' + tthNum + '_' + surface).style.backgroundColor;
        return (result === 'rgb(255, 160, 122)') ? 1 : 0;
    } else {
        return 0;
    }
}

export function convertToDtoPerioChart(getDtoPCObj, listPDState) {
    let i;
    let isRec2 = getBoolByNum(getDtoPCObj.is2RecInput);
    for (i = 0; i < listPDState.length; i++) {
        let tthObj = JSON.parse(JSON.stringify(getDtoPCToothObj));
        let isNC = getBoolByNum(listPDState[i].topLeft.val);
        let isMiss = listPDState[i].props.isExtract;
        let isImplant = listPDState[i].props.isImplant;

        tthObj.toothNum = getTthEnum[i];
        tthObj.isNC = getNumByBool(isNC);
        tthObj.isMissing = getNumByBool(isMiss);

        if (isNC || isMiss || isImplant) {
            tthObj.ept = 'NIL';
            tthObj.mobility = 'NIL';
            tthObj.furcation = 'L0R0T0B0';
        } else {
            tthObj.ept = getEptEnum[listPDState[i].midLeft.val];
            tthObj.mobility = getMobEnum[listPDState[i].midRight.val];
            tthObj.furcation = getFurcationStr(listPDState[i]);
        }

        if (isNC || isMiss) {
            tthObj.s1Pocket = 'NIL';
            tthObj.s1IsBleed = 0;
            tthObj.s2Pocket = 'NIL';
            tthObj.s2IsBleed = 0;
            tthObj.s3Pocket = 'NIL';
            tthObj.s3IsBleed = 0;
            tthObj.s4Pocket = 'NIL';
            tthObj.s4IsBleed = 0;
            tthObj.s5Pocket = 'NIL';
            tthObj.s5IsBleed = 0;
            tthObj.s6Pocket = 'NIL';
            tthObj.s6IsBleed = 0;
            tthObj.s1Recess = 'NIL';
            tthObj.s2Recess = 'NIL';
            tthObj.s3Recess = 'NIL';
            tthObj.s4Recess = 'NIL';
            tthObj.s5Recess = 'NIL';
            tthObj.s6Recess = 'NIL';
            tthObj.s7Recess = 'NIL';
            tthObj.s8Recess = 'NIL';
        } else {
            tthObj.s1Pocket = getInputBoxVal(i, 1, getPockToothInputType);
            tthObj.s1IsBleed = getInputBoxBleed(i, 1, getPockToothInputType);
            tthObj.s2Pocket = getInputBoxVal(i, 2, getPockToothInputType);
            tthObj.s2IsBleed = getInputBoxBleed(i, 2, getPockToothInputType);
            tthObj.s3Pocket = getInputBoxVal(i, 3, getPockToothInputType);
            tthObj.s3IsBleed = getInputBoxBleed(i, 3, getPockToothInputType);
            tthObj.s4Pocket = getInputBoxVal(i, 4, getPockToothInputType);
            tthObj.s4IsBleed = getInputBoxBleed(i, 4, getPockToothInputType);
            tthObj.s5Pocket = getInputBoxVal(i, 5, getPockToothInputType);
            tthObj.s5IsBleed = getInputBoxBleed(i, 5, getPockToothInputType);
            tthObj.s6Pocket = getInputBoxVal(i, 6, getPockToothInputType);
            tthObj.s6IsBleed = getInputBoxBleed(i, 6, getPockToothInputType);
            if (!isRec2) {
                tthObj.s1Recess = getInputBoxVal(i, 1, getRecToothInputType);
                tthObj.s2Recess = getInputBoxVal(i, 2, getRecToothInputType);
                tthObj.s3Recess = getInputBoxVal(i, 3, getRecToothInputType);
                tthObj.s4Recess = getInputBoxVal(i, 4, getRecToothInputType);
                tthObj.s5Recess = getInputBoxVal(i, 5, getRecToothInputType);
                tthObj.s6Recess = getInputBoxVal(i, 6, getRecToothInputType);
                tthObj.s7Recess = 'NIL';
                tthObj.s8Recess = 'NIL';
            } else {
                tthObj.s1Recess = 'NIL';
                tthObj.s2Recess = 'NIL';
                tthObj.s3Recess = 'NIL';
                tthObj.s4Recess = 'NIL';
                tthObj.s5Recess = 'NIL';
                tthObj.s6Recess = 'NIL';
                tthObj.s7Recess = getInputBoxVal(i, 7, getRecToothInputType);
                tthObj.s8Recess = getInputBoxVal(i, 8, getRecToothInputType);
            }
        }
        getDtoPCObj.perioChartToothDto[i] = tthObj;
    }
    return getDtoPCObj;
}

export function chkNum(n) {
    if (n === '' || n === null || n === 'Nil' || n === 'NIL') {
        return 0;
    } else {
        return n;
    }
}

export function chkStr(s) {
    if (s === '' || s === null || s === 'Nil' || s === 'NIL') {
        return '';
    } else {
        return s;
    }
}

export function chkFurcation(s) {
    if (s === '' || s === null || s === 'Nil' || s === 'NIL') {
        return "L0R0T0B0";
    } else {
        return s;
    }
}

export function chkDataNull(s) {
    if (s === '' || s === null || s === 'Nil' || s === 'NIL') {
        return "NIL";
    } else {
        return s;
    }
}

export function getFurcationSideVal(str, side) {
    let loc = str.indexOf(side);
    return parseInt(str.charAt(loc + 1));
}

export function showInputBoxVal(val, tthNum, surface, type, chartNum) {
    let typeWithNum = type;
    if (!(chartNum === "")) {
        typeWithNum = type + "-v" + chartNum;
    }
    if (surface === 7 && type === getRecToothInputType) {
        document.getElementById('pcInput-' + typeWithNum + '_' + tthNum + '_10').value = chkStr(val);
    } else if (surface === 8 && type === getRecToothInputType) {
        document.getElementById('pcInput-' + typeWithNum + '_' + tthNum + '_11').value = chkStr(val);
    } else {
        surface = surface - 1;
        document.getElementById('pcInput-' + typeWithNum + '_' + tthNum + '_' + surface).value = chkStr(val);
    }
}

export function showInputBoxBleed(val, tthNum, surface, type, chartNum) {
    let typeWithNum = type;
    if (!(chartNum === "")) {
        typeWithNum = type + "-v" + chartNum;
    }
    surface = surface - 1;
    if (val === 1) {
        document.getElementById('pcInput-' + typeWithNum + '_' + tthNum + '_' + surface).style.backgroundColor = "#FFA07A";
    } else {
        document.getElementById('pcInput-' + typeWithNum + '_' + tthNum + '_' + surface).style.backgroundColor = "#ffffff";
    }
}

export function getPCStateNumByEncntrId(arr, id) {
    let i;
    for (i = 0; i < arr.length; i++) {
        if (arr[i].perioChartDto.encntrId === id) { return i; }
    }
    return -1;
}

export function showPerioChartWithData(pcData, chartNum) {

    let i;
    let j;
    let isRec2 = getBoolByNum(pcData.is2RecInput);
    let pcTthDataList = pcData.perioChartToothDto;
    let listPDStateObj = getListPDStateObj();
    for (j = 0; j < listPDStateObj.length; j++) {
        for (i = 0; i < pcTthDataList.length; i++) {
            let tthNum = chkNum(pcTthDataList[i].toothNum);
            if (tthNum === parseInt(getTthEnum[j])) {
                let pdStateObj = JSON.parse(JSON.stringify(getPDStateObj));
                
                let isNC = getBoolByNum(chkNum(pcTthDataList[i].isNC));
                let isMiss = getBoolByNum(chkNum(pcTthDataList[i].isMissing));
                let furData;
                
                // pdStateObj.props.isImplant = isImplant;
                pdStateObj.topLeft.val = getNumByBool(isNC);
                pdStateObj.props.isExtract = isMiss;

                if (isNC || isMiss) {
                    furData = "L0R0T0B0";
                    pdStateObj.left.val = getFurcationSideVal(furData, "L");
                    pdStateObj.right.val = getFurcationSideVal(furData, "R");
                    pdStateObj.top.val = getFurcationSideVal(furData, "T");
                    pdStateObj.bottom.val = getFurcationSideVal(furData, "B");
                    pdStateObj.midLeft.val = 0;
                    pdStateObj.midRight.val = 0;
                } else {
                    furData = chkFurcation(pcTthDataList[i].furcation);
                    pdStateObj.left.val = getFurcationSideVal(furData, "L");
                    pdStateObj.right.val = getFurcationSideVal(furData, "R");
                    pdStateObj.top.val = getFurcationSideVal(furData, "T");
                    pdStateObj.bottom.val = getFurcationSideVal(furData, "B");
                    pdStateObj.midLeft.val = getEptEnum.indexOf(chkDataNull(pcTthDataList[i].ept));
                    pdStateObj.midRight.val = getMobEnum.indexOf(chkDataNull(pcTthDataList[i].mobility));

                    showInputBoxVal(pcTthDataList[i].s1Pocket, j, 1, getPockToothInputType, chartNum);
                    showInputBoxBleed(pcTthDataList[i].s1IsBleed, j, 1, getPockToothInputType, chartNum);
                    showInputBoxVal(pcTthDataList[i].s2Pocket, j, 2, getPockToothInputType, chartNum);
                    showInputBoxBleed(pcTthDataList[i].s2IsBleed, j, 2, getPockToothInputType, chartNum);
                    showInputBoxVal(pcTthDataList[i].s3Pocket, j, 3, getPockToothInputType, chartNum);
                    showInputBoxBleed(pcTthDataList[i].s3IsBleed, j, 3, getPockToothInputType, chartNum);
                    showInputBoxVal(pcTthDataList[i].s4Pocket, j, 4, getPockToothInputType, chartNum);
                    showInputBoxBleed(pcTthDataList[i].s4IsBleed, j, 4, getPockToothInputType, chartNum);
                    showInputBoxVal(pcTthDataList[i].s5Pocket, j, 5, getPockToothInputType, chartNum);
                    showInputBoxBleed(pcTthDataList[i].s5IsBleed, j, 5, getPockToothInputType, chartNum);
                    showInputBoxVal(pcTthDataList[i].s6Pocket, j, 6, getPockToothInputType, chartNum);
                    showInputBoxBleed(pcTthDataList[i].s6IsBleed, j, 6, getPockToothInputType, chartNum);

                    if (!isRec2) {
                        showInputBoxVal(pcTthDataList[i].s1Recess, j, 1, getRecToothInputType, chartNum);
                        showInputBoxVal(pcTthDataList[i].s2Recess, j, 2, getRecToothInputType, chartNum);
                        showInputBoxVal(pcTthDataList[i].s3Recess, j, 3, getRecToothInputType, chartNum);
                        showInputBoxVal(pcTthDataList[i].s4Recess, j, 4, getRecToothInputType, chartNum);
                        showInputBoxVal(pcTthDataList[i].s5Recess, j, 5, getRecToothInputType, chartNum);
                        showInputBoxVal(pcTthDataList[i].s6Recess, j, 6, getRecToothInputType, chartNum);
                    } else {
                        showInputBoxVal(pcTthDataList[i].s7Recess, j, 7, getRecToothInputType, chartNum);
                        showInputBoxVal(pcTthDataList[i].s8Recess, j, 8, getRecToothInputType, chartNum);
                    }
                }
                listPDStateObj[j] = pdStateObj;
            }
        }
    }
    return listPDStateObj;
}

export function filterPerioChartView(list1, list2, type, toogle2, action) {
    let i;
    for (i = 0; i < list1.length; i++) {
        if (!toogle2) {
            document.getElementById(type + "_" + list1[i]).style.display = action;
        } else {
            if (!list2.includes(list1[i])) {
            document.getElementById(type + "_" + list1[i]).style.display = action;
            }
        }
    }
}

export function clearnTthPRDataDto(pcTthDto) {
    pcTthDto.s1IsBleed = 0;
    pcTthDto.s1Pocket = "NIL";
    pcTthDto.s2IsBleed = 0;
    pcTthDto.s2Pocket = "NIL";
    pcTthDto.s3IsBleed = 0;
    pcTthDto.s3Pocket = "NIL";
    pcTthDto.s4IsBleed = 0;
    pcTthDto.s4Pocket = "NIL";
    pcTthDto.s5IsBleed = 0;
    pcTthDto.s5Pocket = "NIL";
    pcTthDto.s6IsBleed = 0;
    pcTthDto.s6Pocket = "NIL";
    return pcTthDto;
}

export function dateJavaToJS(dt) {
    let chartDT = new Date(dt);
    let getchartDTMonth = chartDT.getMonth() < 12 ? chartDT.getMonth() + 1 : 1;
    return chartDT.getDate() + "/" + getchartDTMonth + "/" + chartDT.getUTCFullYear();
}

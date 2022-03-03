
export const preBPEInputId = "assessment-bpe-input";
export const prePCAInputId = "assessment-pca-input";

export const preBPESelectId = "assessment-bpe-select";
export const prePCASelectId = "assessment-pca-select";

export const assessmentUUID = "assessment-uuid";

export const getDtoClcDtpDetlObj = {
    seq : 0,
    bpe : "",
    codPlaqueCtrlId : 0,
    isFurcation : 0
};

export const getDtoClcDtpObj = {
    clcDtpId : 0,
    encntrId : 0,
    codCariesRiskId : 0,
    codPerioRiskId : 0,
    codOralHygieneId : 0,
    codInterDentalId : 0,
    clcDtpDetlDto : [],
    createBy : ""
};

export const getMonth_s = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const pcaInputData_upper = [
    {value:"10418", label:"B"}, 
    {value:"10419", label:"P"}, 
    {value:"10421", label:"I"}, 
    {value:"10422", label:"BP"}, 
    {value:"10424", label:"BI"}, 
    {value:"10425", label:"PI"}, 
    {value:"10427", label:"BPI"}
];

export const pcaInputData_lower = [
    {value:"10559", label:"B"}, 
    {value:"10560", label:"L"}, 
    {value:"10561", label:"I"}, 
    {value:"10562", label:"BL"}, 
    {value:"10563", label:"BI"}, 
    {value:"10564", label:"LI"}, 
    {value:"10565", label:"BLI"}
];

export const cariesSelData = [
    {value:"", label:""}, 
    {value:"10404", label:"Low"}, 
    {value:"10405", label:"Moderate"}, 
    {value:"10406", label:"High"}, 
    {value:"10407", label:"Extreme"}, 
    {value:"10787", label:"NA"}
];

export const perioSelData = [
    {value:"", label:""}, 
    {value:"10408", label:"Low"}, 
    {value:"10409", label:"Moderate"}, 
    {value:"10410", label:"High"}, 
    {value:"10788", label:"NA"}
];

export const ohSelData = [
    {value:"", label:""}, 
    {value:"10412", label:"Good"}, 
    {value:"10413", label:"Fair"}, 
    {value:"10414", label:"Poor"}
];

export const idSelData = [
    {value:"", label:""}, 
    {value:"10415", label:"Good"}, 
    {value:"10416", label:"Fair"}, 
    {value:"10417", label:"Poor"}
];

export function getCariesLalByVal(val) {
    let i;
    for (i = 0; i < cariesSelData.length; i++) {
        if (cariesSelData[i].value === val) { return cariesSelData[i].label; }
    }
    return "";
}

export function getPerioLalByVal(val) {
    let i;
    for (i = 0; i < perioSelData.length; i++) {
        if (perioSelData[i].value === val) { return perioSelData[i].label; }
    }
    return "";
}

export function getPcaInputValByLab(lab, type) {
    let i;
    if (type === "upper") {
        for (i = 0; i < pcaInputData_upper.length; i++) {
            if (pcaInputData_upper[i].label === lab) { return pcaInputData_upper[i].value; }
        }
    } else {
        for (i = 0; i < pcaInputData_lower.length; i++) {
            if (pcaInputData_lower[i].label === lab) { return pcaInputData_lower[i].value; }
        }
    }
    return "";
}

export function getPcaInputLabByVal(val, type) {
    let i;
    if (type === "upper") {
        for (i = 0; i < pcaInputData_upper.length; i++) {
            if (pcaInputData_upper[i].value === val) { return pcaInputData_upper[i].label; }
        }
    } else {
        for (i = 0; i < pcaInputData_lower.length; i++) {
            if (pcaInputData_lower[i].value === val) { return pcaInputData_lower[i].label; }
        }
    }
    return "";
}

export function chkPcaInputLab(val, type) {
    let i;
    if (type === "upper") {
        for (i = 0; i < pcaInputData_upper.length; i++) {
            if (pcaInputData_upper[i].label === val) { return true; }
        }
    } else {
        for (i = 0; i < pcaInputData_lower.length; i++) {
            if (pcaInputData_lower[i].label === val) { return true; }
        }
    }
    return false;
}

export function chkPCAInputVal(val, type) {
    return chkPcaInputLab(val, type) ? val : "";
}

export function chkBPEInputVal(val) {
    let res;
    if (val.length === 1) {
        res = ((parseInt(val) >= 0 && parseInt(val) <= 4) || val === "N") ? val : "";
    } else if (val.length === 2) {
        res = (val.charAt(1) === "*" || val.charAt(1) === "A") ? val : "";
    } else {
        res = "";
    }
    return res;
}

export function getNextInputId(id) {
    let ids = id.split('_');
    let nId = "";
    if (ids[0] === prePCAInputId && parseInt(ids[1]) < 6) {
        nId = prePCAInputId + "_" + (parseInt(ids[1]) + 1);
    } else if (ids[0] === prePCAInputId && parseInt(ids[1]) === 6) {
        nId = "select-" + prePCASelectId + "_1";
    } else if (ids[0] === "select-" + prePCASelectId && parseInt(ids[1]) === 1) {
        nId = "select-" + prePCASelectId + "_2";
    } else if (ids[0] === "select-" + prePCASelectId && parseInt(ids[1]) === 2) {
        nId = preBPEInputId + "_1";
    } else if (ids[0] === preBPEInputId && parseInt(ids[1]) < 6) {
        nId = preBPEInputId + "_" + (parseInt(ids[1]) + 1);
    } else if (ids[0] === preBPEInputId && parseInt(ids[1]) === 6) {
        nId = "select-" + preBPESelectId + "_1";
    } else if (ids[0] === "select-" + preBPESelectId && parseInt(ids[1]) === 1) {
        nId = "select-" + preBPESelectId + "_2";
    } else {
        nId = id;
    }
    return nId;
}

export function chkSelEmpty(val) {
    if (val === "undefined" || val === "" || val === null || val === 0 || isNaN(val)) {
        return true;
    }
    return false;
}

export function chkInEmpty(str) {
    if (str === undefined || str === "" || str === null) {
        return true;
    }
    return false;
}


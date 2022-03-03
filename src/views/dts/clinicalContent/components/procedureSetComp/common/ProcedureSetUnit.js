export const getProcedureSetPrefixId = 'procedureSet-box-div';

export const listProcedureSetType = [{value:"GD", label:"GD"}];

export const procCmnSet = [{value:"", label:""}];

export const procTermCncpt = [{name:"", id:"", serviceId: ""}];

export const dbProcId = "2";
export const selToothQlfId = "TDS00000000095";
export const chkSupernumeraryQlfId = "TDS00000000087";
export const preProcDetailId = "procedureSet-textArea-detail-";

export const clcQlfDto = {
    "clcEncntrId": 0,
    "clcQlfList": [[]],
    "dentalChartRemark": "",
    "isCheckDup": true,
    "mapType": "",
    "patientKey": 0,
    "patientProcedureId": 0,
    "probProc": "",
    "probProcDetail": "",
    "probProcIndx": "",
    "probProcTermDesc": "",
    "sdt": "2020-10-07T08:19:54.059Z",
    "surfaceSel": [],
    "toothSel": [],
    "toothToSel": "string"
};

export function chkArr(arr) {
    return (typeof arr !== 'undefined' && arr.length > 0);
}

export function getQlfVIdInStateId(str) {
    let rec = str.split("_");
    return rec[1];
}

export function toUrlDateTime(str) {
    let dt = str.split("T");
    let nDate = dt[0];
    let time = dt[1].split(":");
    return nDate + "T" + time[0] + "%3A" + time[1] + "Z";
}

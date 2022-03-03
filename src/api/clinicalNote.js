
import request from 'services/request';

export async function API_requestRecordType() {
  return request('clinical-note/codeList/ClinicalNoteType', {method:'get'});
}

export async function API_getClinicalNote(params) {
  let {encounterId,patientKey,userRoleType} = params;
  return request(`clinical-note/clinicalNote/${patientKey}/${encounterId}/${userRoleType}`, {method:'get'});
}

export async function API_getMedicalRecordNotesList(params) {
  let {encounterId,patientKey,recordType,selectedServiceCd,userRoleType} = params;
  return request(`clinical-note/clinicalNote/medicalRecordNotes/${patientKey}/${encounterId}/${recordType}/${selectedServiceCd}/${userRoleType}`, {method:'get'});
}

export async function API_getAmendmentHistoryList(params) {
  let {doctorNoteId,serviceNoteId} = params;
  return request(`clinical-note/clinicalNote/clinicalNotesLogs/${doctorNoteId}/${serviceNoteId}`, {method:'get'});
}

export async function API_listClinicalNoteTemplates(params) {
  let {curServiceCd, userLogName} = params;
  return request(`clinical-note/clinicalNoteTemplate/${curServiceCd}/${userLogName}`, {method:'get'});
}

export async function API_getCopyData(params) {
  let {copyType, patientKey, encounterId} = params;
  return request(`previousDataCopies/${copyType}/${patientKey}/${encounterId}`, {method:'get'});
}

// export async function API_getSysConfigValueByKey(params) {
//   let {key} = params;
//   return request(`clinical-note/clinicalNote/sysConfig/${key}`, {method:'get'});
// }

// export async function API_getSysConfig() {
//   return request('clinical-note/sysConfig/', {method:'get'});
// }

export async function API_requestFavouriteList() {
  return request('clinical-note/codeList/clinicalNoteTmplType', {method:'get'});
}

export async function API_requestTemplateList(params) {
  let {clinicalNoteTmplType} = params;
  return request(`clinical-note/clinicalNoteTemplate/${clinicalNoteTmplType}`, {method:'get'});
}

export async function API_deleteTemplateData(params) {
  return request('clinical-note/clinicalNoteTemplate/', {method:'delete',data:params});
}

export async function API_recordTemplateData(params) {
  return request('clinical-note/clinicalNoteTemplate/reorder', {method:'post',data:params});
}

export async function API_addTemplateData(params) {
  return request('clinical-note/clinicalNoteTemplate/', {method:'post',data:params});
}

export async function API_editTemplateData(params) {
  return request('clinical-note/clinicalNoteTemplate/', {method:'put',data:params});
}

export async function API_saveClinicalNote(params) {
  return request('clinical-note/clinicalNote/', {method:'post',data:params});
}

export async function API_saveRecordDetail(params) {
  return request('clinical-note/clinicalNote/', {method:'put',params});
}

export async function API_deleteRecordDetail(params) {
  return request('clinical-note/clinicalNote/', {method:'delete',data:params});
}
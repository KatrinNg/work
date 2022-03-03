import request from 'services/request';

export async function API_getMessageListByAppId(params) {
  let {encounterId} = params;
  return request(`assessment/getAssessmentForClinicalNote/${encounterId}`, {method:'get'});
}
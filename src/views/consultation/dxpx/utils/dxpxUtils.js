import _ from 'lodash';
import accessRightEnum from '../../../../enums/accessRightEnum';

// check duplication by service favorite
export function checkDuplicationByServiceFavorite(origin,selections) {
  let flag = false;
  if (origin.length>0&&selections.length>0) {
    for (let i = 0; i < selections.length; i++) {
      const selectionObj = selections[i];
      let index = _.findIndex(origin,originObj=>{
        return originObj.encounterId === selectionObj.encounterId&&originObj.codeTermId === selectionObj.codeTermId&&selectionObj.codeTermId !== '-9999';
      });
      if (index !== -1) {
        flag = true;
        break;
      }
    }
  }
  return flag;
}

// check duplication by copy historical problem or procedure
export function checkDuplicationByCopyHistory(origin,selection) {
  let flag = false;
  if (origin.length>0) {
    let index = _.findIndex(origin,originObj=>{
      return originObj.encounterId === selection.encounterId&&originObj.codeTermId === selection.codeTermId&&selection.codeTermId !== '-9999';
    });
    if (index !== -1) {
      flag = true;
    }
  }
  return flag;
}

// check duplication from chronic problem
export function checkDuplicationFromChronicProblem(origin,selections) {
  let flag = false;
  if (origin.length>0&&selections.length>0) {
    for (let i = 0; i < selections.length; i++) {
      const selectionObj = selections[i];
      let index = _.findIndex(origin,originObj=>{
        return originObj.codeTermId === selectionObj.codeTermId&&selectionObj.codeTermId !== '-9999';
      });
      if (index !== -1) {
        flag = true;
        break;
      }
    }
  }
  return flag;
}

export function checkProblemProcedurePrivileges(accessRights) {
  let problemEnquiryMode = false, procedureEnquiryMode = false;
  if (accessRights.length>0) {
    let problemFlag = _.findIndex(accessRights, rightItem => rightItem.name === accessRightEnum.privilegeProblemEnquiryMode);
    let procedureFlag = _.findIndex(accessRights, rightItem => rightItem.name === accessRightEnum.privilegeProcedureEnquiryMode);

    problemEnquiryMode = problemFlag!==-1? true: false;
    procedureEnquiryMode = procedureFlag!==-1? true: false;
  }
  return { problemEnquiryMode, procedureEnquiryMode };
}
import * as type from '../../../actions/IOE/laboratoryReport/laboratoryReportActionType';

const INIT_STATE = {
  laboratoryReportList:[],
  patientInfo:null,
  patientInfoByClinic:null,
  patientInfoByClinicCaseNo:{}
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    // case type.PUT_IOE_LABORATORY_REPORT_LIST:{
    //   return{
    //     ...state,
    //     laboratoryReportList:action.fillingData
    //   };
    // }
    case type.PUT_PATINET_INFOMATION:{
      return{
        ...state,
        patientInfo:action.fillingData
      };
    }
    case type.PUT_PATINET_INFOMATIONINFO:{
      return{
        ...state,
        patientInfoByClinic: action.fillingData,
        patientInfoByClinicCaseNo: action.caseListData
      };
    }
    default:
      return state;
  }
};
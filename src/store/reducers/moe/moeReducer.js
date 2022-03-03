import * as types from '../../actions/moe/moeActionType';
import * as prescriptionUtilities from '../../../utilities/prescriptionUtilities';
import moment from 'moment';
import Enum from '../../../enums/enum';

const inital_state = {
   isLoginSuccess: false,
   ifLogin: sessionStorage.getItem('moeIfLogin') || false,
   loginName: sessionStorage.getItem('moeLoginName') || null,
   loginTime: sessionStorage.getItem('moeLoginTime') || null,
   loginInfo: sessionStorage.getItem('moeLoginInfo') !== null ? JSON.parse(sessionStorage.getItem('moeLoginInfo')) : null,
   actionCd: sessionStorage.getItem('moeActionCd') || null,
   errorMessage: '',
   errorData: null,
   codeList: [],
   searchData: [],
   drugList: [],
   orderNo: 0,
   backDate: '',
   orderData: null,
   isSaveSuccess: null,
   saveMessageList: [],
   mdsList: [],
   isExistCache: false,

   //mark prescription panel status
   //  selectedPrescriptionIndex: null,
   selectedPrescriptionItem: null,
   showDetail: false,

   //duplication drug dialog
   duplicateDrugList: [],
   openDuplicateDialog: false,
   selectedDeletedList: [],
   specialIntervalText: [],
   maxDosage: null,
   allergyChecking: null,
   disDuplicateDrugList: null,
   existDrugList: null,
   moeOriginData: null
};

export default (state, action) => {
   if (!state) state = inital_state;
   switch (action.type) {
      case types.LOGIN_SUCCESS: {
         // action.data.user.actionCd='editWithRemark';//for test
         // let moeLoginTime = moment(new Date().getTime()).format('DD-MMM-YYYY, HH:mm');
         let moeLoginTime = moment(new Date().getTime()).format(Enum.DATE_FORMAT_24_HOUR);
         window.sessionStorage.setItem('moeIfLogin', true);
         window.sessionStorage.setItem('moeLoginName', action.data.user.loginName);
         window.sessionStorage.setItem('moeLoginTime', moeLoginTime);
         window.sessionStorage.setItem('moeLoginInfo', JSON.stringify(action.data));
         window.sessionStorage.setItem('moeActionCd', action.data.user.actionCd);
         window.sessionStorage.setItem('moeHospSetting', JSON.stringify(action.hospSetting));

         return {
            ...state,
            loginInfo: action.data,
            loginName: action.data.login_name,
            loginTime: moeLoginTime,
            isLoginSuccess: true,
            ifLogin: true,
            codeList: action.codeList,
            backDate: action.data.user.backDate,
            actionCd: action.data.user.actionCd,
            hospSetting: action.hospSetting
         };
      }
      case types.RELOGIN_SUCCESS: {
         window.sessionStorage.setItem('moeActionCd', action.data.user.actionCd);
         return {
            ...state,
            actionCd: action.data.user.actionCd
         };
      }
      case types.LOGIN_ERROR: {
         return {
            ...state,
            errorMessage: action.errMsg,
            isLoginSuccess: false
         };
      }
      case types.SEARCH_DRUG_LIST: {
         let data = prescriptionUtilities.getSearchResult(action.data);
         return {
            ...state,
            searchData: data
         };
      }
      case types.SEARCH_ITEM_COLLAPSE: {
         const { item } = action;
         let { searchData } = { ...state };
         let filterObj = searchData.find(n => n.parentId === item.parentId);
         filterObj.open = !item.open;
         return {
            ...state,
            searchData
         };
      }
      case types.CODE_LIST: {
         return {
            ...state,
            codeList: action.data
         };
      }
      case types.DELETE_DRUG: {
         let drugList = state.drugList;
         const index = drugList.findIndex(item => item.parentId === action.item.parentId && item.childId === action.item.childId);
         drugList.splice(index, 1);
         return {
            ...state,
            drugList: drugList
         };
      }
      case types.RESET_DRUG_LIST: {
         // return {
         //    ...state,
         //    drugList: [],
         //    actionCd: null
         // };
         return inital_state;
      }
      case types.GET_ORDER_DRUG_LIST: {
         let { data } = action;
         let drugList = data;
         return {
            ...state,
            drugList: drugList
         };
      }
      case types.CONVERT_DRUG:
      case types.DELETE_ORDER: {
         return {
            ...state
         };
      }
      case types.UPDATE_FIELD: {
         let lastState = { ...state };
         for (let m in action.updateData) {
            lastState[m] = action.updateData[m];
         }
         return lastState;
      }
      case types.SPECIAL_INTERVAL_TEXT: {
         return {
            ...state,
            specialIntervalText: action.data
         };
      }
      case types.DELETE_ORDER_SUCCESS: {
         // let { orderData } = { ...state };
         // orderData.moeOrder.ordNo = 0;
         return {
            ...state,
            drugList: [],
            orderData: null
         };
      }
      case types.TOTAL_DANGER_DRUG: {
         return {
            ...state,
            maxDosage: action.data.maxDosage
         };
      }
      case types.ALLERGY_CHECKING: {
         return {
            ...state,
            allergyChecking: action.data
         };
      }
      case types.UPDATE_MDS_ENQUIRY: {
         return {
            ...state,
            mdsList: action.data.allergenGroups
         };
      }
      case types.UPDATE_PATIENT_ALLERGY_INF: {
         return {
            ...state,
            patientAllergyList: prescriptionUtilities.transferJsonToArr(action.data.patientAllergies),
            patientAlertList: prescriptionUtilities.transferJsonToArr(action.data.patientAlerts),
            patientAdrsList: prescriptionUtilities.transferJsonToArr(action.data.patientAdrs)
         };
      }
      case types.UPDATE_HLAB1502_VTM: {
         return {
            ...state,
            hlab1502VtmList: action.data
         };
      }
      case types.UPDATE_PATIENT_ALLERGY_CONNECTED_FLAG: {
         return {
            ...state,
            patientAllergyConnectedFlag: action.data
         };
      }
      default:
         return { ...state };
   }
};
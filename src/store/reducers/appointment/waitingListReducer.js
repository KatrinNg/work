import * as types from '../../actions/appointment/waitingList/waitingListActionType';
import _ from 'lodash';
import moment from 'moment';
import * as patientUtilities from '../../../utilities/patientUtilities';
import * as WaitingListUtil from '../../../utilities/waitingListUtilities';
import Enum from '../../../enums/enum';
import {
   patientPhonesBasic
} from '../../../constants/registration/registrationConstants';
import {
   waitDetailBasic
} from '../../../constants/appointment/waitingList/waitingListConstants';

const INITAL_STATE = {
   encounterTypeList: [],
   dateFrom: moment().subtract(1, 'months'),
   dateTo: moment(),
   encounterType: '*ALL',
   status: Enum.WAITING_LIST_STATUS_LIST[3].value,
   docTypeList: [],
   docType: '*ALL',
   HKID: '',
   engSurname: '',
   engGivenname: '',
   phone: '',
   openSearchDialog: false,
   waitingList: {},
   editWaitingStatus: 'I',
   clinicList: [],
   patientList: [],
   waiting: {},
   patientSearchParam: {
      searchType: '',
      searchValue: ''
   },
   contactPhone: _.cloneDeep(patientPhonesBasic),
   // waitingPatDetail: _.cloneDeep(waitDetailBasic)
   waitDetail: _.cloneDeep(waitDetailBasic),
   handlingSearch: false,
   autoFocus: false,
   isEnableCrossBookClinic: false,
   waitingListAllRoleListConfig: {},
   waitingListSiteId: 0,
   dateType: '',
   supervisorsApprovalDialogInfo: {
      open: false,
      staffId: ''
   }
};


function initWaitData(siteId = 0, encntrTypeId = 0) {
   const waitDetail = _.cloneDeep(waitDetailBasic);
   const contactPhone = _.cloneDeep(patientPhonesBasic);
   if (siteId !== 0) {
      waitDetail.siteId = siteId;
   }
   if (encntrTypeId !== 0) {
      waitDetail.encntrTypeId = encntrTypeId;
   }
   return { waitDetail, contactPhone };
}

export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
   switch (action.type) {
      case types.UPDATE_FIELD: {
         return {
            ...state,
            ...action.fields
         };
      }
      case types.ADD_WAITING: {
         const waitData = initWaitData();
         return {
            ...state,
            editWaitingStatus: 'A',
            ...waitData
         };
      }
      case types.EDIT_WAITING: {
         let waitData = WaitingListUtil.transferWaitData(action.waiting[0]);
         return {
            ...state,
            editWaitingStatus: 'E',
            ...waitData
         };
      }
      case types.CANCEL_EDIT_WAITING: {
         const waitData = initWaitData();
         return {
            ...state,
            ...waitData,
            editWaitingStatus: 'I',
            handlingSearch: false
         };
      }
      case types.PUT_SEARCH_PATIENT_LIST: {
         const patientResult = patientUtilities.getPatientSearchResult(action.data && action.data.patientDtos, action.countryList);
         let waitDetail = _.cloneDeep(state.waitDetail);
         waitDetail.patientKey = (patientResult[0] && patientResult[0].patientKey) || 0;
         return {
            ...state,
            patientList: patientResult,
            waitDetail,
            handlingSearch: false
         };
      }
      case types.SAVE_SUCCESS:
      case types.DELETE_SUCCESS: {
         const waitData = initWaitData();
         return {
            ...state,
            ...waitData,
            editWaitingStatus: 'I'
         };
      }
      case types.RESET_ALL: {
         return _.cloneDeep({ ...INITAL_STATE, dateFrom: moment().subtract(1, 'months'), dateTo: moment() });
      }

      case types.RESET_WAIT_DETAIL: {
         const waitData = initWaitData(action.siteId, action.encntrTypeId);
         return {
            ...state,
            ...waitData
         };
      }

      default:
         return { ...state };
   }
};
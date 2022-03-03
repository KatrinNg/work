import * as types from '../../actions/message/messageActionType';
import { openCommonMessage, closeCommonMessage} from '../../actions/message/messageAction';
import moment from 'moment';
import { isNull, isUndefined, find, cloneDeep, replace } from 'lodash';

const INIT_SATE = {
  openMessageDialog: false,
  openSnackbar: false,
  commonMessageList: [],
  commonMessageDetail: {},
  commonMessageSnackbarDetail: {},
  openSnackbarAndDialog: false,
  spaFuncTypes: types,
  openCommonMessage,
  closeCommonMessage
};

const ERROR_MESSAGE = {
  MESSAGE_LIST_EMPTY:{
    applicationId: 1,
    functionId: 999,
    operationId: 1,
    severityCode: 'I',
    messageCode: '199901',
    description: 'The message list is empty. Please refresh the page.',
    cause: null,
    actionView: null,
    btn1Caption: 'OK',
    btn2Caption: null,
    btn3Caption: null,
    effective: null,
    expiry: null,
    action: null,
    header: 'Message Warning'
  },
  MESSAGE_NOT_FOUND:{
    applicationId: 1,
    functionId: 999,
    operationId: 2,
    severityCode: 'I',
    messageCode: '199902',
    description: 'The message code(%msgCode%) cannot be found in the message list.',
    cause: null,
    actionView: 'Please contact system admin.',
    btn1Caption: 'OK',
    btn2Caption: null,
    btn3Caption: null,
    effective: null,
    expiry: null,
    action: null,
    header: 'Message Warning'
  }
};

let handleMessageParams = (msgDetail, params) => {
  let {
    header = null,
    description = null,
    cause = null,
    actionView = null
  } = msgDetail;

  let [tempHeader, tempDesc, tempCause, tempAction] = [header, description, cause, actionView];
  if (params.length > 0) {
    params.forEach(paramObj => {
      let reg = new RegExp(`%${paramObj.name}%`, 'g');
      tempHeader = !isNull(tempHeader) ? replace(tempHeader, reg, paramObj.value) : tempHeader;
      tempDesc = !isNull(tempDesc) ? replace(tempDesc, reg, paramObj.value) : tempDesc;
      tempCause = !isNull(tempCause) ? replace(tempCause, reg, paramObj.value) : tempCause;
      tempAction = !isNull(tempAction) ? replace(tempAction, reg, paramObj.value) : tempAction;
    });
  }
  msgDetail.header = tempHeader;
  msgDetail.description = tempDesc;
  msgDetail.cause = tempCause;
  msgDetail.actionView = tempAction;
};


export default (state = INIT_SATE, action = {}) => {
  switch (action.type) {
    case types.COMMON_MESSAGE_LIST: {
      return { ...state, commonMessageList: action.commonMessageList };
    }
    case types.STR_COMMON_MESSAGE: {
      let { msgCode, msgObj = null, params = [] } = action.payload;
      let tempObj = {};
      if (!isNull(msgObj)) {
        tempObj = msgObj;
      } else {
        if (state.commonMessageList.length === 0) {
          tempObj = ERROR_MESSAGE.MESSAGE_LIST_EMPTY;
        } else {
          let tempDetail = find(state.commonMessageList, item => {
            return msgCode === item.messageCode;
          });
          if (isUndefined(tempDetail)) {
            tempObj = ERROR_MESSAGE.MESSAGE_NOT_FOUND;
            params = [
              {name:'msgCode',value:msgCode}
            ];
          } else {
            tempObj = cloneDeep(tempDetail);
          }
        }
      }
      handleMessageParams(tempObj, params);
      let newObj = {
        ...tempObj
      };
      return{
        ...state,
        commonMessageDetail: newObj
      };
    }

    case types.OPEN_COMMON_MESSAGE: {
      let { msgCode, showMsgCode = true, showSnackbar = false, openSnackbarAndDialog = false, msgObj = null, params = [], btn1AutoClose=true, btn1Disabled=false, btn2AutoClose=true, btn2Disabled=false, btn3AutoClose=true,  btn3Disabled=false, disableEnforceFocus=false, btnActions, setDescription,variant } = action.payload;
      let tempObj = {};
      if (!isNull(msgObj)) {
        tempObj = msgObj;
      } else {
        //validate commonMessageList
        if (state.commonMessageList.length === 0) {
          tempObj = ERROR_MESSAGE.MESSAGE_LIST_EMPTY;
        } else {
          let tempDetail = find(state.commonMessageList, item => {
            return msgCode === item.messageCode;
          });
          //validate msgObj
          if (isUndefined(tempDetail)) {
            tempObj = ERROR_MESSAGE.MESSAGE_NOT_FOUND;
            params = [
              {name:'msgCode',value:msgCode}
            ];
          } else {
            tempObj = cloneDeep(tempDetail);
          }
        }
      }

      let { effective = null, expiry = null } = tempObj;
      let startDate = !isNull(effective) ? moment(effective).valueOf() : null,
        endDate = !isNull(expiry) ? moment(expiry).valueOf() : null,
        currentDate = moment().valueOf();
      let timeCheck = true;
      if (isNull(startDate) && isNull(endDate)) {
        timeCheck = false;
      }
      //handle params
      handleMessageParams(tempObj, params);
      let newObj = {
        ...tempObj,
        ...btnActions,
        setDescription,
        showMsgCode,
        btn1AutoClose,
        btn1Disabled,
        btn2AutoClose,
        btn2Disabled,
        btn3AutoClose,
        btn3Disabled,
        disableEnforceFocus
      };
      if (!timeCheck) {
        if(openSnackbarAndDialog) {
          return {
            ...state,
            variant,
            openMessageDialog: true,
            openSnackbar: true,
            commonMessageSnackbarDetail: newObj,
            commonMessageDetail: newObj
          };
        }else if (showSnackbar) {
          return {
            ...state,
            variant,
            openMessageDialog: false,
            openSnackbar: true,
            commonMessageSnackbarDetail: newObj
          };
        } else {
          return {
            ...state,
            openMessageDialog: true,
            openSnackbar: false,
            commonMessageDetail: newObj
          };
        }
      } else {
        const startPass = !isNull(startDate) ? startDate <= currentDate : true;
        const endPass = !isNull(endDate) ? currentDate < endDate : true;
        if (startPass && endPass) {
          if(openSnackbarAndDialog) {
            return {
              ...state,
              variant,
              openMessageDialog: true,
              openSnackbar: true,
              commonMessageSnackbarDetail: newObj,
              commonMessageDetail: newObj
            };
          }else if (showSnackbar) {
            return {
              ...state,
              variant,
              openMessageDialog: false,
              openSnackbar: true,
              commonMessageSnackbarDetail: newObj
            };
          } else {
            return {
              ...state,
              openMessageDialog: true,
              openSnackbar: false,
              commonMessageDetail: newObj
            };
          }
        } else {
          return {
            ...state
          };
        }
      }
    }
    case types.CLOSE_COMMON_MESSAGE: {
      return {
        ...state,
        openMessageDialog: false,
        openSnackbar: false,
        openSnackbarAndDialog: false
      };
    }
    case types.CLEAN_COMMON_MESSAGE_DETAIL: {
      return {
        ...state,
        openMessageDialog: false,
        commonMessageDetail: {}
      };
    }
    case types.CLEAN_COMMON_MESSAGE_SNACKBAR_DETAIL: {
      return {
        ...state,
        openSnackbar: false
        // commonMessageSnackbarDetail: {}
      };
    }
    default:
      return state;
  }
};

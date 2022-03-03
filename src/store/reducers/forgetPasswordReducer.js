import * as types from '../actions/forgetPassword/forgetPasswordActionType';
import CommonMessage from '../../constants/commonMessage';

const INITAL_STATE = {
   loginId: '',
   dialog: {
      open: false,
      title: '',
      contentText: ''
   },
   loginName: '',
   verifierLoginName: '',
   verifierPassword: ''
};

export default (state = INITAL_STATE, action = {}) => {
   switch (action.type) {
      case types.UPDATE_FIELD: {
         return {
            ...state,
            ...action.field
         };
      }
      case types.SEND_SUCCESS: {

         return {
            ...state,
            dialog: {
               open: true,
               title: CommonMessage.FORGET_PASSWORD_DIALOG_SUCCESS_TITLE(),
               contentText: CommonMessage.FORGET_PASSWORD_DIALOG_SUCCESS_CONTENT_TEXT() + ' ' + state.loginName
            }
         };
      }
      case types.SEND_FAILURE: {

         return {
            ...state,
            dialog: {
               open: true,
               title: CommonMessage.FORGET_PASSWORD_DIALOG_FAILURE_TITLE(),
               contentText: action.errMsg
            }
         };
      }
      case types.RESET_ALL: {
         return {
            ...INITAL_STATE
         };
      }
      default:
         return { ...state };
   }
};
import * as types from '../actions/hkic/hkicActionType';

const INITAL_STATE = {
   file: null,
   openDownloadDailog: false,
   openLodingDailog: false,
   fileBlob: null,
   activeStep: 0,
   errorMessage: null,
   fileName: '',
   doCloseCallBack: null
};

export default (state = INITAL_STATE, action = {}) => {
   switch (action.type) {
      case types.DEFAULT: {
         return {
            ...INITAL_STATE
         };
      }
      case types.UPLOAD_FILE: {
         return {
            ...state,
            file: action.file,
            activeStep: 1,
            errorMessage: action.errorMessage
         };
      }
      case types.CONCERT: {
         return {
            ...state,
            openLodingDailog: action.openLodingDailog,
            file: action.file,
            activeStep: 2
         };
      }
      case types.CANCEL_UPLOAD: {
         return {
            ...state,
            openLodingDailog: action.openLodingDailog,
            activeStep: 1
         };
      }
      case types.UPLOAD_SUCCESS: {
         return {
            ...state,
            openLodingDailog: false,
            openDownloadDailog: true,
            fileBlob: action.fileBlob,
            fileName: action.fileName
         };
      }
      case types.UPLOAD_FAILED: {
         return {
            ...state,
            openLodingDailog: false,
            openDownloadDailog: false,
            errorMessage: action.errorMessage,
            activeStep: 1
         };
      }
      case types.DOWNLOAD: {
         return {
            ...state,
            openDownloadDailog: action.openDownloadDailog,
            fileBlob: action.fileBlob
         };
      }
      case types.EXIT: {
         return {
            ...state,
            openDownloadDailog: action.openDownloadDailog,
            fileBlob: action.fileBlob,
            activeStep: 1
         };
      }
      case types.UPDATE_STATE: {
         return {
            ...state,
            ...action.updateData
         };
      }
      default:
         return { ...state };
   }
};
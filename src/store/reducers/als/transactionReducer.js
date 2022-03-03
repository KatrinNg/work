import * as transactionActionTypes from '../../actions/als/transactionActionType';
import moment from 'moment';

const initState = {
  transactionId: null,
  transactionControl: 0,
  spaFuncTypes: transactionActionTypes
};

function makeid(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default (state = initState, action = {}) => {
  switch (action.type) {
    case transactionActionTypes.ALS_TRANS_START: {
      let newTransactionId = state.transactionId;
      if(newTransactionId === null){
        newTransactionId = moment().format('YYYYMMDDHHmmssSSS') + makeid(5);
      }
      return {
        ...state,
        transactionId: newTransactionId,
        transactionControl: state.transactionControl + 1
      };
    }

    case transactionActionTypes.ALS_TRANS_PUT_ID: {
      return {
        ...state,
        transactionId: action.transId
      };
    }

    case transactionActionTypes.ALS_TRANS_END: {
      let newTransactionControl = Math.max(0, state.transactionControl - 1);
      let newTransactionId = state.transactionId;
      if (newTransactionControl === 0) {
        newTransactionId = null;
      }
      return {
        ...state,
        transactionId: newTransactionId,
        transactionControl: newTransactionControl
      };

    }
    default: {
      return state;
    }
  }
};
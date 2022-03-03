import * as transactionActions from './transactionActionType';

export const alsStartTrans = () => {
  return {
    type: transactionActions.ALS_TRANS_START
  };
};

export const alsPutTrans = (transId) => {
  return {
    type: transactionActions.ALS_TRANS_PUT_ID,
    transId: transId
  };
};


export const alsEndTrans = () => {
  return {
    type: transactionActions.ALS_TRANS_END
  };
};
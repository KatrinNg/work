import { put, select, takeEvery} from 'redux-saga/effects';
import * as transactionActionTypes from '../../actions/als/transactionActionType';
import * as logAction from '../../actions/als/logAction';

function* removeLogHistoryIfTransactionEnded(){
    yield takeEvery(transactionActionTypes.ALS_TRANS_END, function*(action){
        let transactionState = yield select(state => state.alsTransaction);
        if(transactionState.transactionControl === 0){
            yield put(logAction.clearHistory());
        }
    });
}

export const alsTransactionSaga = [removeLogHistoryIfTransactionEnded];
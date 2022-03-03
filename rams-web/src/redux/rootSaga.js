import { all } from 'redux-saga/effects'
import * as PatientDetail from './patientDetail/sage.js';
import * as globalDetail from './global/sage.js';
import * as summary from './summary/sage.js';
import * as dashboard from './dashboard/sage.js';
import * as calendar from './calendar/saga.js';
import * as adminmode from './adminmode/sage';
import * as batchMode from './batchMode/saga';

export default function* rootSaga() {
  yield all([
    PatientDetail.watchers(),
    globalDetail.watchers(),
    summary.watchers(),
    dashboard.watchers(),
    calendar.watchers(),
    adminmode.watchers(),
    batchMode.watchers()
  ])
}
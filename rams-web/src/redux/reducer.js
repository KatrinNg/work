import { combineReducers } from 'redux';
import message from './message/reducer';
import patientDetail from './patientDetail/reducer';
import patientSummary from './summary/reducer';
import tabRouter from './tabRouter/reducer';
import global from './global/reducer';
import dashboard from './dashboard/reducer';
import calendar from './calendar/reducer';
import adminmode from './adminmode/reducer';
import batchMode from './batchMode/reducer'

const rootReducer = combineReducers({
    message: message,
    patientDetail: patientDetail,
    tabRouter: tabRouter,
    global: global,
    patientSummary,
    dashboard,
    calendar,
    adminmode,
    batchMode
});

export default rootReducer;
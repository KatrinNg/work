import patientDetail from './patientDetail';
import global from './global';
import summary from './summary';
import calender from './calendar';
import dashboard from './dashboard';
import adminMode from './adminMode';
import batchMode from './batchMode';
class APICall {
    patientDetail = patientDetail;
    global = global;
    summary = summary;
    calender = calender;
    dashboard = dashboard;
    adminMode = adminMode;
    batchMode = batchMode;
}

export default new APICall();

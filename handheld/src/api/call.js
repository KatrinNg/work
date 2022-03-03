import patientDetail from './patientDetail'
import login from './login'
import room from './room'
import scene from './scene'
import group from './group'
import activity from './activity'

class APICall {
    patientDetail = patientDetail;
    login = login;
    room = room;
    scene = scene;
    group = group;
    activity = activity
}

export default new APICall();

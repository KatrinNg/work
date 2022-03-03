import { combineReducers } from 'redux';
import loginInfo from './loginInfo/reducer'
import detail from './detail/reducer'
import group from './group/reducer'
import activity from './activity/reducer'
import scene from './scene/reducer'
import room from './room/reducer'
import global from './global/reducer'
const rootReducer = combineReducers({
    loginInfo,
    detail,
    group,
    activity,
    scene,
    room,
    global,
});

export default rootReducer;
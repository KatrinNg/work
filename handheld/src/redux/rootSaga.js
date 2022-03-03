import { all } from 'redux-saga/effects'
import * as PatientDetail from './detail/sage.js';
import * as loginInfo from './loginInfo/sage';
import * as group from './group/sage';
import * as scene from './scene/saga';
import * as room from './room/saga'


export default function* rootSaga() {
  yield all([
    PatientDetail.watchers(),
    loginInfo.watchers(),
    group.watchers(),
    scene.watchers(),
    room.watchers()
  ])
}
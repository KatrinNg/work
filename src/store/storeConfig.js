import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import rootReducer from './reducers/rootReducer';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage/session';
import rootSaga from './sagas/rootSaga';
import mongoDB from '../middleware/mongoDBOps';
import {createAlsMiddleware, actionTypeToActionDescMaps} from './alsMiddleware/actionToAlsActionDescMiddleware';

const sagamiddleware = createSagaMiddleware();
const alsMiddleware = createAlsMiddleware(actionTypeToActionDescMaps);

const storageConfig = {
  key: 'root',
  storage: storage,
  blacklist: [
    'patient',
    'booking',
    'bookingInformation',
    'bookingAnonymousInformation',
    'attendance',
    'userAccount',
    'userProfile',
    'userRole',
    'generateTimeSlot',
    'consultation',
    'registration',
    'clinicalNote',
    'timeslotTemplate',
    'editTimeSlot',
    'timeslotPlan',
    'prescription',
    'appointmentSlipFooter',
    'encounterTypeManagement',
    'enctManagement',
    'assessment',
    'medicalSummary',
    'sickLeave',
    'maternity',
    'moeMyFavourite',
    'moeDrugHistory',
    'calendarView',
    'message',
    'yellowFever',
    'referralLetter',
    'attendanceCert',
    'publicHoliday',
    'patientSpecFunc',
    'departmentFavourite',
    'eyes',
    'feet',
    'apptEnquiry',
    'caseNo',
    'backTakeAttendacne',
    'ecs',
    'dtsAppointmentBooking',
    'saamPatient',
    'sessionManagement',
    'reportTemplate',
    'redistribution',
    'doc',
    'certificateEform',
    'ehsSpaControl',
    'timeslotManagementV2'
  ]
};

function configureStore(initState = {}) {
  const middlewares = [thunk, alsMiddleware, sagamiddleware, mongoDB];
  const createStoreMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreMiddleware(
    persistReducer(storageConfig, rootReducer),
    initState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  sagamiddleware.run(rootSaga);
  store.close = () => store.dispatch(END);
  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./reducers/rootReducer').default;
      store.replaceReducer(
        persistReducer(storageConfig, rootReducer(nextRootReducer))
      );
    });
  }
  const persistor = persistStore(store);
  return { store, persistor };
}
const storeConfig = configureStore();
export default storeConfig;

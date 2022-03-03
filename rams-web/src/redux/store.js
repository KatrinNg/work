import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducer.js';
import rootSaga from './rootSaga.js';

const sagaMiddleware = createSagaMiddleware();
const store = compose(
    applyMiddleware(sagaMiddleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : compose
)(createStore)(rootReducer);

export const safeSaga = (func) => {
    return function* (args) {
        try {
            yield* func(args);
        } catch (error) {
            console.log('162112 index.js error', error);
            // yield put(setSagaError({ saga: func.name, args, error }));
        }
    };
};


export const getStore = () => {
    return store;
};


export default store;

sagaMiddleware.run(rootSaga);
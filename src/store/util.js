import storeConfig from './storeConfig';

export function getState(callback) {
    try {
        if (storeConfig) {
            if (storeConfig.store) {
                const state = storeConfig.store.getState();
                return callback(state);
            }
        }
        return undefined;
    } catch (e) {

        return undefined;
    }
}

export function dispatch(params){
    if (storeConfig && storeConfig.store){
        storeConfig.store.dispatch(params);
    }
}
import storeConfig from './store/storeConfig';
import doCloseFuncSrc from './constants/doCloseFuncSrc';
import accessRightEnum from './enums/accessRightEnum';
class GlobalEventDistributor {

    constructor(parentStore) {
        this.stores = {};
        this.parentStore = parentStore;
        this.sourceSystem = 'cims-frontend-app';
        this.doCloseFuncSrc = doCloseFuncSrc;
        this.accessRightEnum = accessRightEnum;
    }

    subscribe(childDivId, childStore) {
        this.stores[childDivId] = childStore;
    }

    unsubscribe(childDivId) {
        if(this.stores[childDivId]){
            delete this.stores[childDivId];
        }
    }

    parentDispatch(type, payload) {
        this.parentStore.dispatch({
            type: 'PARENT_DISPATCH',
            payload: {
                type,
                payload
            }
        });
    }

    childDispatch(childDivId, type, payload){
        if(this.stores[childDivId]){
            this.stores[childDivId].dispatch({
                type: 'CHILD_DISPATCH',
                payload: {
                    type,
                    payload
                }
            });
        }
    }
}
export const globalEventDistributor = new GlobalEventDistributor(storeConfig.store);
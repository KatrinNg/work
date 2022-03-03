import * as singleSpa from 'single-spa'; // waiting for this to be merged: https://github.com/CanopyTax/single-spa/pull/156
import storeConfig from './store/storeConfig';
import * as SystemJS from './libs/system';
import { EHS_SHARED_COMPONENT_SPA_CONFIG } from './enums/enum';

export function hashPrefix(prefix) {
    return function (location) {
        return location.hash.startsWith(`#${prefix}`);
    };
}

 export function storeContain(appId) {
     return function (location) {
        // always mount ehs_shared_component_spa for EHS Service
        if (appId === EHS_SHARED_COMPONENT_SPA_CONFIG.accessRightCd) {
            console.log('needMount ' + appId + ': ' + true + ', location: ' + location, singleSpa.getMountedApps());
            return true;
        }

        let needMount = false;
        const parentTabs = storeConfig.store.getState().mainFrame.tabs;
        for (let i = 0; i < parentTabs.length; i++) {
            if(parentTabs[i].name == appId){
                // const mountedSpa = singleSpa.getMountedApps();
                // if(mountedSpa.indexOf(nameId) > -1) {
                //     needMount = false;
                // } else {
                //     needMount = true;
                // }
                needMount = true;
                break;
            }
        }

        const subTabs = storeConfig.store.getState().mainFrame.subTabs;
        for (let i = 0; i < subTabs.length; i++) {
            if(subTabs[i].name == appId) {
                needMount = true;
                break;
            }
        }

     	// console.log('needMount ' + appId + ': '+ needMount + ', location: ' + location, singleSpa.getMountedApps());
        return needMount;
     };
 }

 export async function loadApp(appId, nameId, appURL, storeURL, globalEventDistributor, callback) {
 	let storeModule = {}, customProps = { globalEventDistributor: globalEventDistributor };

     // try to import the store module
     try {
        storeModule = storeURL ? await SystemJS.import(storeURL) : {storeInstance : null};
     } catch (e) {
         console.log(`Could not load store of app ${nameId}.`, e);
     }

     console.log(storeModule);
     if (storeModule.storeInstance && globalEventDistributor) {
         customProps.store = storeModule.storeInstance;
         console.log('subscribe spa: ' + nameId);
         globalEventDistributor.subscribe(nameId, storeModule.storeInstance);
     } else if (storeModule.default && storeModule.default.store && storeModule.default.persistor && globalEventDistributor) {
         customProps.store = storeModule.default.store;
         customProps.persistor = storeModule.default.persistor;

         globalEventDistributor.subscribe(nameId, storeModule.default.store);
         console.log('subscribe spa: ' + nameId);
         console.log('store added ' + storeModule.default.store);
     }

     singleSpa.registerApplication(nameId, () => SystemJS.import(appURL), storeContain(appId), customProps);
     if(typeof callback === 'function')callback();
 }
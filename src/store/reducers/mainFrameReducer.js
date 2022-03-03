import * as types from '../actions/mainFrame/mainFrameActionType';
import _ from 'lodash';
import * as CommonUtilities from '../../utilities/commonUtilities';
import { deleteTabs, deleteSubTabs, addTabs, updateCurTab, updateRefreshTabFunc, closePatientRelativeTabs, updateCallEsProblemFun, updateCallScnProblemFun, skipTab, updateEsPrintParams } from '../actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../enums/accessRightEnum';

const INITAL_STATE = {
    tabs: [],
    tabsActiveKey: '',
    subTabs: [],
    subTabsActiveKey: '',
    updateCurTabCloseFunc: null,
    updateCurTabRefreshFunc: null, // Added by Renny refresh ES when click menu
    closePatientRelativeTabs: null, // Added by Renny close all subTabs exclude excludeTabs
    curCloseTabMethodType: null,
    deleteTabs: null,
    deleteSubTabs: null,
    addTabs: null,
    skipTab: null,
    editModeTabs: [],
    maskFunctions: [],
    runDoClose: CommonUtilities.runDoClose,
    callEsProblemFun: null,
    callScnProblemFun: null,
    goEsPrint: null
};

export function getActivityKeyAfterDelete(currentKey, deleteKey, tabArray, newTabArray) {
    let finalKey = currentKey;
    if (currentKey === deleteKey) {
        let tabIndex = tabArray.findIndex(item => item.name === currentKey);
        if (newTabArray.length - 1 < tabIndex) {
            tabIndex = newTabArray.length - 1;
        }
        return newTabArray[tabIndex].name;
    }
    return finalKey;
}

export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
    switch (action.type) {
        case types.UPDATE_FIELD: {
            return {
                ...state,
                ...action.updateData
            };
        }
        case types.PUT_ADD_TABS: {
            return { ...action.newState };
        }
        case types.REFRESH_SUB_TABS: {
            let newState = { ...state };
            let subTab = {
                name: action.params.name,
                label: action.params.label,
                component: action.params.name,
                disableClose: action.params.disableClose,
                params: action.params.params,
                deep: 2
            };
            newState.subTabs = [subTab];
            newState.subTabsActiveKey = subTab.name;
            return newState;
        }
        case types.CLEAN_SUB_TABS: {
            let newState = { ...state };
            newState.subTabs = [];
            newState.subTabsActiveKey = '';
            return newState;
        }
        case types.CHANGE_TABS_ACTIVE: {
            if (parseInt(action.deep) === 1) {
                return { ...state, tabsActiveKey: action.key };
            } else if (parseInt(action.deep) === 2) {
                return { ...state, tabsActiveKey: accessRightEnum.patientSpec, subTabsActiveKey: action.key };
            } else {
                return { ...state };
            }
        }
        case types.CHANGE_EDIT_MODE: {
            let newState = { ...state };
            let index = newState.editModeTabs.findIndex(item => item.name === action.params.name);
            if (index === -1 && action.params.isEdit) {
                newState.editModeTabs.push(action.params);
                // newState.editModeTabs.push(action.params.name);
            } else if (index !== -1 && !action.params.isEdit) {
                newState.editModeTabs.splice(index, 1);
            }
            return newState;
        }
        case types.UPDATE_TAB_LABEL: {
            let tabs = _.cloneDeep(state.tabs);
            let subTabs = _.cloneDeep(state.subTabs);
            let tabIndex = tabs.findIndex(item => item.name === action.accessRightCd);
            if (tabIndex > -1) {
                tabs[tabIndex]['label'] = action.newLabel;
            } else {
                let subTabIndex = subTabs.find(item => item.name === action.accessRightCd);
                if (subTabIndex > -1) {
                    subTabs[subTabIndex]['label'] = action.newLabel;
                }
            }
            return {
                ...state,
                tabs: tabs,
                subTabs: subTabs
            };
        }
        case types.CLEAN_TAB_PARAMS: {
            let tabs = _.cloneDeep(state.tabs);
            let tabIndex = tabs.findIndex(item => item.name === action.tabName);
            if (tabIndex > -1) {
                tabs[tabIndex]['params'] = null;
            }

            let subTabs = _.cloneDeep(state.subTabs);
            let subTabIndex = subTabs.findIndex(item => item.name === action.tabName);
            if (subTabIndex > -1) {
                subTabs[subTabIndex]['params'] = null;
            }
            return {
                ...state,
                tabs: tabs,
                subTabs: subTabs
            };
        }
        case types.RESET_ALL: {
            return _.cloneDeep(INITAL_STATE);
        }

        case types.UPDATE_CURRENT_TAB: {
            let { name, doCloseFunc } = action;
            let newState = { ...state };
            let curTab = null;
            if ([newState.tabsActiveKey, 'F120', 'F144'].includes(name)) {
                curTab = newState.tabs.find(item => item.name === name);
            }
            if (!curTab &&  [newState.subTabsActiveKey, 'F120', 'F144'].includes(name)) {
                curTab = newState.subTabs.find(item => item.name === name);
            }
            if (curTab) {
                if (!doCloseFunc) curTab.doCloseFunc = null;
                if (typeof doCloseFunc === 'function') curTab.doCloseFunc = doCloseFunc;
            }
            return newState;
        }

        case types.UPDATE_REFRESH_TAB_FUNC: {
            let { tabName, refreshTabFunc } = action;
            let newState = { ...state };
            let curTab = null;
            if ([newState.tabsActiveKey, 'F120', 'F144'].includes(tabName)) {
                curTab = newState.tabs.find(item => item.name === tabName);
            }
            if (!curTab &&  [newState.subTabsActiveKey, 'F120', 'F144'].includes(tabName)) {
                curTab = newState.subTabs.find(item => item.name === tabName);
            }
            if (curTab) {
                if (typeof refreshTabFunc === 'function') curTab.refreshTabFunc = refreshTabFunc;
            }
            return newState;
        }

        case types.UPDATE_MASK_FUNCTIONS: {
            let maskFunctions = _.cloneDeep(action.maskFunctions);
            return {
                ...state,
                maskFunctions
            };
        }

        case types.UPDATE_TABS: {
            const { newObjs } = action;
            let tabs = state.tabs, subTabs = state.subTabs;
            for (let key in newObjs) {
                let name = key;
                let newObj = newObjs[key];
                let tabInd = state.tabs.findIndex(x => x.name === name);
                let subTabInd = state.subTabs.findIndex(x => x.name === name);
                if (tabInd !== -1) {
                    tabs[tabInd] = { ...tabs[tabInd], ...newObj };
                }
                if (subTabInd !== -1) {
                    subTabs[subTabInd] = { ...subTabs[subTabInd], ...newObj };
                }
            }
            return {
                ...state,
                tabs,
                subTabs
            };
        }

        case types.UPDATE_ES_PRINT_PARAMS: {
            let goEsPrint = action.callback;
            return {
                ...state,
                goEsPrint
            };
        }

        case types.UPDATE_CALL_ES_PROBLEM_API: {
            let callEsProblemFun = action.callback;
            return {
                ...state,
                callEsProblemFun
            };
        }

        case types.UPDATE_CALL_SCN_PROBLEM_API: {
            let callScnProblemFun = action.callback;
            return {
                ...state,
                callScnProblemFun
            };
        }

        default:
            state.updateCurTabCloseFunc = updateCurTab;
            state.updateCurTabRefreshFunc = updateRefreshTabFunc;
            state.deleteTabs = deleteTabs;
            state.deleteSubTabs = deleteSubTabs;
            state.addTabs = addTabs;
            state.updateCallEsProblemFun = updateCallEsProblemFun;
            state.updateCallScnProblemFun = updateCallScnProblemFun;
            state.skipTab = skipTab;
            state.updateEsPrintParams = updateEsPrintParams;
            state.closePatientRelativeTabs = closePatientRelativeTabs; // Added by Renny close all subTabs exclude excludeTabs
            return { ...state };
    }
};

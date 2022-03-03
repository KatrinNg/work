import { ADD_TAB, CLOSE_TAB, SWITCH_TAB_TO } from '../actions/menuBarActionType';
const initialState = {
    tabs: {},
    activeTab: {},
    patientTabSeq: []
    /*
    {
        tabId: string,
        subPath: string[],

    }
     */
};

const addTab = (state, action) => {
    console.log(action);
    let { tabDivId, subNavPath } = action.payload;
    let newTab = {
        tabId: tabDivId,
        subPath: [subNavPath]
    };

    if (state.tabs[tabDivId] !== undefined) {
        newTab = { ...state.tabs[tabDivId] };
        newTab.subPath = [subNavPath, ...newTab.subPath.filter((subTabId) => subTabId !== subNavPath)];
    }

    return {
        tabs: {
            ...state.tabs,
            [tabDivId]: newTab
        },
        activeTab: { tabDivId, subNavPath },
        patientTabSeq: [{ tabDivId, subNavPath }, ...state.patientTabSeq.filter((patientTabObj) => patientTabObj.tabDivId !== tabDivId && patientTabObj.subNavPath !== subNavPath)]
    };
};

const closeTab = (state, action) => {
    let { tabDivId, subNavPath } = action.payload;
    if (state.tabs[tabDivId] !== undefined) {
        let newTab = { ...state.tabs[tabDivId] };
        newTab.subPath = newTab.subPath.filter((str) => str !== subNavPath);
        if (newTab.subPath.length > 0) {
            return {
                ...state,
                tabs: {
                    ...state.tabs,
                    [tabDivId]: newTab
                }
            };
        }
    }

    let _newTab = {
        ...state.tabs
    };

    delete _newTab[tabDivId];

    return {
        ...state,
        tabs: {
            ..._newTab
        }
    };
};

const switchTabTo = (state, action) => {
    let { tabDivId, subNavPath } = action.payload;
            return {
                ...state,
                tabs: {
                    ...state.tabs
                },
                activeTab: { tabDivId, subNavPath }
            };
};

export default (state = initialState, action = {}) => {
    switch (action.type) {

        case ADD_TAB:
            return addTab(state, action);
        case CLOSE_TAB:
            return closeTab(state, action);
        case SWITCH_TAB_TO:
            return switchTabTo(state, action);
        default:
            return state;
    }
};
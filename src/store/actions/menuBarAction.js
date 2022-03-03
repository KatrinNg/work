import {ADD_TAB, CLOSE_TAB, SWITCH_TAB_TO} from './menuBarActionType';

export const addTab = ({tabDivId, subNavPath}) => {
    console.log(tabDivId);
    console.log(subNavPath);
    return {
        type: ADD_TAB,
        payload: {
            tabDivId,
            subNavPath
        }
    };
};

export const closeTab = ({tabDivId, subNavPath}) => {
    return {
        type: CLOSE_TAB,
        payload: {
            tabDivId,
            subNavPath
        }
    };
};

export const switchTabTo = ({tabDivId, subNavPath}) => {
    return {
        type: SWITCH_TAB_TO,
        payload: {
            tabDivId,
            subNavPath
        }
    };
};
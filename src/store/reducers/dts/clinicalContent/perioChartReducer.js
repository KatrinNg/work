import * as perioChartActionType from '../../../actions/dts/clinicalContent/perioChartActionType';

const initState = {
    blnPerioChartCallBack: false,
    arrPerioChartDataCollection: []
};

export default (state = initState, action = {}) => {
    
    switch (action.type) {
        case perioChartActionType.SET_PERIOCHART_CALLBACK: {
            let lastAction = {...state};
            lastAction.blnPerioChartCallBack = action.params;

            return lastAction;
        }
        case perioChartActionType.RESET_PERIOCHART_CALLBACK: {
            let lastAction = {...state};
            lastAction.blnPerioChartCallBack = false;

            return lastAction;
        }
        case perioChartActionType.PERIOCHART_DATA_COLLECTION: {
            return {
                ...state,
                arrPerioChartDataCollection: action.params
            };
        }
        case perioChartActionType.SET_PERIOCHART_DATA_COLLECTION: {
            let lastAction = {...state};
            for(let p in action.params) {
                lastAction.arrPerioChartDataCollection[p] = action.params[p];
            }
            return lastAction;
        }
        case perioChartActionType.RESET_PERIOCHART_DATA_COLLECTION: {
            let lastAction = {...state};
            lastAction.arrPerioChartDataCollection = [];

            return lastAction;
        }
        default: {
            return state;
        }
    }

};
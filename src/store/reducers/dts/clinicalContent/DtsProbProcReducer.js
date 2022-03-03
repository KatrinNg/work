import * as problemProcedureActionType from '../../../actions/dts/clinicalContent/problemProcedureActionType';
import _ from 'lodash';

const INITIAL_STATE = {
    commonUsedProbProcList: [],
    qualifierList: undefined,
    selectedMulQualifier: [],
    cmnTermIndx: -1

};

export default (state = _.cloneDeep(INITIAL_STATE), action = {}) => {
    switch (action.type) {
        case problemProcedureActionType.RESET_ALL: {
            return _.cloneDeep({ INITIAL_STATE });
        }
        case problemProcedureActionType.UPDATE_STATE: {
            //console.log('Info4: ' + action.updateData);
            return {
                ...state,
                ...action.updateData
            };
        }
        case problemProcedureActionType.UPDATE_QUALIFIER_STATE: {
            //console.log('Info5: ' + action.updateQualifierData);
            return {
                ...state,
                ...action.updateQualifierData
            };
        }
        case problemProcedureActionType.UPDATE_PROB_PROC_ADD_DETAILS_STATE: {
            return {
                ...state,
                ...action.updateProbProcAddDetailsData
            };
        }
        case problemProcedureActionType.UPDATE_SAVE_STATE: {
            console.log('Info6: ', action.updateSaveResultData);
            return {
                ...state,
                ...action.updateSaveResultData
            };
        }
        case problemProcedureActionType.RESET_SELECTED_VAL: {
            console.log('cmnTermIndx');
            return {
                ...state,
                selectedMulQualifier:[],
                cmnTermIndx: -1,
                qualifierList:undefined    
            };
        }
        default:
            return state;
        
    }

};
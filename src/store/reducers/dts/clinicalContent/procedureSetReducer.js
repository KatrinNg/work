import * as procedureSetActionType from '../../../actions/dts/clinicalContent/procedureSetActionType';

const initState = {
    procedureCommonSet: [],
    procedureQualifier: [],
    procedureSetGroup: [],
    updateProcedureQaulifierResult: ""
};

export default (state = initState, action = {}) => {
    
    switch (action.type) {
        case procedureSetActionType.PROCEDURE_COMMON_SET: {
            return {
                ...state,
                procedureCommonSet: action.params
            };
        }
        case procedureSetActionType.PROCEDURE_QUALIFIER: {
            return {
                ...state,
                procedureQualifier: action.params
            };
        }
        case procedureSetActionType.PROCEDURE_SET_GROUP: {
            return {
                ...state,
                procedureSetGroup: action.params
            };
        }
        case procedureSetActionType.UPDATE_PROCEDURE_QUALIFIER_RESULT: {
            return {
                ...state,
                updateProcedureQaulifierResult: action.params
            };
        }
        default: {
            return state;
        }
    }

};
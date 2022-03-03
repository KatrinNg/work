import * as prescriptionActionTypes from '../../../actions/consultation/prescription/prescriptionActionType';
import * as prescriptionUtilities from '../../../../utilities/prescriptionUtilities';

const inital_state = {
    searchData: [],
    codeList: [],
    drugList: []
};

export default (state = inital_state, action = {}) => {
    switch (action.type) {
        case prescriptionActionTypes.SEARCH_DRUG_LIST: {
            let data = prescriptionUtilities.getSearchResult(action.data);
            return {
                ...state,
                searchData: data
            };
        }
        case prescriptionActionTypes.GET_DRUG: {
            let { item, childItem, searchValue } = action;
            let prescriptionData = {};
            let drugList = state.drugList;
            if (item) {
                prescriptionData = prescriptionUtilities.getSelectedPrescriptionData(item, childItem);
            } else {
                // prescriptionData.drugName = searchValue;
                prescriptionData.displayString = searchValue;
                prescriptionData.freeText = true;
            }
            prescriptionData.id = drugList.length ==='' ? 1 : drugList.length + 1;
            drugList.push(prescriptionData);
            return {
                ...state,
                drugList: drugList
            };
        }
        case prescriptionActionTypes.SEARCH_ITEM_COLLAPSE: {
            const { item } = action;
            let { searchData } = { ...state };
            let filterObj = searchData.find(n => n.parentId === item.parentId);
            filterObj.open = !item.open;
            return {
                ...state,
                searchData
            };
        }
        case prescriptionActionTypes.CODE_LIST: {
            return {
                ...state,
                codeList: action.data
            };
        }
        case prescriptionActionTypes.DELETE_DRUG: {
            let drugList = state.drugList;
            const index = drugList.findIndex(item => item.parentId === action.item.parentId && item.childId===action.item.childId);
            drugList.splice(index, 1);
            return {
                ...state,
                drugList: drugList
            };
        }
        case prescriptionActionTypes.RESET_DRUG_LIST:{
            // return{
            //     ...state,
            //     drugList:[]
            // };
            return inital_state;
        }
        case prescriptionActionTypes.UPDATE_FIELD:{
            let { name, value } = action;
            let updateField = {};
            updateField[name]=value;
            return {
                ...state,
                ...updateField
            };
        }
        default: return state;
    }
};
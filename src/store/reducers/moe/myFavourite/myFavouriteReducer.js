
import * as moeActionTypes from '../../../actions/moe/moeActionType';

const inital_state = {
    myFavouriteList: [],
    myFavouriteListFromBackend: [],

    //delete my favourite
    // showDeleteDialog: false,
    // deleteParentItem: null,
    // deleteChildItem: null,

    showDugSetDialog: false,

    drugSet: null,

    favKeyword: '',

    //edit panel start
    showEditPanel: false,
    curDrugDetail: null,
    drugSetItem: null,
    isSaveSuccess: false,
    saveMessageList: [],
    maxDosage: null,
    openDuplicateDialog: false,
    selectedDeletedList: [],
    duplicateDrugList: []
    //edit panel end
};

export default (state, action) => {
    if (!state) state = inital_state;
    switch (action.type) {
        case moeActionTypes.UPDATE_MY_FAVOURITE_FIELD: {
            let lastState = { ...state };
            for (let m in action.updateData) {
                lastState[m] = action.updateData[m];
            }
            return lastState;
        }
        case moeActionTypes.RESET_DRUG_LIST: {
            // return {
            //     ...state,
            //     myFavouriteList: [],
            //     showDugSetDialog: false
            // };
            return inital_state;
        }
        case moeActionTypes.UPDATE_FAV_SCHINPUTVAL: {
            let newState = { ...state };
            newState.favKeyword = action.params.favKeyword;
            return newState;
        }
        default: return state;
    }
};
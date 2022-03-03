import * as familyNoActionType from '../../actions/familyNo/familyNoActionType';

const initState = { isSearchDialogOpen: false, isDialogOpen: false, familyData: [] };

export default (state = initState, action) => {
    switch (action.type) {
        case familyNoActionType.RESET_DATA:
            return initState;
        case familyNoActionType.UPDATE_STATE: {
            return {
                ...state,
                ...action.payload
            };
        }
        case familyNoActionType.DIALOG_TOGGLE: {
            return {
                ...state,
                isDialogOpen: !state.isDialogOpen
            };
        }
        default:
            return state;
    }
};

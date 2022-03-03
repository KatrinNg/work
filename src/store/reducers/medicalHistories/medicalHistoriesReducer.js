import * as actionType from '../../actions/medicalHistories/medicalHistoriesActionType';

const INIT_STATE = {
  socialHistoryType: {
    smokingId: null,
    drinkingId: null,
    substanceAbuseId: null
  },
  activeTab: null
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case actionType.SET_SOCIAL_DROPDOWN_LSIT:{
      return{
        ...state,
        socialHistoryType:action.socialHistoryType
      };
    }
    case actionType.SAVE_MEDICAL_HISTORY_ACTIVE_TAB: {
      return {
        ...state,
        activeTab: action.activeTab
      };
    }
    default:
      return state;
  }
};
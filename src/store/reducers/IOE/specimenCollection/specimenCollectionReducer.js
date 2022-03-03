import * as specimenCollectionActionType from '../../../actions/IOE/specimenCollection/specimenCollectionActionType';

const INIT_STATE = {
  specimenCollectionList: []
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case specimenCollectionActionType.IOE_SPECIMEN_COLLECTION_LIST:{
      return{
        ...state,
        specimenCollectionList:action.specimenCollectionList
      };
    }
    default:
      return state;
  }
};
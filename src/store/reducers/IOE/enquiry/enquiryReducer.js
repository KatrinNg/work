import * as actionTypes from '../../../actions/IOE/enquiry/enquiryActionType';

const initState = {
  forms:[],
  patients:[],
  services:[],
  clinics:[]
};

export default (state = initState, action = {}) => {
  switch (action.type) {
    case actionTypes.setState:{
      return{
        ...state,
        ...action.payload
      };
    }
    default:
      return state;
  }
};

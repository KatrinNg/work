import * as actionType from './officerInChargeActionType';

export const getOfficerDoctorDropdownList = ({params={},callback}) => {
  return {
    type: actionType.GET_OFFICER_DOCTOR_DROPDOWN_LIST,
    params,
    callback
  };
};

export const saveOfficerDoctorList = ({params={},callback}) => {
    return {
      type: actionType.SAVE_OFFICER_DOCTOR_LIST,
      params,
      callback
    };
  };



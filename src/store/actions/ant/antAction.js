import * as actionType from './antActionType';

export const getAnServiceId=({ params = {}, callback }) => {
  return {
    type: actionType.GET_AN_SERVICEID,
    params,
    callback
  };
};
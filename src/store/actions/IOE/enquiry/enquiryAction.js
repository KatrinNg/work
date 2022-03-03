import * as enquiryActionType from './enquiryActionType';

// for temporary test
export const requestClinic = ({params={},callback}) => {
  return {
      type: enquiryActionType.REQUEST_ENQUIRY_CLINIC,
      params,
      callback
  };
};

export const getOrderDetails = ({params={},callback}) => {
  return {
      type: enquiryActionType.REQUEST_ORDER_DETAILS,
      params,
      callback
  };
};

// //获取Enquery Laboratory Report/Request
// export const getFormList= ({params={},callback}) => {
//   return {
//     type:enquiryActionType.getFormList,
//     params,
//     callback
//   };
// };

export const insertEnquiryLogInfo = ({ params = {}, callback }) => {
  return {
    type: enquiryActionType.INSERT_ENQUIRY_LOG,
    params,
    callback
  };
};
import * as Type from './imageViewerType';
  export const getRadEaxamData = ({ params = {}, callback }) => {
    return {
      type: Type.GET_RAD_EXAM_DATA,
      params,
      callback
    };
  };
  export const getRadorderByModalityTypes = ({ params = {}, callback }) => {
    return {
      type: Type.SAVE_RADORDER_BY_MODALITY_TYPES,
      params,
      callback
    };
  };
  export const  saveRadExamData= ({ params = {}, callback }) => {
    return {
      type: Type.SAVE_RAD_EXAM_DATA,
      params,
      callback
    };
  };
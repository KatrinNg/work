import * as specimenCollectionActionType from './specimenCollectionActionType';

export const getIoeSpecimenCollectionList = ({params={},callback}) => {
  return {
    type: specimenCollectionActionType.GET_IOE_SPECIMEN_COLLECTION_LIST,
    params,
    callback
  };
};

export const saveIoeSpecimenCollectionList = ({params={},callback}) => {
  return {
    type: specimenCollectionActionType.SAVE_IOE_SPECIMEN_COLLECTION_LIST,
    params,
    callback
  };
};

export const getIoeSpecimenCollectionTemplsForReport = ({params={},callback}) => {
  return {
    type: specimenCollectionActionType.GET_IOE_SPECIMEN_COLLECTION_TEMPLS_FOR_REPORT,
    params,
    callback
  };
};


export const printIoeSpecimenCollectionReminderReport = ({param={},callback}) => {
  return {
    type: specimenCollectionActionType.PRINT_IOE_SPECIMEN_COLLECTION_REMINDER_REPORT,
    param,
    callback
  };
};


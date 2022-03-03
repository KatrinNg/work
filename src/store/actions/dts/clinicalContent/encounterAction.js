import * as encounterActionType from './encounterActionType';
import * as clinicalNoteTypes from '../../clinicalNote/clinicalNoteActionType';

export const setRedirect = params => {
    return {
        type: encounterActionType.SET_REDIRECT,
        params
    };
};

export const updateEncounter = (params, callback = null, maskMode = false) => {
    return {
        type:encounterActionType.UPDATE_ENCOUNTER,
        params,
        callback,
        maskMode
    };
};

export const updatePractitioner = (params, callback = null, maskMode = false) => {
    return {
        type:encounterActionType.UPDATE_PRACTITIONER,
        params,
        callback,
        maskMode
    };
};


export const getEncounter = params => {
    return {
        type: encounterActionType.GET_ENCOUNTER,
        params
    };
};

export const getLatestEncounter = (params, callback = null) => {
    return {
        type: encounterActionType.GET_LATEST_ENCOUNTER,
        params,
        callback
    };
};

export const getNoteByEncounter = (params, callback = null) => {
    return {
        type: clinicalNoteTypes.GET_NOTE_BY_ENCOUNTER,
        params,
        callback
    };
};

export const saveClinicalNote = (params, callback = null) => {
    return {
        type: clinicalNoteTypes.SAVE_CLINICAL_NOTE,
        params,
        callback
    };
};

export const getRoomList = params => {
    return {
        type: encounterActionType.GET_ROOM_LIST,
        params
    };
};

export const getEncounterTypeList = params => {
    return {
        type: encounterActionType.GET_ENCOUNTER_TYPE_LIST,
        params
    };
};

export const setSelectedEncounterType = params => {
    return {
        type: encounterActionType.SET_SELECTED_ENCOUNTER_TYPE,
        params
    };
};

export const resetAll = () => {
    return {
        type: encounterActionType.RESET_ALL
    };
};

export const resetDirectEncounterDialog = () => {
    return {
        type: encounterActionType.RESET_DIRECT_ENCOUNTER_DIALOG
    };
};

export const getPatientAppointment = (params) => {
    return {
        type: encounterActionType.GET_PATIENT_APPOINTMENT,
        params
    };
};

export const insertEncounter =(params, callback = null) => {
    return {
        type: encounterActionType.INSERT_ENCOUNTER,
        params,
        callback
    };
};

export const getProblemAndQualifier = (params)=> {
  return {
      type: encounterActionType.GET_PROBLEM_AND_QUALIFER,
      params

  };
};

export const getProceduresAndQualifiers = (params)=> {
  return {
      type: encounterActionType.GET_PROCEDURES_AND_QUALIFERS,
      params

  };
};

export const getMedicialHistorySnapshotByEncounter = (params, callback = null)=> {
  return {
        type: encounterActionType.GET_MEDICIAL_HISTORY_SNAPSHOT_BY_ENCOUNTER,
        params,
        callback
  };
};

export const createMedicialHistorySnapshot = (params, callback = null)=> {
    return {
          type: encounterActionType.CREATE_MEDICIAL_HISTORY_SNAPSHOT,
          params,
          callback
    };
};

export const updateMedicialHistorySnapshot = (params, callback = null)=> {
    return {
          type: encounterActionType.UPDATE_MEDICIAL_HISTORY_SNAPSHOT,
          params,
          callback
    };
};

export const getCarryForwardData = (params, callback = null)=> {
  return {
      type: encounterActionType.GET_CARRY_FORWARD_DATA,
      params,
      callback

  };
};

export const getMedicialHistoryRfi = (params, callback = null)=> {
    return {
          type: encounterActionType.GET_MEDICIAL_HISTORY_RFI,
          params,
          callback
    };
  };

  export const createMedicialHistoryRfi = (params, callback = null)=> {
    return {
          type: encounterActionType.CREATE_MEDICIAL_HISTORY_RFI,
          params,
          callback
    };
};

export const getNotesAndProcedures = (params)=> {
  return {
      type: encounterActionType.GET_NOTES_AND_PROCEDURES,
      params

  };
};

export const getDoseInstruction = (params, callback = null) => {
    return {
        type: encounterActionType.GET_DOSEINSTRUCTION,
        params,
        callback

    };
};

export const getLoginUserInfo = (params, callback = null) => {
    return {
        type: encounterActionType.GET_LOGIN_USERINFO,
        params,
        callback

    };
};
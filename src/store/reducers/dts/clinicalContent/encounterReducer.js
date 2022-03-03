import * as encounterActionType from '../../../actions/dts/clinicalContent/encounterActionType';
import _ from 'lodash';

const initState = {

    latestEncounter: [],
    roomList: [],
    encounterTypeList: [],
    selectedEncounterType: {},
    patientAppointmentList: [],
    problemQualifierList: [],
    proceduresQualifiersList: [],
    carryFowardDataList: [],
    notesAndProceduresList:[],
    userLoginInfo:[]


};

export default (state = initState, action = {}) => {

    switch (action.type) {

        case encounterActionType.GET_LATEST_ENCOUNTER_SAGA: {

            //  let lastAction = { ...state };
            // lastAction.latestEncounter = action.latestEncounter;
            // return lastAction;

            let lastAction = { ...state };
            for (let p in action.latestEncounter) {
                lastAction[p] = action.latestEncounter[p];
            }
            return lastAction;


        }
        case encounterActionType.GET_ROOM_LIST_SAGA: {
            let lastAction = { ...state };
            for (let p in action.roomList) {
                lastAction[p] = action.roomList[p];
            }
            return lastAction;
        }
          case encounterActionType.GET_ENCOUNTER_TYPE_LIST_SAGA: {
            let lastAction = { ...state };
            for (let p in action.encounterTypeList) {
                lastAction[p] = action.encounterTypeList[p];
            }
            return lastAction;
        }
        case encounterActionType.SET_SELECTED_ENCOUNTER_TYPE: {
            let lastAction = { ...state };
            lastAction['selectedEncounterType'] = action.params.encounterType;
            return lastAction;
        }
        case encounterActionType.RESET_ALL: {
            return {
                ...state,
                latestEncounter: [],
                roomList: [],
                selectedEncounterType:{},
                encounterTypeList:[]
            };
        }
        case encounterActionType.RESET_DIRECT_ENCOUNTER_DIALOG: {

              return {
                ...state,
                selectedEncounterType:{},
                encounterTypeList:[]
            };
        }

        case encounterActionType.GET_PATIENT_APPOINTMENT_SAGA: {
            let lastAction = { ...state };
            for (let p in action.patientAppointmentList) {
                lastAction[p] = action.patientAppointmentList[p];
            }
            return lastAction;
        }
         case encounterActionType.GET_PROBLEM_AND_QUALIFER_SAGA: {
            let lastAction = { ...state };
            for (let p in action.problemQualifierList) {
                lastAction[p] = action.problemQualifierList[p];
            }
            return lastAction;
        }
        case encounterActionType.GET_PROCEDURES_AND_QUALIFERS_SAGA: {
            let lastAction = { ...state };
            for (let p in action.proceduresQualifiersList) {
                lastAction[p] = action.proceduresQualifiersList[p];
            }
            return lastAction;
        }
        case encounterActionType.GET_CARRY_FORWARD_DATA_SAGA: {
            let lastAction = { ...state };
            for (let p in action.carryFowardDataList) {
                lastAction[p] = action.carryFowardDataList[p];
            }
            return lastAction;
        }
         case encounterActionType.GET_NOTES_AND_PROCEDURES_SAGA: {
            let lastAction = { ...state };
            for (let p in action.notesAndProceduresList) {
                lastAction[p] = action.notesAndProceduresList[p];
            }
            return lastAction;
        }
         case encounterActionType.GET_LOGIN_USERINFO_SAGA: {
            let lastAction = { ...state };
            for (let p in action.userLoginInfo) {
                lastAction[p] = action.userLoginInfo[p];
            }
            return lastAction;
        }


        default: {
            return state;
        }
    }

};

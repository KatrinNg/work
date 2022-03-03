import * as waitingListActionType from '../../../actions/dts/appointment/waitingListActionType';
import moment from 'moment';
import _ from 'lodash';


const initState = {
    waitingList: [],
    roomList: [],
    disciplineList: [
        {
            id:1,
            label:'Active'
        },
        {
            id:2,
            label:'Disabled'
        }
    ],
    treatmentTypeList:[
        {
            id:1,
            code:'Active'
        },
        {
            id:2,
            code:'Disabled'
        }
    ]
};


export default (state = initState, action = {}) => {

    switch (action.type) {

        case waitingListActionType.GET_WAITING_LIST_SAGA: {
            let lastAction = {...state};
            for(let p in action.waitingList) {
                lastAction[p] = action.waitingList[p];
            }
            //lastAction['waitingList'] = action.waitingList;
            return lastAction;
        }

        case waitingListActionType.RESET_ALL: {
            return initState;
        }

        case waitingListActionType.GET_ROOM_LIST_SAGA: {
            let lastAction = {...state};
            for(let p in action.roomList) {
                lastAction[p] = action.roomList[p];
            }
            return lastAction;
        }

        default: {
            return state;
        }
    }
};
import { TimeslotTemplateDTO } from '../../../../constants/appointment/timeslotTemplate/timeslotTemplateConstants';
import _ from 'lodash';
import * as timeslotTemplateActionTypes from '../../../actions/appointment/timeslotTemplate/timeslotTemplateActionType';
import { StatusEnum } from '../../../../enums/appointment/timeslot/timeslotTemplateEnum';
import moment from 'moment';

const INSTAL_STATE = {
    status: StatusEnum.VIEW,
    isOpenDialog: false,
    searchDTO: {
        encounterTypeCd: '',
        subEncounterTypeCd: '',
        encounterTypeCdShortName: '',
        subEncounterTypeCdShortName: ''
    },
    enCounterCodeList: [],
    subEnCounterCodeList: [],
    timeslotTempalteList: [],
    timeslotTemplateDTO: _.cloneDeep(TimeslotTemplateDTO),
    doCloseCallback: null
};
function getTemplateWeekNum(name) {
    switch (name) {
        case 'sun':
            return 0;
        case 'mon':
            return 1;
        case 'tue':
            return 2;
        case 'wed':
            return 3;
        case 'thur':
            return 4;
        case 'fri':
            return 5;
        case 'sat':
            return 6;
        default:
            return -1;
    }
}
function formatTemplateWeekday(templateList) {
    for (let i = 0; i < templateList.length; i++) {
        templateList[i].rowId = i;
        if (templateList[i]['week']) {
            templateList[i].sun = templateList[i]['week'][0] === '1' ? 'Y' : 'N';
            templateList[i].mon = templateList[i]['week'][1] === '1' ? 'Y' : 'N';
            templateList[i].tue = templateList[i]['week'][2] === '1' ? 'Y' : 'N';
            templateList[i].wed = templateList[i]['week'][3] === '1' ? 'Y' : 'N';
            templateList[i].thur = templateList[i]['week'][4] === '1' ? 'Y' : 'N';
            templateList[i].fri = templateList[i]['week'][5] === '1' ? 'Y' : 'N';
            templateList[i].sat = templateList[i]['week'][6] === '1' ? 'Y' : 'N';
        }
    }
    return templateList;
}

export default (state = INSTAL_STATE, action = {}) => {
    switch (action.type) {
        case timeslotTemplateActionTypes.ENCOUNTERTYPE_CODE_LIST: {
            let { subEnCounterCodeList, searchDTO } = { ...state };
            let enCounterCodeList = action.encounterTypeList;
            if (enCounterCodeList && enCounterCodeList.length > 0) {
                searchDTO.encounterTypeCd = enCounterCodeList[0].encounterTypeCd;
                searchDTO.encounterTypeCdShortName = enCounterCodeList[0].shortName;
                if (enCounterCodeList[0].subEncounterTypeList && enCounterCodeList[0].subEncounterTypeList.length > 0) {
                    subEnCounterCodeList = enCounterCodeList[0].subEncounterTypeList;
                    searchDTO.subEncounterTypeCd = subEnCounterCodeList && subEnCounterCodeList[0].subEncounterTypeCd;
                    searchDTO.subEncounterTypeCdShortName = subEnCounterCodeList && subEnCounterCodeList[0].shortName;
                }
            }
            return {
                ...state,
                enCounterCodeList,
                subEnCounterCodeList,
                searchDTO
            };
        }
        case timeslotTemplateActionTypes.UPDATE_SEARCH_FIELD: {
            let { name, value, shortName } = action;
            let { enCounterCodeList, subEnCounterCodeList, searchDTO } = { ...state };
            if (name === 'encounterTypeCd') {
                let filterEnCounterCodeList = enCounterCodeList.find(item => item.encounterTypeCd === action.value);
                subEnCounterCodeList = filterEnCounterCodeList.subEncounterTypeList || [];
                if (subEnCounterCodeList.length > 0) {
                    searchDTO.subEncounterTypeCd = subEnCounterCodeList[0].subEncounterTypeCd;
                    searchDTO.subEncounterTypeCdShortName = subEnCounterCodeList[0].shortName;
                } else {
                    searchDTO.subEncounterTypeCd = '';
                    searchDTO.subEncounterTypeCdShortName = '';
                }
            }
            searchDTO[name] = value;
            const shortname = name + 'ShortName';
            searchDTO[shortname] = shortName;
            return {
                ...state,
                subEnCounterCodeList,
                searchDTO
            };
        }
        case timeslotTemplateActionTypes.RESET_ALL: {
            return INSTAL_STATE;
        }
        case timeslotTemplateActionTypes.TIMESLOT_TEMPLATE_LIST: {
            let templateList = formatTemplateWeekday(action.timeslotTempalteList);
            return {
                ...state,
                timeslotTempalteList: templateList
            };
        }
        case timeslotTemplateActionTypes.OPEN_DIALOG: {
            let timeslotTemplateDTO = { ...state.timeslotTemplateDTO };
            if (action.statusEnum === StatusEnum.NEW) {
                let searchDTO = { ...state.searchDTO };
                timeslotTemplateDTO = _.cloneDeep(TimeslotTemplateDTO);
                timeslotTemplateDTO.startTime = moment().format('HH:mm');
                timeslotTemplateDTO.encounterTypeCd = searchDTO.encounterTypeCd;
                timeslotTemplateDTO.subEncounterTypeCd = searchDTO.subEncounterTypeCd;
            }
            return {
                ...state,
                isOpenDialog: action.isOpen,
                status: action.statusEnum,
                timeslotTemplateDTO
            };
        }
        case timeslotTemplateActionTypes.CLOSE_DIALOG: {
            return {
                ...state,
                isOpenDialog: false,
                status: StatusEnum.VIEW
            };
        }
        case timeslotTemplateActionTypes.UPDATE_FIELD: {
            let { name, value, week } = action;
            let timeslotTemplateDTO = { ...state.timeslotTemplateDTO };
            if (name === 'week') {
                let weekNum = getTemplateWeekNum(week);
                let originalWeek = timeslotTemplateDTO.week;
                value = originalWeek.substring(0, weekNum) + value + originalWeek.substring(weekNum + 1);
            }
            if (name === 'encounterTypeCd' && timeslotTemplateDTO.encounterTypeCd != value) {// eslint-disable-line
                timeslotTemplateDTO.subEncounterTypeCd = '';
            }
            timeslotTemplateDTO[name] = value;
            return {
                ...state,
                timeslotTemplateDTO
            };
        }
        case timeslotTemplateActionTypes.SAVE_SUCCESS: {
            //update search criteria
            let { encounterTypeCd, subEncounterTypeCd } = action;
            let { enCounterCodeList, searchDTO } = { ...state };
            let filterEnCounterCodeList = enCounterCodeList.find(item => item.encounterTypeCd === encounterTypeCd);
            let subEnCounterCodeList = filterEnCounterCodeList.subEncounterTypeList;
            searchDTO.encounterTypeCd = encounterTypeCd;
            searchDTO.encounterTypeCdShortName = filterEnCounterCodeList.shortName;

            let filterSubEncounterList = subEnCounterCodeList.find(item => item.subEncounterTypeCd === subEncounterTypeCd);
            searchDTO.subEncounterTypeCd = subEncounterTypeCd;
            searchDTO.subEncounterTypeCdShortName = filterSubEncounterList.shortName;
            return {
                ...state,
                status: StatusEnum.VIEW,
                searchDTO,
                subEnCounterCodeList
            };
        }
        case timeslotTemplateActionTypes.TIMESLOT_TEMPLATE: {
            return {
                ...state,
                isOpenDialog: true,
                status: StatusEnum.EDIT,
                timeslotTemplateDTO: action.data
            };
        }
        default: return state;
    }
};
import * as dtsPatientSearchActionType from '../../../actions/dts/patient/DtsPatientSearchActionType';
import _ from 'lodash';
import * as patientUtilities from '../../../../utilities/patientUtilities';

const initState = {
    searchParams:[], // [{id: 'abc', isFocusSearchInput: true, patientSearchParam: {searchType: '', searchValue: ''}}]
    patientLists: [], // [{id: 'abc', data: []}]
    pucParams: [] // [{id: 'abc', dialogOpen: false, patientInfoParams: {}}]
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case dtsPatientSearchActionType.SET_SEARCH_PARAMS: {
            //console.log('SET_SEARCH_PARAMS' + JSON.stringify(action));
            const {id, params} = action;
            let searchParams = _.cloneDeep(state.searchParams);
            let targetSearchParams = _.remove(searchParams, e => e.id === id);
            let editSearchParam = { id, isFocusSearchInput: false, patientSearchParam: null };
            if (_.size(targetSearchParams) > 0){
                editSearchParam = targetSearchParams[0];
            }
            searchParams.push({
                ...editSearchParam,
                ...params
            });
            return {
                ...state,
                searchParams: searchParams
            };
        }
        case dtsPatientSearchActionType.RESET_BY_ID: {
            console.log('RESET_BY_ID');
            const {id} = action;
            let searchParams = _.cloneDeep(state.searchParams);
            _.remove(searchParams, e => e.id === id);
            let patientLists = _.cloneDeep(state.patientLists);
            _.remove(patientLists, e => e.id === id);
            let pucParams = _.cloneDeep(state.pucParams);
            _.remove(pucParams, e => e.id === id);
            return {
                ...state,
                searchParams,
                patientLists,
                pucParams
            };
        }
        case dtsPatientSearchActionType.SEARCH_PATIENT_SAGA: {
            const {id, data, countryList} = action;
            const patientResult = patientUtilities.getPatientSearchResult(data && data.patientDtos, countryList);
            let patientLists = state.patientLists.filter(e => e.id != id);
            patientLists.push({id: action.id, data: patientResult });
            return {
                ...state,
                patientLists
            };
        }
        case dtsPatientSearchActionType.SET_SELECTED_PATIENT: {
            const {id, patient} = action;
            let data = [ patient ];
            let patientLists = state.patientLists.filter(e => e.id != id);
            patientLists.push({id: action.id, data });
            return {
                ...state,
                patientLists
            };
        }
        case dtsPatientSearchActionType.SET_PUC_PARAMS: {
            const {id, params} = action;
            let pucParams = _.cloneDeep(state.pucParams);
            let targetPucParams = _.remove(pucParams, e => e.id === id);
            let editPucParams = { id, dialogOpen: false, patientInfoParams: null };
            if (_.size(targetPucParams) > 0){
                editPucParams = targetPucParams[0];
            }
            pucParams.push({
                ...editPucParams,
                ...params
            });
            return {
                ...state,
                pucParams: pucParams
            };
        }
        default: {
            return state;
        }
    }
};

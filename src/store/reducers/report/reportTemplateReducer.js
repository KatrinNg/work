import * as reportTemplateActionType from '../../actions/report/reportTemplateActionType';
import moment from 'moment';

const initState = {
    clinicValue: null,
    encounterTypeValue: null,
    selectEncounterType: {},
    subEncounterTypeValue: null,
    dateFrom: moment().startOf('month'),
    dateTo: moment().endOf('month'),
    date: moment(),
    clinicListData: [],
    encounterTypeListData: [],
    subEncounterTypeListData: [],
    reportTemplate: null,
    selectedReport: null,
    openReportPreview: false,
    dialogTemplateOpen: false,
    dialogConfigOpen: false,
    dialogConfigAction: '',
    reportData: null,
    reportJobList: [],
    reportTemplateList: [],
    individualReportList: [],
    reportConfigList: null,
    selectedReportConfigId: null,
    selectedReportConfigVals: null,
    activePageMode: 'template',
    rmId: null,
    jobData: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case reportTemplateActionType.RESET_ALL: {
            return initState;
        }
        case reportTemplateActionType.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        case reportTemplateActionType.FILLING_DATA: {
            let lastAction = { ...state };
            for (let p in action.fillingData) {
                lastAction[p] = action.fillingData[p];
            }
            return lastAction;
        }
        case reportTemplateActionType.PUT_REPORT_TEMPLATE_DATA: {
            return {
                ...state,
                reportTemplate: action.reportTemplate,
                openReportPreview: true
            };
        }
        case reportTemplateActionType.PUT_TEMPLATE_DYNAMIC_FORM_PARAMETER: {
            let lastAction = { ...state };
            let rptTmplParamList = lastAction.selectedTemplate && lastAction.selectedTemplate.rptTmplParamList ? lastAction.selectedTemplate.rptTmplParamList : [];
            rptTmplParamList.forEach(
                function(rptTmplParam, index) {
                    if (rptTmplParam.rptTmplParamId === action.rptTmplParamId) {
                        rptTmplParam.selectOption = action.parameterData;
                    }
                }
            );
            return lastAction;
        }
        default: {
            return state;
        }
    }
};


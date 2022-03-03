import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Checkbox,
    Grid
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import { fade } from '@material-ui/core/styles/colorManipulator';
import withWidth from '@material-ui/core/withWidth';
import CIMSCommonSelect from '../../../../../components/Select/CIMSCommonSelect';
import CIMSCommonDatePicker from '../../../../../components/DatePicker/CIMSCommonDatePicker';
import CIMSCommonTimePicker from '../../../../../components/DatePicker/CIMSCommonTimePicker';
import CIMSCommonTextField from '../../../../../components/TextField/CIMSCommonTextField';
import CIMSCommonButton from '../../../../../components/Buttons/CIMSCommonButton';
import * as ReportConstant from '../../../../../constants/report/reportConstant';
import * as listUtilities from '../../../../../utilities/listUtilities';
import * as reportUtilities from '../../../../../utilities/reportUtilities';
import Enum from '../../../../../enums/enum';
import * as userConstants from '../../../../../constants/user/userConstants';

import _ from 'lodash';
import moment from 'moment';
import { Formik, Form, Field, FastField, ErrorMessage } from 'formik';
import * as yup from 'yup';

import {
    updateField,
    requestData,
    postData,
    putData,
    openPreviewWindow
} from '../../../../../store/actions/report/reportTemplateAction';

import DynamicForm from '../DynamicForm';

const styles = theme => ({
    hintHead:{
        fontWeight: 'bold'
    },
    hintExampleTable:{
        marginRight: '6px',
        border: '1px solid black',
        padding: '3px',
        paddingLeft: '7px',
        paddingRight: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderRadius: '100px',
        transition: 'background-color 0.5s ease-out',
        textAlign: 'center',
        float: 'left',
        width: '53px',
        '&:hover':{
            backgroundColor: '#99ff99'
        }
    },
    hintDesc:{
        whiteSpace:'pre-line'
    },
    gridRow: {
        minHeight: '80px'
    },
    hintRow: {
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center'
    },
    dialogActions: {
        justifyContent: 'flex-start'
    },
    selectRoot: {
        color: fade(Colors.common.black, 1) + ' !important',
        '&$shrink': {
            transform: 'translate(14px, -10px) scale(0.75)',
            borderRadius: '4px',
            backgroundColor: Colors.common.white,
            padding: '2px 4px 2px 4px'
        }
    },
    datePickerRoot: {
        '&$disabled $notchedOutline': {
            backgroundColor: Colors.grey[400]
        }
    },
    datePickerInput: {
        color: fade(Colors.green[500], 1) + ' !important',
        zIndex: 1
    },
    disabled: {},
    notchedOutline: {},
    shrink: {},
    error: {
        color: 'red',
        fontSize: '0.75rem'
    },
    tableHint: {
        transition: 'max-height 0.2s ease-in-out',
        fontFamily: 'Arial, Helvetica, sans-serif',
        borderCollapse: 'collapse',
        width: '100%',
        '& td, &th':{
            border: '1px solid #ddd',
            padding: '8px'
        },
        '& th' : {
            paddingTop: '12px',
            paddingLeft: '10px',
            paddingBottom: '12px',
            textAlign: 'left',
            backgroundColor: '#4CAF50',
            border: '1px solid #4CAF50',
            color: 'white'
        },
        '& tr:hover': {
            backgroundColor: '#7dfb7e !important'
        },
        '& tr:nth-child(even)': {
            backgroundColor: '#f2f2f2'
        }
    },
    hideTableHint: {
        width: '100%',
        maxHeight: '0px',
        overflow:'hidden'
    },
    showTableHint: {
        width: '100%',
        transition: 'max-height 0.2s ease-in-out',
        maxHeight: '300px',
        overflow:'hidden'
    }
});

const jobPeriodTypeList = ReportConstant.periodTypeList;

const sortFunc = (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

const multiSelectRefs = {
    site:'refSite',
    reportDesc:'refReportDesc',
    reportStatus:'refReportStatus',
    reportName:'refReportName'
};

const transpose = (inData, header) => {
    let tar = [];
    let descVal = Object.keys(inData[0]);
    descVal.forEach((descVal)=>{
        let tarObj= {};
        tarObj['desc'] = descVal;
        tar.push(tarObj);
    });
    let newKeys = [];
    inData.forEach((x)=>{
        let v = x[header];
        newKeys.push(v);
    });
    for( let i=0; i < tar.length; i++ ){
        let rowKey = tar[i]['desc'];
        for( let j = 0; j <inData.length; j ++ ){
            let newKey = inData[j][header];
            let val = inData[j][rowKey];
            tar[i][newKey] = val;
        }
    }
    return tar;
};

const getSchedule = ( execDate, periodType) => {
    let start = moment(execDate);
    let runDateObj = start.clone();
    let runDate = runDateObj.format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
    let startDateObj = start.clone().subtract(1, periodType);
    let endDateObj = start.clone().subtract(1, 'day');
    let startDate = startDateObj.format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
    let endDate = endDateObj.format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
    let month =  startDateObj.format('M');
    let year =  startDateObj.format('Y');
    let r ={
        __RUN_DATE: runDate,
        START_DATE: startDate,
        END_DATE: endDate,
        YEAR_NO: year,
        MONTH_NO: month
    };
    return r;
};

const getUpcomingSchedules = (configStartDate, periodType, times ) => {
    let r = [];
    let schedule = [];
    if(configStartDate && periodType){
        const today = moment().endOf('Day');
        let nextRunDate = moment(configStartDate).startOf('Day').clone();
        if(!nextRunDate.isValid()){
            return schedule;
        }
        let runCount = 0;

        let periodTypeObj = jobPeriodTypeList.find(x => x.value === periodType);
        let _periodType = periodTypeObj?.label;
        if (typeof _periodType === 'string' || _periodType instanceof String){
            _periodType = _periodType.toLowerCase();
        } else{
            return schedule;
        }

        if( ReportConstant.DAY.includes(_periodType)) {
            nextRunDate = today.clone().add(1,'day');
            console.log('nextRunDate', nextRunDate);
        } else if(ReportConstant.YEAR_MONTH_WEEK.includes(_periodType)){
            while(!(nextRunDate.diff(today) > 0 || runCount === ReportConstant.MAX_WEEK_COUNT )){
                nextRunDate.add( 1, _periodType);
                runCount++;
            }
        }
        for(let i = 0; i < times; i++){
            let execDate = nextRunDate.clone();
            execDate.format('DD-MMM-YYYY');
            execDate = execDate.add(i, _periodType);
            let row = getSchedule( execDate, _periodType );
            r.push(row);
        }
        schedule = transpose(r,'__RUN_DATE');
        schedule = schedule.filter(row =>row.desc != '__RUN_DATE');
    }

    return schedule;
};

class ReportConfigDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            fontsLoaded: false,
            sites: props.clinicList.filter(x => x.serviceCd === props.serviceCd)
            .map(x => ({
                value: x.siteId,
                label: x.siteName,
                item: x
            })),
            reportIds: props.reportTemplateList
            .map(x => ({
                value: x.reportId,
                label: x.reportName + ': ' + x.reportDesc,
                item: x
            })),
            encounterTypes: props.encounterTypes
            .map(x => ({
                value: x.encntrTypeId,
                label: x.encntrTypeCd + ' - ' + x.encntrTypeDesc,
                item: x
            })),
            sortedColumns: ['paramName', 'paramDesc', 'paramType', 'paramVal'],
            active: true,
            showHint: false,
            // ------- IS_DOCTOR_USER && IS_NURSE_USER --------
            userIdFlag: false,
            isDoctorUser: false,
            isNurseUser: false,
            isUserFlagError: false,
            users: props.users
            .map(x => ({
                value: x.userId,
                label: x.engGivName + ' ' + x.engSurname + ' - ' + x.email,
                item: x
            })),
            // -------------------------------------------------
            // For fuction selcet box flag
            encounterTypeFlag: false,
            upcomingSchedule: [],
            noOfPreviewSchedules: 3
        };

        // Add the Select All Option
        this.setState({encounterTypes: this.state.encounterTypes.unshift(
            reportUtilities.getSelectAllOption()
        )});
        // this.setState({sites: this.state.sites.unshift(
        //     reportUtilities.getSelectAllOption()
        // )});

        this.refForm = React.createRef();
        this.refGridForm = React.createRef();
        this.refGrid = React.createRef();

    }

    componentDidMount() {
        if (document.fonts) {
            document.fonts.ready
            .then(() => {
                this.setFontsLoaded(true);
            });
        }

        // For update
        if (this.props.selectedReportConfig){
            let selectedReportConfig = this.props.selectedReportConfig;
            setTimeout(() => {
                if(selectedReportConfig){
                    this.updateLocalState(selectedReportConfig);
                    const { jobStartDtm, jobPeriodType } = selectedReportConfig;
                    console.log(jobStartDtm, jobPeriodType);
                    const upcomingSchedule = getUpcomingSchedules( jobStartDtm, jobPeriodType, this.state.noOfPreviewSchedules );
                    this.setState({upcomingSchedule: upcomingSchedule});
                    this.props.requestData('reportConfigParamValList', {
                        reportConfigId: selectedReportConfig.reportConfigId,
                        reportId: selectedReportConfig.reportId
                    });
                    // Set selectedReportConfigVals
                    this.props.requestData('reportConfigParamValByIdList', {
                        reportConfigId: selectedReportConfig.reportConfigId
                    });
                }
            },0);
        }

        // For create, id = 0
        if (this.props.selectedReportConfigId=== 0) {
            let selectedSite = this.state.sites.filter(x => x.value === this.props.siteId);
            // Delay for waiting refForm ready
            setTimeout(() => {
                let selectedSite = this.state.sites.filter(x => x.value === this.props.siteId);
                let prefillReportConfig = this.props.prefillReportConfig;
                //let _selectedReportId = null;
                let _selectedReportId;
                if(prefillReportConfig && prefillReportConfig.reportId){
                    let _reportId = this.props.prefillReportConfig.reportId;
                    _selectedReportId = this.state.reportIds.find(x => x.value === _reportId);
                    this.updateFlagValue(_reportId);
                }

                this.handleCreatePrefill(selectedSite, _selectedReportId);
                this.props.updateField({
                    reportConfigParamValList: []
                });
            }, 0);
        }
    }

    componentDidUpdate(prevProps) {
        console.log('did update');
        if (prevProps.selectedReportConfig!== this.props.selectedReportConfig){
            this.updateLocalState(this.props.selectedReportConfig);
        }
        // Call API config Vals to update Encounter Type Field to confi
        if (prevProps.selectedReportConfigVals!== this.props.selectedReportConfigVals){
            //this.updateLocalState(this.props.selectedReportConfig);
            let reportConfigEncounterType = this.props.selectedReportConfigVals.filter(x => x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeId)[0];
            if (reportConfigEncounterType) {
                this.handleEncounterTypeChange(this.state.encounterTypes.filter(x => x.value === parseInt(reportConfigEncounterType.paramVal))[0]);
            }
        }

        if ((prevProps.reportConfigParamValList!== this.props.reportConfigParamValList) || (prevProps.selectedReportConfigVals !== this.props.selectedReportConfigVals)){
            console.log('updated selected report config');
            //this.updateLocalState(this.props.selectedReportConfig);
            this.updateLocalDetailState(this.props.reportConfigParamValList);
            const form = this.getForm();
            let selectedReportId = form.getFieldMeta('selectedReportId').value;
            const selectedRptTmplParamList = selectedReportId && selectedReportId.value ? this.props.reportTemplateList.filter(x => x.reportId === selectedReportId.value)[0] : null;

            let paramVals = [];
            if(selectedRptTmplParamList && selectedRptTmplParamList.rptTmplParamList) {
                selectedRptTmplParamList.rptTmplParamList.forEach((x)=>{
                    if(x.paramCategory === ReportConstant.RPT_TMPL_PARAM_CATEGORY_CODE.function ){
                        if(x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeId){
                            // TODO :. encounterTypeId
                            let reportConfigVals = this.props.selectedReportConfigVals.filter(x => x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeId)[0];
                            if (reportConfigVals) {
                                if (reportConfigVals.paramVal === ReportConstant.SELECT_ALL_OPTIONS) {
                                    this.handleEncounterTypeChange(this.state.encounterTypes.filter(x => x.value === reportConfigVals.paramVal)[0]);
                                } else {
                                    this.handleEncounterTypeChange(this.state.encounterTypes.filter(x => x.value === parseInt(reportConfigVals.paramVal))[0]);
                                }
                            }
                        } else if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeDesc) {
                            //encounterTypeDesc
                            let reportConfigVals = this.props.selectedReportConfigVals && this.props.selectedReportConfigVals.filter(x => x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeDesc)[0];
                            if (reportConfigVals) {
                                this.handleEncounterTypeChange(this.state.encounterTypes.filter(x => x.item && x.item.encntrTypeDesc === reportConfigVals.paramVal)[0]);
                            }
                        } else if(x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId
                            || x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId){
                            if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId) {
                                //doctorUserId
                                let reportConfigVals = this.props.selectedReportConfigVals && this.props.selectedReportConfigVals.filter(x => x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId)[0];
                                if (reportConfigVals) {
                                    if (reportConfigVals.paramVal === ReportConstant.SELECT_ALL_OPTIONS) {
                                        this.handleUserChange(this.state.users.filter(x => x.value === reportConfigVals.paramVal)[0]);
                                    } else {
                                        this.handleUserChange(this.state.users.filter(x => x.value === parseInt(reportConfigVals.paramVal))[0]);
                                    }
                                }
                            } else if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId) {
                                //nurseUserId
                                let reportConfigVals = this.props.selectedReportConfigVals && this.props.selectedReportConfigVals.filter(x => x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId)[0];
                                if (reportConfigVals) {
                                    if (reportConfigVals.paramVal === ReportConstant.SELECT_ALL_OPTIONS) {
                                        this.handleUserChange(this.state.users.filter(x => x.value === reportConfigVals.paramVal)[0]);
                                    } else {
                                        this.handleUserChange(this.state.users.filter(x => x.value === parseInt(reportConfigVals.paramVal))[0]);
                                    }
                                }
                            }
                            // ----------------------------doctorUserId------------------------------------
                        }
                    }
                });
            }
        }

        // Default value
        if (this.getForm()) {
            const form = this.getForm();
            if (form){
                let selectedEncounterTypeId = form.getFieldMeta('selectedEncounterTypeId');
                let selectedUser = form.getFieldMeta('selectedUser');
                let selectedSite = form.getFieldMeta('selectedSite');
                if(selectedSite.value === null) {
                    console.log('Default Value ');
                    setTimeout(() => {
                        this.handleUserStateUpdate(this.props.siteId, this.props.isDoctorUser, this.props.isNurseUser);
                    }, 50);
                }
                if (selectedEncounterTypeId.value === null || selectedUser.value  === null ) {
                    // Default
                    // form.setFieldValue('selectedUser', reportUtilities.getSelectAllOption());
                    form.setFieldValue('selectedEncounterTypeId', reportUtilities.getSelectAllOption());
                }
            }
        }
    }

    setFontsLoaded(complete) {
        this.setState({fontsLoaded: complete});
    }

    // Dynamic form
    // ---------------------------------------------------
    getGridForm = () => {
        if (this.refGridForm.current) {
            let form = this.refGridForm.current;
            return form;
        }
        return null;
    }

    getGrid = () => {
        if (this.refGrid.current) {
            let { grid } = this.refGrid.current;
            return grid;
        }
        return null;
    }

    updateLocalDetailState = (data) => {
        const form = this.getGridForm();
        if (!form)
            return;
        let rowData = [];
        let { rowId } = form.values;
        console.log('---------------------------------------------------');
        console.log(form);
        console.log('---------------------------------------------------');
        for (let i = 0; i < data.length; i++) {
            //let { paramName, paramDesc, paramType, value } = data[i];
            let { ...rest } = data[i];
            //let { stime, etime, ...rest } = data[i];
            // rowData.push({ stime: moment(stime, 'HH:mm'), etime: moment(etime, 'HH:mm'), ...rest, rowId: ++rowId});
            rowData.push({ ...rest, rowId: ++rowId});
        }
        form.setFieldValue('originalRowData', data);
        form.setFieldValue('rowData', rowData);
        form.setFieldValue('rowId', rowId);
        // this.setGridData(rowData);
        this.setState({ dataLoaded: true });
    }

    validateGrid = async () => {
        const form = this.getGridForm();
        const errors = await form.validateForm();

        const errorRowData = errors.rowData?.map((err, index) => {
            if (form.values.rowData[index].action === 'delete') // ignore error check for deleted rows
                return undefined;
            else
                return err;
        });

        let len = errorRowData && errorRowData.length;
        if(len){
            this.touchColumn('paramVal', len);
        }

        if (errorRowData?.some(x => x)) { // check exist some errors
            let errRow;
            let rowId = null;
            for (let i = 0; i < errorRowData.length; ++i) {
                if (errorRowData[i] !== undefined) {
                    errRow = errorRowData[i];
                    rowId = i;
                    break;
                }
            }

            let colId = null;
            if (errRow) {
                for (let i = 0; i < this.state.sortedColumns.length; ++i) {
                    let column = this.state.sortedColumns[i];
                    if (errRow[column]) {
                        colId = column;
                        break;
                    }
                }
            }

            if (rowId !== null && colId !== null)
                this.focusField(rowId, colId);

            //this.props.openCommonMessage({
                //msgCode: '130300',
                //params: [
                    //{ name: 'HEADER', value: 'Error' },
                    //{ name: 'MESSAGE', value: 'Form validation failed' }
                //],
                //btnActions:{
                    //btn1Click: () => {
                        //if (rowId !== null && colId !== null)
                            //this.focusField(rowId, colId);
                    //}
                //}
            //});
            return false;
        }
        else {
            //this.setLocked(true);
            //this.saveTimeslotPlan(form.values.rowData);
            //this.setDeferredLocked(false, 500);
            return true;
        }
    }

    touchColumn = (col, len) => {
        const form = this.getGridForm();
        let rowData = form && form.values && form.values.rowData;
        let touchRowData = [];
        for ( let i = 0; i < len; i++){
            touchRowData.push({[col]:true});
        }
        form.setFieldTouched('rowData', touchRowData);
    }

    focusField = (rowId, colId) => {
        const grid = this.getGrid();
        if (grid) {
            const rowNode = grid.api.getRowNode(rowId);
            grid.api.ensureIndexVisible(rowNode.rowIndex);
            setTimeout(() => {
                grid.api.setFocusedCell(rowNode.rowIndex, colId);
                grid.api.dispatchEvent({
                    type: 'cellFocus',
                    params: {
                        rowId,
                        colId
                    }
                });
            }, 50);
        }
    }

    // ---------------------------------------------------

    getForm = () => {
        if (this.refForm.current) {
            let form = this.refForm.current;
            return form;
        }
        return null;
    }

    // Init all Flag in update report
    updateFlagValue = (reportId) => {
        this.setState({encounterTypeFlag: false});
        this.setState({userIdFlag: false});
        this.setState({isDoctorUser: false});
        this.setState({isNurseUser: false});
        this.setState({isUserFlagError: false});
        let isDoctorUser = false;
        let isNurseUser = false;
        const form = this.getForm();
        let selectedSite = form.getFieldMeta('selectedSite');

        const selectedRptTmplParamList = this.props.reportTemplateList.filter(x => x.reportId === reportId)[0];
        if(selectedRptTmplParamList && selectedRptTmplParamList.rptTmplParamList) {
            selectedRptTmplParamList.rptTmplParamList.forEach((x)=>{
                if(x.paramCategory === ReportConstant.RPT_TMPL_PARAM_CATEGORY_CODE.function ){
                    // If report not support encounterTypeDesc Delect delete RPT_TMPL_PARAM_NAME_CODE.encounterTypeDesc checking code
                    if(x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeId ||
                        x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeDesc){
                        this.setState({encounterTypeFlag: true});
                    } else if(x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.userId
                        || x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId
                        || x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId){
                        if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.userId) {
                            // Checking error user only supports
                            if (this.state.isDoctorUser || this.state.isNurseUser) {
                                this.setState({isUserFlagError: true});
                            }
                            this.setState({userIdFlag: true});
                        } else if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId) {
                            if (this.state.userIdFlag || this.state.isNurseUser) {
                                isNurseUser = true;
                                this.setState({isUserFlagError: true});
                            }
                            this.setState({isDoctorUser: true});
                            this.handleUserStateUpdate(selectedSite.value, true, false);
                        } else if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId){
                            if (this.state.userIdFlag || this.state.isDoctorUser) {
                                isDoctorUser = true;
                                this.setState({isUserFlagError: true});
                            }
                            this.setState({isNurseUser: true});
                            this.handleUserStateUpdate(selectedSite.value, false, true);
                        }
                    }
                }
            });
        }
    }

    handleUserStateUpdate = (siteId, isDoctorUser, isNurseUser) => {
        console.log('-----------------------handleUserStateUpdate----------------------------');
        if (this.props.isStatReportSiteUsersRight() || this.props.isStatReportSvcUsersRight()) {
            // reportTemplate user === UAM Privileges Allow Select Same Site User / Service User
            const form = this.getForm();
            let selectedSite = null;
            let selectedSiteCdArrayList = [];
            // Update Detail Conf
            if (this.props.selectedReportConfig && this.props.dialogConfigAction === 'update') {
                let selectedReportConfigSitesArrayList = this.props.selectedReportConfig.siteIds;
                let clinicListArrayList = this.props.clinicList;
                clinicListArrayList.forEach(function (site) {
                    if (site.siteId && selectedReportConfigSitesArrayList.includes(site.siteId)) {
                        selectedSiteCdArrayList.push(site.clinicCd);
                    }
                });
            } else if (form) {
                selectedSite = form.getFieldMeta('selectedSite');
                // Def site was null; User list was login site only;
                if (!selectedSite) {
                    selectedSite = [this.props.siteId];
                }
                selectedSite && selectedSite.value && selectedSite.value.forEach(
                    function (site) {
                        if (site.item && site.item.clinicCd) {
                            selectedSiteCdArrayList.push(site.item.clinicCd);
                        }
                    }
                );
            }

            let users = reportUtilities.filterReportTemplateUsersByServiceCdNClinicCdNRole(
                this.props.users,
                this.props.serviceCd /* Login Service Code */,
                selectedSiteCdArrayList /* Sites Array List  */,
                isDoctorUser, isNurseUser,
                false /* isDtsUser */);

            users = reportUtilities.mapUuserByReportUserState(users);

            // Not use this login in 2021/09/06
            let allUserId = '';
            users.forEach(user =>
                allUserId === '' ? allUserId += user.value : allUserId += ',' + user.value
            );
            console.log(' allUserId = ', allUserId);

            // users.unshift(reportUtilities.getSelectAllOption(isDoctorUser
            //     ? ReportConstant.SELECT_ALL_USER_DOCTOR_ROLE_LABEL
            //         : (isNurseUser ? ReportConstant.SELECT_ALL_USER_NURSE_ROLE_LABEL : null)));
            console.log(' Users: ', users);

            this.setState({users: users});
        }
    }

    updateLocalState = (data) => {

        let { siteIds, jobStartDtm, jobPeriodType, maxRetryCount, isDisable, reportId, selectedEncounterTypeId  } = data;

        setTimeout(() => {
            this.handleUserStateUpdate(siteIds, this.props.isDoctorUser, this.props.isNurseUser);
        }, 150);

        let selectedSite = this.state.sites.filter(x => siteIds.includes(x.value));
        let selectedJobPeriodType = jobPeriodTypeList.find(x => x.value === jobPeriodType);
        let selectedReportId = this.state.reportIds.find(x => x.value === reportId);
        // this.props.reportTemplateList
        if (reportId) {
            // Checking Report Param to display Function PARAM
            this.updateFlagValue(reportId);
        }

        const form = this.getForm();
        let active = isDisable == 'Y'? false : true;
        if (form) {
            form.setFieldValue('selectedSite', selectedSite);
            form.setFieldValue('selectedReportId', selectedReportId);
            form.setFieldValue('startDate', moment(jobStartDtm));
            form.setFieldValue('selectedEncounterTypeId', selectedEncounterTypeId);
            //form.setFieldValue('startTime', moment(jobStartDtm));
            form.setFieldValue('selectedJobPeriodType', selectedJobPeriodType);
            form.setFieldValue('maxRetryCount', maxRetryCount);
            form.setFieldValue('active', active);
        }
    }

    handleClose = () => {
        this.props.updateField({
            dialogConfigOpen: false,
            dialogConfigAction: '',
            selectedReportConfigId: null,
            selectedReportConfig: null,
            prefillReportConfig: null
        });
    }

    handleDidCreateUpdate = () => {
        this.handleClose();
        this.props.requestData('reportConfigList', {svcCd: this.props.serviceCd});
    }

    handleCreatePrefill= ( site, reportId ) => {
        const form = this.getForm();
        form.setFieldValue('selectedSite', site);
        form.setFieldValue('selectedReportId', reportId);
    }

    handleSiteChange = (site, callback) => {
        const form = this.getForm();
        setTimeout(() => {
            form.setFieldValue('selectedSite', site);
        }, 150);
        // TODO :. if change site to update the Users
        // E.g : Selected Site List
        setTimeout(() => {
            this.handleUserStateUpdate(form.getFieldMeta('selectedSite'), this.props.isDoctorUser, this.props.isNurseUser);
        }, 150);
    }

    handleEncounterTypeChange = (selectedEncounterTypeId, callback) => {
        const form = this.getForm();
        form.setFieldValue('selectedEncounterTypeId', selectedEncounterTypeId);
    }

    handleUserChange = (selectedUser, callback) => {
        const form = this.getForm();
        form.setFieldValue('selectedUser', selectedUser);
    }

    handleStartDateChange = ( date, callback) =>{
        const form = this.getForm();
        const periodType = form?.values?.selectedJobPeriodType?.value;
        form.setFieldValue('startDate', date);
        const schedule = getUpcomingSchedules(date, periodType, this.state.noOfPreviewSchedules );
        console.log(form);
        console.log('update preview table');
        console.log(date);
        this.setState({upcomingSchedule:schedule});
    }

    handlePeriodTypeChange= ( periodTypeObj, callback) =>{
        const form = this.getForm();
        const date = form?.values?.startDate;
        form.setFieldValue('selectedJobPeriodType', periodTypeObj);
        const periodType = periodTypeObj && periodTypeObj.value;
        console.log(periodType);
        const schedule = getUpcomingSchedules(date, periodType, this.state.noOfPreviewSchedules );
        console.log(form);
        console.log('update preview table');
        console.log(date);
        this.setState({upcomingSchedule:schedule});
    }

    resetGridForm = () =>{
        const gridForm = this.getGridForm();
        console.log('---------------------------------------------------');
        console.log(gridForm);
        console.log('---------------------------------------------------');
        gridForm.resetForm();
        gridForm.setFieldValue('rowData', []);
        gridForm.setFieldValue('originalRowData', []);
        gridForm.setFieldValue('rowId', -1);
    }

    handleReportIdChange = (selectedReportId, callback) => {
        const { dialogConfigAction } = this.props;
        const form = this.getForm();
        form.setFieldValue('selectedReportId', selectedReportId);
        this.resetGridForm();
        let selectedReportIdVal = selectedReportId && selectedReportId.value;
        this.updateFlagValue(selectedReportIdVal);
        if(selectedReportIdVal){
            if (dialogConfigAction === 'create') {
                this.props.requestData('reportConfigParamValList', {
                    reportId: selectedReportId.value
                });
            } else if (dialogConfigAction === 'update') {
                let selectedReportConfig = this.props.selectedReportConfig;
                this.props.requestData('reportConfigParamValList', {
                    reportConfigId: selectedReportConfig.reportConfigId,
                    reportId: selectedReportId.value
                });
            }
        }
    }

    handleValidate = (props) =>{
        this.validateGrid().then((validatedResult) => {
        console.log('---------------------------------------------------');
        console.log(validatedResult);
        console.log('---------------------------------------------------');
        if(!validatedResult){
            return;
        }
        this.refForm.current.handleSubmit();
        });
    }

    getGridRowData = () => {
        const form = this.getGridForm();
        console.log('---------------------------------------------------');
        let rowData = form && form.values && form.values.rowData;
        console.log(rowData);
        console.log('---------------------------------------------------');
        return rowData;
    }

    getFunctionParamVals = (saveValues) => {
        let { selectedReportId, selectedEncounterTypeId, selectedUser} = saveValues;
        const selectedRptTmplParamList = this.props.reportTemplateList.filter(x => x.reportId === selectedReportId.value)[0];
        let paramVals = [];
        if(selectedRptTmplParamList && selectedRptTmplParamList.rptTmplParamList) {
            selectedRptTmplParamList.rptTmplParamList.forEach((x)=>{
                if(x.paramCategory === ReportConstant.RPT_TMPL_PARAM_CATEGORY_CODE.function ){
                    if(x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeId){
                        paramVals.push({
                            reportConfigId: this.props.selectedReportConfigId,
                            rptTmplParamId: x.rptTmplParamId,
                            paramVal: selectedEncounterTypeId.value
                        });
                    } else if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeDesc) {
                        // If report not support encounterTypeDesc Delect delete code
                        // ----------------------------Delect------------------------------------
                        paramVals.push({
                            reportConfigId: this.props.selectedReportConfigId,
                            rptTmplParamId: x.rptTmplParamId,
                            paramVal: selectedEncounterTypeId.item ? selectedEncounterTypeId.item.encntrTypeDesc : {}
                        });
                        console.log(selectedEncounterTypeId.item);
                        console.log(paramVals);
                        // ----------------------------Delect end ------------------------------------
                    } else if(x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId
                        || x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId){
                        // ----------------------------doctorUserId------------------------------------
                        if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId) {
                            paramVals.push({
                                reportConfigId: this.props.selectedReportConfigId,
                                rptTmplParamId: x.rptTmplParamId,
                                paramVal: selectedUser.value
                            });
                        } else if (x.paramName === ReportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId) {
                            paramVals.push({
                                reportConfigId: this.props.selectedReportConfigId,
                                rptTmplParamId: x.rptTmplParamId,
                                paramVal: selectedUser.value
                            });
                        }
                        // ----------------------------doctorUserId------------------------------------

                    }
                }
            });
        }
        console.log(paramVals);

        return paramVals;
    }

    handleSave = (values) => {
        const { dialogConfigAction } = this.props;
        let { selectedSite, selectedReportId, startDate, startTime, selectedJobPeriodType, maxRetryCount, active} = values;

        let siteIdList = listUtilities.getFieldFromObjArray(selectedSite, 'item', 'siteId');

        let startDateStr = startDate.format('YYYY-MM-DD');
        let startTimeStr = moment().startOf('day').format('HH:mm:ss');
        let jobStartDtm = new Date(  startDateStr + ' ' + startTimeStr );
        let isDisable = active? 'N': 'Y' ;

        let isReportChanged = false;
        // changes in report id
        let newReportId = selectedReportId.value;
        let selectedReportConfig = this.props.selectedReportConfig;
        let oldReportId = selectedReportConfig  && selectedReportConfig.reportId;
        if(oldReportId){
            isReportChanged = true;
        }

        // let paramVals = this.getGridRowData();
        let paramVals = this.getFunctionParamVals(values);

        let params = {
            siteIds: siteIdList,
            reportId: selectedReportId.value,
            jobStartDtm: jobStartDtm,
            jobPeriodType: selectedJobPeriodType.value,
            maxRetryCount: maxRetryCount,
            paramVals: paramVals,
            isDisable: isDisable,
            isReportChanged:isReportChanged
        };
        console.log('---------------------------------------------------');
        console.log('params: ', params);
        console.log('---------------------------------------------------');

        if (dialogConfigAction === 'create') {
            this.props.postData('reportConfig', params, this.handleDidCreateUpdate );
        } else if (dialogConfigAction === 'update') {
            params = { ...params,
                reportConfigId: this.props.selectedReportConfigId
            };
            this.props.putData('reportConfig', params, this.handleDidCreateUpdate );
        }
    }
    toggleShowHint = () => {
        const hint = this.state.showHint;
        this.setState({showHint: !hint});
    }
    ordinal_suffix_of = (i) => {
        if( i ===  1  ){
            return '';
        }
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + 'st';
        }
        if (j == 2 && k != 12) {
            return i + 'nd';
        }
        if (j == 3 && k != 13) {
            return i + 'rd';
        }
        return i + 'th';
    }

    render() {
        const { classes, dialogConfigAction, open } = this.props;
        const { upcomingSchedule } = this.state;
        const  _scheduleHeader =  upcomingSchedule && upcomingSchedule[0];
        let scheduleHeader = [];
        if(_scheduleHeader){
            scheduleHeader = Object.keys(_scheduleHeader);
            scheduleHeader.shift();
            console.log(scheduleHeader);
        }
        switch (dialogConfigAction) {
            case 'create':
            case 'update': {
                const idConstant = this.props.id + '_' + dialogConfigAction;
                return (
                    <Dialog
                        id={idConstant}
                        open={open}
                        fullWidth
                        maxWidth="lg"
                    >
                        <DialogTitle>Detail</DialogTitle>
                        <DialogContent dividers>
                            <Formik
                                innerRef={this.refForm}
                                enableReinitialize
                                initialValues={{
                                    selectedSite: null,
                                    selectedReportId: null,
                                    selectedUser: null,
                                    startDate: null,
                                    startTime: null,
                                    selectedJobPeriodType: null,
                                    selectedEncounterTypeId: null,
                                    encounterTypeFlag: this.state.encounterTypeFlag,
                                    maxRetryCount: ReportConstant.DEFAULT_MAX_RETRY_COUNT,
                                    active: true
                                }}
                                validationSchema={yup.object().shape(
                                    {
                                    selectedSite: yup
                                        .array()
                                        .nullable()
                                        .required('Required')
                                        ,
                                    selectedReportId: yup
                                        .object()
                                        .nullable()
                                        .required('Required')
                                        ,
                                    startDate: yup
                                        .object()
                                        .nullable()
                                        .required('Required')
                                        .test('isDate', 'Invalid Date Format', function(date) {
                                            return date && date.isValid();
                                        })
                                        ,
                                    selectedEncounterTypeId: yup
                                        .object()
                                        .nullable()
                                        .when('encounterTypeFlag', {
                                            is: true,
                                            then: yup.object().nullable().required('Required')
                                        })
                                    ,
                                    //startTime: yup
                                        //.object()
                                        //.nullable()
                                        //.required('Required')
                                        //.test('isDate', 'Invalid Date Format', function(date) {
                                            //return date && date.isValid();
                                        //})
                                        //,
                                    selectedJobPeriodType: yup
                                        .object()
                                        .nullable()
                                        .required('Required')
                                        ,
                                    //maxRetryCount: yup
                                        //.number()
                                        //.nullable()
                                        //.required('Required')
                                        //.min(1, 'Must be greater than 0')
                                        //.max(99, "Must be <= 99")
                                        //,
                                    reportDesc: yup
                                        .object()
                                        .nullable()
                                        ,
                                    active: yup
                                        .boolean()
                                })}
                                onSubmit={(values, actions) => {
                                    this.handleSave(values);
                                    setTimeout(() => {
                                        actions.setSubmitting(false);
                                    }, 3000);
                                }}
                            >
                            {props => (
                                <Form>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} className={classes.gridRow}>
                                            <Field name="selectedSite">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonSelect
                                                    id={idConstant + '_site'}
                                                    label="* Site English Name"
                                                    options={this.state.sites}
                                                    value={field.value}
                                                    inputProps={{
                                                        isMulti: true,
                                                        hideSelectedOptions: false,
                                                        closeMenuOnSelect: false,
                                                        sortFunc: sortFunc,
                                                        selectAll: '[ Select All ]'
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={(value, params) => {
                                                        this.handleSiteChange(value);
                                                    }}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="selectedSite" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={12} className={classes.gridRow}>
                                            <Field name="selectedReportId">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonSelect
                                                    id={idConstant + '_site'}
                                                    label="* Report Name: Description"
                                                    options={this.state.reportIds}
                                                    value={field.value}
                                                    inputProps={{
                                                        isDisabled: this.props.selectedReportConfig ? true : false,
                                                        hideSelectedOptions: false,
                                                        closeMenuOnSelect: true,
                                                        sortFunc: sortFunc
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    //onChange={value => form.setFieldValue(field.name, value)}
                                                    onChange={(value, params) => {
                                                        this.handleReportIdChange(value);
                                                    }}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="selectedReportId" component="div" className={classes.error} />
                                        </Grid>
                                        {
                                            this.state.encounterTypeFlag ?
                                            <>
                                                <Grid item xs={12} className={classes.gridRow}>
                                                    <Field name="selectedEncounterTypeId">
                                                    {({ field, form, meta }) => (
                                                        <CIMSCommonSelect
                                                            id={idConstant + '_site'}
                                                            label="* Encounter Type"
                                                            options={this.state.encounterTypes}
                                                            value={field.value}
                                                            inputProps={{
                                                                hideSelectedOptions: false,
                                                                closeMenuOnSelect: true,
                                                                sortFunc: sortFunc
                                                            }}
                                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                                            //onChange={value => form.setFieldValue(field.name, value)}
                                                            onChange={(value, params) => {
                                                                this.handleEncounterTypeChange(value);
                                                            }}
                                                        />
                                                    )}
                                                    </Field>
                                                    <ErrorMessage name="selectedEncounterTypeId" component="div" className={classes.error} />
                                                </Grid>
                                            </>
                                            :
                                            null
                                        }
                                        {
                                            (this.state.userIdFlag || this.state.isDoctorUser || this.state.isNurseUser) && !(this.state.isUserFlagError) ?
                                            <>
                                                <Grid item xs={12} className={classes.gridRow}>
                                                    <Field name="selectedUser">
                                                    {({ field, form, meta }) => (
                                                        <CIMSCommonSelect
                                                            id={idConstant + '_site'}
                                                            label="User Name - Email"
                                                            options={this.state.users}
                                                            value={field.value}
                                                            inputProps={{
                                                                hideSelectedOptions: false,
                                                                closeMenuOnSelect: true,
                                                                sortFunc: sortFunc
                                                            }}
                                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                                            //onChange={value => form.setFieldValue(field.name, value)}
                                                            onChange={(value, params) => {
                                                                this.handleUserChange(value);
                                                            }}
                                                        />
                                                    )}
                                                    </Field>
                                                    <ErrorMessage name="selectedUser" component="div" className={classes.error} />
                                                </Grid>
                                            </>
                                            :
                                            null
                                        }
                                        <Grid item xs={3} className={classes.gridRow}>
                                            <Field name="startDate">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonDatePicker
                                                    id={idConstant + '_startDate_picker'}
                                                    label="* Config Start Date"
                                                    value={field.value}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change start date'
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={(value, params) => {
                                                        this.handleStartDateChange(value);
                                                    }}
                                                    onClose={() => form.setFieldTouched(field.name, true)}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="startDate" component="div" className={classes.error} />
                                        </Grid>
                                {
                                        //<Grid item xs={3} className={classes.gridRow}>
                                            //<Field name="startTime">
                                            //{({ field, form, meta }) => (
                                                //<CIMSCommonTimePicker
                                                    //id={idConstant + '__picker'}
                                                    //label="* Start Time"
                                                    //value={field.value}
                                                    //KeyboardButtonProps={{
                                                        //'aria-label': 'change start time'
                                                    //}}
                                                    //onBlur={() => form.setFieldTouched(field.name, true)}
                                                    //onChange={value => form.setFieldValue(field.name, value)}
                                                    //onClose={() => form.setFieldTouched(field.name, true)}
                                                ///>
                                            //)}
                                            //</Field>
                                            //<ErrorMessage name="startTime" component="div" className={classes.error} />
                                        //</Grid>
                                }

                                        <Grid item xs={3} className={classes.gridRow}>
                                            <Field name="selectedJobPeriodType">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonSelect
                                                    id={idConstant + '_site'}
                                                    label="* Job Period Type"
                                                    options={jobPeriodTypeList}
                                                    value={field.value}
                                                    inputProps={{
                                                        hideSelectedOptions: false,
                                                        closeMenuOnSelect: true,
                                                        sortFunc: sortFunc,
                                                        isClearable: false
                                                    }}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={(value, params) => {
                                                        this.handlePeriodTypeChange(value);
                                                    }}
                                                />
                                            )}
                                            </Field>
                                            <ErrorMessage name="selectedJobPeriodType" component="div" className={classes.error} />
                                        </Grid>

                                {
                                        //<Grid item xs={3} className={classes.gridRow}>
                                            //<Field name="maxRetryCount">
                                            //{({ field, form, meta }) => (
                                                //<CIMSCommonTextField
                                                    //id={idConstant + '_maxRetryCount_textField'}
                                                    //label="* Max retry Count"
                                                    //type="number"
                                                    //value={field.value}
                                                    //onBlur={() => form.setFieldTouched(field.name, true)}
                                                    //onChange={value => form.setFieldValue(field.name, value)}
                                                ///>
                                            //)}
                                            //</Field>
                                            //<ErrorMessage name="maxRetryCount" component="div" className={classes.error} />
                                        //</Grid>
                                }

                                        <Grid item xs={2} className={classes.gridRow}>
                                            <Field name="active">
                                            {({ field, form, meta }) => (
                                                <>
                                                <Checkbox
                                                    id={idConstant + '_active'}
                                                    label="active"
                                                    name="checkbox"
                                                    color="primary"
                                                    value={field.value}
                                                    checked={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={(e) => {
                                                        let checkedVal = e.target.checked;
                                                        form.setFieldValue(field.name, checkedVal);
                                                        }
                                                    }
                                                />
                                                <span> Active </span>
                                                </>
                                            )}
                                            </Field>
                                            <ErrorMessage name="active" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={12} className={classes.hintRow}>
                                                {
                                                    !Array.isArray(upcomingSchedule) || !upcomingSchedule.length? null:
                                                        <>
                                                            {
                                                                !this.state.showHint ?
                                                                <>
                                                                    <span className={classes.hintExampleTable} onClick={this.toggleShowHint}> Show </span>

                                                                </>:
                                                                <>
                                                                    <span className={classes.hintExampleTable} onClick={this.toggleShowHint}> Hide </span>
                                                                </>
                                                            }
                                                            <span className={classes.hintHead}> the upcoming schedules </span>
                                                        </>
                                                }

                                        </Grid>
                                        {
                                            //!this.state.showHint? null:
                                            <div className={
                                                    !this.state.showHint ? classes.hideTableHint:classes.showTableHint
                                            }
                                            >

                                            {
                                                <table id="report-config-hint" className={
                                                    classes.tableHint
                                                }
                                                >
                                                  <tr>
                                                    <th> Report Parameters \ Run Date</th>
                                                {
                                                    scheduleHeader.map(( header,idx) =><th key={idx}>{this.ordinal_suffix_of(idx +1)  + ' Next Run ( ' + header + ' )'}</th>)
                                                }

                                                  </tr>
                                                {
                                                    upcomingSchedule.map((obj)=>{
                                                        const values = Object.values(obj);
                                                        const cells = values.map((val, idx) => {
                                                            return <td key={idx}>{val}</td>;
                                                        });
                                                        const row = <tr> {cells}</tr>;
                                                        return ( row );
                                                    })
                                                }
                                                </table>
                                            }
                                                <br/>
                                                </div>
                                        }

                                        <DynamicForm
                                            forwardedRef={this.refGrid}
                                            innerRef={this.refGridForm}
                                            session={this.state.session}
                                            originalRowData={null}
                                            rowData={null}
                                            rowId={-1}
                                            onValuesChanged={props => {
                                                // console.log(props.values);
                                                const { rowData } = props.values;
                                                if (rowData)
                                                    this.setState({ isChanged: rowData.some(x => x.action !== null && !(x.action === 'delete' && x.tmsltPlanId == null)) });
                                            }}
                                            onErrorsChanged={props => {
                                                // console.log(props.errors);
                                                this.setState({ isValid: !props.errors.rowData });
                                            }}
                                        />
                                        <Grid item container xs={12}>
                                            <Grid item xs={1}>
                                                <CIMSCommonButton
                                                    id={idConstant + '_save'}
                                                    disabled={props.isSubmitting}
                                                    onClick={()=>{this.handleValidate(props);}}
                                                >
                                                    save
                                                </CIMSCommonButton>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <CIMSCommonButton
                                                    id={idConstant + '_cancel'}
                                                    onClick={this.handleClose}
                                                >
                                                    Cancel
                                                </CIMSCommonButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                            </Formik>
                        </DialogContent>
                        <DialogActions className={classes.dialogActions}>
                        </DialogActions>
                    </Dialog>
                );
            }
            default: return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        dialogConfigAction: state.reportTemplate.dialogConfigAction,
        selectedReportConfigId: state.reportTemplate.selectedReportConfigId,
        selectedReportConfig: state.reportTemplate.selectedReportConfig,
        selectedReportConfigVals: state.reportTemplate.selectedReportConfigVals,
        reportConfigParamValList: state.reportTemplate.reportConfigParamValList,
        prefillReportConfig: state.reportTemplate.prefillReportConfig,
        clinicList: state.common.clinicList,
        encounterTypes: state.common.encounterTypes,
        reportConfigList: state.reportTemplate.reportConfigList,
        serviceCd: state.login.service.serviceCd,
        reportTemplateList: state.reportTemplate.reportTemplateList,
        users: state.reportTemplate.users,
        siteId: state.login.clinic.siteId
    };
}

const mapDispatchToProps = {
    updateField,
    requestData,
    postData,
    putData
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(ReportConfigDialog)));

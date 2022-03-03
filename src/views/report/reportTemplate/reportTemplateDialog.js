import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSDialog from '../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSInputLabel from '../../../components/InputLabel/CIMSInputLabel';
import CIMSFormLabel from '../../../components/InputLabel/CIMSFormLabel';
import { colors } from '@material-ui/core';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Card,
    CardHeader,
    CardContent,
    Checkbox,
    FormHelperText,
    FormGroup,
    FormControl,
    FormControlLabel,
    Input,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import {
    ArrowDropDown as ArrowDropDownIcon
} from '@material-ui/icons';
import {
    KeyboardDatePicker
} from '@material-ui/pickers';
import withWidth from '@material-ui/core/withWidth';
import TimeFieldValidator from '../../../components/FormValidator/TimeFieldValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import ReactSelect from '../../../components/Select/ReactSelect';
import Enum from '../../../enums/enum';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';

import _ from 'lodash';
import moment from 'moment';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';

import {
    requestData,
    postData,
    updateField
} from '../../../store/actions/report/reportTemplateAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CommonMessage from '../../../constants/commonMessage';
import CommonRegex from '../../../constants/commonRegex';
import * as reportConstant from '../../../constants/report/reportConstant';
import ValidatorEnum from '../../../enums/validatorEnum';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import * as messageUtilities from '../../../utilities/messageUtilities';
import * as reportUtilities from '../../../utilities/reportUtilities';
import * as listUtilities from '../../../utilities/listUtilities';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
import * as CommonUtil from '../../../utilities/commonUtilities';
import * as userConstants from '../../../constants/user/userConstants';
import CIMSCommonSelect from '../../../components/Select/CIMSCommonSelect';
import { fade } from '@material-ui/core/styles/colorManipulator';

import DynamicForm from './component/DynamicForm';


const styles = theme => ({
    gridRow: {
        minHeight: '80px'
    },
    fieldMargin: {
        marginRight: '25px'
    },
    card: {
        width: '100%',
        marginTop: 8
    },
    cardHeaderRoot: {
        background: theme.palette.text.primary,
        padding: '8px'
    },
    cardHeaderTitle: {
        fontSize: theme.palette.textSize,
        color: theme.palette.background.default,
        fontWeight: 'bold'
    },
    dialogActions: {
        justifyContent: 'flex-start'
    },
    buttonRoot: {
        minWidth: '150px'
    },
    actionButtonRoot: {
        color: '#0579c8',
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        backgroundColor: '#ffffff',
        minWidth: '90px',
        '&:disabled': {
            border: 'solid 1px #aaaaaa',
            boxShadow: '1px 1px 1px #6e6e6e'
        },
        '&:hover': {
            color: '#ffffff',
            backgroundColor: '#0579c8'
        }
    },
    disabledTextFieldRoot: {
        backgroundColor: Colors.grey[200]
    },
    multipleTipRoot: {
        color: theme.palette.primary.main
    },
    disableChangeTimeFromHelper: {
        paddingLeft: 5,
        color: theme.palette.primary.main
    },
    multipleUpdateForm: {
        width: 800,
        height: 550,
        paddingTop: 20
    },
    labelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    },
    inputLabel: {
        //zIndex: 1
    },
    error: {
        color: 'red',
        fontSize: '0.75rem'
    },
    // selectRoot: {
    //     color: fade(Colors.common.black, 1) + ' !important',
    //     '&$shrink': {
    //         transform: 'translate(14px, -10px) scale(0.75)',
    //         borderRadius: '4px',
    //         backgroundColor: Colors.common.white,
    //         padding: '2px 4px 2px 4px'
    //     }
    // },
    // selectOption: {
    //     minWidth: '250px'
    // },
    selectOptionScrollBar: {
        '& div': {
            maxHeight: '70px',
            overflowY: 'auto'
        }
    }
});

const sortFunc = (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

class ReportTemplateDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fontsLoaded: false,
            rooms: props.roomList.filter(x => x.clinic === props.siteId)
                .map(x => ({
                    value: x.rmId,
                    label: x.description,
                    item: x
                })),
            sites: reportUtilities.getAdminSite(this.props.loginUserDto.uamMapUserSvcDtos, this.props.loginUserDto.uamMapUserSiteDtos,
                this.props.clinicList, this.props.selectedTemplate.reportAdminType, this.props.serviceCd),
                //users: props.users && props.users.filter(user =>  user.uamMapUserSiteDtos && user.uamMapUserSiteDtos.filter(x => x. siteId === props.siteId).length > 0 )
            users: props.users
                .map(x => ({
                    value: x.userId,
                    label: x.engGivName + ' ' + x.engSurname + ' - ' + x.email,
                    item: x
                })),
            // Check type id or desc
            // Report not support Encounter Desc; Set the encounterTypes Map ID Only
            encounterTypes: [
                reportUtilities.getSelectAllOption()
            ],
            siteMenuOpen: false,
            siteInput: '',
            siteIdFlag: false,
            rptPeriodStartFlag: false,
            rptModeFlag: false,
            rptTemp24Flag: false,
            rptPeriodEndFlag: false,
            rptRoomFlag: false,
            rptRoomOverbookFlag: false,
            rptNumberOfWeekFlag: false,
            rpt34RoomFlag: false,
            userIdFlag: false,
            // ------- IS_DOCTOR_USER && IS_NURSE_USER && IS_DTS_USER --------
            isDoctorUser: false,
            isNurseUser: false,
            isDtsUser: false,
            isUpdateDtsUser: false,
            isUserFlagError: false,
            // -------------------------------------------------
            // encounterTypeFlag --- Encounter ID
            encounterTypeFlag: false,
            encounterTypeInput: '',
            encounterTypeMenuOpen: false,
            // Report not support Encounter Desc; delete this encounterTypeErrorFlag
            encounterTypeErrorFlag: false,
            encounterTypeIdInput: false,
            // encounterTypeFlag --- Encounter ID
            startDate: null,
            endDate: null,
            rpt34StartDate: null,
            rpt34EndDate: null,
            selectedUser: null,
            userMenuOpen: false,
            userInput: '',
            enableInstantGen: false,
            // rpt32ModuValue: 'S',
            rptModuValue: '',
            rptModuParamName: '',

            // TODO remove after test
            // ---------------------------------------------------
            sortedColumns: ['paramName', 'paramDesc', 'paramType', 'paramVal'],
            dataLoaded: false,
            isChanged: false,
            isValid: false,
            locked: false,
            rowData: [],
            //rowData: [
            //{
            //"paramName": "YEAR_NO",
            //"paramDesc": "Year number",
            //"rptTmplParamId": 0,
            //"rowId": 0,
            //"paramType": "number",
            //"provided": null,
            //"value": null
            //},
            //{
            //"paramName": "MONTH_NO",
            //"paramDesc": "month number",
            //"rptTmplParamId": 1,
            //"rowId": 1,
            //"paramType": "number",
            //"provided": null,
            //"value": null
            //}
            //],
            // ---------------------------------------------------
            formData: []
        };

        switch (this.props.selectedTemplate.reportAdminType) {
            // Type : A, S, N Type add Select All Option
            // case reportConstant.RPT_ADMIN_TYPE.RPT_SVC_N_SITE_ADMIN :
            case reportConstant.RPT_ADMIN_TYPE.RPT_SVC_ADMIN :
            case reportConstant.RPT_ADMIN_TYPE.RPT_NAN_ADMIN :
                let isAllSiteSupport = this.props.selectedTemplate && this.props.selectedTemplate.isAllSite
                    ? this.props.selectedTemplate.isAllSite === reportConstant.IS_ALL_SITE.ture : null;
                if (isAllSiteSupport) {
                    this.state.sites.unshift(
                        reportUtilities.getSelectAllOption()
                    );
                }
            break;
            default:
        }

        this.refForm = React.createRef();
        this.refGridForm = React.createRef();
        this.refGrid = React.createRef();

        this.refRoomNormalSelect = null;
        this.setRefRoomNormalSelect = el => this.refRoomNormalSelect = el;

        this.refRoomOverbookSelect = null;
        this.setRefRoomOverbookSelect = el => this.refRoomOverbookSelect = el;
    }

    UNSAFE_componentWillMount() {
    }

    componentDidMount() {
        this.getUsersByRole();
        if (document.fonts) {
            document.fonts.ready
                .then(() => {
                    this.setFontsLoaded(true);
                });
        }
        let selectedTemplate = this.props.selectedTemplate;
        if (selectedTemplate) {
            this.updateLocalState(selectedTemplate);
            let rowData = selectedTemplate && selectedTemplate.rptTmplParamList;
            setTimeout(() => {
                this.updateLocalDetailState(rowData);
            }, 0);
        }
        let siteIdFlag = false;
        let rptModeFlag = false;
        let rptPeriodStartFlag = false;
        let rptPeriodEndFlag = false;
        let userIdFlag = false;
        let isDoctorUser = false;
        let isNurseUser = false;
        let isDtsUser = false;
        let isUpdateDtsUser = false;
        let encounterTypeFlag = false;
        let isUserFlagError = false;
        let rptRoomFlag = false;
        let rptRoomOverbookFlag = false;
        let rptNumberOfWeekFlag = false;
        let rpt34RoomFlag = false;
        let rptModuParamsName = '';
        let rptModuValue = '';

        const selectedRptTmplParamList = selectedTemplate && selectedTemplate.rptTmplParamList;

        if (selectedRptTmplParamList) {
            selectedRptTmplParamList.forEach((x) => {
                if (x.paramCategory === reportConstant.RPT_TMPL_PARAM_CATEGORY_CODE.function) {
                    if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.siteId) {
                        siteIdFlag = true;
                    }
                    // else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptMode) {
                    //     rptModeFlag = true;
                    // }
                    else if (reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptMode.hasOwnProperty(x.paramName)) {
                        rptModuParamsName = x.paramName;
                        rptModeFlag = true;
                        const defaultRptModuObj = reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptMode[x.paramName].find(ele => ele.isDefault);
                        rptModuValue = defaultRptModuObj && defaultRptModuObj.value;
                    }
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptPeriodStart) {
                        rptPeriodStartFlag = true;
                    }
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptPeriodEnd) {
                        rptPeriodEndFlag = true;
                    }
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptRoom) {
                        rptRoomFlag = true;
                    }
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptRoomOverbook) {
                        rptRoomOverbookFlag = true;
                    }
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptNumberOfWeek) {
                        rptNumberOfWeekFlag = true;
                    }
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.rpt34Room) {
                        rpt34RoomFlag = true;
                        this.setState((state) => { rooms: state.rooms.unshift(reportUtilities.getSelectAllOption()); });
                    }
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.userId
                        || x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId
                        || x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId
                        || x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.dtsUserId
                    ) {
                        if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.userId) {
                            // Checking error user only supports
                            if (isDoctorUser || isNurseUser || isDtsUser) {
                                isUserFlagError = true;
                            }
                            userIdFlag = true;
                        } else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.doctorUserId) {
                            if (userIdFlag || isNurseUser || isDtsUser) {
                                isUserFlagError = true;
                            }
                            isDoctorUser = true;
                        } else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.nurseUserId) {
                            if (userIdFlag || isDoctorUser || isDtsUser) {
                                isUserFlagError = true;
                            }
                            isNurseUser = true;
                        } else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.dtsUserId) {
                            if (userIdFlag || isDoctorUser || isNurseUser) {
                                isUserFlagError = true;
                            }
                            isDtsUser = true;
                        }
                    }
                    // encounterType need display select box
                    // different Mapping or (id or desc [encounterTypeId | encounterTypeDesc])
                    else if (x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeId
                        || x.paramName === reportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeDesc) {
                        // Checking Error if Database have two encounter Type base Param in RPT_TMPL_PARAM table
                        // Report not support Encounter Desc; delete this encounterTypeErrorFlag
                        // ~~~~~~~~~~~~~~~~~~~~~~~~  Delete  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                        if (encounterTypeFlag === true) {
                            this.setState({
                                encounterTypeErrorFlag: true
                            });
                        }
                        // ~~~~~~~~~~~~~~~~~~~~~~~~Delete End~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                        encounterTypeFlag = true;
                        this.setState({
                            encounterTypes: this.state.encounterTypes.concat(this.props.encounterTypes.map(y => ({
                                value: reportConstant.RPT_TMPL_PARAM_NAME_CODE.encounterTypeDesc ? y.encntrTypeDesc : y.encntrTypeId,
                                label: y.encntrTypeCd + ' - ' + y.encntrTypeDesc,
                                item: y
                            })))
                        });
                    }
                }
            });
        }

        if (isDtsUser && !isUserFlagError) {
            this.getUsersByDts();
        }
        if ((isDoctorUser || isNurseUser) && !isUserFlagError) {
            this.handleUserStateUpdate(isDoctorUser, isNurseUser, isDtsUser);
        }

        let formFlags = {
            siteIdFlag: siteIdFlag,
            rptModeFlag: rptModeFlag,
            rptPeriodStartFlag: rptPeriodStartFlag,
            rptPeriodEndFlag: rptPeriodEndFlag,
            userIdFlag: userIdFlag,
            isDoctorUser: isDoctorUser,
            isNurseUser: isNurseUser,
            isDtsUser: isDtsUser,
            isUpdateDtsUser: isUpdateDtsUser,
            isUserFlagError: isUserFlagError,
            encounterTypeFlag: encounterTypeFlag,
            rptRoomFlag: rptRoomFlag,
            rptRoomOverbookFlag: rptRoomOverbookFlag,
            rptNumberOfWeekFlag: rptNumberOfWeekFlag,
            rpt34RoomFlag: rpt34RoomFlag,
            rptModuParamsName: rptModuParamsName,
            rptModuValue: rptModuValue
        };
        this.setState(formFlags);
    }

    componentDidUpdate(prevProps, prevState) {
        let selectedTemplate = this.props.selectedTemplate;
        if (prevProps.selectedTemplate !== this.props.selectedTemplate) {
            this.updateLocalState(selectedTemplate);
            //TODO REMOVE
            //---------------------------------------------------
            let rowData = selectedTemplate && selectedTemplate.rptTemplParamList;
            this.updateLocalDetailState(rowData);
            //---------------------------------------------------
            if ((this.state.isDoctorUser || this.state.isNurseUser || this.state.isDtsUser) && !this.state.userIdFlag) {
                this.handleUserStateUpdate(this.state.isDoctorUser, this.state.isNurseUser, this.state.isDtsUser);
            }
        }
        if (prevState.isUpdateDtsUser != false && this.props.users !== prevProps.users) {
            let updatedUsers = this.props.users.map(x => ({
                value: x.userId,
                label: x.engGivName + ' ' + x.engSurname + ' - ' + x.email,
                item: x
            }));
            this.setState({
                isUpdateDtsUser: false,
                users: updatedUsers
            });
        }
        // Default value
        if (this.getForm()) {
            const form = this.getForm();
            if (form) {
                let selectedEncounterType = form.getFieldMeta('selectedEncounterType');
                let selectedUser = form.getFieldMeta('selectedUser');
                if (selectedUser.value === null) {
                    if (!this.state.isDtsUser) {
                        // Not Select Svc / Site User Right
                        if (this.props.isStatReportSvcUsersRight() || this.props.isStatReportSiteUsersRight()) {
                            form.setFieldValue('selectedUser', reportUtilities.getSelectAllOption(
                                this.state.isDoctorUser ? reportConstant.SELECT_ALL_USER_DOCTOR_ROLE_LABEL
                                    : (this.state.isNurseUser ? reportConstant.SELECT_ALL_USER_NURSE_ROLE_LABEL : null)));
                        }
                    }
                }
                if (selectedEncounterType.value === null) {
                    form.setFieldValue('selectedEncounterType', reportUtilities.getSelectAllOption());
                }
            }
        }
    }

    // To filter Redux data to state
    // filterReduxUserByRole
    getUsersByRole = () => {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getUsersByRole ~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        if (this.props.isStatReportSiteUsersRight() || this.props.isStatReportSvcUsersRight()) {
            let selectedSite = null;
            let selectedSiteCd = null;
            setTimeout(() => {
                const form = this.getForm();
                if (form) {
                    selectedSite = form.getFieldMeta('selectedSite');
                    selectedSiteCd = this.props.clinicList.filter(clinic => clinic.siteId === selectedSite.value.value)[0].siteCd;
                    console.log('selectedSiteCd : ', selectedSiteCd);
                    console.log('selectedSite');
                    console.log(selectedSite.value.value);
                    console.log('selectedSite');
                }
            }, 200);

            // All Site Selection for usrer ?
            let isSelectAllSiteOption = selectedSite && selectedSite.value && selectedSite.value.value
                && selectedSite.value.value === reportConstant.SELECT_ALL_OPTIONS;

            let updatedUsers = reportUtilities.filterReportTemplateUsersByServiceCdNClinicCdNRole(
                this.props.users, /* reportTemplate set redux logic :. Not need update redux*/
                this.props.serviceCd /* Login Service Code */,
                isSelectAllSiteOption ? null : selectedSiteCd ? [selectedSiteCd] : null /* Checking Site if [ - ] not need filter Site  */,
                this.state.isDoctorUser, this.state.isNurseUser, this.state.isDtsUser);

            if (this.props.isStatReportSvcUsersRight() || this.props.isStatReportSiteUsersRight()) {
                updatedUsers.unshift(reportUtilities.getSelectAllOption(
                    this.state.isDoctorUser ? reportConstant.SELECT_ALL_USER_DOCTOR_ROLE_LABEL
                        : (this.state.isNurseUser ? reportConstant.SELECT_ALL_USER_NURSE_ROLE_LABEL : null)));
            }

            this.setState({
                users: updatedUsers
            });
        }
    }

    setFontsLoaded(complete) {
        this.setState({ fontsLoaded: complete });
    }

    getForm = () => {
        if (this.refForm.current) {
            let form = this.refForm.current;
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

    // TODO REMOVE after test
    // --------------------------------------------------
    //
    getGridForm = () => {
        if (this.refGridForm.current) {
            let form = this.refGridForm.current;
            return form;
        }
        return null;
    }

    updateLocalDetailState = (data) => {
        const form = this.getGridForm();
        if (!form)
            return;
        let rowData = [];
        console.log('---------------------------------------------------');
        console.log(data);
        data = data.filter(x => x.paramCategory === reportConstant.RPT_TMPL_PARAM_CATEGORY_CODE.all || x.paramCategory === reportConstant.RPT_TMPL_PARAM_CATEGORY_CODE.instantGen);
        console.log(data);
        console.log('---------------------------------------------------');
        let { rowId } = form.values;
        for (let i = 0; i < data.length; i++) {
            //let { paramName, paramDesc, paramType, value } = data[i];
            let { ...rest } = data[i];
            //let { stime, etime, ...rest } = data[i];
            // rowData.push({ stime: moment(stime, 'HH:mm'), etime: moment(etime, 'HH:mm'), ...rest, rowId: ++rowId});
            rowData.push({ ...rest, rowId: ++rowId });
        }
        form.setFieldValue('originalRowData', data);
        form.setFieldValue('rowData', rowData);
        form.setFieldValue('rowId', rowId);
        // this.setGridData(rowData);
        this.setState({ dataLoaded: true });
    }

    // --------------------------------------------------
    updateLocalState = (data) => {
        let value;
        let selectedSite = (value = this.state.sites && this.state.sites.find(x => x.value === data.siteId), value);
        const { enableInstantGen } = data;
        this.setState({
            selectedSite: this.state.sites.find(x => x.value === this.props.siteId),
            enableInstantGen: enableInstantGen
        });
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
        // TODO
        // Update to touch all cells instead of column
        if (len) {
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

    getCSVGridValue = () => {
        const form = this.getGridForm();
        console.log('---------------------------------------------------');
        let rowData = form && form.values && form.values.rowData;
        console.log(rowData);
        console.log('---------------------------------------------------');
        let paramStringMap = [];
        for (let i = 0; i < rowData.length; i++) {
            let keyValStr = rowData[i]['paramName'] + '=' + rowData[i]['paramVal'];
            paramStringMap.push(keyValStr);
        }
        let paramString = paramStringMap.join(',');
        console.log('---------------------------------------------------');
        console.log(paramString);
        console.log('---------------------------------------------------');
        return paramString;

    }

    handleSiteChange = (site, callback) => {
        const form = this.getForm();
        setTimeout(() => {
            form.setFieldValue('selectedSite', site);
        }, 300);

        if (!this.state.isDtsUser) {
            // Not Select Svc / Site User Right
            if (this.props.isStatReportSvcUsersRight() || this.props.isStatReportSiteUsersRight()) {
                form.setFieldValue('selectedUser', reportUtilities.getSelectAllOption(this.state.isDoctorUser
                    ? reportConstant.SELECT_ALL_USER_DOCTOR_ROLE_LABEL
                        : (this.state.isNurseUser ? reportConstant.SELECT_ALL_USER_NURSE_ROLE_LABEL : null)));
            }
        }
        form.setFieldValue('selectedEncounterType', reportUtilities.getSelectAllOption());
        if (this.state.rpt34RoomFlag) form.setFieldValue('selectedRpt34Room', []);
        if (this.state.rptRoomFlag) form.setFieldValue('selectedRoomNormal', []);
        if (this.state.rptRoomOverbookFlag) form.setFieldValue('selectedRoomOverbook', []);
        const { roomList } = this.props;
        const newRooms = _.isEmpty(site) ? roomList : roomList.filter(x => x.clinic === site.value)
            .map(x => ({
                value: x.rmId,
                label: x.description,
                item: x
            }));
        if (site && site.value) {
            let siteId = site.value;
            this.handleUserStateUpdate(this.state.isDoctorUser, this.state.isNurseUser, this.state.isDtsUser);
            if (this.state.rpt34RoomFlag) {
                newRooms.unshift(reportUtilities.getSelectAllOption());
                this.setState({ rooms: newRooms });
            } else {
                this.setState({
                    rooms: newRooms
                });
            }
        } else {
            this.setState({rooms: []});
        }
    }

    getUsersByDts = () => {
        const form = this.getForm();
        let startDate = null;
        let endDate = null;
        let updatedUsers = [];
        let isUpdateDtsUser = false;
        if (form){
            startDate = form.getFieldMeta('startDate');
            endDate = form.getFieldMeta('endDate');
        }
        if (startDate !== null && endDate !== null && startDate.initialValue != null && endDate.initialValue != null
            && moment(startDate.initialValue).isValid() && moment(endDate.initialValue).isValid()) {
            isUpdateDtsUser = true;
            this.props.requestData('userByDtsService',
                {
                    startDate: moment(startDate.initialValue).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
                    endDate: moment(endDate.initialValue).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE)
                }
            );
        }
        this.setState({
            users: updatedUsers,
            isUpdateDtsUser: isUpdateDtsUser
        });

    }

    handleStartDateChange = (fieldValueName, startDate, callback) => {
        this.setState({
            startDate : startDate
        });
        setTimeout(() => {
            this.getUsersByDts();
        }, 200);
    }

    handleEndDateChange = (fieldValueName, endDate, callback) => {
        this.setState({
            endDate : endDate
        });
        setTimeout(() => {
            this.getUsersByDts();
        }, 200);
    }

    handleUserStateUpdate = (isDoctorUser, isNurseUser, isDtsUser) => {
        if (!isDtsUser && (this.props.isStatReportSiteUsersRight() || this.props.isStatReportSvcUsersRight())) {
            const form = this.getForm();
            let selectedSite = null;
            let selectedSiteCd = null;
            if (form) {
                selectedSite = form.getFieldMeta('selectedSite');
                selectedSiteCd = this.props.clinicList.filter(clinic => clinic.siteId === selectedSite.value.value)[0].siteCd;
                console.log('selectedSiteCd');
                console.log(selectedSiteCd);
                console.log(selectedSite.value.value);
                console.log('selectedSite');
            }

            let isSelectAllSiteOption = selectedSite && selectedSite.value && selectedSite.value.value
                && selectedSite.value.value === reportConstant.SELECT_ALL_OPTIONS;

            let users = reportUtilities.filterReportTemplateUsersByServiceCdNClinicCdNRole(
                this.props.users,
                this.props.serviceCd /* Login Service Code */,
                isSelectAllSiteOption ? null : selectedSiteCd ? [selectedSiteCd] : null /* Checking Site if [ - ] not need filter Site  */,
                isDoctorUser, isNurseUser, isDtsUser);

            users = reportUtilities.mapUuserByReportUserState(users);

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Report User State -- List of All ID ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Set All user in the Option;
            let allUserId = '';
            users.forEach(user =>
                allUserId === '' ? allUserId += user.value : allUserId += ',' + user.value
            );
            console.log(' allUserId = ', allUserId);
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Report User State -- List of All ID ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            if (this.props.isStatReportSvcUsersRight() || this.props.isStatReportSiteUsersRight()) {
                users.unshift(reportUtilities.getSelectAllOption(isDoctorUser
                    ? reportConstant.SELECT_ALL_USER_DOCTOR_ROLE_LABEL
                        : (isNurseUser ? reportConstant.SELECT_ALL_USER_NURSE_ROLE_LABEL : null)));
            }
            console.log(' Users: ', users);

            this.setState({users: users});
        }
    }

    handleClose = () => {
        this.props.updateField({ dialogTemplateOpen: false });
    }

    handleSubmit = () => {
        this.refs.form.submit();
    }

    navigateToReportHistory = (jobData) => {
        this.props.updateField({ activePageMode: 'history', jobData: jobData || null});
    }

    handleSave = (values) => {
        let selectedTemplate = this.props.selectedTemplate;
        let isInstantGen = values.isInstantGen;
        let svcCd = this.props.serviceCd;
        let loginName = this.props.loginName;
        let siteId = values.selectedSite && values.selectedSite.value;
        let userId = values.selectedUser && values.selectedUser.value;
        let reportId = selectedTemplate && selectedTemplate.reportId;
        let encounterTypeInputVal = values.selectedEncounterType && values.selectedEncounterType.value;
        // let rptPeriodStart = values.startDate ? moment(values.startDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : null;
        // DEFAULT rpt add a month from start date
        // let rptPeriodEnd = values.endDate ? moment(values.endDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : null;
        let selectedRpt34Room = values.selectedRpt34Room && !!values.selectedRpt34Room.item ? (values.selectedRpt34Room.label.includes('ALL') ? '-9' : values.selectedRpt34Room.item.rmId) : null;
        let numOfWeekValue = values.numOfWeek ? values.numOfWeek : '52';
        // let rpt32ModuValue = values.selectedRptMode ? values.selectedRptMode: null;

        let selectedSvc = this.props.serviceList.find(x => x.svcCd === this.props.serviceCd);
        let svcName = selectedSvc && selectedSvc.svcName;
        let selectedSite = this.props.clinicList.find(x => x.siteId === this.props.siteId);
        let siteName = selectedSite && selectedSite.siteName;
        let startDateValue;
        let endDateValue;
        if (this.state.rpt34RoomFlag) {
            startDateValue = values.rpt34StartDate;
            endDateValue = values.rpt34EndDate;
        } else {
            startDateValue = values.startDate;
            endDateValue = values.endDate;
        }
        let rptPeriodStart = startDateValue ? moment(startDateValue).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : null;
        let rptPeriodEnd = endDateValue ? moment(endDateValue).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : null;
        let rptParamMap = {
            // TODO remove when multiple param feature is ready
            SITE_ID: siteId,
            SITE_NAME: siteName,
            SVC_CD: svcCd,
            SVC_NAME: svcName,
            RPT_IMG_PATH: 'images/',
            START_DATE: rptPeriodStart,
            END_DATE: rptPeriodEnd,
            RUN_BY_LOGIN: loginName
        };
        // // Refactoring :. this logic for function
        if (!this.state.isUserFlagError) {
            if (this.state.isDtsUser) {
                rptParamMap = {
                    ...rptParamMap,
                    DTS_USER_ID: userId
                };
            } else if (this.state.isNurseUser) {
                rptParamMap = {
                    ...rptParamMap,
                    NURSE_USER_ID: userId
                };
            } else if (this.state.isDoctorUser) {
                rptParamMap = {
                    ...rptParamMap,
                    DOCTOR_USER_ID: userId
                };
            } else if (this.state.userIdFlag) {
                rptParamMap = {
                    ...rptParamMap,
                    USER_ID: !(this.state.userIdFlag) ? userId : null
                };
            }
        }

        // if (this.state.rptModeFlag) {
        //     rptParamMap = {
        //         ...rptParamMap,
        //         // [reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptMode]: rpt32ModuValue
        //         [reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptMode]: this.state.rpt32ModuValue
        //     };
        // }
        if (this.state.rptModeFlag) {
            rptParamMap = {
                ...rptParamMap,
                // [reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptMode]: rpt32ModuValue
                [this.state.rptModuParamsName]: this.state.rptModuValue
            };
        }
        if (this.state.rptRoomFlag) {
            let roomIDList, roomNameList;
            roomIDList = listUtilities.getFieldFromObjArray(values.selectedRoomNormal, 'value');
            roomIDList = listUtilities.uniqueList(roomIDList);
            //roomNameList = listUtilities.getFieldFromObjArray(values.selectedRoomNormal, 'label');
            //roomNameList = listUtilities.uniqueList(roomNameList);
            rptParamMap = {
                ...rptParamMap,
                [reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptRoom]: roomIDList
                //[reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptRoomName]: roomNameList.join(', ')
            };
        }
        if (this.state.rptRoomOverbookFlag && values.selectedRoomOverbook && values.selectedRoomOverbook.length > 0) {
            let roomIDOverbookList, roomNameObList;
            if (values.selectedRoomNormal && values.selectedRoomNormal.length == this.state.rooms.length) {
                roomIDOverbookList = '';
                roomNameObList = '';
            } else {
                roomIDOverbookList = listUtilities.getFieldFromObjArray(values.selectedRoomOverbook, 'value');
                roomIDOverbookList = listUtilities.uniqueList(roomIDOverbookList);
                roomNameObList = listUtilities.getFieldFromObjArray(values.selectedRoomOverbook, 'label');
                roomNameObList = listUtilities.uniqueList(roomNameObList);
            }
            rptParamMap = {
                ...rptParamMap,
                [reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptRoomOverbook]: roomIDOverbookList
                //[reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptRoomNameOverbook]: roomNameObList.join(', ')
            };
        }
        if (this.state.rptNumberOfWeekFlag && numOfWeekValue) {
            rptParamMap = {
                ...rptParamMap,
                [reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptNumberOfWeek]: numOfWeekValue
            };
        }
        if (this.state.rpt34RoomFlag) {
            rptParamMap = {
                ...rptParamMap,
                [reportConstant.RPT_TMPL_PARAM_NAME_CODE.rpt34Room]: selectedRpt34Room
            };
        }

        // Report not support Encounter Desc; delete this encounterTypeErrorFlag and ENCOUNTER_TYPE_DESC checking logic
        if (this.state.encounterTypeFlag && !this.state.encounterTypeErrorFlag) {
            if (this.state.encounterTypeIdInput) {
                rptParamMap = {
                    ...rptParamMap,
                    ENCOUNTER_TYPE_ID: encounterTypeInputVal
                };
            } else {
                rptParamMap = {
                    ...rptParamMap,
                    ENCOUNTER_TYPE_DESC: encounterTypeInputVal
                };
            }
        }

        let paramString = reportUtilities.getCSVStringFromObj(rptParamMap);
        let csvGridValue = this.getCSVGridValue();
        if (csvGridValue.length > 0) {
            paramString += ',';
            paramString += csvGridValue;
        }

        let params = {
            svcCd: svcCd,
            siteId: siteId === reportConstant.SELECT_ALL_OPTIONS ? null : siteId,
            userId: this.state.userIdFlag ? userId : null,
            reportId: reportId,
            rptPeriodStart: rptPeriodStart,
            rptPeriodEnd: rptPeriodEnd,
            paramString: paramString
        };
        if (isInstantGen == 'Y') {
            this.props.rptHistoryPrefill();
            this.props.postData('instantReportGen', params, (data) => {
                this.navigateToReportHistory(data);
                //this.props.updateField({ jobData: data || null });
            });

            //this.props.postData('instantReportGen', params, this.navigateToReportHistory);
        } else {
            params = {
                ...params,
                isInstantGen: 'N',
                jobStartTime: moment().endOf('day'),
                retryCount: 0,
                maxRetryCount: reportConstant.DEFAULT_MAX_RETRY_COUNT,
                result: 'Pending'
            };
            this.props.rptHistoryPrefill();
            this.props.postData('dayEndGen', params, this.navigateToReportHistory);
        }
        this.handleClose();
    }

    handleInstantGen = (props) => {
        this.validateGrid().then((validateResult) => {
            console.log('---------------------------------------------------');
            console.log(validateResult);
            console.log('---------------------------------------------------');
            if (!validateResult) {
                return;
            }
            props.setFieldValue('isInstantGen', 'Y', false);
            this.refForm.current.handleSubmit();
        });
    }

    handleDayEndGen = (props) => {
        this.validateGrid().then((validateResult) => {
            console.log('---------------------------------------------------');
            console.log(validateResult);
            console.log('---------------------------------------------------');
            if (!validateResult) {
                return;
            }
            props.setFieldValue('isInstantGen', 'N', false);
            this.refForm.current.handleSubmit();
        });
    }

    touchColumn = (col, len) => {
        const form = this.getGridForm();
        let rowData = form && form.values && form.values.rowData;
        let touchRowData = [];
        for (let i = 0; i < len; i++) {
            touchRowData.push({ [col]: true });
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
            }, 100);
        }
    }

    handleMouseDownCapture = (e, ref) => {
        const select = ref;
        const { scrollHeight, clientHeight } = e.target;
        let scrollBar = false;
        if (scrollHeight > clientHeight) {
            scrollBar = true;
        }

        const menuIsOpen = select && select.state && select.state.menuIsOpen;
        console.log('menu is open', menuIsOpen);

        if (scrollBar) {
            if (menuIsOpen) {
                console.log('menu is opened');
                // Menu is opened
                //open
                console.log('Blur');
            } else {
                //close
                console.log('menu is opened');
                select.blur();
                select.focus();
                console.log('Blur + focus');
            }
        }
    }

    render() {
        const { classes, open, selectedItems, selectedTemplate } = this.props;
        const dialogAction = 'create';
        const idConstant = this.props.id + '_' + dialogAction;
        return (
            <Dialog
                id={idConstant}
                open={open}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle>Generate report: {selectedTemplate && selectedTemplate.reportName}</DialogTitle>
                <DialogContent dividers>
                    <Formik
                        innerRef={this.refForm}
                        enableReinitialize
                        initialValues={{
                            selectedSite: this.state.selectedSite,
                            selectedRptMode: this.state.selectedRptMode,
                            startDate: this.state.startDate,
                            periodType: this.props.selectedTemplate && this.props.selectedTemplate.periodType,
                            endDate: this.state.endDate,
                            rpt34StartDate: this.state.rpt34StartDate,
                            rpt34EndDate: this.state.rpt34EndDate,
                            selectedUser: this.state.selectedUser,
                            rptPeriodStartFlag: this.state.rptPeriodStartFlag,
                            rptPeriodEndFlag: this.state.rptPeriodEndFlag,
                            siteIdFlag: this.state.siteIdFlag,
                            userIdFlag: this.state.userIdFlag,
                            isDoctorUser: this.state.isDoctorUser,
                            isNurseUser: this.state.isNurseUser,
                            isDtsUser: this.state.isDtsUser,
                            encounterTypeFlag: this.state.encounterTypeFlag,
                            selectedEncounterType: this.state.selectedEncounterType,
                            rptModeFlag: this.state.rptModeFlag,
                            rptRoomFlag: this.state.rptRoomFlag,
                            rptRoomOverbookFlag: this.state.rptRoomOverbookFlag,
                            rptNumberOfWeekFlag: this.state.rptNumberOfWeekFlag,
                            rpt34RoomFlag: this.state.rpt34RoomFlag,
                            selectedRpt34Room: this.state.selectedRpt34Room,
                            selectedRoomNormal: this.state.selectedRoomNormal,
                            selectedRoomOverbook: this.state.selectedRoomOverbook,
                            numOfWeek: this.state.numOfWeek
                        }}
                        validationSchema={
                            yup.object().shape({
                                selectedSite: yup
                                    .object()
                                    .nullable()
                                    .when('siteIdFlag', {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                ,
                                // selectedRptMode: yup
                                //     .string()
                                //     .nullable()
                                //     .when('rptModeFlag', {
                                //         is: true,
                                //         then: yup.string().nullable().required('Field is required')
                                //     })
                                // ,
                                selectedRoomNormal: yup
                                    .array()
                                    .nullable()
                                    .when('rptRoomFlag', {
                                        is: true,
                                        then: yup.array().nullable().required('Field is required')
                                    })
                                ,
                                selectedRoomOverbook: yup
                                    .array()
                                    .nullable()
                                    .when('rptRoomOverbookFlag', {
                                        is: true,
                                        then: yup.array().nullable()
                                    }).test('isValidRoom', null, function (value) {
                                        const { selectedRoomNormal } = this.parent;
                                        if (!selectedRoomNormal || selectedRoomNormal.length == 0) return true;
                                        if (!value || value.length === 0) return true;
                                        let diff = value.reduce(function (previous, i) {
                                            let found = selectedRoomNormal.findIndex(function (j) {
                                                return j.value === i.value;
                                            });
                                            return (found >= 0 && previous.push(i), previous);
                                        }, []);
                                        if (diff.length == 0) return true;
                                        diff = listUtilities.getFieldFromObjArray(diff, 'label');
                                        let msg = 'The following rooms have already been selected in \"Room (Normal)\":';
                                        let roomsStr = diff.join(', ');
                                        let newArr = [msg, roomsStr];
                                        roomsStr = `${_.join(newArr, '\n')}`;
                                        return this.createError({
                                            // message: 'The following rooms have already been selected in \"Room (Normal)\":' + <br/> + `${roomsStr}`
                                            message: roomsStr
                                        });
                                    })
                                ,
                                numOfWeek: yup
                                    .number()
                                    .nullable()
                                    .when('rptNumberOfWeekFlag', {
                                        is: true,
                                        then: yup.number().nullable().min(1, reportConstant.VALIDATION_MSG.isNumberBetween1and52).max(52, reportConstant.VALIDATION_MSG.isNumberBetween1and52)
                                    })
                                ,
                                selectedUser: yup
                                    .object()
                                    .nullable()
                                    .when('userIdFlag', {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    }).when('isDoctorUser', {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    }).when('isNurseUser', {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    }).when('isDtsUser', {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                ,
                                selectedRpt34Room: yup
                                    .object()
                                    .nullable()
                                    .when('rpt34RoomFlag', {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                ,
                                selectedEncounterType: yup
                                    .object()
                                    .nullable()
                                    .when('encounterTypeFlag', {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                ,
                                startDate: yup
                                    .object()
                                    .nullable()
                                    .when(['rptPeriodStartFlag', 'rpt34RoomFlag'], {
                                        // is: true,
                                        is: (rptPeriodStartFlag, rpt34RoomFlag) => rptPeriodStartFlag && !rpt34RoomFlag,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                    .test('isValidDate', reportConstant.VALIDATION_MSG.isValidDate, function (date) {
                                        if (date !== null) {
                                            return date && date.isValid();
                                        } else {
                                            return true;
                                        }
                                    })
                                ,
                                endDate: yup
                                    .object()
                                    .nullable()
                                    .when(['rptPeriodEndFlag', 'rpt34RoomFlag'], {
                                        // is: true,
                                        is: (rptPeriodEndFlag, rpt34RoomFlag) => rptPeriodEndFlag && !rpt34RoomFlag,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                    .test('isValidDate', reportConstant.VALIDATION_MSG.isValidDate, function (date) {
                                        if (date !== null) {
                                            return date && date.isValid();
                                        } else {
                                            return true;
                                        }
                                    })
                                    .test('isEndDateAfterStartDate', reportConstant.VALIDATION_MSG.isEndDateAfterStartDate, function (endDate) {
                                        const { startDate } = this.parent;
                                        const _sdate = moment(startDate);
                                        const _edate = moment(endDate);
                                        if (_sdate.isValid() && _edate.isValid())
                                            return _edate.isSameOrAfter(_sdate);
                                        return true;
                                    })
                                    .test('isIntervalLongerThan100Days', reportConstant.VALIDATION_MSG.isIntervalLongerThan100Days, function (endDate) {
                                        const { startDate } = this.parent;
                                        const _sdate = moment(startDate);
                                        const _edate = moment(endDate);
                                        if (_sdate.isValid() && _edate.isValid())
                                            return _edate.diff(_sdate, 'year') < 1;
                                        return true;
                                    })
                                ,
                                rpt34StartDate: yup
                                    .object()
                                    .nullable()
                                    .when(['rptPeriodStartFlag', 'rpt34RoomFlag'], {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                    .test('isDateFromLongerThanOneYear', reportConstant.VALIDATION_MSG.isDateFromLongerThanOneYear, function (rpt34StartDate) {
                                        const _sdate = moment(rpt34StartDate);
                                        const _edate = moment();
                                        if (_sdate.isValid() && _edate.isValid())
                                            return _edate.diff(_sdate, 'year') < 1;
                                        return true;
                                    })
                                    .test('isValidDate', reportConstant.VALIDATION_MSG.isValidDate, function (rpt34StartDate) {
                                        if (rpt34StartDate !== null) {
                                            return rpt34StartDate && rpt34StartDate.isValid();
                                        } else {
                                            return true;
                                        }
                                    })
                                ,
                                rpt34EndDate: yup
                                    .object()
                                    .nullable()
                                    .when(['rptPeriodEndFlag', 'rpt34RoomFlag'], {
                                        is: true,
                                        then: yup.object().nullable().required('Field is required')
                                    })
                                    .test('isValidDate', reportConstant.VALIDATION_MSG.isValidDate, function (rpt34EndDate) {
                                        if (rpt34EndDate !== null) {
                                            return rpt34EndDate && rpt34EndDate.isValid();
                                        } else {
                                            return true;
                                        }
                                    })
                                    .test('isIntervalLongerThan7Days', reportConstant.VALIDATION_MSG.isIntervalLongerThan7Days, function (rpt34EndDate) {
                                        const { rpt34StartDate } = this.parent;
                                        const _sdate = moment(rpt34StartDate).startOf('day');
                                        // const _sdate = moment();
                                        const _edate = moment(rpt34EndDate).startOf('day');
                                        if (_sdate.isValid() && _edate.isValid()) {
                                            return _edate.diff(_sdate, 'days') < 8;
                                        }
                                        return true;
                                    })
                                    .test('isEndDateAfterStartDate', reportConstant.VALIDATION_MSG.isEndDateAfterStartDate, function (rpt34EndDate) {
                                        const { rpt34StartDate } = this.parent;
                                        const _sdate = moment(rpt34StartDate);
                                        const _edate = moment(rpt34EndDate);
                                        if (_sdate.isValid() && _edate.isValid())
                                            return _edate.isSameOrAfter(_sdate, 'days');
                                        return true;
                                    })
                            }
                            )}
                        onSubmit={(values, actions) => {
                            console.log('values', values);
                            this.handleSave(values);
                            setTimeout(() => {
                                actions.setSubmitting(false);
                            }, 3000);
                        }}
                    >
                        {props => (
                            <Form>

                                <Grid container spacing={1}>

                                    {
                                        this.state.siteIdFlag ?
                                            <>
                                                <Grid item xs={6} className={classes.gridRow}>
                                                    <Field name="selectedSite">
                                                        {({ field, form, meta }) => (
                                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                                <InputLabel
                                                                    ref={ref => this.refSiteLabel = ref}
                                                                    margin="dense"
                                                                    className={classes.inputLabel}
                                                                    shrink={field.value != null || this.state.siteMenuOpen}
                                                                    id={idConstant + '_site_label'}
                                                                >
                                                                    * Site English Name
                                                                </InputLabel>
                                                                <OutlinedInput
                                                                    labelWidth={this.state.fontsLoaded ? this.refSiteLabel.offsetWidth : 0}
                                                                    margin="dense"
                                                                    id={idConstant + '_site_select'}
                                                                    notched={field.value != null || this.state.siteMenuOpen}
                                                                    inputComponent={ReactSelect}
                                                                    inputProps={{
                                                                        isClearable: true,
                                                                        isDisabled: !this.props.isStatReportCrossSiteRight(),
                                                                        isLoading: false,
                                                                        isRtl: false,
                                                                        isSearchable: true,
                                                                        filterOption: {
                                                                            matchFrom: 'start'
                                                                        },
                                                                        placeholder: '',
                                                                        menuPlacement: 'auto',
                                                                        maxMenuHeight: 500,
                                                                        menuPortalTarget: document.body,
                                                                        isMulti: false,
                                                                        options: this.state.sites,
                                                                        onMenuOpen: () => this.setState({ siteMenuOpen: true }),
                                                                        onMenuClose: () => this.setState({ siteMenuOpen: false }),
                                                                        value: field.value,
                                                                        inputValue: this.state.siteInput,
                                                                        onChange: (value, params) => {
                                                                            //form.setFieldValue(field.name, value);
                                                                            this.handleSiteChange(value);
                                                                        },
                                                                        onInputChange: (value, params) => this.setState({ siteInput: value }),
                                                                        onBlur: () => form.setFieldTouched(field.name, true)
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <ErrorMessage name="selectedSite" component="div" className={classes.error} />
                                                </Grid>
                                            </> : null
                                    }
                                    {
                                        this.state.rptPeriodStartFlag ?
                                            <>
                                                {
                                                    this.state.rpt34RoomFlag ?
                                                        <Grid item xs={3} className={classes.gridRow}>
                                                            <Field name="rpt34StartDate">
                                                                {({ field, form, meta }) => (
                                                                    <KeyboardDatePicker
                                                                        id={idConstant + '_startDate_picker'}
                                                                        label="* Date From"
                                                                        margin="dense"
                                                                        inputVariant="outlined"
                                                                        fullWidth
                                                                        format="DD-MM-YYYY"
                                                                        autoOk
                                                                        helperText=""
                                                                        disabled={dialogAction !== 'create'}
                                                                        value={field.value}
                                                                        minDate={moment().subtract({ years: 1, days: -1 })}
                                                                        // minDate={moment().subtract(1, 'years' )}
                                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                                        onChange={value => form.setFieldValue(field.name, value)}
                                                                        onClose={() => form.setFieldTouched(field.name, true)}
                                                                        InputProps={{
                                                                            className: dialogAction !== 'create' ? classes.disabledTextFieldRoot : null
                                                                        }}
                                                                        KeyboardButtonProps={{
                                                                            'aria-label': 'change start date'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorMessage name="rpt34StartDate" component="div" className={classes.error} />
                                                        </Grid>
                                                        :
                                                        <Grid item xs={3} className={classes.gridRow}>
                                                            <Field name="startDate">
                                                                {({ field, form, meta }) => (
                                                                    <KeyboardDatePicker
                                                                        id={idConstant + '_startDate_picker'}
                                                                        label="* Date From"
                                                                        margin="dense"
                                                                        inputVariant="outlined"
                                                                        fullWidth
                                                                        format="DD-MM-YYYY"
                                                                        autoOk
                                                                        helperText=""
                                                                        disabled={dialogAction !== 'create'}
                                                                        value={field.value}
                                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                                        onChange={
                                                                            value => {
                                                                                form.setFieldValue(field.name, value);
                                                                                if (this.state.isDtsUser) {
                                                                                    setTimeout(() => {
                                                                                        this.handleStartDateChange(field.name, value);
                                                                                    }, 200);
                                                                                }
                                                                            }
                                                                        }
                                                                        onClose={() => form.setFieldTouched(field.name, true)}
                                                                        InputProps={{
                                                                            className: dialogAction !== 'create' ? classes.disabledTextFieldRoot : null
                                                                        }}
                                                                        KeyboardButtonProps={{
                                                                            'aria-label': 'change start date'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorMessage name="startDate" component="div" className={classes.error} />
                                                        </Grid>
                                                }
                                            </> : null
                                    }
                                    {
                                        this.state.rptPeriodEndFlag ?
                                            <>
                                                {
                                                    this.state.rpt34RoomFlag ?
                                                        <Grid item xs={3} className={classes.gridRow}>
                                                            <Field name="rpt34EndDate">
                                                                {({ field, form, meta }) => (
                                                                    <KeyboardDatePicker
                                                                        id={idConstant + '_endDate_picker'}
                                                                        label="* Date To"
                                                                        margin="dense"
                                                                        inputVariant="outlined"
                                                                        fullWidth
                                                                        format="DD-MM-YYYY"
                                                                        autoOk
                                                                        helperText=""
                                                                        disabled={dialogAction !== 'create'}
                                                                        value={field.value}
                                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                                        onChange={value => form.setFieldValue(field.name, value)}
                                                                        onClose={() => form.setFieldTouched(field.name, true)}
                                                                        InputProps={{
                                                                            className: dialogAction !== 'create' ? classes.disabledTextFieldRoot : null
                                                                        }}
                                                                        KeyboardButtonProps={{
                                                                            'aria-label': 'change end date'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorMessage name="rpt34EndDate" component="div" className={classes.error} />
                                                        </Grid>
                                                        :
                                                        <Grid item xs={3} className={classes.gridRow}>
                                                            <Field name="endDate">
                                                                {({ field, form, meta }) => (
                                                                    <KeyboardDatePicker
                                                                        id={idConstant + '_endDate_picker'}
                                                                        label="* Date To"
                                                                        margin="dense"
                                                                        inputVariant="outlined"
                                                                        fullWidth
                                                                        format="DD-MM-YYYY"
                                                                        autoOk
                                                                        helperText=""
                                                                        disabled={dialogAction !== 'create'}
                                                                        value={field.value}
                                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                                        onChange={
                                                                            value => {
                                                                                form.setFieldValue(field.name, value);
                                                                                if (this.state.isDtsUser) {
                                                                                    setTimeout(() => {
                                                                                        this.handleEndDateChange(field.name, value);
                                                                                    }, 200);
                                                                                }
                                                                            }
                                                                        }
                                                                        onClose={() => form.setFieldTouched(field.name, true)}
                                                                        InputProps={{
                                                                            className: dialogAction !== 'create' ? classes.disabledTextFieldRoot : null
                                                                        }}
                                                                        KeyboardButtonProps={{
                                                                            'aria-label': 'change end date'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorMessage name="endDate" component="div" className={classes.error} />
                                                        </Grid>
                                                }
                                            </> : null
                                    }

                                    {
                                        this.state.rptRoomFlag ?
                                            <>
                                                <Grid item xs={6} className={classes.gridRow} onMouseDown={(e) => this.handleMouseDownCapture(e, this.refRoomNormalSelect)}>
                                                    <Field name="selectedRoomNormal">
                                                        {({ field, form, meta }) => (
                                                            <CIMSCommonSelect
                                                                id={idConstant + '_roomNormal'}
                                                                label="* Room (Normal)"
                                                                // options={this.props.isStatReportCrossSiteRight() ? this.state.sites : this.state.sites.filter(x => x.value == this.props.siteId)}
                                                                options={this.state.rooms}
                                                                value={field.value}
                                                                labelProps={{
                                                                    classes: {
                                                                        root: classes.inputLabel,
                                                                        shrink: classes.shrink
                                                                    }
                                                                }}
                                                                outlinedProps={{
                                                                    className: classes.selectOptionScrollBar
                                                                }}
                                                                inputProps={{
                                                                    isMulti: true,
                                                                    hideSelectedOptions: false,
                                                                    closeMenuOnSelect: false,
                                                                    // selectAll: 'All',
                                                                    selectAll: _.isEmpty(this.state.rooms) ? null : 'All',
                                                                    // isDisabled: !this.props.isStatReportCrossSiteRight(),
                                                                    sortFunc: sortFunc,
                                                                    filterOption: {
                                                                        matchFrom: 'start'
                                                                    },
                                                                    innerRef: this.setRefRoomNormalSelect
                                                                }}
                                                                onBlur={() => form.setFieldTouched(field.name, true)}
                                                                onChange={(value, params) => {
                                                                    form.setFieldValue(field.name, value);
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorMessage name="selectedRoomNormal" component="div" className={classes.error} />
                                                </Grid>
                                            </> : null
                                    }
                                    {this.state.rptNumberOfWeekFlag ?
                                        <>
                                            <Grid item xs={3} className={classes.gridRow}>
                                                <Field name="numOfWeek">
                                                    {({ field, form, meta }) => (
                                                        <TextField
                                                            {...field}
                                                            id={idConstant + '_numOfWeek_textField'}
                                                            label="Number of Week"
                                                            margin="dense"
                                                            variant="outlined"
                                                            fullWidth
                                                            inputProps={{
                                                                maxLength: 2
                                                            }}
                                                            onChange={(e, params) => {
                                                                if (e.target.value)
                                                                    e.target.value = e.target.value.replace(/\D/g, '').replace(/^0+/g, '');
                                                                form.setFieldValue(field.name, e.target.value);
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                <ErrorMessage name="numOfWeek" component="div" className={classes.error} />
                                            </Grid>
                                        </> : null
                                    }
                                    {this.state.rptRoomOverbookFlag ?
                                        <>
                                            <Grid item xs={6} className={classes.gridRow}
                                                onMouseDown={(e) => this.handleMouseDownCapture(e, this.refRoomOverbookSelect)}
                                            >
                                                <Field name="selectedRoomOverbook">
                                                    {({ field, form, meta }) => (
                                                        <CIMSCommonSelect
                                                            id={idConstant + '_roomOverbook'}
                                                            label="Room (Overbook)"
                                                            options={this.state.rooms}
                                                            value={field.value}
                                                            labelProps={{
                                                                classes: {
                                                                    root: classes.inputLabel,
                                                                    shrink: classes.shrink
                                                                }
                                                            }}
                                                            outlinedProps={{
                                                                className: classes.selectOptionScrollBar
                                                            }}
                                                            inputProps={{
                                                                isMulti: true,
                                                                hideSelectedOptions: false,
                                                                closeMenuOnSelect: false,
                                                                // selectAll: 'All',
                                                                selectAll: _.isEmpty(this.state.rooms) ? null : 'All',
                                                                // isDisabled: !this.props.isStatReportCrossSiteRight(),
                                                                sortFunc: sortFunc,
                                                                filterOption: {
                                                                    matchFrom: 'start'
                                                                },
                                                                innerRef: this.setRefRoomOverbookSelect
                                                            }}
                                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                                            onChange={(value, params) => {
                                                                form.setFieldValue(field.name, value);
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                <ErrorMessage name="selectedRoomOverbook" component="div" className={classes.error} style={{ whiteSpace: 'break-spaces' }} />
                                            </Grid>
                                        </> : null
                                    }
                                    {
                                        this.state.rptModeFlag ?
                                            <>
                                                <Grid container direction={'row'} spacing={1} className={classes.gridRow}>
                                                    <InputLabel
                                                        // ref={ref => this.refSiteLabel = ref}
                                                        margin="dense"
                                                        className={classes.inputLabel}
                                                        id={idConstant + '_rptMode_label'}
                                                        style={{ paddingRight: 10 }}
                                                    >
                                                        * Mode
                                                    </InputLabel>
                                                    <Field name="selectedRptMode">
                                                        {({ field, form, meta }) => (
                                                            <FormControl variant="outlined" margin="dense">
                                                                <RadioGroup
                                                                    id={idConstant + '_contactMeanGroup'}
                                                                    row
                                                                    // style={{ paddingRight: 10, borderRight: '3px solid #999' }}
                                                                    // value={field.value}
                                                                    // value={this.state.rpt32ModuValue}
                                                                    value={this.state.rptModuValue}
                                                                    // onChange={(e, value) => form.setFieldValue(field.name, value)}
                                                                    // onChange={(e, value) => this.setState({ rpt32ModuValue: value })}
                                                                    onChange={(e, value) => this.setState({ rptModuValue: value })}
                                                                >
                                                                    {
                                                                        reportConstant.RPT_TMPL_PARAM_NAME_CODE.rptMode[this.state.rptModuParamsName].map((item, index) => {
                                                                            return <FormControlLabel
                                                                                key={'selectedRptMode_' + item.value}
                                                                                value={item.value}
                                                                                // disabled={comDisabled}
                                                                                label={item.label}
                                                                                labelPlacement="end"
                                                                                id={idConstant + '_' + item.value + '_radioLabel'}
                                                                                control={
                                                                                    <Radio
                                                                                        id={idConstant + '_' + item.value + '_radio'}
                                                                                        color="primary"
                                                                                        classes={{
                                                                                            root: classes.radioBtn,
                                                                                            checked: classes.radioBtnChecked
                                                                                        }}
                                                                                    />}
                                                                                   />;
                                                                        })
                                                                    }
                                                                    {/* <FormControlLabel
                                                                        value={'S'}
                                                                        // disabled={comDisabled}
                                                                        label={'Simple'}
                                                                        labelPlacement="end"
                                                                        id={idConstant + '_' + 'S' + '_radioLabel'}
                                                                        control={
                                                                            <Radio
                                                                                id={idConstant + '_' + 'S' + '_radio'}
                                                                                color="primary"
                                                                                classes={{
                                                                                    root: classes.radioBtn,
                                                                                    checked: classes.radioBtnChecked
                                                                                }}
                                                                            />}
                                                                    />
                                                                    <FormControlLabel
                                                                        value={'F'}
                                                                        // disabled={comDisabled}
                                                                        label={'Full'}
                                                                        labelPlacement="end"
                                                                        id={idConstant + '_' + 'F' + '_radioLabel'}
                                                                        control={
                                                                            <Radio
                                                                                id={idConstant + '_' + 'F' + '_radio'}
                                                                                color="primary"
                                                                                classes={{
                                                                                    root: classes.radioBtn,
                                                                                    checked: classes.radioBtnChecked
                                                                                }}
                                                                            />}
                                                                    /> */}
                                                                </RadioGroup>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <ErrorMessage name="selectedRptMode" component="div" className={classes.error} style={{ paddingTop: 22 }} />
                                                </Grid>
                                            </> : null
                                    }
                                    {
                                        this.state.rpt34RoomFlag ?
                                            <Grid container>
                                                <Grid item xs={6} className={classes.gridRow}>
                                                    <Field name="selectedRpt34Room">
                                                        {({ field, form, meta }) => (
                                                            <CIMSCommonSelect
                                                                id={idConstant + '_room34Normal'}
                                                                label="* Room"
                                                                options={this.state.rooms}
                                                                value={field.value}
                                                                shrink={_.isEmpty(field.value)}
                                                                labelProps={{
                                                                    classes: {
                                                                        root: classes.inputLabel,
                                                                        shrink: classes.shrink
                                                                    }
                                                                }}
                                                                outlinedProps={{
                                                                    className: classes.selectOptionScrollBar
                                                                }}
                                                                inputProps={{
                                                                    isMulti: false,
                                                                    hideSelectedOptions: false,
                                                                    closeMenuOnSelect: true,
                                                                    isClearable: true,
                                                                    sortFunc: sortFunc,
                                                                    filterOption: {
                                                                        matchFrom: 'start'
                                                                    }
                                                                }}
                                                                onBlur={() => form.setFieldTouched(field.name, true)}
                                                                onChange={(value, params) => {
                                                                    form.setFieldValue(field.name, value);
                                                                }}
                                                                onClose={() => form.setFieldTouched(field.name, true)}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorMessage name="selectedRpt34Room" component="div" className={classes.error} />
                                                </Grid>
                                            </Grid> : null
                                    }
                                    {
                                        // This checking was not support 3 role
                                        (this.state.userIdFlag || this.state.isDoctorUser || this.state.isNurseUser || this.state.isDtsUser) && !(this.state.isUserFlagError) ?
                                            <>
                                                <Grid item xs={6} className={classes.gridRow}>
                                                    <Field name="selectedUser">
                                                        {({ field, form, meta }) => (
                                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                                <InputLabel
                                                                    ref={ref => this.refUserLabel = ref}
                                                                    margin="dense"
                                                                    className={classes.inputLabel}
                                                                    shrink={field.value != null || this.state.userMenuOpen}
                                                                    id={idConstant + '_user_label'}
                                                                >
                                                                    User Name - Email
                                                                </InputLabel>
                                                                <OutlinedInput
                                                                    labelWidth={this.state.fontsLoaded ? this.refUserLabel.offsetWidth : 0}
                                                                    margin="dense"
                                                                    id={idConstant + '_user_select'}
                                                                    notched={field.value != null || this.state.userMenuOpen}
                                                                    inputComponent={ReactSelect}
                                                                    inputProps={{
                                                                        isClearable: true,
                                                                        isLoading: false,
                                                                        isRtl: false,
                                                                        isSearchable: true,
                                                                        filterOption: {
                                                                            matchFrom: 'start'
                                                                        },
                                                                        placeholder: '',
                                                                        menuPlacement: 'auto',
                                                                        maxMenuHeight: 500,
                                                                        menuPortalTarget: document.body,
                                                                        isMulti: false,
                                                                        options: this.state.users,
                                                                        onMenuOpen: () => this.setState({ userMenuOpen: true }),
                                                                        onMenuClose: () => this.setState({ userMenuOpen: false }),
                                                                        value: field.value,
                                                                        inputValue: this.state.userInput,
                                                                        onChange: (value, params) => {
                                                                            form.setFieldValue(field.name, value);
                                                                        },
                                                                        onInputChange: (value, params) => this.setState({ userInput: value }),
                                                                        onBlur: () => form.setFieldTouched(field.name, true)
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <ErrorMessage name="selectedUser" component="div" className={classes.error} />
                                                </Grid>
                                            </> : null
                                    }
                                    {
                                            this.state.encounterTypeFlag && !(this.state.encounterTypeErrorFlag) ?
                                            <>
                                                <Grid item xs={6} className={classes.gridRow}>
                                                    <Field name="selectedEncounterType">
                                                        {({ field, form, meta }) => (
                                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                                <InputLabel
                                                                    ref={ref => this.refUserLabel = ref}
                                                                    margin="dense"
                                                                    className={classes.inputLabel}
                                                                    shrink={field.value != null || this.state.encounterTypeMenuOpen}
                                                                    id={idConstant + '_encounterType_label'}
                                                                >
                                                                    * Encounter Type
                                                                </InputLabel>
                                                                <OutlinedInput
                                                                    labelWidth={this.state.fontsLoaded ? this.refUserLabel.offsetWidth : 0}
                                                                    margin="dense"
                                                                    id={idConstant + '_encounterType_select'}
                                                                    notched={field.value != null || this.state.encounterTypeMenuOpen}
                                                                    inputComponent={ReactSelect}
                                                                    inputProps={{
                                                                        isClearable: true,
                                                                        isLoading: false,
                                                                        isRtl: false,
                                                                        isSearchable: true,
                                                                        filterOption: {
                                                                            matchFrom: 'start'
                                                                        },
                                                                        placeholder: '',
                                                                        menuPlacement: 'auto',
                                                                        maxMenuHeight: 500,
                                                                        menuPortalTarget: document.body,
                                                                        isMulti: false,
                                                                        options: this.state.encounterTypes,
                                                                        onMenuOpen: () => this.setState({ encounterTypeMenuOpen: true }),
                                                                        onMenuClose: () => this.setState({ encounterTypeMenuOpen: false }),
                                                                        value: field.value,
                                                                        inputValue: this.state.encounterTypeInput,
                                                                        onChange: (value, params) => {
                                                                            form.setFieldValue(field.name, value);
                                                                        },
                                                                        onInputChange: (value, params) => this.setState({ encounterTypeInput: value }),
                                                                        onBlur: () => form.setFieldTouched(field.name, true)
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <ErrorMessage name="selectedEncounterType" component="div" className={classes.error} />
                                                </Grid>
                                                </> : null
                                    }

                                    {
                                        <DynamicForm
                                            forwardedRef={this.refGrid}
                                            innerRef={this.refGridForm}
                                            //session={this.state.session}
                                            originalRowData={null}
                                            rowData={null}
                                            //originalRowData={this.state.rowData}
                                            //rowData={this.state.rowData}
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
                                    }
                                    <Grid item container xs={12}>
                                        {
                                            !(this.state.enableInstantGen === 'Y') ? null :
                                                <Grid item xs={2}>
                                                    <Button className={classes.actionButtonRoot} variant="contained" color="primary" disabled={!this.props.isStatReportInstantGenRight()} onClick={() => this.handleInstantGen(props)} id={idConstant + '_instantGen'}>Instant Generate</Button>
                                                </Grid>
                                        }

                                        <Grid item xs={2}>
                                            <Button className={classes.actionButtonRoot} variant="contained" color="primary" disabled={props.isSubmitting} onClick={() => this.handleDayEndGen(props)} id={idConstant + '_dayEndGen'}>Day End Generate</Button>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Button className={classes.actionButtonRoot} variant="contained" color="primary" onClick={this.handleClose} id={idConstant + '_cancel'}>Cancel</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}
                    </Formik>
                    <Grid item container xs={12}></Grid>

                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                </DialogActions>
            </Dialog>
        );
    }
}

function mapStateToProps(state) {
    return {
        loginUserDto: state.login.loginInfo.userDto,
        clinicList: state.common.clinicList,
        serviceList: state.common.serviceList,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        loginName: state.login.loginInfo.loginName,
        loginId: state.login.loginInfo.loginId,
        users: state.reportTemplate.users,
        encounterTypes: state.common.encounterTypes,
        selectedTemplate: state.reportTemplate.selectedTemplate,
        commonMessageDetail: state.message.commonMessageDetail,
        roomList: state.common.roomList
    };
}

const mapDispatchToProps = {
    requestData,
    postData,
    updateField,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(ReportTemplateDialog)));

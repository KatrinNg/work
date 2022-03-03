import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
    Grid,
    Link
} from '@material-ui/core';
import SearchInput from '../compontent/searchInput';
import FilterPatient from './component/filterPatient';
import CIMSButton from '../../components/Buttons/CIMSButton';
import CIMSTable from '../../components/Table/CIMSTable';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import * as PatientUtilities from '../../utilities/patientUtilities';
import Enum from '../../enums/enum';
import {
    closeIdleTimeDialog
} from '../../store/actions/common/commonAction';
import { openMask, closeMask } from '../../store/actions/mainFrame/mainFrameAction';
import moment from 'moment';
import _ from 'lodash';
import LinkPatient from './component/linkPatient';
import {
    getPatientById,
    updateState as updatePatientState,
    getPatientEncounter
} from '../../store/actions/patient/patientAction';
import {
    searchPatientList,
    updatePatientListAttendanceInfo,
    resetAttendance,
    updatePatientListField,
    getPatientList,
    resetPatientListField,
    resetCondition,
    searchInPatientQueue
} from '../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import { getAppointmentForAttend } from '../../store/actions/attendance/attendanceAction';
import { skipTab } from '../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import * as CommonUtilities from '../../utilities/commonUtilities';
import accessRightEnum from '../../enums/accessRightEnum';
import * as AppointmentUtilties from '../../utilities/appointmentUtilities';
import * as CaseNoUtil from '../../utilities/caseNoUtilities';
import * as BookingEnum from '../../enums/appointment/booking/bookingEnum';
import { eHRresetAll } from '../../store/actions/EHR/eHRAction';

import { updateState as updateBookingState } from '../../store/actions/appointment/booking/bookingAction';
const styles = theme => ({
    root: {
        display: 'flex',
        flexFlow: 'column',
        padding: '0px 10px'
    },
    filterRoot: {
        paddingTop: '10px'
    },
    filterForm: {
        minWidth: 180,
        maxWidth: 220
    },
    filterTable: {
        flex: 1
    },
    filterFieldRoot: {
        marginBottom: '15px'
    },
    radioRoot: {
        padding: '5px 12px'
    },
    customTableHeadCell: {
        backgroundColor: '#b8bcb9'
        //fontSize: '13px'
    },
    customTableBodyCell: {
        fontSize: '13px'
    },
    maleRowRoot: {
        background: `linear-gradient(${theme.palette.genderMaleColor.color}, ${theme.palette.genderMaleColor.transparent})`,
        backgroundColor: theme.palette.genderMaleColor.color,
        '&$rowHover': {
            backgroundColor: theme.palette.action.hover
        }
    },
    femaleRowRoot: {
        background: `linear-gradient(${theme.palette.genderFeMaleColor.color},${theme.palette.genderFeMaleColor.transparent})`,
        backgroundColor: theme.palette.genderFeMaleColor.color,
        '&$rowHover': {
            backgroundColor: theme.palette.action.hover
        }
    },
    unknownRowRoot: {
        background: `linear-gradient(${theme.palette.genderUnknownColor.color}, ${theme.palette.genderUnknownColor.transparent})`,
        backgroundColor: theme.palette.genderUnknownColor.color,
        '&$rowHover': {
            backgroundColor: theme.palette.action.hover
        }
    },
    deadRowRoot: {
        background: `linear-gradient(${theme.palette.deadPersonColor.color}, ${theme.palette.deadPersonColor.transparent})`,
        backgroundColor: theme.palette.deadPersonColor.color,
        color: 'white'
    },
    deadBodyRoot: {
        color: theme.palette.deadPersonColor.fontColor
    }
});

class PatientList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tableRows: PatientUtilities.get_PatientList_TableRow_ByServiceCd(this.customAction, this.customStatus),
            tableOptions: {
                rowExpand: true,
                onSelectIdName: 'appointmentId',
                rowHover: true,
                // headCellStyle: this.props.classes.customTableHeadCell,
                //bodyCellStyle: this.props.classes.customTableBodyCell,
                customRowStyle: (rowData) => {
                    let classname = '';
                    if (rowData.genderCd === Enum.GENDER_MALE_VALUE) {
                        classname = this.props.classes.maleRowRoot;
                    } else if (rowData.genderCd === Enum.GENDER_FEMALE_VALUE) {
                        classname = this.props.classes.femaleRowRoot;
                    } else if (rowData.genderCd === Enum.GENDER_UNKNOWN_VALUE) {
                        classname = this.props.classes.unknownRowRoot;
                    }
                    if (rowData.deadInd === '1') {
                        classname = this.props.classes.deadRowRoot;
                    }
                    return classname;
                },
                customBodyCellStyle: (rowData) => {
                    let className = '';
                    if (rowData.deadInd === '1') {
                        className = this.props.classes.deadBodyRoot;
                    }
                    return className;
                },
                rowsPerPage: 10,
                rowsPerPageOptions: [10, 15, 20],
                onRowDoubleClick: (rowData) => {
                    if (rowData.patientKey > 0) {
                        this.selectAppointment(rowData);
                    }
                }
            },
            // resetAttendInfo: 'Reset the attendance?',
            // isOpenInfoDialog: false,
            // selectRowData: null,
            patientList: {}
        };
    }

    componentDidMount() {
        let searchParameter = _.cloneDeep(this.props.searchParameter);
        searchParameter.dateFrom = moment();
        searchParameter.dateTo = moment();
        this.getPatientQueueByPage(searchParameter);
        if (this.props.userRoleType) {
            let filterCondition = _.cloneDeep(this.props.filterCondition);
            if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
                filterCondition.attnStatusCd = Enum.ATTENDANCE_STATUS.NOT_ATTEND;
            } else if (this.props.userRoleType === Enum.USER_ROLE_TYPE.NURSE ||
                this.props.userRoleType === Enum.USER_ROLE_TYPE.DOCTOR) {
                filterCondition.attnStatusCd = Enum.ATTENDANCE_STATUS.ATTENDED;
            }
            this.props.updatePatientListField({ filterCondition: filterCondition });
        }
        this.tableRef.setDividerScale('40');
        this.props.eHRresetAll();
        this.props.closeIdleTimeDialog();
    }

    shouldComponentUpdate(nextP) {
        if (nextP.tabsActiveKey !== this.props.tabsActiveKey && nextP.tabsActiveKey === accessRightEnum.patientSpec) {
            let searchParameter = _.cloneDeep(this.props.searchParameter);
            searchParameter.dateFrom = moment();
            searchParameter.dateTo = moment();
            this.getPatientQueueByPage(searchParameter);
            return false;
        }
        return true;
    }

    UNSAFE_componentWillUpdate(nextProps) {
        if (nextProps.searchNextAction) {
            const patientList = PatientUtilities.filterPatientList(nextProps.patientQueueList, {});
            switch (nextProps.searchNextAction) {
                case 'attendance': {
                    this.getPatientInfo(patientList.patientQueueDtos[0]);
                    let isPastAppt = AppointmentUtilties.isPastAppointment(patientList.patientQueueDtos[0]);
                    if (isPastAppt) {
                        this.leadBackTakeAttendance(patientList.patientQueueDtos[0]);
                    }
                    else {
                        this.leadAttendance(patientList.patientQueueDtos[0]);
                    }
                    break;
                }
                case 'summary': {
                    this.skipToPatientSummary({ patientKey: patientList.patientQueueDtos[0].patientKey });
                    this.handleResetButtonClick();
                    break;
                }
                case 'select': {
                    this.getPatientInfo(patientList.patientQueueDtos[0]);
                    break;
                }
                case 'searchPatient': {
                    if (nextProps.searchList.length === 1) {
                        const userRoleType = nextProps.userRoleType;
                        if (userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
                            this.skipToPatientSummary({ patientKey: nextProps.searchList[0].patientKey });
                            this.handleResetButtonClick();
                        } else if (userRoleType === Enum.USER_ROLE_TYPE.DOCTOR || userRoleType === Enum.USER_ROLE_TYPE.NURSE) {

                            this.getPatientInfo({ patientKey: nextProps.searchList[0].patientKey });
                        }
                        this.props.updatePatientState({ patientList: [] });
                    } else if (nextProps.searchList.length === 0) {
                        let searchString = this.searchInput.getSearchStr().toUpperCase();
                        this.props.openCommonMessage({
                            msgCode: '110137',
                            btnActions: {
                                btn1Click: () => {
                                    // setTimeout(() => {
                                    //     this.props.skipTab(accessRightEnum.registration, { searchString: searchString, action: 'createNew', redirectFrom: 'patientList' }, true);
                                    //     this.handleResetButtonClick();
                                    // }, 200);
                                    this.props.skipTab(accessRightEnum.registration, { searchString: searchString, action: 'createNew', redirectFrom: 'patientList' }, true);
                                    this.handleResetButtonClick();
                                },
                                btn2Click: () => {
                                    this.handleResetButtonClick();
                                }
                            }
                        });
                    }
                    break;
                }
            }

            this.setState({ patientList });

            let filterCondition = _.cloneDeep(this.props.filterCondition);
            filterCondition.attnStatusCd = Enum.ATTENDANCE_STATUS.ALL;
            filterCondition.encounterTypeCd = '';
            filterCondition.subEncounterTypeCd = '';
            this.props.updatePatientListField({ searchNextAction: '', filterCondition: filterCondition });
            if (nextProps.searchList.length <= 1) {
                this.searchInput.resetSearchBar();
            }
        } else {
            if (nextProps.patientQueueList !== this.props.patientQueueList || nextProps.filterCondition !== this.props.filterCondition) {
                const patientList = PatientUtilities.filterPatientList(nextProps.patientQueueList, nextProps.filterCondition);
                this.setState({ patientList });
            }
        }
    }



    componentDidUpdate(prevProps) {
        if ((prevProps.tabsActiveKey !== this.props.tabsActiveKey && this.props.tabsActiveKey === accessRightEnum.patientSpec) || this.props.isFocusSearchInput) {
            this.searchInput.focusSearchInput();
            this.props.updatePatientListField({ isFocusSearchInput: false });
        }
    }

    customAction = (value, rowData) => {
        let isFutureAppt = AppointmentUtilties.isFutureAppointment(rowData);
        return (
            (rowData.patientKey < 0 && !isFutureAppt) ?
                <CIMSButton
                    id={'patientlist_linkPmi_' + rowData.appointmentId}
                    style={{ margin: 0, lineHeight: 'unset' }}
                    onClick={e => { this.handleLinkPMI(e, rowData); }}
                >Link PMI</CIMSButton> :
                <CIMSButton
                    id={'patientlist_select_' + rowData.appointmentId}
                    style={{ margin: 0, lineHeight: 'unset' }}
                    onClick={
                        () => {
                            if (isFutureAppt) {
                                this.selectFutureAppointment(rowData);
                            }
                            else {
                                this.selectAppointment(rowData);
                            }
                        }
                    }
                >Select</CIMSButton>
        );
    }

    customStatus = (value, rowData) => {
        let allowReset = false;
        let apptStr = moment(new Date(rowData.appointmentTime)).format(Enum.DATE_FORMAT_EDMY_VALUE);

        allowReset = rowData.statusCd === Enum.ATTENDANCE_STATUS.ATTENDED && apptStr === moment().format(Enum.DATE_FORMAT_EDMY_VALUE);
        return (
            allowReset === true ?
                <Link
                    component={'button'}
                    onClick={() => this.handleStatusClick(rowData)}
                // style={{ fontSize: 13 }}
                >
                    {rowData.status}
                </Link>
                :
                <Grid>
                    {rowData.status}
                </Grid>
        );
    }
    selectAppointment = (rowData) => {
        if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
            if (rowData.atndStatusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND) {
                let isPastAppt = AppointmentUtilties.isPastAppointment(rowData);
                this.getPatientInfo(rowData);
                if (isPastAppt) {
                    this.leadBackTakeAttendance(rowData);
                }
                else {
                    this.leadAttendance(rowData);
                }

            } else if (rowData.atndStatusCd === Enum.ATTENDANCE_STATUS.ATTENDED) {
                this.skipToPatientSummary(rowData);
                this.handleResetButtonClick();
            }
        }
        else {
            this.getPatientInfo(rowData);
        }
    }

    getPatientQueueByPage(parameter) {
        let params = _.cloneDeep(parameter);

        if (!params.dateFrom) {
            params.dateFrom = moment();
            if (!params.dateTo || moment(params.dateTo).isBefore(moment(params.dateFrom))) {
                params.dateTo = params.dateFrom;
            }
        }

        const userRoleType = this.props.userRoleType;
        params.roleType = userRoleType;

        this.tableRef.updatePage(0);
        this.props.updatePatientListField({ searchParameter: params });
        params.dateFrom = moment(params.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE);
        params.dateTo = moment(params.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE);
        this.props.getPatientList(params);
    }

    searchInputOnBlur = () => {
        this.props.updatePatientState({ patientList: [] });
    }

    searchInputOnChange = value => {
        const searchParameter = _.cloneDeep(this.props.searchParameter);
        const userRoleType = this.props.userRoleType;
        if (userRoleType && value) {
            let params = {
                dateFrom: moment(searchParameter.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                dateTo: moment(searchParameter.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
                roleType: userRoleType,
                searchStr: value
            };
            this.props.searchInPatientQueue(params, this.props.countryList);
        }
    }

    handleFilterChange = (name, value) => {
        let filterCondition = _.cloneDeep(this.props.filterCondition);
        filterCondition.hkic = null;
        // filterCondition.page = 1;
        if (name === 'dateFrom' || name === 'dateTo') {
            let parameter = _.cloneDeep(this.props.searchParameter);
            parameter[name] = value;
            this.props.updatePatientListField({ searchParameter: parameter, filterCondition });
        } else {
            filterCondition[name] = value;
            if (name === 'encounterTypeCd') {
                filterCondition.subEncounterTypeCd = '';
            }
            this.tableRef.updatePage(0);
            this.props.updatePatientListField({ filterCondition });
        }
    }

    handleFilterBlur = (name, value) => {
        let filterCondition = _.cloneDeep(this.props.filterCondition);
        filterCondition.hkic = null;
        if (name === 'dateFrom' || name === 'dateTo') {
            let parameter = _.cloneDeep(this.props.searchParameter);
            parameter[name] = value || moment();
            if (name === 'dateFrom' && moment(parameter.dateTo).isBefore(moment(parameter[name]))) {
                parameter.dateTo = parameter[name];
            } else if (name === 'dateTo' && moment(parameter.dateFrom).isAfter(moment(parameter[name]))) {
                parameter.dateFrom = parameter[name];
            }
            this.props.updatePatientListField({ searchParameter: parameter, filterCondition });
            if (moment(parameter.dateFrom).isValid() && moment(parameter.dateTo).isValid()) {
                if (moment(parameter.dateFrom) >= moment('1900-01-01')) {
                    this.getPatientQueueByPage(parameter);
                }
            }
        }
    }

    handleLinkPMI = (e, rowData) => {
        let params = _.cloneDeep(this.props.linkParameter);
        params.hkidOrDoc = (rowData.hkic || '').trim();
        params.engSurname = rowData.engSurname;
        params.engGivename = rowData.engGivename;
        params.docTypeCd = rowData.docTypeCd;
        params.phoneNo = rowData.phoneNo;
        params.patientKey = rowData.patientKey;
        params.appointmentId = rowData.appointmentId;
        this.props.updatePatientListField({ linkParameter: params, openLinkPatient: true });
    }

    handleLinkClose = () => {
        this.props.updatePatientListField({ openLinkPatient: false });
    }

    handleLinkChange = (name, value) => {
        let params = _.cloneDeep(this.props.linkParameter);
        params[name] = value;
        this.props.updatePatientListField({ linkParameter: params });
    }


    handleResetButtonClick = () => {
        const { functionCd } = this.props;
        this.props.openMask({ functionCd });
        let searchParameter = _.cloneDeep(this.props.searchParameter);
        const userRoleType = this.props.userRoleType;
        searchParameter.dateFrom = moment();
        searchParameter.dateTo = moment();

        let filterCondition = _.cloneDeep(this.props.filterCondition);
        filterCondition.encounterTypeCd = '';
        filterCondition.subEncounterTypeCd = '';
        filterCondition.patientKey = '';
        // filterCondition.page = 1;
        // filterCondition.pageSize = 10;
        filterCondition.hkic = '';
        if (userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
            filterCondition.attnStatusCd = Enum.ATTENDANCE_STATUS.NOT_ATTEND;
        } else if (userRoleType === Enum.USER_ROLE_TYPE.NURSE || userRoleType === Enum.USER_ROLE_TYPE.DOCTOR) {
            filterCondition.attnStatusCd = Enum.ATTENDANCE_STATUS.ATTENDED;
        }

        this.props.updatePatientListField({ filterCondition: filterCondition });
        this.getPatientQueueByPage(searchParameter);
        this.props.closeMask({ functionCd });
    }

    handleStatusClick = (rowData) => {
        let encounterAndSubEncounter = `${rowData.encounterTypeCd} - ${rowData.subEncounterTypeCd}`;
        let tempApptDateTimeArr = rowData.appointmentTime.split(' ');
        let apptDateTime = AppointmentUtilties.combineApptDateAndTime({ appointmentDate: tempApptDateTimeArr[0], appointmentTime: tempApptDateTimeArr[1] });
        this.props.updatePatientListAttendanceInfo(rowData);
        this.props.openCommonMessage({
            msgCode: '111002',
            params: [
                { name: 'DOC_NO', value: rowData.hkic },
                { name: 'ATTENDANCE_NAME', value: rowData.name },
                { name: 'CASE_NO', value: CaseNoUtil.getFormatCaseNo(rowData.caseNo) },
                { name: 'ENCOUNTER_AND_SUB_ENCOUNTER', value: encounterAndSubEncounter },
                { name: 'APPOINTMENT_DATE_AND_TIME', value: apptDateTime }
            ],
            btnActions: {
                btn1Click: () => {
                    this.handleResetAttendance(rowData);
                }
            }
        });
    }

    handleResetAttendance = () => {
        let searchParms = { ...this.props.searchParameter };
        let tempPatientQueueDto = this.props.patientQueueDto;
        let resetAttendanceParms = {
            appointmentId: tempPatientQueueDto.appointmentId,
            attnTimestamp: moment(tempPatientQueueDto.appointmentDate).valueOf(),
            version: tempPatientQueueDto.version
        };
        this.props.resetAttendance(resetAttendanceParms, searchParms);
    }

    searchPatientList = value => {
        const params = { searchString: value };
        this.props.searchPatientList(params);
    }

    getPatientInfo = item => {
        // let appointmentInfo = item;
        // Get enounter data by appointment id
        // this.props.getEncounterByAppointmentID({
        //     params: {
        //         appointment_id: appointmentInfo.appointmentId
        //     }
        // });
        let params = {
            patientKey: item.patientKey,
            appointmentId: item.appointmentId,
            caseNo: item.caseNo,
            callBack: () => {

                if (item.appointmentId) {


                    this.props.getPatientEncounter(item.appointmentId);
                }
                item.callback && item.callback();
            }
        };
        this.props.getPatientById(params);
    }

    handleItemSelected = (item) => {
        //it only trigger when no appointment filter
        if (item && item.patientKey > 0) {
            if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
                this.skipToPatientSummary({ patientKey: item.patientKey });
            } else if (this.props.userRoleType === Enum.USER_ROLE_TYPE.DOCTOR || this.props.userRoleType === Enum.USER_ROLE_TYPE.NURSE) {
                this.getPatientInfo({ patientKey: item.patientKey });
            }
        }
    }

    skipToPatientSummary = (patient) => {
        const callback = () => {
            this.props.skipTab(accessRightEnum.patientSummary);
        };
        this.getPatientInfo({ ...patient, callback });
    }

    leadAttendance = (rowData) => {
        if (rowData.statusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND) {
            this.props.skipTab(accessRightEnum.attendance, { rowData });
        }
    }

    leadWalkInAttendance = () => {
        this.props.updateBookingState({ pageStatus: BookingEnum.PageStatus.WALKIN, showMakeAppointmentView: true });
        this.props.skipTab(accessRightEnum.booking);
    }

    leadBackTakeAttendance = (rowData) => {
        if (rowData.statusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND) {
            const params = {
                ledByPastAppt: true,
                pastApptId: rowData.appointmentId,
                pastApptDate: rowData.appointmentDate
            };
            this.props.skipTab(accessRightEnum.backTakeAttendacne, params);
        }
    }

    selectFutureAppointment = (rowData) => {

        let params = {
            futureApptId: rowData.appointmentId,
            futureAppt: rowData,
            redirectFrom: accessRightEnum.patientSpec
        };
        if (rowData.patientKey > 0) {
            // let selectedAppt = this.props.patientQueueList.patientQueueDtos.filter((item) => { return item.patientKey === rowData.patientKey; });
            let selectedAppt = this.props.patientQueueList.patientQueueDtos.find(item => item.appointmentId === rowData.appointmentId);
            let tempFutureApptInfo = {
                ...params.futureAppt,
                ...selectedAppt.appointmentDto,
                appointmentTime: params.futureAppt.apptTime
            };
            params.futureAppt = tempFutureApptInfo;
            this.getPatientInfo(rowData);
            this.props.updateBookingState({ futureApptId: params.futureApptId, futureAppt: params.futureAppt });
            this.props.skipTab(accessRightEnum.booking, params);
        }
        else {
            if (this.props.anonPatientInfo) {
                this.props.openCommonMessage({
                    // msgCode: '111109',
                    msgCode:'112031',
                    params: [{ name: 'PATIENT_CALL', value: CommonUtilities.getPatientCall() }]
                });
            } else {
                let selectedAppt = this.props.patientQueueList.patientQueueDtos.find(item => item.patientKey === rowData.patientKey);
                if (selectedAppt) {
                    params.futureAppt = {
                        ...rowData,
                        ...selectedAppt
                    };
                    if (selectedAppt.patientDto) {
                        params.futureAppt.countryCd = selectedAppt.patientDto.countryCd;
                        if (selectedAppt.patientDto.documentPairList && selectedAppt.patientDto.documentPairList.length > 0) {
                            params.futureAppt.docTypeCd = selectedAppt.patientDto.documentPairList[0].docTypeCd;
                            params.futureAppt.hkidOrDocNo = selectedAppt.patientDto.documentPairList[0].docNo;
                        }
                    }
                    params.appointmentDto = { ...selectedAppt.appointmentDto };
                    this.props.skipTab(accessRightEnum.bookingAnonymous, params);
                }
            }
        }
    }

    render() {
        const {
            classes,
            encounterTypeList,
            searchParameter,
            filterCondition
        } = this.props;
        const encounterType = encounterTypeList.find(item => item.encounterTypeCd === filterCondition.encounterTypeCd);
        const subEncounterTypeList = encounterType ? encounterType.subEncounterTypeList : [];
        return (
            <Grid className={classes.root}>
                <Grid container spacing={1}>
                    <Grid item container xs={2}></Grid>
                    <Grid item container xs={10} alignItems="center" justify="space-between">
                        <Grid>
                            <SearchInput
                                innerRef={ref => this.searchInput = ref}
                                id="indexPatient"
                                upperCase
                                displayField={['hkidOrDocno', 'engFullName', 'phoneAndCountry']}
                                inputPlaceHolder={`Search by Case No/ ID/ Phone Number${CommonUtilities.getNameSearchCall()}`}
                                dataList={this.props.searchList}
                                onSelectItem={this.handleItemSelected}
                                onChange={this.searchInputOnChange}
                                onBlur={this.searchInputOnBlur}
                                resetList={this.searchInputOnChange}
                                clearDataList={() => this.props.updatePatientListField({ patientList: [] })}
                            />
                        </Grid>
                        <Grid style={{ marginRight: 10 }}>
                            <CIMSButton
                                id={'btn_consultation_reset'}
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={this.handleResetButtonClick}
                            >Reset</CIMSButton>
                            {/* <CIMSButton
                                id={'btn_patient_queue_print'}
                                variant="contained"
                                color="primary"
                                size="small"
                            >Print</CIMSButton> */}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container spacing={1} className={classes.filterRoot}>
                    <Grid item xs={2} style={{ paddingRight: 8 }}>
                        <ValidatorForm ref={'form'}>
                            <FilterPatient
                                searchParameter={searchParameter}
                                subEncounterTypeList={subEncounterTypeList}
                                encounterTypeList={encounterTypeList}
                                statusList={Enum.ATTENDANCE_STATUS_LIST}
                                filterCondition={filterCondition}
                                onChange={this.handleFilterChange}
                                onBlur={this.handleFilterBlur}
                            />
                        </ValidatorForm>
                    </Grid>
                    <Grid item xs={10} className={classes.filterTable} >
                        <CIMSTable
                            id={'patientAttendanceList'}
                            innerRef={ref => this.tableRef = ref}
                            rows={this.state.tableRows}
                            data={this.state.patientList ? this.state.patientList.patientQueueDtos : null}
                            options={this.state.tableOptions}
                        />
                    </Grid>
                </Grid>
                {
                    this.props.open ?
                        <LinkPatient
                            open={this.props.open}
                            handleClose={this.handleLinkClose}
                            linkParameter={this.props.linkParameter}
                            handleChange={this.handleLinkChange}
                            updatePatientListField={this.props.updatePatientListField}
                            getPatientQueue={e => this.getPatientQueueByPage(e)}
                            userRoleType={this.props.userRoleType}
                            selectAppointment={this.selectAppointment}
                            patientList={this.state.patientList}
                        /> : null
                }
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    const _encounterList = state.common.encounterTypeList;
    const clinicCd = state.login.clinic.clinicCd;
    const filterEncounterList = _encounterList && _encounterList.filter(item => item.clinic === clinicCd);
    return {
        isFocusSearchInput: state.patientSpecFunc.isFocusSearchInput,
        searchParameter: state.patientSpecFunc.searchParameter,
        filterCondition: state.patientSpecFunc.filterCondition,
        encounterTypeList: _.cloneDeep(filterEncounterList),
        open: state.patientSpecFunc.openLinkPatient,
        linkParameter: state.patientSpecFunc.linkParameter,
        subTabs: state.mainFrame.subTabs,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        patientInfo: state.patient.patientInfo,
        appointmentInfo: state.patient.appointmentInfo,
        patientQueueList: state.patientSpecFunc.patientQueueList,
        linkPatientStatus: state.patientSpecFunc.linkPatientStatus,
        patientQueueDto: state.patientSpecFunc.patientQueueDto,
        searchList: state.patientSpecFunc.patientList,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
        searchNextAction: state.patientSpecFunc.searchNextAction,
        loginInfo: state.login.loginInfo,
        service: state.login.service,
        login: state.login,
        anonPatientInfo: state.bookingAnonymousInformation.anonPatientInfo,
        countryList: state.patient.countryList || []
    };
};

const mapDispatchToProps = {
    eHRresetAll,
    searchPatientList,
    getPatientById,
    updatePatientListAttendanceInfo,
    resetAttendance,
    openCommonMessage,
    skipTab,
    updatePatientListField,
    getPatientList,
    resetPatientListField,
    resetCondition,
    getAppointmentForAttend,
    searchInPatientQueue,
    updatePatientState,
    getPatientEncounter,
    closeIdleTimeDialog,
    updateBookingState,
    openMask,
    closeMask
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PatientList));

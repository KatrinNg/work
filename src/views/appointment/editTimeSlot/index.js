import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import memoize from 'memoize-one';
import {
    Grid,
    Tooltip,
    Typography,
    Avatar
} from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import moment from 'moment';
import {
    resetAll,
    updateState,
    listTimeslot,
    resetDialogInfo,
    deleteTimeSlot,
    multiUpdateSave
} from '../../../store/actions/appointment/editTimeSlot';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import AccessRightEnum from '../../../enums/accessRightEnum';
import CIMSDataGrid from 'components/Grid/CIMSDataGrid';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import TimeSlotDialog from './timeSlotDialog';
import Enum from '../../../enums/enum';
import { CommonUtil, EnctrAndRmUtil, AppointmentUtil, DateUtil, SiteParamsUtil } from '../../../utilities';
import MultipleUpdateDialog from '../../compontent/multipleUpdateDialog';
import { ACTION_ENUM, RECURRENCE_TABS, WEEK_DAY_VALUES, ORDINAL_VALUES, MULTIPLE_UPDATE_TYPE } from '../../../constants/appointment/editTimeSlot';
import { auditAction } from '../../../store/actions/als/logAction';

const styles = () => ({
    root: {
        width: '100%'
    },
    mainButton: {
        width: '100%'
    },
    container: {
        padding: '10px 0px'
    },
    avatar: {
        float: 'left',
        fontSize: 14,
        width: 30,
        height: 30,
        backgroundColor: '#80a7d5'
    }
});

const DateRender = (props) => {
    const { data, classes } = props;
    return (
        <Grid item container alignItems="center">
            <Grid item xs={8}>{moment(data.tmsltDate).format(Enum.DATE_FORMAT_EDMY_VALUE)}</Grid>
            {
                data.isUnavailablePeriodTmslt == 0 ?
                    null : <Grid item xs={4}>
                        <Tooltip
                            title={<Typography>Unavailable Period</Typography>}
                        >
                            <Avatar className={classes.avatar}>UN</Avatar>
                        </Tooltip>
                    </Grid>
            }
        </Grid>
    );
};

class WeekdayRender extends React.Component {

    getWeekDay = (date) => {
        let week = moment(date).day();
        switch (week) {
            case 1:
                return 'Mon';
            case 2:
                return 'Tue';
            case 3:
                return 'Wed';
            case 4:
                return 'Thu';
            case 5:
                return 'Fri';
            case 6:
                return 'Sat';
            case 0:
                return 'Sun';
        }
    }

    render() {
        const { data } = this.props;
        return this.getWeekDay(data.tmsltDate);
    }
}

class EditTimeSlot extends Component {
    constructor(props) {
        super(props);

        let columnDefs = [
            {
                headerName: '', field: '', colId: 'index', minWidth: 50, maxWidth: 50, lockPinned: true, sortable: false, filter: false,
                valueGetter: (params) => {
                    return params.node.rowIndex + 1;
                }
            },
            {
                headerName: 'Date',
                field: 'tmsltDate',
                colId: 'tmsltDate',
                cellRenderer: 'dateRender',
                cellRendererParams: {
                    classes: this.props.classes
                }
                // valueGetter: (params) => {
                //     return moment(params.data.tmsltDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
                // }
            },
            {
                headerName: 'Weekday',
                field: 'weekday',
                colId: 'weekday',
                cellRenderer: 'weekdayRender'
            },
            {
                headerName: 'Room',
                field: 'rmId',
                colId: 'rmId',
                valueGetter: (params) => {
                    let roomObj = this.props.rooms.find(item => item.rmId === params.data.rmId);
                    // return roomObj && roomObj.rmCd;
                    return roomObj && roomObj.rmDesc;
                }
            },
            {
                headerName: 'Start Time',
                field: 'stime',
                colId: 'stime'
            },
            {
                headerName: 'End Time',
                field: 'etime',
                colId: 'etime'
            },
            {
                headerName: 'Session',
                field: 'sessDesc',
                colId: 'sessDesc',
                width: 155
            }
        ];

        const qtColDefs = this.getQTColDefs();

        columnDefs.splice(7, 0, ...qtColDefs);
        this.state = {
            columnDefs: columnDefs,
            qtColDefs: qtColDefs,
            isShowAvailable: false,
            lastRightDate: null,
            isOpenMultiUpdatePopup: false
        };
    }

    componentDidMount() {
        let where = { serviceCd: this.props.serviceCd, siteId: this.props.siteId };
        let configValue = AppointmentUtil.getQuotaDisplaySiteParams(where);
        if (configValue === 'Booked') {
            this.setState({ isShowAvailable: false });
        } else if (configValue === 'Available') {
            this.setState({ isShowAvailable: true });
        }
        let dateRangeLimit = CommonUtil.initDateRnage(
            this.props.clinicConfig,
            this.props.serviceCd,
            this.props.siteId,
            Enum.CLINIC_CONFIGNAME.TMSLT_PLANNING_DATE_RANGE_LIMIT);
        if (dateRangeLimit) {
            this.props.updateState({ dateRangeLimit });
        }
        this.props.updateState({ dateFrom: moment(), dateTo: moment() });
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    handleRefreshQtCol = () => {
        let qtColDefs = this.state.qtColDefs.map(item => item.field);
        this.gridApi && this.gridApi.refreshCells({ columns: qtColDefs, force: true });
        this.gridApi && this.gridApi.refreshCells({ columns: ['tmsltDate'], force: true });
    }

    getQTColDefs = () => {
        const { quotaConfig } = this.props;
        let cols = [];
        if (quotaConfig && quotaConfig.length > 0) {
            let list = CommonUtil.quotaConfig(this.props.quotaConfig);
            cols = list.map((item, index) => ({
                headerName: item.engDesc,
                field: _.toLower(item.code),
                colId: _.toLower(item.code),
                width: 120,
                valueGetter: (params) => {
                    const { isShowAvailable } = this.state;
                    return AppointmentUtil.getQuotaDisplayContent(params.data[params.colDef.field + 'Booked'] || 0, params.data[params.colDef.field] || 0, isShowAvailable);
                }
                // cellStyle: (params) => {
                //     let style = {
                //         display: 'flex',
                //         justifyContent: 'center',
                //         alignItems: 'center'
                //     };
                //     style.backgroundColor = AppointmentUtil.utilisationColorMap(null, params.data[params.colDef.field + 'Booked'] || 0, params.data[params.colDef.field] || 0, null);
                //     return style;
                // }
            }));
        }
        cols.unshift({
            headerName: 'Overall Quota',
            field: 'overallQt',
            colId: 'overallQt',
            // width: 148,
            valueGetter: (params) => {
                return params.data.overallQt || 0;
            }
        });
        return cols;
    }

    handleDateChange = (e, name) => {
        this.props.updateState({ [name]: e });
    }

    handleDateAcceptOrBlur = (e, name) => {
        let field = {
            dateFrom: this.props.dateFrom,
            dateTo: this.props.dateTo
        };
        field[name] = e;
        if (field.dateFrom && field.dateTo && moment(field.dateFrom).isValid() && moment(field.dateTo).isValid()) {
            if (name === 'dateFrom' && moment(field.dateTo).isBefore(moment(field.dateFrom))) {
                field.dateTo = field.dateFrom;
            }
            if (name === 'dateTo' && moment(field.dateFrom).isAfter(moment(field.dateTo))) {
                field.dateFrom = field.dateTo;
            }
        }
        const { dateRangeLimit } = this.props;
        if (moment(field.dateFrom).isValid() && moment(field.dateTo).isValid()) {
            if (moment(field.dateFrom).isSameOrAfter(moment('1900-01-01'))) {
                if (Math.ceil(moment(field.dateTo).diff(moment(field.dateFrom), 'day', true)) > dateRangeLimit) {
                    this.props.updateState({
                        [name]: moment(this.state.lastRightDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
                    });
                    this.setState({ lastRightDate: null });
                    this.props.openCommonMessage({
                        msgCode: '111303',
                        params: [
                            { name: 'HEADER', value: CommonUtil.getMenuNameByCd(AccessRightEnum.editTimeSlot) },
                            { name: 'DATERANGE', value: dateRangeLimit }
                        ]
                    });
                    return;
                }
            }
        }
        this.props.updateState(field);
        let params = {
            rmId: this.props.roomCd,
            dateFrom: moment(field.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: moment(field.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        this.fetchSearchTimeSlot(params);
    }

    handleFocus = (value) => {
        if (value && moment(value).isValid()) {
            this.setState({ lastRightDate: moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE) });
        }

    }

    handleDateOpen = (value) => {
        if (value && moment(value).isValid()) {
            this.setState({ lastRightDate: moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE) });
        }
    }

    handleSelectChange = (e, name) => {
        if (e && name) {
            this.props.updateState({ [name]: e.value });
            let params = {
                rmId: e.value,
                dateFrom: moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                dateTo: moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
            };
            this.fetchSearchTimeSlot(params, true);
            this.deselectAllFnc();
        }
    }

    fetchSearchTimeSlot = (params, notValid = false) => {
        if (notValid) {
            this.props.listTimeslot(params, () => {
                this.handleRefreshQtCol();
            });
        } else {
            const isTimeSlotListFormValid = this.refs.timeSlotListFormRef.isFormValid(false);
            isTimeSlotListFormValid.then(result => {
                if (result) {
                    this.props.listTimeslot(params, () => {
                        this.handleRefreshQtCol();
                    });
                }
            });
        }
    }

    handleCreate = () => {
        this.props.auditAction('Open Create TimeSlot Dialog', null, null, false);
        this.props.resetDialogInfo();
        this.deselectAllFnc();
        this.props.updateState({ dialogOpen: true, dialogName: 'CREATE', sessionsList: this.props.sessionsConfig });
    }

    handleUpdate = () => {
        this.props.auditAction('Open Update TimeSlot Dialog', null, null, false);
        this.setDialogInfo(this.props.currentSelectedId);
        this.props.updateState({ dialogOpen: true, dialogName: 'UPDATE' });
    }

    checkOverQuotaBooked = () => {
        let list = CommonUtil.quotaConfig(this.props.quotaConfig);
        let quotaList = list.map((item, index) => {
            return {
                [_.toLower(item)]: this.props.dialogInfo[_.toLower(item.code)],
                [_.toLower(item) + 'Booked']: this.props.dialogInfo[_.toLower(item.code) + 'Booked'],
                label: item.engDesc
            };
        });
        let overBookedQuotaList = (quotaList.length > 0) && quotaList.filter((item, index) => parseInt(item['qt' + (index + 1)]) < parseInt(item['qt' + (index + 1) + 'Booked']));
        return overBookedQuotaList.length > 0;
    }

    checkQuotaBooked = () => {
        let list = CommonUtil.quotaConfig(this.props.quotaConfig);
        let quotaList = list.map((item, index) => {
            return {
                [_.toLower(item)]: this.props.dialogInfo[_.toLower(item.code)],
                [_.toLower(item) + 'Booked']: this.props.dialogInfo[_.toLower(item.code) + 'Booked'],
                label: item.engDesc
            };
        });
        let bookedQuotaList = (quotaList.length > 0) && quotaList.filter((item, index) => parseInt(item['qt' + (index + 1) + 'Booked']) > 0);
        return bookedQuotaList.length > 0;
    }

    handleDelete = () => {
        this.props.auditAction('Open Delete TimeSlot Dialog', null, null, false);
        if (this.checkQuotaBooked()) {
            this.props.openCommonMessage({
                msgCode: '110910',
                showSnackbar: true,
                variant: 'warning'
            });
        } else {
            this.props.deleteTimeSlot(this.props.currentSelectedId, () => {
                this.deselectAllFnc();
                let searchParams = {
                    rmId: this.props.roomCd,
                    dateFrom: moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                    dateTo: moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE)
                };
                this.fetchSearchTimeSlot(searchParams);
            });
        }
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    deselectAllFnc = () => {
        this.gridApi.deselectAll();
        this.props.updateState({ currentSelectedId: '' });
    }

    setDialogInfo = (currentSelectedId) => {
        const params = this.gridApi.getRowNode(currentSelectedId);
        let _dialogInfo = _.cloneDeep(this.props.dialogInfo);
        _dialogInfo.dialogRoomCd = params.data.rmId;
        _dialogInfo.dialogDate = moment(params.data.tmsltDate, Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
        _dialogInfo.overallQt = params.data.overallQt !== null && params.data.overallQt !== undefined && params.data.overallQt.toString();
        _dialogInfo.startTime = moment((params.data.tmsltDate + ' ' + params.data.stime), Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
        _dialogInfo.endTime = moment((params.data.tmsltDate + ' ' + params.data.etime), Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
        if (CommonUtil.isActiveSessionId(params.data.sessId, this.props.sessionsConfig)) {
            _dialogInfo.sessId = params.data.sessId;
        } else {
            _dialogInfo.sessId = '';
            this.props.openCommonMessage({ msgCode: '110932', showSnackbar: true });
        }
        _dialogInfo.version = params.data.version;
        let list = CommonUtil.quotaConfig(this.props.quotaConfig);
        list.forEach((item, index) => {
            _dialogInfo[_.toLower(item.code)] = params.data[_.toLower(item.code)] !== null && params.data[_.toLower(item.code)] !== undefined && params.data[_.toLower(item.code)].toString();
            _dialogInfo[_.toLower(item.code) + 'Booked'] = params.data[_.toLower(item.code) + 'Booked'] !== null && params.data[_.toLower(item.code) + 'Booked'] !== undefined && params.data[_.toLower(item.code) + 'Booked'].toString();
        });
        this.props.updateState({ dialogInfo: _dialogInfo });
    }

    handleRowClick = (params, isDoubleClicked = false) => {
        if ((params.data.tmsltId && (this.props.currentSelectedId !== params.data.tmsltId)) || isDoubleClicked) {
            this.props.updateState({ currentSelectedId: params.data.tmsltId });
            if (isDoubleClicked) {
                const selectedRow = this.gridApi.getRowNode(params.data.tmsltId);
                if (selectedRow) {
                    selectedRow.setSelected(true);
                }
                this.handleUpdate();
            }
        } else {
            this.props.resetDialogInfo();
            this.props.updateState({ currentSelectedId: '' });
        }
    }

    getFilterRooms = memoize((rooms, siteId) => {
        return rooms && rooms.filter(item => (item.siteId === siteId || !item.siteId) && EnctrAndRmUtil.isActiveRoom(item));
    })

    handleMultiUpdate = () => {
        this.props.auditAction('Open Multiple Update Dialog', null, null, false);
        this.setState({ isOpenMultiUpdatePopup: true });
    }

    handleMultiOnClose = () => {
        this.props.auditAction('Close Multiple Update Dialog', null, null, false);
        this.setState({ isOpenMultiUpdatePopup: false });
        this.deselectAllFnc();
    }

    handleMultiOnSave = (data) => {
        let actionOptType = '';
        switch(data.action) {
            case ACTION_ENUM.INSERT_UPDATE: actionOptType = 'IU';break;
            case ACTION_ENUM.INSERT: actionOptType = 'I'; break;
            case ACTION_ENUM.UPDATE: actionOptType = 'U'; break;
            case ACTION_ENUM.DELETE: actionOptType = 'D'; break;
        }
        let recurrenceType = '';
        switch (data.multiUpTab) {
            case RECURRENCE_TABS.DAILY: recurrenceType = 'D'; break;
            case RECURRENCE_TABS.WEEKLY: recurrenceType = 'W'; break;
            case RECURRENCE_TABS.MONTHLY: recurrenceType = 'M'; break;
        }
        let monthlyWeekday = '';
        switch (data.monthWkDay) {
            case WEEK_DAY_VALUES.Sunday: monthlyWeekday = 0; break;
            case WEEK_DAY_VALUES.Monday: monthlyWeekday = 1; break;
            case WEEK_DAY_VALUES.Tuesday: monthlyWeekday = 2; break;
            case WEEK_DAY_VALUES.Wednesday: monthlyWeekday = 3; break;
            case WEEK_DAY_VALUES.Thursday: monthlyWeekday = 4; break;
            case WEEK_DAY_VALUES.Friday: monthlyWeekday = 5; break;
            case WEEK_DAY_VALUES.Saturday: monthlyWeekday = 6; break;
        }
        let monthlyOrdinal = '';
        switch (data.monthOrdinal) {
            case ORDINAL_VALUES.First: monthlyOrdinal = 'F'; break;
            case ORDINAL_VALUES.Second: monthlyOrdinal = '2'; break;
            case ORDINAL_VALUES.Third: monthlyOrdinal = '3'; break;
            case ORDINAL_VALUES.Fourth: monthlyOrdinal = '4'; break;
            case ORDINAL_VALUES.Last: monthlyOrdinal = 'L'; break;
        }
        let params = {
            actionOptType,
            actionType: 'slot',
            duration: _.toString(data.duration) ? parseInt(data.duration) : undefined,
            startDate: DateUtil.getParamsDate(data.startDate),
            endDate: DateUtil.getParamsDate(data.endDate),
            startTime: DateUtil.getFormatTime(data.startTime),
            endTime: DateUtil.getFormatTime(data.endTime),
            isWholeDay: data.wholeDay ? 1 : 0,
            overallQt: _.toString(data.overallQt) ? parseInt(data.overallQt) : undefined,
            qt1: data.qt1 || undefined,
            qt2: data.qt2 || undefined,
            qt3: data.qt3 || undefined,
            qt4: data.qt4 || undefined,
            qt5: data.qt5 || undefined,
            qt6: data.qt6 || undefined,
            qt7: data.qt7 || undefined,
            qt8: data.qt8 || undefined,
            recurrenceRemark: data.remark || undefined,
            recurrenceRepeatEvery: _.toString(data.repeatEvery) ? parseInt(data.repeatEvery) : undefined,
            recurrenceType,
            roomId: data.room,
            siteId: data.clinic,
            svcCd: this.props.serviceCd,
            monthlyWeekday,
            monthlyOrdinal,
            monthlyRepeatOn: _.toString(data.monthRepeatOn) ? parseInt(data.monthRepeatOn) : undefined,
            sessionId: data.session || undefined,
            weekly: data.weekDay
        };
        this.props.multiUpdateSave('Slots', params, () => {
            this.setState({ isOpenMultiUpdatePopup: false });
            let updateParams = { roomCd: data.room, dateFrom: data.startDate, dateTo: data.endDate };
            this.props.updateState(updateParams);
            let searchParams = {
                rmId: updateParams.roomCd,
                dateFrom: DateUtil.getParamsDate(data.startDate),
                dateTo: DateUtil.getParamsDate(data.endDate)
            };
            this.fetchSearchTimeSlot(searchParams, true);
            this.deselectAllFnc();
        });
    }

    render() {
        const { classes, timeslotList, rooms, siteId, siteParams, serviceCd, dateRangeLimit } = this.props;
        const { columnDefs, isShowAvailable, isOpenMultiUpdatePopup } = this.state;
        const roomsList = this.getFilterRooms(rooms, siteId);
        const isEnableTmsltMultipleUpdate = SiteParamsUtil.getIsEnableTmsltMultipleUpdate(siteParams, serviceCd, siteId);
        return (
            <Grid className={classes.root}>
                <ValidatorForm ref="timeSlotListFormRef" >
                    <Grid container className={classes.container}>
                        <Grid item container xs={6} alignItems="center" spacing={2}>
                            <Grid item container xs={4}>
                                <Grid item container xs={12} alignContent="center">
                                    <SelectFieldValidator
                                        options={roomsList && roomsList.map((item) => ({ value: item.rmId, label: item.rmDesc }))}
                                        id={'timeSlotManagement_room'}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Room<RequiredIcon /></>
                                        }}
                                        value={this.props.roomCd}
                                        onChange={e => this.handleSelectChange(e, 'roomCd')}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        absoluteMessage
                                        sortBy="label"
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container xs={4}>
                                <DateFieldValidator
                                    id={'timeSlotManagement_fromDate'}
                                    isRequired
                                    withRequiredValidator
                                    label={<>From Date<RequiredIcon /></>}
                                    value={this.props.dateFrom}
                                    onChange={e => this.handleDateChange(e, 'dateFrom')}
                                    onBlur={e => this.handleDateAcceptOrBlur(e, 'dateFrom')}
                                    onAccept={e => this.handleDateAcceptOrBlur(e, 'dateFrom')}
                                    onFocus={this.handleFocus}
                                    onOpen={() => this.handleDateOpen(this.props.dateFrom)}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item container xs={4}>
                                <DateFieldValidator
                                    id={'timeSlotManagement_toDate'}
                                    isRequired
                                    withRequiredValidator
                                    label={<>To Date<RequiredIcon /></>}
                                    value={this.props.dateTo}
                                    onChange={e => this.handleDateChange(e, 'dateTo')}
                                    onBlur={e => this.handleDateAcceptOrBlur(e, 'dateTo')}
                                    onAccept={e => this.handleDateAcceptOrBlur(e, 'dateTo')}
                                    onFocus={this.handleFocus}
                                    onOpen={() => this.handleDateOpen(this.props.dateTo)}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        <Grid item container xs={2}></Grid>
                        <Grid item container xs={4} alignItems="center" justify="flex-end" spacing={2}>
                            <Grid item xs={3}>
                                <CIMSButton
                                    id={'timeSlotManagement_create'}
                                    className={classes.mainButton}
                                    onClick={this.handleCreate}
                                >Create</CIMSButton>
                            </Grid>
                            <Grid item xs={3}>
                                <CIMSButton
                                    id={'timeSlotManagement_update'}
                                    className={classes.mainButton}
                                    disabled={!this.props.currentSelectedId}
                                    onClick={this.handleUpdate}
                                >Update</CIMSButton>
                            </Grid>
                            {
                                isEnableTmsltMultipleUpdate ?
                                    <Grid item xs={3}>
                                        <CIMSButton
                                            id={'timeSlotManagement_multipleUpdate'}
                                            className={classes.mainButton}
                                            onClick={this.handleMultiUpdate}
                                        >Multiple Update</CIMSButton>
                                    </Grid>
                                    :
                                    null
                            }
                            <Grid item xs={3}>
                                <CIMSButton
                                    id={'timeSlotManagement_delete'}
                                    className={classes.mainButton}
                                    disabled={!this.props.currentSelectedId}
                                    onClick={this.handleDelete}
                                >Delete</CIMSButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>
                <Grid style={{ height: '3vh' }} container>
                    {`* Quota Display: ${isShowAvailable ? 'Available' : 'Booked'} Quota/Total Quota`}
                </Grid>
                <Grid item container>
                    <CIMSDataGrid
                        disableAutoSize
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '70vh',
                            display: 'block'
                        }}

                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: timeslotList,
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.tmsltId,
                            frameworkComponents: {
                                dateRender: DateRender,
                                weekdayRender: WeekdayRender
                            },
                            onRowClicked: params => {
                                this.handleRowClick(params);
                            },
                            onRowDoubleClicked: params => {
                                this.handleRowClick(params, true);
                            },
                            postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                        }}
                    />
                </Grid>
                {
                    this.props.dialogOpen && this.props.dialogName ?
                        <TimeSlotDialog
                            id={'timeSlotManagementDialog'}
                            open={this.props.dialogOpen}
                            action={this.props.dialogName}
                            deselectAllFnc={this.deselectAllFnc}
                            handleRefreshQtCol={this.handleRefreshQtCol}
                        /> : null
                }
                {
                    isOpenMultiUpdatePopup ?
                        <MultipleUpdateDialog
                            type={MULTIPLE_UPDATE_TYPE.TimeSlotManagement}
                            siteId={this.props.siteId}
                            rmId={this.props.roomCd}
                            onSave={this.handleMultiOnSave}
                            onError={null}
                            onCancel={this.handleMultiOnClose}
                            dateRangeLimit={dateRangeLimit}
                        />
                        : null
                }
            </Grid >
        );
    }
}

function mapStateToProps(state) {
    return {
        roomCd: state.editTimeSlot.roomCd,
        dateFrom: state.editTimeSlot.dateFrom,
        dateTo: state.editTimeSlot.dateTo,
        dialogOpen: state.editTimeSlot.dialogOpen,
        dialogName: state.editTimeSlot.dialogName,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        clinicCd: state.login.clinic.clinicCd,
        quotaConfig: state.common.quotaConfig,
        rooms: state.common.rooms,
        currentSelectedId: state.editTimeSlot.currentSelectedId,
        timeslotList: state.editTimeSlot.timeslotList,
        sessionsConfig: state.common.sessionsConfig,
        dialogInfo: state.editTimeSlot.dialogInfo,
        dateRangeLimit: state.editTimeSlot.dateRangeLimit || 365,
        siteParams: state.common.siteParams
    };
}

const mapDispatchToProps = {
    resetAll,
    updateState,
    openCommonMessage,
    listTimeslot,
    resetDialogInfo,
    deleteTimeSlot,
    multiUpdateSave,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EditTimeSlot));
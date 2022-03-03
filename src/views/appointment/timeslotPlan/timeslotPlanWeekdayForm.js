import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid, Typography
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import CIMSCommonSelect from '../../../components/Select/CIMSCommonSelect';
import CIMSCommonTimePicker from '../../../components/DatePicker/CIMSCommonTimePicker';
import CIMSCommonTextField from '../../../components/TextField/CIMSCommonTextField';
import CIMSCommonButton from '../../../components/Buttons/CIMSCommonButton';

import { openCommonMessage } from '../../../store/actions/message/messageAction';

import TimeslotPlanWeekdayGrid from './timeslotPlanWeekdayGrid';
import {
    updateState,
    getTimeslotPlanWeekday,
    getOtherTimeslotPlanWeekday,
    createTimeslotPlan,
    updateTimeslotPlan,
    closeTimeslotPlanDialog
} from '../../../store/actions/appointment/timeslotPlan/timeslotPlanAction';

import _ from 'lodash';
import moment from 'moment';
import { Formik, Form, Field, FieldArray, ErrorMessage, getIn, setIn } from 'formik';
import * as yup from 'yup';

import 'ag-grid-community/dist/styles/ag-grid.css';
import '../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';
import {auditAction} from '../../../store/actions/als/logAction';
import Enum from '../../../enums/enum';
import { getSiteParamsValueByName } from '../../../utilities/commonUtilities';


const styles = theme => ({
    gridRow: {
        minHeight: '60px'
    },
    gridInputRow: {
        minHeight: '75px'
    },
    paddingRow: {
        height: '30px'
    },
    quotaTextFieldRoot: {
        minWidth: '90px',
        maxWidth: '120px'
    },
    selectRoot: {
        minWidth: '250px'
    },
    error: {
        color: 'red',
        fontSize: '0.75rem'
    }
});

const timeslotPlanDto = {
    rowId: undefined,
    tmsltPlanHdrId: undefined,
    tmsltPlanId: undefined,
    stime: null,
    etime: null,
    qt1: 0,
    qt2: 0,
    qt3: 0,
    qt4: 0,
    qt5: 0,
    qt6: 0,
    qt7: 0,
    qt8: 0,
    overallQt: undefined,
    persType: undefined,
    updateBy: undefined,
    updateDtm: undefined,
    version: undefined,
    lastApptDate: undefined,
    action: undefined,
    timeChanged: true
};

class TimeslotPlanWeekdayForm extends Component {
    constructor(props) {
        super(props);

        let weekdays = [
            {value: '1000000', label: 'Sunday', alias: 'Sun', day: 0},
            {value: '0100000', label: 'Monday', alias: 'Mon', day: 1},
            {value: '0010000', label: 'Tuesday', alias: 'Tue', day: 2},
            {value: '0001000', label: 'Wednesday', alias: 'Wed', day: 3},
            {value: '0000100', label: 'Thursday', alias: 'Thu', day: 4},
            {value: '0000010', label: 'Friday', alias: 'Fri', day:5},
            {value: '0000001', label: 'Saturday', alias: 'Sat', day: 6}
        ];

        const rooms = props.tmsltPlanHdr.rooms;
        const weekday = weekdays.find(x => x.value === props.tmsltPlanWeekday);
        const weekdayAlias = weekday && weekday.alias;
        const timeslotPlanHdr = props.timeslotPlanHdrs.find(x => x.groupId === props.tmsltPlanHdr.groupId);
        const copyableWeekdays = weekdays.map(x => {
            let hdr = timeslotPlanHdr.timeslotPlanHdrMap[x.value];
            return {
                value: hdr && hdr.tmsltPlanHdrId,
                label: x.label,
                weekday: x.value,
                ttlApptQt: hdr ? hdr.ttlApptQt : 0
            };
        }).filter(x => x.weekday !== props.tmsltPlanWeekday && x.ttlApptQt > 0);

        let validQtHeaders = Array(8).fill().map((_, i) => {
            ++i;
            if (props.quotaConfig.length === 0 || props.quotaConfig[0][`qt${i}Name`]) {
                return props.quotaConfig[0] && props.quotaConfig[0][`qt${i}Name`] || `QT${i}`;
            }
            else
                return null;
        });

        const MAX_HANDLE_NO = getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.TIMESLOT_PLAN_MAX_HANDLEABLE_SLOTS);

        this.state = {
            fontsLoaded: false,
            displayContent: false,
            rooms,
            weekdayAlias,
            weekdays,
            copyableWeekdays,
            timeslotPlanHdr,
            startDate: null,
            endDate: null,
            session: null,
            startTime: null,
            endTime: null,
            lengthInMinute: undefined,
            qt1: 0,
            qt2: 0,
            qt3: 0,
            qt4: 0,
            qt5: 0,
            qt6: 0,
            qt7: 0,
            qt8: 0,
            selectedCopyFrom: null,
            copyFromMenuOpen: false,
            copyFromInput: '',
            validQtHeaders,
            sortedColumns: ['stime', 'etime', 'qt1', 'qt2', 'qt3', 'qt4', 'qt5', 'qt6', 'qt7', 'qt8'],
            dataLoaded: false,
            isChanged: false,
            isValid: false,
            locked: false,
            noOfDataToBeProcessed: 0,
            MAX_HANDLE_NO: Number(MAX_HANDLE_NO) || 5000
        };

        this.refForm = React.createRef();
        this.refGridForm = React.createRef();
        this.refGrid = React.createRef();

        // window.test = {...window.test, rf: this.refForm, rgf: this.refGridForm, rg: this.refGrid};
    }

    componentDidMount() {
        if (document.fonts) {
            document.fonts.ready
            .then(() => {
                this.setFontsLoaded(true);
            });
        }

        this.updateLocalHeaderState(this.props.tmsltPlanHdr);
        if (this.props.tmsltPlanHdrId) {
            if (this.props.tmsltPlanWeekday) {
                this.props.getTimeslotPlanWeekday(this.props.tmsltPlanHdrId);
            }
        }
        else {
            this.updateLocalDetailState([]);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tmsltPlanHdr !== this.props.tmsltPlanHdr) {
            // console.log(this.props.tmsltPlanHdr);
            this.updateLocalHeaderState(this.props.tmsltPlanHdr);
        }

        if (prevProps.timeslotPlans !== this.props.timeslotPlans) {
            // console.log(this.props.timeslotPlans);
            this.updateLocalDetailState(this.props.timeslotPlans);
        }

        if (prevProps.otherTimeslotPlans !== this.props.otherTimeslotPlans) {
            const form = this.getGridForm();
            if (!form)
                return;
            let otherTimeslotPlans = this.props.otherTimeslotPlans;
            if (otherTimeslotPlans && otherTimeslotPlans.length > 0) {
                let { rowId } = form.values;
                let timeslotPlans = [];
                for (let i = 0; i < otherTimeslotPlans.length; i++) {
                    const { stime, etime, qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8 } = otherTimeslotPlans[i];
                    let qts = Object.entries({ qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8 }).reduce((a, [k, v]) => (a[k] = (v == null ? 0 : v), a), {});
                    // timeslotPlans.push({ rowId: ++rowId, action: 'insert', tmsltPlanHdrId: this.props.tmsltPlanHdrId, stime: moment(stime, 'HH:mm'), etime: moment(etime, 'HH:mm'), qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8 });
                    timeslotPlans.push({ rowId: ++rowId, action: 'insert', tmsltPlanHdrId: this.props.tmsltPlanHdrId, stime, etime, ...qts });
                }
                this.props.updateState({ otherTimeslotPlans: null });
                if (timeslotPlans.length > 0) {
                    this.removeAllTimeslotPlan();
                    setTimeout(() => {
                        this.insertTimeslotPlan(timeslotPlans, () => {
                            form.setFieldValue('rowId', rowId);
                        });
                    }, 100);
                }
            }
        }

        this.isLoadCompleted();

        // window.test = {...window.test, rg: this.refGrid.current, d: this.state.rowData};
    }

    setFontsLoaded(complete) {
        this.setState({fontsLoaded: complete});
    }

    setLocked = value => {
        this.setState({ locked: value });
    };

    setDeferredLocked = (value, delay) => {
        setTimeout(() => this.setState({ locked: value }), delay);
    };

    getForm = () => {
        if (this.refForm.current) {
            let form = this.refForm.current;
            return form;
        }
        return null;
    }

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

    setGridData = (rowData) => {
        const grid = this.getGrid();
        if (grid) {
            grid.api.setRowData(rowData);
            grid.api.onFilterChanged();
            grid.api.deselectAll();
        }
    }

    calNoOfDataToBeProcessed = (list) => {
        // const dayDiff = moment(this.state.endDate, 'YYYY-MM-DD').diff(moment(this.state.startDate, 'YYYY-MM-DD'), 'days');
        // const noOfData = list.filter(x => x.action !== null && !(x.action === 'delete' && x.tmsltPlanId == null)).length * (Math.floor(dayDiff / 7) + 1) * this.state.rooms.split(',').length;
        let noOfDays = 0;
        const endDate = moment(this.state.endDate);
        let currentDate = moment(this.state.startDate);
        while(currentDate <= endDate) {
            if (currentDate.day() === this.state.weekdays.find(x => x.alias === this.state.weekdayAlias).day) {
                noOfDays++;
            }
            currentDate = currentDate.add(1, 'days');
        }
        const noOfData = list.filter(x => x.action !== null && !(x.action === 'delete' && x.tmsltPlanId == null)).length * noOfDays * this.state.rooms.split(',').length;
        this.setState({noOfDataToBeProcessed: noOfData});
        return noOfData;
    }

    openMaxNoExceedDialog = () => {
        this.props.openCommonMessage({
            msgCode: '130301',
            params: [
                {name: 'HEADER', value: 'Max no. exceed'},
                { name: 'MESSAGE', value: `No. of timeslots to be processed (${this.state.noOfDataToBeProcessed}) > ${this.state.MAX_HANDLE_NO}\nPlease modify your planning.` }]
          });
    };

    updateLocalHeaderState = (data) => {
        let session = this.props.serviceSessionsConfig.find(x => x.sessId === data.sessId);
        this.setState({
            startDate: moment(data.sdate),
            endDate: moment(data.edate),
            session,
            ...(session && {
                startTime: moment(session.stime, 'HH:mm'),
                endTime: moment(session.etime, 'HH:mm')
            })
        });
    }

    updateLocalDetailState = (data) => {
        const form = this.getGridForm();
        if (!form)
            return;
        let rowData = [];
        let { rowId } = form.values;
        for (let i = 0; i < data.length; i++) {
            let { stime, etime, qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8, ...rest } = data[i];
            let qts = Object.entries({ qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8 }).reduce((a, [k, v]) => (a[k] = (v == null ? 0 : v), a), {});
            // rowData.push({ stime: moment(stime, 'HH:mm'), etime: moment(etime, 'HH:mm'), ...rest, rowId: ++rowId});
            rowData.push({ stime, etime, ...qts, ...rest, rowId: ++rowId});
        }
        form.setFieldValue('originalRowData', data);
        form.setFieldValue('rowData', rowData);
        form.setFieldValue('rowId', rowId);
        // this.setGridData(rowData);
        this.setState({ dataLoaded: true });
    }

    isLoadCompleted = () => {
        // if (!this.state.displayContent && this.state.startDate && this.state.endDate && this.state.session && this.state.rowData) {
        if (!this.state.displayContent && this.state.startDate && this.state.endDate) { // sessions cannot be loaded due to api problem
            this.setState({ displayContent: true });
        }
    }

    batchCreateTimeslotPlan = (values) => {
        const form = this.getGridForm();
        if (!form)
            return;
        let { startTime, endTime, lengthInMinute, qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8 } = values;
        let qts = Object.entries({ qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8 }).reduce((a, [k, v]) => (a[k] = (v == null ? 0 : v), a), {});
        // console.log(startTime, startTime && startTime.isValid(), endTime, endTime && endTime.isValid(), lengthInMinute, parseInt(lengthInMinute), qt1, qt2, qt3, qt4, qt5, qt6, qt7, qt8);

        let { rowId } = form.values;
        if (startTime && startTime.isValid() && endTime && endTime.isValid() && !isNaN(lengthInMinute)) {
            let currentTime = startTime.clone();
            let timeslotPlans = [];
            while (currentTime.isBefore(endTime, 'minute')) {
                let stime = currentTime.clone();
                currentTime.add(lengthInMinute, 'minutes');
                let etime = currentTime.isAfter(endTime, 'minute') ? endTime.clone() : currentTime.clone();

                timeslotPlans.push({ rowId: ++rowId, action: 'insert', tmsltPlanHdrId: this.props.tmsltPlanHdrId, stime: stime.format('HH:mm'), etime: etime.format('HH:mm'), ...qts });
            }
            if (timeslotPlans.length > 0) {
                if (this.calNoOfDataToBeProcessed(timeslotPlans) > this.state.MAX_HANDLE_NO) {
                    this.openMaxNoExceedDialog();
                    this.removeAllTimeslotPlan();
                    this.setState({noOfDataToBeProcessed: 0});
                } else {
                    this.removeAllTimeslotPlan();
                    this.insertTimeslotPlan(timeslotPlans, () => {
                        form.setFieldValue('rowId', rowId);
                    });
                }
            }

        }
        else {
            console.log('invalid input');
        }

    }

    addTimeslotPlan = () => {
        const form = this.getGridForm();
        const grid = this.getGrid();
        if (grid) {
            let { rowId } = form.values;

            this.insertTimeslotPlan([
                { ...timeslotPlanDto, rowId: ++rowId, action: 'insert', tmsltPlanHdrId: this.props.tmsltPlanHdrId }
            ], () => {
                form.setFieldValue('rowId', rowId);
                setTimeout(() => {
                    this.focusField(rowId, 'stime');
                }, 100);
            });
        }
    }

    deleteTimeslotPlan = () => {
        const grid = this.getGrid();
        if (grid) {
            let selectedRows = grid.api.getSelectedRows();
            if (selectedRows.length > 0) {
                let rowIds = [];

                for (let i = 0; i < selectedRows.length; ++i) {
                    rowIds.push(selectedRows[i].rowId);
                }

                this.removeTimeslotPlan(rowIds);
            }
        }
    }

    setTimeslotPlan = (timeslotPlans, callback) => {
        const form = this.getGridForm();
        let rowData = timeslotPlans;

        form.setFieldValue('rowData', rowData);
        // this.setGridData(rowData);
        callback && callback();
    }

    insertTimeslotPlan = (timeslotPlans, callback) => {
        const form = this.getGridForm();
        let rowData = form.values.rowData ? [...form.values.rowData] : [];
        // console.log(rowData);

        rowData.push(...timeslotPlans);

        form.setFieldValue('rowData', rowData);
        // this.setGridData(rowData);
        callback && callback();
    }

    removeTimeslotPlan = (timeslotPlanIds) => {
        const form = this.getGridForm();
        if (timeslotPlanIds.length > 0) {

            for (let i = 0; i < timeslotPlanIds.length; ++i) {
                // console.log('remove: ', `rowData[${timeslotPlanIds[i]}].action`);
                form.setFieldValue(`rowData[${timeslotPlanIds[i]}].action`, 'delete');
            }

            // this.setGridData(rowData);
        }
    }

    removeAllTimeslotPlan = () => {
        const form = this.getGridForm();
        let { rowData } = form.values;
        let rowIds = [];
        for (let i = 0; i < rowData.length; ++i) {
            rowIds.push(rowData[i].rowId);
        }

        this.removeTimeslotPlan(rowIds);
    }

    saveTimeslotPlan = (rowData) => {
        // console.log(JSON.stringify(rowData, null, 2));

        if (rowData) {
            let rows = rowData.filter(x => x.action !== null && !(x.action === 'delete' && x.tmsltPlanId == null));
            // console.log(this.props.tmsltPlanHdrId, JSON.stringify(rows, null, 2));

            if (rows.length > 0) {
                if (this.calNoOfDataToBeProcessed(rows) > this.state.MAX_HANDLE_NO) {
                    this.openMaxNoExceedDialog();
                }
                else {
                    if (this.props.tmsltPlanHdrId) {
                        this.props.updateTimeslotPlan(this.props.tmsltPlanHdrId, rows, { serviceCd: this.props.serviceCd, siteId: this.props.siteId });
                    }
                    else {
                        this.props.createTimeslotPlan(this.props.tmsltPlanHdr.groupId, this.props.tmsltPlanWeekday, rows, { serviceCd: this.props.serviceCd, siteId: this.props.siteId });
                    }
                }
            }
            else if (rows.length === 0) {
                this.props.closeTimeslotPlanDialog();
            }
        }
    }

    handleBatchCreate = () => {
        this.props.auditAction('Click \'BATCH CREATE\' button in Timeslot Management Dialog', null, null, false, 'ana');
        this.batchCreateTimeslotPlan();
    }

    handleCreate = () => {
        this.props.auditAction('Click \'CREATE\' button in Timeslot Management Dialog', null, null, false, 'ana');
        this.addTimeslotPlan();
    }

    handleDelete = () => {
        this.props.auditAction('Click \'DELETE\' button in Timeslot Management Dialog', null, null, false, 'ana');
        this.deleteTimeslotPlan();
    }

    handleCopyFrom = () => {
        // console.log(this.state.selectedCopyFrom);
        this.props.auditAction('Click \'COPY FROM\' button in Timeslot Management Dialog', null, null, false, 'ana');
        if (this.state.selectedCopyFrom) {
            let hdrId = this.state.selectedCopyFrom.value;
            // console.log(hdrId);
            this.props.getOtherTimeslotPlanWeekday(hdrId);
        }
    }

    handleSave = async () => {
        const form = this.getGridForm();
        const errors = await form.validateForm();
        const errorRowData = errors.rowData?.map((err, index) => {
            if (form.values.rowData[index].action === 'delete') // ignore error check for deleted rows
                return undefined;
            else
                return err;
        });

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

            this.props.openCommonMessage({
                msgCode: '130300',
                params: [
                    { name: 'HEADER', value: 'Error' },
                    { name: 'MESSAGE', value: 'Form validation failed' }
                ],
                btnActions:{
                    btn1Click: () => {
                        if (rowId !== null && colId !== null)
                            this.focusField(rowId, colId);
                    }
                }
            });
        }
        else {
            this.setLocked(true);
            this.props.auditAction('Click \'SAVE\' button in Timeslot Management Dialog');

            this.saveTimeslotPlan(form.values.rowData);
            this.setDeferredLocked(false, 500);
        }
    }

    handleCancel = () => {
        this.props.closeTimeslotPlanDialog();
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

    render() {
        const idConstant = this.props.id;
        const { classes, open, tmsltPlanWeekday } = this.props;
        const { session } = this.state;
        const form = this.getGridForm();
        const showCopyFrom = form?.values?.['originalRowData']?.length === 0;
        const yupQt = yup
                        .number()
                        .nullable()
                        .required('Required')
                        .min(0, 'Must be >= 0')
                        .max(9999, 'Must be <= 9999');
        return (
            <Grid container spacing={1}>
                <Formik
                    innerRef={this.refForm}
                    enableReinitialize
                    initialValues={{
                        session: this.state.session,
                        startTime: this.state.startTime,
                        endTime: this.state.endTime,
                        lengthInMinute: this.state.lengthInMinute,
                        qt1: this.state.qt1,
                        qt2: this.state.qt2,
                        qt3: this.state.qt3,
                        qt4: this.state.qt4,
                        qt5: this.state.qt5,
                        qt6: this.state.qt6,
                        qt7: this.state.qt7,
                        qt8: this.state.qt8
                    }}
                    validationSchema={yup.object({
                        startTime: yup
                            .object()
                            .nullable()
                            .required('Required')
                            .test('isTime', 'Invalid Time Format', function(time) {
                                return time && time.isValid();
                            })
                            .test('isStartTimeWithinSession', 'Out Of Session Range', function(time) {
                                if (time && time.isValid() && session) {
                                    let sessionStime = moment(session.stime, 'HH:mm');
                                    let sessionEtime = moment(session.etime, 'HH:mm');
                                    return time.isSameOrAfter(sessionStime, 'minute') && time.isSameOrBefore(sessionEtime, 'minute');
                                }
                                return true;
                            })
                            ,
                        endTime: yup
                            .object()
                            .nullable()
                            .required('Required')
                            .test('isTime', 'Invalid Time Format', function(time) {
                                return time && time.isValid();
                            })
                            .test('isEndTimeWithinSession', 'Out Of Session Range', function(time) {
                                if (time && time.isValid() && session) {
                                    let sessionStime = moment(session.stime, 'HH:mm');
                                    let sessionEtime = moment(session.etime, 'HH:mm');
                                    return time.isSameOrAfter(sessionStime, 'minute') && time.isSameOrBefore(sessionEtime, 'minute');
                                }
                                return true;
                            })
                            .test('isEndTimeAfterStartTime', 'Cannot earlier than Start Time', function(endTime) {
                                const { startTime } = this.parent;
                                const _stime = moment(startTime, 'HH:mm');
                                const _etime = moment(endTime, 'HH:mm');
                                if (_stime.isValid() && _etime.isValid())
                                    return _etime.isSameOrAfter(_stime, 'minute');
                                return true;
                            })
                            ,
                        lengthInMinute: yup
                            .number()
                            .nullable()
                            .required('Required')
                            .min(1, 'Must be >= 1')
                            .max(1440, 'Must be <= 1440')
                            ,
                        qt1: yupQt,
                        qt2: yupQt,
                        qt3: yupQt,
                        qt4: yupQt,
                        qt5: yupQt,
                        qt6: yupQt,
                        qt7: yupQt,
                        qt8: yupQt
                    })}
                    onSubmit={(values, formikBag) => {
                        this.setLocked(true);
                        this.batchCreateTimeslotPlan(values);
                        this.setDeferredLocked(false, 500);
                    }}
                >
                    {props => {
                        return (
                            <Form>
                                <Grid item container spacing={1}>
                                    <Grid item xs={3} className={classes.gridRow}>
                                        <CIMSCommonTextField
                                            id={idConstant + '_rooms'}
                                            label="Rooms: "
                                            margin="dense"
                                            disabled
                                            value={this.state.rooms}
                                        />
                                    </Grid>
                                    <Grid item xs={2} className={classes.gridRow}>
                                        <CIMSCommonTextField
                                            id={idConstant + '_start_date'}
                                            label="Start Date: "
                                            margin="dense"
                                            disabled
                                            value={this.state.startDate && this.state.startDate.format('DD-MM-YYYY')}
                                        />
                                    </Grid>
                                    <Grid item xs={2} className={classes.gridRow}>
                                        <CIMSCommonTextField
                                            id={idConstant + '_end_date'}
                                            label="End Date: "
                                            margin="dense"
                                            disabled
                                            value={this.state.endDate && this.state.endDate.format('DD-MM-YYYY')}
                                        />
                                    </Grid>
                                    <Grid item xs={1} className={classes.gridRow}>
                                        <CIMSCommonTextField
                                            id={idConstant + '_week_day'}
                                            label="Weekday: "
                                            margin="dense"
                                            disabled
                                            value={this.state.weekdayAlias}
                                        />
                                    </Grid>
                                    <Grid item xs={2} className={classes.gridRow}>
                                        <CIMSCommonTextField
                                            id={idConstant + '_session'}
                                            label="Session: "
                                            margin="dense"
                                            disabled
                                            value={`${this.state.session?.sessDesc} (${this.state.session?.stime} - ${this.state.session?.etime})` ?? ''}
                                        />
                                    </Grid>
                                    <Grid item xs={2} className={classes.gridRow} />
                                    {this.props.tmsltPlanHdr.ttlApptQt === 0 && !this.props.readOnly ? (
                                        <>
                                            <Grid item xs={3} className={classes.gridInputRow}>
                                                <Field name="startTime">
                                                {({ field, form, meta }) => (
                                                    <CIMSCommonTimePicker
                                                        id={idConstant + '_startTime_picker'}
                                                        label="* Start Time"
                                                        value={field.value}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                        onChange={value => form.setFieldValue(field.name, value)}
                                                        onClose={() => form.setFieldTouched(field.name, true)}
                                                    />
                                                )}
                                                </Field>
                                                <ErrorMessage name="startTime" component="div" className={classes.error} />
                                            </Grid>
                                            <Grid item xs={3} className={classes.gridInputRow}>
                                                <Field name="endTime">
                                                {({ field, form, meta }) => (
                                                    <CIMSCommonTimePicker
                                                        id={idConstant + '_endTime_picker'}
                                                        label="* End Time"
                                                        value={field.value}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                        onChange={value => form.setFieldValue(field.name, value)}
                                                        onClose={() => form.setFieldTouched(field.name, true)}
                                                    />
                                                )}
                                                </Field>
                                                <ErrorMessage name="endTime" component="div" className={classes.error} />
                                            </Grid>
                                            <Grid item xs={2} className={classes.gridInputRow}>
                                                <Field name="lengthInMinute">
                                                {({ field, form, meta }) => (
                                                    <CIMSCommonTextField
                                                        id={idConstant + '_lengthInMinute_textField'}
                                                        label="* Length (minute)"
                                                        type="number"
                                                        value={field.value}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                        onChange={value => form.setFieldValue(field.name, value)}
                                                    />
                                                )}
                                                </Field>
                                                <ErrorMessage name="lengthInMinute" component="div" className={classes.error} />
                                            </Grid>
                                            <Grid item xs={4} className={classes.gridInputRow} />
                                            <Grid item container xs={12}>
                                                {this.state.validQtHeaders.map((header, i) => {
                                                    ++i;
                                                    let fieldName = `qt${i}`;
                                                    if (header != null) {
                                                        return (
                                                            <Grid item xs={1} key={i} className={classes.gridInputRow}>
                                                                <Field name={fieldName}>
                                                                {({ field, form, meta }) => (
                                                                    <CIMSCommonTextField
                                                                        id={idConstant + `_${fieldName}_textField`}
                                                                        className={classes.quotaTextFieldRoot}
                                                                        label={header}
                                                                        type="number"
                                                                        value={field.value}
                                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                                        onChange={value => form.setFieldValue(field.name, value)}
                                                                    />
                                                                )}
                                                                </Field>
                                                                <ErrorMessage name={fieldName} component="div" className={classes.error} />
                                                            </Grid>
                                                        );
                                                    }
                                                    else
                                                        return null;
                                                }).filter(x => x !== null)}
                                            </Grid>
                                            <Grid item xs={12} className={classes.gridRow}>
                                                <CIMSCommonButton
                                                    id={idConstant + '_batch_create'}
                                                    type="submit"
                                                    disabled={this.state.locked}
                                                    onClick={this.handleClose}
                                                >
                                                    Batch Create
                                                </CIMSCommonButton>
                                            </Grid>
                                        </>
                                    ) : null}
                                </Grid>
                            </Form>
                        );
                    }}
                </Formik>
                <Grid item container xs={12} className={classes.paddingRow} />
                <Grid item container xs={12} className={classes.gridRow}>
                    <Grid item xs={1}>
                        <CIMSCommonButton
                            id={idConstant + '_create'}
                            style={{ marginTop: '10px' }}
                            disabled={this.props.readOnly}
                            onClick={this.handleCreate}
                        >
                            Create
                        </CIMSCommonButton>
                    </Grid>
                    <Grid item xs={1}>
                        <CIMSCommonButton
                            id={idConstant + '_delete'}
                            style={{ marginTop: '10px' }}
                            disabled={this.props.readOnly}
                            onClick={this.handleDelete}
                        >
                            Delete
                        </CIMSCommonButton>
                    </Grid>
                    {showCopyFrom && !this.props.readOnly ?
                        <>
                            <Grid item xs={2}>
                                <CIMSCommonSelect
                                    id={idConstant + '_copy_from'}
                                    label="Weekday"
                                    options={this.state.copyableWeekdays}
                                    value={this.state.selectedCopyFrom}
                                    controlProps={{
                                        className: classes.selectRoot,
                                        fullWidth: false
                                    }}
                                    inputProps={{
                                        filterOption: {
                                            matchFrom: 'start'
                                        }
                                    }}
                                    onChange={(value, params) => this.setState({selectedCopyFrom: value})}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <CIMSCommonButton
                                    id={idConstant + '_create'}
                                    disabled={this.state.selectedCopyFrom == null}
                                    style={{ marginTop: '10px' }}
                                    onClick={this.handleCopyFrom}
                                >
                                    Copy From
                                </CIMSCommonButton>
                            </Grid>
                        </>
                    : null}

                    <Grid item xs="auto" style={{marginTop: '18px'}}>
                        <Typography>
                            {`No. of timeslots to be processed (Max: ${this.state.MAX_HANDLE_NO}): `}
                            <span style={this.state.noOfDataToBeProcessed > this.state.MAX_HANDLE_NO ? {color: 'red'} : {color: 'black'}}>{this.state.noOfDataToBeProcessed}</span>
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={12}>
                    <TimeslotPlanWeekdayGrid
                        forwardedRef={this.refGrid}
                        innerRef={this.refGridForm}
                        session={this.state.session}
                        validQtHeaders={this.state.validQtHeaders}
                        originalRowData={null}
                        rowData={null}
                        rowId={-1}
                        onValuesChanged={props => {
                            // console.log(props.values);
                            const { rowData } = props.values;
                            if (rowData) {
                                this.setState({ isChanged: rowData.some(x => x.action !== null && !(x.action === 'delete' && x.tmsltPlanId == null)) });
                                this.calNoOfDataToBeProcessed(rowData);
                            }
                        }}
                        onErrorsChanged={props => {
                            // console.log(props.errors);
                            this.setState({ isValid: !props.errors.rowData });
                        }}
                        readOnly={this.props.readOnly}
                    />
                    <Grid item container xs={12}>
                        <Grid item xs={1}>
                            <CIMSCommonButton
                                id={idConstant + '_save'}
                                disabled={this.state.locked || !this.state.isChanged || this.props.readOnly}
                                style={{ marginTop: '10px' }}
                                onClick={this.handleSave}
                            >
                                Save
                            </CIMSCommonButton>
                        </Grid>
                        <Grid item xs={1}>
                            <CIMSCommonButton
                                id={idConstant + '_cancel'}
                                style={{ marginTop: '10px' }}
                                onClick={this.handleCancel}
                            >
                                Cancel
                            </CIMSCommonButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

function mapStateToProps(state) {
    return {
        timeslotPlanHdrs: state.timeslotPlan.timeslotPlanHdrs,
        tmsltPlanHdrId: state.timeslotPlan.tmsltPlanHdrId,
        tmsltPlanHdr: state.timeslotPlan.tmsltPlanHdr,
        tmsltPlanWeekday: state.timeslotPlan.tmsltPlanWeekday,
        timeslotPlans: state.timeslotPlan.timeslotPlans,
        otherTimeslotPlans: state.timeslotPlan.otherTimeslotPlans,
        serviceSessionsConfig: state.common.serviceSessionsConfig,
        quotaConfig: state.common.quotaConfig,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId
    };
}

const mapDispatchToProps = {
    updateState,
    getTimeslotPlanWeekday,
    getOtherTimeslotPlanWeekday,
    createTimeslotPlan,
    updateTimeslotPlan,
    closeTimeslotPlanDialog,
    openCommonMessage,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TimeslotPlanWeekdayForm));

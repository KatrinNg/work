import React from 'react';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import memoize from 'memoize-one';
import moment from 'moment';
import _ from 'lodash';
import Enum from '../../../../../enums/enum';
import { RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined } from '@material-ui/icons';
import { Grid, Tabs, Tab, Typography, FormControlLabel, Radio, Tooltip } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import * as AppointmentUtil from '../../../../../utilities/appointmentUtilities';
import { PAGE_DIALOG_STATUS } from '../../../../../enums/appointment/booking/bookingEnum';
import { connect } from 'react-redux';
import UtilisationBar from '../../../../compontent/utilisationBar';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import SqueezeInAppointmentDialog from './squeezeInAppointmentDialog';
import '../../../../../styles/common/bookingSearchDialog.scss';
import { auditAction } from '../../../../../store/actions/als/logAction';

const styles = theme => ({
    container: {
        paddingTop: 10
    },
    dialogPaper: {
        minWidth: '1010px',
        maxWidth: '50%'
    },
    slotTitle: {
        background: theme.palette.primary.main,
        height: 40,
        textAlign: 'center',
        paddingTop: 8,
        color: 'white'
    },
    radioGroupRoot: {
        width: '100%',
        minWidth: 517,
        height: 480
    },
    formControlLabelRoot: {
        border: '1px solid #a0a0a0',
        borderRadius: 8,
        margin: 0,
        marginTop: 4
    },
    tabsRoot: {
        boxShadow: '2px 3px 7px #888'
    },
    tabRoot: {
        minWidth: 300,
        '&:hover': {
            backgroundColor: '#b2dfff'
        }
    },
    iconContainer: {
        borderRadius: '50%',
        width: 18,
        height: 18,
        backgroundColor: theme.palette.white,
        alignContent: 'center',
        justifyContent: 'center'
    },
    disabled: {},
    label: {
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        overflow: 'hidden',
        '&$disabled': {
            color: 'white'
        }
    },
    backgroundColor: theme.palette.cimsBackgroundColor
});

const pickerTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiPickersStaticWrapper: {
            staticWrapperRoot: {
                backgroundColor: theme.palette.cimsBackgroundColor
            }
        }
    }
});


class SppBookingSearchDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabValue: 0,
            copyBookingTimeSlot: null,
            fill_in_date: null,
            squeezeOpen: false,
            squeezeInTimeSlot: null,
            isShowAvailable: false
        };


        const { bookSqueezeInTimeSlotData, bookConfirmSelected, bookingData, isMultiple, multipleSlotIdx, multipleSlotData } = this.props;
        const curSelSlotGrp = multipleSlotData.find(x => x.idx === multipleSlotIdx);
        this.state.copyBookingTimeSlot = bookSqueezeInTimeSlotData ? _.cloneDeep(bookSqueezeInTimeSlotData) : _.cloneDeep(curSelSlotGrp.normal);
        this.state.tabValue = bookConfirmSelected && bookConfirmSelected > -1 ? bookConfirmSelected : 0;
        this.state.fill_in_date = isMultiple ? moment(bookingData.multipleAppointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : moment(bookingData.appointmentDate ? bookingData.appointmentDate : AppointmentUtil.getElapsedAppointmentDate(bookingData.elapsedPeriod, bookingData.elapsedPeriodUnit)).format(Enum.DATE_FORMAT_EYMD_VALUE);
        this.listAvailTimeSlot();
    }

    componentDidMount() {
        let where = { serviceCd: this.props.serviceCd, siteId: this.props.siteId };
        let configValue = AppointmentUtil.getQuotaDisplaySiteParams(where);
        if (configValue === 'Booked') {
            this.setState({ isShowAvailable: false });
        } else if (configValue === 'Available') {
            this.setState({ isShowAvailable: true });
        }
    }

    changeTabValue = (e, newValue) => {
        this.setState({ tabValue: newValue }, () => {
            this.listAvailTimeSlot();
        });
    }

    onChangeSlotDate = (date, index) => {
        let { copyBookingTimeSlot, fill_in_date } = this.state;
        if (!copyBookingTimeSlot) return;
        //const { bookingData } = this.props;
        copyBookingTimeSlot[index].list[0] = { startTime: '' };
        copyBookingTimeSlot[index]['slotDate'] = moment(date).format(Enum.DATE_FORMAT_EYMD_VALUE);
        copyBookingTimeSlot[index]['startTime'] = '';
        copyBookingTimeSlot[index]['endTime'] = '';
        copyBookingTimeSlot[index]['isSqueeze'] = 0;
        copyBookingTimeSlot[index]['isUrgentSqueeze'] = 0;

        const bookingData = this.props.appointmentListCart.find(x => x.idx === copyBookingTimeSlot[index].idx);
        let startDate = index === 0 ? fill_in_date : copyBookingTimeSlot[index - 1]['slotDate'];
        copyBookingTimeSlot[index]['dateDiff'] = AppointmentUtil.getDateDiff(startDate, date, bookingData.intervalVal, bookingData.intervalType);
        if (copyBookingTimeSlot.length > index + 1) {
            copyBookingTimeSlot[index + 1]['dateDiff'] = AppointmentUtil.getDateDiff(date, copyBookingTimeSlot[index + 1]['slotDate'], bookingData.intervalVal, bookingData.intervalType);
        }
        this.setState({ copyBookingTimeSlot }, () => {
            this.listAvailTimeSlot();
        });
    }

    checkStartTime = (timeSlot,index) => {
        let {copyBookingTimeSlot}=this.state;
        const { timeSlotList } = this.props;
        const bookingData = this.props.appointmentListCart.find(x => x.idx === copyBookingTimeSlot[index].idx);
        const bookingUnit = parseInt(bookingData.bookingUnit);
        let canChange = true;
        if (bookingUnit === 1) {
            //check is fully booked
            if (timeSlot.booked >= timeSlot.total) {
                this.setState({ squeezeOpen: true, squeezeInTimeSlot: [timeSlot] });
                canChange = false;
            }
        } else if (bookingUnit > 1) {
            //check is out of session range/clinic session time
            const selectedIndex = timeSlotList.findIndex(x => x.tmsltId === timeSlot.tmsltId);
            const selectedList = timeSlotList.slice(selectedIndex, selectedIndex + bookingUnit);
            const selectedListAvailable = selectedList.filter(x => x.total > 0 && x.overallQt > 0 && x.isUnavailablePeriodTmslt === 0);
            if (selectedListAvailable.length < bookingUnit) {
                this.props.openCommonMessage({ msgCode: '111230' });
                canChange = false;
            } else {
                // for (let i = 0; i < selectedListAvailable.length - 1; i++) {
                //     if (selectedListAvailable[i + 1]['stime'] !== selectedListAvailable[i]['etime']) {
                //         this.props.openCommonMessage({ msgCode: '111230' });
                //         canChange = false;
                //         break;
                //     }
                // }
                // if (canChange) {
                //     const sessions = _.uniq(selectedList.map(item => item.sessId));
                //     if (sessions.length > 1) {
                //         this.props.openCommonMessage({ msgCode: '111230' });
                //         canChange = false;
                //     }
                // }
                const sessions = _.uniq(selectedList.map(item => item.sessId));
                if (sessions.length > 1) {
                    this.props.openCommonMessage({ msgCode: '111230' });
                    canChange = false;
                }
            }

            //check is fully booked
            if (canChange) {
                const fullyBookedIndex = selectedList.findIndex(x => x.booked >= x.total);
                if (fullyBookedIndex !== -1) {
                    this.setState({ squeezeOpen: true, squeezeInTimeSlot: _.cloneDeep(selectedList) });
                    canChange = false;
                }
            }
        } else {
            canChange = false;
        }
        return canChange;
    }

    onChangeStartTime = (e, index, timeSlot) => {
        let { copyBookingTimeSlot } = this.state;
        const { timeSlotList } = this.props;
        const bookingData = this.props.appointmentListCart.find(x => x.idx === copyBookingTimeSlot[index].idx);
        if (!copyBookingTimeSlot) return;
        if (this.checkStartTime(timeSlot,index)) {
            const bookingUnit = parseInt(bookingData.bookingUnit);
            if (bookingUnit > 1) {
                const selectedIndex = timeSlotList.findIndex(x => x.tmsltId === timeSlot.tmsltId);
                const selectedList = timeSlotList.slice(selectedIndex, selectedIndex + bookingUnit);
                if (selectedList.length !== bookingUnit) {
                    return;
                }
                copyBookingTimeSlot[index]['list'] = [];
                selectedList.forEach(item => {
                    let newItem = {
                        startTime: item.stime,
                        endTime: item.etime,
                        sessId: item.sessId,
                        slotDate: item.tmsltDate,
                        slotId: item.tmsltId
                    };
                    copyBookingTimeSlot[index]['list'].push(newItem);
                });
                copyBookingTimeSlot[index]['startTime'] = selectedList[0]['stime'];
                copyBookingTimeSlot[index]['endTime'] = selectedList[selectedList.length - 1]['etime'];
            } else {
                copyBookingTimeSlot[index]['list'] = [{
                    startTime: timeSlot.stime,
                    endTime: timeSlot.etime,
                    sessId: timeSlot.sessId,
                    slotDate: timeSlot.tmsltDate,
                    slotId: timeSlot.tmsltId
                }];
                copyBookingTimeSlot[index]['startTime'] = timeSlot.stime;
                copyBookingTimeSlot[index]['endTime'] = timeSlot.etime;
            }
            copyBookingTimeSlot[index]['isSqueeze'] = 0;
            copyBookingTimeSlot[index]['isUrgentSqueeze'] = 0;
            this.setState({ copyBookingTimeSlot });
        }
    }

    listAvailTimeSlot = () => {
        const { tabValue, copyBookingTimeSlot } = this.state;
        if (copyBookingTimeSlot && copyBookingTimeSlot.length > 0) {
            let params = {
                dateFrom: moment(copyBookingTimeSlot[tabValue]['slotDate']).format(Enum.DATE_FORMAT_EYMD_VALUE),
                dateTo: moment(copyBookingTimeSlot[tabValue]['slotDate']).format(Enum.DATE_FORMAT_EYMD_VALUE),
                rmId: copyBookingTimeSlot[0].rmId
            };
            this.props.updateState({ timeSlotList: [] });
            this.props.listTimeSlot(params);
        }
    }

    shouldDisableDate = (date, tabValue, copyBookingTimeSlot) => {
        const { bookingData, isMultiple, serviceCd } = this.props;
        if (!copyBookingTimeSlot) return false;
        let frontDate = null, behindDate = null;

        if (tabValue === 0) {
            frontDate = moment().add(-1, 'day');
        } else {
            frontDate = moment(copyBookingTimeSlot[tabValue - 1]['slotDate']);
        }

        if (copyBookingTimeSlot.length > tabValue + 1) {
            behindDate = moment(copyBookingTimeSlot[tabValue + 1]['slotDate']);
        }

        // if (serviceCd === 'ANT' && !isMultiple) {
        //     frontDate = moment(bookingData.appointmentDate).startOf('day').add(-1, 'day');
        //     behindDate = bookingData.appointmentDateTo && moment(bookingData.appointmentDateTo).startOf('day').add(1, 'day');
        // }

        if (moment(date).isSameOrBefore(frontDate, 'day')) {
            return true;
        } else {
            if (behindDate === null) {
                return false;
            } else {
                return moment(date).isSameOrAfter(behindDate, 'day');
            }
        }
    }

    getMatrixCols = memoize((timeSlotList) => {
        let colNum = 0, arr = [];
        if (timeSlotList) {
            colNum = Math.ceil(timeSlotList.length / 10);
        }
        for (let i = 0; i < colNum; i++) {
            arr.push(i);
        }
        return arr;
    });

    isDisableSaveBtn = (bookingTimeSlot) => {
        let isDisabled = true;
        const ind = bookingTimeSlot && bookingTimeSlot.findIndex(x => !(x.list && x.list[0] && x.list[0].startTime));
        if (ind === -1) {
            isDisabled = false;
        }
        return isDisabled;
    }

    squeezeIn = (isUrgent) => {
        let { copyBookingTimeSlot, squeezeInTimeSlot, tabValue } = this.state;
        copyBookingTimeSlot[tabValue]['list'] = squeezeInTimeSlot.map(item => ({
            startTime: item.stime,
            endTime: item.etime,
            sessId: item.sessId,
            slotDate: item.tmsltDate,
            slotId: item.tmsltId
        }));
        const list = copyBookingTimeSlot[tabValue]['list'];
        copyBookingTimeSlot[tabValue]['startTime'] = list[0]['startTime'];
        copyBookingTimeSlot[tabValue]['endTime'] = list[list.length - 1]['endTime'];
        copyBookingTimeSlot[tabValue]['isSqueeze'] = 1;
        copyBookingTimeSlot[tabValue]['isUrgentSqueeze'] = isUrgent ? 1 : 0;
        this.setState({ squeezeOpen: false, squeezeInTimeSlot: null, copyBookingTimeSlot });
    }

    handleSaveClick = () => {
        this.props.auditAction('Select Timeslot', null, null, false, 'ana');
        let slotList = [];
        const { copyBookingTimeSlot } = this.state;
        this.props.bookTimeSlotData.forEach(slot => {
            for (let i = 0; i < copyBookingTimeSlot.length; i++) {
                if (slot.ord === copyBookingTimeSlot[i].ord) {
                    slot = copyBookingTimeSlot[i];
                }
            }
            slotList.push(slot);
        });
        this.props.handleSave(slotList);
    }


    render() {
        const { classes, open, id, timeSlotList, bookingData, encounterTypes } = this.props;
        const { tabValue, copyBookingTimeSlot, squeezeOpen, squeezeInTimeSlot, isShowAvailable } = this.state;
        const curSlotDate = copyBookingTimeSlot && copyBookingTimeSlot[tabValue] ? moment(copyBookingTimeSlot[tabValue]['slotDate']) : null;
        const matrixCols = this.getMatrixCols(timeSlotList);
        const isDisabledSave = this.isDisableSaveBtn(copyBookingTimeSlot);
        const encounter = encounterTypes.find(x => x.encntrTypeId === copyBookingTimeSlot[tabValue].encntrTypeId);
        return (
            <Grid container>
                <CIMSPromptDialog
                    open={open}
                    id={`${id}_bookingSearch`}
                    dialogTitle={'Appointment Booking - Search'}
                    classes={{ paper: classes.dialogPaper }}
                    dialogContentText={
                        <Grid container>
                            <Tabs
                                value={tabValue}
                                onChange={this.changeTabValue}
                                indicatorColor="primary"
                                textColor="primary"
                                variant="scrollable"
                                scrollButtons="auto"
                                className={classes.tabsRoot}
                            >
                                {
                                    copyBookingTimeSlot && copyBookingTimeSlot.map((item, index) => (
                                        <Tab
                                            key={index}
                                            id={`${id}_bookingSearch_tab${index}`}
                                            classes={{
                                                root: classes.tabRoot
                                            }}
                                            label={
                                                <Grid>
                                                    <Typography style={{
                                                        fontSize: 16,
                                                        textTransform: 'none'
                                                    }}
                                                    >{encounter ? encounter.encntrTypeDesc : `Appointment${index + 1}`}</Typography>
                                                    <Typography style={{
                                                        fontSize: 14,
                                                        textTransform: 'none'
                                                    }}
                                                    >{`${moment(item.slotDate).format(Enum.DATE_FORMAT_EDMY_VALUE)} ${item.list[0].startTime ? moment(item.list[0].startTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) : ''}`}</Typography>
                                                </Grid>
                                            }
                                        />
                                    ))
                                }
                            </Tabs>
                            <Grid item container className={classes.container} spacing={1}>
                                <MuiThemeProvider theme={pickerTheme}>
                                    <Grid item container xs={4} justify="center">
                                        <DatePicker
                                            autoOk
                                            variant="static"
                                            key={tabValue}
                                            openTo="date"
                                            value={curSlotDate}
                                            onChange={(date) => this.onChangeSlotDate(date, tabValue)}
                                            shouldDisableDate={date => this.shouldDisableDate(date, tabValue, copyBookingTimeSlot)}
                                        />
                                    </Grid>
                                </MuiThemeProvider>
                                <Grid item container xs={8} justify="center">
                                    <Grid
                                        item
                                        xs={12}
                                        className={classes.slotTitle}
                                    >{curSlotDate ? `${curSlotDate.format('dddd')}, ${curSlotDate.format(Enum.DATE_FORMAT_EDMY_VALUE)}` : null}</Grid>
                                    <Grid item container wrap="nowrap" className={classes.radioGroupRoot}
                                        style={
                                            {
                                                height: '540px',
                                                justifyContent: timeSlotList.length > 30 ? 'space-between' : 'unset',
                                                overflow: 'auto'
                                            }
                                        }
                                    >
                                        {
                                            matrixCols.map(item => {
                                                return (
                                                    <Grid key={item} item container direction="column" style={{ width: '22%', marginRight: 8 }}>
                                                        {
                                                            timeSlotList.slice(item * 10, (item + 1) * 10).map((i, index) => {
                                                                let isUnAvailable = i.total === 0 || i.overallQt === 0 || i.isUnavailablePeriodTmslt === 1;
                                                                return (
                                                                    <Tooltip
                                                                        title={
                                                                            <Typography>
                                                                                {`${moment(i.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)} (${AppointmentUtil.getQuotaDisplayContent(i.booked || 0, i.total || 0, isShowAvailable)})`}
                                                                            </Typography>
                                                                        }
                                                                        key={index}
                                                                        placement={'right'}
                                                                    >
                                                                        <FormControlLabel
                                                                            key={index}
                                                                            control={
                                                                                <Radio
                                                                                    color="primary"
                                                                                    icon={
                                                                                        <Grid item container className={classes.iconContainer}
                                                                                            style={{ backgroundColor: isUnAvailable ? 'unset' : 'white' }}
                                                                                        >
                                                                                            <RadioButtonUncheckedOutlined />
                                                                                        </Grid>
                                                                                    }
                                                                                    checkedIcon={
                                                                                        <Grid item container className={classes.iconContainer}>
                                                                                            <RadioButtonCheckedOutlined />
                                                                                        </Grid>
                                                                                    }
                                                                                />
                                                                            }
                                                                            name="bookingSearchTimeSlot"
                                                                            value={i.stime}
                                                                            onChange={(e) => {
                                                                                this.onChangeStartTime(e, tabValue, i);
                                                                            }}
                                                                            label={`${moment(i.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)} (${AppointmentUtil.getQuotaDisplayContent(i.booked || 0, i.total || 0, isShowAvailable)})`}
                                                                            className={classes.formControlLabelRoot}
                                                                            style={{
                                                                                marginRight: matrixCols.length === item + 1 ? 0 : 4,
                                                                                minWidth: '120px',
                                                                                backgroundColor: AppointmentUtil.utilisationColorMap(null, i.booked || 0, i.total || 0, i.overallQt, i.isUnavailablePeriodTmslt),
                                                                                width: '100%'
                                                                            }}
                                                                            classes={{ disabled: classes.disabled, label: classes.label }}
                                                                            checked={copyBookingTimeSlot[tabValue].list[0]['startTime'] === i.stime ? true : false}
                                                                            disabled={isUnAvailable}
                                                                        />
                                                                    </Tooltip>
                                                                );
                                                            })
                                                        }
                                                    </Grid>
                                                );
                                            })}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item container>
                                <UtilisationBar />
                            </Grid>
                        </Grid>
                    }
                    buttonConfig={
                        [
                            {
                                id: `${id}_bookingSearch_saveBtn`,
                                name: 'Save',
                                onClick: this.handleSaveClick,
                                disabled: isDisabledSave
                            },
                            {
                                id: `${id}_bookingSearch_cancelBtn`,
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Cancel Search Timeslot', null, null, false, 'ana');
                                    this.props.handleCancel();
                                }
                            }
                        ]
                    }
                />
                {
                    squeezeOpen && squeezeInTimeSlot ?
                        <SqueezeInAppointmentDialog
                            id={'appointment_booking_searchDialog'}
                            openSqueezeInAppointmentDialog={squeezeOpen}
                            bookingData={bookingData}
                            bookSqueezeInTimeSlotData={[
                                {
                                    ...squeezeInTimeSlot[0],
                                    slotDate: squeezeInTimeSlot[0]['tmsltDate'],
                                    startTime: squeezeInTimeSlot[0]['stime'],
                                    endTime: squeezeInTimeSlot[squeezeInTimeSlot.length - 1]['etime']
                                }
                            ]}
                            updateState={this.props.updateState}
                            handleSqueezeIn={this.squeezeIn}
                            handleBookCancel={() => { this.setState({ squeezeOpen: false, squeezeInTimeSlot: null }); }}
                            isUseForSearchDialog
                        /> : <></>
                }
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        serviceCd: state.login.service.svcCd,
        siteId: state.login.clinic.clinicCd,
        encounterTypes: state.common.encounterTypes,
        bookTimeSlotData: state.bookingInformation.bookTimeSlotData,
        appointmentListCart: state.bookingInformation.appointmentListCart
    };
};

const dispatchToProps = {
    openCommonMessage,
    auditAction
};

export default (connect(mapStateToProps, dispatchToProps)(withStyles(styles)(SppBookingSearchDialog)));
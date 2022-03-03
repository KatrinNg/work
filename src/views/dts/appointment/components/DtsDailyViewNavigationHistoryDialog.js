import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Paper,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    SvgIcon
} from '@material-ui/core';

import _ from 'lodash';

import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';

import {
    setCalendarDetailDate,
    setFilterMode,
    getDailyView,
    getDailyNote,
    setSelectedRoom,
    setDailyViewNavigationHistory
} from '../../../../store/actions/dts/appointment/bookingAction';
import {
    DTS_DATE_WEEKDAY_DISPLAY_FORMAT,
    DTS_TIME_TO_SECONDS_DISPLAY_FORMAT
} from '../../../../constants/dts/DtsConstant';

const styles = () => ({
    root: {
        flexGrow: 1
    },
    paper: {
        padding: '10px',
        textAlign: 'center'
    },
    label: {
        textAlign: 'center',
        fontWeight: 'bold'
    },
    headerTableCell: {
        backgroundColor: '#48aeca',
        color: '#fff',
        fontWeight: 'normal',
        borderStyle: 'none'
    },
    tableRow: {
        height: 'auto'
    },
    tableCellBtn: {
        '&:hover': {
            backgroundColor: '#cccccc30',
            color: '#000000',
            cursor: 'pointer'
        }
    }
});

class DtsDailyViewNavigationHistoryDialog extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleClose = () => {
        this.props.closeConfirmDialog();
    }

    historyRowOnClick = (item) => {
        console.log('historyRowOnClick', item);
        this.props.setFilterMode(1);
        this.props.setCalendarDetailDate(item.appointmentDate);
        this.props.setSelectedRoom({room: item.room});
        this.props.getDailyView({ rmId: item.room.rmId, date: item.appointmentDate});
        if(this.props.calendarDetailDate == item.appointmentDate) {
            this.props.getDailyNote({clinicRoomId:item.room.rmId, appointmentDate:item.appointmentDate});
        }
        this.props.closeConfirmDialog();
    }

    historyRowOnPinAction = (item, isPin) => {
        console.log('historyRowOnPin', item);
        let dailyViewNavigationHistory = Object.assign([],this.props.dailyViewNavigationHistory);
        dailyViewNavigationHistory.forEach(history => {
            if (history.appointmentDate.isSame(item.appointmentDate, 'day') && history.room.rmId === item.room.rmId) {
                history.pinned = isPin ? moment() : null;
            }
        });
        this.props.setDailyViewNavigationHistory(dailyViewNavigationHistory);
    }

    getDailyViewHistoryRowView = () => {
        const { classes, dailyViewNavigationHistory } = this.props;
        if (dailyViewNavigationHistory.length > 0) {
            return (dailyViewNavigationHistory.sort((a, b) => b.pinned - a.pinned || b.recordTime - a.recordTime ).map((item,index) => (
                <TableRow className={classes.tableRow} key={index} >
                    <TableCell align="center">{moment(item.recordTime).format(DTS_TIME_TO_SECONDS_DISPLAY_FORMAT)}</TableCell>
                    <TableCell align="center">{item.room.rmCd}</TableCell>
                    <TableCell align="center" onClick={e => this.historyRowOnClick(item)} className={classes.tableCellBtn}>{moment(item.appointmentDate).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)} </TableCell>
                    <TableCell align="center>">
                        <IconButton color="primary" onClick={() => this.historyRowOnPinAction(item, !item.pinned)}>
                            {item.pinned ?
                                <SvgIcon viewBox="0 0 24 24">
                                    <path d="M0 0h24v24H0z" fill="none"/><path d="M19 13H5v-2h14v2z"/>
                                </SvgIcon> :
                                <SvgIcon viewBox="0 0 24 24">
                                    <path d="M16,9V4l1,0c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3v0 c0,0.55,0.45,1,1,1l1,0v5c0,1.66-1.34,3-3,3h0v2h5.97v7l1,1l1-1v-7H19v-2h0C17.34,12,16,10.66,16,9z" />
                                </SvgIcon>}
                        </IconButton>
                    </TableCell>
                </TableRow>
            )));
        }
    }

    render() {
        const { classes, patientInfo, openConfirmDialog, defaultClinic, dailyViewNavigationHistory, ...rest } = this.props;
        return (
            <CIMSDialog id="dtsDailyViewNavigationHistoryDialog" dialogTitle="Daily View Navigation History" open={openConfirmDialog} dialogContentProps={{ style: { width: 400 } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    <DialogContent id={'dtsDailyViewNavigationHistoryDialogContent'} style={{ padding: 0 }}>
                        <Grid>
                            <Paper square className={classes.paper+' '+classes.label}>
                                <Table className={classes.table} aria-label="caption table">
                                    <TableHead>
                                        <TableRow className={classes.tableRow}>
                                            <TableCell align="center" className={classes.headerTableCell}>Record Time</TableCell>
                                            <TableCell align="center" className={classes.headerTableCell}>Surgery</TableCell>
                                            <TableCell align="center" className={classes.headerTableCell}>Appointment Date</TableCell>
                                            <TableCell align="center" className={classes.headerTableCell}>Pin Record</TableCell>
                                            {/* <TableCell align="left" className={classes.headerTableCell}></TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {this.getDailyViewHistoryRowView()}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid>
                    </DialogContent>
                    <DialogActions className={classes.dialogAction}>
                        <CIMSButton
                            onClick={this.handleClose}
                            color="primary"
                            id={'dtsDailyViewNavigationHistoryDialogClose'}
                        >Close</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            </CIMSDialog>
        );
    }
}


const mapStateToProps = (state) => {

    return {
        defaultClinic: state.login.clinic,
        patientInfo: state.patient.patientInfo,
        dailyViewNavigationHistory: state.dtsAppointmentBooking.dailyViewNavigationHistory
    };
};

const mapDispatchToProps = {
    setFilterMode,
    setCalendarDetailDate,
    getDailyView,
    getDailyNote,
    setSelectedRoom,
    setDailyViewNavigationHistory
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDailyViewNavigationHistoryDialog));

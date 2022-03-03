import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Enum from '../../../../enums/enum';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import DtsButton from '../../components/DtsButton';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Paper
} from '@material-ui/core';

import {
//    getFilterMode,
    setSelectedRoom,
    setCalendarDetailDate,
    setFilterMode,
    getDailyView,
//    setPageStatus,
//    resetDailyNote,
    getDailyNote,
    setEmptyTimeslotDateList,
    resetAll,
    getEncounterTypeList,
    setSelectedRescheduleAppointment
} from '../../../../store/actions/dts/appointment/bookingAction';
import {
    setSelectedEmptyTimeslot
} from '../../../../store/actions/dts/appointment/emptyTimeslotAction';

const styles = ({
    root: {
        fontFamily: 'Microsoft JhengHei, Calibri',
        padding: 0,
        margin:0,
        // width: '100%'
        minWidth:'420px'
    },
    clinicLabel:{
        width: '100%',
        display: 'inline-block',
        fontSize: 14,
        margin:5,
        fontFamily: 'Microsoft JhengHei, Calibri'
    },
    container: {
        padding: '10px 0px'
    },
    row:{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
//        margin: '3px 3px 3px 3px'
    },
    basicHeader: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        padding:'0px 8px!important'
    },
    basicCell: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        borderStyle: 'none!important',
        borderBottom: '1px solid rgba(224, 224, 224, 1)!important',
        padding:'0px 8px!important'
    }
});

class DtsEmptyTimeSlotDateList extends Component {

    constructor(props) {
        super(props);
        const { classes } = props;
        let columnDefs = [
            {
                headerName: 'Appointment Date',
                valueGetter: (params) => (moment(params.data.date).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 250
            },
            {
                headerName: 'Surgery',
                field: 'surgery.rmCd',
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 150
            }
        ];

        this.state = {
            columnDefs: columnDefs,
            rowData: []
        };

        this.refGrid = React.createRef();
    }

    componentDidMount(){
        this.setState({ rowData: this.props.emptyTimeslotDateList ? this.props.emptyTimeslotDateList : [] });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.emptyTimeslotDateList !== this.props.emptyTimeslotDateList) {
            if (this.refGrid.current) {
                this.setState({ rowData: this.props.emptyTimeslotDateList ? this.props.emptyTimeslotDateList : [] });
                this.gridApi.redrawRows();
                this.gridApi.paginationGoToPage(0);
            }
        }
    }

    componentWillUnmount() {
        this.props.setSelectedEmptyTimeslot(null);
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    handleRowClick = (param) => {
        let emptyTimeslotDate = param.data;
        let queryDate = moment(emptyTimeslotDate.date).format(Enum.DATE_FORMAT_EYMD_VALUE);
console.log('handleRowClick: ' + JSON.stringify(emptyTimeslotDate));
        this.props.setSelectedEmptyTimeslot(emptyTimeslotDate);
        this.props.setFilterMode(1);
        this.props.setSelectedRoom({room: emptyTimeslotDate.surgery});
        this.props.setCalendarDetailDate(queryDate);
        this.props.getDailyView({ rmId: emptyTimeslotDate.surgery.rmId, date: queryDate});
        this.props.getEncounterTypeList({roomIdList: [emptyTimeslotDate.surgery.rmId]});
//        this.props.onAvailableDateSelect(value);
//this.props.setPageStatus(pageStatusEnum.EDIT);
        //if(this.props.calendarDetailDate == value)
            this.props.getDailyNote({clinicRoomId: emptyTimeslotDate.surgery.rmId, appointmentDate:queryDate});
    };
/*
    handleClick = (e, emptyTimeslotItem) => {
console.log('emptyTimeslotItem = ' + JSON.stringify(emptyTimeslotItem));
    };
*/

    clearAndCloseList = () => {
        this.props.resetAll();
        this.props.setEmptyTimeslotDateList([]);
        this.props.setSelectedRescheduleAppointment(null);
        this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_MODE_APPT);
    };

    render(){
        const { classes, className, selectedClinic, emptyTimeslotDateList, ...rest } = this.props;
        const { columnDefs } = this.state;

        return (
            <Paper className={classes.root + ' ' + className}>
{/*}
                <Paper>
                            <label className={classes.clinicLabel}  >
                                Clinic: {selectedClinic.siteCd}
                            </label>
                </Paper>
*/}
            {(!_.isEmpty(emptyTimeslotDateList)) ? (
            <Grid className={classes.root}>
                <div className={classes.row}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        disableAutoSize
                        suppressGoToRow
                        suppressDisplayTotal
                        // alwaysShowVerticalScroll={false}
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '850px',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: this.state.rowData, //remindAppointmentList.list ? remindAppointmentList.list : [],
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 32,
                            getRowNodeId: item => item.sequence,
                            onRowClicked: params => {
                                this.handleRowClick(params);
                            },
                            onRowDoubleClicked: params => {
                                //this.handleRowClick(params, true);
                            },
                            postSort: rowNodes => {
                                let rowNode = rowNodes[0];
                                if (rowNode) {
                                    setTimeout(
                                        rowNode => {
                                            rowNode.gridApi.refreshCells();
                                        },
                                        100,
                                        rowNode
                                    );
                                }
                            },
                            pagination: true,
                            paginationPageSize: 24
                        }}
                    />
                </div>

                <div className={classes.row}>
                    <DtsButton className={classes.clearBtn} onClick={this.clearAndCloseList}>Clear &amp; Close List</DtsButton>
                </div>
            </Grid>

/*
                <Table className={classes.table} aria-label="caption table">

                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.headerTableCell +' '+ classes.longCol}>Date</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.mediumCol}>Surgery</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                emptyTimeslotDateList.map((item, idx) => {
//                    let timeslotDate = moment(array[idx].emptyTimeslotDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    return (
                        <TableRow className={classes.tableRow} key={'emptyTimeslotDateList' + idx} hover
//                         onClick={event => this.handleClick(event, session)}
                            onClick={e => this.handleClick(e, item)}
                        >
                            <TableCell className={classes.tableCell}>
                                <Typography noWrap>{item.emptyTimeslotDate}</Typography>
                            </TableCell>
                            <TableCell className={classes.tableCell}>
                                <Typography noWrap>{item.emptyTimeslotSurgery.rmCd}</Typography>
                            </TableCell>
                        </TableRow>
                        );
                })
                }
                    </TableBody>
                </Table>
*/
                ) : (
                    <label className={classes.clinicLabel}  >
                        No empty timeslot dates in the list.
                    </label>
                )
            }
            </Paper>
        );
    }
}

const mapStateToProps = (state) => {
    // console.log('state.patient.patientInfo = '+JSON.stringify(state.patient.patientInfo));
    // console.log('selectedDailyViewTimeslot = '+JSON.stringify(state.dtsAppointmentBooking.selectedDailyViewTimeslot));
    //console.log('state.patient.patientInfo = '+JSON.stringify(state.patient.patientInfo));
    // console.log('state.dtsPatientPanel.bookingAlert = '+state.dtsPatientPanel.bookingAlert);
    return {
        selectedClinic: state.dtsEmptyTimeslot.selectedClinic,
        emptyTimeslotDateList: state.dtsAppointmentBooking.emptyTimeslotDateList,
        accessRights: state.login.accessRights
    };
};

const mapDispatchToProps = {
//    getFilterMode,
    setSelectedRoom,
    setCalendarDetailDate,
    setFilterMode,
    getDailyView,
//    setPageStatus,
//    resetDailyNote,
    getDailyNote,
    setEmptyTimeslotDateList,
    setSelectedEmptyTimeslot,
    resetAll,
    getEncounterTypeList,
    setSelectedRescheduleAppointment
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEmptyTimeSlotDateList));

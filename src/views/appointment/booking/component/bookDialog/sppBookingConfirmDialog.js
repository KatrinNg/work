import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import memoize from 'memoize-one';
import moment from 'moment';
import _ from 'lodash';
import { Grid, Typography, IconButton, Link } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import CIMSSelect from '../../../../../components/Select/CIMSSelect';
import FastTextField from '../../../../../components/TextField/FastTextField';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import Enum from '../../../../../enums/enum';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import { auditAction } from '../../../../../store/actions/als/logAction';
import { forceRefreshCells } from '../../../../../utilities/commonUtilities';

const styles = theme => ({
    boldFont: {
        fontWeight: 'bold'
    },
    dialogPaper: {
        width: '85%'
    },
    dialogPaper2: {
        width: '50%'
    },
    apptMessageContent: {
        padding: '6px 6px',
        textAlign: 'center',
        backgroundColor: theme.palette.error.main,
        color: theme.palette.background.default
    },
    textSqueeze: {
        fontWeight: 'bold',
        padding: '25px 0px 25px 0px'
    },
    textSqueeze2: {
        padding: '25px 0px 25px 0px'
    },
    tableRowRoot: {
        height: 50
    },
    sortBtn: {
        position: 'absolute',
        left: 20
    }
});

class SppBookingConfirmDialog extends React.Component {

    state = {
        columns: [
            { headerName: 'Appt.', field: 'orderNo', width: 80, maxWidth: 80, colId: 'index', valueGetter: params => params.node.rowIndex + 1 },
            {
                headerName: 'Appt. Date', field: 'slotDate', maxWidth: 165, width: 165, valueGetter: params => {
                    return moment(params.data.slotDate).format(Enum.APPOINTMENT_BOOKING_DATE);
                }
            },
            {
                headerName: 'Appt. Time', field: 'startTime', maxWidth: 150, width: 150, valueGetter: params => {
                    return `${this.apptTimeRender(params.data.startTime)} - ${this.apptTimeRender(params.data.endTime)}`;
                }
            },
            {
                headerName: 'Encounter Type', field: 'encntrTypeId', width: 195, valueGetter: params => {
                    const { encounterTypes } = params.context;
                    const encounter = encounterTypes.find(x => x.encntrTypeId === params.data.encntrTypeId);
                    return encounter ? encounter.encntrTypeDesc : '';
                },
                tooltipValueGetter: (params) => params.value
            },
            {
                headerName: 'Room', field: 'rmId', width: 150, valueGetter: params => {
                    const { rooms } = params.context;
                    const room = rooms.find(x => x.rmId === params.data.rmId);
                    return room ? room.rmDesc : '';
                },
                tooltipValueGetter: (params) => params.value
            },
            {
                headerName: 'Quota Type',
                field: 'qtType',
                width: 151,
                valueGetter: (params) => CommonUtil.getQuotaTypeDescByQuotaType(this.props.quotaConfig, params.data.qtType),
                tooltipValueGetter: (params) => params.value
            },
            { headerName: 'Remark/Memo', field: 'memo', maxWidth: 150, width: 150, align: 'center', colId: 'rmrk', cellRenderer: 'remarkMemoRenderer' },
            { headerName: 'Appt. Message', field: 'message', width: 350, maxWidth: 350, minWidth: 350, cellRenderer: 'apptMessageRender' },
            { headerName: 'Search', cellRenderer: 'searchBtnRender', width: 130, maxWidth: 130, minWidth: 130 }
        ],
        openEditRemark: false,
        editingSlotId: -1,
        remarkId: '',
        memo: ''
    }


    apptTimeRender = (time) => {
        return `${moment(time, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}`;
    }

    apptMessageRender = (params) => {
        const { classes } = this.props;
        const { data } = params;
        if (parseInt(data.dateDiff) === 0) {
            return '';
        } else if (parseInt(data.dateDiff) > 0) {
            return <Typography variant="subtitle2" className={classes.apptMessageContent}>Available date is {data.dateDiff} Day(s) later than given date</Typography>;
        } else {
            return <Typography variant="subtitle2" className={classes.apptMessageContent}>Available date is {Math.abs(parseInt(data.dateDiff))} Day(s) earlier than given date</Typography>;
        }
    }

    remarkMemoRender = (params) => {
        const { data } = params;
        if (data.remarkId || data.memo) {
            return (
                <IconButton
                    color="primary"
                    id={`${this.props.id}_bookingConfirm_editRemarkMemoBtn_${data.orderNo}`}
                    style={{ padding: 4 }}
                    onClick={(event) => {
                        this.props.auditAction('Click Edit Icon In Confirm Booking Dialog', null, null, false, 'ana');
                        event.stopPropagation();
                        if (data.list[0].slotId !== -1) {
                            this.setState({
                                editingSlotId: data.ord,
                                openEditRemark: true,
                                remarkId: data.remarkId,
                                memo: data.memo
                            });
                        }
                    }}
                >
                    <Edit />
                </IconButton>
            );
        } else {
            return (
                <Link
                    id={`${this.props.id}_bookingConfirm_addRemarkMemoBtn_${data.orderNo}`}
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={(event) => {
                        this.props.auditAction('Click Add Remark Action Link In Confirm Booking Dialog', null, null, false, 'ana');
                        event.stopPropagation();
                        if (data.list[0].slotId !== -1) {
                            this.setState({ editingSlotId: data.ord, openEditRemark: true });
                        }
                    }}
                >Add</Link>
            );
        }
    }

    searchBtnRender = (params) => {
        const { data } = params;
        return (
            <Grid container>
                <CIMSButton
                    children={'Search'}
                    onClick={() => {
                        this.props.auditAction('Search Timeslot', null, null, false, 'ana');
                        this.props.handleBookSearch(data.idx);
                        //this.props.updateState({ pageDialogStatus: PAGE_DIALOG_STATUS.SEARCHING });
                    }}
                />
            </Grid>
        );
    }

    handleTableRowClick = (e, row, index) => {
        if (typeof this.props.bookConfirmSelected !== 'number') {
            return false;
        }
        if (parseInt(this.props.bookConfirmSelected) === index) {
            this.props.updateState({ bookConfirmSelected: -1 });
        } else {
            this.props.updateState({ bookConfirmSelected: index });
        }
    }

    getRoomName = memoize((list, rmId) => {
        const roomDto = list && list.find(x => x.rmId === rmId);
        return roomDto && roomDto.rmDesc;
    });

    getEncounterTypeName = memoize((list, encounterTypeId) => {
        const encounterDto = list && list.find(x => x.encntrTypeId === encounterTypeId);
        return encounterDto && encounterDto.description;
    });

    getSiteCd = memoize((list, siteId) => {
        const site = list && list.find(item => item.siteId === siteId);
        return site && site.siteName;
    });

    getRmCd = memoize((list, rmId) => {
        const rm = list && list.find(item => item.rmId === rmId);
        return rm && rm.rmCd;
    });

    getOrderList = memoize((list) => {
        if (!list) return null;
        for (let i = 0; i < list.length; i++) {
            list[i]['orderNo'] = i;
        }
        return list;
    })

    handleSort = () => {
        let timeslot = _.cloneDeep(this.props.bookTimeSlotData);
        timeslot.sort((a, b) => {
            let dateA = `${a.slotDate} ${a.startTime}`;
            let dateB = `${b.slotDate} ${b.startTime}`;
            return moment(dateA).diff(moment(dateB));
        });
        this.props.updateState({ bookTimeSlotData: timeslot });
        //this.gridApi.refreshCells({ columns: ['index'], force: true });
        this.gridApi.redrawRows();
    }

    render() {
        const {
            classes,
            id,
            open,
            bookTimeSlotData,
            bookSqueezeInTimeSlotData,
            bookingData,
            clinicList,
            rooms,
            encounterTypes,
            remarkCodeList,
            isShowRemarkTemplate,
            appointmentListCart
        } = this.props;
        const {
            openEditRemark,
            remarkId,
            memo
        } = this.state;
        const siteName = this.getSiteCd(clinicList, appointmentListCart[0] && appointmentListCart[0].siteId);
        let buttonConfig = [
            {
                id: `${id}_bookingConfirm_sortBtn`,
                name: 'Sort',
                onClick: this.handleSort,
                className: classes.sortBtn,
                disabled: bookTimeSlotData && bookTimeSlotData.length === 0
            },
            {
                id: `${id}_bookingConfirm_confirmBtn`,
                name: 'Confirm',
                onClick: () => {
                    let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ?
                        _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);
                    this.props.handleBookConfirm(bookTimeSlotList, false);
                    this.props.updateState({ bookConfirmSelected: -1 });
                },
                disabled: bookTimeSlotData && bookTimeSlotData.length === 0
            },
            {
                id: `${id}_bookingConfirm_confirmPrintBtn`,
                name: 'Confirm & Print',
                onClick: () => {
                    let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ?
                        _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);
                    this.props.handleBookConfirm(bookTimeSlotList, true);
                    this.props.updateState({ bookConfirmSelected: -1 });
                },
                disabled: bookTimeSlotData && bookTimeSlotData.length === 0
            },
            {
                id: `${id}_bookingConfirm_cancelBtn`,
                name: 'Cancel',
                onClick: () => {
                    this.props.auditAction('Cancel Book Confrim', null, null, false, 'ana');
                    this.props.handleBookCancel();
                }
            }
        ];

        return (
            <Grid>
                <CIMSPromptDialog
                    open={open}
                    id={`${id}_bookingConfirm`}
                    dialogTitle={'Appointment Booking'}
                    classes={{
                        paper: classes.dialogPaper
                    }}
                    dialogContentText={
                        <Grid container spacing={2}>
                            <Grid item container justify="space-between" id={`${id}_bookingConfirm_site`}>
                                <Grid item container xs={4} wrap="nowrap">
                                    <Typography className={classes.boldFont}>Site:&nbsp;&nbsp;</Typography>
                                    <Typography>{siteName}</Typography>
                                </Grid>
                            </Grid>
                            <Grid item container>
                                <Typography className={classes.boldFont}>Selected Appointments:</Typography>
                            </Grid>
                            <Grid item container>
                                <CIMSDataGrid
                                    ref={ref => this.gridRef = ref}
                                    gridTheme="ag-theme-balham"
                                    divStyle={{
                                        width: '100%',
                                        height: '50vh',
                                        display: 'block'
                                    }}
                                    gridOptions={{
                                        headerHeight: 50,
                                        columnDefs: this.state.columns,
                                        rowData: bookTimeSlotData,
                                        id: id + '_bookingConfrim_table',
                                        rowHeight: 50,
                                        getRowNodeId: data => data.ord,
                                        onGridReady: params => {
                                            this.gridApi = params.api;
                                            this.gridColumnApi = params.columnApi;
                                        },
                                        suppressRowClickSelection: false,
                                        rowSelection: 'single',
                                        frameworkComponents: {
                                            remarkMemoRenderer: this.remarkMemoRender,
                                            apptMessageRender: this.apptMessageRender,
                                            searchBtnRender: this.searchBtnRender
                                        },
                                        context: {
                                            encounterTypes,
                                            rooms
                                        },
                                        enableBrowserTooltips: true,
                                        postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                                    }}
                                    suppressGoToRow
                                    suppressDisplayTotal
                                >
                                </CIMSDataGrid>
                            </Grid>
                        </Grid>
                    }
                    buttonConfig={
                        buttonConfig
                    }
                />
                <CIMSPromptDialog
                    open={openEditRemark}
                    id={`${id}_editRemarkMemo`}
                    dialogTitle={'Appointment Booking - Remark/Memo'}
                    classes={{
                        paper: classes.dialogPaper2
                    }}
                    dialogContentText={
                        <Grid container spacing={2}>
                            {
                                isShowRemarkTemplate ?
                                    <Grid item container xs={12}>
                                        <CIMSSelect
                                            id={`${id}_editRemarkMemo_remarkSelect`}
                                            value={remarkId}
                                            options={remarkCodeList && remarkCodeList.map(item => (
                                                { value: item.remarkId, label: `${item.remarkCd} (${item.description})` }
                                            ))}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: 'Remark Template'
                                            }}
                                            addNullOption
                                            onChange={e => {
                                                if (e.value) {
                                                    let remarkDto = remarkCodeList.find(item => item.remarkId === e.value);
                                                    let _memo = memo;
                                                    if ((memo || '').split('\n').length < 4) {
                                                        _memo = `${memo ? memo + '\n' : ''}${remarkDto && remarkDto.description}`;
                                                    }
                                                    this.setState({ memo: _memo, remarkId: e.value });
                                                } else {
                                                    this.setState({ remarkId: e.value });
                                                }
                                                // if (e.value) {
                                                //     let remarkDto = remarkCodeList.find(item => item.remarkId === e.value);
                                                //     let _memo = bookingData.memo;
                                                //     if ((bookingData.memo || '').split('\n').length < 4) {
                                                //         _memo = `${bookingData.memo ? bookingData.memo + '\n' : ''}${remarkDto && remarkDto.description}`;
                                                //     }
                                                //     handleChange({ 'memo': _memo, 'remarkId': e.value });
                                                // } else {
                                                //     handleChange({ 'remarkId': e.value });
                                                // }
                                                // if (e.value) {
                                                //     let remarkDto = remarkCodeList.find(item => item.remarkId === e.value);
                                                //     let _memo = `${memo ? memo + '\n' : ''}${remarkDto && remarkDto.description}`;
                                                //     this.setState({ memo: _memo, remarkId: e.value });
                                                // } else {
                                                //     this.setState({ remarkId: e.value });
                                                // }
                                            }}
                                        />
                                    </Grid> : null
                            }
                            <Grid item container xs={12}>
                                <FastTextField
                                    id={`${id}_editRemarkMemo_memoTxt`}
                                    fullWidth
                                    value={memo}
                                    inputProps={{ maxLength: 500,height:200 }}
                                    label="Memo"
                                    calActualLength
                                    multiline
                                    rows={'4'}
                                    onBlur={e => this.setState({ memo: e.target.value })}
                                    wordMaxWidth="620"
                                />
                            </Grid>
                        </Grid>
                    }
                    buttonConfig={
                        [
                            {
                                id: `${id}_editRemarkMemo_saveBtn`,
                                name: 'Save',
                                onClick: () => {
                                    this.props.auditAction('Click Save Button In Appointment Remark/Memo Dialog', null, null, false, 'ana');
                                    let _bookingData = _.cloneDeep(this.props.bookingData);
                                    let _bookTimeSlotData = _.cloneDeep(this.props.bookTimeSlotData);
                                    let _bookSqueezeInTimeSlotData = _.cloneDeep(this.props.bookSqueezeInTimeSlotData);
                                    const { editingSlotId } = this.state;
                                    if (editingSlotId !== -1) {
                                        if (_bookSqueezeInTimeSlotData) {
                                            let slotIndex = _bookSqueezeInTimeSlotData.findIndex(item => item.ord === editingSlotId);
                                            _bookSqueezeInTimeSlotData[slotIndex]['remarkId'] = remarkId;
                                            _bookSqueezeInTimeSlotData[slotIndex]['memo'] = memo;
                                            _bookingData['remarkId'] = remarkId;
                                            _bookingData['memo'] = memo;
                                            this.props.updateState({ bookSqueezeInTimeSlotData: _bookSqueezeInTimeSlotData, bookingData: _bookingData });
                                        } else if (_bookTimeSlotData) {
                                            let slotIndex = _bookTimeSlotData.findIndex(item => item.ord === editingSlotId);
                                            _bookTimeSlotData[slotIndex]['remarkId'] = remarkId;
                                            _bookTimeSlotData[slotIndex]['memo'] = memo;
                                            this.props.updateState({ bookTimeSlotData: _bookTimeSlotData, bookingData: _bookingData });
                                        }
                                    }
                                    this.setState({ openEditRemark: false, remarkId: '', memo: '', editingSlotId: -1 });
                                    this.gridApi.refreshCells({ columns: ['rmrk'], force: true });
                                }
                            },
                            {
                                id: `${id}_editRemarkMemo_cancelBtn`,
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Click Cancel Button In Appointment Remark/Memo Dialog', null, null, false, 'ana');
                                    this.setState({ openEditRemark: false, remarkId: '', memo: '', editingSlotId: -1 });
                                    this.gridApi.refreshCells({ columns: ['rmrk'], force: true });
                                }
                            }
                        ]
                    }
                />
            </Grid>
        );
    }
}

const mapStatetoProps = (state) => {
    return ({
        clinicList: state.common.clinicList,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        rooms: state.common.rooms,
        encounterTypes: state.common.encounterTypes,
        quotaConfig: state.common.quotaConfig,
        serviceCd: state.login.service.serviceCd,
        appointmentListCart: state.bookingInformation.appointmentListCart
    });
};

const mapDispatchtoProps = {
    auditAction
};

export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(SppBookingConfirmDialog));
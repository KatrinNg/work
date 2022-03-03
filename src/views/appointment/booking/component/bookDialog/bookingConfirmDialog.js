import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import memoize from 'memoize-one';
import moment from 'moment';
import _ from 'lodash';
import { Grid, Typography, IconButton, Link, Box } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import CIMSSelect from '../../../../../components/Select/CIMSSelect';
import FastTextField from '../../../../../components/TextField/FastTextField';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import AutoScrollTable from '../../../../../components/Table/AutoScrollTable';
import SearchCriteriaRow from '../searchCriteriaRow';
import Enum from '../../../../../enums/enum';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import { auditAction } from '../../../../../store/actions/als/logAction';
import FamilyNumberBtn from '../bookForm/familyMember/FamilyNumberBtn';
import { BookMeans, PageStatus as pageStatusEnum } from '../../../../../enums/appointment/booking/bookingEnum';

const styles = theme => ({
    boldFont: {
        fontWeight: 'bold'
    },
    dialogPaper: {
        width: '70%'
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
    ehsDialogPaper: {
        width: '80%'
    }
});

class BookingConfirmDialog extends React.Component {

    state = {
        columns: [
            { label: 'Appt.', name: 'orderNo', width: 50, customBodyRender: (value) => parseInt(value) + 1 },
            { label: 'Appt. Date', name: 'date', width: 90, customBodyRender: (value, rowData) => this.apptDateRender(value, rowData) },
            { label: 'Appt. Time', name: 'startTime', width: 120, customBodyRender: (value, rowData) => `${this.apptTimeRender(rowData.startTime)} - ${this.apptTimeRender(rowData.endTime)}` },
            { label: 'Quota Type', name: 'qtType', width: 130, customBodyRender: (value) => CommonUtil.getQuotaTypeDescByQuotaType(this.props.quotaConfig, value) },
            { label: 'Remark/Memo', name: 'remark', width: 120, align: 'center', customBodyRender: (value, rowData) => this.remarkMemoRender(value, rowData) },
            { label: 'Appt. Message', name: 'message', width: 320, customBodyRender: (value, rowData) => this.apptMessageRender(value, rowData) }
        ],
        openEditRemark: false,
        editingSlotId: -1,
        remarkId: '',
        memo: ''
    }

    // componentDidMount() {
    //     const { serviceCd, appointmentMode } = this.props;
    //     if (serviceCd === 'EHS') {
    //         const col = _.cloneDeep(this.state.columns);
    //         if (appointmentMode === BookMeans.SINGLE) {
    //             col.splice(2, 0, {
    //                 label: 'Default Encounter Type', name: 'encntrTypeIdDefault', width: 150, customBodyRender: (value, rowData) => this.dfltEncntrRender(value, rowData)
    //             });
    //             this.setState({ columns: col });
    //         }
    //     }
    // }

    apptDateRender = (value, rowData) => {
        return `${moment(rowData.slotDate).format(Enum.APPOINTMENT_BOOKING_DATE)}`;
    }

    apptTimeRender = (time) => {
        return `${moment(time, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}`;
    }

    dfltEncntrRender = (value, rowData) => {
        return rowData.list[0].encntrTypeIdDefaultDesc;
    }

    apptMessageRender = (value, rowData) => {
        const { classes } = this.props;
        if (parseInt(rowData.dateDiff) === 0) {
            return '';
        } else if (parseInt(rowData.dateDiff) > 0) {
            return <Typography variant="subtitle2" className={classes.apptMessageContent}>Available date is {rowData.dateDiff} Day(s) later than given date</Typography>;
        } else {
            return <Typography variant="subtitle2" className={classes.apptMessageContent}>Available date is {Math.abs(parseInt(rowData.dateDiff))} Day(s) earlier than given date</Typography>;
        }
    }

    remarkMemoRender = (value, rowData) => {
        if (rowData.remarkId || rowData.memo) {
            return (
                <IconButton
                    color="primary"
                    id={`${this.props.id}_bookingConfirm_editRemarkMemoBtn_${rowData.orderNo}`}
                    style={{ padding: 4 }}
                    onClick={(event) => {
                        this.props.auditAction('Click Edit Icon In Confirm Booking Dialog', null, null, false, 'ana');
                        event.stopPropagation();
                        if (rowData.list[0].slotId !== -1) {
                            this.setState({
                                editingSlotId: rowData.list[0].slotId,
                                openEditRemark: true,
                                remarkId: rowData.remarkId,
                                memo: rowData.memo
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
                    id={`${this.props.id}_bookingConfirm_addRemarkMemoBtn_${rowData.orderNo}`}
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={(event) => {
                        this.props.auditAction('Click Add Remark Action Link In Confirm Booking Dialog', null, null, false, 'ana');
                        event.stopPropagation();
                        if (rowData.list[0].slotId !== -1) {
                            this.setState({ editingSlotId: rowData.list[0].slotId, openEditRemark: true });
                        }
                    }}
                >Add</Link>
            );
        }
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
            bookConfirmSelected,
            isAnonymous,
            isShowRemarkTemplate,
            isShowGestMessage,
            gestCalcDto,
            serviceCd,
            searchCriteria,
            appointmentMode,
            pageStatus,
            currentSelectedApptInfo,
            familyMemberData,
            patientInfo
        } = this.props;
        const {
            openEditRemark,
            remarkId,
            memo
        } = this.state;

        const bookingList = this.getOrderList(bookSqueezeInTimeSlotData ? _.cloneDeep(bookSqueezeInTimeSlotData) : _.cloneDeep(bookTimeSlotData));
        const rommName = this.getRoomName(rooms, bookingData && bookingData.rmId);
        const encounterTypeName = this.getEncounterTypeName(bookingData.encounterTypeList, bookingData && bookingData.encounterTypeId);
        const siteName = this.getSiteCd(clinicList, bookingData && bookingData.siteId);
        const pmiGrpName = patientInfo?.cgsSpecOut?.pmiGrpName || '';
        const showFamilyBtn = serviceCd === 'CGS' && appointmentMode === BookMeans.SINGLE && pageStatus !== pageStatusEnum.WALKIN && pmiGrpName;
        const maxRows = serviceCd === 'CGS' ? 5 : 4;
        let col = _.cloneDeep(this.state.columns);
        if (serviceCd === 'EHS') {
            if (appointmentMode === BookMeans.SINGLE) {
                col.splice(3, 0, {
                    label: 'Default Encounter Type', name: 'encntrTypeIdDefault', width: 150, customBodyRender: (value, rowData) => this.dfltEncntrRender(value, rowData)
                });
            }
        }
        // NOTE Button
        let buttonConfig = [
            {
                id: `${id}_bookingConfirm_confirmBtn`,
                name:  'Confirm',
                onClick: () => {
                    let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ?
                        _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);
                    this.props.handleBookConfirm(bookTimeSlotList, false);
                    this.props.updateState({ bookConfirmSelected: -1 });
                }
            },
            {
                id: `${id}_bookingConfirm_confirmPrintBtn`,
                name:  'Confirm & Print',
                onClick: () => {
                    let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ?
                        _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);
                    this.props.handleBookConfirm(bookTimeSlotList, true);
                    this.props.updateState({ bookConfirmSelected: -1 });
                }
            },
            {
                id: `${id}_bookingConfirm_searchBtn`,
                name: 'Search',
                onClick: () => {
                    this.props.auditAction('Search Timeslot', null, null, false, 'ana');
                    this.props.handleBookSearch();
                }
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

        if(isAnonymous){
            buttonConfig.splice(1,1);
        }

        return (
            <Grid>
                <CIMSPromptDialog
                    open={open}
                    id={`${id}_bookingConfirm`}
                    dialogTitle={'Appointment Booking'}
                    classes={{
                        paper: serviceCd === 'EHS' && appointmentMode === BookMeans.SINGLE ? classes.ehsDialogPaper : classes.dialogPaper
                    }}
                    dialogContentText={
                        <Grid container spacing={2}>
                            <Grid item container justify="space-between" id={`${id}_bookingConfirm_site`}>
                                <Grid item container xs={4} wrap="nowrap">
                                    <Typography className={classes.boldFont}>Site:&nbsp;&nbsp;</Typography>
                                    <Typography>{siteName}</Typography>
                                </Grid>
                                <Grid item container xs={showFamilyBtn ? 2 : 4} wrap="nowrap" id={`${id}_bookingConfirm_room`}>
                                    <Typography className={classes.boldFont}>Room:&nbsp;&nbsp;</Typography>
                                    <Typography>{rommName}</Typography>
                                </Grid>
                                <Grid item container xs={4} wrap="nowrap" id={`${id}_bookingConfirm_encounter_type`}>
                                    <Typography className={classes.boldFont} style={{whiteSpace:'nowrap'}}>Encounter Type:&nbsp;&nbsp;</Typography>
                                    <Typography
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >{encounterTypeName}</Typography>
                                </Grid>

                                {showFamilyBtn && (
                                    <Grid item container xs={2} wrap="nowrap" id={`${id}_bookingConfirm_encounter_type`}>
                                        <Box mb={1}>
                                            <FamilyNumberBtn
                                                isConfirm
                                                isShowHistory
                                                disabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW || familyMemberData.length < 2 ? true : false}
                                                appointmentId={currentSelectedApptInfo?.appointmentId || null}
                                            />
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                            {
                                serviceCd === 'SHS' ?
                                    <Grid item container xs={12} wrap="nowrap" id={`${id}_bookingConfirm_search_criteria`}>
                                        <SearchCriteriaRow
                                            criteria={searchCriteria}
                                        />
                                    </Grid>
                                    : null
                            }
                            {
                                isShowGestMessage ?
                                    <Grid item container>
                                        <Grid item container xs={4} wrap="nowrap" id={`${id}_bookingConfirm_gest_week_start`}>
                                            <Typography className={classes.boldFont}>From:&nbsp;&nbsp;</Typography>
                                            {gestCalcDto ?
                                                <>
                                                    <Typography className={classes.boldFont}>Gest Week ({gestCalcDto.wkStart || 0}-{gestCalcDto.dayStart || 0}):&nbsp;&nbsp;</Typography>
                                                    <Typography >{gestCalcDto.startDate}</Typography>
                                                </>
                                            : null}
                                            {!gestCalcDto ?
                                                <>
                                                    {bookingData.gestWeekFromWeek != null && bookingData.gestWeekFromDay != null ? <Typography className={classes.boldFont}>Gest Week ({`${bookingData.gestWeekFromWeek}-${bookingData.gestWeekFromDay}`}):&nbsp;&nbsp;</Typography> : null}
                                                    {bookingData.appointmentDate?.isValid?.() ? <Typography>{bookingData.appointmentDate.format(Enum.DATE_FORMAT_EDMY_VALUE)}</Typography> : null}
                                                </>
                                            : null}
                                        </Grid>
                                        <Grid item container xs={4} wrap="nowrap" id={`${id}_bookingConfirm_gest_week_end`}>
                                            <Typography className={classes.boldFont}>To:&nbsp;&nbsp;</Typography>
                                            {gestCalcDto ?
                                                <>
                                                    <Typography className={classes.boldFont}>Gest Week ({gestCalcDto.wkEnd || 0}-{gestCalcDto.dayEnd || 0}):&nbsp;&nbsp;</Typography>
                                                    <Typography>{gestCalcDto.endDate}</Typography>
                                                </>
                                            : null}
                                            {!gestCalcDto ?
                                                <>
                                                    {bookingData.gestWeekToWeek != null && bookingData.gestWeekToDay != null ? <Typography className={classes.boldFont}>Gest Week ({`${bookingData.gestWeekToWeek}-${bookingData.gestWeekToDay}`}):&nbsp;&nbsp;</Typography> : null}
                                                    {bookingData.appointmentDateTo?.isValid?.() ? <Typography>{bookingData.appointmentDateTo.format(Enum.DATE_FORMAT_EDMY_VALUE)}</Typography> : null}
                                                </>
                                            : null}
                                        </Grid>
                                    </Grid> : null
                            }
                            <Grid item container>
                                <Typography className={classes.boldFont}>Selected Appointments:</Typography>
                            </Grid>
                            <Grid item container>
                                <AutoScrollTable
                                    id={id + '_bookingConfrim_table'}
                                    columns={col}
                                    store={bookingList}
                                    selectIndex={bookConfirmSelected > -1 ? [bookConfirmSelected] : []}
                                    handleRowClick={this.handleTableRowClick}
                                    classes={{ tableRowRoot: classes.tableRowRoot }}
                                />
                            </Grid>
                        </Grid>
                    }
                    buttonConfig={
                        buttonConfig
                    }
                />
                {/* NOTE Remark Dialog */}
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
                                                    let _memo = `${memo ? memo + '\n' : ''}${remarkDto && remarkDto.description}`;
                                                    this.setState({ memo: _memo, remarkId: e.value });
                                                } else {
                                                    this.setState({ remarkId: e.value });
                                                }
                                            }}
                                        />
                                    </Grid> : null
                            }
                            <Grid item container xs={12}>
                                <FastTextField
                                    id={`${id}_editRemarkMemo_memoTxt`}
                                    fullWidth
                                    value={memo}
                                    inputProps={{ maxLength: 500 }}
                                    label="Memo"
                                    calActualLength
                                    multiline
                                    rows={maxRows}
                                    wordMaxWidth="620"
                                    onBlur={e => this.setState({ memo: e.target.value })}
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
                                            let slotIndex = _bookSqueezeInTimeSlotData.findIndex(item => item.list[0].slotId === editingSlotId);
                                            _bookSqueezeInTimeSlotData[slotIndex]['remarkId'] = remarkId;
                                            _bookSqueezeInTimeSlotData[slotIndex]['memo'] = memo;
                                            _bookingData['remarkId'] = remarkId;
                                            _bookingData['memo'] = memo;
                                            this.props.updateState({ bookSqueezeInTimeSlotData: _bookSqueezeInTimeSlotData, bookingData: _bookingData });
                                        } else if (_bookTimeSlotData) {
                                            let slotIndex = _bookTimeSlotData.findIndex(item => item.list[0].slotId === editingSlotId);
                                            _bookTimeSlotData[slotIndex]['remarkId'] = remarkId;
                                            _bookTimeSlotData[slotIndex]['memo'] = memo;
                                            _bookingData['remarkId'] = remarkId;
                                            _bookingData['memo'] = memo;
                                            this.props.updateState({ bookTimeSlotData: _bookTimeSlotData, bookingData: _bookingData });
                                        }
                                    }
                                    this.setState({ openEditRemark: false, remarkId: '', memo: '', editingSlotId: -1 });
                                }
                            },
                            {
                                id: `${id}_editRemarkMemo_cancelBtn`,
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Click Cancel Button In Appointment Remark/Memo Dialog', null, null, false, 'ana');
                                    this.setState({ openEditRemark: false, remarkId: '', memo: '', editingSlotId: -1 });
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
        serviceCd:state.login.service.serviceCd,
        appointmentMode: state.bookingInformation.appointmentMode,
        pageStatus: state.bookingInformation.pageStatus,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        familyMemberData: state.bookingInformation.familyMemberData,
        patientInfo: state.patient.patientInfo
    });
};

const mapDispatchtoProps = {
    auditAction
};

export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(BookingConfirmDialog));
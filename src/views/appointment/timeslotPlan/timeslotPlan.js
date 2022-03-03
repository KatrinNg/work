import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { colors } from '@material-ui/core';
import _ from 'lodash';
import {
    Box,
    Checkbox,
    Container,
    Grid,
    Paper
} from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CIMSCommonButton from '../../../components/Buttons/CIMSCommonButton';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import moment from 'moment';
import {
    resetAll,
    updateState,
    listTimeslotPlanHdrBySite,
    listTimeslotPlanHdrByService,
    deleteTimeslotPlanHdr
} from '../../../store/actions/appointment/timeslotPlan/timeslotPlanAction';

import { openCommonMessage } from '../../../store/actions/message/messageAction';
import TimeslotPlanDialog from './timeslotPlanDialog';
import TimeslotPlanWeekdayDialog from './timeslotPlanWeekdayDialog';
import * as CommonUtil from '../../../utilities/commonUtilities';
import * as DateUtilities from '../../../utilities/dateUtilities';
import Enum, { SERVICE_CODE } from '../../../enums/enum';

import 'ag-grid-community/dist/styles/ag-grid.css';
import '../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';

import {
    Check,
    CheckBox,
    CheckBoxOutlineBlank,
    Clear
} from '@material-ui/icons';

import {auditAction} from '../../../store/actions/als/logAction';

import { getSiteParamsValueByName } from '../../../utilities/commonUtilities';

import TimeslotManagementV2 from '../timeslotManagementV2/index';

const theme = createMuiTheme({
    palette: {
        white: colors.common.white,
        black: colors.common.black,
        genderMaleColor: {
            color: 'rgba(209, 238, 252, 1)',
            transparent: 'rgba(209, 238, 252, 0.1)'
        },
        genderFeMaleColor: {
            color: 'rgba(254, 222, 237, 1)',
            transparent: 'rgba(254, 222, 237, 0.1)'
        },
        genderUnknownColor: {
            color: 'rgba(248, 209, 134, 1)',
            transparent: 'rgba(248, 209, 134, 0.1)'
        },
        deadPersonColor: {
            color: 'rgba(64, 64, 64, 1)',
            transparent: 'rgba(64, 64, 64, 1)',
            fontColor: () => this.white
        }
    }
});

const styles = () => ({

});

class TimeslotPlan extends Component {
    constructor(props) {
        super(props);

        const where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, this.props.clinicConfig, where);
        const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : null;
        let newQuotaArr = CommonUtil.transformToMap(quotaArr);
        let quotaChild = [];
        newQuotaArr.forEach((item) => {
            let newParams = { name: `new${item.engDesc}`, label: `New${item.engDesc}` };
            let oldParams = { name: `old${item.engDesc}`, label: `Old${item.engDesc}` };
            quotaChild.push(newParams);
            quotaChild.push(oldParams);
        });
        let bookingChild = [];
        newQuotaArr.forEach((item) => {
            let newParams = { name: `new${item.engDesc}Book`, label: `New${item.engDesc}` };
            let oldParams = { name: `old${item.engDesc}Book`, label: `Old${item.engDesc}` };
            bookingChild.push(newParams);
            bookingChild.push(oldParams);
        });

        this.state = {
            rowData: [
                // {siteCode: 'SPPITC', assignedRoom: 'TPC Room (New)', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 1, 1, 1, 1], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Blood Taking Room (Hepatitis)', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 0, 1, 0, 0], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Hepatitis Vaccination Room', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 0, 0, 0, 1, 1, 1], lastAppointmentBookingDate: '', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'TPC Screening 4 Weeks', session: 'AM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 1, 1, 0, 1], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Blood Taking Room (Hepatitis)', session: 'AM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [0, 0, 1, 0, 1, 1, 0], lastAppointmentBookingDate: '', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'TPC Room (New)', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 1, 1, 1, 1], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Blood Taking Room (Hepatitis)', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 0, 1, 0, 0], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Hepatitis Vaccination Room', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 0, 0, 0, 1, 1, 1], lastAppointmentBookingDate: '', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'TPC Screening 4 Weeks', session: 'AM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 1, 1, 0, 1], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Blood Taking Room (Hepatitis)', session: 'AM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [0, 0, 1, 0, 1, 1, 0], lastAppointmentBookingDate: '', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'TPC Room (New)', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 1, 1, 1, 1], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Blood Taking Room (Hepatitis)', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 0, 1, 0, 0], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Hepatitis Vaccination Room', session: 'PM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 0, 0, 0, 1, 1, 1], lastAppointmentBookingDate: '', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'TPC Screening 4 Weeks', session: 'AM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [1, 1, 0, 1, 1, 0, 1], lastAppointmentBookingDate: '2020-01-01', updateDate: '2020-02-01'},
                // {siteCode: 'SPPITC', assignedRoom: 'Blood Taking Room (Hepatitis)', session: 'AM', startDate: '2020-01-01', endDate: '2050-12-31', weekdays: [0, 0, 1, 0, 1, 1, 0], lastAppointmentBookingDate: '', updateDate: '2020-02-01'}
            ],
            rowSelected: [],
            readOnly: false,
            isClinicalAdminOnly: false
        };

        this.refGrid = React.createRef();
    }

    componentDidMount() {
        this.props.ensureDidMount();

        // this.props.listTimeslotPlanHdrBySite({ serviceCd: this.props.serviceCd, siteId: this.props.siteId });
        this.props.listTimeslotPlanHdrByService({ serviceCd: this.props.serviceCd, siteId: this.props.siteId });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.timeslotPlanHdrs !== this.props.timeslotPlanHdrs) {
            let timeslotPlanHdrs = this.props.timeslotPlanHdrs;
            if (!this.props.isSystemAdmin && !this.props.isServiceAdmin) {
                timeslotPlanHdrs = timeslotPlanHdrs.filter(x => x.siteId == this.props.siteId);
            }
            if (!this.props.isSystemAdmin && !this.props.isServiceAdmin && !this.props.isClinicalAdmin) {
                this.setState({ readOnly: true });
            }
            if (!this.props.isSystemAdmin && !this.props.isServiceAdmin && this.props.isClinicalAdmin) {
                this.setState({ isClinicalAdminOnly: true });
            }
            this.setState({ rowData: timeslotPlanHdrs });
        }

        if ((prevProps.dialogOpen !== this.props.dialogOpen && this.props.dialogOpen === false)
            || (prevProps.dialogWeekdayOpen !== this.props.dialogWeekdayOpen && this.props.dialogWeekdayOpen === false)) {
            this.clearTableSelected();
        }
    }

    componentWillUnmount() {
        this.props.resetAll();
        if (this.refGrid.current) {
            this.refGrid.current.grid.api.destroy();
        }
    }

    handleDelete = () => {
        this.props.auditAction('Click Delete button in timeslot plan', null, null, false, 'ana');

        if (this.state.rowSelected.length > 0) {
            const maxModifiableYears = getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.TIMESLOT_PLAN_MAX_MODIFIABLE_YEARS);

            if (maxModifiableYears) {
                if (this.state.rowSelected.some((row) => !DateUtilities.isDateDiffInRange(row.sdate, row.edate, Number(maxModifiableYears), 'year'))) {
                    this.props.openCommonMessage({
                        msgCode: '130301',
                        params: [
                            { name: 'HEADER', value: 'Validation Error' },
                            { name: 'MESSAGE', value: `Some of the Timeslot Plan that you want to Delete is over the Restricted Date Range!\nPlease adjust the Date Range of the Plan to fit in ${maxModifiableYears} years range!`}
                        ]
                    });
                    return;
                }
            }

            this.props.openCommonMessage({
                msgCode: '130302',
                params: [
                    { name: 'HEADER', value: 'Confirm Delete' },
                    { name: 'MESSAGE', value: 'Do you confirm the delete action?' }
                ],
                btnActions: {
                    btn1Click: () => {
                        this.props.auditAction('Click \'OK\' to confirm Delete a timeslot plan');
                        for (let i = 0; i < this.state.rowSelected.length; i++) {
                            let row = this.state.rowSelected[i];
                            this.props.deleteTimeslotPlanHdr(row.groupId, { serviceCd: this.props.serviceCd, siteId: this.props.siteId });
                        }
                    },
                    btn2Click: () => {
                        this.props.auditAction('Click No button in delete plan confirm dialog', null, null, false, 'ana');
                        this.clearTableSelected();
                    }
                }
            });
        }
    }

    handleCreate = () => {
        this.props.auditAction('Click Create button in timeslot plan', null, null, false, 'ana');
        this.props.updateState({ dialogOpen: true, dialogAction: 'create', tmsltPlanHdrId: 0 });
    }

    handleUpdate = () => {
        this.props.auditAction('Click Update button in timeslot plan', null, null, false, 'ana');
        if (this.state.rowSelected.length === 1) {
            const selected = this.state.rowSelected[0];
            if (moment(selected.edate).diff(moment(), 'days') < 0) {
                this.props.openCommonMessage({
                    msgCode: '110922'
                });
                this.clearTableSelected();
                return;
            }
            this.props.updateState({ dialogOpen: true, dialogAction: 'update', tmsltPlanHdrId: selected.tmsltPlanHdrId });
        } else {
            this.props.openCommonMessage({
                msgCode: '110911'
            });
            this.clearTableSelected();
        }
    }

    handleEditWeekday = (groupId, weekdayKey) => {
        let data = this.state.rowData.find(x => x.groupId === groupId);
        let {sdate, edate, sessId, resvQt, rmIds} = data;
        let rooms = rmIds.map(rmId => {
            let room = this.props.rooms.find(x => x.rmId == rmId);
            if (room)
                return room.rmDesc;
            return '';
        }).join(', ');
        let detail = data.timeslotPlanHdrMap[weekdayKey];
        let header = {groupId, sdate, edate, sessId, resvQt, rooms, ttlApptQt: detail ? detail.ttlApptQt : 0, tmsltPlanHdrId: detail && detail.tmsltPlanHdrId};
        // console.log('[TSP] handleEditWeekday', groupId, header, weekdayKey);
        this.props.updateState({ dialogWeekdayOpen: true, tmsltPlanHdrId: header.tmsltPlanHdrId, tmsltPlanHdr: header, tmsltPlanWeekday: weekdayKey });
    }

    clearTableSelected = () => {
        this.refGrid.current.grid.api.deselectAll();
        this.props.updateState({ selectedItems: [] });
    }

    disableClickSelectionRenderers = ['weekdayButtonRenderer'];

    render() {
        const { clinicList, rooms, serviceSessionsConfig } = this.props;
        const id = this.props.id || 'timeslotPlan';

        return (
            <MuiThemeProvider theme={theme}>
                <Container maxWidth="xl">
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center"
                    >
                        <Paper elevation={5} style={{ width: '100%', height: '100%', marginTop: '10px', marginBottom: '10px' }}>
                            <Box display="flex" flexDirection="column" justifyContent="flex-start">
                                <Box display="flex" p={1}>
                                    <Grid container spacing={1}>
                                        <Grid item md={2} lg={1}>
                                            <CIMSCommonButton
                                                id={'time_slot_management_create'}
                                                disabled={this.state.readOnly}
                                                onClick={this.handleCreate}
                                            >
                                                Create
                                            </CIMSCommonButton>
                                        </Grid>
                                        <Grid item md={2} lg={1}>
                                            <CIMSCommonButton
                                                id={'time_slot_management_update'}
                                                ref={ref => this.refUpdate = ref}
                                                disabled={this.state.rowSelected.length != 1 || this.state.readOnly}
                                                onClick={this.handleUpdate}
                                            >
                                                Update
                                            </CIMSCommonButton>
                                        </Grid>
                                        <Grid item md={2} lg={1}>
                                            <CIMSCommonButton
                                                id={'time_slot_management_delete'}
                                                disabled={this.state.rowSelected.length < 1 || this.state.readOnly}
                                                onClick={this.handleDelete}
                                            >
                                                Delete
                                            </CIMSCommonButton>
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box display="flex">
                                    <CIMSDataGrid
                                        ref={this.refGrid}
                                        gridTheme="ag-theme-balham"
                                        divStyle={{
                                            width: '100%',
                                            height: '651px',
                                            display:'block'
                                        }}
                                        gridOptions={{
                                            columnDefs: [
                                                {headerName: '', valueGetter: (params) => params.node.rowIndex + 1, minWidth: 50, maxWidth: 50},
                                                {headerName: '', valueGetter: (params) => '', filter: false, headerCheckboxSelection: true, checkboxSelection: true, minWidth: 40, maxWidth: 40},
                                                // {headerName: 'GID', field: 'groupId'},
                                                {
                                                    headerName: 'Site Code',
                                                    minWidth: 120,
                                                    width: 200,
                                                    valueGetter: (params) => {
                                                        let clinic = clinicList.find(x => x.siteId === params.data.siteId);
                                                        if (clinic)
                                                            return clinic.siteCd;
                                                        return '';
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Assigned Room',
                                                    minWidth: 120,
                                                    width: 320,
                                                    valueGetter: (params) => {
                                                        return params.data.rmIds.map(rmId => {
                                                            let room = rooms.find(x => x.rmId == rmId);
                                                            if (room)
                                                                return room.rmDesc;
                                                            return '';
                                                        }).join(', ');
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Session',
                                                    minWidth: 150,
                                                    maxWidth: 150,
                                                    valueGetter: (params) => {
                                                        let session = serviceSessionsConfig.find(x => x.sessId === params.data.sessId);
                                                        if (session)
                                                            return session.sessDesc;
                                                        return '';
                                                    },
                                                    tooltipValueGetter: (params) => params.value
                                                },
                                                {
                                                    headerName: 'Start Date',
                                                    minWidth: 150,
                                                    maxWidth: 150,
                                                    field: 'sdate',
                                                    valueFormatter: params => params.value && moment(params.value).format('DD-MM-YYYY'),
                                                    tooltipValueGetter: (params) => params.valueFormatted,
                                                    comparator: DateUtilities.dateComparator,
                                                    filter: 'agDateColumnFilter',
                                                    filterParams: {
                                                        comparator: DateUtilities.dateFilter,
                                                        browserDatePicker: true
                                                    }
                                                },
                                                {
                                                    headerName: 'End Date',
                                                    minWidth: 150,
                                                    maxWidth: 150,
                                                    field: 'edate',
                                                    valueFormatter: params => params.value && moment(params.value).format('DD-MM-YYYY'),
                                                    tooltipValueGetter: (params) => params.valueFormatted,
                                                    comparator: DateUtilities.dateComparator,
                                                    filter: 'agDateColumnFilter',
                                                    filterParams: {
                                                        comparator: DateUtilities.dateFilter,
                                                        browserDatePicker: true
                                                    }
                                                },
                                                ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, index) => {
                                                    let weekdayKey = ('' + Math.pow(10, 6 - index)).padStart(7, '0');
                                                    return {
                                                        headerName: name,
                                                        valueGetter: (params) => {
                                                            let detail = params.data.timeslotPlanHdrMap[weekdayKey];
                                                            let sdate = moment(params.data.sdate);
                                                            let edate = moment(params.data.edate);
                                                            let diff = edate.diff(sdate, 'd');
                                                            let disabled = false;
                                                            if (diff < 6) {
                                                                let indexDiff = index - sdate.weekday();
                                                                if (indexDiff < 0)
                                                                    indexDiff += 7;
                                                                disabled = indexDiff > diff;
                                                            }
                                                            return disabled ? -1 : (detail && detail.ttlApptQt > 0 ? 1 : 0);
                                                        },
                                                        cellRenderer: 'weekdayButtonRenderer',
                                                        cellRendererParams: {
                                                            handleEditWeekday: this.handleEditWeekday,
                                                            weekdayKey: weekdayKey
                                                            // rooms: this.props.rooms
                                                        },
                                                        minWidth: 60,
                                                        maxWidth: 60,
                                                        filter: false
                                                    };
                                                }),
                                                {
                                                    headerName: 'Last Appointment Booking On',
                                                    minWidth: 180,
                                                    maxWidth: 180,
                                                    field: 'lastApptDate',
                                                    valueFormatter: params => params.value && moment(params.value).format('DD-MM-YYYY'),
                                                    tooltipValueGetter: (params) => params.valueFormatted,
                                                    comparator: DateUtilities.dateComparator,
                                                    filter: 'agDateColumnFilter',
                                                    filterParams: {
                                                        comparator: DateUtilities.dateFilter,
                                                        browserDatePicker: true
                                                    }
                                                },
                                                {
                                                    headerName: 'Updated On',
                                                    minWidth: 150,
                                                    maxWidth: 150,
                                                    field: 'updateDtm',
                                                    sort: 'desc',
                                                    valueFormatter: params => params.value && moment(params.value).format('DD-MM-YYYY'),
                                                    tooltipValueGetter: (params) => params.valueFormatted,
                                                    comparator: DateUtilities.dateComparator,
                                                    filter: 'agDateColumnFilter',
                                                    filterParams: {
                                                        comparator: DateUtilities.dateFilter,
                                                        browserDatePicker: true
                                                    }
                                                }
                                            ],
                                            onCellFocused: e => {
                                                if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                                }
                                                else {
                                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                                }
                                            },
                                            frameworkComponents: {
                                                // wrappedTextRenderer: WrappedTextRenderer,
                                                // selectCheckboxRenderer: SelectCheckboxRenderer,
                                                weekdayButtonRenderer: WeekdayButtonRenderer
                                            },
                                            rowBuffer: 30,
                                            rowSelection: 'multiple',
                                            rowMultiSelectWithClick: true,
                                            //suppressRowClickSelection: true,
                                            headerHeight: 48,
                                            enableBrowserTooltips: true,
                                            rowData: this.state.rowData,
                                            onRowSelected: event => {
                                                this.setState({
                                                    rowSelected: this.refGrid.current ? this.refGrid.current.grid.api.getSelectedRows() : []
                                                });
                                            },
                                            onRowDoubleClicked: params => {
                                                if (!this.state.readOnly) {
                                                    let selectedRow = params.data;
                                                    let node = params.node;
                                                    node.setSelected(true);
                                                    this.setState({
                                                        rowSelected: [selectedRow]
                                                    }, () => {
                                                        this.handleUpdate();
                                                    });
                                                }
                                            },
                                            getRowHeight: (params) => 40,
                                            getRowNodeId: data => data.groupId,
                                            postSort: rowNodes => {
                                                let rowNode = rowNodes[0];
                                                if (rowNode) {
                                                    setTimeout((rowNode) => {
                                                        rowNode.gridApi.refreshCells();
                                                    }, 100, rowNode);
                                                }
                                            }
                                        }}
                                        disableAutoSize
                                    />
                                </Box>
                            </Box>
                            {
                                this.props.dialogOpen && this.props.dialogAction ?
                                    <TimeslotPlanDialog
                                        id={id + '_timeslotPlanDialog'}
                                        open={this.props.dialogOpen}
                                        isClinicalAdminOnly={this.state.isClinicalAdminOnly}
                                    /> : null
                            }
                            {
                                this.props.dialogWeekdayOpen && this.props.tmsltPlanWeekday ?
                                    <TimeslotPlanWeekdayDialog
                                        id={id + '_timeslotPlanWeekdayDialog'}
                                        open={this.props.dialogWeekdayOpen}
                                        readOnly={this.state.readOnly}
                                    /> : null
                            }
                        </Paper>
                    </Grid>
                </Container>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return {
        encounterTypeCd: state.editTimeSlot.encounterTypeCd,
        subEncounterTypeCd: state.editTimeSlot.subEncounterTypeCd,
        encounterCodeList: state.editTimeSlot.encounterCodeList || [],
        subEncounterCodeList: state.editTimeSlot.subEncounterCodeList || [],
        dateFrom: state.editTimeSlot.dateFrom,
        dateTo: state.editTimeSlot.dateTo,
        page: state.editTimeSlot.page,
        pageSize: state.editTimeSlot.pageSize,
        timeslotList: state.editTimeSlot.timeslotList,
        selectedItems: state.editTimeSlot.selectedItems,
        dialogOpen: state.timeslotPlan.dialogOpen,
        dialogAction: state.timeslotPlan.dialogAction,
        dialogWeekdayOpen: state.timeslotPlan.dialogWeekdayOpen,
        timeslotPlanHdrs: state.timeslotPlan.timeslotPlanHdrs,
        tmsltPlanWeekday: state.timeslotPlan.tmsltPlanWeekday,
        multipleUpdateFinish: state.editTimeSlot.multipleUpdateFinish,
        multipleUpdateData: state.editTimeSlot.multipleUpdateData,
        multipleUpdateForm: state.editTimeSlot.multipleUpdateForm,
        clinicList: state.common.clinicList,
        rooms: state.common.rooms,
        serviceSessionsConfig: state.common.serviceSessionsConfig,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin
    };
}

const mapDispatchToProps = {
    resetAll,
    updateState,
    listTimeslotPlanHdrBySite,
    listTimeslotPlanHdrByService,
    deleteTimeslotPlanHdr,
    openCommonMessage,
    auditAction
};

const TimeslotPlanV1 = connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TimeslotPlan));

class WrappedTextRenderer extends Component {
    constructor(props) {
        super(props);
    }

    getReactContainerStyle() {
        return {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        };
    }

    render() {
        return this.props.value;
    }
}

class SelectCheckboxRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Checkbox
                color="default"
                checkedIcon={<CheckBox />}
                icon={<CheckBoxOutlineBlank />}
            />
        );
    }
}

class WeekdayButtonRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let isChecked = this.props.value == 1;
        let isDisabled = this.props.value == -1;
        return (
            <CIMSCommonButton
                variant="outlined"
                disabled={isDisabled}
                className={null}
                style={{
                    backgroundColor: isDisabled ? colors.grey['300'] : (isChecked ? colors.green['200'] : theme.palette.white),
                    border: 'solid 1px #bbbbbb',
                    // boxShadow: '1px 1px 1px #6e6e6e',
                    maxWidth: '34px',
                    maxHeight: '34px',
                    minWidth: '34px',
                    minHeight: '34px'
                }}
                id={`week_day_button_${this.props.data.groupId}_${this.props.weekdayKey}`}
                onClick={(event) => {
                    // data is cached not refresh after changes, move the logic to callback function
                    // let {groupId, sdate, edate, sessId, resvQt, rmIds} = this.props.data;
                    // let rooms = rmIds.map(rmId => {
                    //     let room = this.props.rooms.find(x => x.rmId == rmId);
                    //     if (room)
                    //         return room.rmDesc;
                    //     return '';
                    // }).join(', ');
                    // let detail = this.props.data.timeslotPlanHdrMap[this.props.weekdayKey];
                    // let header = {groupId, sdate, edate, sessId, resvQt, rooms, ttlApptQt: detail ? detail.ttlApptQt : 0, tmsltPlanHdrId: detail && detail.tmsltPlanHdrId};
                    // console.log('[TSP] WeekdayButtonRenderer onClick', groupId, header, this.props.weekdayKey);
                    if (this.props.handleEditWeekday)
                        this.props.handleEditWeekday(this.props.data.groupId, this.props.weekdayKey);
                }}
            >
                {isChecked ?
                <Check
                    style={{
                        backgroundColor: colors.green['200'],
                        color: colors.green['700']
                    }}
                />
                : (
                    isDisabled ?
                    <div
                        style={{
                            backgroundColor: colors.grey['300']
                        }}
                    />
                    :
                    <Clear
                        style={{
                            color: colors.red['500']
                        }}
                    />
                )}
            </CIMSCommonButton>
        );
    }
}

export default connect((state) => ({svcCd: state.login.service.svcCd}), {})((props) => {
    const { svcCd } = props;

    const v2Svcs = [SERVICE_CODE.EHS];

    return v2Svcs.includes(svcCd) ? <TimeslotManagementV2 {...props} /> : <TimeslotPlanV1 {...props} />;
});
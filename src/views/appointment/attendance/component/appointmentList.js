import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Link,
    Paper,
    Tooltip,
    Typography
} from '@material-ui/core';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import { AppointmentUtil } from '../../../../utilities';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import Print from '@material-ui/icons/Print';
import * as caseNoUtilities from '../../../../utilities/caseNoUtilities';
import {
    updateField
} from '../../../../store/actions/attendance/attendanceAction';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import LabelButton from '../../../compontent/labelButton';

const sysRatio = CommonUtilities.getSystemRatio();
const unit = CommonUtilities.getResizeUnit(sysRatio);

const styles = theme => ({
    paperRoot: {
        backgroundColor: theme.palette.dialogBackground,
        padding: 4,
        overflowX: 'auto',
        overflowY: 'hidden',
        width: '100%'
    },
    tableTitle: {
        fontWeight: 500,
        color: theme.palette.white
    },
    tableGrid: {
        backgroundColor: '#fff'
    },
    customTableHeadRow: {
        fontWeight: 400,
        height: 40 * unit
    },
    backdropRoot: {
        zIndex: 1200,
        position: 'absolute',
        top: 0
    },
    buttonRoot: {
        margin: 2,
        padding: 0,
        height: 35 * unit
    },
    tableContainer: {
        padding: 2
    },
    gridTitle: {
        padding: '4px 0px'
    },
    tooltip: {
        wordWrap: 'break-word'
    }
});

class AppointmentList extends React.Component {
    constructor(props) {
        super(props);
        this.refGrid = React.createRef();
        window.d = { ...window.d, rf: this.refGrid };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentAppointment !== this.props.currentAppointment) {
            let { grid } = this.refGrid.current;
            if (grid) {
                if (this.props.currentAppointment) {
                    let rowNode = grid.api.getRowNode(this.props.currentAppointment.appointmentId);
                    if (rowNode)
                        rowNode.setSelected(true);
                    else
                        grid.api.deselectAll();
                }
                else
                    grid.api.deselectAll();
            }
        }
    }

    handleOnChangePage = (event, newPage, rowPerPage) => {
        let listApptParams = this.props.listApptParams;
        listApptParams.page = newPage + 1;
        this.props.updateListApptParam(listApptParams);
    }

    handleOnChangeRowPerPage = (event, page, rowPerPage) => {
        let listApptParams = this.props.listApptParams;

        listApptParams.page = 1;
        listApptParams.pageSize = rowPerPage;
        this.updateCurrentPage(0);
        this.props.updateListApptParam(listApptParams);
    }

    updateCurrentPage = (newPage) => {
        // this.tableRef.updatePage(newPage);
    }

    setSelectedAppt = (appointment) => {
        //this.tableRef.setSelected(appointment);
    }

    handleEditAppointment = (appointment) => {
        this.props.auditAction(AlsDesc.EDIT + ' in the appointment list', null, null, false, 'ana');
        this.props.handleEditAppointment(appointment);
    }

    handlePrintGumLabel = () => {
        this.props.handlePrintGumLabel();
    }

    handlePrintSPPGumLabel = (selectedCategory) => {
        this.props.handlePrintGumLabel(selectedCategory);
    };

    handlePrintEHSGumLabel = (confirmationForm) => {
        this.props.handlePrintGumLabel(null, confirmationForm);
    };

    nepRenderer = (props) => {
        let { data } = props;
        let isNep = data?.attendanceBaseVo?.isNep ?? false;

        return isNep ? (
            <Tooltip classes={{ tooltip: this.props.classes.tooltip }} title={data.attendanceBaseVo?.nepRemark ?? ''}>
                <Link
                    id={'appointmentList_nep_' + data.appointmentId}
                    underline="always"
                    style={{
                        fontSize: '1rem',
                        display: 'block',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    Yes
                </Link>
            </Tooltip>
        ) : (
            <Typography>No</Typography>
        );
    }

    specReqRenderer = (props) => {
        let { data } = props;
        let specReqType = data.specialRqstDto ? this.props.specReqTypesList.find(item => data.specialRqstDto.specialRqstTypeId === item.specialRqstTypeId) : null;
        return (
            <Tooltip classes={{ tooltip: this.props.classes.tooltip }} title={data.specialRqstDto?.remark ?? ''}>
                <Link
                    id={'appointmentList_specialRequest_' + data.appointmentId}
                    underline="always"
                    style={{
                        fontSize: '1rem',
                        display: 'block',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {specReqType ? specReqType.specialRqstDesc : ''}
                </Link>
            </Tooltip>
        );
    }

    isExternalFilterPresent = () => {

    }

    doesExternalFilterPass = node => {

    }

    getGridColumns = (isAttenConfirmEcsEligibility) => {
        const { quotaConfig, isAttendancePage } = this.props;
        let columns = [
            {
                headerName: 'Appt. Date/Time',
                field: 'apptDateTime',
                minWidth: 180,
                valueFormatter: params => moment(params.value).format(Enum.DATE_FORMAT_24_HOUR),
                tooltip: params => params.valueFormatted
            },
            {
                headerName: 'Clinic',
                field: 'clinicCd',
                tooltipField: 'clinicCd',
                minWidth: 120
            },
            {
                headerName: 'Enc. Type',
                field: 'encntrTypeDesc',
                tooltipField: 'encntrTypeDesc',
                minWidth: 200
            },
            {
                headerName: 'Room',
                field: 'rmDesc',
                tooltipField: 'rmDesc',
                minWidth: 200
            },
            {
                headerName: 'Arr. Time',
                field: 'arrivalTime',
                minWidth: 120,
                valueFormatter: params => params.value ? moment(params.value).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) : '',
                tooltip: params => params.valueFormatted
            },
            {
                headerName: 'Attn.',
                field: 'attnStatusCd',
                tooltipField: 'attnStatusCd',
                minWidth: 100,
                // valueFormatter: (params) => {
                //     if (params.value === Enum.ATTENDANCE_STATUS.ATTENDED) {
                //         return 'Attended';
                //     } else if (params.value === Enum.ATTENDANCE_STATUS.NOT_ATTEND || '') {
                //         if (params.data.arrivalTime) {
                //             return 'Arrived';
                //         } else {
                //             return '';
                //         }
                //     }
                // }
                valueGetter: (params) => {
                    const { data } = params;
                    // if (data.attnStatusCd === Enum.ATTENDANCE_STATUS.ATTENDED) {
                    //     return 'Attended';
                    // } else if (data.attnStatusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND || '') {
                    //     if (data.arrivalTime) {
                    //         return 'Arrived';
                    //     } else {
                    //         return '';
                    //     }
                    // }
                    return AppointmentUtil.getAppointmentRecordStatus(data.attnStatusCd, data.arrivalTime);
                }
            },
            {
                headerName: 'NEP',
                field: 'attendanceBaseVo',
                minWidth: 80,
                cellRenderer: 'nepRenderer'
            },
            {
                headerName: 'Consult.',
                field: 'consult',
                minWidth: 124,
                valueGetter: params => {
                    const isAttendedAppt = AppointmentUtil.isAttendedAppointment(params.data.attnStatusCd);
                    if (isAttendedAppt === true) {
                        if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isEcsElig == true) {
                            return 'ECS';
                        } else if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isFeeSettled == true) {
                            return 'Paid';
                        }
                    } else if (isAttendedAppt === false) {
                        return 'Unpaid';
                    }
                },
                tooltip: params => params.valueFormatted
            },
            {
                headerName: 'Prescription',
                field: 'prescription',
                minWidth: 160,
                valueGetter: (params) => {
                    const isAttendedAppt = AppointmentUtil.isAttendedAppointment(params.data.attnStatusCd);
                    if (isAttendedAppt === true) {
                        if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isEcsElig == true) {
                            return 'Skip';
                        } else if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isFeeSettled == true) {
                            return 'Paid';
                        }
                    } else if (isAttendedAppt === false) {
                        return 'Unpaid';
                    }
                },
                tooltip: params => params.valueFormatted
            },
            {
                headerName: 'Quota Type',
                field: 'qtType',
                minWidth: 130,
                width: 130,
                valueFormatter: params => CommonUtilities.getQuotaTypeDescByQuotaType(quotaConfig, params.value),
                tooltip: params => params.valueFormatted
            },
            {
                headerName: 'Appt. Type',
                field: 'apptTypeCd',
                tooltipField: 'apptTypeCd',
                valueGetter: params => {
                    return AppointmentUtil.getAppointmentTypeDesc(params.data.apptTypeCd, params.data.isSqueeze, params.data.isUrgSqueeze);
                },
                minWidth: 140
            },
            {
                headerName: 'Spec. Req.',
                field: 'specReq',
                align: 'center',
                minWidth: 140,
                cellRenderer: 'specReqRenderer'
            },
            {
                headerName: 'Disc Num.',
                field: 'attendanceBaseVo',
                minWidth: 140,
                valueFormatter: params => params.value?.discNum ?? '',
                tooltip: params => params.valueFormatted
            },
            {
                headerName: 'Case No.',
                field: 'caseNo',
                minWidth: 180,
                valueFormatter: params => {
                    //return caseNoUtilities.getFormatCaseNo(params.value),
                    return caseNoUtilities.getCaseAlias(params.data);
                },
                tooltip: params => params.valueFormatted
            }
        ];
        if (!(isAttenConfirmEcsEligibility === '1' && isAttendancePage)) {
            columns.splice(7, 2);
        }
        let _columns = caseNoUtilities.handleCaseNoSection(columns, 'field', 'caseNo');
        // return columns;
        return _columns;
    }

    render() {
        const { classes, appointmentList, currentAppointment, appointmentDateRangeStr, svcCd } = this.props;

        let selected = null;
        if (this.refGrid && this.refGrid.current && this.refGrid.current.grid) {
            let selecteds = this.refGrid.current.grid.api.getSelectedRows();
            if (selecteds && selecteds.length > 0) {
                selected = { ...selecteds[0] };
            }
        }

        const isAttenConfirmEcsEligibilitySiteParam = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.svcCd, this.props.loginSiteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';

        return (
            <Paper className={classes.paperRoot}>
                <Grid
                    container
                    item
                    alignItems="center"
                    wrap="nowrap"
                    className={classes.gridTitle}
                >
                    <Grid container>
                        {/* <Typography className={classes.tableTitle}>Appointment List - {moment().format(Enum.DATE_FORMAT_EDMY_VALUE)}</Typography> */}
                        <Typography className={classes.tableTitle}>Appointment List - {appointmentDateRangeStr ? appointmentDateRangeStr : moment().format(Enum.DATE_FORMAT_EDMY_VALUE)}</Typography>
                    </Grid>
                    <Grid container justify={'flex-end'}>
                        <CIMSButton
                            id={'attendance_edit_appointment_button'}
                            disabled={currentAppointment?.attnStatusCd !== 'Y' || selected === null || this.props.editMode}
                            classes={{ sizeSmall: classes.buttonRoot }}
                            onClick={() => this.handleEditAppointment(selected)}
                        >
                            Edit
                        </CIMSButton>
                        <LabelButton
                            id={'attendance_print_gum_label_button'}
                            svcCd={svcCd}
                            classes={{ sizeSmall: classes.buttonRoot }}
                            handlePrintGumLabel={this.handlePrintGumLabel}
                            handlePrintSPPGumLabel={this.handlePrintSPPGumLabel}
                            handlePrintEHSGumLabel={this.handlePrintEHSGumLabel}
                            children={<><Print className={classes.rightIcon} />Label</>}
                            auditAction={this.props.auditAction}
                        />
                    </Grid>

                </Grid>
                <Grid container className={classes.tableGrid} >
                    {/* <MarkLayer open={this.props.isAttend} /> */}
                    <Grid item container className={classes.tableContainer}>
                        <CIMSDataGrid
                            ref={this.refGrid}
                            gridTheme="ag-theme-balham"
                            divStyle={{
                                width: '100%',
                                height: '660px',
                                display: 'block'
                            }}
                            gridOptions={{
                                columnDefs: this.getGridColumns(isAttenConfirmEcsEligibility),
                                rowSelection: 'single',
                                rowDeselection: true,
                                suppressRowClickSelection: false,
                                headerHeight: 48,
                                enableBrowserTooltips: true,
                                rowData: appointmentList,
                                frameworkComponents: {
                                    nepRenderer: this.nepRenderer,
                                    specReqRenderer: this.specReqRenderer
                                },
                                onCellFocused: e => {
                                    if (e.column && this.props.editMode) {
                                        e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                    }
                                    else {
                                        e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                    }

                                },
                                onRowClicked: e => {
                                    if (!this.props.editMode) {
                                        let selectedRow = e.api.getSelectedRows()[0];
                                        this.props.rowSelect(selectedRow);
                                    }
                                },
                                onRowDoubleClicked: params => {
                                    let selectedRow = params.data;
                                    let node = params.node;
                                    if (!this.props.editMode) {
                                        node.setSelected(true);
                                        this.props.rowSelect(selectedRow);
                                    }

                                    if (selectedRow && selectedRow.attnStatusCd === 'Y') {
                                        this.handleEditAppointment(selectedRow);
                                    }
                                },
                                isExternalFilterPresent: this.isExternalFilterPresent,
                                doesExternalFilterPass: this.doesExternalFilterPass,
                                getRowStyle: params => {
                                    let rowStyle = null;
                                    // if (params.data.deadInd === '1') {
                                    //     rowStyle = {
                                    //         color: this.props.theme.palette.common.white,
                                    //         backgroundColor: this.props.theme.palette.deadPersonColor.color
                                    //     };
                                    // }
                                    return rowStyle;
                                },
                                getRowHeight: () => 46,
                                getRowNodeId: data => data.appointmentId,
                                localeText: {
                                    noRowsToShow: this.props.nodataMessage
                                }
                                // postSort: rowNodes => {
                                //     let rowNode = rowNodes[0];
                                //     if (rowNode) {
                                //         setTimeout((rowNode) => {
                                //             rowNode.gridApi.refreshCells({
                                //                 columns: ['index'],
                                //                 force: true
                                //             });
                                //         }, 100, rowNode);
                                //     }
                                // }
                            }}
                        // suppressGoToRow
                        // suppressDisplayTotal
                        // disableAutoSize
                        />
                    </Grid>
                </Grid>
            </Paper>
        );
    }
}
const mapStateToProps = (state) => ({
    quotaConfig: state.common.quotaConfig,
    specReqTypesList: state.common.specReqTypesList,
    svcCd: state.login.service.svcCd,
    clinicConfig: state.common.clinicConfig,
    loginSiteId: state.login.clinic.siteId
});
const mapDispatchToProps = {
    updateField, auditAction
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AppointmentList));
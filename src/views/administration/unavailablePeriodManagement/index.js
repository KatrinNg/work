import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import {
    Grid
} from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import DatePicker from '../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import moment from 'moment';
import {
    resetAll,
    updateState,
    listUpmList,
    resetDialogInfo,
    deleteUpm,
    getUnavailableReasons
} from '../../../store/actions/administration/unavailablePeriodManagement/index';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CIMSDataGrid from 'components/Grid/CIMSDataGrid';
import Enum from '../../../enums/enum';
import ValidatorEnum from '../../../enums/validatorEnum';
import AccessRightEnum from '../../../enums/accessRightEnum';
import CommonMessage from '../../../constants/commonMessage';
import { CommonUtil, SiteParamsUtil, DateUtil } from '../../../utilities';
import wholeServiceRender from './wholeServiceRender';
import wholeClinicRender from './wholeClinicRender';
import wholeDayRender from './wholeDayRender';
import UpmDialog from './upmDialog';
import PublicHolidayDialog from './publicHolidayDialog';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import { isClinicalAdminSetting, isServiceAdminSetting } from '../../../utilities/userUtilities';
import MultipleUpdateDialog from '../../compontent/multipleUpdateDialog';
import { ACTION_ENUM, RECURRENCE_TABS, WEEK_DAY_VALUES, ORDINAL_VALUES, MULTIPLE_UPDATE_TYPE } from '../../../constants/appointment/editTimeSlot';
import { multiUpdateSave } from '../../../store/actions/appointment/editTimeSlot';

const styles = () => ({
    root: {
        width: '100%'
    },
    mainButton: {
        width: '100%'
    },
    container: {
        padding: '20px 0px'
    }
});

class UnavailablePeriodManagement extends Component {
    constructor(props) {
        super(props);

        let columnDefs = [
            {
                // headerName: '',
                // valueGetter: params => params.node.rowIndex + 1,
                // minWidth: 60,
                // maxWidth: 60,
                // pinned: 'left',
                // filter: false
                headerName: '', colId: 'index', minWidth: 60, width: 60, lockPinned: true, sortable: false, filter: false,
                valueGetter: (params) => {
                    return params.node.rowIndex + 1;
                }
            },
            {
                headerName: 'Service Code',
                field: 'svcCd',
                colId: 'svcCd',
                minWidth: 145,
                maxWidth: 145,
                valueGetter: (params) => {
                    return params.data.svcCd ? params.data.svcCd : 'For All Service';
                }
            },
            {
                headerName: 'Site English Name',
                field: 'siteName',
                colId: 'siteName',
                width: 220,
                valueGetter: (params) => {
                    return params.data.siteName || 'For All Clinic';
                }
            },
            {
                headerName: 'Whole Service',
                field: 'isWholeSvc',
                colId: 'isWholeSvc',
                minWidth: 190,
                maxWidth: 190,
                cellRenderer: 'wholeServiceRender'
            },
            {
                headerName: 'Whole Clinic',
                field: 'isWhl',
                colId: 'isWhl',
                minWidth: 175,
                maxWidth: 175,
                cellRenderer: 'wholeClinicRender'
            },
            {
                headerName: 'Whole Day',
                field: 'isWhlDay',
                colId: 'isWhlDay',
                minWidth: 165,
                maxWidth: 165,
                cellRenderer: 'wholeDayRender'
            },
            {
                headerName: 'Start Date',
                field: 'startDate',
                colId: 'startDate',
                width: 130,
                valueGetter: (params) => {
                    return moment(params.data.sdt).format(Enum.DATE_FORMAT_EDMY_VALUE);
                }
            },
            {
                headerName: 'Start Time',
                field: 'stime',
                colId: 'stime',
                width: 130,
                valueGetter: (params) => {
                    return params.data.isWhlDay ? '' : moment(params.data.sdt).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
                }
            },
            {
                headerName: 'End Date',
                field: 'endDate',
                colId: 'endDate',
                width: 130,
                valueGetter: (params) => {
                    return moment(params.data.edt).format(Enum.DATE_FORMAT_EDMY_VALUE);
                }
            },
            {
                headerName: 'End Time',
                field: 'etime',
                colId: 'etime',
                width: 130,
                valueGetter: (params) => {
                    return params.data.isWhlDay ? '' : moment(params.data.edt).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
                }
            },
            {
                headerName: 'Reason',
                field: 'unavailPerdRsnDesc',
                colId: 'unavailPerdRsnDesc',
                width: 220
            },
            {
                headerName: 'Assigned Room',
                field: 'rmId',
                colId: 'rmId',
                width: 230,
                valueGetter: (params) => {
                    let assignedRoomList = (params.data.assignedRoomIds || []).filter((item) => {
                        let roomsObj = this.props.rooms.find(element => element.rmId === item);
                        return roomsObj ? true : false;
                    });
                    let assignedRoomCdList = assignedRoomList.map((item) => {
                        let roomsObj = this.props.rooms.find(element => element.rmId === item);
                        // return roomsObj && roomsObj.rmCd;
                        return roomsObj && roomsObj.rmDesc;
                    });
                    return assignedRoomCdList.join(', ');
                }
            },
            {
                headerName: 'Remark',
                field: 'remark',
                colId: 'remark',
                width: 150
            },
            {
                headerName: 'Updated On',
                field: 'updateDtm',
                colId: 'updateDtm',
                width: 175,
                valueGetter: (params) => {
                    return moment(params.data.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
                }
            }
        ];

        this.state = {
            columnDefs: columnDefs,
            lastRightDate: null,
            isOpenMultiUpdatePopup: false
        };

        this.props.resetAll();
    }

    componentDidMount() {
        let searchCert = { upmSiteId: this.props.siteId, upmFromDate: moment(), upmToDate: moment().add(1, 'year') };
        let dateRangeLimit = CommonUtil.initDateRnage(
            this.props.clinicConfig,
            this.props.serviceCd,
            this.props.siteId,
            Enum.CLINIC_CONFIGNAME.UNAVAIL_PERIOD_MGMT_DATE_RANGE_LIMIT);
        this.props.updateState({ ...searchCert, dateRangeLimit: dateRangeLimit }).then(() => {
            let params = this.getListParams();
            this.props.listUpmList(params);
            this.props.getUnavailableReasons();
        });
    }

    componentDidUpdate() {
        if (this.props.isFinishLoadUpmList) {
            if (this.gridColumnApi && this.gridApi) {
                const colIds = this.gridColumnApi.getAllDisplayedColumns().map(col => col.getColId());
                this.gridApi.refreshCells({ columns: colIds, force: true });
                this.props.updateState({ isFinishLoadUpmList: false });
            }
        }
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    getListParams = (newObj) => {
        let params = {
            siteId: this.props.upmSiteId,
            svcCd: this.props.serviceCd,
            fromDate: this.props.upmFromDate,
            toDate: this.props.upmToDate,
            ...newObj
        };
        params.siteId = params.siteId === '*All' ? null : params.siteId;
        params.fromDate = moment(params.fromDate).isValid() ? moment(params.fromDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
        params.toDate = moment(params.toDate).isValid() ? moment(params.toDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
        return params;
    }

    listUpmList = (params) => {
        const formValid = this.upmListFormRef && this.upmListFormRef.isFormValid(false);
        formValid.then(result => {
            if (result) {
                if (!params) {
                    params = this.getListParams();
                }
                this.props.listUpmList(params);
            }
        });
    }

    deselectAllFnc = () => {
        this.gridApi.deselectAll();
        this.props.updateState({
            currentSelectedId: '',
            currentSelectedIsWholeClinic: null,
            currentSelectedSvcCd: null,
            currentSelectedSiteId: null
        });
    }

    setDialogInfo = (currentSelectedId) => {
        const params = this.gridApi.getRowNode(currentSelectedId);
        if (params.data.svcCd === null) {
            // public holiday
            this.props.updateState({
                publicDialogInfo: {
                    publicDialogDate: moment(params.data.sdt),
                    publicDialogRemark: params.data.remark,
                    publicDialogRemarkCN: params.data.remarkChi,
                    status: params.data.status,
                    version: params.data.version
                }
            });
        } else {
            // unavailable period
            let assignedRoomList = (params.data.assignedRoomIds || []).filter((item) => {
                let roomsObj = this.props.rooms.find(element => element.rmId === item);
                return roomsObj && (roomsObj.siteId === params.data.siteId) && (roomsObj.status === 'A') ? true : false;
            });
            this.props.updateState({
                dialogInfo: {
                    dialogSiteId: params.data.siteId === null ? '*All' : params.data.siteId,
                    dialogIsWholeService: params.data.siteId === null ? 1 : 0,
                    dialogIsWholeClinic: params.data.isWhl,
                    dialogIsWholeDay: params.data.isWhlDay,
                    dialogAssginedRoomList: params.data.isWhl === 1 ? [] : (assignedRoomList || []),
                    dialogStartDate: moment(params.data.sdt),
                    dialogEndDate: moment(params.data.edt),
                    dialogStartTime: params.data.isWhlDay === 1 ? null : moment(params.data.sdt),
                    dialogEndTime: params.data.isWhlDay === 1 ? null : moment(params.data.edt),
                    dialogReason: params.data.unavailPerdRsnId,
                    dialogRemark: params.data.remark,
                    status: params.data.status,
                    version: params.data.version
                }
            });
        }
    }

    handleUpdate = () => {
        let desc = '';
        this.setDialogInfo(this.props.currentSelectedId);
        if ((this.props.currentSelectedSvcCd === null) && (this.props.currentSelectedSiteId === null)) {
            this.props.updateState({ publicDialogOpen: true, publicDialogName: 'Update Public Holiday' });
            desc = 'Update Public Holiday';
        } else {
            this.props.updateState({ dialogOpen: true, dialogName: 'Update Unavailable Period' });
            desc = 'Update Unavailable Period';
        }
        this.props.auditAction(desc, null, null, false, 'ana');
    }

    handleCreate = () => {
        this.props.auditAction(AlsDesc.CREATE, null, null, false, 'ana');
        this.deselectAllFnc();
        this.props.updateState({ dialogOpen: true, dialogName: 'Create Unavailable Period' });
        let dialogInfo = _.cloneDeep(this.props.dialogInfo);
        dialogInfo.dialogSiteId = this.props.siteId;
        this.props.updateState({ dialogInfo: dialogInfo });
    }

    handleAssignRoom = () => {
        this.props.auditAction('Click Assign Room Button', null, null, false, 'ana');
        this.setDialogInfo(this.props.currentSelectedId);
        this.props.updateState({ dialogOpen: true, dialogName: 'Update Unavailable Period', isAssignRoom: true });
    }

    handleCreatePublicHoliday = () => {
        this.props.auditAction('Click Create Public Holiday Button', null, null, false, 'ana');
        this.deselectAllFnc();
        this.props.updateState({ publicDialogOpen: true, publicDialogName: 'Create Public Holiday' });
    }

    handleDelete = () => {
        this.props.auditAction(AlsDesc.DELETE, null, null, false, 'ana');
        this.props.openCommonMessage({
            msgCode: '110504',
            btnActions: {
                btn1Click: () => {
                    this.props.auditAction('Confirm Delete Unavailable Period');
                    this.props.deleteUpm(this.props.currentSelectedId, () => {
                        this.deselectAllFnc();
                        this.listUpmList();
                    });
                },
                btn2Click: () => {
                    this.props.auditAction('Cancel Delete Unavailable Period', null, null, false, 'ana');
                }
            }
        });
    }

    handleSelectChange = (e, name) => {
        if (e && name) {
            this.props.updateState({ [name]: e.value }).then(() => {
                this.listUpmList();
            });
            this.deselectAllFnc();
        }
    }

    handleDateChange = (value, name) => {
        let dateDto = {
            upmFromDate: this.props.upmFromDate,
            upmToDate: this.props.upmToDate,
            [name]: value
        };
        // if(CommonUtil.isFromDateAfter(dateDto.upmFromDate, dateDto.upmToDate)) {
        //     if(name === 'upmFromDate') {
        //         dateDto.upmToDate = null;
        //         this.toDateRef && this.toDateRef.focus();
        //     } else {
        //         dateDto.upmFromDate = null;
        //         this.fromDateRef && this.fromDateRef.focus();
        //     }
        // }
        this.props.updateState({ ...dateDto });
    }

    handleDateAccept = (value, name) => {
        let dateDto = {
            upmFromDate: this.props.upmFromDate,
            upmToDate: this.props.upmToDate,
            [name]: value
        };
        this.props.updateState({ ...dateDto }).then(() => {
            const { upmFromDate, upmToDate, dateRangeLimit } = this.props;
            if (moment(upmFromDate).isValid() && moment(upmToDate).isValid()) {
                if (moment(upmFromDate).isSameOrAfter(moment('1900-01-01'))) {
                    if (Math.ceil(moment(upmToDate).diff(moment(upmFromDate), 'day', true)) <= dateRangeLimit) {
                        this.listUpmList();
                    } else {
                        this.props.updateState({
                            [name]: moment(this.state.lastRightDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
                        });
                        this.setState({ lastRightDate: null });
                        this.props.openCommonMessage({
                            msgCode: '111303',
                            params: [
                                { name: 'HEADER', value: CommonUtil.getMenuNameByCd(AccessRightEnum.unavailablePeriodManagement) },
                                { name: 'DATERANGE', value: dateRangeLimit }
                            ]
                        });
                    }
                }
            }

            // this.listUpmList();
        });
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

    handleRowClick = (params, isDoubleClicked = false) => {

        if ((params.data.unavailPerdId && (this.props.currentSelectedId !== params.data.unavailPerdId)) || isDoubleClicked) {
            this.props.updateState({
                currentSelectedId: params.data.unavailPerdId,
                currentSelectedIsWholeClinic: params.data.isWhl,
                currentSelectedSvcCd: params.data.svcCd,
                currentSelectedSiteId: params.data.siteId
            });
            if (isDoubleClicked) {
                const selectedRow = this.gridApi.getRowNode(params.data.unavailPerdId);
                if (selectedRow) {
                    selectedRow.setSelected(true);
                }
                this.handleUpdate();
            }
        } else {
            this.props.updateState({ currentSelectedId: '', currentSelectedIsWholeClinic: null, currentSelectedSvcCd: null, currentSelectedSiteId: null });
        }
    }

    isViewOnly = () => {
        const { upmList, isSystemAdmin, isServiceAdmin, isClinicalAdmin, dialogName, publicDialogName } = this.props;
        const curSelUpm = upmList.find(item => item.unavailPerdId === this.props.currentSelectedId);
        let viewOnly = false;
        if (dialogName === 'Create Unavailable Period' || publicDialogName === 'Create Public Holiday') {
            viewOnly = false;
        } else {
            viewOnly = curSelUpm ?
                (!curSelUpm.siteName && isClinicalAdminSetting()) || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)
                : true;
        }
        return viewOnly;
    }

    handleMultiUpdate = () => {
        this.props.auditAction('Open Multiple Update Dialog', null, null, false, 'ana');
        this.setState({ isOpenMultiUpdatePopup: true });
    }

    handleMultiOnClose = () => {
        this.props.auditAction('Close Multiple Update Dialog', null, null, false, 'ana');
        this.setState({ isOpenMultiUpdatePopup: false });
        this.deselectAllFnc();
    }

    handleMultiOnSave = (data) => {
        this.props.auditAction('Save Multiple Update Dialog', null, null, false, 'ana');
        let actionOptType = '';
        switch (data.action) {
            case ACTION_ENUM.UPDATE: actionOptType = 'U'; break;
            case ACTION_ENUM.DELETE: actionOptType = 'D'; break;
        }
        let params = {
            actionOptType,
            actionType: 'unavailablePeriod',
            duration: _.toString(data.duration) ? parseInt(data.duration) : undefined,
            startDate: DateUtil.getParamsDate(data.startDate),
            endDate: DateUtil.getParamsDate(data.endDate),
            startTime: DateUtil.getFormatTime(data.startTime),
            endTime: DateUtil.getFormatTime(data.endTime),
            isWholeDay: data.wholeDay ? 1 : 0,
            roomIds: data.roomList || undefined,
            siteId: data.clinic === '*All' ? undefined : data.clinic,
            svcCd: this.props.serviceCd,
            perdUnavailRsnId: data.unavailableReasonForFilter,
            actionPerdUnavailRsnId: data.unavailableReasonForAction,
            actionRemark: data.unavailableRemark
        };
        this.props.multiUpdateSave('Unavailable Period', params, () => {
            this.setState({ isOpenMultiUpdatePopup: false });
            // let updateParams = { upmSiteId: data.clinic, upmFromDate: data.startDate, upmToDate: data.endDate };
            let updateParams = { upmSiteId: data.clinic };
            this.props.updateState(updateParams);
            this.listUpmList();
            this.deselectAllFnc();
        });
    }

    render() {
        const { classes, upmList, clinicList, serviceCd, isSystemAdmin, isServiceAdmin, isClinicalAdmin, siteParams, siteId, dateRangeLimit } = this.props;
        const { columnDefs, isOpenMultiUpdatePopup } = this.state;
        const _clinicList = CommonUtil.getClinicListByServiceCode(clinicList, serviceCd);
        _clinicList.sort((a, b) => {
            return a.clinicName.localeCompare(b.clinicName);
        });
        // const rowData = upmList.map((item, index) => { return { rowId: index, ...item }; });
        const viewOnly = this.isViewOnly();
        const isEnableUnavailPerdMultipleUpdate = SiteParamsUtil.getIsEnableUnavailPerdMultipleUpdate(siteParams, serviceCd, siteId);

        const IS_ENABLE_PUBLIC_HOLIDAY_BTN =
            siteParams.IS_ENABLE_PUBLIC_HOLIDAY_BTN
            && siteParams.IS_ENABLE_PUBLIC_HOLIDAY_BTN[0]
            && siteParams.IS_ENABLE_PUBLIC_HOLIDAY_BTN[0].paramValue === '1';

        return (
            <Grid className={classes.root}>
                <ValidatorForm ref={r => this.upmListFormRef = r} >
                    <Grid container className={classes.container}>
                        <Grid item container xs={6} style={{ justifyContent: 'center', alignItems: 'center' }} spacing={2}>
                            <Grid item xs={6}>
                                <SelectFieldValidator
                                    options={_clinicList && _clinicList.map(item => (
                                        { value: item.siteId, label: item.clinicName }
                                    ))}
                                    id={'upm_site'}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Site English Name</>
                                    }}
                                    value={this.props.upmSiteId}
                                    onChange={e => this.handleSelectChange(e, 'upmSiteId')}
                                    addAllOption
                                    // isDisabled={isClinicalAdmin || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                                    isDisabled={!isSystemAdmin && !isServiceAdminSetting()}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <DatePicker
                                    id="upm_fromDate"
                                    ref={r => this.fromDateRef = r}
                                    inputVariant="outlined"
                                    label={<>From Date<RequiredIcon /></>}
                                    value={this.props.upmFromDate}
                                    isRequired
                                    maxDate={
                                        moment(this.props.upmToDate).isValid() ?
                                            moment(this.props.upmToDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : '2100-01-01'
                                    }
                                    onChange={e => this.handleDateChange(e, 'upmFromDate')}
                                    onBlur={e => this.handleDateAccept(e, 'upmFromDate')}
                                    onAccept={e => this.handleDateAccept(e, 'upmFromDate')}
                                    onFocus={this.handleFocus}
                                    onOpen={() => this.handleDateOpen(this.props.upmFromDate)}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <DatePicker
                                    id="upm_toDate"
                                    ref={r => this.toDateRef = r}
                                    inputVariant="outlined"
                                    label={<>To Date</>}
                                    value={this.props.upmToDate}
                                    minDate={
                                        moment(this.props.upmFromDate).isValid() ?
                                            moment(this.props.upmFromDate).format(Enum.DATE_FORMAT_EYMD_VALUE) :
                                            moment().format(Enum.DATE_FORMAT_EYMD_VALUE)
                                    }
                                    onChange={e => this.handleDateChange(e, 'upmToDate')}
                                    onBlur={e => this.handleDateAccept(e, 'upmToDate')}
                                    onAccept={e => this.handleDateAccept(e, 'upmToDate')}
                                    onFocus={this.handleFocus}
                                    onOpen={() => this.handleDateOpen(this.props.upmToDate)}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        <Grid item container xs={6} alignItems="center" justify="flex-end" spacing={2}>
                            <Grid item xs={2}>
                                <CIMSButton
                                    id={'upm_create'}
                                    className={classes.mainButton}
                                    onClick={this.handleCreate}
                                    disabled={(!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                                >Create</CIMSButton>
                            </Grid>
                            <Grid item xs={2}>
                                <CIMSButton
                                    id={'upm_update'}
                                    className={classes.mainButton}
                                    disabled={!this.props.currentSelectedId}
                                    onClick={this.handleUpdate}
                                >Update</CIMSButton>
                            </Grid>
                            {
                                isEnableUnavailPerdMultipleUpdate ?
                                    <Grid item xs={2}>
                                        <CIMSButton
                                            id={'upm_multipleUpdate'}
                                            className={classes.mainButton}
                                            onClick={this.handleMultiUpdate}
                                            disabled={!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin}
                                        >Multiple Update</CIMSButton>
                                    </Grid>
                                    : null
                            }
                            <Grid item xs={2}>
                                <CIMSButton
                                    id={'upm_assignRoom'}
                                    disabled={!this.props.currentSelectedId || (this.props.currentSelectedIsWholeClinic === 1) || (!this.props.currentSelectedSiteId) || viewOnly}
                                    className={classes.mainButton}
                                    onClick={this.handleAssignRoom}
                                >Assign Room</CIMSButton>
                            </Grid>
                            <Grid item xs={2}>
                                <CIMSButton
                                    id={'upm_delete'}
                                    className={classes.mainButton}
                                    disabled={!this.props.currentSelectedId || viewOnly}
                                    onClick={this.handleDelete}
                                >Delete</CIMSButton>
                            </Grid>

                            {IS_ENABLE_PUBLIC_HOLIDAY_BTN &&
                            <Grid item xs={2}>
                                <CIMSButton
                                    id={'upm_createPublicHoliday'}
                                    className={classes.mainButton}
                                    onClick={this.handleCreatePublicHoliday}
                                    // disabled={isClinicalAdminSetting() || ((!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin))}
                                    disabled={!isSystemAdmin && !isServiceAdminSetting()}
                                >Create Public Holiday</CIMSButton>
                            </Grid>
                            }
                        </Grid>

                    </Grid>
                </ValidatorForm>
                <Grid item container>
                    <CIMSDataGrid
                        disableAutoSize
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '73vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: upmList,
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.unavailPerdId,
                            frameworkComponents: {
                                wholeServiceRender: wholeServiceRender,
                                wholeClinicRender: wholeClinicRender,
                                wholeDayRender: wholeDayRender
                            },
                            onRowClicked: params => {
                                this.handleRowClick(params);
                            },
                            onRowDoubleClicked: params => {
                                this.handleRowClick(params, true);
                            },
                            suppressColumnVirtualisation: true,
                            ensureDomOrder: true,
                            postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                            // postSort:(rowNodes)=>{

                            //     // this.gridApi&&this.gridApi.redrawRows();
                            //     // this.gridApi.refreshCells({})
                            //     this.gridApi&&this.gridApi.refreshClientSideRowModel();
                            // }
                        }}
                    />
                </Grid>
                {this.props.dialogOpen ?
                    <UpmDialog
                        id={'unavailablePeriodManagementDialog'}
                        open={this.props.dialogOpen}
                        action={this.props.dialogName}
                        deselectAllFnc={this.deselectAllFnc}
                        isAssignRoom={this.state.isAssignRoom}
                        isClinicalAdmin={isClinicalAdminSetting()}
                        listUpmList={this.listUpmList}
                        viewOnly={viewOnly}
                    ></UpmDialog> : null
                }
                {this.props.publicDialogOpen ?
                    <PublicHolidayDialog
                        id={'publicHolidayDialog'}
                        open={this.props.publicDialogOpen}
                        action={this.props.publicDialogName}
                        deselectAllFnc={this.deselectAllFnc}
                        listUpmList={this.listUpmList}
                        viewOnly={viewOnly}
                    ></PublicHolidayDialog> : null
                }
                {
                    isOpenMultiUpdatePopup ?
                        <MultipleUpdateDialog
                            type={MULTIPLE_UPDATE_TYPE.UnavailablePeriod}
                            siteId={this.props.upmSiteId}
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
        currentSelectedId: state.unavailablePeriodManagement.currentSelectedId,
        upmList: state.unavailablePeriodManagement.upmList,
        upmSiteId: state.unavailablePeriodManagement.upmSiteId,
        rooms: state.common.rooms,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        clinicList: state.common.clinicList || null,
        dialogInfo: state.unavailablePeriodManagement.dialogInfo,
        publicDialogInfo: state.unavailablePeriodManagement.publicDialogInfo,
        dialogOpen: state.unavailablePeriodManagement.dialogOpen,
        publicDialogOpen: state.unavailablePeriodManagement.publicDialogOpen,
        dialogName: state.unavailablePeriodManagement.dialogName,
        publicDialogName: state.unavailablePeriodManagement.publicDialogName,
        currentSelectedSvcCd: state.unavailablePeriodManagement.currentSelectedSvcCd,
        currentSelectedIsWholeClinic: state.unavailablePeriodManagement.currentSelectedIsWholeClinic,
        currentSelectedSiteId: state.unavailablePeriodManagement.currentSelectedSiteId,
        unavailableReasons: state.unavailablePeriodManagement.unavailableReasons,
        isFinishLoadUpmList: state.unavailablePeriodManagement.isFinishLoadUpmList,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        clinic: state.login.clinic,
        upmFromDate: state.unavailablePeriodManagement.upmFromDate,
        upmToDate: state.unavailablePeriodManagement.upmToDate,
        clinicConfig: state.common.clinicConfig,
        dateRangeLimit: state.unavailablePeriodManagement.dateRangeLimit || 365,
        siteParams: state.common.siteParams
    };
}

const mapDispatchToProps = {
    resetAll,
    updateState,
    openCommonMessage,
    listUpmList,
    resetDialogInfo,
    deleteUpm,
    getUnavailableReasons,
    auditAction,
    multiUpdateSave
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UnavailablePeriodManagement));

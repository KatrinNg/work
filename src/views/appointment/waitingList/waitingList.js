import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import {
    Grid
} from '@material-ui/core';
import SearchPanel from './compontent/searchPanel';
import Enum from '../../../enums/enum';
import FieldConstant from '../../../constants/fieldConstant';
import EditWaitingDialog from './compontent/editWaitingDialog';
import moment from 'moment';
import {
    updateField,
    searchWaitingList,
    initiPage,
    cancelSearch,
    addWaiting,
    getWaiting,
    deleteWaiting,
    resetAll,
    resetWaitDetail,
    getWaitingListAllRoleListConfig,
    searchPatientList
} from '../../../store/actions/appointment/waitingList/waitingListAction';
import AccessRightEnum from '../../../enums/accessRightEnum';
import {
    resetAll as resetPatient,
    getPatientById
} from '../../../store/actions/patient/patientAction';
import {
    skipTab,
    cleanSubTabs
} from '../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import * as commonUtilities from '../../../utilities/commonUtilities';
import { SiteParamsUtil, PatientUtil } from '../../../utilities';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import PatientSearchDialog from '../../compontent/patientSearchResultDialog';
import NewPMISearchResultDialog from '../../compontent/newPMISearchResultDialog';
import {
    patientPhonesBasic
} from '../../../constants/registration/registrationConstants';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import SupervisorsApprovalDialog from '../../../views/compontent/supervisorsApprovalDialog';
// import { getFromatColumnValue } from '../../../utilities/waitingListUtilities';
import { updateState as updateAnonBookingState } from '../../../store/actions/appointment/booking/bookingAnonymousAction';

class WaitingList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItems: null
        };
        this.props.initiPage();
    }

    componentDidMount() {
        this.searchWaitingList(true);
        const { clinicConfig, clinic } = this.props;
        let where = { serviceCd: clinic.svcCd, clinicCd: clinic.clinicCd };
        const crossBookConfig = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.ENABLE_CROSS_BOOK_CLINIC, clinicConfig, where);

        this.props.getWaitingListAllRoleListConfig({
            userGroupCd: '',
            configName: 'WAITING_LIST'
        });
        if (this.props.clinic.svcCd === 'THS') {
            this.props.updateField({ dateType: 'D', waitingListSiteId: this.props.clinic.siteId, dateFrom: moment(), dateTo: moment().add(1, 'months'), isEnableCrossBookClinic: crossBookConfig.configValue === 'Y' });
        } else {
            this.props.updateField({ dateType: 'R', waitingListSiteId: this.props.clinic.siteId, isEnableCrossBookClinic: crossBookConfig.configValue === 'Y' });
        }
    }

    shouldComponentUpdate(nextP) {
        if (nextP.tabsActiveKey !== this.props.tabsActiveKey && nextP.tabsActiveKey === AccessRightEnum.waitingList) {
            this.gridApi.deselectAll();
            this.searchWaitingList();
            return false;
        }
        return true;
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    getFromToDate = () => {
        let { dateFrom, dateTo } = this.props;
        return { dateFrom, dateTo };
    }

    searchWaitingList = (isInitPage = false) => {
        this.setState({ selectedItems: null });
        const { svcCd } = this.props.clinic;

        if (this.gridApi) {
            this.gridApi.deselectAll();
        }

        if (isInitPage) {
            let dateFromTo = { dateFrom: moment().subtract(1, 'months'), dateTo: moment() };
            let params = {
                svcCd: svcCd,
                siteId: this.props.clinic.siteId,
                requestFromDtm: dateFromTo.dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                requestToDtm: dateFromTo.dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                status: 'W'
            };

            if (this.props.clinic.svcCd === 'THS') {
                dateFromTo = { dateFrom: moment(), dateTo: moment().add(1, 'months') };
                params = {
                    svcCd: svcCd,
                    siteId: this.props.clinic.siteId,
                    departureFromDtm: dateFromTo.dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    departureToDtm: dateFromTo.dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    status: 'W'
                };
            }
            this.props.searchWaitingList(params);
        } else {

            let dateFromTo = this.getFromToDate();

            let params = {};
            let isDateFieldValid = moment(dateFromTo.dateFrom).isValid() && moment(dateFromTo.dateTo).isValid();
            if (this.props.clinic.svcCd === 'THS') {
                if (this.props.dateType === 'D') {
                    if (!isDateFieldValid) {
                        dateFromTo = { dateFrom: moment(), dateTo: moment().add(1, 'months') };
                        this.props.updateField({ dateFrom: moment(), dateTo: moment().add(1, 'months') });
                    }
                    params = {
                        svcCd: svcCd,
                        siteId: (this.props.waitingListSiteId === '*All' ? '' : this.props.waitingListSiteId),
                        departureFromDtm: dateFromTo.dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                        departureToDtm: dateFromTo.dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                        status: (this.props.status === '*All' ? '' : this.props.status)
                    };
                } else {
                    if (!isDateFieldValid) {
                        dateFromTo = { dateFrom: moment().subtract(1, 'months'), dateTo: moment() };
                        this.props.updateField({ dateFrom: moment().subtract(1, 'months'), dateTo: moment() });
                    }
                    params = {
                        svcCd: svcCd,
                        siteId: (this.props.waitingListSiteId === '*All' ? '' : this.props.waitingListSiteId),
                        requestFromDtm: dateFromTo.dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                        requestToDtm: dateFromTo.dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                        status: (this.props.status === '*All' ? '' : this.props.status)
                    };
                }
            } else {
                if (!isDateFieldValid) {
                    dateFromTo = { dateFrom: moment().subtract(1, 'months'), dateTo: moment() };
                    this.props.updateField({ dateFrom: moment().subtract(1, 'months'), dateTo: moment() });
                }
                params = {
                    svcCd: svcCd,
                    siteId: isInitPage ? this.props.clinic.siteId : (this.props.waitingListSiteId === '*All' ? '' : this.props.waitingListSiteId),
                    requestFromDtm: dateFromTo.dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    requestToDtm: dateFromTo.dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE),
                    status: isInitPage ? 'W' : (this.props.status === '*All' ? '' : this.props.status)
                };
            }
            this.props.searchWaitingList(params);
        }
    }

    searchPanelOnChange = (name, value) => {
        this.setState({ selectedItems: null });
        this.props.updateField({ [name]: value });
        if (this.gridApi) {
            this.gridApi.deselectAll();
        }
        const { svcCd } = this.props.clinic;
        let dateFromTo = this.getFromToDate();
        let params = {};

        if (this.props.clinic.svcCd === 'THS' && this.props.dateType === 'D') {
            params = {
                svcCd: svcCd,
                siteId: this.props.waitingListSiteId === '*All' ? '' : this.props.waitingListSiteId,
                departureFromDtm: moment(dateFromTo.dateFrom).isValid() ? dateFromTo.dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE) : '',
                departureToDtm: moment(dateFromTo.dateTo).isValid() ? dateFromTo.dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE) : '',
                status: this.props.status === '*All' ? '' : this.props.status
            };
        } else {
            params = {
                svcCd: svcCd,
                siteId: this.props.waitingListSiteId === '*All' ? '' : this.props.waitingListSiteId,
                requestFromDtm: moment(dateFromTo.dateFrom).isValid() ? dateFromTo.dateFrom.format(Enum.DATE_FORMAT_EYMD_VALUE) : '',
                requestToDtm: moment(dateFromTo.dateTo).isValid() ? dateFromTo.dateTo.format(Enum.DATE_FORMAT_EYMD_VALUE) : '',
                status: this.props.status === '*All' ? '' : this.props.status
            };
        }
        if (name === 'dateFrom') {
            if (moment(value).isValid() && moment(dateFromTo.dateTo).isValid() && moment(value).isSameOrBefore(moment(dateFromTo.dateTo))) {
                if (this.props.clinic.svcCd === 'THS' && this.props.dateType === 'D') {
                    params.departureFromDtm = value.format(Enum.DATE_FORMAT_EYMD_VALUE);
                } else {
                    params.requestFromDtm = value.format(Enum.DATE_FORMAT_EYMD_VALUE);
                }
                this.props.searchWaitingList(params);
            }
        } else if (name === 'dateTo') {
            if (moment(value).isValid() && moment(dateFromTo.dateFrom).isValid() && moment(value).isSameOrAfter(moment(dateFromTo.dateFrom))) {
                if (this.props.clinic.svcCd === 'THS' && this.props.dateType === 'D') {
                    params.departureToDtm = value.format(Enum.DATE_FORMAT_EYMD_VALUE);
                } else {
                    params.requestToDtm = value.format(Enum.DATE_FORMAT_EYMD_VALUE);
                }
                this.props.searchWaitingList(params);
            }
        } else if (name === 'waitingListSiteId') {
            params.siteId = (value === '*All') ? '' : value;
            if (moment(dateFromTo.dateFrom).isValid() && moment(dateFromTo.dateTo).isValid()) {
                this.props.searchWaitingList(params);
            }
        } else if (name === 'status') {
            params.status = (value === '*All') ? '' : value;
            if (moment(dateFromTo.dateFrom).isValid() && moment(dateFromTo.dateTo).isValid()) {
                this.props.searchWaitingList(params);
            }
        } else {
            if (value === 'D') {
                params = {
                    svcCd: svcCd,
                    siteId: this.props.waitingListSiteId === '*All' ? '' : this.props.waitingListSiteId,
                    departureFromDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                    departureToDtm: moment().add(1, 'months').format(Enum.DATE_FORMAT_EYMD_VALUE),
                    status: this.props.status === '*All' ? '' : this.props.status
                };
                this.props.updateField({ dateFrom: moment(), dateTo: moment().add(1, 'months') });
                this.props.searchWaitingList(params);
            } else {
                params = {
                    svcCd: svcCd,
                    siteId: this.props.waitingListSiteId === '*All' ? '' : this.props.waitingListSiteId,
                    requestFromDtm: moment().subtract(1, 'months').format(Enum.DATE_FORMAT_EYMD_VALUE),
                    requestToDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                    status: this.props.status === '*All' ? '' : this.props.status
                };
                this.props.updateField({ dateFrom: moment().subtract(1, 'months'), dateTo: moment() });
                this.props.searchWaitingList(params);
            }
        }
    }

    addWaiting = () => {
        this.props.auditAction(AlsDesc.ADD, null, null, false, 'ana');
        this.props.addWaiting();
    }
    editWaiting = (data) => {
        this.props.auditAction('Edit Waiting');
        this.props.getWaiting({ waitListId: data.waitListId });
        // this.gridApi.deselectAll();
    }

    deleteWaiting = (data) => {
        let submitData = {
            waitListId: data.waitListId
        };
        this.props.deleteWaiting(submitData, this.searchWaitingList);
        this.setState({ selectedItems: null });
    }

    booking = (data) => {
        const { tabs, tabsActiveKey } = this.props;
        data.redirectFrom = AccessRightEnum.waitingList;
        let regOrSumTabsIndex = this.props.tabs.findIndex(item => item.name === AccessRightEnum.registration || item.name === AccessRightEnum.patientSummary);
        let patientCall = commonUtilities.getPatientCall();
        let curTab = tabs.find(item => item.name === tabsActiveKey);
        if (curTab) {
            this.props.auditAction('Click Appt. Booking Button', curTab.label, curTab.name, false, 'ana');
        }
        if (regOrSumTabsIndex != -1) {
            this.props.openCommonMessage({
                msgCode: '110046',
                params: [
                    { name: 'PATIENTCALL', value: patientCall }
                ]
            });
            return;
        }
        if (data.patientKey && data.patientKey > 0) {
            if (this.props.patientInfo) {
                this.props.openCommonMessage({
                    msgCode: '111109',
                    params: [{ name: 'PATIENT_CALL', value: commonUtilities.getPatientCall() }],
                    btnActions: {
                        btn1Click: () => {
                            this.searchWaitingList();
                        }
                    }
                });
            } else {
                this.props.cleanSubTabs();
                this.props.resetPatient();
                let callBack = (patient) => {
                    // CaseNoUtil.caseNoHandleProcess(patient, () => {
                    this.props.skipTab(AccessRightEnum.booking, data, true);
                    // });
                };
                let params = {
                    patientKey: data.patientKey,
                    callBack: callBack
                };
                this.props.getPatientById(params);
            }
        } else {
            if (this.props.anonPatientInfo) {
                this.props.openCommonMessage({
                    msgCode: '111109',
                    params: [{ name: 'PATIENT_CALL', value: commonUtilities.getPatientCall() }],
                    btnActions: {
                        btn1Click: () => {
                            this.searchWaitingList();
                        }
                    }
                });
            } else {
                this.props.updateAnonBookingState({ redirectParam: data });
                this.props.skipTab(AccessRightEnum.bookingAnonymous, data);
            }
        }
    }

    loadSearchPatient = (patientInfo) => {
        const docPairMap = PatientUtil.getPatientDocumentPair(patientInfo);
        let contactPhone = _.cloneDeep(patientPhonesBasic);
        if (patientInfo.phoneList.length > 0) {
            // let patientInfo.phoneList[0] = patientInfo.phoneList.find(item => item.phonePriority === 1);
            contactPhone.phoneId = patientInfo.phoneList[0].phoneId;
            contactPhone.phoneTypeCd = patientInfo.phoneList[0].phoneTypeCd;
            contactPhone.countryCd = patientInfo.phoneList[0].countryCd;
            contactPhone.areaCd = patientInfo.phoneList[0].areaCd || '';
            contactPhone.dialingCd = patientInfo.phoneList[0].dialingCd || '';
            contactPhone.phoneNo = patientInfo.phoneList[0].phoneNo;
            contactPhone.smsPhoneInd = patientInfo.phoneList[0].smsPhoneInd;
        }
        let waitData = _.cloneDeep(this.props.waitDetail);
        waitData.patientKey = patientInfo.patientKey;
        waitData.priDocTypeCd = docPairMap && docPairMap.primaryDocPair && docPairMap.primaryDocPair.docTypeCd;
        waitData.priDocNo = docPairMap && docPairMap.primaryDocPair && docPairMap.primaryDocPair.docNo;
        waitData.engSurname = patientInfo.engSurname;
        waitData.engGivename = patientInfo.engGivename;
        const patInfo = {
            waitDetail: waitData,
            contactPhone: contactPhone

        };
        return patInfo;
    }

    handleSelectPatient = (patientInfo) => {
        this.props.auditAction('Select Patient', null, null, false, 'ana');
        if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
            let patInfo = this.loadSearchPatient(patientInfo);
            this.props.updateField({ ...patInfo, patientList: [] });
            // this.resetPatParams();
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    }

    handleCloseDialog = () => {
        this.props.auditAction('Cancel Select Patient', null, null, false, 'ana');
        this.props.updateField({ patientList: [] });
        this.props.resetWaitDetail(this.props.clinic.siteId, this.props.waitDetail.encntrTypeId);
    }

    resetPatParams = () => {
        const { svcCd, siteId } = this.props.clinic;
        let target = commonUtilities.getHighestPrioritySiteParams(
            Enum.CLINIC_CONFIGNAME.PAT_SEARCH_TYPE_DEFAULT,
            this.props.clinicConfig,
            { siteId, serviceCd: svcCd }
        );
        let patSearchParam = { searchType: target.paramValue ? target.paramValue : Enum.DOC_TYPE.HKID_ID, searchValue: '' };
        // return patSearchParam;
        this.props.updateField({ patientSearchParam: patSearchParam });
    }

    getFormatDest = (cntryCdList) => {
        let memoStrList = [];
        if (cntryCdList) {
            let _cntryCdList = cntryCdList.split('|');
            let cntryDescList = _cntryCdList.map((item) => {
                let countryObj = this.props.destinationList.find(ele => ele.destinationId == item);
                return (countryObj && countryObj.destinationName) || '';
            });
            memoStrList = memoStrList.concat(cntryDescList);
        }
        let destination = memoStrList.join(' | ');
        return destination;
    }

    getColumn = () => {
        const { waitingListAllRoleListConfig } = this.props;
        let columnDefs = [];
        if (waitingListAllRoleListConfig && waitingListAllRoleListConfig.WAITING_LIST) {
            const list = waitingListAllRoleListConfig.WAITING_LIST.sort(function (a, b) {
                return b.site - a.site || a.displayOrder - b.displayOrder;
            });
            columnDefs.push({
                headerName: '',
                colId: 'index',
                valueGetter: (params) => params.node.rowIndex + 1,
                minWidth: 55,
                maxWidth: 55,
                filter: false
            });
            for (let i = 0; i < list.length; i++) {
                const { labelCd, labelName, labelLength, site } = list[i];
                let col = {
                    headerName: labelName,
                    minWidth: labelLength,
                    //maxWidth: labelLength,
                    field: labelCd,
                    tooltipField: labelCd
                };
                switch (labelCd) {
                    case 'createDtm':
                        col = {
                            ...col,
                            valueFormatter: (params) => {
                                return moment(params.value).format(Enum.DATE_FORMAT_24_HOUR);
                            },
                            tooltipField: undefined,
                            tooltip: (params) => {
                                return moment(params.value).format(Enum.DATE_FORMAT_24_HOUR);
                            }
                        };
                        break;
                    case 'completedDtm':
                        col = {
                            ...col,
                            valueFormatter: (params) => {
                                return params.value ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                            },
                            tooltipField: undefined,
                            tooltip: (params) => {
                                return params.value ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                            }
                        };
                        break;
                    case 'cancelledDtm':
                        col = {
                            ...col,
                            valueFormatter: (params) => {
                                return params.value ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                            },
                            tooltipField: undefined,
                            tooltip: (params) => {
                                return params.value ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                            }
                        };
                        break;
                    case 'cntryCdList':
                        col = {
                            ...col,
                            valueFormatter: (params) => {
                                return this.getFormatDest(params.value);
                            },
                            tooltipField: undefined,
                            tooltip: params => {
                                return this.getFormatDest(params.value);
                            }

                        };
                        break;

                }
                columnDefs.push(col);
            }
        }
        return columnDefs;
    }

    setRowId = (data) => {
        const { svcCd, siteId } = this.props.clinic;
        let waitingList = Array.isArray(data) ? data : [];
        if (!this.props.isEnableCrossBookClinic) {
            waitingList = waitingList.filter(item => item.siteId === siteId);
        }
        return waitingList.map((item, index) => ({
            ...item,
            rowId: index
        }));
    }

    handleApprovalSubmit = () => {
        const { searchString, staffId } = this.props.supervisorsApprovalDialogInfo;
        let params = {
            docType: FieldConstant.PATIENT_NAME_TYPE,
            searchString: searchString,
            staffId: staffId
        };
        this.props.auditAction(AlsDesc.SEARCH_PATIENT);
        this.props.searchPatientList(params);
    }

    handleApprovalChange = (value) => {
        const { supervisorsApprovalDialogInfo } = this.props;
        this.props.updateField({ supervisorsApprovalDialogInfo: { ...supervisorsApprovalDialogInfo, staffId: value } });
    }

    handleApprovalCancel = () => {
        this.props.auditAction('Click Cancel In Supervisors Approval Dialog', 'WatingList');
        this.props.updateField({ supervisorsApprovalDialogInfo: { staffId: '', open: false, searchString: '' } });
        this.props.resetWaitDetail(this.props.clinic.siteId, this.props.waitDetail.encntrTypeId);
    }

    resetApprovalDialog = () => {
        this.props.updateField({ supervisorsApprovalDialogInfo: { staffId: '', open: false, searchString: '' } });
    }

    render() {
        const { selectedItems } = this.state;
        const { siteId, isEnableCrossBookClinic, patientSearchParam, siteParams, service } = this.props;
        const isShowDepartureDate = this.props.waitingListAllRoleListConfig.WAITING_LIST && this.props.waitingListAllRoleListConfig.WAITING_LIST.findIndex(item => item.labelCd === 'departureDtm') > -1;
        const isShowDestination = this.props.waitingListAllRoleListConfig.WAITING_LIST && this.props.waitingListAllRoleListConfig.WAITING_LIST.findIndex(item => item.labelCd === 'cntryCdList') > -1;
        const column = this.getColumn();
        const rowData = this.setRowId(this.props.waitingList || []);
        const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, service.svcCd, siteId);
        return (
            <Grid id="waitingList">
                <SearchPanel
                    id="waitingListSearchPanel"
                    dateFrom={this.props.dateFrom}
                    dateTo={this.props.dateTo}
                    updateField={this.searchPanelOnChange}
                    isEnableCrossBookClinic={this.props.isEnableCrossBookClinic}
                    serviceCd={this.props.clinic.svcCd}
                    clinicList={this.props.clinicList}
                    clinicCd={this.props.clinic.clinicCd}
                    siteId={this.props.waitingListSiteId}
                    status={this.props.status}
                    isShowAllStatus={this.props.isShowAllStatus}
                    dateType={this.props.dateType}
                />
                <Grid style={{ marginTop: 15 }}>
                    <CIMSDataGrid
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '72vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: column,
                            rowData: rowData,
                            rowSelection: 'single',
                            enableBrowserTooltips: true,
                            onGridReady: (params) => {
                                this.gridApi = params.api;
                                this.gridColumnApi = params.columnApi;
                            },
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.rowId.toString(),
                            suppressRowClickSelection: false,
                            onRowClicked: params => {
                                let { selectedItems } = this.state;
                                if (!selectedItems || (params.data.waitListId !== selectedItems.waitListId)) {
                                    this.setState({ selectedItems: params.data });
                                }
                                else {
                                    this.setState({ selectedItems: null });
                                }
                            },
                            onRowDoubleClicked: params => {
                                // handleUpdate(params.data.userId);
                                // this.props.handleSelectPatient(params.data);
                                if (params.data.status === 'W' && (isEnableCrossBookClinic || params.data.siteId === siteId)) {
                                    this.editWaiting(params.data);
                                }
                            },
                            postSort: rowNodes => commonUtilities.forceRefreshCells(rowNodes, ['index'])
                        }}
                    />
                </Grid>
                <CIMSButtonGroup
                    buttonConfig={
                        [
                            {
                                id: 'waitingListBookingButton',
                                name: 'Appt. Booking',
                                disabled: !selectedItems || selectedItems.status !== 'W',
                                onClick: () => this.booking(selectedItems)
                            },
                            {
                                id: 'waitingListAddButton',
                                name: 'Add',
                                onClick: this.addWaiting
                            },
                            {
                                id: 'waitingListEditWaitingButton',
                                name: 'Edit',
                                disabled: !selectedItems || selectedItems.status !== 'W' || (!(isEnableCrossBookClinic || selectedItems.siteId === siteId)),
                                onClick: () => this.editWaiting(selectedItems)
                            },
                            {
                                id: 'waitingListDeleteWaitingButton',
                                name: 'Delete',
                                disabled: !selectedItems || selectedItems.status !== 'W',
                                onClick: () => {
                                    this.props.auditAction(AlsDesc.DELETE, null, null, false, 'ana');
                                    this.props.openCommonMessage({
                                        msgCode: '111110',
                                        btnActions: {
                                            btn1Click: () => {
                                                this.props.auditAction('Confirm Delete Waiting');
                                                this.deleteWaiting(selectedItems);
                                            },
                                            btn2Click: () => {
                                                this.props.auditAction('Cancel Delete Waiting', null, null, false, 'ana');
                                            }
                                        }
                                    });
                                }

                            }
                        ]
                    }
                />

                <EditWaitingDialog
                    id="waitingListEditWaitingDialog"
                    searchWaitingList={this.searchWaitingList}
                    loadSearchPatient={this.loadSearchPatient}
                    resetPatParams={this.resetPatParams}
                    isShowDepartureDate={isShowDepartureDate}
                    isShowDestination={isShowDestination}
                    openCommonMessage={this.props.openCommonMessage}
                />
                {
                    this.props.patientList && this.props.patientList.length > 1 ?
                        isNewPmiSearchResultDialog ?
                            <NewPMISearchResultDialog
                                id={'waiting_list_patient_search_result_dialog'}
                                title="Search Result"
                                results={this.props.patientList || []}
                                handleCloseDialog={this.handleCloseDialog}
                                handleSelectPatient={this.handleSelectPatient}
                            />
                            :
                            <PatientSearchDialog
                                id={'waiting_list_patient_search_result_dialog'}
                                searchResultList={this.props.patientList || []}
                                handleCloseDialog={this.handleCloseDialog}
                                handleSelectPatient={this.handleSelectPatient}
                            />
                            : null
                }
                {this.props.supervisorsApprovalDialogInfo.open ?
                    <SupervisorsApprovalDialog
                        title={`Search by ${commonUtilities.getPatientCall()} Name: `}
                        searchString={this.props.supervisorsApprovalDialogInfo.searchString}
                        confirm={this.handleApprovalSubmit}
                        handleCancel={this.handleApprovalCancel}
                        handleChange={this.handleApprovalChange}
                        resetApprovalDialog={this.resetApprovalDialog}
                        supervisorsApprovalDialogInfo={this.props.supervisorsApprovalDialogInfo}
                    /> : null
                }
            </Grid>
        );
    }
}

const style = () => ({
});
const mapStateToProps = (state) => {
    return {
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        anonPatientInfo: state.bookingAnonymousInformation.anonPatientInfo,
        patientInfo: state.patient.patientInfo,
        dateFrom: state.waitingList.dateFrom,
        dateTo: state.waitingList.dateTo,
        status: state.waitingList.status,
        waitingList: state.waitingList.waitingList,
        tabs: state.mainFrame.tabs,
        patientList: state.waitingList.patientList,
        clinic: state.login.clinic,
        clinicConfig: state.common.clinicConfig,
        service: state.login.service,
        docTypeList: state.common.commonCodeList.doc_type,
        encounterTypes: state.common.encounterTypes,
        clinicList: state.common.clinicList,
        waitDetail: state.waitingList.waitDetail,
        handlingSearch: state.waitingList.handlingSearch,
        listConfig: state.common.listConfig,
        isEnableCrossBookClinic: state.waitingList.isEnableCrossBookClinic,
        siteId: state.login.clinic.siteId,
        countryList: state.patient.countryList || [],
        loginInfo: state.login.loginInfo,
        waitingListAllRoleListConfig: state.waitingList.waitingListAllRoleListConfig,
        waitingListSiteId: state.waitingList.waitingListSiteId,
        isShowAllStatus: state.waitingList.isShowAllStatus,
        dateType: state.waitingList.dateType,
        patientSearchParam: state.waitingList.patientSearchParam,
        supervisorsApprovalDialogInfo: state.waitingList.supervisorsApprovalDialogInfo,
        destinationList: state.patient.destinationList,
        siteParams: state.common.siteParams
    };
};

const mapDispatchToProps = {
    updateField,
    searchWaitingList,
    initiPage,
    cancelSearch,
    addWaiting,
    getWaiting,
    deleteWaiting,
    getPatientById,
    skipTab,
    resetAll,
    openCommonMessage,
    resetPatient,
    cleanSubTabs,
    resetWaitDetail,
    getWaitingListAllRoleListConfig,
    auditAction,
    searchPatientList,
    updateAnonBookingState
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(WaitingList));
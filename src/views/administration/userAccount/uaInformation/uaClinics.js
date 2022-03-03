import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import withStyles from '@material-ui/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import CheckBox from '@material-ui/core/Checkbox';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import AddRemoveButtons from '../../../../components/Buttons/AddRemoveButtons';
// import 'ag-grid-community/dist/styles/ag-theme-blue.css';
// import '../../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';
import DatePicker from '../../../../components/FormValidator/DateValidator';
import Select from '../../../../components/FormValidator/SelectFieldValidator';
import { updateState } from '../../../../store/actions/administration/userAccount/userAccountAction';
import Enum from '../../../../enums/enum';
import { initSite } from '../../../../constants/administration/administrationConstants';
import { PAGE_STATUS } from '../../../../enums/administration/userAccount';
import { getNewSite } from '../../../../utilities/administrationUtilities';
import CommonMessage from '../../../../constants/commonMessage';
import * as AdminUtil from '../../../../utilities/administrationUtilities';
// import { PageStatus } from '../../../../enums/appointment/booking/bookingEnum';
import ValidatorEnum from '../../../../enums/validatorEnum';
import { auditAction } from '../../../../store/actions/als/logAction';

class SiteRender extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const rowData = this.props.data;
        const { value, rowIndex, getSiteList, onChange, context, isSystemAdmin, isServiceAdmin } = this.props;
        let siteList = getSiteList(rowData);
        siteList.sort((a, b) => {
            return a.siteName.localeCompare(b.siteName);
        });
        const isDisabled =
            // (context.pageStatus === PAGE_STATUS.EDITING && rowData.userSiteId) ||
            context.isNonEdit ? true : false;
        return (
            <Grid container style={{ width: 250 }}>
                <Select
                    id={`uaClinics_siteItem${rowIndex}`}
                    TextFieldProps={{
                        variant: 'outlined'
                    }}
                    options={siteList && siteList.map(item => ({ value: item.siteId, label: item.siteName }))}
                    value={value}
                    onChange={e => onChange(e.value, rowData.rowId)}
                    addNullOption
                    isDisabled={isDisabled || (!isSystemAdmin && !isServiceAdmin)}
                />
            </Grid>
        );
    }
}

class AdminRender extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const rowData = this.props.data;
        const { rowIndex, onChange, context, isSystemAdmin, isServiceAdmin } = this.props;
        return (
            <Grid container>
                <CheckBox
                    id={`uaClinics_adminItem${rowIndex}`}
                    color="primary"
                    checked={rowData.isAdmin ? true : false}
                    onChange={e => onChange(e.target.checked ? 1 : 0, rowData.rowId)}
                    disabled={context.isNonEdit || (!isSystemAdmin && !isServiceAdmin)}
                />
            </Grid>
        );
    }
}

class PrimarySiteRender extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const rowData = this.props.data;
        const { rowIndex, onChange, context, isSystemAdmin, isServiceAdmin } = this.props;
        return (
            <Grid container>
                <CheckBox
                    id={`uaClinics_primarySiteItem${rowIndex}`}
                    color="primary"
                    checked={rowData.isPri ? true : false}
                    onChange={e => onChange(e.target.checked ? 1 : 0, rowData.rowId)}
                    disabled={context.isNonEdit || (!isSystemAdmin && !isServiceAdmin)}
                />
            </Grid>
        );
    }
}

class EffDateRender extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value ? moment(this.props.value).format(Enum.DATE_FORMAT_EYMD_VALUE) : null
        };
    }

    componentDidMount() {
        this.dateRef.validateCurrent(() => {
            this.dateRef && this.dateRef.showMessage();
        });
    }

    onChange = (e) => {
        this.setState({ value: e });
    }

    onBlur = () => {
        const { data } = this.props;
        const { value } = this.state;
        if (this.dateRef.isValidCurr()) {
            if (this.isValueChanged(value, this.props.value) && (!value || moment(value).isValid())) {
                this.props.onChange(value && moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE), data.rowId);
            }
        } else {
            this.dateRef.showMessage();
            setTimeout(() => {
                this.dateRef && this.dateRef.hideMessage();
            }, 3000);
        }
    }

    isValueChanged = (state_value, props_value) => {
        if (props_value && state_value) {
            return !moment(state_value).isSame(moment(props_value), 'day');
        } else {
            return !props_value && !state_value ? false : true;
        }
    }

    onAccept = (e) => {
        const { data } = this.props;
        if (this.isValueChanged(e, this.props.value)) {
            this.props.onChange(moment(e).format(Enum.DATE_FORMAT_EYMD_VALUE), data.rowId);
        }
    }

    refresh = () => {
        this.dateRef && this.dateRef.hideMessage();
        return false;
    }

    disableDatePicker = () => {
        const { context, data, isSystemAdmin, isServiceAdmin } = this.props;
        const { isNonEdit, originalUser } = context;
        let isDisable = isNonEdit;
        // if (data.userSiteId) {
        //     const originalSite = originalUser.uamMapUserSiteDtos.find(item => item.userSiteId === data.userSiteId);
        //     if (originalSite && originalSite.efftDate && moment(originalSite.efftDate).isBefore(moment(), 'day')) {
        //         isDisable = true;
        //     }
        // }
        return isDisable || (!isSystemAdmin && !isServiceAdmin);
    }

    render() {
        const { rowIndex, getMaxDate, data, context } = this.props;
        const isDisabled = this.disableDatePicker();
        const maxDate = getMaxDate(data);
        const isExpyDateValid = this.props.data.expyDate && moment(this.props.data.expyDate).isValid();
        const isModified = this.state.value && moment(this.state.value).isValid() && !moment(this.state.value).isSame(this.props.value, 'day');
        const validators = [];
        const errorMessages = [];
        if (data.siteId) {

            validators.push(ValidatorEnum.required);
            errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        }
        validators.push(ValidatorEnum.isRightMoment);
        errorMessages.push(CommonMessage.VALIDATION_NOTE_INVALID_MOMENT());
        if (isExpyDateValid) {

            validators.push(ValidatorEnum.maxDate(moment(this.props.data.expyDate).format(Enum.DATE_FORMAT_EYMD_VALUE)));
            errorMessages.push(CommonMessage.VALIDATION_NOTE_EFFECTIVE_DATE());
        }
        if (isModified) {
            validators.push(ValidatorEnum.minDate(moment().format(Enum.DATE_FORMAT_EYMD_VALUE)));
            errorMessages.push(CommonMessage.VALIDATION_NOTE_DISABLE_PAST());
        }
        return (
            <Grid container>
                <DatePicker
                    ref={ref => this.dateRef = ref}
                    id={`uaClinics_effDateItem${rowIndex}`}
                    hideMessage
                    inputVariant="outlined"
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onAccept={this.onAccept}
                    isRequired={data.siteId ? true : false}
                    disablePast={!isDisabled && context.pageStatus === PAGE_STATUS.ADDING}
                    // maxDate={maxDate}
                    maxDateMessage={CommonMessage.VALIDATION_NOTE_EFFECTIVE_DATE()}
                    disabled={isDisabled}
                    portalContainer={this.props.api.gridPanel.eCenterContainer}
                    ignorePresetValidators
                    validators={validators}
                    errorMessages={errorMessages}
                />
            </Grid>
        );
    }
}

class ExpiryDateRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value ? moment(this.props.value).format(Enum.DATE_FORMAT_EYMD_VALUE) : null
        };
    }

    componentDidMount() {
        this.dateRef.validateCurrent(() => {
            this.dateRef && this.dateRef.showMessage();
        });
    }

    onChange = (e) => {
        this.setState({ value: e });
    }

    onBlur = (e) => {
        const { data } = this.props;
        const { value } = this.state;
        if (this.dateRef.isValidCurr()) {
            if (this.isValueChanged(value, this.props.value) && (!value || moment(value).isValid())) {
                this.props.onChange(value && moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE), data.rowId);
            }
        } else {
            this.dateRef.showMessage();
            setTimeout(() => {
                this.dateRef && this.dateRef.hideMessage();
            }, 3000);
        }
    }

    isValueChanged = (state_value, props_value) => {
        if (props_value && state_value) {
            return !moment(state_value).isSame(moment(props_value), 'day');
        } else {
            return !props_value && !state_value ? false : true;
        }
    }

    onAccept = (e) => {
        const { data } = this.props;
        if (this.isValueChanged(e, this.props.value)) {
            this.props.onChange(moment(e).format(Enum.DATE_FORMAT_EYMD_VALUE), data.rowId);
        }
    }

    refresh = () => {
        this.dateRef && this.dateRef.hideMessage();
        return false;
    }

    disableDatePicker = () => {
        const { context, data } = this.props;
        const { isNonEdit, originalUser } = context;
        let isDisable = isNonEdit;
        // if (data.userSiteId) {
        //     const originalSite = originalUser.uamMapUserSiteDtos.find(item => item.userSiteId === data.userSiteId);
        //     if (originalSite && originalSite.expyDate && moment(originalSite.expyDate).isBefore(moment(), 'day')) {
        //         isDisable = true;
        //     }
        // }
        return isDisable;
    }

    render() {
        const { rowIndex, getMinDate, data, isSystemAdmin, isServiceAdmin } = this.props;
        const isDisabled = this.disableDatePicker();
        const minDate = getMinDate(data);
        const isEfftDateValid = this.props.data.efftDate && moment(this.props.data.efftDate).isValid();
        const isModified = this.state.value && moment(this.state.value).isValid() && !moment(this.state.value).isSame(this.props.value, 'day');
        const validators = [ValidatorEnum.isRightMoment];
        const errorMessages = [CommonMessage.VALIDATION_NOTE_INVALID_MOMENT()];
        if (isEfftDateValid) {

            validators.push(ValidatorEnum.minDate(moment(this.props.data.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE)));
            errorMessages.push(CommonMessage.VALIDATION_NOTE_EXPIRY_DATE());
        }
        if (isModified) {
            validators.push(ValidatorEnum.minDate(moment().format(Enum.DATE_FORMAT_EYMD_VALUE)));
            errorMessages.push(CommonMessage.VALIDATION_NOTE_DISABLE_PAST());
        }
        return (
            <Grid container>
                <DatePicker
                    ref={ref => this.dateRef = ref}
                    id={`uaClinics_expiryDateItem${rowIndex}`}
                    hideMessage
                    inputVariant="outlined"
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onAccept={this.onAccept}
                    disablePast={!(isDisabled || (!isSystemAdmin && !isServiceAdmin))}
                    minDate={minDate}
                    minDateMessage={CommonMessage.VALIDATION_NOTE_EXPIRY_DATE()}
                    disabled={isDisabled || (!isSystemAdmin && !isServiceAdmin)}
                    portalContainer={this.props.api.gridPanel.eCenterContainer}
                    ignorePresetValidators
                    validators={validators}
                    errorMessages={errorMessages}
                />
            </Grid>
        );
    }
}

class ActionRender extends React.Component {
    constructor(props) {
        super(props);
    }

    isShowAddBtn = () => {
        const { data, getAvailableSiteList, getRowData } = this.props;
        const availableSites = getAvailableSiteList();
        const rowData = getRowData();
        return (rowData.length === data.rowId + 1) && (rowData.length < availableSites.length);
    }

    render() {
        const { rowIndex, handleDelete, handleAdd, context, data, isSystemAdmin, isServiceAdmin } = this.props;
        const showAdd = this.isShowAddBtn();
        return (
            <AddRemoveButtons
                id={`uaClinics_addRemove_${rowIndex}`}
                hideAdd={!showAdd}
                AddButtonProps={{
                    onClick: e => handleAdd(data.rowId),
                    disabled: context.isNonEdit || (!isSystemAdmin && !isServiceAdmin)
                }}
                RemoveButtonProps={{
                    onClick: e => handleDelete(data.rowId),
                    disabled: context.isNonEdit || (!isSystemAdmin && !isServiceAdmin)
                }}
            />
        );
    }
}

class UAClinics extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            column: [
                {
                    headerName: 'Site',
                    field: 'siteId',
                    colId: 'siteId',
                    minWidth: 300,
                    cellRenderer: 'siteRender',
                    cellRendererParams: {
                        onChange: (value, rowIndex) => {
                            this.updateClinicList({ siteId: value }, rowIndex);
                            this.refreshSiteColumn();
                            this.refreshDateRow(rowIndex);
                        },
                        getSiteList: (rowData) => {
                            const { uaClinicList, clinicList, uaServiceList } = this.props;
                            const existSite = uaClinicList.map(item => item.siteId).filter(item => item !== rowData.siteId);
                            let userAvaSites = AdminUtil.getAvailableSiteList(uaServiceList, clinicList);
                            return userAvaSites.filter(item => !existSite.includes(item.siteId));
                        },
                        isSystemAdmin: this.props.isSystemAdmin,
                        isServiceAdmin: this.props.isServiceAdmin
                    }
                },
                {
                    headerName: 'Admin',
                    field: 'isAdmin',
                    minWidth: 90,
                    maxWidth: 90,
                    cellRenderer: 'adminRender',
                    cellRendererParams: {
                        onChange: (value, rowIndex) => {
                            this.updateClinicList({ isAdmin: value }, rowIndex);
                        },
                        isSystemAdmin: this.props.isSystemAdmin,
                        isServiceAdmin: this.props.isServiceAdmin
                    }
                },
                {
                    headerName: 'Effective Date',
                    field: 'efftDate',
                    colId: 'efftDate',
                    minWidth: 200,
                    cellRenderer: 'effDateRender',
                    cellRendererParams: {
                        onChange: (value, rowIndex) => {
                            this.updateClinicList({ efftDate: value }, rowIndex);
                            this.refreshDateRow(rowIndex);
                        },
                        getMaxDate: (rowData) => {
                            return rowData.expyDate
                                && moment(rowData.expyDate).isValid()
                                && moment(rowData.expyDate).isSameOrAfter(moment(), 'day')
                                ? moment(rowData.expyDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : undefined;
                        },
                        isSystemAdmin: this.props.isSystemAdmin,
                        isServiceAdmin: this.props.isServiceAdmin
                    }
                },
                {
                    headerName: 'Expiry Date',
                    field: 'expyDate',
                    colId: 'expyDate',
                    minWidth: 200,
                    cellRenderer: 'expiryDateRender',
                    cellRendererParams: {
                        onChange: (value, rowIndex) => {
                            this.updateClinicList({ expyDate: value }, rowIndex);
                            this.refreshDateRow(rowIndex);
                        },
                        getMinDate: (rowData) => {
                            return rowData.efftDate
                                && moment(rowData.efftDate).isValid()
                                ? moment(rowData.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : undefined;
                        },
                        isSystemAdmin: this.props.isSystemAdmin,
                        isServiceAdmin: this.props.isServiceAdmin
                    }
                },
                {
                    headerName: 'Primary Site',
                    field: 'isPri',
                    minWidth: 135,
                    maxWidth: 135,
                    cellRenderer: 'primarySiteRender',
                    cellRendererParams: {
                        onChange: (value, rowIndex) => {
                            this.updatePrimarySite(value, rowIndex);
                        },
                        isSystemAdmin: this.props.isSystemAdmin,
                        isServiceAdmin: this.props.isServiceAdmin
                    }
                },
                { headerName: 'Created By', field: 'createBy', minWidth: 160 },
                {
                    headerName: 'Created Date',
                    field: 'createDtm',
                    minWidth: 160,
                    valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE)
                },
                { headerName: 'Last Updated By', field: 'updateBy', minWidth: 160 },
                {
                    headerName: 'Last Updated Date',
                    field: 'updateDtm',
                    minWidth: 160,
                    valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE)
                },
                {
                    headerName: '',
                    field: '',
                    colId: 'action',
                    sortable: false,
                    minWidth: 130,
                    maxWidth: 130,
                    cellRenderer: 'actionRender',
                    cellRendererParams: {
                        handleAdd: this.addClinics,
                        handleDelete: this.deleteClinics,
                        getAvailableSiteList: () => {
                            const { clinicList, uaServiceList } = this.props;
                            return AdminUtil.getAvailableSiteList(uaServiceList, clinicList);
                        },
                        getRowData: () => this.props.uaClinicList,
                        isSystemAdmin: this.props.isSystemAdmin,
                        isServiceAdmin: this.props.isServiceAdmin
                    }
                }
            ]
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeStep !== this.props.activeStep && this.props.activeStep === 2) {
            this.gridApi && this.gridApi.checkGridSize();
            this.refreshSiteColumn();
            if (this.gridColumnApi && this.gridApi) {
                const colIds = this.gridColumnApi.getAllDisplayedColumns().map(col => col.getColId());
                this.gridApi.refreshCells({ columns: colIds, force: true });
            }
        }
    }

    updateClinicList = (info, index) => {
        const { uaClinics, uaClinicList } = this.props;
        let _uaClinicList = _.cloneDeep(uaClinicList);
        _uaClinicList[index] = { ..._uaClinicList[index], ...info };
        delete _uaClinicList[index].siteDto;
        this.props.updateState({
            uaClinics: {
                ...uaClinics,
                uaClinicList: _uaClinicList
            }
        });
        const rowNode = this.gridApi.getRowNode(index);
        for (let key in info) {
            rowNode.setDataValue(key, info[key]);
        }
    };

    addClinics = (rowIndex) => {
        const { uaClinics, uaClinicList, loginInfo } = this.props;
        let _uaClinicList = _.cloneDeep(uaClinicList);
        let newSite = AdminUtil.getNewSite(loginInfo);
        _uaClinicList.push(newSite);
        this.props.updateState({
            uaClinics: {
                ...uaClinics,
                uaClinicList: _uaClinicList
            }
        });
        this.refreshActionColumn();
        this.refreshDateRow(rowIndex);
    }

    deleteClinics = (rowIndex) => {
        const { uaClinics, uaClinicList, loginInfo } = this.props;
        let _uaClinicList = _.cloneDeep(uaClinicList);
        _uaClinicList.splice(rowIndex, 1);
        if (_uaClinicList.length === 0) {
            let newSite = _.cloneDeep(initSite);
            newSite.createBy = loginInfo.loginName;
            newSite.updateBy = loginInfo.loginName;
            newSite.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
            newSite.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
            _uaClinicList.push(newSite);
        }
        this.props.updateState({
            uaClinics: {
                ...uaClinics,
                uaClinicList: _uaClinicList
            }
        });
        this.refreshActionColumn();
        this.refreshSiteColumn();
        this.refreshDateRow(rowIndex);
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    refreshSiteColumn = () => {
        this.gridApi.refreshCells({ columns: ['siteId'], force: true });
    }

    refreshActionColumn = () => {
        this.gridApi.refreshCells({ columns: ['action'], force: true });
    }

    refreshDateRow = (rowIndex) => {
        const rowNode = this.gridApi.getRowNode(rowIndex);
        this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
    }

    setRowId = (data) => {
        return data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    }

    handleAddAll = () => {
        const { uaClinicList, uaServiceList, loginUser, clinicList, uaClinics, loginInfo } = this.props;
        this.props.auditAction('Add all clinic(s)/office(s)', null, null, false, 'user');
        let newSiteList = _.cloneDeep(uaClinicList);
        let userAvaSites = AdminUtil.getAvailableSiteList(uaServiceList, clinicList);
        for (let i = 0; i < userAvaSites.length; i++) {
            const itemSite = userAvaSites[i];
            if (uaClinicList.findIndex(item => item.siteId === itemSite.siteId) === -1) {
                let newSite = getNewSite(loginUser);
                newSite.siteId = itemSite.siteId;
                newSite.efftDate = moment();
                newSiteList.push(newSite);
            }
        }
        let _uaClinicList = newSiteList.filter(item => item.siteId);
        if (_uaClinicList.length === 0) {
            let newSite = _.cloneDeep(initSite);
            newSite.createBy = loginInfo.loginName;
            newSite.updateBy = loginInfo.loginName;
            newSite.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
            newSite.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
            newSite.efftDate = moment();
            _uaClinicList.push(newSite);
        }
        this.props.updateState({
            uaClinics: {
                ...uaClinics,
                uaClinicList: _uaClinicList
            }
        });
        this.refreshActionColumn();
    }

    updatePrimarySite = (value, rowIndex) => {
        const { uaClinics, uaClinicList } = this.props;
        let _uaClinicList = _.cloneDeep(uaClinicList);
        _uaClinicList[rowIndex].isPri = value;
        if (value) {
            _uaClinicList.forEach((item, index) => {
                if (item.isPri && index !== rowIndex) {
                    item.isPri = 0;
                }
            });
        }
        this.props.updateState({
            uaClinics: {
                ...uaClinics,
                uaClinicList: _uaClinicList
            }
        });
    }

    suppressEnter = (params) => {
        const KEY_ENTER = [37, 38, 39, 40];
        const event = params.event;
        const key = event.which;
        const suppress = KEY_ENTER.includes(key);
        return suppress;
    }

    render() {
        const { classes, uaClinicList, pageStatus, isSystemAdmin, isServiceAdmin } = this.props;
        const { column } = this.state;
        const rowData = this.setRowId(uaClinicList);
        const isNonEdit = pageStatus === PAGE_STATUS.NONEDITABLE;
        return (
            <Grid container justify="center">
                <Grid item container className={classes.root}>
                    <Grid item container>
                        <CIMSButton
                            id="uaClinics_addAllBtn"
                            onClick={this.handleAddAll}
                            children="Add all clinic(s)/office(s)"
                            disabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin)}
                        />
                    </Grid>
                    <CIMSDataGrid
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '63vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: column,
                            rowData: rowData,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            headerHeight: 50,
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.rowId.toString(),
                            frameworkComponents: {
                                siteRender: SiteRender,
                                actionRender: ActionRender,
                                adminRender: AdminRender,
                                primarySiteRender: PrimarySiteRender,
                                effDateRender: EffDateRender,
                                expiryDateRender: ExpiryDateRender
                            },
                            tabToNextCell: (params) => { },
                            context: {
                                pageStatus: this.props.pageStatus,
                                isNonEdit: isNonEdit,
                                originalUser: this.props.sourceUser
                            },
                            suppressColumnVirtualisation: true,
                            ensureDomOrder: true,
                            suppressKeyboardEvent: this.suppressEnter
                        }}
                    />
                </Grid>
            </Grid>
        );
    }
}

const styles = theme => ({
    root: {
        width: '90%',
        paddingTop: 10
    }
});

const mapState = state => ({
    activeStep: state.userAccount.uaInfo.activeStep,
    pageStatus: state.userAccount.pageStatus,
    sourceUser: state.userAccount.uaGeneral.sourceUser,
    uaServiceList: state.userAccount.uaGeneral.uaServiceList,
    uaClinics: state.userAccount.uaClinics,
    uaClinicList: state.userAccount.uaClinics.uaClinicList,
    clinicList: state.common.clinicList || [],
    // siteInfo: state.common.siteInfo || [],
    loginInfo: state.login.loginInfo,
    loginUser: state.login.loginInfo.userDto,
    isSystemAdmin: state.login.isSystemAdmin,
    isServiceAdmin: state.login.isServiceAdmin,
    isClinicalAdmin: state.login.isClinicalAdmin
});

const mapDispatch = {
    updateState,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(UAClinics));
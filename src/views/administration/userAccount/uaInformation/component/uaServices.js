import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import memoize from 'memoize-one';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
// import 'ag-grid-community/dist/styles/ag-theme-blue.css';
// import '../../../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';
import { withStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CheckBox from '@material-ui/core/Checkbox';
import { RemoveCircle, AddCircle } from '@material-ui/icons';
import Select from '../../../../../components/FormValidator/SelectValidator';
import { updateState } from '../../../../../store/actions/administration/userAccount/userAccountAction';
import { initService, initSite } from '../../../../../constants/administration/administrationConstants';
import Enum from '../../../../../enums/enum';
import { PAGE_STATUS } from '../../../../../enums/administration/userAccount';
import * as AdminUtil from '../../../../../utilities/administrationUtilities';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';

class ServiceRender extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const rowData = this.props.data;
        const { rowIndex, onChange, getServiceList, isSelectedSite, context, isSystemAdmin } = this.props;
        const serviceList = getServiceList(rowData);
        serviceList.sort((a, b) => {
            return a.serviceName.localeCompare(b.serviceName);
        });
        const isHaveSelectedSite = isSelectedSite(rowData);
        return (
            <Grid container style={{ width: 400 }}>
                <Select
                    id={`uaGeneral_serviceItem${rowIndex}`}
                    TextFieldProps={{
                        variant: 'outlined'
                    }}
                    options={serviceList && serviceList.map(item => ({ value: item.serviceCd, label: item.serviceName }))}
                    value={rowData.svcCd}
                    isRequired
                    onChange={e => { onChange(e.value, rowData.rowId); }}
                    isDisabled={context.isNonEdit || !isSystemAdmin}
                    portalContainer={this.props.api.gridPanel.eCenterViewport}
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
        const { rowIndex, onChange, context, isSystemAdmin } = this.props;

        return (
            <CheckBox
                id={`uaGeneral_adminItem${rowIndex}`}
                checked={rowData.isAdmin ? true : false}
                color="primary"
                onChange={e => {
                    onChange(e.target.checked ? 1 : 0, rowData.rowId);
                }}
                disabled={context.isNonEdit || !isSystemAdmin}
            />
        );
    }
}

class ActionRender extends React.Component {
    constructor(props) {
        super(props);
    }

    isShowAddBtn = () => {
        const { data, getAvailableServiceList, getRowData } = this.props;
        const availableServices = getAvailableServiceList();
        const rowData = getRowData();
        return (rowData.length === data.rowId + 1) && (rowData.length < availableServices.length);
    }


    render() {
        const { rowIndex, handleAdd, handleDelete, data, isSystemAdmin, context } = this.props;
        const showAdd = this.isShowAddBtn();
        return (
            <Grid item container justify="center">
                <IconButton
                    id={`uaGeneral_deleteItem${rowIndex}`}
                    onClick={e => handleDelete(data.rowId)}
                    title="Remove"
                    color="secondary"
                    style={{ padding: 8 }}
                    disabled={context.isNonEdit || !isSystemAdmin}
                >
                    <RemoveCircle />
                </IconButton>
                <IconButton
                    id={`uaGeneral_addItem${rowIndex}`}
                    onClick={e => handleAdd(data.rowId)}
                    title="Add"
                    color="primary"
                    style={{ padding: 8, display: !showAdd ? 'none' : '' }}
                    disabled={context.isNonEdit || !isSystemAdmin}
                >
                    <AddCircle />
                </IconButton>
            </Grid>
        );
    }
}

class UAServices extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            column:
                [
                    {
                        headerName: 'Service',
                        field: 'svcCd',
                        colId: 'svcCd',
                        minWidth: 400,
                        cellRenderer: 'serviceRender',
                        cellRendererParams: {
                            onChange: (value, rowIndex) => {
                                this.updateServices({ svcCd: value }, rowIndex);
                                this.refreshServiceColumn();
                            },
                            getServiceList: (rowData) => {
                                const { loginUser, uaServiceList, serviceList, service } = this.props;
                                const existSvcs = uaServiceList.map(item => item.svcCd).filter(item => item !== rowData.svcCd);
                                let _services = this.getAvailableServiceList(loginUser.isAdmin, service, serviceList);
                                return _services.filter(item => !existSvcs.includes(item.serviceCd));
                            },
                            isSelectedSite: (rowData) => {
                                const { uaClinicList = [], clinicList = [] } = this.props;
                                const sites = uaClinicList.map(item => item.siteId);
                                return clinicList.filter(item => sites.includes(item.siteId)).findIndex(item => item.svcCd === rowData.svcCd) > -1;
                            },
                            isSystemAdmin: this.props.isSystemAdmin
                        }
                    },
                    {
                        headerName: 'Admin',
                        field: 'isAdmin',
                        minWidth: 90,
                        maxWidth: 90,
                        cellRenderer: 'adminRender',
                        sortable: false,
                        cellRendererParams: {
                            onChange: (value, rowIndex) => {
                                this.updateServices({ isAdmin: value }, rowIndex);
                            },
                            isSystemAdmin: this.props.isSystemAdmin
                        }
                    },
                    { headerName: 'Created By', field: 'createBy' },
                    { headerName: 'Created On', field: 'createDtm', valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) },
                    { headerName: 'Updated By', field: 'updateBy' },
                    { headerName: 'Last Updated Date', field: 'updateDtm', valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) },
                    {
                        headerName: '',
                        field: '',
                        colId: 'action',
                        sortable: false,
                        minWidth: 130,
                        maxWidth: 130,
                        cellRenderer: 'actionRender',
                        cellRendererParams: {
                            handleAdd: this.addServices,
                            handleDelete: this.deleteServices,
                            getAvailableServiceList: () => {
                                const { loginUser, serviceList, uaServiceList } = this.props;
                                if (loginUser.isAdmin) {
                                    return serviceList;
                                } else {
                                    const userSvcs = (uaServiceList || []).map(item => item.svcCd);
                                    return serviceList.filter(item => userSvcs.includes(item.serviceCd));
                                }
                            },
                            getRowData: () => this.props.uaServiceList,
                            isSystemAdmin: this.props.isSystemAdmin
                        }
                    }
                ]
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeStep !== this.props.activeStep && this.props.activeStep === 0) {
            this.refreshServiceColumn();
        }
    }

    loadCurAvailRoleList = (uaServiceList) => {
        const { availableUserRoleList, searchAvailableVal } = this.props;
        let curAvailRoleList = _.cloneDeep(availableUserRoleList);
        let svcCds = [];
        uaServiceList.forEach(item => svcCds.push(item.svcCd));
        if (searchAvailableVal) {
            curAvailRoleList = curAvailRoleList.filter(item => {
                if (item.svcCd) {
                    return (svcCds.find(ele => ele === item.svcCd) && item.roleName.includes(searchAvailableVal));
                }
                else {
                    return item.roleName.includes(searchAvailableVal);
                }
            });
        } else {
            curAvailRoleList = curAvailRoleList.filter(item => {
                if (item.svcCd) {
                    return svcCds.find(ele => ele === item.svcCd);
                } else {
                    return true;
                }
            });
        }
        return curAvailRoleList;
    };

    getAvailableServiceList = (isAdmin, service, serviceList) => {
        if (isAdmin) {
            return serviceList;
        } else {
            // const userSvcs = (userServices || []).map(item => item.svcCd);
            // return serviceList.filter(item => userSvcs.includes(item.serviceCd));
            return serviceList.filter(item => item.serviceCd === service.serviceCd);
        }
    }

    updateServices = (info, index) => {
        const { uaGeneral, uaServiceList, uaUserRole, selectedUserRoleList, uaClinicList, clinicList, uaClinics, loginInfo } = this.props;
        let _uaServiceList = _.cloneDeep(uaServiceList);
        _uaServiceList[index] = { ..._uaServiceList[index], ...info };

        if(info.isAdmin){
            _uaServiceList.forEach((element, rowIndex) => {
                if (rowIndex !== index) {
                    _uaServiceList[rowIndex] = { ..._uaServiceList[rowIndex], isAdmin: 0 };
                }
            });
        }

        let _selectedUserRoleList = _.cloneDeep(selectedUserRoleList);
        _selectedUserRoleList = _selectedUserRoleList.filter(item => {
            let curUserRoleList = this.loadCurAvailRoleList(_uaServiceList);
            return curUserRoleList.find(ele => ele.roleId === item.roleId);
        });

        let userAvaSites = AdminUtil.getAvailableSiteList(_uaServiceList, clinicList);
        let _uaClinicList = _.cloneDeep(uaClinicList);
        _uaClinicList = _uaClinicList.filter(item => userAvaSites.find(ele => ele.siteId === item.siteId));

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
            uaGeneral: {
                ...uaGeneral,
                uaServiceList: _uaServiceList
            },
            uaUserRole: {
                ...uaUserRole,
                availableIndex: '',
                searchAvailableVal: '',
                searchSelectedVal: '',
                selectedIndex: '',
                selectedUserRoleList: _selectedUserRoleList
            },
            uaClinics: {
                ...uaClinics,
                uaClinicList: _uaClinicList
            }

        });
    };

    addServices = () => {
        const { uaGeneral, uaServiceList, loginInfo } = this.props;
        let _uaServiceList = _.cloneDeep(uaServiceList);
        let newSvc = _.cloneDeep(initService);
        newSvc.createBy = loginInfo.loginName;
        newSvc.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        newSvc.updateBy = loginInfo.loginName;
        newSvc.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        _uaServiceList.push(newSvc);
        this.props.updateState({
            uaGeneral: {
                ...uaGeneral,
                uaServiceList: _uaServiceList
            }
        });
        this.refreshServiceColumn();
        this.refreshActionColumn();
    }

    deleteServices = (rowIndex) => {
        const { uaGeneral, uaServiceList, loginInfo, selectedUserRoleList, clinicList, uaClinicList, uaUserRole, uaClinics } = this.props;
        let uaDeleteServiceList = _.cloneDeep(uaServiceList);
        uaDeleteServiceList = [uaDeleteServiceList[rowIndex]];
        let userDeleteSites = AdminUtil.getAvailableSiteList(uaDeleteServiceList, clinicList);
        let uaDeleteClinics = userDeleteSites.filter(item => { return uaClinicList.find(ele => ele.siteId === item.siteId); });
        if (uaDeleteClinics.length > 0) {
            // Assigned Clinic(s) on this service
            this.props.openCommonMessage({
                msgCode: '110368',
                btnActions: {
                    btn1Click: () => {
                        let _uaServiceList = _.cloneDeep(uaServiceList);
                        _uaServiceList.splice(rowIndex, 1);
                        if (_uaServiceList.length === 0) {
                            let newSvc = _.cloneDeep(initService);
                            newSvc.createBy = loginInfo.loginName;
                            newSvc.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
                            newSvc.updateBy = loginInfo.loginName;
                            newSvc.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
                            _uaServiceList.push(newSvc);
                        }

                        let _selectedUserRoleList = _.cloneDeep(selectedUserRoleList);
                        _selectedUserRoleList = _selectedUserRoleList.filter(item => {
                            let curUserRoleList = this.loadCurAvailRoleList(_uaServiceList);
                            return curUserRoleList.find(ele => ele.roleId === item.roleId);
                        });

                        let userAvaSites = AdminUtil.getAvailableSiteList(_uaServiceList, clinicList);
                        let _uaClinicList = _.cloneDeep(uaClinicList);
                        _uaClinicList = _uaClinicList.filter(item => userAvaSites.find(ele => ele.siteId === item.siteId));

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
                            uaGeneral: {
                                ...uaGeneral,
                                uaServiceList: _uaServiceList
                            },
                            uaUserRole: {
                                ...uaUserRole,
                                selectedUserRoleList: _selectedUserRoleList
                            },
                            uaClinics: {
                                ...uaClinics,
                                uaClinicList: _uaClinicList
                            }
                        });
                        this.refreshServiceColumn();
                        this.refreshActionColumn();
                    }
                }
            });
        } else {
            let _uaServiceList = _.cloneDeep(uaServiceList);
            _uaServiceList.splice(rowIndex, 1);
            if (_uaServiceList.length === 0) {
                let newSvc = _.cloneDeep(initService);
                newSvc.createBy = loginInfo.loginName;
                newSvc.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
                newSvc.updateBy = loginInfo.loginName;
                newSvc.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
                _uaServiceList.push(newSvc);
            }

            let _selectedUserRoleList = _.cloneDeep(selectedUserRoleList);
            _selectedUserRoleList = _selectedUserRoleList.filter(item => {
                let curUserRoleList = this.loadCurAvailRoleList(_uaServiceList);
                return curUserRoleList.find(ele => ele.roleId === item.roleId);
            });

            let userAvaSites = AdminUtil.getAvailableSiteList(_uaServiceList, clinicList);
            let _uaClinicList = _.cloneDeep(uaClinicList);
            _uaClinicList = _uaClinicList.filter(item => userAvaSites.find(ele => ele.siteId === item.siteId));

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
                uaGeneral: {
                    ...uaGeneral,
                    uaServiceList: _uaServiceList
                },
                uaUserRole: {
                    ...uaUserRole,
                    selectedUserRoleList: _selectedUserRoleList
                },
                uaClinics: {
                    ...uaClinics,
                    uaClinicList: _uaClinicList
                }
            });
            this.refreshServiceColumn();
            this.refreshActionColumn();
        }

    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    refreshServiceColumn = () => {
        this.gridApi.refreshCells({ columns: ['svcCd'], force: true });
    }

    refreshActionColumn = () => {
        this.gridApi.refreshCells({ columns: ['action'], force: true });
    }

    getRowData = memoize((uaServiceList) => {
        return uaServiceList.map((item, index) => ({
            ...item,
            rowId: index
        }));
    });

    render() {
        const { uaServiceList, pageStatus } = this.props;
        const { column } = this.state;
        const rowData = this.getRowData(uaServiceList);
        const isNonEdit = pageStatus === PAGE_STATUS.NONEDITABLE;
        return (
            <Grid container>
                <CIMSDataGrid
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '26vh',
                        display: 'block'
                    }}
                    gridOptions={{
                        columnDefs: column,
                        rowData: rowData,
                        rowSelection: 'single',
                        onGridReady: this.onGridReady,
                        headerHeight: 50,
                        getRowHeight: params => 50,
                        getRowNodeId: item => item.rowId.toString(),
                        frameworkComponents: {
                            actionRender: ActionRender,
                            adminRender: AdminRender,
                            serviceRender: ServiceRender
                        },
                        context: {
                            pageStatus: this.props.pageStatus,
                            isNonEdit: isNonEdit
                        },
                        suppressColumnVirtualisation: true,
                        ensureDomOrder: true,
                        tabToNextCell: (params) => { }
                    }}
                />
            </Grid>
        );
    }
}

const styles = theme => ({

});

const mapState = state => ({
    pageStatus: state.userAccount.pageStatus,
    uaGeneral: state.userAccount.uaGeneral,
    uaUserRole: state.userAccount.uaUserRole,
    isUserAdmin: state.userAccount.uaGeneral.userInfo.isAdmin,
    uaServiceList: state.userAccount.uaGeneral.uaServiceList || [],
    serviceList: state.common.serviceList || [],
    loginInfo: state.login.loginInfo,
    userServices: state.login.loginInfo.userDto.uamMapUserSvcDtos,
    loginUser: state.login.loginInfo.userDto,
    service: state.login.service,
    uaClinicList: state.userAccount.uaClinics.uaClinicList,
    clinicList: state.common.clinicList,
    isSystemAdmin: state.login.isSystemAdmin,
    selectedUserRoleList: state.userAccount.uaUserRole.selectedUserRoleList,
    availableUserRoleList: state.userAccount.uaUserRole.availableUserRoleList,
    searchAvailableVal: state.userAccount.uaUserRole.searchAvailableVal,
    uaClinics: state.userAccount.uaClinics
});

const mapDispatch = {
    updateState,
    openCommonMessage
};

export default connect(mapState, mapDispatch)(withStyles(styles)(UAServices));
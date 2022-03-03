import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import withStyles from '@material-ui/styles/withStyles';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { resetAll, updateState, getUserInfoById, getUserList, deleteUser, listAllUserRole, submitChangePasscode, getUserPasscode, genAccountStaffId } from '../../../../store/actions/administration/userAccount/userAccountAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { PAGE_STATUS } from '../../../../enums/administration/userAccount';
import * as AdminUtil from '../../../../utilities/administrationUtilities';
import Enum from '../../../../enums/enum';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import ChangePasscodeDialog from '../uaInformation/component/changePasscodeDialog';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../../../enums/validatorEnum';
import { isClinicalAdminSetting, isServiceAdminSetting } from '../../../../utilities/userUtilities';
import { forceRefreshCells, getTopPriorityOfSiteParams } from '../../../../utilities/commonUtilities';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import { getFullName } from '../../../../utilities/commonUtilities';
import CIMSPdfViewer from '../../../../components/PDF/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import moment from 'moment';
class OrderNumRender extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { rowIndex } = this.props;
        return rowIndex + 1;
    }
}

const UAM = (props) => {
    const { loginUser, uaGeneral, uaClinics, serviceCd, siteId, clinicConfig, changePasscodeDialogInfo, staffIDPreviewData } = props;
    let refGrid = React.createRef();

    useEffect(() => {
        // uaServiceList.forEach(item => svcCds.push(item.svcCd));
        // props.listAllUserRole({ statuses: ['!D'], svcCds: svcCds });
        props.listAllUserRole({ statuses: ['!D'] });
        // return () => {
        //     props.resetAll();
        // };
    }, []);

    const [rePrintStaffID, setRePrintStaffID] = React.useState(() => {
        return false;
    });

    const [pdfPreview, setpdfPreview] = React.useState(() => {
        return false;
    });



    const handleUpdate = (userId) => {
        let uaObj = props.uaInfo.uaList.find(item => item.userId === userId);
        let uaIsSystemAdmin = uaObj.isAdmin === 1;
        let uaIsServiceAdmin = uaObj.isSvcAdmin === 1;
        let uaIsClinicalAdmin = uaObj.isSiteAdmin === 1;
        if (isServiceAdminSetting()) {
            if (uaIsSystemAdmin) {
                props.openCommonMessage({
                    msgCode: '110367'
                });
                return;
            }
        } else if (isClinicalAdminSetting()) {
            if (uaIsSystemAdmin || uaIsServiceAdmin) {
                props.openCommonMessage({
                    msgCode: '110367'
                });
                return;
            }
        } else if ((!props.isSystemAdmin && !props.isClinicalAdmin && !props.isServiceAdmin)) {
            if (uaIsSystemAdmin || uaIsServiceAdmin || uaIsClinicalAdmin) {
                props.openCommonMessage({
                    msgCode: '110367'
                });
                return;
            }
        }
        props.auditAction(AlsDesc.UPDATE);
        props.getUserInfoById(userId);
    };

    const handleCreate = () => {
        let newSvcList = AdminUtil.initUserServiceList(loginUser, serviceCd);
        let newSiteList = AdminUtil.initUserSiteList(loginUser);
        props.auditAction(AlsDesc.CREATE, null, null, false, 'user');
        props.updateState({
            uaGeneral: {
                ...uaGeneral,
                userInfo: {
                    ...uaGeneral.userInfo,
                    status: Enum.COMMON_STATUS_ACTIVE,
                    efftDate: moment(),
                    userExpiryDate: moment().add(10, 'years')
                },
                uaServiceList: newSvcList
            },
            uaClinics: {
                ...uaClinics,
                uaClinicList: newSiteList
            },
            pageStatus: PAGE_STATUS.ADDING
        });
    };

    const handleGetUserList = () => {

        let requestParams = {};
        if (props.isSystemAdmin) {
            requestParams = {};
        } else if (isServiceAdminSetting()) {
            requestParams = {
                svcCds: [props.serviceCd]
            };
        } else if (isClinicalAdminSetting()) {
            requestParams = {
                svcCds: [props.serviceCd],
                siteIds: [props.siteId]
            };
        } else {
            // general user
            requestParams = {
                svcCds: [props.serviceCd],
                siteIds: [props.siteId],
                loginNames: [props.loginUser.loginName]
            };
        }
        props.getUserList(requestParams);
    };

    const handleDelete = () => {
        props.auditAction(AlsDesc.DELETE, null, null, false, 'user');
        props.openCommonMessage({
            msgCode: '110601',
            btnActions: {
                btn1Click: () => {
                    let params = {
                        userId: props.uaInfo.currentSelectedUserId,
                        version: props.uaInfo.currentSelectedUserVersion
                    };
                    props.auditAction('Confirm Delete User');
                    props.deleteUser(params, () => {
                        handleGetUserList();
                    });
                },
                btn2Click: () => {
                    props.auditAction('Cancel Delete User', null, null, false, 'user');
                }
            }
        });

    };

    const handleChangePasscode = (userId) => {
        props.auditAction('Click Change Passcode', null, null, false, 'user');
        props.getUserPasscode(userId, (data) => {
            props.updateState({ changePasscodeDialogInfo: { userName: data.loginName, open: true, passCode: '', rePassCode: '', version: data.version, isAdmin: data.isAdmin } });
        });

    };

    const handleSubmitChangePasscode = () => {
        let parmas = {
            loginName: changePasscodeDialogInfo.userName,
            newPasscode: changePasscodeDialogInfo.passCode,
            isAdmin: 'true',
            version: changePasscodeDialogInfo.version
        };
        props.submitChangePasscode(parmas, () => {
            props.updateState({ changePasscodeDialogInfo: { userName: '', open: false, passCode: '', rePassCode: '', version: '', isAdmin: '' } });
        });
    };

    const handlePrintStaffID = () => {
        props.auditAction('Click Reprint Staff ID Button', null, null, false, 'user');
        setRePrintStaffID(true);
    };

    const closeReprintDialog = () => {
        setRePrintStaffID(false);
    };

    const closePreviewDialog = () => {
        setpdfPreview(false);
    };

    //CIMST-2502 Remove [create] button in UAM
    const isShowCreateBtnParamObj = getTopPriorityOfSiteParams(clinicConfig, serviceCd, siteId, 'IS_SHOW_UAM_CREATE_BTN');
    const isShowCreateBtn = isShowCreateBtnParamObj && isShowCreateBtnParamObj.paramValue ? parseInt(isShowCreateBtnParamObj.paramValue) === 1 : false;
    const isPrintStaffIdParamObj = getTopPriorityOfSiteParams(clinicConfig, serviceCd, siteId, Enum.CLINIC_CONFIGNAME.IS_PRINT_STAFF_ID);
    const hasPrintStaffIdRight = isPrintStaffIdParamObj.configValue || '0';
    return (
        <Grid container>
            <Grid item container justify="space-between">
                <Grid item xs={12} style={{ textAlign: 'end' }}>
                    <CIMSButton
                        id="uam_createUser"
                        onClick={handleCreate}
                        display={isShowCreateBtn} //CIMST-2502 Remove [create] button in UAM
                        disabled={!props.isSystemAdmin && !props.isServiceAdmin}
                    >Create</CIMSButton>
                    <CIMSButton
                        id="uam_updateUser"
                        disabled={!props.uaInfo.currentSelectedUserId}
                        onClick={() => { handleUpdate(props.uaInfo.currentSelectedUserId); }}
                    >Update</CIMSButton>
                    <CIMSButton
                        id="uam_deleteUser"
                        disabled={!props.uaInfo.currentSelectedUserId || !props.isSystemAdmin}
                        onClick={() => { handleDelete(); }}
                    >Delete</CIMSButton>
                    {
                        hasPrintStaffIdRight === '1' && (props.isSystemAdmin || props.isServiceAdmin || props.isClinicalAdmin) ?
                            <CIMSButton
                                id={'uam_printStaffID'}
                                children={'Print CIMS staff ID'}
                                disabled={props.uaInfo.currentSelectedUserId === 0}
                                onClick={handlePrintStaffID}
                            />
                            : null
                    }
                    {props.isSystemAdmin || props.isServiceAdmin || props.isClinicalAdmin ?
                        <CIMSButton
                            id="uam_changePasscode"
                            disabled={!props.uaInfo.currentSelectedUserId}
                            onClick={() => { handleChangePasscode(props.uaInfo.currentSelectedUserId); }}
                        >Change Passcode</CIMSButton>
                        : null
                    }
                </Grid>
            </Grid>
            <Grid item container style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }} >
                {/* ag-grid */}
                <CIMSDataGrid
                    ref={refGrid}
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '75vh',
                        display: 'block'
                    }}
                    gridOptions={{
                        columnDefs: [
                            { headerName: '', colId: 'index', minWidth: 60, cellRenderer: 'orderNumRender', lockPinned: true, sortable: false, filter: false },
                            { headerName: 'Login Name', field: 'loginName', minWidth: 150 },
                            { headerName: 'Salutation', field: 'salutation', minWidth: 120 },
                            { headerName: 'Surname', field: 'engSurname', minWidth: 150 },
                            { headerName: 'Given Name', field: 'engGivenName', minWidth: 150 },
                            { headerName: 'Chinese Name', field: 'chiFullName', minWidth: 160 },
                            { headerName: 'Account Status', field: 'status', minWidth: 180 },
                            { headerName: 'Email', field: 'email', minWidth: 150 },
                            { headerName: 'Position', field: 'position', minWidth: 150 },
                            { headerName: 'Services', field: 'services', minWidth: 150, width: 200 },
                            { headerName: 'Sites', field: 'sites', minWidth: 150, width: 200 },
                            { headerName: 'Roles', field: 'roles', minWidth: 150, width: 200 },
                            { headerName: 'ECS User ID', field: 'ecsUserId', minWidth: 150 }
                        ],
                        rowData: props.uaInfo.uaList,
                        suppressRowClickSelection: false,
                        rowSelection: 'single',
                        onRowClicked: params => {
                            if (params.data.userId && (props.uaInfo.currentSelectedUserId !== params.data.userId)) {
                                props.updateState({
                                    uaInfo: {
                                        ...props.uaInfo,
                                        currentSelectedUserId: params.data.userId,
                                        curSelectedEngSurname: params.data.engSurname,
                                        curSelectedEngGivName: params.data.engGivenName,
                                        curSelectedChiName: params.data.chiFullName || '',
                                        currentSelectedUserVersion: params.data.version
                                    }
                                });
                            } else {
                                props.updateState({
                                    uaInfo: {
                                        ...props.uaInfo,
                                        currentSelectedUserId: 0,
                                        curSelectedEngSurname: '',
                                        curSelectedEngGivName: '',
                                        curSelectedChiName: '',
                                        currentSelectedUserVersion: ''
                                    }
                                });
                            }
                        },
                        getRowNodeId: data => data.userId,
                        onRowDoubleClicked: params => {
                            let uaIsSystemAdmin = params.data.isAdmin === 1;
                            let uaIsServiceAdminObj = params.data.uamMapUserSvcDtos && params.data.uamMapUserSvcDtos.find(item => item.svcCd === props.serviceCd && item.isAdmin === 1);
                            let uaIsServiceAdmin = !uaIsSystemAdmin && uaIsServiceAdminObj !== undefined;
                            let uaIsClinicalAdminObj = params.data.uamMapUserSiteDtos && params.data.uamMapUserSiteDtos.find(item => item.siteId === props.siteId && item.isAdmin === 1);
                            let uaIsClinicalAdmin = !uaIsSystemAdmin && !uaIsServiceAdmin && uaIsClinicalAdminObj !== undefined;
                            if (isServiceAdminSetting()) {
                                if (uaIsSystemAdmin) {
                                    props.openCommonMessage({
                                        msgCode: '110367'
                                    });
                                    return;
                                }
                            } else if (isClinicalAdminSetting()) {
                                if (uaIsSystemAdmin || uaIsServiceAdmin) {
                                    props.openCommonMessage({
                                        msgCode: '110367'
                                    });
                                    return;
                                }
                            } else if ((!props.isSystemAdmin && !props.isClinicalAdmin && !props.isServiceAdmin)) {
                                if (uaIsSystemAdmin || uaIsServiceAdmin || uaIsClinicalAdmin) {
                                    props.openCommonMessage({
                                        msgCode: '110367'
                                    });
                                    return;
                                }
                            }
                            handleUpdate(params.data.userId);
                        },
                        headerHeight: 50,
                        getRowHeight: params => 50,
                        onGridReady: params => {
                            if (params) {
                                if (params.api.getDisplayedRowCount() === 0)
                                    params.api.showLoadingOverlay();
                                const colIds = params.columnApi.getAllDisplayedColumns().map(col => col.getColId());
                                params.columnApi.autoSizeColumns(colIds);
                                handleGetUserList();
                            }
                        },
                        frameworkComponents: {
                            orderNumRender: OrderNumRender
                        },
                        tabToNextCell: (params) => { },
                        suppressColumnVirtualisation: true,
                        ensureDomOrder: true,
                        postSort: rowNodes => forceRefreshCells(rowNodes, ['index']),
                        onFilterChanged: (rowNodes) => {
                            refGrid.current&&refGrid.current.grid && refGrid.current.grid.api.deselectAll();
                            //rowNodes.api.deselectAll();
                            props.updateState({
                                uaInfo: {
                                    ...props.uaInfo,
                                    currentSelectedUserId: 0,
                                    curSelectedEngSurname: '',
                                    curSelectedEngGivName: '',
                                    curSelectedChiName: '',
                                    currentSelectedUserVersion: ''
                                }
                            });
                        }
                    }}
                >
                </CIMSDataGrid>
            </Grid>
            {changePasscodeDialogInfo.open ?
                <ChangePasscodeDialog handleSubmitChangePasscode={handleSubmitChangePasscode}>

                </ChangePasscodeDialog> :
                null}
            <CIMSPromptDialog
                id={'uam_printStaffIDDailog'}
                open={rePrintStaffID}
                dialogTitle={'Print CIMS Staff ID'}
                classes={{
                    paper: props.classes.paper
                }}
                dialogContentText={
                    <Grid container spacing={2} style={{ marginTop: 8 }}>
                        <Grid item xs={12}>The CIMS Staff ID has been issued.</Grid>
                        <Grid item xs={12}>The old CIMS Staff ID will be invalid immediately after generation of a new CIMS Staff ID.</Grid>
                        <Grid item xs={12}>Are you sure to generate new CIMS Staff ID?</Grid>
                        <Grid item xs={12}></Grid>
                        <Grid item xs={12}>Staff English Name :{getFullName(props.uaInfo.curSelectedEngSurname, props.uaInfo.curSelectedEngGivName)}</Grid>
                        <Grid item xs={12}>Staff Chinese Name : {props.uaInfo.curSelectedChiName}</Grid>
                        <Grid container item justify={'center'} style={{ marginTop: 2 }}>
                            <CIMSButton
                                id={'uam_confrimReprintBtn'}
                                children={'Yes'}
                                onClick={() => {
                                    props.auditAction('Confirm Reprint Staff ID');
                                    props.genAccountStaffId(props.uaInfo.currentSelectedUserId, props.loginUser.loginName, () => { setpdfPreview(true); });
                                    closeReprintDialog();
                                }}
                            />
                            <CIMSButton
                                id={'uam_cancelReprintBtn'}
                                children={'Cancel'}
                                onClick={() => {
                                    props.auditAction('Cancel Reprint Staff ID', null, null, false, 'user');
                                    closeReprintDialog();
                                }}
                            />
                        </Grid>
                    </Grid>
                }
            />
            <CIMSPromptDialog
                id={'uam_reviewStaffIDDailog'}
                open={pdfPreview}
                dialogTitle={'Preview Staff Card'}
                classes={{
                    paper: props.classes.paper
                }}
                dialogContentText={
                    <CIMSPdfViewer
                        id={'uam_staffID_pdfViewer'}
                        position={'vertical'}
                        previewData={staffIDPreviewData}
                    />
                }
                buttonConfig={
                    [
                        {
                            id: 'uam_previewStaffIDDailogReprintBtn',
                            name: 'Print',
                            onClick: () => {
                                props.auditAction('Reprint Staff ID');
                                //this.onFileUpload();
                                //props.genAccountStaffId(props.uaInfo.currentSelectedUserId, () => { setpdfPreview(true); });
                                print({ base64: staffIDPreviewData });
                                closePreviewDialog();
                            }
                        },
                        {
                            id: 'uam_previewStaffIDDailogCancelBtn',
                            name: 'Cancel',
                            onClick: () => {
                                props.auditAction('Cancel Preview Staff ID', null, null, false, 'user');
                                closePreviewDialog();
                            }
                        }
                    ]
                }
            />
        </Grid >
    );
};

const styles = theme => ({
    paper: {
        width: '45%'
    }
});

const mapState = (state) => {
    return {
        userInfo: state.userAccount.uaGeneral.userInfo,
        uaGeneral: state.userAccount.uaGeneral,
        uaClinics: state.userAccount.uaClinics,
        loginUser: state.login.loginInfo.userDto,
        serviceList: state.common.serviceList,
        userServices: state.login.loginInfo.userDto.uamMapUserSvcDtos,
        uaInfo: state.userAccount.uaInfo,
        clinicList: state.common.clinicList,
        serviceCd: state.login.service.serviceCd,
        availableUserRoleList: state.userAccount.uaUserRole.availableUserRoleList,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        clinicConfig: state.common.clinicConfig,
        changePasscodeDialogInfo: state.userAccount.changePasscodeDialogInfo,
        staffIDPreviewData: state.userAccount.staffIDPreviewData
    };
};

const mapDispatch = {
    resetAll, updateState, getUserInfoById, getUserList, deleteUser,
    openCommonMessage, listAllUserRole, auditAction, submitChangePasscode, getUserPasscode,
    genAccountStaffId
};

export default connect(mapState, mapDispatch)(withStyles(styles)(UAM));
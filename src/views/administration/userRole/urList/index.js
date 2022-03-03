import React from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import withStyles from '@material-ui/styles/withStyles';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import {
    resetAll,
    updateState,
    getUserRoles,
    editUserRoleById,
    createUserRole,
    deleteUserRoles
} from '../../../../store/actions/administration/userRole';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import Enum from '../../../../enums/enum';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import {forceRefreshCells} from '../../../../utilities/commonUtilities';

const URList = (props) => {
    const { classes, urList, selected, userRoles, isSystemAdmin, isServiceAdmin, isClinicalAdmin } = props;
    let gridRef = React.createRef();

    React.useEffect(() => {
        props.resetAll();
    }, []);

    const handleUpdate = (dataId) => {
        if (dataId) {
            props.auditAction('Update User Role', null, null, false);
            props.editUserRoleById(dataId);
        }
    };

    const handleCreate = () => {
        props.auditAction(AlsDesc.CREATE, null, null, false, 'user');
        props.createUserRole();
    };

    const onGridReady = () => {
        props.getUserRoles();
    };

    const onSelectionChanged = (params) => {
        if (params) {
            const selectedRows = params.api.getSelectedRows();
            props.updateState({
                urList: {
                    ...urList,
                    selected: selectedRows && selectedRows.map(item => item.roleId)
                }
            });
        }
    };

    const onRowDoubleClicked = (params) => {
        // if ((!isSystemAdmin && isClinicalAdmin && !isServiceAdmin) || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)) {
        //     //URM: Clinical Admin and General User. Disable Create/Update/Delete roles (view the role list only)
        // } else if (params) {
            handleUpdate(params.data.roleId);
        // }
    };

    const handleDelete = () => {
        if (selected && selected.length > 0) {
            props.auditAction(AlsDesc.DELETE, null, null, false, 'user');
            const selectedRoles = userRoles.filter(item => selected.includes(item.roleId));
            if (selectedRoles.findIndex(item => item.isAssignUser === 'Y') !== -1) {
                props.openCommonMessage({ msgCode: '110363' });
                return;
            }
            if (selectedRoles.findIndex(item => item.isBaseRole === 1) !== -1) {
                props.openCommonMessage({ msgCode: '110364' });
                return;
            }

            props.openCommonMessage({
                msgCode: '110362',
                btnActions: {
                    btn1Click: () => {
                        props.auditAction('Confirm Delete User Role');
                        props.deleteUserRoles(selected);
                    },
                    btn2Click: () => {
                        props.auditAction('Cancel Delete User Role', null, null, false, 'user');
                    }
                }
            });
        }
    };

    let columnDefs = [
        {
            headerName: '',
            colId:'index',
            valueGetter: params => params.node.rowIndex + 1,
            minWidth: 60,
            maxWidth: 60,
            pinned: 'left',
            filter: false
        },
        {
            headerName: '',
            field: '',
            minWidth: 50,
            maxWidth: 50,
            headerCheckboxSelection: true,
            checkboxSelection: true
        },
        {
            headerName: 'Service',
            field: 'svcCd',
            minWidth: 150,
            valueFormatter: params => params.value ? params.value : 'All Service'
        },
        { headerName: 'User Role Name', field: 'roleName', minWidth: 200 },
        { headerName: 'User Role Description', field: 'roleDesc', minWidth: 150 },
        {
            headerName: 'With Assigned User(s)',
            field: 'isAssignUser',
            minWidth: 180,
            valueFormatter: params => params.value === 'Y' ? 'Y' : ''
        },
        {
            headerName: 'Status',
            field: 'status',
            minWidth: 150,
            valueFormatter: params => {
                if (params.value === Enum.COMMON_STATUS_ACTIVE) {
                    return 'Active';
                } else if (params.value === Enum.COMMON_STATUS_INACTIVE) {
                    return 'Inactive';
                }
            }
        }
    ];

    const tabToGrid = (e, name) => {
        if (name === 'create' && selected && selected.length > 0) {
            return;
        }
        if (e.keyCode !== 9) {
            return;
        }
        e.preventDefault();
        const grid = gridRef.current.grid;
        grid.api.ensureIndexVisible(0);
        let firstCol = grid.columnApi.getAllDisplayedColumns()[0];
        grid.api.ensureColumnVisible(firstCol);
        grid.api.setFocusedCell(0, firstCol);
    };

    const selRoles = userRoles.filter(item => selected.includes(item.roleId));
    const containsBaseRole = selRoles.findIndex(item => item.isBaseRole === 1) > -1;
    const disableBtn = !isSystemAdmin && containsBaseRole;

    return (
        <Grid container>
            <Grid item container justify="space-between">
                <Grid item xs={12} style={{ textAlign: 'end' }}>
                    <CIMSButton
                        id="enctList_createBtn"
                        onClick={handleCreate}
                        onKeyDown={e => tabToGrid(e, 'create')}
                        disabled={(!isSystemAdmin && isClinicalAdmin && !isServiceAdmin) || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                    >Create</CIMSButton>
                    <CIMSButton
                        id="enctList_updateBtn"
                        disabled={(selected && selected.length === 1 ? false : true)}
                        onClick={() => handleUpdate(selected[0])}
                    >Update</CIMSButton>
                    <CIMSButton
                        id="enctList_deleteBtn"
                        disabled={(selected && selected.length > 0 ? false : true) || (!isSystemAdmin && isClinicalAdmin && !isServiceAdmin) || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin) || disableBtn}
                        onClick={handleDelete}
                        onKeyDown={e => tabToGrid(e, 'delete')}
                    >Delete</CIMSButton>
                </Grid>
            </Grid>
            <Grid item container className={classes.gridRoot}>
                <CIMSDataGrid
                    ref={gridRef}
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '75vh',
                        display: 'block'
                    }}
                    gridOptions={{
                        headerHeight: 50,
                        columnDefs: columnDefs,
                        rowData: userRoles,
                        suppressRowClickSelection: false,
                        getRowHeight: () => 50,
                        getRowNodeId: data => data.roleId,
                        onGridReady: onGridReady,
                        onRowClicked: () => { },
                        onRowDoubleClicked: onRowDoubleClicked,
                        onSelectionChanged: onSelectionChanged,
                        suppressCellSelection: false,
                        postSort: rowNodes => forceRefreshCells(rowNodes,['index'])
                    }}
                >
                </CIMSDataGrid>
            </Grid>
        </Grid>
    );
};

const styles = theme => ({
    gridRoot: {
        justifyContent: 'center',
        marginTop: theme.spacing(1)
    }
});

const mapState = (state) => {
    return {
        urList: state.userRole.urList,
        selected: state.userRole.urList.selected,
        userRoles: state.userRole.urList.userRoles,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin
    };
};

const mapDispatch = {
    resetAll,
    updateState,
    getUserRoles,
    editUserRoleById,
    createUserRole,
    deleteUserRoles,
    openCommonMessage,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(URList));
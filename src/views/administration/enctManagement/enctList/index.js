import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import withStyles from '@material-ui/styles/withStyles';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { resetAll, updateState, getEnctList, getEnctById, createEnct, deleteEnct } from '../../../../store/actions/administration/enctManagement';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import Enum from '../../../../enums/enum';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import { isClinicalAdminSetting, isServiceAdminSetting } from '../../../../utilities/userUtilities';
import {forceRefreshCells} from '../../../../utilities/commonUtilities';

const sortedList = (list, isSystemAdmin, isServiceAdmin, isClinicalAdmin, clinic, serviceCd) => {
    let _list = _.cloneDeep(list);
    if (isSystemAdmin || isServiceAdmin) {
        _list = _list.filter(item => item.svcCd === serviceCd);
    } else if (isClinicalAdminSetting()) {
        _list = _list.filter(item => item.siteId === clinic.siteId || item.siteEngName === undefined);
    } else {
        _list = _list.filter(item => item.siteId === clinic.siteId || item.siteEngName === undefined);
    }
    return _list.sort((a, b) => {
        if ((a.siteEngName || '').localeCompare(b.siteEngName || '') === 0) {
            return a.updateDtm && b.updateDtm && moment(a.updateDtm).isAfter(moment(b.updateDtm)) ? -1 : 1;
        } else {
            return (a.siteEngName || '').localeCompare((b.siteEngName || ''));
        }
    });
};

const EnctList = (props) => {
    const { classes, enctList, isSystemAdmin, isServiceAdmin, isClinicalAdmin, clinic, serviceCd, viewOnly } = props;
    const { selected, encounterTypelist } = enctList;
    let gridRef = React.createRef();

    React.useEffect(() => {
        props.resetAll();
    }, []);

    const handleUpdate = (encntrTypeId) => {
        if (encntrTypeId) {
            props.auditAction('Open Update Encounter Dialog', null, null, false);
            props.getEnctById(encntrTypeId);
        }
    };

    const handleCreate = () => {
        props.auditAction(AlsDesc.CREATE, null, null, false, 'cmn');
        props.createEnct();
    };

    const onGridReady = () => {
        props.getEnctList();
    };

    const onSelectionChanged = (params) => {

        if (params) {
            const selectedRows = params.api.getSelectedRows();
            props.updateState({
                enctList: {
                    ...enctList,
                    selected: selectedRows && selectedRows.map(item => item.encntrTypeId)
                }
            });
        }
    };

    const onRowDoubleClicked = (params) => {
        if (params) {
            handleUpdate(params.data.encntrTypeId);
        }
    };

    const handleDelete = () => {
        props.auditAction(AlsDesc.DELETE, null, null, false, 'cmn');
        if (selected && selected.length > 0) {
            const selectedDtos = encounterTypelist.filter(item => selected.includes(item.encntrTypeId));
            const ind = selectedDtos.findIndex(item => item.roomDtoList && item.roomDtoList.length > 0);
            if (ind === -1) {
                props.openCommonMessage({
                    msgCode: '110346',
                    btnActions: {
                        btn1Click: () => {
                            props.auditAction('Confirm Delete Encounter');
                            props.deleteEnct(selected);
                        },
                        btn2Click: () => {
                            props.auditAction('Cancel Delete Encounter', null, null, false, 'cmn');
                        }
                    }
                });
            } else {
                props.openCommonMessage({ msgCode: '110355' });
            }
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
            headerName: 'Site English Name',
            field: 'siteEngName',
            minWidth: 200,
            valueFormatter: params => params.value ? params.value : '<For All Clinic>'
        },
        { headerName: 'Encounter Type Code', field: 'encntrTypeCd', minWidth: 150 },
        { headerName: 'Encounter Type Desc.', field: 'encntrTypeDesc', minWidth: 180 },
        { headerName: 'Recommended Duration(Min)', field: 'drtn', minWidth: 150 },
        { headerName: 'Appt. Reminder Day', field: 'apptRmndDay', minWidth: 150 },
        {
            headerName: 'Updated On',
            field: 'updateDtm',
            minWidth: 130,
            valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE)
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

    const isViewOnly = (selList) => {
        let isViewOnly = false;
        if (isClinicalAdminSetting()) {
            isViewOnly = selList.findIndex(item => item.siteId === undefined) > -1;
        }
        else {
            if (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin) {
                isViewOnly = true;
            }
        }
        return isViewOnly;
    };

    const sortList = sortedList(encounterTypelist, isSystemAdmin, isServiceAdminSetting(), isClinicalAdminSetting(), clinic, serviceCd);
    const selEnct = sortList.filter(item => selected.includes(item.encntrTypeId));
    // const viewOnly = changingInfo ? (changingInfo.siteId === -1 && isClinicalAdmin) ||
    //     (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)
    //     : true;
    const canDelete = isViewOnly(selEnct);

    return (
        <Grid container>
            <Grid item container justify="space-between">
                <Grid item xs={12} style={{ textAlign: 'end' }}>
                    <CIMSButton
                        id="enctList_createBtn"
                        onClick={handleCreate}
                        onKeyDown={e => tabToGrid(e, 'create')}
                        disabled={(!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                    >Create</CIMSButton>
                    <CIMSButton
                        id="enctList_updateBtn"
                        disabled={selected && selected.length === 1 ? false : true}
                        onClick={() => handleUpdate(selected[0])}
                    >Update</CIMSButton>
                    <CIMSButton
                        id="enctList_deleteBtn"
                        disabled={selected && selected.length > 0 ? canDelete : true}
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
                        rowData: sortList,
                        suppressRowClickSelection: false,
                        getRowHeight: () => 50,
                        getRowNodeId: data => data.encntrTypeId,
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
        </Grid >
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
        enctList: state.enctManagement.enctList,
        loginUser: state.login.loginInfo.userDto,
        serviceList: state.common.serviceList,
        userServices: state.login.loginInfo.userDto.uamMapUserSvcDtos,
        siteInfo: state.common.siteInfo,
        serviceCd: state.login.service.serviceCd,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        clinic: state.login.clinic
    };
};

const mapDispatch = {
    resetAll,
    updateState,
    getEnctList,
    getEnctById,
    createEnct,
    deleteEnct,
    openCommonMessage,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(EnctList));
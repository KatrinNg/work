import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import moment from 'moment';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import Enum from '../../../../enums/enum';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import { PAGE_STATUS } from '../../../../enums/administration/roomManagement/roomManagementEnum';
import { updateState, listRoom, getRoomById, deleteRoom } from '../../../../store/actions/administration/roomManagement/roomManagementActions';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { deleteTabs } from '../../../../store/actions/mainFrame/mainFrameAction';
import { initNewRoom } from '../../../../utilities/administrationUtilities';
import { isActiveEnctType } from '../../../../utilities/enctrAndRoomUtil';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import {forceRefreshCells} from '../../../../utilities/commonUtilities';

const styles = (theme) => ({
    gridRoot: {
        justifyContent: 'center',
        marginTop: theme.spacing(1)
    }
});

class RoomList extends React.Component {
    componentDidMount() {
        this.props.listRoom();
    }

    shouldComponentUpdate(nextP){
        if(nextP.tabsActiveKey!==this.props.tabsActiveKey){
            if(nextP.tabsActiveKey===AccessRightEnum.roomManagemnet){
                this.props.listRoom();
                return false;
            }
        }
        return true;
    }

    handleCreate = () => {
        this.props.auditAction(AlsDesc.CREATE, null, null, false, 'cmn');
        let newRoomData = initNewRoom();
        newRoomData.efftDate = moment();
        let generalData = _.cloneDeep(this.props.roomGeneralData);
        generalData.changingInfo = newRoomData;
        this.props.updateState({
            pageStatus: PAGE_STATUS.ADDING,
            roomGeneralData: generalData
        });
    };
    handleUpdate = (rmId) => {
        // this.props.updateState({ pageStatus: PAGE_STATUS.EDITING });
        this.props.auditAction('Update Room', null, null, false);
        this.props.getRoomById(rmId);
    };
    handleUpdateEnct = (rmId) => {
        this.props.updateState({ activeStep: 1 }).then(() => {
            this.handleUpdate(rmId);
        });
    };

    handleDelete = () => {
        const { selectedRoom, rooms } = this.props;
        this.props.auditAction(AlsDesc.DELETE, null, null, false, 'cmn');
        if (selectedRoom.length > 0) {
            this.props.openCommonMessage({
                msgCode: '110067',
                btnActions: {
                    btn1Click: () => {
                        const selectedDtos = rooms.filter(item => selectedRoom.includes(item.rmId));
                        // const ind = selectedDtos.findIndex(item => item.encntrTypeList && item.encntrTypeList.length > 0); if (ind === -1) {
                        this.props.auditAction('Confirm Delete Room', null, null, false);
                        this.props.deleteRoom(selectedDtos);
                        // } else {
                        //     this.props.openCommonMessage({ msgCode: '111705' });
                        // }
                    },
                    btn2Click: () => {
                        this.props.auditAction('Cancel Delete Room', null, null, false, 'cmn');
                    }
                }
            });

        }

    };

    handleClose = () => {
        this.props.auditAction(AlsDesc.CLOSE, null, null, false, 'cmn');
        this.props.deleteTabs(AccessRightEnum.roomManagemnet);
    };

    tabToGrid = (e, name) => {
        if (name === 'create') {
            return;
        }
        if (e.keyCode !== 9) {
            return;
        }
        e.preventDefault();
        const grid = this.gridRef.grid;
        grid.api.ensureIndexVisible(0);
        let firstCol = grid.columnApi.getAllDisplayedColumns()[0];
        grid.api.ensureColumnVisible(firstCol);
        grid.api.setFocusedCell(0, firstCol);
    }
    onGridReady = () => { };
    onRowClicked = () => { };

    onRowDoubleClicked = (params) => {
        if (params) {
            this.handleUpdate(params.data.rmId);
        }
    };

    onSelectionChanged = (params) => {
        if (params) {
            const selectedRows = params.api.getSelectedRows();
            this.props.updateState({
                selectedRoom: selectedRows && selectedRows.map(item => item.rmId)
            });
        }
    };

    getAvailRoomList = () => {
        const { rooms, clinic, isSystemAdmin, isServiceAdmin } = this.props;
        let availRooms = _.cloneDeep(rooms || []);
        if (isSystemAdmin || isServiceAdmin) {
            // system admin and service admin can access all data.
        } else {
            availRooms = availRooms.filter(item => item.siteId === clinic.siteId);
        }

        availRooms && availRooms.sort((a, b) => {
            let siteEngOrder = (a.siteEngName || '').localeCompare(b.siteEngName || '');
            if (siteEngOrder === 0) {
                let descOrder = (a.rmDesc).localeCompare(b.rmDesc);
                if (descOrder === 0) {
                    if (moment(a.updateDtm).isAfter(moment(b.updateDtm))) {
                        return 1;
                    } else if (moment(a.updateDtm).isBefore(moment(b.updateDtm))) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    return descOrder;
                }
            } else {
                return siteEngOrder;
            }
        });
        return availRooms;
    }

    render() {
        const { classes, selectedRoom, isGeneralUser } = this.props;
        let columnDefs = [{
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
            minWidth: 400,
            width: 400
            // valueFormatter: params => params.value ? params.value : '<For All Clinic>'
        },
        { headerName: 'Room Code', field: 'rmCd', minWidth: 150, width: 150 },
        { headerName: 'Room Desc.', field: 'rmDesc', minWidth: 180, width: 180 },
        {
            headerName: 'Assigned Enc. Type',
            field: '',
            minWidth: 555,
            width: 555,
            valueGetter: params => {
                let enctList = [];
                if (params.data.encntrTypeList && params.data.encntrTypeList.length > 0) {
                    params.data.encntrTypeList.forEach(enct => {
                        if (isActiveEnctType(enct)) {
                            enctList.push(enct.encntrTypeDesc);
                        }
                    });
                }
                if (enctList.length > 0) {
                    return enctList.join(', ');
                } else {
                    return '';
                }
            }
        },
        {
            headerName: 'Phone Number',
            field: '',
            minWidth: 155,
            width: 155,
            valueFormatter: params => {
                let phnStr = '';
                if (params.data.phn) {
                    phnStr = params.data.phn;
                    if (params.data.phnExt) {
                        phnStr = `${phnStr} (${params.data.phnExt})`;
                    }
                }
                return phnStr;
            }
        },
        { headerName: 'Remark', field: 'remark', minWidth: 200, width: 200 },
        {
            headerName: 'Updated On',
            field: 'updateDtm',
            minWidth: 135,
            width: 135,
            valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE)
        }];

        const roomList = this.getAvailRoomList();
        return (
            <Grid container>
                <Grid item container justify="space-between">
                    <Grid item xs={12} style={{ textAlign: 'end' }}>
                        <CIMSButton
                            id={'roomList_create_button'}
                            onClick={this.handleCreate}
                            onKeyDown={e => this.tabToGrid(e, 'create')}
                            disabled={isGeneralUser}
                        >Create</CIMSButton>
                        <CIMSButton
                            id={'roomList_update_button'}
                            disabled={selectedRoom && selectedRoom.length === 1 ? false : true}
                            onClick={() => this.handleUpdate(selectedRoom[0])}
                        >Update</CIMSButton>
                        <CIMSButton
                            id={'roomList_update_encounter_button'}
                            disabled={selectedRoom && selectedRoom.length === 1 ? false : true}
                            onClick={() => this.handleUpdateEnct(selectedRoom[0])}
                        >Encounter Type</CIMSButton>
                        <CIMSButton
                            id={'roomList_delete_button'}
                            disabled={selectedRoom && selectedRoom.length > 0 ? isGeneralUser : true}
                            onClick={this.handleDelete}
                            onKeyDown={e => this.tabToGrid(e, 'delete')}
                        >Delete</CIMSButton>
                        <CIMSButton
                            id={'roomList_close_button'}
                            onClick={this.handleClose}
                        >Close</CIMSButton>
                    </Grid>
                </Grid>
                <Grid item container className={classes.gridRoot}>
                    <CIMSDataGrid
                        ref={ref => this.gridRef = ref}
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '75vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            headerHeight: 50,
                            columnDefs: columnDefs,
                            rowData: roomList,
                            suppressRowClickSelection: false,
                            getRowHeight: () => 50,
                            getRowNodeId: data => data.rmId,
                            onGridReady: this.onGridReady,
                            onRowClicked: () => { },
                            onRowDoubleClicked: this.onRowDoubleClicked,
                            onSelectionChanged: this.onSelectionChanged,
                            suppressCellSelection: false,
                            postSort: rowNodes => forceRefreshCells(rowNodes,['index'])
                        }}
                    >
                    </CIMSDataGrid>
                </Grid>
            </Grid >
        );
    }
}

const mapState = (state) => {
    return {
        rooms: state.roomManagement.rooms,
        selectedRoom: state.roomManagement.selectedRoom,
        roomGeneralData: state.roomManagement.roomGeneralData,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        clinic: state.login.clinic,
        tabsActiveKey:state.mainFrame.tabsActiveKey
    };
};

const dispatch = {
    updateState, listRoom, getRoomById, openCommonMessage, deleteRoom, deleteTabs, auditAction
};

export default connect(mapState, dispatch)(withStyles(styles)(RoomList));


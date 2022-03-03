import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _, { constant } from 'lodash';
import { Grid, FormControlLabel, Typography } from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
import moment from 'moment';
import { resetAll, getDefaultRoomList, updateState, resetDialogInfo, deleteDefaultRoom, getDefaultRoomLogList } from '../../../store/actions/dts/patient/DtsDefaultRoomAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import DefaultRoomDialog from './components/DtsDefaultRoomDialog';
import DtsDefaultRoomViewLogDialog from './components/DtsDefaultRoomViewLogDialog';
import Enum from '../../../enums/enum';

const styles = () => ({
    root: {
        width: '100%'
    },
    mainButton: {
        width: '100%'
    },
    container: {
        padding: '10px 0px'
    }
});

class DefaultRoom extends Component {
    constructor(props) {
        super(props);
        let columnDefs = [
            {
                headerName: '',
                field: '',
                colId: '',
                minWidth: 50,
                maxWidth: 50,
                lockPinned: true,
                sortable: false,
                filter: false,
                lockVisible: true,
                checkboxSelection: true
            },
            {
                headerName: 'Discipline',
                field: 'specialtyId',
                colId: 'specialtyId',
                width: 240,
                lockVisible: true,
                valueGetter: params => {
                    let specialtyObj = this.props.specialties.find(item => item.sspecId === params.data.specialtyId);
                    return specialtyObj && specialtyObj.sspecName;
                },
                tooltipValueGetter: params => params.value
            },
            {
                headerName: 'Location',
                field: 'roomId',
                colId: 'roomId',
                width: 930,
                lockVisible: true,
                valueGetter: params => {
                    let roomObj = this.props.rooms.find(item => item.rmId === params.data.roomId);
                    let clinicObj = this.props.clinicList.find(item => item.siteId === roomObj.siteId);
                    return roomObj && clinicObj && roomObj.rmCd + ', ' + clinicObj.siteName;
                },
                tooltipValueGetter: params => params.value
            },
            {
                headerName: 'Referral',
                field: 'isReferral',
                colId: 'isReferral',
                width: 120,
                lockVisible: true,
                valueGetter: params => {
                    return params.data.isReferral === 1 ? 'Yes' : 'No';
                },
                tooltipValueGetter: params => params.value
            },
            {
                headerName: 'Discharged',
                field: 'isDischarged',
                colId: 'isDischarged',
                width: 140,
                lockVisible: true,
                valueGetter: params => {
                    return params.data.isDischarged === 1 ? 'Yes' : 'No';
                },
                tooltipValueGetter: params => params.value
            },
            {
                headerName: 'Update On',
                field: 'updateDtm',
                colId: 'updateDtm',
                width: 150,
                lockVisible: true,
                valueGetter: params => {
                    return moment(params.data.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
                },
                tooltipValueGetter: params => params.value
            },
            {
                headerName: 'Update By',
                field: 'updateBy',
                colId: 'updateBy',
                width: 250,
                lockVisible: true,
                tooltipValueGetter: params => params.value
            }
        ];

        this.state = {
            columnDefs: columnDefs
        };
    }

    componentDidMount() {
        this.props.ensureDidMount();
        this.props.resetAll();
        // console.info('############################################## componentDidMount0: ' + this.props.activeOnly);
        // this.props.updateState({ currentSelectedId: '', dialogOpen: false, dialogViewLogOpen: false });
        this.props.getDefaultRoomList(this.props.patientInfo.patientKey, true);
        // console.info('############################################## componentDidMount1: ' + this.props.activeOnly);
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    handleCreate = () => {
        // console.info('############################################## handleCreate0: ' + this.props.activeOnly);
        this.props.updateState({ dialogOpen: true, dialogName: 'CREATE' });
        // console.info('############################################## handleCreate1: ' + this.props.activeOnly);
        this.deselectAllFnc();
        // console.info('############################################## handleCreate2: ' + this.props.activeOnly);
    };

    handleUpdate = () => {
        this.props.updateState({ dialogOpen: true, dialogName: 'UPDATE' });
    };

    handleDelete = () => {
        this.props.deleteDefaultRoom(this.props.currentSelectedId, () => {
            this.props.getDefaultRoomList(this.props.patientInfo.patientKey, this.props.activeOnly);
            // console.info('############################################## handleDelete1: ' + this.props.activeOnly);
            this.deselectAllFnc();
            // console.info('############################################## handleDelete2: ' + this.props.activeOnly);
        });
    };

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    deselectAllFnc = () => {
        // console.info('############################################## deselectAllFnc1: ' + this.props.activeOnly);
        this.gridApi.deselectAll();
        this.props.updateState({ currentSelectedId: '' });
        // console.info('############################################## deselectAllFnc2: ' + this.props.activeOnly);
    };

    handleRowClick = (data, isDoubleClicked = false) => {
        const specialties = this.props.specialties;
        if ((data && data.defaultRoomId && this.props.currentSelectedId !== data.defaultRoomId) || isDoubleClicked) {
            // console.info('############################################## onSelectionChanged: ' + JSON.stringify(data));
            const selectedSpecialtyCode = specialties.find(specialty => specialty.sspecId === data.specialtyId);

            let dialogInfo = {
                defaultRoomId: data.defaultRoomId,
                specialtyId: data.specialtyId,
                roomId: data.roomId,
                isReferral: data.isReferral,
                isDischarged: data.isDischarged,
                version: data.version,
                patientKey: data.patientKey,
                isReferralDisabled: selectedSpecialtyCode && selectedSpecialtyCode.sspecCd === 'GD' ? false : true,
                isDischargedDisabled: false,
                status: data.status,
                originalRecordId: data.originalRecordId
            };

            this.props.updateState({
                currentSelectedId: data.defaultRoomId,
                dialogInfo: dialogInfo
            });
            if (isDoubleClicked) {
                const selectedRow = this.gridApi.getRowNode(data.defaultRoomId);
                if (selectedRow) {
                    selectedRow.setSelected(true);
                }
                this.handleUpdate();
            }
        } else {
            // console.info('############################################## handleRowClick1: ' + this.props.activeOnly);
            this.props.resetDialogInfo();
            this.props.updateState({ currentSelectedId: '' });
            // console.info('############################################## handleRowClick2: ' + this.props.activeOnly);
        }
    };

    handleShowDeleted = e => {
        this.props.updateState({ activeOnly: !e.target.checked });
        this.props.getDefaultRoomList(this.props.patientInfo.patientKey, !e.target.checked);
        // console.info('############################################## handleShowDeleted: ' + this.props.activeOnly);
    };

    handleViewLog = () => {
        this.props.getDefaultRoomLogList(this.props.dialogInfo.originalRecordId);
        this.props.updateState({ dialogViewLogOpen: true, dialogViewLogName: 'VIEW LOG' });
        // console.info('############################################## handleViewLog: ' + this.props.activeOnly);
    };

    render() {
        const { classes, defaultRoomList } = this.props;
        const { columnDefs } = this.state;

        return (
            <Grid className={classes.root}>
                <Grid container className={classes.container}>
                    <Grid item container xs={12} alignItems="center" justify="flex-end" spacing={2}>
                        <Grid item>
                            <FormControlLabel
                                className={classes.formlabelRoot}
                                control={
                                    <CIMSCheckBox id={'defaultRoom_show_deleted'} className={classes.checkPadding} color="primary" onChange={e => this.handleShowDeleted(e)} />
                                }
                                label={<Typography>Show Deleted</Typography>}
                            />
                        </Grid>
                        <Grid item>
                            <CIMSButton id={'defaultRoom_create'} className={classes.mainButton} onClick={this.handleCreate}>
                                Create
                            </CIMSButton>
                        </Grid>
                        <Grid item>
                            <CIMSButton
                                id={'defaultRoom_update'}
                                className={classes.mainButton}
                                disabled={!(this.props.currentSelectedId && this.props.dialogInfo.status === 'C')}
                                onClick={this.handleUpdate}>
                                Update
                            </CIMSButton>
                        </Grid>
                        <Grid item>
                            <CIMSButton
                                id={'defaultRoom_delete'}
                                className={classes.mainButton}
                                disabled={!(this.props.currentSelectedId && this.props.dialogInfo.status === 'C')}
                                onClick={this.handleDelete}>
                                Delete
                            </CIMSButton>
                        </Grid>
                        <Grid item>
                            <CIMSButton id={'defaultRoom_view_log'} className={classes.mainButton} disabled={!this.props.currentSelectedId} onClick={this.handleViewLog}>
                                View Log
                            </CIMSButton>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item container>
                    <CIMSDataGrid
                        disableAutoSize
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '60vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: defaultRoomList,
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            enableBrowserTooltips: true,
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.defaultRoomId,
                            getRowStyle: params => (params.data.status === 'D' ? { 'background-color': '#DCDCDC' } : null),
                            // onRowClicked: params => {
                            //     this.handleRowClick(row);
                            // },
                            // onRowDoubleClicked: params => {
                            //     this.handleRowClick(params.data, true);
                            // },
                            // onRowSelected: params => {
                            //     let row = params.api.getSelectedRows()[0];
                            //     if (row) {
                            //         console.log('##############################################' + row);
                            //         this.handleRowClick(row);
                            //     }
                            // },
                            onSelectionChanged: event => {
                                let row = event.api.getSelectedRows()[0];
                                // if (row) {
                                this.handleRowClick(row);
                                // }
                            },
                            // isRowSelectable: params => params.data.status === 'C',
                            postSort: rowNodes => {
                                let rowNode = rowNodes[0];
                                if (rowNode) {
                                    setTimeout(
                                        rowNode => {
                                            rowNode.gridApi.refreshCells();
                                        },
                                        100,
                                        rowNode
                                    );
                                }
                            }
                        }}
                        suppressGoToRow
                        suppressDisplayTotal
                    />
                </Grid>
                {this.props.dialogOpen && this.props.dialogName ? (
                    <DefaultRoomDialog
                        id={'defaultRoomDialog'}
                        open={this.props.dialogOpen}
                        action={this.props.dialogName}
                        deselectAllFnc={this.deselectAllFnc}
                        activeOnly={this.props.activeOnly}
                    />
                ) : null}
                {this.props.dialogViewLogOpen && this.props.dialogViewLogName ? (
                    <DtsDefaultRoomViewLogDialog
                        id={'defaultRoomLogDialog'}
                        open={this.props.dialogViewLogOpen}
                        action={this.props.dialogViewLogName}
                        deselectAllFnc={this.deselectAllFnc}
                    />
                ) : null}
            </Grid>
        );
    }
}

function mapStateToProps(state) {
    return {
        defaultRoomList: state.dtsDefaultRoom.defaultRoomList,
        currentSelectedId: state.dtsDefaultRoom.currentSelectedId,
        dialogInfo: state.dtsDefaultRoom.dialogInfo,
        dialogOpen: state.dtsDefaultRoom.dialogOpen,
        dialogName: state.dtsDefaultRoom.dialogName,
        dialogViewLogOpen: state.dtsDefaultRoom.dialogViewLogOpen,
        dialogViewLogName: state.dtsDefaultRoom.dialogViewLogName,
        activeOnly: state.dtsDefaultRoom.activeOnly,
        specialties: state.dtsPreloadData.allSpecialties,
        patientInfo: state.patient.patientInfo,
        rooms: state.common.rooms,
        clinicList: state.common.clinicList
    };
}

const mapDispatchToProps = {
    resetAll,
    getDefaultRoomList,
    openCommonMessage,
    updateState,
    resetDialogInfo,
    deleteDefaultRoom,
    getDefaultRoomLogList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DefaultRoom));

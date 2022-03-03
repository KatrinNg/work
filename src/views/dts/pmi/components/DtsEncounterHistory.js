import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import {
    Edit as EditIcon
} from '@material-ui/icons';

import { resetAll, dtsGetEncounterHistory } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import { StatusList } from '../../../../enums/dts/encounter/encounterStatusEnum';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';

const styles = () => ({
    root: {
        width: '100%'
    },
    mainButton: {
        width: '100%'
    },
    container: {
        padding: '10px 0px'
    },
    basicHeader: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        padding:'0px 8px!important',
        fontSize:'14px',
        textAlign:'center'
    },
    basicCell: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        borderStyle: 'none!important',
        borderBottom: '1px solid rgba(224, 224, 224, 1)!important',
        padding:'0px 8px!important',
        textAlign: 'left'
    },
    right: {
        textAlign: 'right'
    },
    iconButton: {
        cursor: 'pointer'
    },
    actionNotSave: {
        backgroundColor: '#ffff009c'
    },
    actionInProg: {
        backgroundColor: '#9de2ffc9'
    },
    actionPending: {
        backgroundColor: '#ff83fab8'
    },
    actionComp: {
        backgroundColor: '#55e29cb8'
    }
});

class DtsEncounterHistory extends Component {
    constructor(props) {
        super(props);
        const { classes } = props;

        let columnDefs = [
            {
                headerName: 'Encounter Date',
                valueGetter: (params) => moment(params.data.sdt).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
                cellClass:  (params) => (classes.basicCell + ' ' + this.getEcnounterStatus(params.data.encntrSts, classes)),
                headerClass: classes.basicHeader,
                filter: false,
                width: 140
            },
            {
                headerName: 'Encounter Type',
                valueGetter: (params) => this.getEncounter(params.data.encntrTypeId, this.props.encounterTypeList),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                filter: false,
                width: 370

            },
            {
                headerName: 'Attending Practitioner',
                valueGetter: (params) => (params.data.cimsUserPract),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                filter: false,
                width: 220

            },
            {
                headerName: 'Clinic / Unit',
                valueGetter: (params) => this.getClinic(params.data.siteId, this.props.clinicList),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                filter: false,
                width: 120

            },
            {
                headerName: 'Surgery',
                valueGetter: (params) => this.getRoom(params.data.rmId, this.props.rooms),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                filter: false,
                width: 100

            },
            {
                headerName: 'Created On',
                valueGetter: (params) => moment(params.data.createDtm).format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                filter: false,
                width: 180

            },
            {
                headerName: 'Updated On',
                valueGetter: (params) => moment(params.data.updateDtm).format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                filter: false, 
                width: 180

            }
        ];

        this.state = {
            columnDefs: columnDefs,
            rowData: this.props.encounterHistoryList
        };

        this.refGrid = React.createRef();
    }

    componentDidMount(){
    }


    componentDidUpdate() {
        if(this.state.rowData != this.props.encounterHistoryList){
            this.setState({ rowData: this.props.encounterHistoryList});
        }
    }

    componentWillUnmount(){
        if (this.refGrid.current) {
            this.refGrid.current.grid.api.destroy();
        }
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    getClinic = (siteId, clinicList) => {
        let clinic = clinicList.find(item => item.siteId === siteId);
        return clinic ? clinic.siteCd : '';
    }

    getRoom = (roomId, roomList) => {
        let room = roomList.find(item => item.rmId === roomId);
        return room ? room.rmCd : '';
    }
    getEncounter = (encntrTypeId, encounterTypes) => {
        if (encntrTypeId) {
            let encounter = encounterTypes.find(item => item.encntrTypeId === encntrTypeId);
            return encounter && encounter.encntrTypeDesc;
        } else {
            return '';
        }
    }
    
    getStatusDesc = (status) => {
        let stsObj = Enum.WAITING_LIST_STATUS_LIST.find(item => item.value === status);
        return stsObj.label;
    }
    

    getEcnounterStatus = (status, classes) =>{
        if(status === StatusList.NOT_YET_CALLED){
            return classes.actionNotSave;
        } else if(status === StatusList.CALLED_AND_IN_PROGRESS){
            return classes.actionInProg;
        } else if(status === StatusList.SURGERY_COMPLETED_BUT_WRITE_UP_NOT_YET_COMPLETED){
            return classes.actionPending;
        } else if(status === StatusList.ENCOUNTER_COMPLETED){
            return classes.actionComp;
        } else {
            return '';
        }
    }

    handleRowClicked = (item) => {
        console.log('handleRowChecked:' + JSON.stringify(item));
        // this.props.openWaitingListDialog(item);
    }

    render() {
        const { classes } = this.props;
        const { columnDefs } = this.state;
        console.log(this.state);
        return (
            <Grid className={classes.root}>
                <Grid item container id={'DtsEncounterHistoryCell'}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        disableAutoSize
                        suppressGoToRow
                        suppressDisplayTotal
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '70vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            defaultColDef: {
                                filter: false,
                                lockVisible: true,
                                sortable: false,
                                resizable: true
                                //tooltipValueGetter: params => params.value
                            },
                            columnDefs: columnDefs,
                            rowData: this.state.rowData,
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            //getColumnHeight: () => 42,
                            headerHeight: 50,
                            getRowHeight: () => 32,
                            getRowNodeId: item => item.encntrId,
                            frameworkComponents: {
                                //durationRenderer: DurationRenderer,
                                //RescheduleIconRenderer: RescheduleIconRenderer
                            },
                            onRowClicked: params => {
                                this.handleRowClicked(params.data);
                            },
                            onRowDoubleClicked: params => {
                                //this.handleRowClick(params, true);
                            },
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
                            },
                            pagination: true,
                            paginationPageSize: 28
                        }}
                    />
                </Grid>
                {/* <Grid item>
                    <CIMSButton onClick={e => this.multiMakeAppointmentOnClick(e)} color="primary" id={'makeAppointmentButton'}>Make appointment</CIMSButton>
                </Grid> */}
            </Grid>
        );
    }
}


function mapStateToProps(state) {
    return {
        encounterHistoryList:state.dtsPatientSummary.encounterHistory,
        accessRights: state.login.accessRights,
        clinicList: state.common.clinicList,
        clinic: state.login.clinic,
        siteId: state.login.loginForm.siteId,
        rooms: state.common.rooms,
        encounterTypeList: state.common.encounterTypes,
        commonCodeList: state.common.commonCodeList
    };
}

const mapDispatchToProps = {
    dtsGetEncounterHistory,
    resetAll,
    skipTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEncounterHistory));
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
import DtsTimeslotsDurationIcon from './DtsTimeslotsDurationIcon';
import './DtsDurationIconAgCell.css';

import {
    getWaitingList,
    resetAll
} from '../../../../store/actions/dts/appointment/waitingListAction';

import accessRightEnum from '../../../../enums/accessRightEnum';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import OverflowTypography from '../../components/OverflowTypography';

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
        // '&:last-child': {
        //     //padding: '8px',
        //     paddingRight: '8px'
        // }
    },
    right: {
        textAlign: 'right'
    },
    iconButton: {
        cursor: 'pointer'
    }
});

class DtsWaitingList extends Component {
    constructor(props) {
        super(props);
        const { classes } = props;
        let rescheduletIconCallback = {
            rescheduleIconOnClick: this.rescheduleAppointmentOnClick,
            classes:classes
        };

        let columnDefs = [
            {
                headerName: '',
                field: '',
                minWidth: 40,
                maxWidth: 40,
                //headerCheckboxSelection: true,
                //checkboxSelection: true,
                // checkboxSelection: params => (this.handleRowChecked(params.data.sequence)),
                // onSelectionChanged: params=> (this.handleRowChecked(params)),
                cellClass: classes.basicCell,
                filter:false,
                headerClass: classes.basicHeader
            },
            // {
            //     headerName: 'Duration',
            //     cellRenderer: 'durationRenderer',
            //     cellClass: [classes.basicCell, classes.right],
            //     filter:false,
            //     sortable:false,
            //     headerClass: classes.basicHeader,
            //     width: 100
            // },
            {
                headerName: 'Clinic / Unit',
                valueGetter: (params) => (params.data.clinicCode),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 120

            },
            {
                headerName: 'Box No.',
                valueGetter: (params) => (params.data.boxNo),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 100

            },
            {
                headerName: 'WL no,/ Special Need WL no.',
                valueGetter: (params) => (params.data.waitingListNo),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 160

            },
            {
                headerName: 'On Waiting List Date',
                valueGetter: (params) => moment(params.data.onWaitingListDate).format(DTS_DATE_DISPLAY_FORMAT),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 170

            },
            {
                headerName: 'Transfer',
                valueGetter: (params) => (params.data.transferDate ? 'Yes' : 'No'),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 90

            },
            {
                headerName: 'PMI',
                valueGetter: (params) => (params.data.patientKey),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 90

            },
            {
                headerName: 'Patient Name',
                cellRenderer: 'overflowTypographyRenderer',
                valueGetter: (params) => (dtsUtilities.getPatientName(params.data.patientDetails)),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 320

            },
            {
                headerName: 'DOB',
                valueGetter: (params) => moment(params.data.patientDetails.dob).format(DTS_DATE_DISPLAY_FORMAT),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 170

            },
            {
                headerName: 'Surgery',
                valueGetter: (params) => (params.data.roomCode),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 100

            },
            {
                headerName: 'Case Started',
                valueGetter: (params) => params.data.caseStartedDate ? moment(params.data.caseStartedDate).format(DTS_DATE_DISPLAY_FORMAT) : null,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 170

            },
            {
                headerName: 'Completion Date',
                valueGetter: (params) => params.data.completionDate ? moment(params.data.completionDate).format(DTS_DATE_DISPLAY_FORMAT) : null,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 170

            },
            {
                headerName: 'Discontinued Date',
                valueGetter: (params) => params.data.discontinuedDate ? moment(params.data.discontinuedDate).format(DTS_DATE_DISPLAY_FORMAT) : null,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 170

            }
        ];

        this.state = {
            columnDefs: columnDefs,
            rowData: []
        };

        this.refGrid = React.createRef();
    }

    componentDidMount(){
        this.props.getWaitingList();
    }


    componentDidUpdate(prevProps) {
        if (this.props.waitingList && !_.isEqual(prevProps.waitingList, this.props.waitingList)) {
            if (this.refGrid.current) {
                //console.log('componentDidUpdate-apptList:'+JSON.stringify(this.props.waitingList.list));
                this.setState({ rowData: this.props.waitingList ? this.props.waitingList : []});
                this.gridApi.redrawRows();
                //this.gridApi.refreshCells();
                //this.gridApi.paginationGoToPage(0);
            }
        }
    }

    componentWillUnmount(){
        this.props.resetAll();
        if (this.refGrid.current) {
            this.refGrid.current.grid.api.destroy();
        }
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    rescheduleAppointmentOnClick =(appointment) => {
        this.props.setSelectedRescheduleAppointment({fromAppointment:appointment});
        const callback = ()=>{
            this.props.loadPatient(appointment.patientKey, false, ()=>{});
            this.props.skipTab(accessRightEnum.patientSummary);
        };
        this.props.loadPatient(appointment.patientKey, true, callback);

    }

    handleRowClicked = (item) => {
        //console.log('handleRowChecked:' + JSON.stringify(item));
        this.props.openWaitingListDialog(item);
    }

    render() {
        const { classes } = this.props;
        const { columnDefs } = this.state;

        return (
            <Grid className={classes.root}>
                <Grid item container id={'DtsDurationIconAgCell'}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        disableAutoSize
                        suppressGoToRow
                        suppressDisplayTotal
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '85vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            defaultColDef:{
                                filter: true,
                                lockVisible: true,
                                sortable: true,
                                resizable: true
                            },
                            columnDefs: columnDefs,
                            rowData: this.state.rowData,
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            //getColumnHeight: () => 42,
                            headerHeight: 50,
                            getRowHeight: () => 32,
                            getRowNodeId: item => item.waitingListId,
                            frameworkComponents: {
                                overflowTypographyRenderer: OverflowTypographyRenderer
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
        waitingList:state.dtsWaitingList.waitingList,
        accessRights: state.login.accessRights
    };
}

const mapDispatchToProps = {
    getWaitingList,
    resetAll,
    skipTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsWaitingList));

class OverflowTypographyRenderer extends Component {
    render() {
        return <OverflowTypography noWrap>{this.props.value}</OverflowTypography>;
    }
}
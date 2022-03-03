import React from 'react';
import moment from 'moment';
import { Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import Enum from '../../../../enums/enum';



const genColumn = () => {
    let col = [
        {
            headerName: '',
            minWidth: 80,
            maxWidth: 80,
            lockPinned: true,
            sortable: false,
            filter: false,
            cellStyle: { justify: 'center' },
            valueFormatter: params => params.data.rowId + 1
        },
        {
            headerName: 'Date',
            colId: 'date',
            field: 'sdt',
            // width: 125,
            minWidth:125,
            maxWidth: 125,
            sortable: false,
            valueFormatter: params => params.value && moment(params.value || params.data.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE)
        },
        {
            headerName: 'Service',
            colId: 'service',
            field: 'service',
            width: 235,
            minWidth: 235,
            sortable: false
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        },
        {
            headerName: 'Clinic',
            colId: 'clinic',
            field: 'clinic',
            width: 235,
            minWidth: 235,
            sortable: false
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        },
        {
            headerName: 'Encounter Type',
            colId: 'encntr',
            field: 'encntr',
            width: 235,
            minWidth: 235,
            sortable: false
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        },
        {
            headerName: 'Details',
            colId: 'details',
            field: 'flwUp',
            width: 700,
            minWidth: 700,
            sortable: false,
            tooltipField: 'flwUp'
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        },
        {
            headerName: 'Update By',
            colId: 'updateBy',
            field: 'updateBy',
            width: 205,
            minWidth: 205,
            sortable: false
            // valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_MMMM_24_HOUR)
        }
    ];
    return col;
};



const setRowId = (data) => {
    // const { svcCd, siteId } = this.props.clinic;
    // const allowCrossClinicVal = this.getAllowCrossClinicVal(svcCd, siteId);
    let flwUpDetails = Array.isArray(data) ? data : [];
    // if (allowCrossClinicVal !== '1') {
    //     waitingList = waitingList.filter(item => item.siteId === siteId);
    // }
    return flwUpDetails.map((item, index) => ({
        ...item,
        rowId: index
    }));
};

const FollowUpPanel = (props) => {
    const { classes, flwUpDetails, id } = props;
    const column = genColumn();
    const rowData = setRowId(flwUpDetails || []);

    return (
        <Grid container style={{ paddingBottom: 16 }}>
            <ExpansionPanel
                square
                className={classes.expansionPanelRoot}
                defaultExpanded
            >
                <ExpansionPanelSummary
                    id={`${id}_summary`}
                    classes={{
                        root: classes.expansionPanelSummaryRoot,
                        expandIcon: classes.expansionPanelSummaryIcon
                    }}
                    expandIcon={<ExpandMore id={`${id}_expandIcon`} />}
                >
                    <label className={classes.expansionPanelSummaryLabel}>Follow Up</label>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                    className={classes.expansionPanelDetails}
                >
                    {rowData.length > 0 ?
                        <Grid container className={classes.detailContainer}>
                            <CIMSDataGrid
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    // height: '12vh',
                                    height: rowData.length > 10 ? 535 : `${50 * rowData.length + 35}px`,
                                    display: 'block'
                                }}
                                gridOptions={{
                                    columnDefs: column,
                                    rowData: rowData,
                                    rowSelection: 'single',
                                    // onGridReady: (params) => {
                                    //     // this.gridApi = params.api;
                                    //     // this.gridColumnApi = params.columnApi;
                                    // },
                                    getRowHeight: () => 50,
                                    getRowNodeId: item => item.rowId.toString(),
                                    suppressRowClickSelection: false,
                                    enableBrowserTooltips: true
                                }}
                                suppressGoToRow
                                suppressDisplayTotal
                            />
                        </Grid>
                        :
                        <div style={{ padding: '5px 10px', color: '#a7a7a7', display: 'block' }}>
                            <label>No Record</label>
                        </div>
                    }
                </ExpansionPanelDetails>

            </ExpansionPanel>
        </Grid>
    );
};

export default FollowUpPanel;
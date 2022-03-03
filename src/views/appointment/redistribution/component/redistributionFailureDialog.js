import React from 'react';
import Grid from '@material-ui/core/Grid';
import '../../../../styles/common/customHeaderStyle.scss';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { Typography } from '@material-ui/core';
import {forceRefreshCells} from '../../../../utilities/commonUtilities';

class RedistributionFailureDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    idPrefix = 'redistribution_failureDialog';

    column = [
        {
            headerName: '',
            colId:'index',
            valueGetter: params => params.node.rowIndex + 1,
            minWidth: 50,
            maxWidth: 50,
            pinned: 'left',
            filter: false
        },
        {
            field: 'patientInfo',
            headerName: 'Patient Info.',
            width: 300
        },
        { field: 'originalAppt', headerName: 'Original Appt.', width: 300, minWidth: 200 },
        { field: 'apptMoveTo', headerName: 'Appt. Move To', width: 300, minWidth: 200 },
        {
            headerName: 'Failure Reason',
            field: 'failureReason',
            width: 279, minWidth: 150
        }
    ];

    setRowId = (data) => {
        return data && data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    };

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };


    render() {
        let { rowData } = this.props;
        rowData = this.setRowId(rowData);

        return (
            <Grid>
                <CIMSPromptDialog
                    open
                    id={this.idPrefix}
                    dialogTitle={'Redistribution Failure'}
                    dialogContentText={
                        <Grid>
                            <Typography style={{ margin: '20px 0', fontSize: '1.2rem' }}>Fail to redistribute for the below appointments:</Typography>
                            <CIMSDataGrid
                                // disableAutoSize
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '65vw',
                                    height: '40vh',
                                    display: 'block',
                                    paddingBottom: 8
                                }}
                                gridOptions={{
                                    columnDefs: this.column,
                                    rowData: rowData,
                                    rowSelection: 'single',
                                    onGridReady: this.onGridReady,
                                    getRowHeight: () => 50,
                                    getRowNodeId: item => item.rowId.toString(),
                                    suppressRowClickSelection: true,
                                    tooltipShowDelay: 0,
                                    suppressColumnVirtualisation: true,
                                    ensureDomOrder: true,
                                    postSort: rowNodes => forceRefreshCells(rowNodes,['index'])
                                }}
                                suppressGoToRow
                                suppressDisplayTotal
                            />
                        </Grid>
                    }
                    buttonConfig={[
                        {
                            id: `${this.idPrefix}_okBtn`,
                            name: 'OK',
                            onClick: () => { this.props.onClose(); }
                        }
                    ]}
                />
            </Grid>
        );
    }
}

export default RedistributionFailureDialog;
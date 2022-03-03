import React from 'react';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import Enum from '../../../enums/enum';
import { forceRefreshCells } from '../../../utilities/commonUtilities';

const AnServiceIdLogDialog = (props) => {
    const idPrefix = 'patientSummary_anServiceIdLog';
    const { open, rowData } = props;

    let column = [
        {
            headerName: '',
            colId: 'index',
            valueGetter: params => params.node.rowIndex + 1,
            minWidth: 50,
            maxWidth: 50,
            pinned: 'left',
            filter: false
        },
        {
            field: 'siteId',
            headerName: 'Clinic',
            minWidth: 140,
            width: 140,
            valueFormatter: params => {
                let clinic = props.clinicList.find(item => item.siteId === params.value);
                return (clinic && clinic.clinicCd) || '';
            },
            tooltip: params => params.valueFormatted
        },
        {
            field: 'action',
            headerName: 'Action',
            minWidth: 130,
            width: 130,
            tooltipField: 'action'
        },
        {
            field: 'remark', headerName: 'Remarks', minWidth: 430, width: 430, tooltipField: 'remark'
        },
        { field: 'createBy', headerName: 'Created by', minWidth: 170, width: 170, tooltipField: 'createBy' },
        {
            field: 'createDtm',
            headerName: 'Created on',
            minWidth: 140,
            width: 140,
            valueFormatter: params => moment(params.data.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE),
            tooltip: params => params.valueFormatted
        },
        { field: '', headerName: 'Checked by', minWidth: 170, width: 170 }
    ];

    const setRowId = (data) => {
        return data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    };

    return (
        <Grid>
            <CIMSPromptDialog
                open={open}
                id={idPrefix}
                dialogTitle={'AN Service ID Action History'}
                dialogContentText={
                    <Grid>
                        <CIMSDataGrid
                            gridTheme="ag-theme-balham"
                            divStyle={{
                                width: '65vw',
                                height: '50vh',
                                display: 'block',
                                paddingBottom: 8
                            }}
                            gridOptions={{
                                columnDefs: column,
                                rowData: setRowId(rowData),
                                rowSelection: 'single',
                                getRowHeight: () => 50,
                                getRowNodeId: item => item.rowId.toString(),
                                enableBrowserTooltips: true,
                                postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                            }}
                        />
                    </Grid>
                }
                buttonConfig={[
                    {
                        id: `${idPrefix}_closeBtn`,
                        name: 'Close',
                        onClick: () => { props.onClose(); }
                    }
                ]}
            />
        </Grid>
    );
};

export default AnServiceIdLogDialog;
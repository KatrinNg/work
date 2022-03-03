import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import { forceRefreshCells } from '../../../../utilities/commonUtilities';
import { getOtherApptDetailGridCol } from '../../../../utilities/appointmentUtilities';


const useStyles = makeStyles(theme => ({
    paper: {
        width: '100%'
    },
    itemPadding: {
        padding: '12px 8px'
    },
    sectionTitle: {
        padding: '0px 8px',
        color: theme.palette.primaryColor
    },
    titleTxt: {
        fontWeight: 'bold'
    }
}));

const genDialogContent = (id, data) => {
    const col = getOtherApptDetailGridCol(true);
    return (
        <Grid container id={id}>
            <CIMSDataGrid
                gridTheme="ag-theme-balham"
                divStyle={{
                    width: '100%',
                    height: '640px',
                    display: 'block'
                }}
                gridOptions={{
                    rowHeight: 50,
                    columnDefs: col,
                    rowData: data,
                    getRowNodeId: data => data.anaHcinstApptId,
                    suppressRowClickSelection: false,
                    enableBrowserTooltips: true,
                    rowSelection: 'single',
                    onRowClicked: () => { },
                    onSelectionChanged: params => { },
                    onRowDoubleClicked: params => { },
                    postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                }}
            />
        </Grid>
    );
};

const otherApptDetailsLogDialog = (props) => {
    const { id, open, auditAction, closeDialog,otherAppointmentDetailLog } = props;
    const classes = useStyles();
    return (
        <Grid container>
            <CIMSPromptDialog
                id={id}
                open={open}
                dialogTitle={'Other Appointment Details Log'}
                classes={{
                    paper: classes.paper
                }}
                dialogContentText={
                    genDialogContent(id, otherAppointmentDetailLog)
                }
                buttonConfig={
                    [
                        {
                            id: id + '_backBtn',
                            name: 'Back',
                            onClick: () => {
                                auditAction('Close Other Appointment Details Log', null, null, false, 'ana');
                                closeDialog();
                            }
                        }
                    ]
                }
            />
        </Grid>
    );
};

export default otherApptDetailsLogDialog;
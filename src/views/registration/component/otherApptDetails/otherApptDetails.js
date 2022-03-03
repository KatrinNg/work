import React from 'react';
import { Grid } from '@material-ui/core';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { forceRefreshCells } from '../../../../utilities/commonUtilities';
import { getOtherApptDetailGridCol } from '../../../../utilities/appointmentUtilities';
import { caseSts } from '../../../../enums/anSvcID/anSvcIDEnum';

const OtherAppointmentDetails = (props) => {
    const { otherApptDetails, id, antSvcInfo } = props;
    const [detailList, setDetailList] = React.useState(() => {
        return [];
    });
    const [col, setCol] = React.useState(() => {
        return null;
    });

    React.useEffect(() => {
        if (antSvcInfo && antSvcInfo.clcAntCurrent && antSvcInfo.clcAntCurrent.sts === caseSts.ACTIVE) {
            setDetailList(otherApptDetails || []);
        }else{
            setDetailList([]);
        }
    }, [otherApptDetails, antSvcInfo]);

    React.useEffect(() => {
        const colDef = getOtherApptDetailGridCol(false);
        setCol(colDef);
    }, []);

    return (
        <Grid container id={id}>
            <CIMSDataGrid
                gridTheme="ag-theme-balham"
                divStyle={{
                    width: '100%',
                    height: '14.25vh',
                    display: 'block'
                }}
                gridOptions={{
                    rowHeight: 50,
                    columnDefs: col,
                    rowData: detailList,
                    getRowNodeId: data => data.anaHcinstApptId,
                    suppressRowClickSelection: false,
                    enableBrowserTooltips: true,
                    rowSelection: 'single',
                    onRowClicked: () => { },
                    onSelectionChanged: params => {
                    },
                    onRowDoubleClicked: params => {
                    },
                    postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                }}
                suppressGoToRow
                suppressDisplayTotal
            />
        </Grid>
    );
};

export default OtherAppointmentDetails;
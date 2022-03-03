import { makeStyles, Paper } from '@material-ui/core';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo } from 'react';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import CheckboxComponent from '../../../../components/Grid/frameworkComponents/CheckboxComponent';
import { multiRegSummaryDataGridColumns } from '../../../../utilities/registrationUtilities';
import RegPatientListContext from './RegPatientListContext';

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(1)
    }
}));

const MultiRegSummaryDataGrid = ({ audit }) => {
    const classes = useStyles();

    const { registeredPatientList, state, updateState } = useContext(RegPatientListContext);

    const { selectedPmi } = state;

    const columnDefs = useMemo(() => multiRegSummaryDataGridColumns, []);

    const WrapisChiefColumn = (data) => <CheckboxComponent checked={data.data.isChief} />;

    const WrapsingleNameColumn = (data) => <CheckboxComponent checked={data.data.allowSingleNameInput} />;

    const rowClickHandler = (e) => {
        audit(`Click Row to Select PMI ${e.data.pmi}`, false);
        updateState({ selectedPmi: e.data.pmi });
    };

    useEffect(() => {
        if (registeredPatientList.length > 0 && !selectedPmi)
            updateState({ selectedPmi: _.last(registeredPatientList).pmi });
    }, [registeredPatientList]);

    return (
        <Paper container className={classes.paper} elevation={3}>
            <CIMSDataGrid
                disableAutoSize
                gridTheme="ag-theme-balham"
                divStyle={{
                    width: '100%',
                    height: '68vh',
                    display: 'block'
                }}
                gridOptions={{
                    defaultColDef: {
                        filter: true,
                        sortable: true,
                        resizable: true,
                        cellStyle: {
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center'
                        }
                    },
                    frameworkComponents: {
                        isChiefColumn: WrapisChiefColumn,
                        singleNameColumn: WrapsingleNameColumn
                    },
                    columnDefs,
                    rowData: registeredPatientList,
                    headerHeight: 50,
                    rowHeight: 50,
                    getRowNodeId: (item) => item.pmi,
                    suppressRowClickSelection: false,
                    suppressFieldDotNotation: true,
                    pagination: true,
                    paginationPageSize: 50,
                    rowSelection: 'single',
                    onRowClicked: rowClickHandler
                }}
                suppressGoToRow
                suppressDisplayTotal
            />
        </Paper>
    );
};

MultiRegSummaryDataGrid.propTypes = {
    audit: PropTypes.func
};

export default MultiRegSummaryDataGrid;

import { Box, Button, DialogActions, makeStyles, Paper } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { familyNoTypes } from '../../../../constants/registration/registrationConstants';
import { familyNocolumns } from '../../../../utilities/familyNoUtilities';
import PmiComponent from '../../../../components/Grid/frameworkComponents/PmiComponent';
import { useDispatch } from 'react-redux';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(1)
    }
}));

const FamilyNoDataGrid = ({ isRegist, rowData, updatePatientBaseInfo, toggle }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const [selectedFamilyNo, setselectedFamilyNo] = useState('');

    // const [gridApi, setGridApi] = useState(null);

    const columnDefs = useMemo(() => familyNocolumns, []);

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'ana', pmi)),
        [dispatch]
    );

    const handleClick = () => {
        audit(AlsDesc.OK, false);
        const { pmiGrpId, pmiGrpName } = selectedFamilyNo;
        if (selectedFamilyNo)
            updatePatientBaseInfo({
                pmiGrpId: pmiGrpId,
                pmiGrpName: pmiGrpName,
                familyNoType: familyNoTypes.EXISTING,
                isChief: false
            });
        toggle();
    };

    const WrapPmiComponent = (data) => <PmiComponent data={data} isRegist={isRegist} />;

    const auditRowClick = (e) => {
        audit(`${e.type} PMI ${e.data.patientKey}`, false);
        setselectedFamilyNo(e.data);
    };

    return (
        <>
            <Paper container className={classes.paper} elevation={3}>
                <CIMSDataGrid
                    disableAutoSize
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: isRegist ? '68vh' : '78vh',
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
                        // onGridReady: (params) => setGridApi(params.api),
                        // cacheQuickFilter: true
                        frameworkComponents: {
                            PmiComponent: WrapPmiComponent
                        },
                        columnDefs,
                        rowData: rowData,
                        headerHeight: 50,
                        rowHeight: 50,
                        getRowNodeId: (item) => item.patientKey,
                        suppressRowClickSelection: !isRegist,
                        suppressFieldDotNotation: true,
                        pagination: true,
                        paginationPageSize: 50,
                        onRowDoubleClicked: isRegist ? handleClick : null,
                        rowSelection: 'single',
                        onRowClicked: auditRowClick
                    }}
                    suppressGoToRow
                    suppressDisplayTotal
                />
            </Paper>

            {isRegist && (
                <Box mt={3}>
                    <DialogActions>
                        <Button variant="contained" color="primary" onClick={handleClick}>
                            OK
                        </Button>
                    </DialogActions>
                </Box>
            )}
        </>
    );
};

FamilyNoDataGrid.propTypes = {
    rowData: PropTypes.array,
    isRegist: PropTypes.bool,
    updatePatientBaseInfo: PropTypes.func,
    toggle: PropTypes.func
};

export default FamilyNoDataGrid;

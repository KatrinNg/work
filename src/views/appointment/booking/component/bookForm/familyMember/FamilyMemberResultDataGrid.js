import { Box, Button, DialogActions, makeStyles, Paper } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CIMSDataGrid from '../../../../../../components/Grid/CIMSDataGrid';
import PmiComponent from '../../../../../../components/Grid/frameworkComponents/PmiComponent';
import TickCrossComponent from '../../../../../../components/Grid/frameworkComponents/TickCrossComponent';
import { auditAction } from '../../../../../../store/actions/als/logAction';
import { familyBookingResultcolumns } from '../../../../../../utilities/appointmentUtilities';
import FamilyNumberContext from './FamilyNumberContext';

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(1)
    }
}));

const FamilyMemberResultDataGrid = ({ toggle }) => {
    const classes = useStyles();

    const { isAttend, isDateBack } = useContext(FamilyNumberContext);

    const { familyBookingResult, familyAttnBookingResult, familyDateBackBookingResult } = useSelector(
        (state) => state.bookingInformation
    );

    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'ana', pmi)),
        [dispatch]
    );

    const columnDefs = useMemo(() => familyBookingResultcolumns(isAttend || isDateBack), [isAttend, isDateBack]);

    const handleClick = () => {
        audit('Close Family Member Result Dialog', false);
        toggle();
    };

    // eslint-disable-next-line react/jsx-boolean-value
    const WrapPmiComponent = (data) => <PmiComponent data={data} isRegist={true} />;

    const WrapIsBookedComponent = (data) => <TickCrossComponent checked={data.data.booked} />;

    return (
        <>
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
                            PmiComponent: WrapPmiComponent,
                            IsBookedComponent: WrapIsBookedComponent
                        },
                        columnDefs,
                        rowData: isAttend
                            ? familyAttnBookingResult
                            : isDateBack
                            ? familyDateBackBookingResult
                            : familyBookingResult,
                        headerHeight: 50,
                        rowHeight: 50,
                        getRowNodeId: (item) => item.patientKey,
                        suppressRowClickSelection: false,
                        suppressFieldDotNotation: true,
                        pagination: true,
                        paginationPageSize: 50,
                        rowSelection: 'multiple',
                        rowMultiSelectWithClick: true
                    }}
                    suppressGoToRow
                    suppressDisplayTotal
                />
            </Paper>

            <Box mt={3}>
                <DialogActions>
                    <Button id="closeBtn" variant="contained" color="primary" onClick={handleClick}>
                        Close
                    </Button>
                </DialogActions>
            </Box>
        </>
    );
};

FamilyMemberResultDataGrid.propTypes = {
    toggle: PropTypes.func
};

export default FamilyMemberResultDataGrid;

import { DialogContent } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { Suspense, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import CustomizedDialogs from '../../../../components/Dialog/CustomizedDialogs';
import { auditAction } from '../../../../store/actions/als/logAction';
import { RegPatientListContextProvider } from './RegPatientListContext';
const MultiRegSummaryDataGrid = React.lazy(() => import('./MultiRegSummaryDataGrid'));
const MultiRegSummaryBtnGroup = React.lazy(() => import('./MultiRegSummaryBtnGroup'));

const MultiRegSummaryDialog = ({ isSummaryDialogOpen, toggle, skipToPatientSummary, registeredPatientList }) => {
    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'patient', pmi)),
        [dispatch]
    );

    useEffect(() => {
        if (isSummaryDialogOpen) audit('Open Multiple Registration Summary Dialog', false);
        if (!isSummaryDialogOpen) audit('Close Multiple Registration Summary Dialog', false);
    }, [isSummaryDialogOpen]);

    return (
        <RegPatientListContextProvider value={{ registeredPatientList }}>
            <CustomizedDialogs
                fullWidth
                maxWidth="lg"
                open={isSummaryDialogOpen}
                onClose={toggle}
                dialogTitle="Multiple Registration Summary"
            >
                <DialogContent>
                    <Suspense fallback={'Loading...'}>
                        <MultiRegSummaryDataGrid audit={audit} />

                        <MultiRegSummaryBtnGroup
                            audit={audit}
                            skipToPatientSummary={skipToPatientSummary}
                            toggle={toggle}
                        />
                    </Suspense>
                </DialogContent>
            </CustomizedDialogs>
        </RegPatientListContextProvider>
    );
};

MultiRegSummaryDialog.propTypes = {
    toggle: PropTypes.func,
    isSummaryDialogOpen: PropTypes.bool,
    skipToPatientSummary: PropTypes.func,
    registeredPatientList: PropTypes.array
};

export default MultiRegSummaryDialog;

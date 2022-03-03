import { DialogContent } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { Suspense, useCallback, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import CustomizedDialogs from '../../../../../../components/Dialog/CustomizedDialogs';
import { auditAction } from '../../../../../../store/actions/als/logAction';
import { getFamilyBooking } from '../../../../../../store/actions/appointment/booking/bookingAction';
import { familyMemberDialogTitle } from '../../../../../../utilities/appointmentUtilities';
import FamilyNumberContext from './FamilyNumberContext';
const FamilyMemberDataGrid = React.lazy(() => import('./FamilyMemberDataGrid'));
const FamilyMemberResultDataGrid = React.lazy(() => import('./FamilyMemberResultDataGrid'));

const FamilyMemberDialog = ({ isOpen, toggle, showResult, isSelect, notAttendHandler }) => {
    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'ana', pmi)),
        [dispatch]
    );

    const { isAttend, isDateBack, isShowHistory, appointmentId, isRedirectByPatientList, isConfirm } =
        useContext(FamilyNumberContext);

    const getFamilyBookingData = useCallback((patient) => dispatch(getFamilyBooking(patient)), [dispatch]);

    useEffect(() => {
        if (isOpen && isAttend && isDateBack && appointmentId && !isRedirectByPatientList)
            getFamilyBookingData({ appointmentId, isAttend, isDateBack, isShowHistory });

        if (isOpen) audit(`Open ${familyMemberDialogTitle(isAttend, showResult, isDateBack, isConfirm)} Dialog`, false);

        if (!isOpen) audit(`Close ${familyMemberDialogTitle(isAttend, showResult, isDateBack, isConfirm)} Dialog`, false);
    }, [isOpen]);

    return (
        <CustomizedDialogs
            fullWidth
            maxWidth="lg"
            open={isOpen}
            onClose={toggle}
            dialogTitle={familyMemberDialogTitle(isAttend, showResult, isDateBack, isConfirm)}
        >
            <DialogContent>
                <Suspense fallback={'Loading...'}>
                    {showResult ? (
                        // Show book result after confirm booking or attendance
                        <FamilyMemberResultDataGrid toggle={toggle} />
                    ) : (
                        // Show family member for selection
                        <FamilyMemberDataGrid toggle={toggle} isSelect={isSelect} notAttendHandler={notAttendHandler} />
                    )}
                </Suspense>
            </DialogContent>
        </CustomizedDialogs>
    );
};

FamilyMemberDialog.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    showResult: PropTypes.bool,
    isSelect: PropTypes.bool,
    notAttendHandler: PropTypes.func
};

export default FamilyMemberDialog;

import { DialogContent } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { Suspense, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import CustomizedDialogs from '../../../../../components/Dialog/CustomizedDialogs';
import { auditAction } from '../../../../../store/actions/als/logAction';
const FamilyNoEnquiry = React.lazy(() =>
    import('../../../../patientSpecificFunction/component/familyNo/FamilyNoEnquiry')
);

const SearchFamilyNoDialog = ({ updatePatientBaseInfo, toggle, isSearchDialogOpen }) => {
    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'patient', pmi)),
        [dispatch]
    );

    useEffect(() => {
        if (isSearchDialogOpen) audit('Open Search Family No. Dialog', false);

        if (!isSearchDialogOpen) audit('Close Search Family No. Dialog', false);
    }, [isSearchDialogOpen]);

    return (
        <CustomizedDialogs
            fullWidth
            maxWidth="lg"
            open={isSearchDialogOpen}
            onClose={toggle}
            dialogTitle="Family No. Enquiry"
        >
            <DialogContent>
                <Suspense fallback={'Loading...'}>
                    <FamilyNoEnquiry
                        isRegist
                        updatePatientBaseInfo={updatePatientBaseInfo}
                        toggle={toggle}
                        isSearchDialogOpen={isSearchDialogOpen}
                    />
                </Suspense>
            </DialogContent>
        </CustomizedDialogs>
    );
};

SearchFamilyNoDialog.propTypes = {
    updatePatientBaseInfo: PropTypes.func,
    toggle: PropTypes.func,
    isSearchDialogOpen: PropTypes.bool
};

export default SearchFamilyNoDialog;

import { DialogContent } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { Suspense, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomizedDialogs from '../../../../components/Dialog/CustomizedDialogs';
import { getFamilyEncounterSearchList, toggleFamilyEncounterSearchDialog } from '../../../../store/actions/patient/patientAction';
import FamilyEncounterSearchGrid from './FamilyEncounterSearchGrid';

const FamilyEncounterSearchDialog = ({
    encounterId
}) => {
    const dispatch = useDispatch();
    const isOpen = useSelector(state => state.patient.isFamilyEncounterSearchDialogOpen);

    const getFamilyEncounterSearchData = useCallback((id) => dispatch(
        getFamilyEncounterSearchList(id)
    ), [dispatch]);

    useEffect(() => {
        if (isOpen && encounterId) {
            getFamilyEncounterSearchData(encounterId);
        }
    }, [isOpen, encounterId]);

    const handleToggle = useCallback(() => {
        dispatch(toggleFamilyEncounterSearchDialog());
    }, [dispatch]);

    const handleDialogClose = (_event, reason) => {
        if (reason === 'backdropClick') return;
        handleToggle();
    };

    return (
        <CustomizedDialogs
            fullWidth
            maxWidth="lg"
            open={isOpen}
            dialogTitle="Family Encounter Search"
            onClose={handleDialogClose}
        >
            <DialogContent>
                <FamilyEncounterSearchGrid toggle={handleToggle} />
            </DialogContent>
        </CustomizedDialogs>
    );
};

FamilyEncounterSearchDialog.propTypes = {
    encounterId: PropTypes.number
};

export default FamilyEncounterSearchDialog;

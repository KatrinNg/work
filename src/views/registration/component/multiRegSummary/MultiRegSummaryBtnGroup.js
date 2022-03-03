import { Box, Button, DialogActions, makeStyles } from '@material-ui/core';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import { printGumLabel, printRegSummary } from '../../../../store/actions/registration/registrationAction';
import PdfPreviewDialog from './preview/PdfPreviewDialog';
import RegPatientListContext from './RegPatientListContext';

const useStyles = makeStyles((theme) => ({
    button: {
        marginLeft: theme.spacing(2)
    }
}));

const MultiRegSummaryBtnGroup = ({ skipToPatientSummary, toggle, audit }) => {
    const classes = useStyles();

    const [isPdfDialogOpen, setisPdfDialogOpen] = useState(false);

    const svcCd = useSelector((state) => state.login.service.svcCd);

    const siteId = useSelector((state) => state.login.clinic.siteId);

    const { registeredPatientList, state, updateState } = useContext(RegPatientListContext);

    const { selectedPmi } = state;

    const dispatch = useDispatch();

    const printRegSummaryHandler = useCallback(() => {
        audit('Click Print Registration Summary Btn');
        dispatch(
            printRegSummary('getData', 'pdf', registeredPatientList, null, (pdfData) => {
                if (pdfData) {
                    setisPdfDialogOpen(true);
                    updateState({ pdfData: pdfData, isGum: false });
                } else updateState({ pdfData: '' });
            })
        );
    }, [registeredPatientList]);

    const printGumLabelHandler = useCallback(() => {
        audit('Click Print Gum Label Btn');
        dispatch(
            printGumLabel(svcCd, siteId, selectedPmi, null, (result) => {
                if (result) {
                    setisPdfDialogOpen(true);
                    updateState({ gumLabelbase64: result, isGum: true });
                } else updateState({ gumLabelbase64: '' });
            })
        );
    }, [selectedPmi]);

    const redirectToSummary = () => {
        audit(AlsDesc.COMPLETE, false);
        updateState('reset');
        skipToPatientSummary(_.last(registeredPatientList).pmi);
    };

    const closeDialog = () => {
        audit(AlsDesc.CLOSE, false);
        toggle();
    };

    const closePreviewDialog = () => {
        audit('Close Preview Dialog', false);
        setisPdfDialogOpen(!isPdfDialogOpen);
    };

    return (
        <Box mt={3}>
            <PdfPreviewDialog isPdfDialogOpen={isPdfDialogOpen} toggle={closePreviewDialog} audit={audit} />

            <DialogActions>
                <Button
                    id="printRegSummaryBtn"
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={printRegSummaryHandler}
                >
                    Print Registration Summary
                </Button>

                <Button
                    id="printGumLabelBtn"
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={printGumLabelHandler}
                >
                    Print Gum Label
                </Button>

                <Button
                    id="completeBtn"
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={redirectToSummary}
                >
                    Complete
                </Button>

                <Button
                    id="cancelBtn"
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={closeDialog}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Box>
    );
};

MultiRegSummaryBtnGroup.propTypes = {
    skipToPatientSummary: PropTypes.func,
    toggle: PropTypes.bool,
    audit: PropTypes.func
};

export default MultiRegSummaryBtnGroup;

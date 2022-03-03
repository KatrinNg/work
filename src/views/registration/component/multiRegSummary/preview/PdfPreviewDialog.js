import { DialogContent } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import CustomizedDialogs from '../../../../../components/Dialog/CustomizedDialogs';
import CIMSPdfViewer from '../../../../../components/PDF/CIMSPdfViewer';
import RegPatientListContext from '../RegPatientListContext';
import PdfPreviewBtnGroup from './PdfPreviewBtnGroup';

const PdfPreviewDialog = ({ isPdfDialogOpen, toggle, audit }) => {
    const { state } = useContext(RegPatientListContext);

    const { pdfData, gumLabelbase64, isGum } = state;

    useEffect(() => {
        if (isPdfDialogOpen) audit('Open PDF Preview Dialog');

        if (!isPdfDialogOpen) audit('Close PDF Preview Dialog', false);
    }, [isPdfDialogOpen]);

    return (
        <CustomizedDialogs fullWidth maxWidth="lg" open={isPdfDialogOpen} onClose={toggle} dialogTitle="Preview">
            <DialogContent>
                <CIMSPdfViewer id={'pdfViewer'} previewData={isGum ? gumLabelbase64 : pdfData} />

                <PdfPreviewBtnGroup toggle={toggle} />
            </DialogContent>
        </CustomizedDialogs>
    );
};

PdfPreviewDialog.propTypes = {
    isPdfDialogOpen: PropTypes.bool,
    toggle: PropTypes.func,
    audit: PropTypes.func
};

export default PdfPreviewDialog;

import React, { Component } from 'react';
import CIMSPdfViewer from '../../../../components/PDF/CIMSPdfViewer';

class PreviewDialog extends Component {
    render() {
        const { previewData } = this.props;
        return (
            <CIMSPdfViewer
                id={`apptSlipRemark_pdfViewer`}
                position={'vertical'}
                previewData={previewData}
            />
        );
    }
}

export default PreviewDialog;

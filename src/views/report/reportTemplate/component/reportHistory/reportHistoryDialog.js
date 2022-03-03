import React from 'react';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import { makeStyles } from '@material-ui/core/styles';
import CIMSPdfViewer from '../../../../../components/PDF/CIMSPdfViewer';

const styles = makeStyles(() => ({
    dialogPaper: {
        width: '80%'
    }
}));

const ReportHistoryDialog = (props) => {
    const { id, open, previewData, openReportPreview } = props;
    const classes = styles();
    return (
        <CIMSPromptDialog
            open={open}
            id={id}
            dialogTitle={'Preview >> Reports'}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogContentText={
                <CIMSPdfViewer
                    id={`${id}_pdfViewer`}
                    previewData={previewData}
                />
            }
            buttonConfig={
                [
                    {
                        id: `${id}_printDownloadButton`,
                        name: 'Download',
                        disabled: !previewData,
                        onClick: () => { props.download(); }
                    },
                    {
                        id: `${id}_printReportHistoryButton`,
                        name: 'Print',
                        disabled: !previewData,
                        onClick: () => { props.print(); }
                    },
                    {
                        id: `${id}_closeReportPreviewButton`,
                        name: 'Cancel',
                        onClick: () => {
                            // this.setState({ deleteReasonDialogOpen: false, deleteReasonType: '', deleteReasonText: '' });
                            props.closeReportHistoryDialog();
                        }
                    }
                ]
            }
        />
    );
};

export default ReportHistoryDialog;

import React from 'react';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import { makeStyles } from '@material-ui/core/styles';
import CIMSPdfViewer from '../../../../components/PDF/CIMSPdfViewer';

const styles = makeStyles(() => ({
    dialogPaper: {
        width: '80%'
    }
}));

const ApptListViewDialog = (props) => {
    const { id, open, previewData,position } = props;
    const classes = styles();
    return (
        <CIMSPromptDialog
            open={open}
            id={id}
            dialogTitle={'Preview >> Referral Letter'}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogContentText={
                <CIMSPdfViewer
                    id={`${id}_pdfViewer`}
                    previewData={previewData}
                    position={position}
                />
            }
            buttonConfig={
                [
                    {
                        id: `${id}_printAppointmentReportListButton`,
                        name: 'Print',
                        disabled: !previewData,
                        onClick: () => { props.print(); }
                    },
                    {
                        id: `${id}_closeAppointmentListPreviewButton`,
                        name: 'Cancel',
                        onClick: () => {
                            // this.setState({ deleteReasonDialogOpen: false, deleteReasonType: '', deleteReasonText: '' });
                            props.openRfrPreviewDialog();
                        }
                    }
                ]
            }
        />
    );
};

export default ApptListViewDialog;
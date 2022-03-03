import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import { dtsUpdateState, resetAll, dtsSetAddressLabelList } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/appointment/DtsSearchAppointmentEnum';

const styles = () => ({
    dialogPaper: {
        width: '1300px'
    }
});

class DtsPrintAppointmetListDialog extends Component {
    constructor(props) {
        //console.log('PreviewDialog props');
        //console.log(props);
        super(props);
    }

    handleClose = () => {
        this.props.closeReportDialog();
    };
    printAppointmentList = () => {
        const { appointmentListReport } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.closePreviewDialog();
                this.props.closeReportDialog();
            }
        };
        let params = { base64: appointmentListReport, callback: callback };

        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.APPOINTMENT_LIST_PRINT_QUEUE,
            CLINIC_CONFIGNAME.APPOINTMENT_LIST_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.APPOINTMENT_LIST_PRINT_TRAY,
            CLINIC_CONFIGNAME.APPOINTMENT_LIST_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );

        const paperSizeParam = commonUtilities.getHighestPrioritySiteParams(CLINIC_CONFIGNAME.APPOINTMENT_LIST_PRINT_PAPER_SIZE, this.props.clinicConfig, {
            siteId,
            serviceCd: svcCd
        });
        params = paperSizeParam && paperSizeParam.paramValue ? { ...params, paperSize: parseInt(paperSizeParam.paramValue) } : params;
        //console.log('preview dialog params');
        //console.log(params);
        print(params);
        print(tempParam);
    };

    closePreviewDialog = () => {
    };

    render() {
        const { openReportDialog,classes, appointmentListReport } = this.props;
        const id = 'printAppointmentList';
        return (
            <CIMSPromptDialog
                open={openReportDialog}
                dialogTitle={'Preview >> Appointment List'}
                classes={{
                    paper:classes.dialogPaper
                }}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} previewData={appointmentListReport} isShowControlBar defaultScale={1.5} height={'800px'} />}
                buttonConfig={[
                    {
                        id: `${id}_printButton`,
                        name: 'Print',
                        disabled: !appointmentListReport,
                        onClick: () => {
                            this.printAppointmentList();
                        }
                    },
                    {
                        id: `${id}_closeButton`,
                        name: 'Cancel',
                        onClick: () => {
                            this.handleClose();
                        }
                    }
                ]}
            />
        );
    }
}
const mapStateToProps = state => {
    return {
        patientInfo: state.patient.patientInfo,
        clinicConfig: state.common.clinicConfig,
        clinic: state.login.clinic
        //action: state.dtsPatientSummary.redirect.action
    };
};

const mapDispatchToProps = {
    dtsUpdateState,
    resetAll,
    dtsSetAddressLabelList
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintAppointmetListDialog));

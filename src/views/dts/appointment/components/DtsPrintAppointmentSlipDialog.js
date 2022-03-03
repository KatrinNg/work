import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import { dtsUpdateState } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';

const styles = () => ({
    dialogPaper: {
        // width: '80%'
        width: '480px'
    }
});

class DtsPrintAppointmentSlipDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            printData:null
        };
    }

    componentDidUpdate = () => {
        console.log("print");
        let data = this.props.appointmentSlipData;
        console.log(data);
        if (this.state.printData !== data) {
            this.setState({ printData: data });
            this.printAppointmentSlip();
        }
    }
    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    printAppointmentSlip = () => {
        const { appointmentSlipData } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.props.closeConfirmDialog();
            } else{
                this.props.openCommonMessage({msgCode: '110041'});
                this.props.closeConfirmDialog();
            }
        };
        let params = { base64: appointmentSlipData, callback: callback };
        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.APPOINTMENT_SLIP_PRINT_QUEUE,
            CLINIC_CONFIGNAME.APPOINTMENT_SLIP_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.APPOINTMENT_SLIP_PRINT_TRAY,
            CLINIC_CONFIGNAME.APPOINTMENT_SLIP_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );
        print(tempParam);
    };

    closePreviewDialog = () => {
        this.props.dtsUpdateState({ openDtsPrintAppointmentSlipDialog: false, appointmentSlipData: null });
    };

    render() {
        const { openConfirmDialog, classes, appointmentSlipData } = this.props;
        const id = 'printAppointmentSlip';

        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Preview >> Appointment Slip'}
                classes={{
                    paper: classes.dialogPaper
                }}
                // dialogContentProps={{ style: { width: 400 } }}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} previewData={appointmentSlipData} isShowControlBar={false} height={'0px'} />}
                buttonConfig={[
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
        action: state.dtsPatientSummary.redirect.action,
        patientInfo: state.patient.patientInfo,
        clinicConfig: state.common.clinicConfig,
        clinic: state.login.clinic,
        appointmentSlipData: state.dtsPatientSummary.appointmentSlipData
    };
};

const mapDispatchToProps = {
    dtsUpdateState,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintAppointmentSlipDialog));

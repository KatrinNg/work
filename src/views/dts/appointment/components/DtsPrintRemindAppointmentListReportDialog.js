import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';

import {
    resetRemindAppointmentListReport
} from '../../../../store/actions/dts/appointment/remindAppointmentAction';

const styles = () => ({
    dialogPaper: {
        // width: '80%'
        width: '1400px'
    }
});

class DtsPrintRemindAppointmentListDialog extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     printData:null
        // };
    }

    // componentDidUpdate = () => {
    //     console.log("print");
    //     let data = this.props.remindAppointmentListReport;
    //     console.log(data);
    //     if (this.state.printData !== data) {
    //         this.setState({ printData: data });
    //         this.printRemindAppointmentListReport();
    //     }
    // }
    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    printRemindAppointmentListReport = () => {
        const { remindAppointmentListReport } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.props.closeConfirmDialog();
                this.closePreviewDialog();
                this.props.closeLeftPanel();
            } else{
                this.props.openCommonMessage({msgCode: '110041'});
                this.props.closeLeftPanel();
            }
        };
        let params = { base64: remindAppointmentListReport, callback: callback };
        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.REMIND_APPOINTMENT_LIST_PRINT_QUEUE,
            CLINIC_CONFIGNAME.REMIND_APPOINTMENT_LIST_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.REMIND_APPOINTMENT_LIST_PRINT_TRAY,
            CLINIC_CONFIGNAME.REMIND_APPOINTMENT_LIST_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );
        print(tempParam);
    };

    closePreviewDialog = () => {
        this.props.resetRemindAppointmentListReport();
    };

    render() {
        const { openConfirmDialog, classes, remindAppointmentListReport } = this.props;
        const id = 'printAppointmentSlip';

        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Preview >> Remind Appointment List'}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} previewData={remindAppointmentListReport} isShowControlBar defaultScale={1.4} height={'850px'}/>}
                buttonConfig={[
                    {
                        id: `${id}_printButton`,
                        name: 'Print',
                        disabled: !remindAppointmentListReport,
                        onClick: () => {
                            this.printRemindAppointmentListReport();
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
        action: state.dtsPatientSummary.redirect.action,
        patientInfo: state.patient.patientInfo,
        clinicConfig: state.common.clinicConfig,
        clinic: state.login.clinic,
        remindAppointmentListReport: state.dtsRemindAppointment.remindAppointmentListReport
    };
};

const mapDispatchToProps = {
    resetRemindAppointmentListReport
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintRemindAppointmentListDialog));

import React, { Component } from 'react';
import { connect } from 'react-redux';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { dtsUpdateState, resetAll } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';

class DtsPrintAppointmentLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            printData:null
        };
    }
// dental Miki sprint 8 2020/08/20 - Start
    componentDidMount() {
        //console.log('DtsPrintAppointmentLabel-componentDidMount' + this.props.pmiAppointmentLabelData);
        // this.printPmiAppointment();
    }

    componentDidUpdate = () => {
        let pmiAppointmentLabelData = this.props.pmiAppointmentLabelData;
        if (this.state.printData !== pmiAppointmentLabelData) {
            this.setState({ printData: pmiAppointmentLabelData });
            this.printPmiAppointment();
        }
    }

    printPmiAppointment = () => {
        const { pmiAppointmentLabelData } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.props.closeConfirmDialog();
            } else {
                this.props.openCommonMessage({msgCode: '110041'});
                this.props.closeConfirmDialog();
            }
        };
        let params = { base64: pmiAppointmentLabelData, callback: callback };
        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.PMI_APPOINTMENT_LABEL_PRINT_QUEUE,
            CLINIC_CONFIGNAME.PMI_APPOINTMENT_LABEL_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.PMI_APPOINTMENT_LABEL_PRINT_TRAY,
            CLINIC_CONFIGNAME.PMI_APPOINTMENT_LABEL_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );
        print(tempParam);
    };
// dental Miki sprint 8 2020/08/20 - end
    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    render() {
        const { openConfirmDialog, patientInfo, action, appointmentId, pmiAppointmentLabelData } = this.props;
        const id = 'printPmiAppointment';
        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogContentProps={{ style: { width: 400 } }}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} previewData={pmiAppointmentLabelData} isShowControlBar={false} defaultScale={2} />}//DH Miki
                buttonConfig={[
                    {
                        name: 'Cancel',
                        onClick: this.handleClose
                    }
                ]}
            />
        );
    }
}
function mapStateToProps(state) {
    return {
        patientInfo: state.patient.patientInfo,
        action: state.dtsPatientSummary.redirect.action,
        appointmentId: state.dtsPatientSummary.redirect.appointmentId,//DH Miki
        clinicConfig: state.common.clinicConfig,//DH Miki
        clinic: state.login.clinic//DH Miki
    };
}

const mapDispatchToProps = {
    dtsUpdateState,
    openCommonMessage,//DH Miki
    resetAll
};

export default connect(mapStateToProps, mapDispatchToProps)(DtsPrintAppointmentLabel);

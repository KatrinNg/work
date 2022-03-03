import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import { dtsUpdateState, resetAll, dtsSetAddressLabelList } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';

const styles = () => ({
    dialogPaper: {
        // width: '80%'
        width: '1300px'
    }
});

class DtsPrintAddressLabelDialog extends Component {
    constructor(props) {
        console.log('PreviewDialog props');
        console.log(props);
        super(props);
    }
    handleClose = () => {
        this.props.dtsSetAddressLabelList(
            [{}, {}, {}, {}, {}, {}, {}, {},
            {}, {}, {}, {}, {}, {}, {}, {}]);
        this.props.closeConfirmDialog();
    };
    printPmiAddress = () => {
        const { pmiAddressData } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.closePreviewDialog();
                this.props.closeParentDialog();
                this.props.closeConfirmDialog();
            } else {
                this.props.openCommonMessage({msgCode: '110041'});
            }
        };
        let params = { base64: pmiAddressData, callback: callback };
        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.PMI_ADDRESS_LABEL_PRINT_QUEUE,
            CLINIC_CONFIGNAME.PMI_ADDRESS_LABEL_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.PMI_ADDRESS_LABEL_PRINT_TRAY,
            CLINIC_CONFIGNAME.PMI_ADDRESS_LABEL_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );
        print(tempParam);
    };

    closePreviewDialog = () => {
        this.props.dtsUpdateState({ dtsPreviewAddressLabelDialogOpen: false, pmiAddressData: null });
        this.props.resetAll();
    };

    render() {
        const { openConfirmDialog,classes, pmiAddressData } = this.props;
        const id = 'printPmiAddress';
        console.log('Print Address Label Dialog props');
        console.log(this.props);
        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Preview >> PMI Address'}
                classes={{
                    paper:classes.dialogPaper
                }}
                // dialogContentProps={{ style: { width: 400 } }}
                // dialogContentText={<PatientInformation parent={this.props.patientInfo}  previewData={pmiAddressData} />}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} previewData={pmiAddressData} isShowControlBar={false} defaultScale={2} height={'800px'} />}
                buttonConfig={[
                    {
                        id: `${id}_printButton`,
                        name: 'Print',
                        disabled: !pmiAddressData,
                        onClick: () => {
                            this.printPmiAddress();
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
        clinic: state.login.clinic,
        action: state.dtsPatientSummary.redirect.action
    };
};

const mapDispatchToProps = {
    dtsUpdateState,
    resetAll,
    dtsSetAddressLabelList,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintAddressLabelDialog));

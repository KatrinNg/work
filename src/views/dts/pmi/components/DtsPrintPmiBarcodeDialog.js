import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';
import { dtsUpdateState } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';

const styles = () => ({
    dialogPaper: {
        // width: '80%'
        width: '480px'
    }
});

class DtsPrintPmiBarcodeDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            printData:null
        };
    }

    componentDidMount = () => {
        this.printPmiBarcode();
    }
    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    printPmiBarcode = () => {
        const { pmiBarcodeData } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.closePreviewDialog();
            } else {
                this.props.openCommonMessage({msgCode: '110041'});
                this.props.closeConfirmDialog();
                this.closePreviewDialog();
            }
        };
        let params = { base64: pmiBarcodeData, callback: callback };
        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.PMI_BARCODE_LABEL_PRINT_QUEUE,
            CLINIC_CONFIGNAME.PMI_BARCODE_LABEL_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.PMI_BARCODE_LABEL_PRINT_TRAY,
            CLINIC_CONFIGNAME.PMI_BARCODE_LABEL_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );
        print(tempParam);
    };

    closePreviewDialog = () => {
        this.props.dtsUpdateState({ openDtsPrintPmiBarcodeDialog: false, pmiBarcodeData: null });
    };

    render() {
        const { openConfirmDialog, classes, pmiBarcodeData } = this.props;
        const id = 'printPmiBarcode';

        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Preview >> PMI Barcode'}
                classes={{
                    paper: classes.dialogPaper
                }}
                // dialogContentProps={{ style: { width: 400 } }}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} previewData={pmiBarcodeData} isShowControlBar={false} defaultScale={2} height={'130px'} />}
                buttonConfig={[
                    // {
                    //     id: `${id}_printButton`,
                    //     name: 'Print',
                    //     disabled: !pmiBarcodeData,
                    //     onClick: () => {
                    //         this.printPmiBarcode();
                    //     }
                    // },
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
        clinic: state.login.clinic
    };
};

const mapDispatchToProps = {
    dtsUpdateState,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintPmiBarcodeDialog));

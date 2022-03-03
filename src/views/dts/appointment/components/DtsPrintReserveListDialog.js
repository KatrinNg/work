import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { dtsUpdateState } from '../../../../store/actions/dts/appointment/emptyTimeslotAction';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { print } from '../../../../utilities/printUtilities';

const styles = () => ({
    dialogPaper: {
        width: '1300px'
    }
});

class DtsPrintReserveListDialog extends Component {
    constructor(props) {
        super(props);
    }

    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    printReserveList = () => {
        const { reserveListReport } = this.props;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.closePreviewDialog();
            } else {
                this.props.openCommonMessage({msgCode: '110041'});
            }
        };
        let params = { base64: reserveListReport, callback: callback };
        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.RESERVE_LIST_PRINT_QUEUE,
            CLINIC_CONFIGNAME.RESERVE_LIST_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.RESERVE_LIST_PRINT_TRAY,
            CLINIC_CONFIGNAME.RESERVE_LIST_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );
        print(tempParam);
    };

    closePreviewDialog = () => {
        this.props.closeConfirmDialog();
        this.props.dtsUpdateState({ reserveListReport: null });
    };

    render() {
        const { openConfirmDialog, classes, reserveListReport} = this.props;
        const id = 'printReserveList';
        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Preview >> Reserve List'}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} previewData={reserveListReport} isShowControlBar={false} defaultScale={1.5}/>}
                buttonConfig={[
                    {
                        id: `${id}_printButton`,
                        name: 'Print',
                        disabled: !reserveListReport,
                        onClick: () => {
                            this.printReserveList();
                        }
                    },
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
        reserveList: state.dtsEmptyTimeslot.reserveList,
        clinicConfig: state.common.clinicConfig,
        clinic: state.login.clinic,
        reserveListReport: state.dtsEmptyTimeslot.reserveListReport
    };
}
const mapDispatchToProps = {
    dtsUpdateState,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintReserveListDialog));

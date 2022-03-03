import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { openCommonCircular, closeCommonCircular } from '../../store/actions/common/commonAction';
import DWT from './DynamsoftSDK';
import Grid from '@material-ui/core/Grid';
import HistoryContainer from './historyContainer.js';
import withStyles from '@material-ui/styles/withStyles';
import {
    triggerGetAllDocListForScanner,
    triggerCloseScannerHistory
} from '../../store/actions/certificate/scannerCertificate/scannerCertificateAction';
import {
    triggerSetInOutDocTypeList
} from '../../store/actions/consultation/doc/docAction';

class scanner extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.triggerCloseScannerHistory();
        this.props.triggerSetInOutDocTypeList();
        this.props.triggerGetAllDocListForScanner();
        // this.props.resetAll();
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
    }

    productKey = 'f0068WQAAAGoAIrdBZ8RuZlzemRubP/sD8SaCYypEYWhaEJ5WZvUpT/Uvv3QJZKNkDC1POD2+MAuG4orWSPFt/A/hwOsiRcI=';

    updateHistoryList = (params, callback) => {
        const isHistoryValid = this.historyListRef.isFormValid();
        isHistoryValid.then(result => {
            if (result) {
                this.props.triggerGetAllDocListForScanner(callback);
            }
        });
    }

    render() {
        const {
            classes,
            scannerParams
        } = this.props;

        return (
            <Grid item container>
                <Grid
                    item
                    container
                    alignItems="flex-start"
                    className={classes.container}
                    wrap="nowrap"
                    spacing={2}
                >
                    <Grid item xs={scannerParams.open ? 4 : 'auto'}>
                    <HistoryContainer
                        scannerParams={scannerParams}
                        innerRef={r => this.historyListRef = r}
                        updateHistoryList={this.updateHistoryList}

                        // innerRef={r => this.historyListRef = r}
                        // updateHistoryList={this.updateHistoryList}
                    />
                    </Grid>
                    <Grid item xs={scannerParams.open ? 8 : 12} style={scannerParams.open ? {} : {maxWidth: '96%'}}>
                        <DWT
                            features={[
                            'scan',
                            'camera',
                            'load',
                            'save',
                            'upload',
                            'barcode',
                            'ocr',
                            'uploader'
                            ]}
                        />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const styles = theme => ({
    container: {
        height: '100%',
        overflow: 'hidden',
        padding: theme.spacing(1) / 2
    }
});

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        serviceCd: state.login.service.serviceCd,
        loginName: state.login.loginInfo.loginName,
        loginId: state.login.loginInfo.loginId,
        correlationId: state.login.loginInfo.correlationId,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        clinicConfig: state.common.clinicConfig,
        inOutDocTypeList: state.common.inOutDocTypeList,
        scannerParams: state.scannerCertificate.scannerParams

    };
};

const mapDispatchToProps = {
    triggerCloseScannerHistory,
    triggerGetAllDocListForScanner,
    triggerSetInOutDocTypeList,
    openCommonCircular,
    closeCommonCircular,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(scanner));

import React, { Component } from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import _ from 'lodash';
import Enum from '../../../enums/enum';
import EditModeMiddleware from '../../compontent/editModeMiddleware';
import {
    getContactPerson,
    resetAll,
    initData,
    updateState,
    listEformResult,
    saveEformResult,
    selectEformResult,
    handleClose
} from '../../../store/actions/certificate/certificateEform';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import FormContainer from './formContainer';
import HistoryContainer from './historyContainer';
import AccessRightEnum from '../../../enums/accessRightEnum';
import { PAGESTATUS } from '../../../enums/certificate/certEformEnum';
import * as CertUtil from '../../../utilities/certificateUtilities';
import { filterContentSvc, getMenuLabel, isSvcOnlyFilterContentSvc,onlyServerSharingDoc } from '../../../utilities/commonUtilities';
import { getIsEnableEformAccessControl } from 'utilities/siteParamsUtilities';
import moment from 'moment';


import '../../../styles/formio/styles.scss';

class CertificateEform extends Component {
    constructor(props) {
        super(props);
        this.props.resetAll();
        this.props.initData();

        this.state = {
            filterSvc: [],
            firstEformResultId: null,
            getHistoryList:[]
        };
    }

    componentDidMount() {
        const {svcCd, siteId} = this.props.eformParams;
        this.props.listEformResult({svcCd: svcCd, siteId: siteId}, (result) => {
            this.svcOptsFiltering(result);
            this.getFirstEformResultId(result);
        });

        this.props.getContactPerson();
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    getFirstEformResultId = (result) => {
        if(!result) result = this.state.getHistoryList;
        if (CertUtil.isPastEncounterDate(this.props.encounterInfo.encounterDate) && result && result[0]) {
            const getHistoryList = this.handleHistoryListFiltering(result);
            const firstEformResultId = getHistoryList[0]['eformResultId'];
            this.setState({ firstEformResultId: firstEformResultId });
            this.props.selectEformResult(firstEformResultId);
        }
        else {
            this.setState({ firstEformResultId: -1 });
        }
    }

    svcOptsFiltering = (rows) => {
        const {
            serviceList,
            service,
            clinic,
            eformParams
        } = this.props;
        let filterSvc = isSvcOnlyFilterContentSvc(rows, serviceList);
        // const history = _.cloneDeep(this.state.history);
        let param = _.cloneDeep(eformParams);
        if (filterSvc.findIndex(x => x.svcCd === service.svcCd) === -1) {
            param.svcCd = '*All';
            param.siteId = '*All';
        } else {
            param.svcCd = service.svcCd;
            param.siteId = clinic.siteId;
        }
        this.setState({
            getHistoryList: rows,
            filterSvc
        });
        /*        if (history.serviceCd !== '*All') {
                    rows = rows.filter(item => item.svcCd === param.svcCd);
                }*/
        /*        if (history.siteId !== '*All') {
                    rows = rows.filter(item => item.siteId === param.siteId);
                }*/
        this.props.updateState({eformResult: rows, eformParams: param});
    };

    sortByEncounterDate = (a, b) => {
        if (moment(a.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE).isBefore(moment(b.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE)))
            return 1;
        else if (moment(a.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE).isAfter(moment(b.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE)))
            return -1;
        else
            return 0;
    };

    handleHistoryListFiltering = (result) => {
        let output = [];
        let eformResult = result;
        const {
            eformParams
        } = this.props;
        if(!result) eformResult = this.state.getHistoryList;
        if (eformResult) {
            const { accessRights, siteParams, svcCd, siteId } = this.props;
            const isEnableEformAccessControl = getIsEnableEformAccessControl(siteParams, svcCd, siteId);
            const eformRights = accessRights.filter(x => x.type === 'eform' && x.path);

            const _eformResult = eformResult.filter(item => (
                (!isEnableEformAccessControl || eformRights.find(x => x.path === String(item.clcMapEformEtemplateDto?.eformId))) &&
                (onlyServerSharingDoc(item))
            ));
            _eformResult.sort(this.sortByEncounterDate);
            output = _eformResult;

            (eformParams.svcCd !== '*All') && (output = output.filter(item => item.svcCd === eformParams.svcCd));

            (eformParams.siteId !== '*All') && (output = output.filter(item => item.siteId === eformParams.siteId));
        }

        return output;
    }

    updateHistoryList = (params, callback) => {
        const {svcCd, siteId} = params;
        const isHistoryValid = this.historyListRef.isFormValid();
        isHistoryValid.then(result => {
            if (result) {
                this.props.listEformResult({svcCd: svcCd, siteId: siteId}, callback);
            }
        });
    }

    handleSubmit = (actType) => {
        const submitPromise = this.formContainerRef && this.formContainerRef.submit();
        submitPromise.then(result => {
            if (result) {
                let params = _.cloneDeep(result.data);
                this.props.saveEformResult(actType, params);
            }
        });
    }

    render() {
        const {
            classes,
            eformParams,
            pageStatus
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
                    <Grid item xs={eformParams.open ? 4 : 'auto'}>
                        <HistoryContainer
                            innerRef={r => this.historyListRef = r}
                            updateHistoryList={this.updateHistoryList}
                            filterSvc={this.state.filterSvc}
                            svcOptsFiltering={this.svcOptsFiltering}
                            historyList={this.handleHistoryListFiltering()}
                            getFirstEformResultId={this.getFirstEformResultId}
                        />
                    </Grid>
                    <Grid item xs={eformParams.open ? 8 : 12} style={eformParams.open ? {} : {maxWidth: '96%'}}>
                        <FormContainer
                            innerRef={r => this.formContainerRef = r}
                            svcOptsFiltering={this.svcOptsFiltering}
                            location={this.props.location}
                            firstEformResultId={this.state.firstEformResultId}
                        />
                    </Grid>
                </Grid>
                {/*<ButtonContainer*/}
                {/*    handleSubmit={ this.handleSubmit }*/}
                {/*/>*/}
                <EditModeMiddleware
                    componentName={AccessRightEnum.certificateEform}
                    when={pageStatus === PAGESTATUS.CERT_ADDING || pageStatus === PAGESTATUS.CERT_EDITING}
                    // saveFunction={this.handleSaveprint}
                />
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

const mapState = (state) => ({
    encounterInfo: state.patient.encounterInfo,
    service: state.login.service,
    clinic: state.login.clinic,
    eformParams: state.certificateEform.eformParams,
    eformResult: state.certificateEform.eformResult,
    pageStatus: state.certificateEform.pageStatus,
    eformSubmissionOriginal: state.certificateEform.eformSubmissionOriginal,
    eformSubmission: state.certificateEform.eformSubmission,
    serviceList: state.common.serviceList,
    accessRights: state.login.accessRights,
    svcCd: state.login.service.svcCd,
    siteId: state.login.clinic.siteId,
    siteParams: state.common.siteParams
});

const mapDispatch = {
    getContactPerson,
    handleClose,
    resetAll,
    initData,
    updateState,
    listEformResult,
    saveEformResult,
    selectEformResult
};

export default connect(mapState, mapDispatch)(withStyles(styles)(CertificateEform));

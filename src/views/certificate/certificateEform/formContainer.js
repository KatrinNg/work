import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import memoize from 'memoize-one';
import Grid from '@material-ui/core/Grid';
import AttnDate from '../component/attnDate';
import EForm from './component/eform';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import Select from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import {
    updateState,
    updateStateAsync,
    createEformTemplate,
    handleClose,
    findLatestDoc,
    selectEformResult
} from '../../../store/actions/certificate/certificateEform';
import { PAGESTATUS } from '../../../enums/certificate/certEformEnum';
import ClinicalDoc from '../../registration/component/miscellaneous/clinicalDoc';
import { getIsEnableEformAccessControl } from 'utilities/siteParamsUtilities';

class FormContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            initParams: null,
            initAccess: null
        };
    }

    componentDidMount() {
        if (this.props.location.tabParams) {
            try {
                const params = JSON.parse(this.props.location.tabParams);
                this.setState({initParams: params});
            }
            catch (err) {
                // console.log('[EFORM] load error:', err);
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // Default value for group drop-down box if eformList exists
        if (prevProps.eformList !== this.props.eformList){
            this.initLoad();
        }

        if (prevProps.firstEformResultId !== this.props.firstEformResultId || prevState.initAccess !== this.state.initAccess) {
            if (this.props.firstEformResultId > 0 && this.state.initAccess === false) {
                this.props.selectEformResult(this.props.firstEformResultId);
            }
        }
    }

    initLoad = async () => {
        if (this.props.eformList.length > 0){
            const groupList = this.filterGroupList(this.props.eformList);
            if (groupList && !this.props.eformGroupId && groupList?.length === 1) {
                await this.props.updateStateAsync({
                    eformGroupId: groupList[0].outDocTypeId
                });
            }
        }
        if (this.state.initParams) {
            const { group, template } = this.state.initParams;
            const groupList = this.filterGroupList(this.props.eformList);
            const tempList = this.filterTempList(this.props.eformList, group);
            const initAccess = groupList.find(x => x.outDocTypeId === group) && tempList.find(x => x.outDocTypeId === template);
            if (initAccess) {
                await this.props.updateStateAsync({
                    eformGroupId: this.state.initParams.group,
                    eformTempId: this.state.initParams.template
                });
                this.createEform();
            }
            this.setState({ initAccess });
        }
        else {
            this.setState({ initAccess: false });
        }
    }

    handleCreateTemplate = () => {
        const {
            pageStatus,
            handleClose
        } = this.props;

        if (pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_ADDING) {
            this.props.openCommonMessage({
                msgCode: '110603',
                btnActions: {
                    btn1Click: () => {
                        handleClose();

                        this.createEform();
                    }
                }
            });
            return;
        } else {
            handleClose();

            this.createEform();
        }
    }

    createEform = () => {
        let outDocType = this.props.eformList.find(x => x.outDocTypeId === this.props.eformTempId);
        // console.log('[CLC] outDocType.frmIndt:', outDocType.frmIndt);
        if (outDocType.frmIndt === 'C') {
            this.props.findLatestDoc(this.props.patientKey, this.props.eformTempId, this.props.siteId);
        }
        else {
            this.props.createEformTemplate(this.props.eformTempId);
        }
    }

    onChange = (name, value) => {
        this.props.updateState({
            [name]: value
        });
    }

    filterGroupList = memoize((list) => {
        return list && list.filter(item => item.eformType === 'G');
    });

    filterTempList = memoize((list, eformGroupId) => {
        const { accessRights, siteParams, svcCd, siteId } = this.props;
        const isEnableEformAccessControl = getIsEnableEformAccessControl(siteParams, svcCd, siteId);
        const eformRights = accessRights.filter(x => x.type === 'eform' && x.path);
        return list && list.filter(item => item.eformType === 'E' && item.parentId === eformGroupId && (!isEnableEformAccessControl || eformRights.find(x => x.path === String(item.outDocTypeId))));
    });

    submit = () => {
        return this.eformRef.submit();
    }

    render() {
        const {
            classes,
            eformList,
            eformGroupId,
            eformTempId
            // encounterInfo
        } = this.props;

        return (
            <Grid container spacing={1}>
                <Grid item container>
                    <ValidatorForm className={classes.form}>
                        <Grid item container spacing={2} justify="space-between" alignItems="center" wrap="nowrap">
                            <Grid item xs={4}>
                                <AttnDate id="certificate_eform"/>
                            </Grid>

                            <Grid item xs={2}>
                                <ClinicalDoc
                                    isEncounter
                                />
                            </Grid>
                            <Grid item xs={0.5}>
                            </Grid>
                            <Grid item xs={3}>
                                <Select
                                    id={'certificate_eform_group'}
                                    value={eformGroupId}
                                    options={eformList?
                                        this.filterGroupList(eformList).map(x => ({
                                        label: x.outDocTypeDesc,
                                        value: x.outDocTypeId
                                    })):[]}
                                    onChange={e => {
                                        this.onChange('eformGroupId', e.value);
                                        this.onChange('eformTempId', null);
                                    }}
                                    TextFieldProps={{label: <>Group<RequiredIcon/></>}}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Select
                                    id={'certificate_eform_template'}
                                    value={eformTempId}
                                    options={eformGroupId && eformList?
                                        this.filterTempList(eformList, eformGroupId).map(x => ({
                                        label: x.outDocTypeDesc,
                                        value: x.outDocTypeId
                                    })):[]}
                                    onChange={e => this.onChange('eformTempId', e.value)}
                                    TextFieldProps={{label: <>E-Form Template<RequiredIcon/></>}}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                />
                            </Grid>
                            <Grid item xs={1} style={{textAlign: 'right'}}>
                                <CIMSButton
                                    id="certificate_eform_createBtn"
                                    className={classes.button}
                                    children="Create"
                                    // disabled={!eformTempId || !(encounterInfo && encounterInfo.encounterDate && moment(encounterInfo.encounterDate).isSame(moment(), 'day'))}
                                    disabled={!eformTempId}
                                    onClick={this.handleCreateTemplate}
                                />
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                </Grid>
                <Grid item container>
                    <EForm
                        innerRef={r => this.eformRef = r}
                        svcOptsFiltering={this.props.svcOptsFiltering}
                    />
                </Grid>
            </Grid>
        );
    }
}

const styles = theme => ({
    form: {
        width: '100%'
    },
    button: {
        margin: 0
    }
});

const mapState = (state) => ({
    pageStatus: state.certificateEform.pageStatus,
    eformList: state.certificateEform.eformList,
    eformGroupId: state.certificateEform.eformGroupId,
    eformTempId: state.certificateEform.eformTempId,
    eformParams: state.certificateEform.eformParams,
    patientKey: state.patient.patientInfo.patientKey,
    encounterInfo: state.patient.encounterInfo,
    accessRights: state.login.accessRights,
    svcCd: state.login.service.svcCd,
    siteId: state.login.clinic.siteId,
    siteParams: state.common.siteParams
});

const mapDispatch = {
    updateState,
    updateStateAsync,
    createEformTemplate,
    handleClose,
    openCommonMessage,
    findLatestDoc,
    selectEformResult
};


export default connect(mapState, mapDispatch)(withStyles(styles)(FormContainer));

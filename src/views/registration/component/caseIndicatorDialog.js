import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import {
    updateState
} from '../../../store/actions/patient/patientAction';
import * as CommonUtil from '../../../utilities/commonUtilities';
import CIMSRadioCombination from '../../../components/Radio/CIMSRadioCombination';
import _ from 'lodash';
import RadioFieldValidator from '../../../components/FormValidator/RadioFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import { auditAction } from '../../../store/actions/als/logAction';

class CaseIndicatorDialog extends React.Component {


    handleSubmitCaseIndicator = () => {
        const formValid = this.refs.caseIndicatorFormRef.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.props.handleSubmitCaseIndicator();
            }
        });
    }

    handleCaseIndicatorChange = (name, value) => {
        let caseIndicatorInfo = _.cloneDeep(this.props.caseIndicatorInfo);
        caseIndicatorInfo[name] = value;
        this.props.updateState({ caseIndicatorInfo });
    }

    render() {
        const { classes, caseIndicatorInfo, serviceCd, patientSvcExist } = this.props;

        const isNewToSvcSiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, serviceCd, this.props.loginSiteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, serviceCd, this.props.loginSiteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';

        return (
            <CIMSPromptDialog
                open
                id={'caseIndicator'}
                dialogTitle={'Case Indicator'}
                paperStyl={classes.paper}
                dialogContentText={
                    <div>
                        <Grid container spacing={1} className={classes.root}>

                            <Grid item container direction="column" xs={12}>
                                <ValidatorForm ref="caseIndicatorFormRef" onSubmit={this.handleSubmitCaseIndicator} >
                                    <Grid item container>
                                        <RadioFieldValidator
                                            id={'radioGroup_caseIndicator'}
                                            value={caseIndicatorInfo.caseIndicator}
                                            onChange={e => this.handleCaseIndicatorChange('caseIndicator', e.target.value)}
                                            list={
                                                (isNewToSvc === '1' && !patientSvcExist) ? [{ label: 'New to Service', value: 'N' }, { label: 'Existing ' + CommonUtil.getPatientCall(), value: 'E' }] :
                                                    (isAttenConfirmEcsEligibility === '1' && isNewToSvc === '1' && patientSvcExist) || (isAttenConfirmEcsEligibility === '1' && isNewToSvc !== '1') ?
                                                        [{ label: 'Confirm Eligibility', value: 'C' }, { label: 'Payment Settled', value: 'P' }] : []
                                            }
                                            validators={[ValidatorEnum.required]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        />
                                    </Grid>
                                </ValidatorForm>

                            </Grid>

                        </Grid>
                    </div>
                }
                buttonConfig={
                    (isNewToSvc === '1' && patientSvcExist && isAttenConfirmEcsEligibility === '1') || (isNewToSvc === '1' && !patientSvcExist && isAttenConfirmEcsEligibility !== '1') || (isAttenConfirmEcsEligibility === '1' && isNewToSvc !== '1') ? [
                        {
                            id: 'caseIndicator_save',
                            name: 'Save',
                            onClick: () => {
                                this.props.auditAction('Click Save In Appointment Detail Case Indicator Dialog');
                                this.refs.caseIndicatorFormRef.submit();
                            }
                        },
                        {
                            id: 'caseIndicator_cancel',
                            name: 'Cancel',
                            onClick: () => {
                                this.props.auditAction('Cancel Case Indicator', null, null, false, 'ana');
                                this.props.updateState({ caseIndicatorInfo: { caseIndicator: '', confirmECSEligibility: '', open: false } });
                            }
                        }
                    ] : (isNewToSvc === '1' && !patientSvcExist && isAttenConfirmEcsEligibility === '1') ? [
                        {
                            id: 'caseIndicator_ConfirmECSEligibility',
                            name: 'Confirm ECS Eligibility',
                            onClick: () => {
                                this.props.auditAction('Click Confirm ECS Eligibility In Appointment Detail Case Indicator Dialog');
                                this.props.updateState({ caseIndicatorInfo: { ...caseIndicatorInfo, confirmECSEligibility: 'C' } }).then(() => {
                                    this.refs.caseIndicatorFormRef.submit();
                                });
                            }
                        },
                        {
                            id: 'caseIndicator_PaymentSettled',
                            name: 'Payment Settled',
                            onClick: () => {
                                this.props.auditAction('Click Payment Settled In Appointment Detail Case Indicator Dialog');
                                this.props.updateState({ caseIndicatorInfo: { ...caseIndicatorInfo, confirmECSEligibility: 'P' } }).then(() => {
                                    this.refs.caseIndicatorFormRef.submit();
                                });
                            }
                        },
                        {
                            id: 'caseIndicator_cancel',
                            name: 'Cancel',
                            onClick: () => {
                                this.props.auditAction('Cancel Case Indicator', null, null, false, 'ana');
                                this.props.updateState({ caseIndicatorInfo: { caseIndicator: '', confirmECSEligibility: '', open: false } });
                            }
                        }
                    ] : []
                }
            />
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        clinicConfig: state.common.clinicConfig,
        loginSiteId: state.login.clinic.siteId,
        serviceCd: state.login.service.serviceCd,
        caseIndicatorInfo: state.patient.caseIndicatorInfo,
        patientSvcExist: state.patient.patientSvcExist
    });
};

const mapDispatchtoProps = {
    updateState,
    auditAction
};

const styles = theme => ({
    root: {
        padding: 4
    },
    maintitleRoot: {
        paddingTop: 6,
        fontSize: '14pt',
        fontWeight: 600
    },
    marginTop20: {
        marginTop: 6
    },
    radioGroup: {
        padding: '20px 20px 0px 24px',
        height: 'auto',
        flexDirection: 'column'
    },
    gridTitle: {
        padding: '4px 0px'
    },
    buttonRoot: {
        margin: 2,
        padding: 0,
        height: 35
    },
    paper: {
        minWidth: 600,
        maxWidth: '100%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    FormControlLabelProps: {
        marginBottom: 20
    }
});


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(CaseIndicatorDialog));
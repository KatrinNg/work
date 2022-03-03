import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { Grid, Typography } from '@material-ui/core';
import CIMSPromptDialog from 'components/Dialog/CIMSPromptDialog';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import _ from 'lodash';
import { CommonUtil } from '../../utilities';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';

class ConfirmAtndDialog extends React.Component {

    state = {
        teamList: this.props.ehsTeamSiteList.map((item) => ({ value: item.ehsTeamId, label: item.teamName })),
        confirmAtndForm: {
            ehsWaiverCategoryCd: this.props.patientInfo?.patientEhsDto?.ehsWaiverCatgryCd,
            team: 'null'
        },
        inputParams: null
    }

    componentDidMount() {
        let teamList = _.cloneDeep(this.state.teamList);
        teamList.unshift({ label: 'Home', value: 'null' });
        this.setState({ teamList }, () => {
            if (teamList.length === 1) {
                this.handleOnChange('team', teamList[0].value);
            }
        });
    }

    doEhsConfirmAtnd = (inputParams) => {
        this.setState({
            inputParams
        });
    }

    handleOnChange = (name, value, callback) => {
        let confirmAtndForm = _.cloneDeep(this.state.confirmAtndForm);
        confirmAtndForm[name] = value;
        this.setState({ confirmAtndForm }, () => {
            callback && callback();
        });
    }

    render() {
        const { classes, id, confirmAtndDialogOpen, auditAction, closeConfirmAtndDialog, ehsWaiverCateGoryList } = this.props;
        const { teamList, confirmAtndForm, inputParams } = this.state;
        const ehsEnableAtndConfirmWithTeam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, this.props.siteId, 'EHS_ENABLE_ATND_CONFIRM_WITH_TEAM');
        const rmCdArr = ((ehsEnableAtndConfirmWithTeam && ehsEnableAtndConfirmWithTeam.configValue) || '').split(',');
        const isTeamShow = rmCdArr.includes(this.props.currentRmCd);

        return (
            <CIMSPromptDialog
                open={confirmAtndDialogOpen}
                id={id}
                dialogTitle={'Confirm Attendance'}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={
                    <ValidatorForm
                        ref={r => this.confirmAtndFormRef = r}
                    >
                        <Grid container spacing={2}>
                            <Grid item container xs={12} style={{ marginTop: 20 }}>
                                <Typography style={{ fontWeight: 'bold' }}>Please fill in the following before taking attendance:</Typography>
                            </Grid>
                            <Grid item container xs={12}>
                                <SelectFieldValidator
                                    id={id + '_waiverCategory'}
                                    options={ehsWaiverCateGoryList.map((item) => ({ value: item.code, label: item.engDesc }))}
                                    value={confirmAtndForm.ehsWaiverCategoryCd}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Waiver Category</>
                                    }}
                                    onChange={(e) => { this.handleOnChange('ehsWaiverCategoryCd', e.value); }}
                                />
                            </Grid>
                            {
                                isTeamShow ? <Grid item container xs={12} style={{ fontWeight: 'bold', marginTop: 10 }}>
                                    <SelectFieldValidator
                                        id={id + '_team'}
                                        options={teamList}
                                        value={confirmAtndForm.team}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Team<RequiredIcon /></>
                                        }}
                                        onChange={(e) => { this.handleOnChange('team', e.value); }}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        absoluteMessage
                                    />
                                </Grid> : null
                            }
                        </Grid>
                    </ValidatorForm>
                }
                buttonConfig={
                    [
                        {
                            id: id + '_ok',
                            name: 'OK',
                            onClick: () => {
                                auditAction('Confirm Attendance');
                                let confirmAtndFormValid = this.confirmAtndFormRef.isFormValid(false);
                                confirmAtndFormValid.then(result => {
                                    if (result) {
                                        let params = {
                                            ehsWaiverCategoryCd: confirmAtndForm.ehsWaiverCategoryCd,
                                            team: confirmAtndForm.team === 'null' ? null : confirmAtndForm.team
                                        };
                                        this.props.confirm(inputParams, params);
                                    } else {
                                        this.confirmAtndFormRef.focusFail();
                                    }
                                });
                            }
                        },
                        {
                            id: id + '_cancel',
                            name: 'Cancel',
                            onClick: () => {
                                auditAction('Cancel Attendance');
                                closeConfirmAtndDialog();
                            }
                        }
                    ]
                }
            />
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        patientInfo: state.patient.patientInfo,
        ehsWaiverCateGoryList: state.common.commonCodeList.ehs_waiver_catgry || [],
        ehsTeamSiteList: state.common.ehsTeamSiteList,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        clinicConfig: state.common.clinicConfig
    });
};

const mapDispatchtoProps = {
};

const styles = theme => ({
    dialogPaper: {
        width: '30%'
    }
});


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(ConfirmAtndDialog));
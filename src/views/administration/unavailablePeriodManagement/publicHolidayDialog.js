import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import moment from 'moment';
import _ from 'lodash';
import {
    updateState,
    resetAll,
    updateUpm,
    resetDialogInfo,
    createUpm
} from '../../../store/actions/administration/unavailablePeriodManagement/index';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import { Grid } from '@material-ui/core';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import Enum from '../../../enums/enum';
import { auditAction } from '../../../store/actions/als/logAction';

const styles = theme => ({
    createForm: {
        width: 800,
        paddingTop: 20,
        overflow: 'hidden'
    },
    form_input: {
        width: '100%'
    }
});

class PublicHolidayDialog extends Component {

    handleClose = () => {
        this.props.updateState({ publicDialogOpen: false, publicDialogName: '' });
        this.props.resetDialogInfo();
    }

    handleChange = (value, name) => {
        let publicDialogInfo = _.cloneDeep(this.props.publicDialogInfo);
        publicDialogInfo[name] = value;
        this.props.updateState({ publicDialogInfo: publicDialogInfo });
    }


    handleSubmit = () => {
        this.refs.form.submit();
    }

    handleSave = () => {
        const { publicDialogInfo, currentSelectedId } = this.props;
        // update public holiday
        if (this.props.publicDialogName === 'Update Public Holiday') {
            let params = {
                unavailPerdId: currentSelectedId,
                isWhl: 1,
                isWhlDay: 1,
                sdt: moment(publicDialogInfo.publicDialogDate).format(Enum.DATE_FORMAT_EYMD_12_HOUR_CLOCK),
                edt: moment(publicDialogInfo.publicDialogDate).format(Enum.DATE_FORMAT_EYMD_12_HOUR_CLOCK),
                remark: publicDialogInfo.publicDialogRemark,
                remarkChi: publicDialogInfo.publicDialogRemarkCN,
                unavailPerdRsnId: 336,
                status: publicDialogInfo.status,
                assignedRoomIds: [],
                version: publicDialogInfo.version
            };
            this.props.auditAction('Save Public Holiday Update');
            this.props.updateUpm(currentSelectedId, params, () => {
                this.handleClose();
                this.props.deselectAllFnc();
                this.props.listUpmList();
            });
        } else {
            // create public holiday
            let params = {
                wholeServiceFlag: 1,
                wholeDayFlag: 1,
                wholeClinicFlag: 1,
                startDate: moment(publicDialogInfo.publicDialogDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
                endDate: moment(publicDialogInfo.publicDialogDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
                remark: publicDialogInfo.publicDialogRemark,
                remarkChi: publicDialogInfo.publicDialogRemarkCN,
                unavailPerdRsnId: 336
            };
            this.props.auditAction('Create Public Holiday');
            this.props.createUpm(params, () => {
                this.handleClose();
                this.props.deselectAllFnc();
                this.props.listUpmList();
            });
        }
    }


    render() {
        const { classes, open, publicDialogInfo, publicDialogName,viewOnly } = this.props;
        return (
            <CIMSPromptDialog
                id={'unavailablePeriodManagement_dialog'}
                dialogTitle={publicDialogName}
                open={open}
                dialogContentText={
                    <ValidatorForm
                        ref="form"
                        onSubmit={this.handleSave}
                        className={classes.createForm}
                    >
                        <Grid container spacing={2} >
                            <Grid item xs={4} >
                                <DateFieldValidator
                                    id={'publicHoliday_dialogDate'}
                                    label={<>Date<RequiredIcon /></>}
                                    value={publicDialogInfo.publicDialogDate}
                                    inputVariant="outlined"
                                    onChange={e => this.handleChange(e, 'publicDialogDate')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                />
                            </Grid>
                        </Grid>

                        <Grid container item xs={12} style={{ marginTop: 20 }}>
                            <FastTextFieldValidator
                                id={'publicHoliday_dialogRemark'}
                                name="publicDialogRemark"
                                label="Remark"
                                variant="outlined"
                                inputProps={{ maxLength: 500 }}
                                noChinese
                                value={publicDialogInfo.publicDialogRemark}
                                onBlur={e => this.handleChange(e.target.value, 'publicDialogRemark')}
                            />
                        </Grid>

                        <Grid container item xs={12} style={{ marginTop: 20 }}>
                            <FastTextFieldValidator
                                id={'publicHoliday_dialogRemarkCN'}
                                name="publicDialogRemarkCN"
                                label="Remark (Chinese)"
                                variant="outlined"
                                inputProps={{ maxLength: 500 }}
                                calActualLength
                                value={publicDialogInfo.publicDialogRemarkCN}
                                onBlur={e => this.handleChange(e.target.value, 'publicDialogRemarkCN')}
                            />
                        </Grid>

                    </ValidatorForm>
                }
                buttonConfig={
                    [
                        {
                            id: 'publicHoliday_dialog_save',
                            name: 'Save',
                            onClick: this.handleSubmit,
                            disabled:viewOnly
                        },
                        {
                            id: 'publicHoliday_dialog_cancel',
                            name: 'Cancel',
                            onClick:()=>{
                                this.props.auditAction('Click Public Holiday Dialog Cancel Button', null, null, false, 'ana');
                                this.handleClose();
                            }
                        }
                    ]
                }
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        rooms: state.common.rooms,
        quotaConfig: state.common.quotaConfig,
        sessionsConfig: state.common.sessionsConfig,
        loginInfo: state.login.loginInfo,
        publicDialogInfo: state.unavailablePeriodManagement.publicDialogInfo,
        currentSelectedId: state.unavailablePeriodManagement.currentSelectedId,
        siteId: state.login.loginForm.siteId,
        publicDialogOpen: state.unavailablePeriodManagement.publicDialogOpen,
        publicDialogName: state.unavailablePeriodManagement.publicDialogName,
        serviceCd: state.login.service.serviceCd,
        upmSiteId: state.unavailablePeriodManagement.upmSiteId
    };
}

const mapDispatchToProps = {
    updateState,
    createUpm,
    resetAll,
    updateUpm,
    resetDialogInfo,
    openCommonMessage,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PublicHolidayDialog));
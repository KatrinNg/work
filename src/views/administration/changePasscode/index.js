import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography
} from '@material-ui/core';
import CIMSButton from 'components/Buttons/CIMSButton';
import {
    resetAll,
    updateField,
    updatePasscode,
    updateCancel
} from '../../../store/actions/administration/changePasscode/changePasscodeAction';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import * as commonUtilities from '../../../utilities/commonUtilities';
import RequiredIcon from 'components/InputLabel/RequiredIcon';
import accessRightEnum from '../../../enums/accessRightEnum';
import _ from 'lodash';
import PassCodeInputNoHint from '../userAccount/uaInformation/component/passCodeInputNoHint';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import { auditAction } from '../../../store/actions/als/logAction';
import { getUserPasscode } from '../../../store/actions/administration/userAccount/userAccountAction';

const styles = ({
    grid: {
        marginTop: 10,
        marginBottom: 10
    },
    h6Title: {
        color: '#0579c8',
        marginTop: 20,
        marginBottom: 10,
        fontWeight: 'bolder'
    },
    iputLabel: {
        display: 'flex',
        alignItems: 'center'
    }
});

class ChangePasscode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            passwordMinLength: null,
            passwordMaxLength: null,
            passwordMinNumericLength: null,
            passwordMinAlpNumericLength: null
        };

        this.handleChange = this.handleChange.bind(this);
    }
    UNSAFE_componentWillMount() {
        this.props.resetAll();
    }

    componentDidMount() {
        this.doClose = commonUtilities.getDoCloseFunc_2(accessRightEnum.changePersonalPasscode, this.checkDirty, this.saveFunc);
        this.props.updateCurTab(accessRightEnum.changePersonalPasscode, this.doClose);
        ValidatorForm.addValidationRule(ValidatorEnum.isSamePasscode, () => {
            if (this.props.newPasscode !== '' && this.props.confirmnewPasscode !== '') {
                let result = (this.props.newPasscode !== this.props.confirmnewPasscode);
                return !result;
            }
            else {
                return true;
            }
        });
        this.props.getUserPasscode(this.props.loginInfo.userDto.userId, (data) => {
            this.props.updateField('loginName', data.loginName);
            this.props.updateField('version', data.version);
        });
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    checkDirty = () => {
        return _.toString(this.props.oldPasscode) || _.toString(this.props.newPasscode) || _.toString(this.props.confirmnewPasscode) ? true : false;
    }

    saveFunc = (closeTab) => {
        this.handleSubmit(null, closeTab);
    }

    handleChange = (name, value) => {
        if (name === 'newPasscode') {
            this.confirmnewPasscodeFieldRef.validateCurrent();
        }
        if (name === 'confirmnewPasscode') {
            this.newPasscodeFieldRef.validateCurrent();
        }
        this.props.updateField(name, value);
    }

    handleSubmit = (e, closeTab) => {
        e && e.preventDefault();
        this.props.auditAction('Click Update In Change Personal Passcode');
        const formRequiredValid = this.refs.changePasscodeFormRef.isFormValid(false);
        formRequiredValid.then(result => {
                if (result) {
                    let submitParams = {
                        loginName: this.props.loginName,
                        currentPasscode: this.props.oldPasscode,
                        newPasscode: this.props.newPasscode,
                        isAdmin: 'false',
                        version: this.props.version
                    };
                    this.props.updatePasscode(
                        submitParams, () => {
                            this.props.getUserPasscode(this.props.loginInfo.userDto.userId, (data) => {
                                this.props.updateField('loginName', data.loginName);
                                this.props.updateField('version', data.version);
                            });
                        }
                    );
                } else {
                    let firstInValidComponent =  this.refs.changePasscodeFormRef.errors[0];
                    // if(firstInValidComponent){
                    //     firstInValidComponent.props;
                    // }
                    const validList = [
                        { key: 'oldPasscodeRef', name: 'oldPasscode' },
                        { key: 'newPasscodeRef', name: 'newPasscode' },
                        { key: 'confirmnewPasscodeRef', name: 'confirmnewPasscode' }
                    ];
                    const firstInValid = validList.find(x => x.name === firstInValidComponent.props.name);
                    if (firstInValid) {
                        this[firstInValid.key] && this[firstInValid.key].focus();
                    }
                }

        });

    }

    handleCancel = () => {
        this.props.updateCancel();
        this.props.auditAction('Click Cancel In Change Personal Passcode');
        this.oldPasscodeFieldRef.validateCurrent();
        this.confirmnewPasscodeFieldRef.validateCurrent();
        this.newPasscodeFieldRef.validateCurrent();
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid style={{ paddingLeft: 30 }}>
                <ValidatorForm ref="changePasscodeFormRef">
                    <Typography variant="h6" className={classes.h6Title}>Change Personal Passcode</Typography>
                    <Grid item container xs={8} >

                        <Grid item container className={classes.grid}>
                            <Grid item xs={3} className={classes.iputLabel}>
                                <Typography variant="subtitle1">Old Passcode<RequiredIcon />:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <PassCodeInputNoHint
                                    name={'oldPasscode'}
                                    id={'curPasscode'}
                                    value={this.props.oldPasscode}
                                    inputProps={{
                                        maxLength: this.state.passwordMaxLength
                                    }}
                                    onBlur={(value) => this.handleChange('oldPasscode', value)}
                                    ref={r => this.oldPasscodeFieldRef = r}
                                    inputRef={r => this.oldPasscodeRef = r}
                                    validators={[ValidatorEnum.required, ValidatorEnum.equalStringLength(5)]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_PASSCODE_CHARACTORS()]}
                                />
                            </Grid>
                        </Grid>

                        <Grid item container className={classes.grid}>
                            <Grid item xs={3} className={classes.iputLabel}>
                                <Typography variant="subtitle1">New Passcode<RequiredIcon />:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <PassCodeInputNoHint
                                    name={'newPasscode'}
                                    id={'newPasscode'}
                                    onBlur={(value) => this.handleChange('newPasscode', value)}
                                    value={this.props.newPasscode}
                                    ref={r => this.newPasscodeFieldRef = r}
                                    inputRef={r => this.newPasscodeRef = r}
                                    inputProps={{
                                        maxLength: this.state.passwordMaxLength
                                    }}
                                    validators={[ValidatorEnum.required, ValidatorEnum.equalStringLength(5), ValidatorEnum.isSamePasscode]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_PASSCODE_CHARACTORS(), CommonMessage.VALIDATION_SAME_PASSCODE()]}
                                />

                            </Grid>
                        </Grid>

                        <Grid item container className={classes.grid}>
                            <Grid item xs={3} className={classes.iputLabel}>
                                <Typography variant="subtitle1">Confirm New Passcode<RequiredIcon />:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <PassCodeInputNoHint
                                    name={'confirmnewPasscode'}
                                    id={'confirmnewPasscode'}
                                    onBlur={(value) => this.handleChange('confirmnewPasscode', value)}
                                    value={this.props.confirmnewPasscode}
                                    ref={r => this.confirmnewPasscodeFieldRef = r}
                                    inputRef={r => this.confirmnewPasscodeRef = r}
                                    inputProps={{
                                        maxLength: this.state.passwordMaxLength
                                    }}
                                    style={{ margin: 0, padding: 0, width: '100%' }}
                                    validators={[ValidatorEnum.required, ValidatorEnum.equalStringLength(5), ValidatorEnum.isSamePasscode]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_PASSCODE_CHARACTORS(), CommonMessage.VALIDATION_SAME_PASSCODE()]}
                                />

                            </Grid>
                        </Grid>

                        <Grid container alignItems={'flex-start'} direction={'row'}>
                            <Grid item xs={3} container></Grid>
                            <Grid item xs={9} container justify="flex-end">
                                <Typography>
                                    <CIMSButton
                                        id={'passcodeSaveButton'}
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={this.handleSubmit}
                                    >
                                        Update
                                </CIMSButton>
                                    <CIMSButton
                                        id={'passcodeCancelButton'}
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={this.handleCancel}
                                    >
                                        Cancel
                                </CIMSButton>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>
            </Grid>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        clinicConfig: state.common.clinicConfig,
        loginInfo: state.login.loginInfo,
        ...state.changePasscode.changePasscodeDTO
    };
};
const dispatchToProps = {
    resetAll,
    updateField,
    updatePasscode,
    updateCurTab,
    updateCancel,
    auditAction,
    getUserPasscode
};
export default connect(mapStateToProps, dispatchToProps)(withStyles(styles)(ChangePasscode));
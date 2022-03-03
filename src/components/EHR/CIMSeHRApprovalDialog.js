import React, { Component } from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { InputAdornment, Grid, IconButton } from '@material-ui/core';
import { AccountBox, Visibility, VisibilityOff } from '@material-ui/icons';
import CIMSFormLabel from '../../components/InputLabel/CIMSFormLabel';
import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import Input from '../../views/compontent/delayInput';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import PasswordInput from '../../views/compontent/passwordInput/passwordInput';

const styles = () => ({
    gridMargin20: {
        marginBottom: 20
    },
    textfield: {
        marginBottom: 20,
        marginTop: 20
    }
});

class CIMSeHRApprovalDialog extends Component {
    constructor(props){
        super(props);
        this.state = {
            showPassword: false
        };
    }

    handleMouseDownPassword = () => {
        this.setState({ showPassword: !this.state.showPassword });
    }

    handleMouseUpPassword = () => {
        this.setState({ showPassword: false });
    }

    handleMouseLeavePassword = () => {
        this.setState({ showPassword: false });
    }

    render() {
        const {
            classes,
            approverName,
            approverPassword,
            onChange,
            staffId,
            ischangePatientMajorKeyRight
        } = this.props;
        let loginUserStaffId = this.props.loginUserStaffId ? this.props.loginUserStaffId: '';

        return (
            <Grid>
                <Grid container>
                    <CIMSFormLabel
                        fullWidth
                        labelText="Approver"
                    >
                        <ValidatorForm ref="approvalForm" className={classes.textfield}>
                            <Grid item container alignItems="center" >
                                <Grid item container justify="center" xs={1}><AccountBox /></Grid>
                                <Grid item xs={11}>
                                <Input
                                    fullWidth
                                    type={(this.state.showPassword)? 'text' : 'password'}
                                    onChange={e => onChange(e.target.value, 'staffId')}
                                    value={staffId}
                                    id={'registration_approver_staff_id'}
                                    label={<>Approver's Staff ID<RequiredIcon /></>}
                                    autoFocus
                                    validators={[
                                        ValidatorEnum.required,
                                        ValidatorEnum.matchRegexp('^(?!(^' + loginUserStaffId + '$)).*$')
                                    ]}
                                    errorMessages={[
                                        CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                        CommonMessage.NON_LOGIN_USER_REQUIRED()
                                    ]}
                                    InputProps={{ endAdornment:
                                        <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            id={'ehrApproval_passwordVisibility'}
                                            onMouseDown={this.handleMouseDownPassword}
                                            onMouseUp={this.handleMouseUpPassword}
                                            onMouseLeave={this.handleMouseLeavePassword}
                                            tabIndex={-1}
                                        >
                                            {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                    }}
                                />
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </CIMSFormLabel>
                </Grid>
            </Grid>
        );
    }
}

CIMSeHRApprovalDialog.propTypes = {
};

const mapStateToProps = (state) => {
    return {
        loginUserStaffId: state.login.loginInfo.userDto.staffId
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CIMSeHRApprovalDialog));

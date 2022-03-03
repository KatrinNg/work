import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Link,
    Typography
} from '@material-ui/core';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import TextField from '../../components/FormValidator/TextFieldValidator';
import CIMSButton from '../../components/Buttons/CIMSButton';
import { Link as RouterLink } from 'react-router-dom';
import { updateField, send, resetAll } from '../../store/actions/forgetPassword/forgetPasswordAction';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import cover_DH from '../../images/loginPage/cover_DH_v3_revised.png';
import { GridCore } from 'ag-grid-community';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';
import PasswordInput from '../compontent/passwordInput/passwordInput';

const style = (theme)=>({
    root: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        // marginTop: 56,
        backgroundColor:theme.palette.cimsBackgroundColor,
        paddingTop:56,
        height:960
    },
    from: {
        width: '100%'
    },
    pageTitle: {
        color: '#0579c8',
        fontSize: 20,
        fontWeight: 'bold',
        margin: '20px 0'
    },
    textField: {
        marginBottom: 20
    },
    ul: {
        margin: 0
    },
    li: {
        display: 'flex',
        alignItems: 'center'
    },
    liText: {
        flex: 1
    },
    link: {
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'none'
        }
    }


});

class ForgetPassword extends Component {
    componentDidMount() {
        this.props.resetAll();
    }

    onChangeLoginId = (e) => {
        this.props.updateField({ loginId: e.target.value.toUpperCase() });
    }

    onChangeTextFiled = (e) => {
        this.props.updateField({
            [e.target.name]: e.target.value
        });
    }
    submitData = (e) => {
        this.props.send({
            loginName: this.props.loginName,
            verifier: {
                loginName: this.props.verifierLoginName,
                password: this.props.verifierPassword
            }
        },
        ()=>{
            this.props.resetAll();
        });
    }

    dialogOKButtonOnClick = () => {
        this.props.updateField({
            dialog: {
                open: false,
                title: this.props.dialog.title,
                contentText: this.props.dialog.contentText
            },
            loginName: '',
            verifierLoginName: '',
            verifierPassword: ''
        });
    }

    render() {
        const { classes, loginId, loginName, verifierLoginName, verifierPassword } = this.props;
        return (
            <div className={classes.root}>
                <ValidatorForm ref="form" onSubmit={this.submitData}>
                    <Grid>
                        <Grid>
                            <img src={cover_DH} alt="" style={{ maxHeight: 300, height: '100%' }} />
                        </Grid>
                        <Grid style={{ marginTop: 30 }}>
                            <h3 style={{ color: 'red', textAlign: 'center' }}>To reset your password, please provide your log-in name below:</h3>
                        </Grid>
                        <Grid style={{ width: 350, margin: '0px auto' }}>
                            <TextFieldValidator
                                id={'forgetPasswordLoginNameTextField'}
                                label={<>Login Name<RequiredIcon /></>}
                                //labelProps={{ style: { width: 250, textAlign: 'left' } }}
                                //labelPosition="left"
                                msgPosition="bottom"
                                name="loginName"
                                value={loginName}
                                validators={[ValidatorEnum.isNoChinese], [ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_IS_NO_CHINESE()], [CommonMessage.REQUIRE_LOGIN_NAME()]}
                                onChange={this.onChangeTextFiled}
                            />
                        </Grid>
                        <Grid style={{ marginTop: 30 }}>
                            <h3 style={{ color: 'red', textAlign: 'center', maxWidth: 650 }}>Please ask the appropriate CIMS user to enter his/her log-in name and password to verify your request:</h3>
                        </Grid>
                        <Grid style={{ width: 350, margin: '0px auto' }}>
                            <TextFieldValidator
                                id={'forgetPasswordVerifyLoginNameTextField'}
                                label={<>Verifier's Login Name<RequiredIcon /></>}
                                // labelProps={{ style: { width: 250, textAlign: 'left' } }}
                                // labelPosition="left"
                                msgPosition="bottom"
                                name="verifierLoginName"
                                value={verifierLoginName}
                                validators={[ValidatorEnum.isNoChinese], [ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_IS_NO_CHINESE()], [CommonMessage.REQUIRE_VERIFIER_NAME()]}
                                onChange={this.onChangeTextFiled}
                            />
                        </Grid>
                        <Grid style={{ width: 350, margin: '30px auto' }}>
                            <PasswordInput
                                id={'forgetPasswordLoginNameTextField'}
                                label={<>Verifier's Password<RequiredIcon /></>}
                                // labelProps={{ style: { width: 250, textAlign: 'left' } }}
                                //labelPosition="left"
                                msgPosition="bottom"
                                name="verifierPassword"
                                value={verifierPassword}
                                validators={[ValidatorEnum.isNoChinese], [ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_IS_NO_CHINESE()], [CommonMessage.REQUIRE_VERIFIER_PASSWORD()]}
                                onChange={this.onChangeTextFiled}
                                inputProps={{
                                    autoComplete: 'new-password'
                                }}
                            />
                            {/* <TextFieldValidator
                                id={'forgetPasswordLoginNameTextField'}
                                label={<>Verifier's Password<RequiredIcon /></>}
                                // labelProps={{ style: { width: 250, textAlign: 'left' } }}
                                //labelPosition="left"
                                msgPosition="bottom"
                                name="verifierPassword"
                                value={verifierPassword}
                                validators={[ValidatorEnum.isNoChinese], [ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_IS_NO_CHINESE()], [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                onChange={this.onChangeTextFiled}
                            /> */}
                        </Grid>
                        <Grid container style={{ marginTop: 30 }}>
                            <Grid item xs={6} style={{ textAlign: 'right' }}>
                                <CIMSButton
                                    id={'submitFogetPasswordForm'}
                                    onClick={(e) => { this.refs.form.submit(e); }}
                                    type="submit"
                                >
                                    Submit
                            </CIMSButton>
                            </Grid>
                            <Grid item xs={6} style={{ textAlign: 'left' }}>
                                <CIMSButton
                                    id={'cancelFogetPasswordForm'}
                                    onClick={() => {
                                        let hostName = '';
                                        const url = window.location.href;
                                        hostName = url.split('/')[0];
                                        window.location.href = hostName + '//' + window.location.host;
                                    }}
                                >
                                    Cancel
                            </CIMSButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>
                {/* <Grid>
                    <ValidatorForm ref="form" className={classes.from} onSubmit={this.submitData}>
                        <Grid className={classes.pageTitle}>
                            Forgot Password
                            </Grid>
                        <Grid className={classes.textField}>
                            <TextField
                                id={'forgetPasswordLoginIdTextField'}
                                labelText="Please enter your login ID:"
                                labelProps={{ style: { width: 380 } }}
                                labelPosition="left"
                                msgPosition="bottom"
                                fullWidth
                                value={loginId}
                                validators={[ValidatorEnum.isNoChinese]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_IS_NO_CHINESE()]}
                                onChange={this.onChangeLoginId}
                            />
                        </Grid>
                        <Grid>
                            <Grid container wrap="nowrap" alignItems="center" justify="space-between">
                                <Typography>Confirm to retrieve temporary password thru Registered Email:&nbsp;&nbsp;&nbsp;&nbsp;</Typography>
                                <CIMSButton
                                    id={'forgetPasswordSendByEmail'}
                                    disabled={loginId.length <= 0}
                                    onClick={(e) => { e.sendType = 'EMAIL'; this.refs.form.submit(e); }}
                                    children="Send"
                                />
                            </Grid>
                            {/* <Grid>
                                Please choose below for retrieving temporary password thru:
                            </Grid>
                            <ul className={classes.ul}>
                                <li className={classes.li}>
                                    <Grid className={classes.liText}>
                                        1.Registered email
                                        </Grid>
                                    <Grid>
                                        <CIMSButton
                                            id={'forgetPasswordSendByEmail'}
                                            disabled={loginId.length <= 0}
                                            onClick={(e) => { e.sendType = 'EMAIL'; this.refs.form.submit(e); }}
                                        >
                                            Send
                                        </CIMSButton>
                                    </Grid>
                                </li>
                                <li className={classes.li}>
                                    <Grid className={classes.liText}>
                                        2.SMS(registered contact number)
                                        </Grid>
                                    <Grid>
                                        <CIMSButton
                                            id={'forgetPasswordSendBySMS'}
                                            disabled={loginId.length <= 0}
                                            onClick={(e) => { e.sendType = 'SMS'; this.refs.form.submit(e); }}
                                        >
                                            Send
                                        </CIMSButton>
                                    </Grid>
                                </li>
                            </ul> */}
                {/* <Link id={'forgetPasswordReturnLogin'} className={classes.link} component={RouterLink} to="/login" >{'<<go to login Page'}</Link> */}
                {/* </Grid>
                    </ValidatorForm>
                </Grid> */}
                <CIMSPromptDialog
                    id={'forgetPasswordPromptDialog'}
                    dialogTitle={this.props.dialog.title}
                    dialogContentText={this.props.dialog.contentText}
                    open={this.props.dialog.open}
                    buttonConfig={
                        [
                            {
                                id: 'forgetPasswordPromptDialogOKButton',
                                name: 'OK',
                                //style: { flex: 1 },
                                onClick: this.dialogOKButtonOnClick
                            }
                        ]
                    }
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loginId: state.forgetPassword.loginId,
        dialog: state.forgetPassword.dialog,
        loginName: state.forgetPassword.loginName,
        verifierLoginName: state.forgetPassword.verifierLoginName,
        verifierPassword: state.forgetPassword.verifierPassword
    };
}
const dispatchProps = {
    updateField,
    send,
    resetAll
};
export default withRouter(connect(mapStateToProps, dispatchProps)(withStyles(style)(ForgetPassword)));

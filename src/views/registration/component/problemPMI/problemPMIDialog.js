import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { AccountBox } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
// import Chip from '@material-ui/core/Chip';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSTable from '../../../../components/Table/CIMSTable';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import Enum from '../../../../enums/enum';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import { RegistrationUtil } from '../../../../utilities';
import PasswordInputNoHint from '../../../compontent/passwordInput/passwordInputNoHint';

const useStyles = makeStyles(theme => ({
    dialogPaper: {
        width: '75%'
    },
    form: {
        width: '100%'
    },
    icon: {
        padding: '0px 15px'
    },
    errorTips: {
        padding: '5px 0px',
        fontWeight: 'bold'
    }
}));

const ProblemPMIDialog = React.forwardRef((props, ref) => {

    const classes = useStyles();
    const problemConfirmFormRef = useRef();
    const {
        open, id, staffId, onChange, onClose,
        onConfirm, data = [], isUserHaveAccess, docTypeCodeList = []
    } = props;

    const getEngName = (value, rowData) => {
        return CommonUtil.getFullName(rowData.engSurname, rowData.engGivename);
    };

    const getFormatDob = (value,rowData) => {
        return RegistrationUtil.getDobDateByFormat(rowData.exactDobCd, value);
    };

    const getPrimaryDocType = (value, rowData) => {
        const docDto = PatientUtil.getPatientPrimaryDoc(rowData.documentPairList);
        if (docDto) {
            const docTypeCode = docTypeCodeList.find(item => item.code === docDto.docTypeCd);
            return docTypeCode && docTypeCode.engDesc;
        }
        return '';
    };

    const getPrimaryDocNo = (value, rowData) => {
        const docDto = PatientUtil.getPatientPrimaryDoc(rowData.documentPairList);
        return PatientUtil.getFormatDocNoByDocumentPair(docDto);
    };

    const getAdditionalDocType = (value, rowData) => {
        const docDto = PatientUtil.getPatientAdditionalDoc(rowData.documentPairList);
        if (docDto) {
            if(docDto.docTypeCd === Enum.DOC_TYPE.HKID_ID){
                return '';
            }
            const docTypeCode = docTypeCodeList.find(item => item.code === docDto.docTypeCd);
            return docTypeCode && docTypeCode.engDesc;
        }
        return '';
    };

    const getAdditionalDocNo = (value, rowData) => {
        const docDto = PatientUtil.getPatientAdditionalDoc(rowData.documentPairList);
        if(docDto){
            if(docDto.docTypeCd === Enum.DOC_TYPE.HKID_ID){
                return '';
            }
            return PatientUtil.getFormatDocNoByDocumentPair(docDto);
        }
        return '';
    };

    const getTableRows = () => {
        return [
            // { name: 'label', label: '', width: 100, align: 'center', customBodyRender: () => { return <Chip color="secondary" label="Problem" />; } },
            { name: 'engName', label: 'English Name', width: 120, customBodyRender: getEngName },
            { name: 'nameChi', label: 'Chinese Name', width: 100 },
            { name: 'docType', label: 'Doc. Type', width: 120, customBodyRender: getPrimaryDocType },
            { name: 'docNo', label: 'Doc. No.', width: 100, customBodyRender: getPrimaryDocNo },
            { name: 'addDocType', label: 'Additional Doc. Type', width: 120, customBodyRender: getAdditionalDocType },
            { name: 'addDocNo', label: 'Additional Doc. No.', width: 100, customBodyRender: getAdditionalDocNo },
            { name: 'dob', label: 'D.O.B.', width: 100, customBodyRender: getFormatDob },
            { name: 'genderCd', label: 'Sex', width: 50 }
        ];
    };

    const getTableOptions = () => {
        return {
            rowHover: false,
            rowsPerPage: 10,
            rowsPerPageOptions: [10, 15, 20]
        };
    };

    const handleConfirm = () => {
        if (isUserHaveAccess) {
            onConfirm();
        } else {
            const formvalid = problemConfirmFormRef.current.isFormValid(false);
            formvalid.then(result => {
                if (result) {
                    onConfirm();
                }
            });
        }
    };

    const isDisabledConfirm = () => {
        return isUserHaveAccess || staffId ? false : true;
    };

    let tRows = getTableRows();
    let tOptions = getTableOptions();
    let loginUserStaffId = props.loginUserStaffId? props.loginUserStaffId: '';
    return (
        <Grid>
            <CIMSPromptDialog
                open={open}
                id={`${id}_problemPMIDialog`}
                dialogTitle="Problem PMI"
                classes={{ paper: classes.dialogPaper }}
                dialogContentText={
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography color="error" className={classes.errorTips}>
                                The following record(s) require verification of PMI and will be flagged as problem PMI records:
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <CIMSTable
                                id={`${id}_problemPMIDialog_table`}
                                data={data}
                                options={tOptions}
                                rows={tRows}
                            />
                        </Grid>
                    </Grid>
                }
                dialogActions={
                    <ValidatorForm className={classes.form} ref={problemConfirmFormRef}>
                        <Grid container alignItems="center" justify="space-between">
                            <Grid item container xs={9}>
                                {
                                    isUserHaveAccess ?
                                        null :
                                        <>
                                            <Grid item container xs={6} wrap="nowrap" alignItems="center">
                                                <AccountBox className={classes.icon} />
                                                <PasswordInputNoHint
                                                    autoFocus
                                                    onBlur={value => onChange(value, 'staffId')}
                                                    inputProps={{ autoComplete: 'off' }}
                                                    value={staffId}
                                                    id={`${id}_problemPMIDialog_staffId`}
                                                    label={<>Approver's Staff ID<RequiredIcon /></>}
                                                    autocomplete="new-password"
                                                    validators={[ValidatorEnum.required,
                                                        ValidatorEnum.matchRegexp('^(?!(^' + loginUserStaffId + '$)).*$')
                                                    ]}
                                                    errorMessages={[
                                                        CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                                        CommonMessage.NON_LOGIN_USER_REQUIRED()
                                                    ]}
                                                />
                                            </Grid>
                                            {/* <Grid item container xs={6} wrap="nowrap" alignItems="center">
                                                <AccountBox className={classes.icon} />
                                                <TextFieldValidator
                                                    fullWidth
                                                    upperCase
                                                    autoFocus
                                                    onChange={e => onChange(e.target.value, 'loginName')}
                                                    value={approverName}
                                                    id={`${id}_problemPMIDialog_approverName`}
                                                    label="Login ID"
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                />
                                            </Grid>
                                            <Grid item container xs={6} wrap="nowrap" alignItems="center">
                                                <Lock className={classes.icon} />
                                                <PasswordInput
                                                    onChange={e => onChange(e.target.value, 'password')}
                                                    value={approverPassword}
                                                    id={`${id}_problemPMIDialog_approverPassword`}
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                />
                                            </Grid> */}
                                        </>
                                }
                            </Grid>
                            <Grid item container xs={3} wrap="nowrap" justify="flex-end">
                                <CIMSButton
                                    id={`${id}_problemPMIDialog_confirmBtn`}
                                    onClick={handleConfirm}
                                    // disabled={isDisabledConfirm()}
                                >Confirm</CIMSButton>
                                <CIMSButton
                                    id={`${id}_problemPMIDialog_cancelBtn`}
                                    onClick={onClose}
                                >Cancel</CIMSButton>
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                }
            />
        </Grid>
    );
});

const mapStateToProps = (state) => {
    return {
        loginUserStaffId: state.login.loginInfo.userDto.staffId
    };
};

const mapDispatchToProps= {
};

export default connect(mapStateToProps, mapDispatchToProps)(ProblemPMIDialog);

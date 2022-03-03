import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/styles/withStyles';
import moment from 'moment';
import memoize from 'memoize-one';
import Grid from '@material-ui/core/Grid';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import DatePicker from '../../../../components/FormValidator/DateFieldValidator';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import UAServices from './component/uaServices';
import { updateState, getSupervisorList, getSuggestLoginName, resetPassword, getUserInfoById } from '../../../../store/actions/administration/userAccount/userAccountAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import Enum from '../../../../enums/enum';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import * as AdminUtil from '../../../../utilities/administrationUtilities';
import { PAGE_STATUS } from '../../../../enums/administration/userAccount/index';
import PassCodeInputNoHint from './component/passCodeInputNoHint';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import _ from 'lodash';
import { isClinicalAdminSetting } from '../../../../utilities/userUtilities';
import { auditAction } from '../../../../store/actions/als/logAction';
import { isSelfEditing } from '../utils.js';

const Spac2Grid = (props) => {
    return <Grid alignContent="center" spacing={2} {...props} />;
};

const getUserStatusList = memoize((status, pageStatus) => {
    let list = [];
    if (pageStatus === PAGE_STATUS.ADDING) {
        // list = AdminUtil.getStatusList([Enum.COMMON_STATUS_PENDING]);
        list = AdminUtil.getStatusList([
            Enum.COMMON_STATUS_ACTIVE,
            Enum.COMMON_STATUS_INACTIVE
        ]);
    } else {
        switch (status) {
            case Enum.COMMON_STATUS_ACTIVE:
            case Enum.COMMON_STATUS_INACTIVE: {
                list = AdminUtil.getStatusList([
                    Enum.COMMON_STATUS_ACTIVE,
                    Enum.COMMON_STATUS_INACTIVE
                ]);
                break;
            }
            case Enum.COMMON_STATUS_EXPIRED: {
                list = AdminUtil.getStatusList([
                    Enum.COMMON_STATUS_ACTIVE,
                    Enum.COMMON_STATUS_EXPIRED,
                    Enum.COMMON_STATUS_DELETED
                ]);
                break;
            }
            case Enum.COMMON_STATUS_LOCKED: {
                list = AdminUtil.getStatusList([
                    Enum.COMMON_STATUS_LOCKED,
                    Enum.COMMON_STATUS_ACTIVE
                ]);
                break;
            }
            case Enum.COMMON_STATUS_DELETED: {
                list = AdminUtil.getStatusList([
                    Enum.COMMON_STATUS_DELETED
                ]);
                break;
            }
            default: {
                list = AdminUtil.getStatusList([Enum.COMMON_STATUS_PENDING]);
                break;
            }
        }
    }
    return list;
});

let fieldValids = {
    validators: {
        englishName: [ValidatorEnum.required, ValidatorEnum.isSpecialEnglish],
        chineseName: [ValidatorEnum.isChinese],
        loginName: [ValidatorEnum.required, ValidatorEnum.loginName],
        email: [ValidatorEnum.required, ValidatorEnum.isEmail, ValidatorEnum.isDHEmail],
        gender: [ValidatorEnum.required],
        contactPhone: [ValidatorEnum.required, ValidatorEnum.isNumber, ValidatorEnum.phoneNo, ValidatorEnum.minStringLength(8)],
        position: [ValidatorEnum.required],
        accountStatus: [ValidatorEnum.required]
    },
    errorMessages: {
        englishName: [
            CommonMessage.VALIDATION_NOTE_REQUIRED(),
            CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
        ],
        chineseName: [CommonMessage.VALIDATION_NOTE_CHINESEFIELD()],
        loginName: [
            CommonMessage.VALIDATION_NOTE_REQUIRED(),
            CommonMessage.VALIDATION_NOTE_LOGIN_NAME()
            // CommonMessage.VALIDATION_NOTE_ERROR_LOGIN_NAME()
        ],
        email: [
            CommonMessage.VALIDATION_NOTE_REQUIRED(),
            CommonMessage.VALIDATION_NOTE_EMAILFIELD(),
            CommonMessage.VALIDATION_NOTE_DHEMAIL()
        ],
        gender: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
        contactPhone: [
            CommonMessage.VALIDATION_NOTE_REQUIRED(),
            CommonMessage.VALIDATION_NOTE_NUMBERFIELD(),
            CommonMessage.VALIDATION_NOTE_PHONE_NO(),
            CommonMessage.VALIDATION_NOTE_PHONE_BELOWMINWIDTH()
        ],
        position: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
        accountStatus: [CommonMessage.VALIDATION_NOTE_REQUIRED()]
    }
};

const id = 'uaGeneralInfo';
const UAGeneralInfo = (props) => {
    const {
        classes, updateState, uaGeneral, userInfo, genderList, //NOSONAR
        userServices, getSupervisorList, supervisorList, getSuggestLoginName, pageStatus, //NOSONAR
        openCommonMessage, sourceUser, isSystemAdmin, isServiceAdmin, isClinicalAdmin, loginUser, //NOSONAR
        auditAction
    } = props;
    const { validators, errorMessages } = fieldValids;

    let userExpiryDateRef = React.useRef(null);
    let efftDateRef = React.useRef(null);
    let engSurnameRef = React.useRef(null);
    let engGiveNameRef = React.useRef(null);
    let uaServicesRef = React.useRef(null);
    let passCodeFieldRef = React.useRef(null);
    let rePasscodeFieldRef = React.useRef(null);

    const initData = () => {
        const userSvcCds = userServices.map(item => item.svcCd);
        getSupervisorList(userSvcCds);
    };

    React.useEffect(() => {
        initData();
    }, []);
    React.useEffect(() => {
        ValidatorForm.addValidationRule(ValidatorEnum.isSamePasscodeInGeneralInfo, () => {
            // const userInfo = _.cloneDeep(props.userInfo);

            if (userInfo.passCode !== '' && userInfo.rePassCode !== '') {
                let result = (userInfo.passCode !== userInfo.rePassCode);
                return !result;
            }
            else {
                return true;
            }
        });
    }, [props.userInfo]);

    const updateUaGeneral = (info) => {
        let copyUserInfo = { ...userInfo, ...info };
        updateState({
            uaGeneral: {
                ...uaGeneral,
                userInfo: copyUserInfo
            }
        });
    };

    const updateAdmin = (value) => {
        updateUaGeneral({ isAdmin: value });
        // uaServicesRef.current && uaServicesRef.current.refreshServiceColumn();
    };

    const updatePatientStatus = (value) => {
        let info = { status: value };
        if (value === Enum.COMMON_STATUS_ACTIVE && pageStatus === PAGE_STATUS.EDITING) {
            if (sourceUser) {
                const originalEfftDate = sourceUser.acctEfftDate;
                info.efftDate = originalEfftDate;
            }
        }
        updateUaGeneral(info);
    };

    const handleSuggestName = () => {
        if (userInfo.loginName) {
            openCommonMessage({
                msgCode: '110340',
                btnActions: {
                    btn1Click: () => {
                        auditAction('Suggest login name');
                        getSuggestLoginName(userInfo.engSurname, userInfo.engGivenName);
                    }
                }
            });
        } else {
            auditAction('Suggest login name');
            getSuggestLoginName(userInfo.engSurname, userInfo.engGivenName);
        }
    };

    const handleResetPassword = () => {
        if (userInfo.loginName) {
            auditAction('Reset password');
            props.resetPassword(
               userInfo.loginName,
               'EMAIL',
               function(){
                    props.getUserInfoById(userInfo.userId);
               }
           );
        }
    };

    const handleDateValidate = () => {
        userExpiryDateRef && userExpiryDateRef.validateCurrent();
        if (userInfo.status == Enum.COMMON_STATUS_INACTIVE) {
            efftDateRef && efftDateRef.validateCurrent();
        }
    };

    const getValidatiors = (name)=>{
        if(name === 'Email'){
            if(userInfo.loginName.startsWith('@')){
                return [ValidatorEnum.required, ValidatorEnum.isEmail, ValidatorEnum.isHAEmail];
            }else{
                return validators.email;
            }
        }
    };

    const getErrorMessages = (name)=>{
        if(name === 'Email'){
            if(userInfo.loginName.startsWith('@')){
                return [
                    CommonMessage.VALIDATION_NOTE_REQUIRED(),
                    CommonMessage.VALIDATION_NOTE_EMAILFIELD(),
                    CommonMessage.VALIDATION_NOTE_HAEMAIL()
                ];
            }else{
                return errorMessages.email;
            }
        }
    };

    const isNonEdit = pageStatus === PAGE_STATUS.NONEDITABLE;

    const isEnableSuggest = userInfo.engSurname && userInfo.engGivenName &&
        engSurnameRef.current && engSurnameRef.current.isValidCurr() &&
        engGiveNameRef.current && engGiveNameRef.current.isValidCurr();

    // const isEnableAdmin = () => {
    //     const userSvcCds = userServices.map(item => item.svcCd);
    //     const curUaSvcs = uaServiceList.filter(item => item.svcCd).map(item => item.svcCd);
    //     return _.difference(curUaSvcs, userSvcCds).length === 0;
    // };

    const isCurrentUserEdit = pageStatus === PAGE_STATUS.EDITING && userInfo.userId === loginUser.userId;

    const isEnableEffDate =
        (userInfo.status === Enum.COMMON_STATUS_INACTIVE || userInfo.status === Enum.COMMON_STATUS_PENDING)
        && !isCurrentUserEdit
        && !isNonEdit;

    const statusList = getUserStatusList(sourceUser && sourceUser.status, pageStatus);

    // const isEnableLoginName = userInfo.status === Enum.COMMON_STATUS_PENDING;
    const isEnableLoginName = pageStatus === PAGE_STATUS.ADDING;

    const isEfftDateValid = userInfo.efftDate && moment(userInfo.efftDate).isValid();

    const isExpyDateValid = userInfo.userExpiryDate && moment(userInfo.userExpiryDate).isValid();

    const isPending = userInfo.status === Enum.COMMON_STATUS_PENDING;

    const isEfftDateModified = !sourceUser || (sourceUser && sourceUser.acctEfftDate && moment(sourceUser.acctEfftDate).isValid()
        && !moment(sourceUser.acctEfftDate).isSame(userInfo.efftDate, 'day'));

    const isExpyDateModified = !sourceUser || (sourceUser && sourceUser.acctExpyDate && moment(sourceUser.acctExpyDate).isValid()
        && !moment(sourceUser.acctExpyDate).isSame(userInfo.userExpiryDate, 'day'));

    const efftDateValidators = [ValidatorEnum.isRightMoment];
    const efftErrorMessages = [CommonMessage.VALIDATION_NOTE_INVALID_MOMENT()];
    const expyDateValidators = [ValidatorEnum.isRightMoment];
    const expyErrorMessages = [CommonMessage.VALIDATION_NOTE_INVALID_MOMENT()];

    if (isEfftDateValid) {
        expyDateValidators.push(ValidatorEnum.minDate(moment(userInfo.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE)));
        expyErrorMessages.push(CommonMessage.VALIDATION_NOTE_EXPIRY_DATE());
    }

    if (isExpyDateValid) {
        efftDateValidators.push(ValidatorEnum.maxDate(moment(userInfo.userExpiryDate).format(Enum.DATE_FORMAT_EYMD_VALUE)));
        efftErrorMessages.push(CommonMessage.VALIDATION_NOTE_EFFECTIVE_DATE());
    }

    if (isEfftDateModified) {
        efftDateValidators.push(ValidatorEnum.minDate(moment().format(Enum.DATE_FORMAT_EYMD_VALUE)));
        efftErrorMessages.push(CommonMessage.VALIDATION_NOTE_DISABLE_PAST());
    }

    if (isExpyDateModified) {
        expyDateValidators.push(ValidatorEnum.minDate(moment().format(Enum.DATE_FORMAT_EYMD_VALUE)));
        expyErrorMessages.push(CommonMessage.VALIDATION_NOTE_DISABLE_PAST());
    }

    return (
        <Grid container justify="center">
            <Grid container className={classes.root} spacing={3}>
                <Spac2Grid item container>
                    <Grid item container xs={2}>
                        <Select
                            id={`${id}_salutation`}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: 'Salutation'
                            }}
                            options={Enum.COMMON_SALUTATION.map((item) => ({ value: item.code, label: item.engDesc }))}
                            value={userInfo.salutation}
                            onChange={e => updateUaGeneral({ salutation: e.value })}
                            addNullOption
                            // absoluteMessage
                            isDisabled={isNonEdit}
                        />
                    </Grid>
                    <Grid item container xs={5}>
                        <FastTextFieldValidator
                            id={`${id}_surname`}
                            ref={engSurnameRef}
                            label={<>Surname<RequiredIcon /></>}
                            variant="outlined"
                            onlyOneSpace
                            upperCase
                            // absoluteMessage
                            value={userInfo.engSurname}
                            inputProps={{ maxLength: 40 }}
                            onBlur={e => updateUaGeneral({ engSurname: e.target.value })}
                            validators={validators.englishName}
                            errorMessages={errorMessages.englishName}
                            warning={[ValidatorEnum.isEnglishWarningChar]}
                            warningMessages={[CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                            disabled={isNonEdit}
                        />
                    </Grid>
                    <Grid item container xs={5}>
                        <FastTextFieldValidator
                            id={`${id}_givenName`}
                            ref={engGiveNameRef}
                            label={<>Given Name<RequiredIcon /></>}
                            variant="outlined"
                            onlyOneSpace
                            upperCase
                            // absoluteMessage
                            value={userInfo.engGivenName}
                            inputProps={{ maxLength: 40 }}
                            onBlur={e => updateUaGeneral({ engGivenName: e.target.value })}
                            validators={validators.englishName}
                            errorMessages={errorMessages.englishName}
                            warning={[ValidatorEnum.isEnglishWarningChar]}
                            warningMessages={[CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                            disabled={isNonEdit}
                        />
                    </Grid>
                </Spac2Grid>
                <Spac2Grid item container>
                    <Grid item container xs={2}>
                        <FastTextFieldValidator
                            id={`${id}_nameChi`}
                            label="Chinese Name"
                            variant="outlined"
                            // absoluteMessage
                            value={userInfo.chiFullName}
                            calActualLength
                            inputProps={{ maxLength: 18 }}
                            onBlur={e => updateUaGeneral({ chiFullName: e.target.value })}
                            //validators={validators.chineseName}
                            //errorMessages={errorMessages.chineseName}
                            disabled={isNonEdit}
                        />
                    </Grid>
                    <Grid item container xs={5}>
                        <FastTextFieldValidator
                            id={`${id}_loginName`}
                            label={<>Login Name<RequiredIcon /></>}
                            variant="outlined"
                            // absoluteMessage
                            value={userInfo.loginName}
                            inputProps={{ maxLength: 20 }}
                            onBlur={e => updateUaGeneral({ loginName: e.target.value })}
                            // onlyOneSpace
                            // onlyOneUnderline
                            validators={validators.loginName}
                            errorMessages={errorMessages.loginName}
                            disabled={!isEnableLoginName || pageStatus === PAGE_STATUS.EDITING}
                        />
                    </Grid>
                    <Grid item container xs={5}>
                        <CIMSButton
                            id={`${id}_suggestBtn`}
                            className={classes.button}
                            children="Suggest Login Name"
                            onClick={handleSuggestName}
                            disabled={!isEnableSuggest || isNonEdit || !isEnableLoginName || pageStatus === PAGE_STATUS.EDITING}
                        />
                    </Grid>
                </Spac2Grid>
                <Spac2Grid item container>
                    <Grid item container xs={2}>
                        <Select
                            id={`${id}_genderCd`}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Gender<RequiredIcon /></>
                            }}
                            // absoluteMessage
                            options={genderList.map(item => ({ value: item.code, label: item.engDesc }))}
                            value={userInfo.genderCd}
                            onChange={e => updateUaGeneral({ genderCd: e.value })}
                            validators={validators.gender}
                            errorMessages={errorMessages.gender}
                            isDisabled={isNonEdit}
                        />
                    </Grid>
                    <Grid item container xs={5}>
                        <FastTextFieldValidator
                            id={`${id}_email`}
                            label={<>Email<RequiredIcon /></>}
                            variant="outlined"
                            // absoluteMessage
                            value={userInfo.email}
                            inputProps={{ maxLength: 80 }}
                            onBlur={e => updateUaGeneral({ email: e.target.value })}
                            validators={getValidatiors('Email')}
                            errorMessages={getErrorMessages('Email')}
                            // disabled={isNonEdit || (isClinicalAdminSetting() && pageStatus === PAGE_STATUS.EDITING) || (!isSystemAdmin && !isClinicalAdmin && !isServiceAdmin)}
                            /**CIMST-2869 Enhancement for self-editing: UAM-ALL users NOT allow to edit */
                            disabled={isNonEdit
                                || (isClinicalAdminSetting() && pageStatus === PAGE_STATUS.EDITING)
                                || (!isSystemAdmin && !isClinicalAdmin && !isServiceAdmin)
                                || isSelfEditing(loginUser.userId, userInfo.userId, pageStatus)
                            }
                        />
                    </Grid>
                    <Grid item container xs={5} className={classes.padding8Grid}>
                        <Grid item xs={6}>
                            <FastTextFieldValidator
                                id={`${id}_contactPhone`}
                                label={<>Contact Phone<RequiredIcon /></>}
                                variant="outlined"
                                // absoluteMessage
                                value={userInfo.contactPhone}
                                inputProps={{ maxLength: 8 }}
                                type="number"
                                onBlur={e => updateUaGeneral({ contactPhone: e.target.value })}
                                validators={validators.contactPhone}
                                errorMessages={errorMessages.contactPhone}
                                disabled={isNonEdit}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FastTextFieldValidator
                                id={`${id}_position`}
                                label={<>Position<RequiredIcon /></>}
                                variant="outlined"
                                // absoluteMessage
                                value={userInfo.position}
                                inputProps={{ maxLength: 33 }}
                                onBlur={e => updateUaGeneral({ position: e.target.value })}
                                validators={validators.position}
                                errorMessages={errorMessages.position}
                                disabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                            />
                        </Grid>
                    </Grid>
                </Spac2Grid>
                <Spac2Grid item container>
                    <Grid item container xs={2}>
                        <FastTextFieldValidator
                            id={`${id}_eHRUID`}
                            label={<>eHRUID</>}
                            variant="outlined"
                            // absoluteMessage
                            value={userInfo.ehruId}
                            inputProps={{ maxLength: 10 }}
                            type="number"
                            onBlur={e => updateUaGeneral({ ehruId: e.target.value })}
                            disabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                        />
                    </Grid>
                    <Grid item container xs={5}>
                        <FastTextFieldValidator
                            id={`${id}_ecsUserId`}
                            label={<>ECS User ID</>}
                            variant="outlined"
                            // absoluteMessage
                            value={userInfo.ecsUserId}
                            inputProps={{ maxLength: 100 }}
                            onBlur={e => updateUaGeneral({ ecsUserId: e.target.value })}
                            disabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                        />
                    </Grid>
                    <Grid item container xs={5}>
                        <FastTextFieldValidator
                            id={`${id}_doctorCode`}
                            label={<>Doctor Code for Laboratory (H&C)</>}
                            variant="outlined"
                            // absoluteMessage
                            value={userInfo.doctorCd}
                            inputProps={{ maxLength: 12 }}
                            onBlur={e => updateUaGeneral({ doctorCd: e.target.value })}
                            disabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                        />
                    </Grid>
                </Spac2Grid>
                <Spac2Grid item container>
                    <Grid item container xs={7}>
                        <Select
                            id={`${id}_supervisor`}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Supervisor</>
                            }}
                            // absoluteMessage
                            addNullOption
                            options={supervisorList && supervisorList.map(item => ({ value: item.loginName, label: item.loginName ? `${item.loginName} [${item.engGivName} ${item.engSurname}]` : '' }))}
                            value={userInfo.supervisor}
                            onChange={e => updateUaGeneral({ supervisor: e.value })}
                            isDisabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin)}
                        />
                    </Grid>
                    {!isSystemAdmin ? null : <Grid item >
                        <FormControlLabel
                            id={`${id}_isAdmin`}
                            label="Is Admin"
                            // disabled={!isEnableAdmin() || isNonEdit}
                            disabled={isNonEdit || (isSystemAdmin && loginUser.userId === userInfo.userId && pageStatus === PAGE_STATUS.EDITING)}
                            control={
                                <CheckBox
                                    checked={userInfo.isAdmin ? true : false}
                                    onChange={e => updateAdmin(e.target.checked ? 1 : 0)}
                                    color="primary"
                                />
                            }
                        />
                    </Grid>}
                    <Grid item container xs={4} spacing={2}>
                        {(userInfo.isPassCodeShow) ? <Grid item container xs={6}>
                            <PassCodeInputNoHint
                                id="passCodeInputNoHint"
                                value={userInfo.passCode}
                                inputProps={{ maxLength: 2000, autoComplete: 'off' }}
                                label={<>Passcode<RequiredIcon /></>}
                                onBlur={(value) => {
                                    rePasscodeFieldRef.validateCurrent();
                                    updateUaGeneral({ passCode: value });
                                }}
                                ref={r => passCodeFieldRef = r}
                                validators={[ValidatorEnum.required, ValidatorEnum.equalStringLength(5), ValidatorEnum.isSamePasscodeInGeneralInfo]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_PASSCODE_CHARACTORS(), CommonMessage.VALIDATION_SAME_PASSCODE()]}
                                disabled={isNonEdit}
                            />
                        </Grid> : null}
                        {(userInfo.isPassCodeShow) ? <Grid item container xs={6}>
                            <PassCodeInputNoHint
                                id="rePassCodeInputNoHint"
                                value={userInfo.rePassCode}
                                inputProps={{ maxLength: 2000, autoComplete: 'off' }}
                                label={<>Re-enter Passcode<RequiredIcon /></>}
                                onBlur={(value) => {
                                    passCodeFieldRef.validateCurrent();
                                    updateUaGeneral({ rePassCode: value });
                                }}
                                ref={r => rePasscodeFieldRef = r}
                                validators={[ValidatorEnum.required, ValidatorEnum.equalStringLength(5), ValidatorEnum.isSamePasscodeInGeneralInfo]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_PASSCODE_CHARACTORS(), CommonMessage.VALIDATION_SAME_PASSCODE()]}
                                disabled={isNonEdit}
                            />
                        </Grid> : null}
                    </Grid>
                </Spac2Grid>
                <Spac2Grid item container>
                    <Grid item container xs={7} className={classes.padding8Grid}>
                        <Grid item xs={3}>
                            <Select
                                id={`${id}_accountStatus`}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Account Status<RequiredIcon /></>
                                }}
                                isDisabled={(userInfo.status === Enum.COMMON_STATUS_PENDING || isCurrentUserEdit)}
                                // absoluteMessage
                                options={statusList.map((item) => ({ value: item.code, label: item.engDesc }))}
                                value={userInfo.status}
                                onChange={e => updatePatientStatus(e.value)}
                                validators={validators.accountStatus}
                                errorMessages={errorMessages.accountStatus}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <DatePicker
                                id={`${id}_accountEffDate`}
                                ref={ref => efftDateRef = ref}
                                inputVariant="outlined"
                                clearable
                                // absoluteMessage
                                disablePast={isEnableEffDate && pageStatus == PAGE_STATUS.ADDING}
                                disabled={!isEnableEffDate}
                                label={<>Account Effective Date</>}
                                value={userInfo.efftDate}
                                onChange={e => updateUaGeneral({ efftDate: e })}
                                onBlur={handleDateValidate}
                                onAccept={handleDateValidate}
                                ignorePresetValidators
                                validators={efftDateValidators}
                                errorMessages={efftErrorMessages}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <DatePicker
                                id={`${id}_accountExpDate`}
                                ref={ref => userExpiryDateRef = ref}
                                inputVariant="outlined"
                                clearable
                                // absoluteMessage
                                disablePast
                                disablePastMessage={CommonMessage.VALIDATION_NOTE_EXPIRY_DATE()}
                                disabled={isNonEdit || isCurrentUserEdit}
                                label={<>Account Expiry Date</>}
                                value={userInfo.userExpiryDate}
                                onChange={e => updateUaGeneral({ userExpiryDate: e })}
                                onBlur={handleDateValidate}
                                onAccept={handleDateValidate}
                                ignorePresetValidators
                                validators={expyDateValidators}
                                errorMessages={expyErrorMessages}
                            />
                        </Grid>
                        <Grid item xs={3} style={{ display: (pageStatus === PAGE_STATUS.ADDING || isPending) ? 'none' : '' }}>
                            <CIMSButton
                                id={`${id}_resetPassword`}
                                style={{ width: '100%' }}
                                className={classes.button}
                                children="Reset Password"
                                onClick={handleResetPassword}
                                disabled={isNonEdit}
                            />
                        </Grid>
                    </Grid>
                </Spac2Grid>
                <Spac2Grid item container style={{ marginTop: 8 }}>
                    <UAServices innerRef={uaServicesRef} />
                </Spac2Grid>
            </Grid>
        </Grid>
    );
};

const styles = theme => ({
    root: {
        width: '90%',
        paddingTop: 10
    },
    button: {
        margin: 0
    },
    padding8Grid: {
        padding: '0px !important',
        '& > div': {
            padding: 8
        }
    }
});

const mapState = state => ({
    pageStatus: state.userAccount.pageStatus,
    uaGeneral: state.userAccount.uaGeneral,
    sourceUser: state.userAccount.uaGeneral.sourceUser,
    userInfo: state.userAccount.uaGeneral.userInfo,
    supervisorList: state.userAccount.uaGeneral.supervisorList,
    uaServiceList: state.userAccount.uaGeneral.uaServiceList,
    userServices: state.login.loginInfo.userDto.uamMapUserSvcDtos,
    genderList: state.common.commonCodeList.gender || [],
    isSystemAdmin: state.login.isSystemAdmin,
    isServiceAdmin: state.login.isServiceAdmin,
    isClinicalAdmin: state.login.isClinicalAdmin,
    loginUser: state.login.loginInfo.userDto
});

const mapDispatch = {
    updateState,
    getSupervisorList,
    getSuggestLoginName,
    openCommonMessage,
    resetPassword,
    getUserInfoById,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(UAGeneralInfo));
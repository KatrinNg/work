import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography
} from '@material-ui/core';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import Enum from '../../../../enums/enum';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ButtonStatusEnum from '../../../../enums/administration/buttonStatusEnum';
import moment from 'moment';

const styles = () => ({
    grid: {
        margin: '8px 0px'
    },
    h6Title: {
        marginTop: 0,
        marginBottom: 8
    },
    button: {
        margin: 4,
        textTransform: 'none'
    },
    buttonLabel: {
        fontSize: 12
    }
});

class UserProfileBasicInfoPanel extends React.Component {

    handleDateValidate = () => {
        this.userExpiryDateRef.validateCurrent();
        if( this.props.userSearchData.status == 'I'){
            this.efftDateRef.validateCurrent();
        }
    }

    render() {
        const { classes, userSearchData, isInputDisabled ,defaultUserStatus} = this.props;
        const id = this.props.id ? this.props.id : 'user_profile_basic_info_panel';

        const fieldValidators = {
            salutation: [],
            engSurName: [ValidatorEnum.required, ValidatorEnum.isEnglishOrSpace],
            engGivenName: [ValidatorEnum.required, ValidatorEnum.isEnglishOrSpace],
            chineseName: [ValidatorEnum.isChinese],
            loginName: [ValidatorEnum.required],
            email: [ValidatorEnum.required, ValidatorEnum.isEmail],
            gender: [ValidatorEnum.required],
            contactPhone: [ValidatorEnum.required, ValidatorEnum.isNumber, ValidatorEnum.phoneNo, ValidatorEnum.minStringLength(8)],
            position: [ValidatorEnum.required],
            supervisor: [],
            accountExpiryDate: [],
            accountStatus: [ValidatorEnum.required]
        };

        const fieldErrorMessages = {
            salutation: [],
            engSurName: [
                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                CommonMessage.VALIDATION_NOTE_ENGLISHFIELD()
            ],
            engGivenName: [
                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                CommonMessage.VALIDATION_NOTE_ENGLISHFIELD()
            ],
            chineseName: [CommonMessage.VALIDATION_NOTE_CHINESEFIELD()],
            loginName: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            email: [
                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                CommonMessage.VALIDATION_NOTE_EMAILFIELD()
            ],
            gender: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            contactPhone: [
                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                CommonMessage.VALIDATION_NOTE_NUMBERFIELD(),
                CommonMessage.VALIDATION_NOTE_PHONE_NO(),
                CommonMessage.VALIDATION_NOTE_PHONE_BELOWMINWIDTH()
            ],
            position: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            supervisor: [],
            accountExpiryDate: [],
            accountStatus: [CommonMessage.VALIDATION_NOTE_REQUIRED()]
        };
        return (
            <Grid item container xs={12} >
                <Typography variant="h6" className={classes.h6Title}>Basic Information</Typography>
                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <SelectFieldValidator
                            id={`${id}_salutation`}
                            options={Enum.COMMON_SALUTATION.map((item) => ({ value: item.code, label: item.engDesc }))}
                            msgPosition={'bottom'}
                            validators={fieldValidators.salutation}
                            errorMessages={fieldErrorMessages.salutation}
                            isDisabled={isInputDisabled}
                            value={userSearchData.salutation}
                            onChange={(e) => this.props.handleSelectChange(e, 'salutation')}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Salutation</>
                            }}
                            addNullOption
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_surname`}
                            upperCase
                            fullWidth
                            onlyOneSpace
                            validByBlur
                            inputProps={{maxLength: 40}}
                            msgPosition={'bottom'}
                            name="engSurname"
                            validators={[
                                ValidatorEnum.required,
                                ValidatorEnum.isSpecialEnglish
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
                            ]}
                            warning={[
                                ValidatorEnum.isEnglishWarningChar
                            ]}
                            warningMessages={[
                                CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                            ]}
                            disabled={isInputDisabled}
                            value={userSearchData.engSurname}
                            onChange={this.props.handleChange}
                            label={<>Surname<RequiredIcon /></>}
                            variant={'outlined'}
                            trim={'all'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_given_name`}
                            fullWidth
                            upperCase
                            onlyOneSpace
                            validByBlur
                            inputProps={{maxLength: 40}}
                            name="engGivenName"
                            msgPosition={'bottom'}
                            validators={[
                                ValidatorEnum.required,
                                ValidatorEnum.isSpecialEnglish
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
                            ]}
                            warning={[
                                ValidatorEnum.isEnglishWarningChar
                            ]}
                            warningMessages={[
                                CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                            ]}
                            disabled={isInputDisabled}
                            value={userSearchData.engGivenName}
                            onChange={this.props.handleChange}
                            label={<>Given Name<RequiredIcon /></>}
                            variant={'outlined'}
                            trim={'all'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_chinese_name`}
                            fullWidth
                            inputProps={{ maxLength: 6 }}
                            name="chiFullName"
                            msgPosition={'bottom'}
                            validByBlur
                            //validators={fieldValidators.chineseName}
                            //errorMessages={fieldErrorMessages.chineseName}
                            disabled={isInputDisabled}
                            value={userSearchData.chiFullName}
                            onChange={this.props.handleChange}
                            label={<>Chinese Name</>}
                            variant={'outlined'}
                            trim={'all'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_salutation_login_name`}
                            fullWidth
                            upperCase
                            validByBlur
                            inputProps={{ maxLength: 20 }}
                            name="loginName"
                            msgPosition={'bottom'}
                            validators={[
                                ValidatorEnum.required,
                                ValidatorEnum.isEnglishOrNumber
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                CommonMessage.VALIDATION_NOTE_ENGLISH_OR_NUM()
                            ]}
                            disabled={isInputDisabled}
                            value={userSearchData.loginName}
                            onChange={this.props.handleChange}
                            label={<>Login Name<RequiredIcon /></>}
                            variant={'outlined'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_salutation_email`}
                            fullWidth
                            validByBlur
                            inputProps={{ maxLength: 80 }}
                            name="email"
                            msgPosition={'bottom'}
                            validators={fieldValidators.email}
                            errorMessages={fieldErrorMessages.email}
                            disabled={isInputDisabled}
                            value={userSearchData.email}
                            onChange={this.props.handleChange}
                            label={<>Email<RequiredIcon /></>}
                            variant={'outlined'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <SelectFieldValidator
                            id={`${id}_gender`}
                            options={this.props.pageCodeList.gender &&
                                this.props.pageCodeList.gender.map((item) => (
                                    { value: item.code, label: item.engDesc }))}
                            msgPosition={'bottom'}
                            validators={fieldValidators.gender}
                            errorMessages={fieldErrorMessages.gender}
                            isDisabled={isInputDisabled}
                            value={userSearchData.genderCd}
                            onChange={(e) => this.props.handleSelectChange(e, 'genderCd')}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Gender<RequiredIcon /></>
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_contact_phone`}
                            fullWidth
                            validByBlur
                            inputProps={{ maxLength: 8 }}
                            name="contactPhone"
                            msgPosition={'bottom'}
                            validators={fieldValidators.contactPhone}
                            errorMessages={fieldErrorMessages.contactPhone}
                            disabled={isInputDisabled}
                            value={userSearchData.contactPhone}
                            onChange={this.props.handleChange}
                            label={<>Contact Phone<RequiredIcon /></>}
                            variant={'outlined'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_position`}
                            fullWidth
                            validByBlur
                            inputProps={{ maxLength: 33 }}
                            name="position"
                            msgPosition={'bottom'}
                            validators={fieldValidators.position}
                            errorMessages={fieldErrorMessages.position}
                            disabled={isInputDisabled}
                            value={userSearchData.position}
                            onChange={this.props.handleChange}
                            label={<>Position<RequiredIcon /></>}
                            variant={'outlined'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <TextFieldValidator
                            id={`${id}_supervisor`}
                            fullWidth
                            validByBlur
                            inputProps={{ maxLength: 13 }}
                            name="supervisor"
                            msgPosition={'bottom'}
                            validators={fieldValidators.supervisor}
                            errorMessages={fieldErrorMessages.supervisor}
                            disabled={isInputDisabled}
                            value={userSearchData.supervisor}
                            onChange={this.props.handleChange}
                            label={<>Supervisor</>}
                            variant={'outlined'}
                        />
                    </Grid>
                </Grid>

                <Grid container className={classes.grid}>
                    <Grid item xs={12}>
                        <DateFieldValidator
                            ref={ref => this.userExpiryDateRef = ref}
                            id={`${id}_account_expiry_date`}
                            msgPosition={'bottom'}
                            disabled={isInputDisabled}
                            disablePast
                            isRequired
                            value={userSearchData.userExpiryDate}
                            onChange={(e) => this.props.handleDateChange(e, 'userExpiryDate')}
                            onBlur={this.handleDateValidate}
                            onAccept={this.handleDateValidate}
                            label={<>Account Expiry Date<RequiredIcon /></>}
                            validByBlur
                        />
                    </Grid>
                </Grid>
                {
                    userSearchData.status == 'I' ? <Grid container className={classes.grid}>
                        <Grid item xs={12}>
                            <DateFieldValidator
                                ref={ref => this.efftDateRef = ref}
                                id={`${id}_account_effective_date`}
                                msgPosition={'bottom'}
                                disabled={isInputDisabled}
                                disablePast
                                isRequired
                                value={userSearchData.efftDate}
                                onChange={(e) => this.props.handleDateChange(e, 'efftDate')}
                                onBlur={this.handleDateValidate}
                                onAccept={this.handleDateValidate}
                                label={<>Account Effective Date<RequiredIcon /></>}
                                validByBlur
                                maxDate={moment(userSearchData.userExpiryDate).format(Enum.DATE_FORMAT_EYMD_12_HOUR_CLOCK)}
                                maxDateMessage={CommonMessage.VALIDATION_NOTE_EFFECTIVE_MAX_DATE()}
                            />
                        </Grid>
                    </Grid> : null
                }
                {
                    (userSearchData.status == 'I' || this.props.userProfileStatus === ButtonStatusEnum.ADD) ? null : <Grid container className={classes.grid}>
                        <Grid item xs={12}>
                            <SelectFieldValidator
                                id={`${id}_account_status`}
                                options={Enum.COMMON_STATUS.map((item) => ({ value: item.code, label: item.engDesc }))}
                                msgPosition={'bottom'}
                                validators={fieldValidators.accountStatus}
                                errorMessages={fieldErrorMessages.accountStatus}
                                isDisabled={isInputDisabled}
                                value={userSearchData.status}
                                onChange={(e) => this.props.handleSelectChange(e, 'status')}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Account Status<RequiredIcon /></>
                                }}
                                filterOption={(option, raw) => {
                                    if (defaultUserStatus == 'L') {
                                        return option.value && option.label && option.value != 'S' && option.label.search(raw) != -1;
                                    } else if (defaultUserStatus != 'I') {
                                        return option.value && option.label && option.value != 'L' && option.label.search(raw) != -1;
                                    } else {
                                        return false;
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                }

            </Grid>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        isTemporaryLogin: state.login.isTemporaryLogin === 'Y',
        isFirstTimeLogin: state.login.isTemporaryLogin === 'F',
        isExpiryLogin: state.login.isTemporaryLogin === 'E',
        userProfileStatus: state.userProfile.status,
        defaultUserStatus:state.userProfile.defaultUserStatus
    };
};

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserProfileBasicInfoPanel));
import React from 'react';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import FieldConstant from '../../../../constants/fieldConstant';
import CommonMessage from '../../../../constants/commonMessage';
import RegFieldLength from '../../../../enums/registration/regFieldLength';
import {
    FormControl,
    Grid
} from '@material-ui/core';
import ValidatorEnum from '../../../../enums/validatorEnum';
import Enum from '../../../../enums/enum';
import memoize from 'memoize-one';

export const getPhoneLength = memoize((dialingCd) => {
    let maxLength;
    if (dialingCd !== FieldConstant.DIALING_CODE_DEFAULT_VALUE) {
        maxLength = RegFieldLength.CONTACT_PHONE_OTHERS_MAX;
    } else {
        maxLength = RegFieldLength.CONTACT_PHONE_DEFAULT_MAX;
    }
    return maxLength;
});

const getPhoneValidators = (isRequired, isPhoneRequired, phone) => {
    let
        validators = [ValidatorEnum.phoneNo],
        errMsgs = [CommonMessage.VALIDATION_NOTE_PHONE_NO()];
    if (phone && phone.dialingCd === FieldConstant.DIALING_CODE_DEFAULT_VALUE) {
        validators = validators.concat([
            ValidatorEnum.minStringLength(RegFieldLength.CONTACT_PHONE_DEFAULT_MAX),
            ValidatorEnum.maxStringLength(RegFieldLength.CONTACT_PHONE_DEFAULT_MAX)
        ]);
        errMsgs = errMsgs.concat([
            CommonMessage.VALIDATION_NOTE_PHONE_BELOWMINWIDTH(),
            CommonMessage.VALIDATION_NOTE_OVERMAXWIDTH()
        ]);
    }

    //CIMST-3391 remove validation checking of "Mobile" & "Mobile SMS", except checking 8 digits
    // if (phone && phone.dialingCd === FieldConstant.DIALING_CODE_DEFAULT_VALUE && (phone.phoneTypeCd === Enum.PHONE_TYPE_MOBILE_PHONE || phone.phoneTypeCd === Enum.PHONE_TYPE_MOBILE_SMS)) {
    //     validators = validators.concat([ValidatorEnum.isHKMobilePhone]);
    //     let message = CommonMessage.VALIDATION_NOTE_IS_SPECIFIC_PHONE('Hong Kong Mobile', '5, 6, 7, 9');
    //     errMsgs = errMsgs.concat([message]);
    // }
    if (isRequired || isPhoneRequired) {
        validators = validators.concat([ValidatorEnum.required]);
        errMsgs = errMsgs.concat([CommonMessage.VALIDATION_NOTE_REQUIRED()]);
    }
    return { validators, errMsgs };
};

const getCntryValidators=(comDisabled,isSMSMobile,requiredCntry)=>{
    const disableCntryCd=comDisabled;
    let validators=[];
    let errMsgs=[];
    if(!disableCntryCd){
        if(requiredCntry){
            validators=validators.concat([ValidatorEnum.required]);
            errMsgs=errMsgs.concat([CommonMessage.VALIDATION_NOTE_REQUIRED()]);
        }
        validators=validators.concat([ValidatorEnum.isNumber]);
        errMsgs=errMsgs.concat([CommonMessage.VALIDATION_NOTE_NUMBERFIELD()]);
    }

    return {validators,errMsgs};
};

const PhoneField = React.forwardRef((props, ref) => {
    const {
        comDisabled, phone, countryOptions, id, //NOSONAR
        selectSMSMobile, isPreferPhone, isRequired, //NOSONAR
        onChange, phoneTypeOptions, isSMSMobile, //NOSONAR
        showExtPhoneNo, //NOSONAR
        isPhoneRequired
    } = props;

    let phoneMaxLength=getPhoneLength(phone&&phone.dialingCd);
    let phoneValidators = getPhoneValidators(isRequired, isPhoneRequired, phone);

    const handleOnChange = (value, name) => {
        if (onChange) {
            onChange(value, name);
        }
    };

    // const dialingCd=phone && phone.dialingCd;
    // React.useEffect(() => {
    //     if (dialingCd === FieldConstant.DIALING_CODE_DEFAULT_VALUE) {
    //         onChange('', 'areaCd');
    //     }
    // }, [dialingCd]);

    const isTypeRequired = isRequired || (phone && phone.phoneNo);
    const isCountryRequired = isRequired || (phone && phone.phoneNo);
    const isOffPhone = showExtPhoneNo ? (phone && phone.phoneTypeCd === Enum.PHONE_TYPE_OFFICE_PHONE) : false;

    const cntryValidators=getCntryValidators(comDisabled,isSMSMobile,isCountryRequired);

    return (
        <FormControl fullWidth style={{ display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={1}>
                <Grid item style={{ width: 190 }}>
                    <SelectFieldValidator
                        id={id + '_phoneTypeCd'}
                        options={phoneTypeOptions && phoneTypeOptions.map((item) => (
                            { value: item.value, label: item.label }
                        ))}
                        isDisabled={comDisabled}
                        value={phone.phoneTypeCd}
                        onChange={e => handleOnChange(e.value, 'phoneTypeCd')}
                        validators={isTypeRequired ? [ValidatorEnum.required] : []}
                        errorMessages={isTypeRequired ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Type{isTypeRequired ? <RequiredIcon /> : null}</>
                        }}
                    />
                </Grid>
                <Grid item style={{ width: 300 }}>
                    <FastTextFieldValidator
                        id={id + '_country'}
                        disabled={comDisabled}  //CIMST-3391 Remove SMS mobile the country code restriction
                        value={phone.dialingCd}
                        // onChange={e => handleOnChange(e.target.value, 'dialingCd')}
                        // validators={isCountryRequired ? [ValidatorEnum.required,ValidatorEnum.isNumber] : [ValidatorEnum.isNumber]}
                        // errorMessages={isCountryRequired ? [CommonMessage.VALIDATION_NOTE_REQUIRED(),CommonMessage.VALIDATION_NOTE_NUMBERFIELD()] : [CommonMessage.VALIDATION_NOTE_NUMBERFIELD]}
                        validators={cntryValidators.validators}
                        errorMessages={cntryValidators.errMsgs}
                        msgPosition={'bottom'}
                        variant={'outlined'}
                        label={<>Country Code{isCountryRequired ? <RequiredIcon /> : null}</>}
                        type={'number'}
                        inputProps={{
                            maxLength:4
                        }}
                        onBlur={(e)=>{
                            let value=e.target.value;
                            value=value.replace(/[^0-9]/ig, '');
                            // handleOnChange(value,'dialingCd');
                            onChange(value,'dialingCd');
                        }}
                    />
                </Grid>
                <Grid item style={{ width: 115 }}>
                    <FastTextFieldValidator
                        id={`${id}_area_code`}
                        label={'Area Code'}
                        inputProps={{ maxLength: 3 }}
                        variant={'outlined'}
                        value={phone.areaCd}
                        onBlur={e => handleOnChange(e.target.value, 'areaCd')}
                        type={'number'}
                        disabled={comDisabled}
                    />
                </Grid>
                <Grid item style={{ width: 200 }}>
                    <FastTextFieldValidator
                        id={id + '_phoneNo'}
                        name="phoneNo"
                        // type="number"
                        inputProps={{ maxLength: phoneMaxLength }}
                        disabled={comDisabled}
                        value={phone ? phone.phoneNo : ''}
                        onBlur={e => handleOnChange(e.target.value, 'phoneNo')}
                        validators={isRequired ? phoneValidators.validators : []}
                        errorMessages={isRequired ? phoneValidators.errMsgs : []}
                        // label={<>{isPreferPhone ? 'Phone (Preferred)' : 'Phone'}{isRequired ? <RequiredIcon /> : null}</>}
                        label={<>Phone{isRequired && phoneValidators.validators.findIndex(x => x === ValidatorEnum.required) > -1 ? <RequiredIcon /> : null}</>}
                        variant="outlined"
                    />
                </Grid>
                {
                    isOffPhone ?
                        <Grid item style={{ width: 90 }}>
                            <FastTextFieldValidator
                                id={id + '_ext'}
                                name={'Ext.'}
                                type={'number'}
                                // inputProps={{ maxLength: phoneMaxLength }}
                                disabled={comDisabled}
                                value={phone ? phone.extPhoneNo : ''}
                                // value={1234}
                                onBlur={e => handleOnChange(e.target.value, 'extPhoneNo')}
                                // validators={isRequired ? phoneValidators.validators : []}
                                // errorMessages={isRequired ? phoneValidators.errMsgs : []}
                                inputProps={{ maxLength: 4 }}
                                label={'Ext.'}
                                variant={'outlined'}
                            />
                        </Grid>
                        : null
                }

            </Grid>
        </FormControl>
    );

});

export default PhoneField;

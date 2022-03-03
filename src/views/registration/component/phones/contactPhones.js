import React from 'react';
import { Grid, IconButton, FormHelperText } from '@material-ui/core';
import { RemoveCircle, AddCircle } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import memoize from 'memoize-one';
import { patientPhonesBasic } from '../../../../constants/registration/registrationConstants';
import PhoneField from './phoneField';
import Enum from '../../../../enums/enum';
import FieldConstant from '../../../../constants/fieldConstant';
import * as RegUtil from '../../../../utilities/registrationUtilities';

class ContactPhones extends React.Component {


    isSelectSMSMobile = (phoneList) => {
        let smsMobileIdx = RegUtil.getSMSMoblieIdx(phoneList);
        return smsMobileIdx > -1;
    }

    handleDelete = (e, data) => {
        let phoneList = _.cloneDeep(this.props.phoneList);
        let deletePhoneIndex = phoneList.findIndex(item => item.phoneId === data.phoneId && item.phoneTypeCd === data.phoneTypeCd
            && item.phoneNo === data.phoneNo && item.dialingCd === data.dialingCd);
        phoneList.splice(deletePhoneIndex, 1);
        // let selectSMSMobile = this.isSelectSMSMobile(phoneList);
        this.props.onChange(phoneList);
    }

    handleAdd = () => {
        let phoneList = _.cloneDeep(this.props.phoneList);
        let basicPhone = _.cloneDeep(patientPhonesBasic);
        // basicPhone.phoneTypeCd = Enum.PHONE_TYPE_OTHER_PHONE;
        basicPhone.phoneTypeCd = '';
        phoneList.push(basicPhone);
        // let selectSMSMobile = this.isSelectSMSMobile(phoneList);
        this.props.onChange(phoneList);
    }

    handleOnChange = (value, name, index) => {
        let phoneList = _.cloneDeep(this.props.phoneList);
        if (name === 'countryCd') {
            phoneList[index]['areaCd'] = '';
            let countryOptionsObj = this.props.phoneCountryList.find(item => item.countryCd == value);
            let dialingCd = countryOptionsObj && countryOptionsObj.dialingCd;
            phoneList[index]['dialingCd'] = dialingCd;
        }
        if (name === 'phoneTypeCd') {
            if (value === Enum.PHONE_TYPE_MOBILE_SMS) {
                // phoneList[index]['phoneTypeCd'] = Enum.PHONE_TYPE_MOBILE_PHONE;
                value = Enum.PHONE_TYPE_MOBILE_PHONE;
                // phoneList[index]['countryCd'] = FieldConstant.COUNTRY_CODE_DEFAULT_VALUE;
                phoneList[index]['dialingCd']=FieldConstant.DIALING_CODE_DEFAULT_VALUE;
                phoneList[index]['smsPhoneInd'] = '1';
            } else {
                phoneList[index]['smsPhoneInd'] = '0';
            }
        }
        // const selectSMSMobile = this.phoneListHasSMSMobile(phoneList);
        if (name === 'dialingCd') {
            value = value.replace(/[^0-9]/ig, '');
            if (value !== phoneList[index]['dialingCd']) {
                phoneList[index]['areaCd'] = '';
            }
        }
        phoneList[index][name] = value;
        this.props.onChange(phoneList);
    }

    phoneListHasSMSMobile = memoize(phoneList => {
        const index = phoneList && phoneList.findIndex(item => parseInt(item.smsPhoneInd) === 1);
        return index > -1;
    });

    isPhoneMandatory = memoize((atLeastOne, index, phone, phoneList) => {
        return (atLeastOne && index === 0)
            || phone.areaCd
            // || (parseInt(phone.phonePriority) === 1 && phoneList.length > 1)
            // || (parseInt(phone.smsPhoneInd) === 1) ? true : false;
            || phone.phoneNo;
    });

    getPhoneTypeOptions = memoize((phone, hasSms, isNeedSMSMobile) => {
        if (isNeedSMSMobile) {
            if (parseInt(phone.smsPhoneInd) !== 1 && hasSms) {
                return Enum.PHONE_DROPDOWN_LIST.filter(item => item.value !== Enum.PHONE_TYPE_MOBILE_SMS);
            } else {
                return Enum.PHONE_DROPDOWN_LIST;
            }
        } else {
            return Enum.PHONE_DROPDOWN_LIST.filter(item => item.value !== Enum.PHONE_TYPE_MOBILE_SMS);
        }
    });


    render() {
        const {
            classes,
            phoneCountryList,
            comDisabled,
            phoneList,
            atLeastOne,
            maxPhoneLength,
            isLackHKMobile,
            isNeedSMSMobile,
            id,
            showAddRemoveBtn,
            showExtPhoneNo
        } = this.props;
        const hasSMSMobile = this.phoneListHasSMSMobile(phoneList);
        return (
            <Grid container>
                {
                    phoneList && phoneList.map((item, index) => {
                        const isPhoneRequired = this.isPhoneMandatory(atLeastOne, index, item, phoneList);
                        const phoneTypeOptions = this.getPhoneTypeOptions(item, hasSMSMobile, isNeedSMSMobile);
                        const isSMSMobile = parseInt(item.smsPhoneInd) === 1;
                        const isPreferPhone = parseInt(item.phonePriority) === 1;
                        let phone = _.cloneDeep(item);
                        if (isSMSMobile) {
                            phone.phoneTypeCd = Enum.PHONE_TYPE_MOBILE_SMS;
                        }
                        return (
                            <Grid item container wrap="nowrap" key={index}>
                                <Grid item container xs={12} className={classes.paddingGrid}>
                                    <PhoneField
                                        id={`${id}_phoneField_${index}`}
                                        comDisabled={comDisabled}
                                        phone={phone}
                                        isRequired={isPhoneRequired}
                                        // isRequired={false}
                                        countryOptions={phoneCountryList}
                                        phoneTypeOptions={phoneTypeOptions}
                                        onChange={(value, name) => this.handleOnChange(value, name, index)}
                                        isSMSMobile={isSMSMobile}
                                        isPreferPhone={isPreferPhone}
                                        showExtPhoneNo={showExtPhoneNo}
                                        isPhoneRequired={false}
                                    />
                                </Grid>
                                {
                                    showAddRemoveBtn && showAddRemoveBtn === true ?
                                        <Grid item container justify="flex-start" wrap="nowrap" style={{ width: 'auto', minWidth: 80 }} >
                                            {
                                                phoneList.length - 1 > 0 ?
                                                    <IconButton
                                                        onClick={e => this.handleDelete(e, item)}
                                                        disabled={comDisabled}
                                                        id={`${id}_removeBtn_${index}`}
                                                        className={classes.iconButton}
                                                        title="Remove"
                                                    >
                                                        <RemoveCircle />
                                                    </IconButton> : null
                                            }
                                            {
                                                index === phoneList.length - 1 && phoneList.length < maxPhoneLength ?
                                                    <IconButton
                                                        onClick={this.handleAdd}
                                                        disabled={comDisabled}
                                                        id={`${id}_addBtn_${index}`}
                                                        className={classes.iconButton}
                                                        title="Add"
                                                        color="primary"
                                                    >
                                                        <AddCircle />
                                                    </IconButton> : null
                                            }
                                        </Grid>
                                        : null
                                }
                            </Grid>
                        );
                    })
                }
                {/* {
                    isLackHKMobile ?
                        <FormHelperText className={classes.formHelperText}>
                            At least one HongKong mobile phone!
                        </FormHelperText>
                        : null
                } */}
            </Grid>
        );
    }
}

const style = theme => ({
    paddingGrid: {
        paddingBottom: 10
    },
    iconButton: {
        padding: 0,
        borderRadius: '15%',
        width: 40,
        paddingBottom: 10
    },
    formHelperText: {
        marginTop: 0,
        marginBottom: 8,
        color: theme.palette.primary.main
    }
});

export default withStyles(style)(ContactPhones);

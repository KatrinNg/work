import React from 'react';
import {
    Grid
} from '@material-ui/core';
import RegFieldName from '../../../../enums/registration/regFieldName';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import Enum from '../../../../enums/enum';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import memoize from 'memoize-one';
// import ValidatorEnum from '../../../../enums/validatorEnum';
// import CommonMessage from '../../../../constants/commonMessage';

const fieldEngLabel = ContactInformationEnum.FIELD_ENG_LABEL;
const fieldChiLabel = ContactInformationEnum.FIELD_CHI_LABEL;


class PostalBoxAddressPanel extends React.Component {

    addressSet = memoize((list, type) => {
        if (type === Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
            return list;
        }
        else {
            return list && list.find(item => item.addressTypeCd === type);
        }
    });

    handleChangePostalAddress = (value, type, name) => {
        if (type === Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
            this.props.handleChangeAddress(value, name);
        }
        else {
            this.props.handleChangeAddress(value, type, name);
        }

    }
    render() {
        const { isDisabled, addressList, id, addressType } = this.props;

        const addressSet = this.addressSet(addressList, addressType);
        const isChiAddress = addressSet ? addressSet.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE : false;

        // let postOfficeValidator = [];
        // let postOfficeErrMsg = [];
        // if (addressType != Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
        //     if (this.props.patientContactInfo) {
        //         if (this.props.patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_POSTALMAIL) > -1) {
        //             postOfficeValidator.push(ValidatorEnum.required);
        //             postOfficeErrMsg.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        //         }
        //     }
        // }
        return (
            <Grid container spacing={1}>
                <Grid item xs={4}>
                    <FastTextFieldValidator
                        id={id + '_postOfficeBoxNo'}
                        disabled={isDisabled}
                        inputProps={{ maxLength: 20 }}
                        label={
                            <>
                                {isChiAddress ? fieldChiLabel.CONTACT_POSTOFFICE_BOXNO : fieldEngLabel.CONTACT_POSTOFFICE_BOXNO}
                                {/* {isDisabled ? null : (patientContactInfo && patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_POSTALMAIL) > -1 ? <RequiredIcon /> : null)} */}
                            </>
                        }
                        variant="outlined"
                        // value={patientContactInfo.postOfficeBoxNo}
                        value={addressSet.postOfficeBoxNo}
                        onBlur={e => this.handleChangePostalAddress(e.target.value, addressType, 'postOfficeBoxNo')}
                        name={RegFieldName.CONTACT_POSTOFFICE_BOXNO}
                        // validators={postOfficeValidator}
                        // errorMessages={postOfficeErrMsg}
                        ref="postOfficeBoxNo"
                        calActualLength
                    />
                </Grid>
                <Grid item xs={4}>
                    <FastTextFieldValidator
                        id={id + '_postOfficeName'}
                        disabled={isDisabled}
                        inputProps={{ maxLength: 100 }}
                        label={
                            <>
                                {isChiAddress ? fieldChiLabel.CONTACT_POSTOFFICE_NAME : fieldEngLabel.CONTACT_POSTOFFICE_NAME}
                                {/* {isDisabled ? null : (patientContactInfo && patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_POSTALMAIL) > -1 ? <RequiredIcon /> : null)} */}
                            </>
                        }
                        variant="outlined"
                        // value={patientContactInfo.postOfficeName}
                        value={addressSet.postOfficeName}
                        onBlur={e => this.handleChangePostalAddress(e.target.value, addressType, 'postOfficeName')}
                        name={RegFieldName.CONTACT_POSTOFFICE_NAME}
                        // validators={postOfficeValidator}
                        // errorMessages={postOfficeErrMsg}
                        ref="postOfficeName"
                        calActualLength
                    />
                </Grid>
                <Grid item xs={4}>
                    <FastTextFieldValidator
                        id={id + '_postOfficeRegion'}
                        disabled={isDisabled}
                        inputProps={{ maxLength: 50 }}
                        label={
                            <>
                                {isChiAddress ? fieldChiLabel.CONTACT_POSTOFFICE_REGION : fieldEngLabel.CONTACT_POSTOFFICE_REGION}
                                {/* {isDisabled ? null : (patientContactInfo && patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_POSTALMAIL) > -1 ? <RequiredIcon /> : null)} */}
                            </>
                        }
                        variant="outlined"
                        // value={patientContactInfo.postOfficeRegion}
                        value={addressSet.postOfficeRegion}
                        onBlur={e => this.handleChangePostalAddress(e.target.value, addressType, 'postOfficeRegion')}
                        name={RegFieldName.CONTACT_POSTOFFICE_REGION}
                        // validators={postOfficeValidator}
                        // errorMessages={postOfficeErrMsg}
                        ref="postOfficeRegion"
                        calActualLength
                    />
                </Grid>
            </Grid>
        );
    }

}
export default PostalBoxAddressPanel;
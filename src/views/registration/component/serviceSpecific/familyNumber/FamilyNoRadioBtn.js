import { makeStyles } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React from 'react';
import OutlinedRadioValidator from '../../../../../components/FormValidator/OutlinedRadioValidator';
import CommonMessage from '../../../../../constants/commonMessage';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import { RegistrationUtil } from '../../../../../utilities';
import * as CommonUtilities from '../../../../../utilities/commonUtilities';

const id = 'registration_personalParticulars';
const sysRatio = CommonUtilities.getSystemRatio();
const unit = CommonUtilities.getResizeUnit(sysRatio);
const useStyles = makeStyles(() => ({
    radioGroup: {
        //height: 36
        height: 39 * unit - 2
    }
}));

const FamilyNoRadioBtn = ({ familyNoType, updatePatientBaseInfo, comDisabled, isNextReg }) => {
    const classes = useStyles();

    const handleOnchange = (e) => updatePatientBaseInfo({ familyNoType: e.target.value });

    return (
        <OutlinedRadioValidator
            disabled={comDisabled || isNextReg}
            name={''}
            labelText={''}
            absoluteMessage
            value={familyNoType}
            onChange={handleOnchange}
            list={RegistrationUtil.familyNoTypeList}
            validators={[ValidatorEnum.required]}
            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
            RadioGroupProps={{ className: classes.radioGroup }}
            id={id + '_familyNoType'}
        />
    );
};

FamilyNoRadioBtn.propTypes = {
    familyNoType: PropTypes.string,
    updatePatientBaseInfo: PropTypes.func,
    comDisabled: PropTypes.bool,
    isNextReg: PropTypes.bool
};

export default FamilyNoRadioBtn;

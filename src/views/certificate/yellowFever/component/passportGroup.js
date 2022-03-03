import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import CIMSInputLabel from '../../../../components/InputLabel/CIMSInputLabel';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import _ from 'lodash';

class PassportGroup extends Component {
    updatePassportInfo = (value, name) => {
        this.props.passportGroupOnChange(value, name);
    }
    render() {
        let { passportInfo, isSelected } = this.props;
        return (
            <Grid container item>
                <Grid container >
                    <Grid item xs={2}><CIMSInputLabel>Issued from:<RequiredIcon /></CIMSInputLabel></Grid>
                    <Grid item xs={3}>
                        <SelectFieldValidator
                            id={`${this.props.id}_passportSelectField`}
                            name={'issuedCountry'}
                            onChange={e => this.updatePassportInfo(e.value, 'issuedCountry')}
                            value={passportInfo.issuedCountry}
                            options={passportInfo.passportList && passportInfo.passportList.map(item => ({ value: _.toUpper(item || ''), label: item }))}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            isDisabled={isSelected}
                            TextFieldProps={{
                                variant:'outlined'
                            }}
                        />
                    </Grid>

                    <Grid item xs={2} style={{ paddingLeft: 30 }}><CIMSInputLabel>Passport Number:<RequiredIcon /></CIMSInputLabel></Grid>
                    <Grid item xs={3}>
                        <FastTextFieldValidator
                            id={`${this.props.id}_passportNumberTextField`}
                            type={'cred'}
                            name={'passportNumber'}
                            onBlur={e => this.updatePassportInfo(e.target.value, e.target.name)}
                            value={passportInfo.passportNumber}
                            inputProps={{
                                maxLength: 30
                            }}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            disabled={isSelected}
                            variant={'outlined'}
                            calActualLength
                        />
                    </Grid>

                </Grid>
            </Grid>
        );
    }
}


export default PassportGroup;
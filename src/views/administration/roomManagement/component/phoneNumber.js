import React from 'react';
import { Grid} from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
const styles = makeStyles((theme) => ({
    formLbl: {
        padding: theme.spacing(2)
    },
    brackets: {
        alignItems: 'center',
        padding: 10
    }
}));

const PhoneNumberField = (props) => {
    const classes = styles();
    const { id, phn, phnExt } = props;

    const handlePhoneChange = (name, value) => {
        props.updatePhone(name,value);
    };
    return (
        <Grid container>
            <CIMSFormLabel
                fullWidth
                labelText={'Phone Number'}
                className={classes.formLbl}
            >
                <Grid container>
                    <Grid item xs={7}>
                        <FastTextFieldValidator
                            id={`${id}_phone_number`}
                            value={phn}
                            onBlur={(e) => handlePhoneChange('phn', e.target.value)}
                            type={'number'}
                            inputProps={{ maxLength: 8 }}
                            absoluteMessage
                            validators={[
                                ValidatorEnum.minStringLength(8),
                                ValidatorEnum.maxStringLength(8)
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_PHONE_BELOWMINWIDTH(),
                                CommonMessage.VALIDATION_NOTE_OVERMAXWIDTH()
                            ]}
                        />
                    </Grid>
                    <Grid className={classes.brackets}>(</Grid>
                    <Grid item xs={3}>
                        <FastTextFieldValidator
                            id={`${id}_phone_number_ext`}
                            value={phnExt}
                            onBlur={(e) => handlePhoneChange('phnExt', e.target.value)}
                            type={'number'}
                            inputProps={{ maxLength: 4 }}
                        />
                    </Grid>
                    <Grid className={classes.brackets}>)</Grid>
                </Grid>
            </CIMSFormLabel>
        </Grid>
    );
};
export default PhoneNumberField;
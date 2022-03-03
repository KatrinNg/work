import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import AutoSelectFieldValidator from '../../components/FormValidator/AutoSelectFieldValidator';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';

const Encounter = React.forwardRef((props, ref) => {

    const {
        id,
        xs,
        isView,
        textFieldProps,
        selectFieldProps
    } = props;

    const textFieldEncounter = () => {
        return (
            <FastTextFieldValidator
                id={id}
                value={textFieldProps.value}
                variant="outlined"
                label={<>Encounter Type</>}
                onChange={null}
                disabled
            />
        );
    };

    const selectFieldEncounter = () => {
        return (
            <SelectFieldValidator
                id={id}
                TextFieldProps={{
                    variant: 'outlined',
                    label: <>Encounter Type<RequiredIcon /></>
                }}
                validators={[ValidatorEnum.required]}
                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                absoluteMessage
                sortBy="label"
                {...selectFieldProps}
            />
        );
    };

    return (
        <Grid item container alignContent="center" xs={xs}>
            {
               isView ?
               textFieldEncounter() :
               selectFieldEncounter()
            }
        </Grid>
    );
});


export default connect()(Encounter);
import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
// import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import AutoSelectFieldValidator from '../../components/FormValidator/AutoSelectFieldValidator';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';

const Room = React.forwardRef((props, ref) => {

    const {
        id,
        xs,
        isView,
        textFieldProps,
        selectFieldProps
    } = props;

    const textFieldRoom = () => {
        return (
            <FastTextFieldValidator
                id={id}
                value={textFieldProps.value}
                variant="outlined"
                label={<>Room</>}
                onChange={null}
                disabled
            />
        );
    };

    const selectFieldRoom = () => {
        return (
            <AutoSelectFieldValidator
                id={id}
                TextFieldProps={{
                    variant: 'outlined',
                    label: <>Room<RequiredIcon /></>
                }}
                validators={[ValidatorEnum.required]}
                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                absoluteMessage
                {...selectFieldProps}
            />
        );
    };


    return (
        <Grid item alignContent="center" container  xs={xs}>
            {
               isView ?
               textFieldRoom() :
               selectFieldRoom()
            }
        </Grid>
    );
});

const mapStateToProps = (state) => {
    return {
    };
};

export default connect(mapStateToProps)(Room);
import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import RequiredIcon from '../InputLabel/RequiredIcon';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';

const EncounterGroup = React.forwardRef((props, ref) => {

    const {
        encntrGrpList,
        id,
        xs,
        isView,
        textFieldProps,
        selectFieldProps
    } = props;

    const textFieldEncounterGroup = () => {
        return (
            <FastTextFieldValidator
                id={id}
                value={textFieldProps.value}
                variant="outlined"
                label={<>Encounter Group</>}
                onChange={null}
                disabled
            />
        );
    };

    const selectFieldEncounterGroup = () => {
        return (
            <SelectFieldValidator
                id={id}
                placeholder=""
                options={encntrGrpList && encntrGrpList.map(item => (
                    { value: item.encntrGrpCd, label: item.encntrGrpCd }
                ))}
                TextFieldProps={{
                    variant: 'outlined',
                    label: <>Encounter Group<RequiredIcon/></>
                }}
                absoluteMessage
                sortBy="label"
                validators={[ValidatorEnum.required]}
                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                {...selectFieldProps}
            />
        );
    };
    return (
        <Grid item container alignContent="center" xs={xs}>
            {
               isView ?
               textFieldEncounterGroup() :
               selectFieldEncounterGroup()
            }
        </Grid>
    );
});

const mapStateToProps = (state) => {
    return {
        encntrGrpList: state.caseNo.encntrGrpList
    };
};


export default connect(mapStateToProps)(EncounterGroup);
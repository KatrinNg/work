import React from 'react';
import { Grid, RadioGroup, FormHelperText, Radio, FormControlLabel, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import Enum from '../../../../enums/enum';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorComponent from '../../../../components/FormValidator/ValidatorComponent';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';

const styles = theme => ({
    root: {
        padding: theme.spacing(2),
        width: '100%'
    },
    radioGroup: {
        alignItems: 'center',
        '& .containerItem': {
            padding: theme.spacing(1),
            paddingLeft: 0
        }
    }
});

const CustomRadio = withStyles({
    root: {
        padding: 5
    }
})(Radio);

const CustomFormControlLabel = withStyles({
    root: {
        marginLeft: 'unset'
    }
})(FormControlLabel);

const comId = 'attendanceCert_attendanceReason';
class AttendanceReasonRadio extends ValidatorComponent {
    render() {
        const { classes, isSelected } = this.props;
        const { isValid } = this.state;
        return (
            <CIMSFormLabel
                labelText={<>For<RequiredIcon /></>}
                className={classes.root}
                error={!isValid}
            >
                <RadioGroup
                    id={`${comId}_radioGroup`}
                    row
                    value={this.props.forValue}
                    onChange={e => { this.props.handleChange(e.target.value, 'attendanceFor'); }}
                    className={classes.radioGroup}
                >
                    {
                        Enum.ATTENDANCE_CERT_FOR_LIST.map(item => {
                            if (item.value === 'O') {
                                return (
                                    <Grid item xs={3} key={item.value} className="containerItem">
                                        <CustomFormControlLabel
                                            id={`${comId}_ORadioLabel`}
                                            value={item.value}
                                            label={
                                                <Grid container wrap="nowrap" alignItems="center">
                                                    <Grid item style={{paddingRight:8}}><Typography component="label">{item.label}</Typography></Grid>
                                                    <Grid item>
                                                        <TextFieldValidator
                                                            id={`${comId}_OTextField`}
                                                            disabled={this.props.forValue !== 'O' || isSelected}
                                                            value={this.props.otherValue}
                                                            onChange={e => { this.props.handleChange(e.target.value, 'attendanceForOthers'); }}
                                                            inputProps={{
                                                                maxLength: 23
                                                            }}
                                                            validators={this.props.forValue !== 'O' ? [] : [ValidatorEnum.required]}
                                                            errorMessages={this.props.forValue !== 'O' ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                            variant={'outlined'}
                                                            calActualLength
                                                        />
                                                    </Grid>
                                                </Grid>}
                                            control={<CustomRadio disabled={isSelected} id={`${comId}_ORadio`} color={'primary'} />}
                                        />
                                    </Grid>
                                );
                            } else {
                                return (
                                    <Grid item xs={3} key={item.value} className="containerItem">
                                        <CustomFormControlLabel
                                            id={`${comId}_${item.value}RadioLabel`}
                                            value={item.value}
                                            control={<CustomRadio disabled={isSelected} id={`${comId}_${item.value}Radio`} color={'primary'} />}
                                            label={item.label}
                                        />
                                    </Grid>
                                );
                            }
                        })
                    }
                </RadioGroup>
                {
                    !isValid ?
                        <FormHelperText error id="attendanceDate_errorMessage">
                            {this.getErrorMessage()}
                        </FormHelperText> : null
                }
            </CIMSFormLabel>
        );
    }
}

export default withStyles(styles)(AttendanceReasonRadio);
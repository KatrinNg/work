import React from 'react';
import { Grid, RadioGroup, Radio, FormControlLabel, FormHelperText } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import TimeFieldValidator from '../../../../components/FormValidator/TimeFieldValidator';
import ValidatorComponent from '../../../../components/FormValidator/ValidatorComponent';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import Enum from '../../../../enums/enum';

const styles = theme => ({
    root: {
        padding: theme.spacing(2),
        width: '100%'
    },
    dateContainer: {
        width: '20%'
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
        marginLeft: 'unset',
        marginRight: 10
    }
})(FormControlLabel);

const comId = 'attendanceCert_attendanceDate';
class AttendanceDate extends ValidatorComponent {
    render() {
        const { classes, isSelected } = this.props;
        const { isValid } = this.state;

        return (
            <CIMSFormLabel
                labelText={<>Attendance Date<RequiredIcon /></>}
                className={classes.root}
                error={!isValid}
            >
                <Grid container direction="column" spacing={2}>
                    <Grid item className={classes.dateContainer}>
                        <DateFieldValidator
                            id={`${comId}_date`}
                            value={this.props.date}
                            disableFuture
                            onChange={(e) => { this.props.handleChange(e, 'attendanceDate'); }}
                            onBlur={e => { this.props.handleChange(e, 'attendanceDate'); }}
                            onAccept={e => { this.props.handleChange(e, 'attendanceDate'); }}
                            isRequired
                            disabled={isSelected}
                            validByBlur
                            inputVariant={'outlined'}
                        />
                    </Grid>
                    <Grid item>
                        <RadioGroup
                            id={`${comId}_section_radioGroup`}
                            row
                            value={this.props.section}
                            onChange={e => { this.props.handleChange(e.target.value, 'attendanceSection'); }}
                            className={classes.radioGroup}
                        >
                            {
                                Enum.ATTENDANCE_CERT_SESSION_LIST.map(item => {
                                    if (item.value === 'R') {
                                        return (
                                            <Grid item xs={6} key={item.value} className="containerItem">
                                                <CustomFormControlLabel
                                                    id={`${comId}_${item.value}RadioLabel`}
                                                    value={item.value}
                                                    control={<CustomRadio disabled={isSelected} id={`${comId}_${item.value}Radio`} color={'primary'} />}
                                                    label={
                                                        <Grid container wrap="nowrap" spacing={1}>
                                                            <Grid item>
                                                                <TimeFieldValidator
                                                                    id={`${comId}_from`}
                                                                    disabled={this.props.section !== item.value || isSelected}
                                                                    clearable={false}
                                                                    isRequired
                                                                    value={this.props.from}
                                                                    onChange={e => { this.props.handleChange(e, 'attendanceSectionFrom'); }}
                                                                    label="From"
                                                                    inputVariant="outlined"
                                                                    helperText=""
                                                                />
                                                            </Grid>
                                                            <Grid item>
                                                                <TimeFieldValidator
                                                                    id={`${comId}_to`}
                                                                    disabled={this.props.section !== item.value || isSelected}
                                                                    clearable={false}
                                                                    isRequired
                                                                    value={this.props.to}
                                                                    onChange={e => this.props.handleChange(e, 'attendanceSectionTo')}
                                                                    label="To"
                                                                    inputVariant="outlined"
                                                                    helperText=""
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                />
                                            </Grid>
                                        );
                                    } else {
                                        return (
                                            <Grid item xs={3} key={item.value} className="containerItem">
                                                <CustomFormControlLabel
                                                    id={`${comId}_${item.value}RadioLabel`}
                                                    label={item.label}
                                                    value={item.value}
                                                    control={<CustomRadio disabled={isSelected} id={`${comId}_${item.value}Radio`} color={'primary'} />}
                                                />
                                            </Grid>
                                        );
                                    }
                                })
                            }
                        </RadioGroup>
                    </Grid>
                </Grid>
                {
                    !isValid ?
                        <FormHelperText error id={`${comId}_errorMessage`}>
                            {this.getErrorMessage()}
                        </FormHelperText> : null
                }
            </CIMSFormLabel>
        );
    }
}

export default withStyles(styles)(AttendanceDate);
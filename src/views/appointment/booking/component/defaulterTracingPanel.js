import React from 'react';
import { Grid, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FastTextField from '../../../../components/TextField/FastTextField';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import CIMSSelect from '../../../../components/Select/CIMSSelect';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';

const styles = makeStyles(theme => ({
    chbMargin: {
        margin: 0
    },
    rsn: {
        width: 300
    },
    rsnTxt: {
        width: 462
    }
}));


const defaulterTracingPanel = (props) => {
    const { id, dftTraceRsnList, bookingData, comDisabled } = props;
    const classes = styles();

    const handleParamChange = (name, value) => {
        let updateData = null;
        updateData = { [name]: value };
        if (name === 'isTrace') {
            updateData = {
                ...updateData,
                dfltTraceRsnTypeId: '',
                dfltTraceRsnRemark: '',
                isDfltTracePriority: 0
            };
        } else if (name === 'dfltTraceRsnTypeId') {
            updateData = {
                ...updateData,
                dfltTraceRsnRemark: ''
            };
        } else if (name === 'dfltTraceRsnRemark') {
            updateData = {
                ...updateData,
                dfltTraceRsnTypeId: ''
            };
        }
        props.onChange(updateData);
    };
    const reqDfltTraceRsn = bookingData.isTrace === 0 ? false : !comDisabled;


    return (
        <Grid container>
            <Grid item container xs={12} spacing={2}>
                <Grid item style={{ width: 185 }}>
                    <Grid container>
                        <Grid item xs={12}>
                            <FormControlLabel
                                className={classes.chbMargin}
                                control={
                                    <CIMSCheckBox
                                        id={id + '_defaulter_tracing_chb'}
                                        onChange={e => handleParamChange('isTrace', e.target.checked ? 1 : 0)}
                                        value={bookingData.isTrace || 0}
                                    />
                                }
                                checked={bookingData.isTrace === 1}// eslint-disable-line
                                label={'Defaulter Tracing'}
                                disabled={comDisabled}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                className={classes.chbMargin}
                                control={
                                    <CIMSCheckBox
                                        id={id + '_priority_chb'}
                                        onChange={e => handleParamChange('isDfltTracePriority', e.target.checked ? 1 : 0)}
                                        value={bookingData.isDfltTracePriority || 0}
                                    />
                                }
                                checked={bookingData.isDfltTracePriority === 1}// eslint-disable-line
                                label={'Priority'}
                                disabled={bookingData.isTrace === 0 ? true : comDisabled}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.rsn}>
                    <SelectFieldValidator
                        id={id + '_defaulter_tracing_reason_select'}
                        value={bookingData.dfltTraceRsnTypeId || ''}
                        options={dftTraceRsnList && dftTraceRsnList.map(item => ({ value: item.otherId, label: item.engDesc }))}
                        onChange={(e) => handleParamChange('dfltTraceRsnTypeId', e.value)}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Reason{reqDfltTraceRsn && !bookingData.dfltTraceRsnRemark ? <RequiredIcon /> : null}</>
                        }}
                        isDisabled={bookingData.isTrace === 0 ? true : comDisabled}
                        validators={bookingData.dfltTraceRsnRemark ? [] : [ValidatorEnum.required]}
                        errorMessages={bookingData.dfltTraceRsnRemark ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />
                </Grid>
                <Grid item className={classes.rsnTxt} style={{ paddingRight: 0 }}>
                    <FastTextFieldValidator
                        id={id + '_defaulter_tracing_reason_txt'}
                        value={bookingData.dfltTraceRsnRemark}
                        inputProps={{ maxLength: 1000 }}
                        calActualLength
                        multiline
                        rows={'2'}
                        label={<>Other Reason{reqDfltTraceRsn && !bookingData.dfltTraceRsnTypeId ? <RequiredIcon /> : null}</>}
                        onBlur={(e) => handleParamChange('dfltTraceRsnRemark', e.target.value)}
                        disabled={bookingData.isTrace === 0 ? true : comDisabled}
                        validators={bookingData.dfltTraceRsnTypeId ? [] : [ValidatorEnum.required]}
                        errorMessages={bookingData.dfltTraceRsnTypeId ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};


export default defaulterTracingPanel;
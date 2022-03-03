import React from 'react';
import { FormControlLabel, Checkbox, Grid, makeStyles } from '@material-ui/core';
import { Field, FieldArray } from 'formik';
import CIMSCommonTextField from '../../../../components/TextField/CIMSCommonTextField';

const useStyles = makeStyles((theme) => ({
    otherInput: {
        width: 121,
        margin: '0 15px 0'
    },
    input: {
        height: 40
    },
    root: {
        border: `1px solid ${theme.palette.grey.default}`,
        borderRadius: 10,
        height: 60,
        marginTop: 10
    },
    checkboxLabel: {
        color: theme.palette.primary.dark
    }
}));

const ScreeningInfoCheckboxGroup = ({ name, options, values, textFieldName }) => {
    const classes = useStyles();

    return (
        <Grid item container alignItems="center" xs={6} className={classes.root}>
            <FieldArray
                name={name}
                render={arrayHelpers => (
                    <>
                        {
                            options.map(option => {
                                return option.value === 'other' ? (
                                    <>
                                        <Field name={name}>
                                            {({ field, form }) => (
                                                <FormControlLabel
                                                    classes={{ label: classes.checkboxLabel }}
                                                    control={
                                                        <Checkbox
                                                            value={option.value}
                                                            checked={values[name].includes(option.value)}
                                                            onChange={e => {
                                                                if (e.target.checked) arrayHelpers.push(option.value);
                                                                else {
                                                                    const idx = values[name].indexOf(option.value);
                                                                    arrayHelpers.remove(idx);
                                                                    const result = values[name].filter(value => value !== option.value);
                                                                    form.setFieldValue(textFieldName, '');
                                                                    form.setFieldValue(values[name], result);
                                                                }
                                                            }}
                                                            name={field.name}
                                                            color="primary"
                                                        />}
                                                    label={option.label}
                                                    labelPlacement="start"
                                                />
                                            )}
                                        </Field>
                                        <Field name={textFieldName}>
                                            {({ field, form }) => (
                                                <CIMSCommonTextField
                                                    id={textFieldName+'Id'}
                                                    value={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={value => form.setFieldValue(field.name, value)}
                                                    disabled={!values[name].includes('other')}
                                                    className={classes.otherInput}
                                                    InputProps={{
                                                        className: classes.input
                                                    }}
                                                />
                                            )}
                                        </Field>
                                    </>
                                ) : (
                                    <Field name={name}>
                                        {({ field, form }) => (
                                            <FormControlLabel
                                                classes={{ label: classes.checkboxLabel }}
                                                control={
                                                    <Checkbox
                                                        value={option.value}
                                                        checked={values[name].includes(option.value)}
                                                        onChange={e => {
                                                            if (e.target.checked) arrayHelpers.push(option.value);
                                                            else {
                                                                const idx = values[name].indexOf(option.value);
                                                                arrayHelpers.remove(idx);
                                                            }
                                                        }}
                                                        name={field.name}
                                                        color="primary"
                                                    />}
                                                label={option.label}
                                                labelPlacement="start"
                                            />
                                        )}
                                    </Field>
                                );
                            })
                        }
                    </>
                )}
            />
        </Grid>
    );
};

export default ScreeningInfoCheckboxGroup;

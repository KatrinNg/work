import React from 'react';
import PropTypes from 'prop-types';
import { Grid, TextField } from '@material-ui/core';
import DocTypeFormGroup from './DocTypeFormGroup';

const RelationshipDataForm = ({ formik, comDisabled, name, handleChange }) => {
    return (
        <>
            <Grid item container xs={12} spacing={1}>
                <Grid item container xs={4}>
                    <TextField
                        fullWidth
                        disabled={comDisabled}
                        id={`${name}EngSurname`}
                        name={`${name}EngSurname`}
                        label="Surname"
                        variant="outlined"
                        value={formik.values[`${name}EngSurname`]}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item container xs={4}>
                    <TextField
                        fullWidth
                        disabled={comDisabled}
                        id={`${name}EngGivName`}
                        name={`${name}EngGivName`}
                        label="Given Name"
                        variant="outlined"
                        value={formik.values[`${name}EngGivName`]}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item container xs={4}>
                    <TextField
                        fullWidth
                        disabled={comDisabled}
                        id={`${name}ChiName`}
                        name={`${name}ChiName`}
                        label="中文姓名"
                        variant="outlined"
                        value={formik.values[`${name}ChiName`]}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>

            <DocTypeFormGroup name={name} comDisabled={comDisabled} formik={formik} handleChange={handleChange} />
        </>
    );
};

RelationshipDataForm.propTypes = {
    formik: PropTypes.object,
    comDisabled: PropTypes.bool,
    name: PropTypes.string,
    handleChange: PropTypes.func
};
export default RelationshipDataForm;

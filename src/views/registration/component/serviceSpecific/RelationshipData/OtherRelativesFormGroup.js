import { Grid, makeStyles, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import FormControlSelect from '../../../../../components/Select/FormControlSelect';

const useStyles = makeStyles((theme) => ({
    grid: {
        marginTop: theme.spacing(1)
    }
}));

const OtherRelativesFormGroup = ({ formik, comDisabled, num, handleChange }) => {
    const classes = useStyles();

    const relationship = useSelector((state) => state.common.commonCodeList.relationship || []);

    const memoizedOptions = useMemo(
        () => relationship.map((item) => ({ value: item.code, label: item.engDesc })),
        [relationship]
    );

    const dropDownHandler = (e) => formik.setFieldValue(`relationshipCd${num}`, e?.value || null, false);

    return (
        <>
            <Grid item container xs={4} className={classes.grid}>
                <TextField
                    fullWidth
                    disabled={comDisabled}
                    id={`rlatName${num}`}
                    name={`rlatName${num}`}
                    label="Surname/ Given Name"
                    variant="outlined"
                    value={formik.values[`rlatName${num}`]}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    onChange={handleChange}
                />
            </Grid>

            <Grid item container xs={2} className={classes.grid}>
                <FormControlSelect
                    isDisabled={comDisabled}
                    label="Relationship"
                    name={`relationshipCd${num}`}
                    value={
                        memoizedOptions.find((option) => option.value === formik.values[`relationshipCd${num}`]) || ''
                    }
                    onChange={dropDownHandler}
                    options={memoizedOptions}
                />
            </Grid>
        </>
    );
};
OtherRelativesFormGroup.propTypes = {
    formik: PropTypes.object,
    comDisabled: PropTypes.bool,
    num: PropTypes.number,
    handleChange: PropTypes.func
};
export default OtherRelativesFormGroup;

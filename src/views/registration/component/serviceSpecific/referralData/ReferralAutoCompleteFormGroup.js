import { Grid, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import FormControlCreatableSelect from '../../../../../components/Select/FormControlCreatableSelect';
import { checkIsValidPhoneNum } from '../../../../../utilities/registrationUtilities';

const ReferralAutoCompleteFormGroup = ({ formik, comDisabled, handleChange, classes }) => {
    const relationship = useSelector((state) => state.common.commonCodeList || []);

    const { cgs_rfr_title, cgs_rfr_dept, cgs_rfr_inst } = relationship;

    const memoizedTitleOptions = useMemo(
        () => cgs_rfr_title?.map((item) => ({ value: item.engDesc, label: item.engDesc })),
        [cgs_rfr_title]
    );

    const memoizedDeptOptions = useMemo(
        () => cgs_rfr_dept?.map((item) => ({ value: item.engDesc, label: item.engDesc })),
        [cgs_rfr_dept]
    );

    const memoizedInstOptions = useMemo(
        () => cgs_rfr_inst?.map((item) => ({ value: item.engDesc, label: item.engDesc })),
        [cgs_rfr_inst]
    );

    const rfrTitleHandler = (newValue) => formik.setFieldValue('rfrTitle', newValue?.value || null, false);

    const rfrDeptHandler = (newValue) => formik.setFieldValue('rfrDept', newValue?.value || null, false);

    const rfrHospHandler = (newValue) => formik.setFieldValue('rfrHosp', newValue?.value || null, false);

    // Phone Number validation
    const checkPhoneLength = useCallback(() => {
        if (formik.values.rfrPhn) {
            formik.setFieldTouched('rfrPhn', true, false);
            formik.setFieldError(
                'rfrPhn',
                checkIsValidPhoneNum(formik.values.rfrPhn) ? '' : 'Invalid phone number',
                false
            );
        } else formik.setFieldError('rfrPhn', '', false);
    }, [formik.values.rfrPhn]);

    // Revalidation when errors changed
    useEffect(() => {
        if (Object.keys(formik.errors).length === 0) checkPhoneLength();
    }, [formik.errors]);

    return (
        <>
            <Grid item container xs={12} spacing={1} className={classes.grid}>
                <Grid item container xs={4}>
                    <TextField
                        fullWidth
                        disabled={comDisabled}
                        id="rfrName"
                        name="rfrName"
                        label="Referral Name"
                        variant="outlined"
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        value={formik.values.rfrName}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item container xs={4}>
                    <FormControlCreatableSelect
                        isDisabled={comDisabled}
                        label="Title"
                        name="rfrTitle"
                        value={
                            formik.values.rfrTitle
                                ? memoizedTitleOptions?.find((option) => option.value === formik.values.rfrTitle) || {
                                      value: formik.values.rfrTitle,
                                      label: formik.values.rfrTitle
                                  }
                                : ''
                        }
                        onChange={rfrTitleHandler}
                        options={memoizedTitleOptions}
                    />
                </Grid>
            </Grid>

            <Grid item container xs={12} spacing={1} className={classes.grid}>
                <Grid item container xs={4}>
                    <FormControlCreatableSelect
                        isDisabled={comDisabled}
                        label="Department"
                        name="rfrDept"
                        value={
                            formik.values.rfrDept
                                ? memoizedDeptOptions?.find((option) => option.value === formik.values.rfrDept) || {
                                      value: formik.values.rfrDept,
                                      label: formik.values.rfrDept
                                  }
                                : ''
                        }
                        onChange={rfrDeptHandler}
                        options={memoizedDeptOptions}
                    />
                </Grid>

                <Grid item container xs={4}>
                    <FormControlCreatableSelect
                        isDisabled={comDisabled}
                        label="Institute"
                        name="rfrHosp"
                        value={
                            formik.values.rfrHosp
                                ? memoizedInstOptions?.find((option) => option.value === formik.values.rfrHosp) || {
                                      value: formik.values.rfrHosp,
                                      label: formik.values.rfrHosp
                                  }
                                : ''
                        }
                        onChange={rfrHospHandler}
                        options={memoizedInstOptions}
                    />
                </Grid>

                <Grid item container xs={4}>
                    <TextField
                        fullWidth
                        type="text"
                        disabled={comDisabled}
                        id="rfrPhn"
                        name="rfrPhn"
                        label="Phone No."
                        variant="outlined"
                        inputProps={{ maxLength: 8 }}
                        value={formik.values.rfrPhn}
                        onChange={handleChange}
                        onBlur={checkPhoneLength}
                        error={formik.touched.rfrPhn && Boolean(formik.errors.rfrPhn)}
                        helperText={formik.touched.rfrPhn && formik.errors.rfrPhn}
                    />
                </Grid>
            </Grid>
        </>
    );
};

ReferralAutoCompleteFormGroup.propTypes = {
    formik: PropTypes.object,
    comDisabled: PropTypes.bool,
    handleChange: PropTypes.func,
    classes: PropTypes.object
};

export default ReferralAutoCompleteFormGroup;

import { Box, FormControlLabel, Grid, makeStyles, Radio, RadioGroup } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import FormControlSelect from '../../../../../components/Select/FormControlSelect';
import { referralDataStatusOptions } from '../../../../../utilities/registrationUtilities';
import ReferralAutoCompleteFormGroup from './ReferralAutoCompleteFormGroup';

const useStyles = makeStyles((theme) => ({
    grid: {
        marginTop: theme.spacing(1)
    },
    radioGrid: {
        marginLeft: theme.spacing(1)
    },
    selectInput: {
        width: '100%'
    }
}));

const ReferralDataForm = ({ formik, comDisabled, handleChange }) => {
    const classes = useStyles();

    const clinicList = useSelector((state) => state.common.clinicList || []);

    const memoizedClinicOptions = useMemo(
        () =>
            clinicList
                .filter((item) => item.svcCd === 'CGS')
                .map((item) => ({ value: item.siteId, label: item.siteCd })),
        [clinicList]
    );

    const rfrDateHandler = useCallback(
        (date, value) => {
            formik.setFieldValue('rfrDate', value, false);
            formik.setFieldError('rfrDate', moment(value, 'YYYY-MM-DD', true).isValid() ? '' : 'Invalid Date', false);
        },
        [formik.values.rfrDate]
    );

    const iniDateHandler = useCallback(
        (date, value) => {
            formik.setFieldValue('iniDate', value, false);
            formik.setFieldError('iniDate', moment(value, 'YYYY-MM-DD', true).isValid() ? '' : 'Invalid Date', false);
        },
        [formik.values.iniDate]
    );

    const clinicHandler = (e) => formik.setFieldValue('siteId', e?.value || null, false);

    const statusHandler = (e) => formik.setFieldValue('frmSts', e?.value || null, false);

    // Revalidation when errors changed
    useEffect(() => {
        if (Object.keys(formik.errors).length === 0) {
            if (formik.values.iniDate) iniDateHandler(null, formik.values.iniDate);
            if (formik.values.rfrDate) rfrDateHandler(null, formik.values.rfrDate);
        }
    }, [formik.errors]);

    // console.log(formik.values);
    return (
        <>
            <ReferralAutoCompleteFormGroup
                comDisabled={comDisabled}
                formik={formik}
                handleChange={handleChange}
                classes={classes}
            />

            <Grid item container xs={12} spacing={1} className={classes.grid}>
                <Grid item container xs={4}>
                    <KeyboardDatePicker
                        autoOk
                        fullWidth
                        disabled={comDisabled}
                        inputVariant="outlined"
                        id="rfrDate"
                        name="rfrDate"
                        label="Referral Date"
                        format="YYYY-MM-DD"
                        value={formik.values.rfrDate}
                        onChange={rfrDateHandler}
                        KeyboardButtonProps={{
                            'aria-label': 'change date'
                        }}
                    />
                </Grid>

                <Grid className={classes.radioGrid} item container xs={4}>
                    <RadioGroup
                        aria-label="urgRoutine"
                        name="urgRoutine"
                        value={formik.values.urgRoutine}
                        onChange={handleChange}
                    >
                        <Box ml={2}>
                            <FormControlLabel
                                value="U"
                                control={<Radio disabled={comDisabled} color="primary" />}
                                label="Urgent Case"
                            />
                            <FormControlLabel
                                value="R"
                                control={<Radio disabled={comDisabled} color="primary" />}
                                label="Routine"
                            />
                        </Box>
                    </RadioGroup>
                </Grid>
            </Grid>

            <Grid className={classes.grid} spacing={1} item container xs={12}>
                <Grid item container xs={3}>
                    <FormControlSelect
                        isDisabled={comDisabled}
                        label="Clinic"
                        name="siteId"
                        value={memoizedClinicOptions.find((option) => option.value === formik.values.siteId) || ''}
                        onChange={clinicHandler}
                        options={memoizedClinicOptions}
                    />
                </Grid>

                <Grid item container xs={3}>
                    <FormControlSelect
                        isDisabled={comDisabled}
                        label="Status"
                        name="frmSts"
                        value={referralDataStatusOptions.find((option) => option.value === formik.values.frmSts) || ''}
                        onChange={statusHandler}
                        options={referralDataStatusOptions}
                    />
                </Grid>

                <Grid item container xs={4}>
                    <KeyboardDatePicker
                        autoOk
                        fullWidth
                        disabled={comDisabled}
                        inputVariant="outlined"
                        id="iniDate"
                        name="iniDate"
                        label="Initial Date"
                        format="YYYY-MM-DD"
                        value={formik.values.iniDate}
                        onChange={iniDateHandler}
                        KeyboardButtonProps={{
                            'aria-label': 'change date'
                        }}
                    />
                </Grid>
            </Grid>
        </>
    );
};
ReferralDataForm.propTypes = {
    formik: PropTypes.object,
    comDisabled: PropTypes.bool,
    handleChange: PropTypes.func
};
export default ReferralDataForm;

import { Grid, makeStyles, TextField } from '@material-ui/core';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import FormControlSelect from '../../../../../components/Select/FormControlSelect';
import CommonMessage from '../../../../../constants/commonMessage';
import Enum from '../../../../../enums/enum';
import { checkHKID } from '../../../../../utilities/commonUtilities';
import { formatHKID, unformatHKID } from '../../../../../utilities/registrationUtilities';

const useStyles = makeStyles((theme) => ({
    grid: {
        marginTop: theme.spacing(1)
    }
}));

const DocTypeFormGroup = ({ formik, comDisabled, name, handleChange }) => {
    const classes = useStyles();

    const [formattedHKID, setformattedHKID] = useState('');

    const doc_type = useSelector((state) => state.registration.codeList.doc_type || []);

    const memoizedOptions = useMemo(
        () => doc_type.map((item) => ({ value: item.code, label: item.engDesc })),
        [doc_type]
    );

    const handleDocNumChange = (e) => {
        e.target.value = unformatHKID(e.target.value);
        handleChange(e);
        setformattedHKID(e.target.value);
    };

    const dropDownHandler = (e) => formik.setFieldValue(`docTypeCd${_.capitalize(name)}`, e?.value || null, false);

    // HKID Validation
    const hkidInspection = useCallback(async () => {
        const result = await checkHKID(formik.values[`${name}IdDocNum`]);
        formik.setFieldTouched(`${name}IdDocNum`, true, false);

        if (!result)
            formik.setFieldError(
                `${name}IdDocNum`,
                CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR('HKID Card'),
                false
            );
        else {
            formattedHKID && setformattedHKID(formatHKID(formattedHKID));
            formik.setFieldError(`${name}IdDocNum`, '', false);
        }
    }, [formik.values[`${name}IdDocNum`]]);

    const checkDocNumLength = useCallback(() => {
        if (formik.values[`${name}IdDocNum`] && formik.values[`${name}IdDocNum`].length < 4) {
            formik.setFieldTouched(`${name}IdDocNum`, true, false);
            formik.setFieldError(
                `${name}IdDocNum`,
                CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', 4),
                false
            );
        } else formik.setFieldError(`${name}IdDocNum`, '', false);
    }, [formik.values[`${name}IdDocNum`]]);

    // Manually validation
    const handleBlurDocNum = () => {
        switch (formik.values[`docTypeCd${_.capitalize(name)}`]) {
            case Enum.DOC_TYPE.HKID_ID:
                hkidInspection();
                break;
            default:
                checkDocNumLength();
        }
    };

    const handleFocusDocNum = () => formattedHKID && setformattedHKID(unformatHKID(formattedHKID));

    useEffect(() => handleBlurDocNum(), [formik.values[`docTypeCd${_.capitalize(name)}`]]);

    // Revalidation when errors changed
    useEffect(() => {
        if (Object.keys(formik.errors).length === 0 && formik.values[`${name}IdDocNum`]) handleBlurDocNum();
    }, [formik.errors]);

    // Side effect for editing/ next patient
    useEffect(() => {
        // Set value
        if (!formattedHKID && formik.values[`${name}IdDocNum`])
            setformattedHKID(
                formik.values[`docTypeCd${_.capitalize(name)}`] === Enum.DOC_TYPE.HKID_ID
                    ? formatHKID(formik.values[`${name}IdDocNum`])
                    : formik.values[`${name}IdDocNum`]
            );
        // Reset value
        if (!formik.values[`${name}IdDocNum`] && formattedHKID) setformattedHKID('');
    }, [formik.values[`${name}IdDocNum`], formattedHKID]);

    return (
        <Grid className={classes.grid} item container xs={12} spacing={1}>
            <Grid item container xs={4}>
                <FormControlSelect
                    isDisabled={comDisabled}
                    label="Document Type"
                    name={`docTypeCd${_.capitalize(name)}`}
                    value={
                        memoizedOptions.find(
                            (option) => option.value === formik.values[`docTypeCd${_.capitalize(name)}`]
                        ) || ''
                    }
                    onChange={dropDownHandler}
                    options={memoizedOptions}
                />
            </Grid>

            <Grid item container xs={4}>
                <TextField
                    disabled={comDisabled}
                    fullWidth
                    id={`${name}IdDocNum`}
                    name={`${name}IdDocNum`}
                    label="Document Number"
                    variant="outlined"
                    value={formattedHKID}
                    onChange={handleDocNumChange}
                    onFocus={handleFocusDocNum}
                    onBlur={handleBlurDocNum}
                    error={formik.touched[`${name}IdDocNum`] && Boolean(formik.errors[`${name}IdDocNum`])}
                    helperText={formik.touched[`${name}IdDocNum`] && formik.errors[`${name}IdDocNum`]}
                />
            </Grid>
        </Grid>
    );
};

DocTypeFormGroup.propTypes = {
    formik: PropTypes.object,
    comDisabled: PropTypes.bool,
    name: PropTypes.string,
    handleChange: PropTypes.func
};

export default DocTypeFormGroup;

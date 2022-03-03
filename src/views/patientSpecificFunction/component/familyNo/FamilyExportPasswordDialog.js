import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { useFormik } from 'formik';
import * as PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomizedDialogs from '../../../../components/Dialog/CustomizedDialogs';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import { auditAction } from '../../../../store/actions/als/logAction';
import { exportFamilyNoData } from '../../../../store/actions/familyNo/familyNoAction';
import { ExportFormValidationSchema, initialExportFormValues } from '../../../../utilities/familyNoUtilities';

const useStyles = makeStyles((theme) => ({
    form: {
        padding: theme.spacing(3, 1, 1, 1)
    }
}));

const FamilyExportPasswordDialog = ({ toggle }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'patient', pmi)),
        [dispatch]
    );

    const [values, setValues] = useState({
        showPassword: false,
        showConfirmPassword: false
    });

    const isDialogOpen = useSelector((state) => state.familyNo.isDialogOpen);

    const handleClickShowPassword = (isConfirm) => {
        isConfirm
            ? setValues({ ...values, showConfirmPassword: !values.showConfirmPassword })
            : setValues({ ...values, showPassword: !values.showPassword });
    };

    const handleExport = useCallback((values) => dispatch(exportFamilyNoData(values)), [dispatch]);

    const formik = useFormik({
        initialValues: initialExportFormValues,
        validationSchema: ExportFormValidationSchema,
        onSubmit: (values) => {
            audit('Click Download Family Data Btn', false);
            handleExport(values);
        }
    });

    useEffect(() => {
        if (isDialogOpen) audit('Open Export Family Data Dialog', false);

        if (!isDialogOpen) {
            audit('Close Export Family Data Dialog', false);
            formik.resetForm();
        }
    }, [isDialogOpen]);

    const closeDialog = () => {
        audit(AlsDesc.EXIT, false);
        toggle();
    };

    return (
        <CustomizedDialogs fullWidth maxWidth="sm" open={isDialogOpen} onClose={toggle} dialogTitle="Export File">
            <form className={classes.form} onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <TextField
                        required
                        autoFocus
                        fullWidth
                        id="pass"
                        label="Create a password"
                        name="pass"
                        variant="outlined"
                        type={values.showPassword ? 'text' : 'password'}
                        value={formik.values.pass}
                        onChange={formik.handleChange}
                        error={formik.touched.pass && Boolean(formik.errors.pass)}
                        helperText={formik.touched.pass && formik.errors.pass}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => handleClickShowPassword()}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        {values.showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Box mt={2}>
                        <TextField
                            required
                            fullWidth
                            id="reConfirmPass"
                            label="Confirm your password"
                            name="reConfirmPass"
                            variant="outlined"
                            type={values.showConfirmPassword ? 'text' : 'password'}
                            value={formik.values.reConfirmPass}
                            onChange={formik.handleChange}
                            error={formik.touched.reConfirmPass && Boolean(formik.errors.reConfirmPass)}
                            helperText={formik.touched.reConfirmPass && formik.errors.reConfirmPass}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => handleClickShowPassword(true)}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            {values.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </DialogContent>

                <Box mt={2}>
                    <DialogActions>
                        <Button id="downloadFamilyData" variant="contained" type="submit" color="primary">
                            Download
                        </Button>

                        <Button
                            id="closeExportFamilyDataDialog"
                            variant="contained"
                            onClick={closeDialog}
                            color="primary"
                        >
                            Exit
                        </Button>
                    </DialogActions>
                </Box>
            </form>
        </CustomizedDialogs>
    );
};

FamilyExportPasswordDialog.propTypes = {
    toggle: PropTypes.func
};

export default FamilyExportPasswordDialog;

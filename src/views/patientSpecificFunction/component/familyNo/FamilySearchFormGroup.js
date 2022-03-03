import { Button, makeStyles, TextField } from '@material-ui/core';
import { useFormik } from 'formik';
import * as PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auditAction } from '../../../../store/actions/als/logAction';
import { getFamilyNoData } from '../../../../store/actions/familyNo/familyNoAction';
import * as familyNoActionType from '../../../../store/actions/familyNo/familyNoActionType';
import { initialSearchFormValues, searchFormValidationSchema } from '../../../../utilities/familyNoUtilities';
import FamilyExportPasswordDialog from './FamilyExportPasswordDialog';

const useStyles = makeStyles((theme) => ({
    form: {
        padding: theme.spacing(1)
    },
    input: {
        marginRight: theme.spacing(1),
        marginTop: '4px'
    },
    exportBtn: {
        marginLeft: theme.spacing(4)
    }
}));

const FamilySearchFormGroup = ({ isRegist, rowData, isSearchDialogOpen }) => {
    const classes = useStyles();

    const [isFirstOpen, setisFirstOpen] = useState(true);

    const isDialogOpen = useSelector((state) => state.familyNo.isDialogOpen);

    const patientBaseInfo = useSelector((state) => state.registration.patientBaseInfo);

    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'patient', pmi)),
        [dispatch]
    );

    const getFamilyData = useCallback((id) => dispatch(getFamilyNoData(id)), [dispatch]);

    const toggle = useCallback(() => dispatch({ type: familyNoActionType.DIALOG_TOGGLE }), [dispatch]);

    const formik = useFormik({
        initialValues: initialSearchFormValues,
        validationSchema: searchFormValidationSchema,
        onSubmit: (values) => {
            audit('Click Search Family No. Btn');
            getFamilyData(values.familyNo);
        }
    });

    // Update formik familyNo value
    useEffect(() => {
        if (isRegist && patientBaseInfo.pmiGrpName) formik.setValues({ familyNo: patientBaseInfo.pmiGrpName }, true);
        else if (isRegist && !patientBaseInfo.pmiGrpName) formik.setValues({ familyNo: '' }, true);
    }, [isRegist, patientBaseInfo.pmiGrpName]);

    // Auto search when open dialog
    useEffect(() => {
        if (formik.values.familyNo && isSearchDialogOpen && isRegist && isFirstOpen && patientBaseInfo.pmiGrpName) {
            formik.handleSubmit();
            setisFirstOpen(false);
        }
    }, [formik.values.familyNo]);

    return (
        <>
            {isDialogOpen ? <FamilyExportPasswordDialog toggle={toggle} /> : null}

            <form className={classes.form} onSubmit={formik.handleSubmit}>
                <TextField
                    required
                    className={classes.input}
                    id="familyNo"
                    name="familyNo"
                    label="Family No."
                    variant="outlined"
                    value={formik.values.familyNo}
                    onChange={(e) => formik.setFieldValue('familyNo', e.target.value.toUpperCase())}
                    error={formik.touched.familyNo && Boolean(formik.errors.familyNo)}
                />

                <Button id="SearchFamilyNo" type="submit" variant="contained" color="primary">
                    Search
                </Button>

                <Button
                    id="openExportFamilyDataDialog"
                    disabled={rowData.length === 0 || (rowData.length === 0 && !formik.getFieldProps('familyNo').value)}
                    className={classes.exportBtn}
                    variant="contained"
                    color="primary"
                    onClick={toggle}
                >
                    Export
                </Button>
            </form>
        </>
    );
};

FamilySearchFormGroup.propTypes = {
    rowData: PropTypes.array,
    isSearchDialogOpen: PropTypes.bool
};

export default FamilySearchFormGroup;

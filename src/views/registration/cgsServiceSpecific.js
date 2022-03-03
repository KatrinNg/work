import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { familyNoTypes } from '../../constants/registration/registrationConstants';
import { updateCgsSpec, updatePatientBaseInfo } from '../../store/actions/registration/registrationAction';
import * as registrationActionType from '../../store/actions/registration/registrationActionType';
import { otherRelatives } from '../../utilities/registrationUtilities';
import FamilyNoFormGroup from './component/serviceSpecific/familyNumber/FamilyNoFormGroup';
import ReferralDataForm from './component/serviceSpecific/referralData/ReferralDataForm';
import OtherRelativesFormGroup from './component/serviceSpecific/RelationshipData/OtherRelativesFormGroup';
import RelationshipDataForm from './component/serviceSpecific/RelationshipData/RelationshipDataForm';

const useStyles = makeStyles((theme) => ({
    form: {
        padding: theme.spacing(0, 6, 1, 6)
    },
    title: {
        margin: theme.spacing(3, 0, 1, 0),
        fontWeight: 'bold'
    },
    subTitle: {
        margin: theme.spacing(1, 0, 1, 0)
    }
}));

const ServiceSpecific = ({ isNextReg, comDisabled, isSubmit, isReset, isDisplayEditBtn }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const cgsSpec = useSelector((state) => state.registration.patientBaseInfo.cgsSpec);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: cgsSpec,
        onSubmit: (values) => {
            return values;
        }
    });

    const updateFormValidtion = useCallback(
        (value) =>
            dispatch({
                type: registrationActionType.UPDATE_SERVICE_SPECIFIC_FORM_VALIDATION,
                payload: { isValid: value }
            }),
        [dispatch]
    );

    const updateCgsSpecAction = useCallback((value) => dispatch(updateCgsSpec(value)), [dispatch]);

    const updatePatientBaseInfoAction = useCallback((object) => dispatch(updatePatientBaseInfo(object)), [dispatch]);

    // Check is edit
    useEffect(() => {
        if (isDisplayEditBtn) {
            const { pmiGrpId, pmiGrpName, isChief } = cgsSpec;
            updatePatientBaseInfoAction({
                familyNoType: pmiGrpId ? familyNoTypes.EXISTING : familyNoTypes.NONE,
                pmiGrpId: pmiGrpId,
                pmiGrpName: pmiGrpName,
                isChief: isChief
            });
        }
    }, [isDisplayEditBtn, cgsSpec]);

    // Disable shouldValidate
    const handleChange = (e) =>
        formik.setFieldValue(
            e.target.name,
            e.target.name === 'fthrIdDocNum' || e.target.name === 'mothrIdDocNum'
                ? e.target.value.toUpperCase()
                : e.target.value,
            false
        );

    // Handle Submit
    useEffect(() => {
        if (isSubmit) updateCgsSpecAction(formik.values);
    }, [isSubmit]);

    // Handle reset
    useEffect(() => {
        if (isReset) formik.resetForm();
    }, [isReset]);

    // Manually handle form validation
    useEffect(() => {
        if (Object.keys(formik.errors).every((x) => formik.errors[x] === '')) updateFormValidtion(true);
        else updateFormValidtion(false);
    }, [formik.errors]);

    // console.log(formik.errors);
    // console.log(formik.values);
    return (
        <form className={classes.form} onSubmit={formik.handleSubmit}>
            <Typography className={classes.title} variant="h6" color="primary">
                Family Number
            </Typography>

            <FamilyNoFormGroup comDisabled={comDisabled} isNextReg={isNextReg} />

            <Typography className={classes.title} variant="h6" color="primary">
                Relationship Data
            </Typography>

            <Typography className={classes.subTitle} variant="h6">
                Father
            </Typography>

            <RelationshipDataForm name="fthr" comDisabled={comDisabled} formik={formik} handleChange={handleChange} />

            <Typography className={classes.subTitle} variant="h6">
                Mother
            </Typography>

            <RelationshipDataForm name="mothr" comDisabled={comDisabled} formik={formik} handleChange={handleChange} />

            <Typography className={classes.subTitle} variant="h6">
                Other Relatives
            </Typography>

            <Grid item container xs={12} spacing={1}>
                {otherRelatives.map((item) => (
                    <OtherRelativesFormGroup
                        key={item}
                        num={item}
                        comDisabled={comDisabled}
                        formik={formik}
                        handleChange={handleChange}
                    />
                ))}
            </Grid>

            <Typography className={classes.title} variant="h6" color="primary">
                Referral Data
            </Typography>

            <ReferralDataForm comDisabled={comDisabled} formik={formik} handleChange={handleChange} />
        </form>
    );
};

ServiceSpecific.propTypes = {
    isNextReg: PropTypes.bool,
    comDisabled: PropTypes.bool,
    isSubmit: PropTypes.bool,
    isReset: PropTypes.bool,
    isDisplayEditBtn: PropTypes.bool
};

export default ServiceSpecific;

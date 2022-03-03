import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomizedDialogs from '../../../components/Dialog/CustomizedDialogs';
import { Grid, DialogActions, DialogContent, Typography, makeStyles } from '@material-ui/core';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import CIMSCommonButton from '../../../components/Buttons/CIMSCommonButton';
import CIMSCommonSelect from '../../../components/Select/CIMSCommonSelect';
import CIMSCommonTextField from '../../../components/TextField/CIMSCommonTextField';
import ScreeningInfoCheckboxGroup from './screeningInfo/ScreeningInfoCheckboxGroup';
import { fetchScreeningInfo, saveScreeningInfo } from '../../../store/actions/registration/registrationAction';
import { auditAction } from '../../../store/actions/als/logAction';
import Enum from '../../../enums/enum';
import { structuredRegistrationScreeningInfoPayload } from '../../../utilities/registrationUtilities';

const useStyles = makeStyles((theme) => ({
    form: {
        // padding: theme.spacing(0, 6, 1, 6)
    },
    sectionTitle: {
        padding: '0px 8px',
        color: theme.palette.primaryColor
    },
    titleTxt: {
        fontWeight: 'bold'
    },
    error: {
        color: 'red',
        fontSize: '0.75rem'
    },
    otherInput: {
        width: '100px'
    },
    input: {
        height: 40
    },
    gridRow: {
        minHeight: '120px'
    }
}));

const ScreeningInfoDialog = ({isScreeningInfoDialogOpen, closeScreeningInfoDialog}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const screeningInfo = useSelector(state => state.registration.screeningInfo);
    const deliveryModeOptions = Enum.PATIENT_SUMMARY_SCREENING_INFO_DELIVERY_MODE;
    const checkboxOptions =  [
        {
            label: "Mother",
            value: "mother"
        },
        {
            label: "Father",
            value: "father"
        },
        {
            label: "Other",
            value: "other"
        }
    ];

    let initialValues = {
        deliveryMode: (screeningInfo && deliveryModeOptions.find(item => item.value === screeningInfo.modeOfDelivery)) ?? '',
        gravida: screeningInfo?.gravida ?? '',
        attendHealthTalkMembers: screeningInfo?.attendedHealthTalk?.checkboxOptions ?? [],
        attendHealthTalkOtherInput: screeningInfo?.attendedHealthTalk?.otherInput ?? '',
        thyroidDiseaseHistory: screeningInfo?.thyroidDiseaseHistory?.checkboxOptions ?? [],
        thyroidDiseaseHistoryInput: screeningInfo?.thyroidDiseaseHistory?.otherInput ?? '',
        remarks: screeningInfo?.remarks ?? ''
    };

    const validationSchema = yup.object().shape({
        deliveryMode: yup
            .object()
            .nullable()
            // .required('Required')
            ,
        gravida: yup
            .string()
            .nullable()
            // .required('Required')
            ,
        attendHealthTalkOtherInput: yup
            .string()
            .nullable()
            // .when('attendHealthTalkMembers', {
            //     is: (attendHealthTalkMembers) => attendHealthTalkMembers.includes('other') && !initialValues.attendHealthTalkOtherInput,
            //     then: yup.string().required('Required')
            // })
            ,
        thyroidDiseaseHistoryInput: yup
            .string()
            .nullable()
            // .when('thyroidDiseaseHistory', {
            //     is: (thyroidDiseaseHistory) => thyroidDiseaseHistory.includes('other') && !initialValues.thyroidDiseaseHistoryInput,
            //     then: yup.string().required('Required')
            // })
    });

    const handleSave = (values) => {
        auditAction('Click save button in screening info dialog', null, null, false, 'patient');
        const docId = screeningInfo?.docId;
        dispatch(fetchScreeningInfo(docId, handleSaveCallback(values)));
    };

    const handleSaveCallback = (values) => {
        const docId = screeningInfo?.docId;
        const patientKey = screeningInfo?.patientKey;
        const docItems = screeningInfo?.docItems;
        const payload = structuredRegistrationScreeningInfoPayload(docId, patientKey, docItems, values);
        dispatch(saveScreeningInfo(payload));
        closeScreeningInfoDialog();
    };

    return (
        <CustomizedDialogs
            fullWidth
            maxWidth="md"
            open={isScreeningInfoDialogOpen}
            onClose={closeScreeningInfoDialog}
            dialogTitle="Screening Information"
            disableBackdropClick
        >
            <DialogContent>
                <Formik
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, actions) => {
                        handleSave(values);

                        setTimeout(() => {
                            actions.setSubmitting(false);
                        }, 300);
                    }}
                >
                    {
                        ({
                            isSubmitting,
                            values,
                            errors,
                            touched,
                            handleBlur,
                            handleChange,
                            handleSubmit
                        }) => (
                            <Form>
                                <Grid container>
                                    <Grid container item xs={12} spacing={3} className={classes.sectionTitle}>
                                        <Grid item xs={4} className={classes.gridRow}>
                                            <Typography className={classes.titleTxt} variant={'h6'}>Mode of Delivery</Typography>
                                            <Field name="deliveryMode">
                                                {({ field, form, meta }) => (
                                                    <CIMSCommonSelect
                                                        id="deliveryModeId"
                                                        options={deliveryModeOptions}
                                                        value={field.value}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                        onChange={(value, params) => {
                                                            form.setFieldValue(field.name, value);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                            <ErrorMessage name="deliveryMode" component="div" className={classes.error} />
                                        </Grid>
                                        <Grid item xs={4} className={classes.gridRow}>
                                            <Typography className={classes.titleTxt} variant={'h6'}>Gravida</Typography>
                                            <Field name="gravida">
                                                {({ field, form, meta }) => (
                                                    <CIMSCommonTextField
                                                        id="gravidaId"
                                                        value={field.value}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                        onChange={value => form.setFieldValue(field.name, value)}
                                                        InputProps={{
                                                            className: classes.input
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                            <ErrorMessage name="gravida" component="div" className={classes.error} />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} className={`${classes.sectionTitle} ${classes.gridRow}`}>
                                        <Typography className={classes.titleTxt} variant={'h6'}>Attend Health Talk</Typography>
                                        <ScreeningInfoCheckboxGroup
                                            name="attendHealthTalkMembers"
                                            options={checkboxOptions}
                                            values={values}
                                            textFieldName="attendHealthTalkOtherInput"
                                        />
                                        <ErrorMessage name="attendHealthTalkOtherInput" component="div" className={classes.error} />
                                    </Grid>
                                    <Grid item xs={12} className={`${classes.sectionTitle} ${classes.gridRow}`}>
                                        <Typography className={classes.titleTxt} variant={'h6'}>History of Thyroid Disease</Typography>
                                        <ScreeningInfoCheckboxGroup
                                            name="thyroidDiseaseHistory"
                                            options={checkboxOptions}
                                            values={values}
                                            textFieldName="thyroidDiseaseHistoryInput"
                                        />
                                        <ErrorMessage name="thyroidDiseaseHistoryInput" component="div" className={classes.error} />
                                    </Grid>
                                    <Grid item xs={4} className={classes.sectionTitle}>
                                        <Field name="remarks">
                                            {({ field, form, meta }) => (
                                                <CIMSCommonTextField
                                                    id="remarksId"
                                                    label="Remarks"
                                                    value={field.value}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                    onChange={value => form.setFieldValue(field.name, value)}
                                                    InputLabelProps={{
                                                        shrink: true
                                                    }}
                                                    InputProps={{
                                                        className: classes.input
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        {/* <ErrorMessage name="remarks" component="div" className={classes.error} /> */}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <DialogActions>
                                            <CIMSCommonButton
                                                id="screeningInfoSaveButton"
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                Save
                                            </CIMSCommonButton>
                                            <CIMSCommonButton
                                                id="screeningInfoCancelButton"
                                                onClick={closeScreeningInfoDialog}
                                            >
                                                Cancel
                                            </CIMSCommonButton>
                                        </DialogActions>
                                    </Grid>
                                </Grid>
                            </Form>
                        )
                    }
                </Formik>
            </DialogContent>
        </CustomizedDialogs>
    );
};

export default ScreeningInfoDialog;

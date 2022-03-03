import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, FormControl } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import RegFieldName from '../../enums/registration/regFieldName';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import { updateState } from '../../store/actions/registration/registrationAction';


//eslint-disable-next-line
const styles = (theme) => ({
    root: {
        marginTop: 10,
        width: '90%'
    },
    grid: {
        paddingTop: 4,
        paddingBottom: 4,
        //padding: 20,
        justifyContent: 'center'
    }
});

const StyledFormControl = withStyles({
    root: {
        marginTop: 0
    }
})(FormControl);

class SocialData extends Component {

    shouldComponentUpdate(nextProps) {
        return nextProps.comDisabled !== this.props.comDisabled ||
            nextProps.registerCodeList !== this.props.registerCodeList ||
            nextProps.patientSocialData !== this.props.patientSocialData;
    }

    handleOnChange = (value, name) => {
        let socialData = _.cloneDeep(this.props.patientSocialData);
        socialData[name] = value;
        this.props.updateState({ patientSocialData: socialData });
    }

    render() {
        const { classes, registerCodeList, comDisabled, patientSocialData } = this.props;
        return (
            <Grid container justify="center">
                <Grid item container spacing={2} className={classes.root}>
                    <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <SelectFieldValidator
                                id={RegFieldName.SOCIAL_DATA_ETHNICITY}
                                options={
                                    registerCodeList &&
                                    registerCodeList.ethnicity &&
                                    registerCodeList.ethnicity.map((item) => (
                                        { value: item.code, label: item.engDesc }))}
                                value={patientSocialData.ethnicityCd}
                                onChange={(e) => this.handleOnChange(e.value, RegFieldName.SOCIAL_DATA_ETHNICITY)}
                                isDisabled={comDisabled}
                                // labelText="Ethnicity"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Ethnicity'
                                    // //InputLabelProps: { shrink: true }
                                }}
                                addNullOption
                            />
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <SelectFieldValidator
                                id={RegFieldName.SOCIAL_DATA_MARITAL_STATUS}
                                options={
                                    registerCodeList &&
                                    registerCodeList.marital_status &&
                                    registerCodeList.marital_status.map((item) => (
                                        { value: item.code, label: item.engDesc }))}
                                value={patientSocialData.maritalStatusCd}
                                onChange={(e) => this.handleOnChange(e.value, RegFieldName.SOCIAL_DATA_MARITAL_STATUS)}
                                isDisabled={comDisabled}
                                // labelText="Marital Status"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Marital Status'
                                    //InputLabelProps: { shrink: true }
                                }}
                                addNullOption
                            />
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <SelectFieldValidator
                                id={RegFieldName.SOCIAL_DATA_Religion}
                                options={
                                    registerCodeList &&
                                    registerCodeList.religion &&
                                    registerCodeList.religion.map((item) => (
                                        { value: item.code, label: item.engDesc }))}
                                value={patientSocialData.religionCd}
                                onChange={(e) => this.handleOnChange(e.value, RegFieldName.SOCIAL_DATA_Religion)}
                                isDisabled={comDisabled}
                                // labelText="Religion"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Religion'
                                    //InputLabelProps: { shrink: true }
                                }}
                                addNullOption
                            />
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <SelectFieldValidator
                                id={RegFieldName.SOCIAL_DATA_OCCUPATION}
                                options={
                                    registerCodeList &&
                                    registerCodeList.occupation &&
                                    registerCodeList.occupation.map((item) => (
                                        { value: item.code, label: item.engDesc }))}
                                value={patientSocialData.occupationCd}
                                onChange={(e) => this.handleOnChange(e.value, RegFieldName.SOCIAL_DATA_OCCUPATION)}
                                // labelText="Occupation"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Occupation'
                                    //InputLabelProps: { shrink: true }
                                }}
                                isDisabled={comDisabled}
                                addNullOption
                            />
                        </StyledFormControl>
                    </Grid>
                    {/* <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <SelectFieldValidator
                                id={RegFieldName.SOCIAL_DATA_TRANSLATION_LANGUAGE}
                                options={
                                    registerCodeList &&
                                    registerCodeList.translation_lang &&
                                    registerCodeList.translation_lang.map((item) => (
                                        { value: item.code, label: item.engDesc }))}
                                value={patientSocialData.translationLangCd}
                                onChange={(e) => this.handleOnChange(e.value, RegFieldName.SOCIAL_DATA_TRANSLATION_LANGUAGE)}
                                isDisabled={comDisabled}
                                // labelText="Translation Language"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Translation Language'
                                    //InputLabelProps: { shrink: true }
                                }}
                            />
                        </StyledFormControl>
                    </Grid> */}
                    <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <SelectFieldValidator
                                id={RegFieldName.SOCIAL_DATA_EDUCATION_LEVEL}
                                options={
                                    registerCodeList &&
                                    registerCodeList.edu_level &&
                                    registerCodeList.edu_level.map((item) => (
                                        { value: item.code, label: item.engDesc }))}
                                value={patientSocialData.eduLevelCd}
                                onChange={(e) => this.handleOnChange(e.value, RegFieldName.SOCIAL_DATA_EDUCATION_LEVEL)}
                                isDisabled={comDisabled}
                                // labelText="Education Level"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Education Level'
                                    //InputLabelProps: { shrink: true }
                                }}
                                addNullOption
                            />
                        </StyledFormControl>
                    </Grid>
                    {/* <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <SelectFieldValidator
                                id={RegFieldName.SOCIAL_DATA_GOVERNMENT_DEPARTMENT}
                                options={
                                    registerCodeList &&
                                    registerCodeList.gov_dpt &&
                                    registerCodeList.gov_dpt.map((item) => (
                                        { value: item.code, label: item.engDesc }))}
                                value={patientSocialData.govDptCd}
                                onChange={e => this.handleOnChange(e.value, RegFieldName.SOCIAL_DATA_GOVERNMENT_DEPARTMENT)}
                                // labelText="Government Department"
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'Government Department'
                                    //InputLabelProps: { shrink: true }
                                }}
                                isDisabled={comDisabled}
                                addNullOption
                            />
                        </StyledFormControl>
                    </Grid>
                    <Grid item xs={6} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <TextFieldValidator
                                id={RegFieldName.SOCIAL_DATA_RANK}
                                inputProps={{ maxLength: 50 }}
                                disabled={comDisabled}
                                value={patientSocialData.rank}
                                onChange={e => this.handleOnChange(e.target.value, RegFieldName.SOCIAL_DATA_RANK)}
                                name={RegFieldName.SOCIAL_DATA_RANK}
                                // labelText="Rank"
                                label="Rank"
                                // InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </StyledFormControl>
                    </Grid> */}
                    <Grid item xs={12} className={classes.grid}>
                        <StyledFormControl fullWidth>
                            <FastTextFieldValidator
                                id={RegFieldName.SOCIAL_DATA_REMARKS}
                                inputProps={{ maxLength: 500 }}
                                disabled={comDisabled}
                                value={patientSocialData.remarks}
                                onBlur={e => this.handleOnChange(e.target.value, RegFieldName.SOCIAL_DATA_REMARKS)}
                                name={RegFieldName.SOCIAL_DATA_REMARKS}
                                // labelText="Remarks"
                                label="Remarks"
                                // InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </StyledFormControl>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}
const mapStateToProps = state => {
    return {
        registerCodeList: state.registration.codeList,
        patientSocialData: state.registration.patientSocialData
    };
};

const mapDispatchToProps = {
    updateState
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SocialData));
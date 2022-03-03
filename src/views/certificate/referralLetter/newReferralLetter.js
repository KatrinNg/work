import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import FastTextField from '../../../components/TextField/FastTextField';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ReferToGroup from './component/referToGroup';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import AttnDate from '../component/attnDate';
import letterConstants from '../../../constants/letter/letterConstants';
import  * as commonUtilities from '../../../utilities/commonUtilities';

const styles = () => ({
    root: {
        width: '100%'
    },
    AttnDate: {
        margin: '0 0 0 8px'
    },
    referralLetterForm: {
        position: 'relative',
        margin: '8px 0 0 0',
        padding: '0 2rem 0 0',
        height: '655px',
        overflowX: 'hidden',
        overflowY: 'auto'
    }
});

const appointmentType = [
    // { label: 'Normal', value: 'N' },
    {label:'Urgent',value:'U'},
    { label: 'Early', value: 'E' }
];


const ReferralLetter = (props) => {

    const { classes, isSelected, serviceList,clinicList, allowCopyList,group,hospital,specialty } = props;
    let letterInfo = props.newLetterInfo;
    // let allowCopyList = props.allowCopyList;

    const updateLetterInfo = (value, name) => {
        let _letterInfo = { ...props.newLetterInfo };
        // const reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        // if (name === 'to' || name === 'problem' || name === 'result' || name === 'familyHistory') {
        //     if (reg.test(value)) {
        //         return;
        //     }
        // }

        _letterInfo[name] = value;
        props.handleOnChange({ newLetterInfo: _letterInfo });
    };
    return (
        <Grid container className={classes.root}>
            <Grid item container className={classes.AttnDate}><AttnDate id="referralLetter" /></Grid>
            <Grid item container spacing={2} xs={12} alignItems="center" className={classes.referralLetterForm}>
                <Grid item container xs={12} alignItems="center">
                    <ReferToGroup
                        id={props.id + '_referToGroup'}
                        referTo={letterInfo.referTo}
                        onChange={(value) => updateLetterInfo(value, 'referTo')}
                        hospitalClinicList={props.hospitalClinicList}
                        isSelected={isSelected}
                        serviceList={serviceList}
                        clinicList={clinicList}
                        group={group}
                        hospital={hospital}
                        specialty={specialty}
                    />
                </Grid>
                <Grid item container xs={12} >
                    <Grid item xs={3}>
                        <FastTextFieldValidator
                            id={props.id + '_txtTo'}
                            value={letterInfo.to}
                            onBlur={e => updateLetterInfo(e.target.value, 'to')}
                            inputProps={{ maxLength: 34 }}
                            disabled={isSelected}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            variant={'outlined'}
                            label={<>To<RequiredIcon /></>}
                            calActualLength
                        />
                    </Grid>
                    <Grid item xs={1} />
                    <Grid item xs={4}>
                        <SelectFieldValidator
                            id={props.id + '_appointmentTypeGroup'}
                            value={letterInfo.appointmentType}
                            addNullOption
                            TextFieldProps={{
                                variant: 'outlined',
                                label: 'Appointment Type'
                            }}
                            options={appointmentType.map(item => ({ value: item.value, label: item.label }))}
                            onChange={(e) => { updateLetterInfo(e.value, 'appointmentType'); }}
                            isDisabled={isSelected}
                        />
                    </Grid>

                </Grid>
                <Grid item container xs={12} >
                    <FastTextField
                        rows="3"
                        multiline
                        trim="none"
                        id={props.id + '_problem'}
                        value={letterInfo.problem}
                        style={{ height: 90 }}
                        disabled={isSelected}
                        onBlur={e => updateLetterInfo(e.target.value, 'problem')}
                        inputProps={{ maxLength: 4000 }}
                        variant={'outlined'}
                        label={'Problem'}
                        calActualLength
                        error={letterInfo && letterInfo.problem && (letterInfo.problem > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.problem, 4000))
                            ? true : false}
                        helperText={letterInfo && letterInfo.problem && (letterInfo.problem > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.problem, 4000))
                            ? 'Problem max size is 4000 !' : ''}
                    />
                    {/* </Grid> */}
                </Grid>
                <Grid item container xs={12} >
                    <FastTextField
                        rows="8"
                        multiline
                        trim="none"
                        id={props.id + '_result'}
                        value={letterInfo.result}
                        inputProps={{ maxLength: 4000 }}
                        disabled={isSelected}
                        onBlur={e => updateLetterInfo(e.target.value, 'result')}
                        variant={'outlined'}
                        label="Hx/PE/Ix Results"
                        calActualLength
                        error={(letterInfo && letterInfo.result && (letterInfo.result.length > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.result, 4000)))
                            ? true : false}
                        helperText={(letterInfo && letterInfo.result && (letterInfo.result.length > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.result, 4000)))
                            ? 'Hx/PE/Ix Results max size is 4000 !' : ''}
                    />
                    {/* </Grid> */}
                </Grid>
                <Grid item container xs={12} >
                    <FastTextField
                        rows="3"
                        multiline
                        trim="none"
                        id={props.id + '_allergies'}
                        value={letterInfo.familyHistory}
                        inputProps={{ maxLength: 4000 }}
                        disabled={isSelected}
                        onBlur={e => updateLetterInfo(e.target.value, 'familyHistory')}
                        variant={'outlined'}
                        label="Histories/Allergies/Adverse Drug Reaction & Alerts"
                        calActualLength
                        error={(letterInfo && letterInfo.familyHistory && (letterInfo.familyHistory.length > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.familyHistory, 4000)))
                            ? true : false}
                        helperText={(letterInfo && letterInfo.familyHistory && (letterInfo.familyHistory.length > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.familyHistory, 4000)))
                            ? 'Histories/Allergies/Adverse Drug Reaction & Alerts max size is 4000 !' : ''}
                    />
                    {/* </Grid> */}
                </Grid>
                <Grid item container xs={12} >
                    <FastTextField
                        rows="3"
                        multiline
                        trim="none"
                        id={props.id + '_medications'}
                        value={letterInfo.medications}
                        inputProps={{ maxLength: 4000 }}
                        disabled={isSelected}
                        onBlur={e => updateLetterInfo(e.target.value, 'medications')}
                        variant={'outlined'}
                        label="Treatment Commenced"
                        calActualLength
                        error={(letterInfo && letterInfo.medications && (letterInfo.medications.length > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.medications, 4000)))
                            ? true : false}
                        helperText={(letterInfo && letterInfo.medications && (letterInfo.medications.length > 4000
                            || commonUtilities.isMaxSizeCharacters(letterInfo.medications, 4000)))
                            ? 'Treatment commenced max size is 4000 !' : ''}
                    />
                </Grid>
                {/* </Grid> */}
                <Grid item container xs={12} >
                    <Grid container direction={'row'}>
                        <Grid style={{ width: 150 }}>
                            <SelectFieldValidator
                                id={props.id + '_selectCopyPage'}
                                value={props.copyPage}
                                isDisabled={isSelected}
                                options={allowCopyList && allowCopyList.map(item => ({ value: item.value, label: item.desc }))}
                                onChange={e => props.handleOnChange({ copyPage: e.value })}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: 'No. of Copy'
                                }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const mapStateToProps = (state) => {
    return {
        newLetterInfo: state.referralLetter.newLetterInfo,
        handlingPrint: state.referralLetter.handlingPrint,
        referToOpts: state.referralLetter.referToOpts,
        specialtyList: state.referralLetter.specialtyList,
        group:state.common.group,
        hospital:state.common.hospital,
        specialty:state.common.specialty
    };
};

// const mapDispatchToProps = {
// };

export default connect(mapStateToProps)(withStyles(styles)(ReferralLetter));

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import CIMSInputLabel from '../../../components/InputLabel/CIMSInputLabel';
import CIMSSelect from '../../../components/Select/CIMSSelect';
import PassportGroup from './component/passportGroup';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import CommonRegex from '../../../constants/commonRegex';
import _ from 'lodash';
import AttnDate from '../component/attnDate';

const styles = () => ({
    root: {
        width: '95%'
    }
});

class NewYellowFever extends Component {

    updateLetterInfo = (value, name) => {
        let letterInfo = { ...this.props.newYellowFeverLetter };
        // const reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        // if (name === 'exemptionReason') {
        //     if (reg.test(value)) {
        //         return;
        //     }
        // }

        if (name === 'nationality' || name === 'issuedCountry' || name === 'passportNumber') {
            value = value.toUpperCase();
        }

        letterInfo[name] = value;
        this.props.handleOnChange({ newYellowFeverInfo: letterInfo });
    }

    render() {
        const { classes, allowCopyList, nationalityList, passportList, newYellowFeverLetter, isSelected } = this.props;

        return (
            <Grid container spacing={4} className={classes.root}>
                <Grid item container><AttnDate id="yellowFever" /></Grid>
                <Grid container item xs={12}>
                    <Grid item xs={2}><CIMSInputLabel>Name:<RequiredIcon /></CIMSInputLabel></Grid>
                    <Grid item xs={3}>
                        <FastTextFieldValidator
                            id={`${this.props.id}_nameTextField`}
                            name={'patientName'}
                            disabled={isSelected}
                            onBlur={e => this.updateLetterInfo(e.target.value, e.target.name)}
                            value={newYellowFeverLetter.patientName}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            inputProps={{ maxLength: 500 }}
                            variant={'outlined'}
                            calActualLength
                        />
                    </Grid>
                    {/* </Grid> */}
                    {/* <Grid item container xs={12} > */}
                    <Grid item xs={2} style={{ paddingLeft: 30 }}><CIMSInputLabel>Nationality:<RequiredIcon /></CIMSInputLabel></Grid>
                    <Grid item xs={3}>
                        <SelectFieldValidator
                            id={`${this.props.id}_nationalitySelectField`}
                            name={'nationality'}
                            onChange={e => this.updateLetterInfo(e.value, 'nationality')}
                            value={newYellowFeverLetter.nationality}
                            options={nationalityList && nationalityList.map(item => ({ value: _.toUpper(item || ''), label: item }))}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            isDisabled={isSelected}
                            TextFieldProps={{
                                variant: 'outlined'
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid item container xs={12} >
                    <PassportGroup
                        id={`${this.props.id}_passprotGroup`}
                        passportGroupOnChange={this.updateLetterInfo}
                        passportInfo={{
                            issuedCountry: newYellowFeverLetter.issuedCountry,
                            passportNumber: newYellowFeverLetter.passportNumber,
                            passportList: passportList
                        }}
                        isSelected={isSelected}
                    />
                </Grid>

                <Grid item container xs={12} >
                    <Grid item xs={2}><CIMSInputLabel>Exemption Notes:<RequiredIcon /></CIMSInputLabel></Grid>
                    <Grid item xs={10}>
                        <FastTextFieldValidator
                            id={`${this.props.id}_exemptionReasonTextField`}
                            multiline
                            trim="none"
                            rows="5"
                            name={'exemptionReason'}
                            disabled={isSelected}
                            onBlur={e => this.updateLetterInfo(e.target.value, e.target.name)}
                            value={newYellowFeverLetter.exemptionReason}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            inputProps={{ maxLength: 1000 }}
                            variant={'outlined'}
                            calActualLength
                        />
                    </Grid>
                </Grid>
                <Grid item container xs={12} >
                    <Grid item xs={2}><CIMSInputLabel>No. of Copy:</CIMSInputLabel></Grid>
                    <Grid item xs={10}>
                        <Grid container direction={'row'}>
                            <Grid style={{ width: 150 }}>
                                <SelectFieldValidator
                                    id={`${this.props.id}_selectCopyPage`}
                                    value={this.props.copyPage}
                                    options={allowCopyList && allowCopyList.map(item => ({ value: item.value, label: item.desc }))}
                                    onChange={e => this.props.handleOnChange({ copyPage: e.value })}
                                    autoComplete={'off'}
                                    isDisabled={isSelected}
                                    TextFieldProps={{
                                        variant: 'outlined'
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
    }
}

const mapStateToProps = (state) => {
    return {
        newYellowFeverLetter: state.yellowFever.newYellowFeverInfo,
        nationalityList: state.patient.nationalityList,
        passportList: state.common.passportList,
        service: state.login.service
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewYellowFever));
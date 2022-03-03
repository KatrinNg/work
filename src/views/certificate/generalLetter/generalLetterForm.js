import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CIMSFormLabel from 'components/InputLabel/CIMSFormLabel';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../constants/commonMessage';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../enums/validatorEnum';
import AttnGroup from './component/attnGroup';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


const customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiInputBase: {
            ...theme.overrides.MuiInputBase,
            multiline: {
                padding: '6px 14px 0px'
            }
        }
    }
});

const styles = (theme) => ({
    root: {
        paddingTop: 30,
        width: '95%'
    },
    formLabelContainer: {
        paddingTop: 20,
        paddingBottom: 20
    },
    radioGroupClassname: {
        height: 'auto',
        paddingTop: 20,
        paddingBottom: 20
    },
    formControlLabelClss1: {
        padding: '10px 0px'
    },
    formControlLabelClss2: {
        paddingLeft: 30
    },
    formLabelroot: {
        padding: `${theme.spacing(3)}px ${theme.spacing(2)}px`,
        width: '100%'
    }
});

class GeneralLetterForm extends Component {

    updateLeaveInfo = (value, name) => {
        let leaveInfo = { ...this.props.newLetterInfo };
        leaveInfo[name] = value;
        this.props.handleOnChange({ newLetterInfo: leaveInfo });
    }


    render() {
        const { classes, allowCopyList, newLetterInfo, isSelected } = this.props;
        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid container spacing={2} className={classes.root}>
                    <Grid item container xs={12} spacing={3}>
                        <Grid item container xs={6} style={{ marginBottom: 15 }}>
                            <FastTextFieldValidator
                                id={this.props.id + '_letterTo'}
                                calActualLength
                                value={newLetterInfo.letterTo}
                                onBlur={e => this.updateLeaveInfo(e.target.value, 'letterTo')}
                                inputProps={{ maxLength: 65 }}
                                label={<>To<RequiredIcon /></>}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                disabled={isSelected}
                                variant={'outlined'}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item container xs={2} style={{ marginLeft: 35 }}>
                            <DateFieldValidator
                                id={this.props.id + '_letterDate'}
                                value={newLetterInfo.letterDate}
                                isRequired
                                onChange={e => this.updateLeaveInfo(e, 'letterDate')}
                                label={<>Date<RequiredIcon /></>}
                                disabled={isSelected}
                                disableFuture
                                absoluteMessage
                                inputVariant={'outlined'}
                            />
                        </Grid>
                        <Grid item container xs={2} style={{ marginLeft: 35 }}>
                            <SelectFieldValidator
                                id={`${this.props.id}_noOfCopy`}
                                value={this.props.copyPage}
                                options={allowCopyList && allowCopyList.map(item => ({ value: item.value, label: item.desc }))}
                                onChange={e => this.props.handleOnChange({ copyPage: e.value })}
                                TextFieldProps={{
                                    label: <>No. of Copy<RequiredIcon /></>,
                                    variant:'outlined'
                                 }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                isDisabled={isSelected}
                            />
                        </Grid>
                    </Grid>

                    <Grid item container xs={12} style={{ marginBottom: 15 }}>
                        <AttnGroup
                            id={this.props.id + '_attnGroup'}
                            attnGroup={newLetterInfo.attnGroup}
                            onChange={(value) => this.updateLeaveInfo(value, 'attnGroup')}
                            hospitalList={this.props.hospitalList}
                            groupList={this.props.groupList}
                            isSelected={isSelected}
                        />
                    </Grid>
                    <Grid item container xs={12} style={{ marginBottom: 15 }}>
                        <CIMSFormLabel
                            labelText={<>Your Ref.</>}
                            className={classes.formLabelroot}
                        >
                            <Grid item container xs={12} style={{ justifyContent: 'center', padding: 8 }}>
                                <Grid item container spacing={2} xs={5}>
                                    <FastTextFieldValidator
                                        rows="1"
                                        id={this.props.id + '_yourRef1'}
                                        value={newLetterInfo.yourRef1}
                                        disabled={isSelected}
                                        inputProps={{ maxLength: 50 }}
                                        calActualLength
                                        onBlur={e => this.updateLeaveInfo(e.target.value, 'yourRef1')}
                                        variant={'outlined'}
                                    />
                                </Grid>
                                <Grid item container spacing={2} xs={1} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    in
                        </Grid>
                                <Grid item container spacing={2} xs={5}>
                                    <FastTextFieldValidator
                                        rows="1"
                                        id={this.props.id + '_yourRef2'}
                                        value={newLetterInfo.yourRef2}
                                        disabled={isSelected}
                                        inputProps={{ maxLength: 50 }}
                                        calActualLength
                                        onBlur={e => this.updateLeaveInfo(e.target.value, 'yourRef2')}
                                        variant={'outlined'}
                                    />
                                </Grid>
                            </Grid>
                        </CIMSFormLabel>
                    </Grid>
                    <Grid item container xs={12} style={{ marginBottom: 15 }}>
                        <FastTextFieldValidator
                            label={<>Subject<RequiredIcon /></>}
                            id={this.props.id + '_subject'}
                            value={newLetterInfo.subject}
                            disabled={isSelected}
                            inputProps={{ maxLength: 150 }}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            calActualLength
                            onBlur={e => this.updateLeaveInfo(e.target.value, 'subject')}
                            variant={'outlined'}
                        />
                    </Grid>
                    <Grid item container xs={12}>
                        <FastTextFieldValidator
                            rows="15"
                            multiline
                            trim="none"
                            label={<>Content<RequiredIcon /></>}
                            id={this.props.id + '_content'}
                            value={newLetterInfo.content}
                            disabled={isSelected}
                            inputProps={{ maxLength: 4000 }}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            calActualLength
                            onBlur={e => this.updateLeaveInfo(e.target.value, 'content')}
                            variant={'outlined'}
                        />
                    </Grid>

                </Grid>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        newLetterInfo: state.generalLetter.newLetterInfo,
        groupList: state.common.group,
        hospitalList: state.common.hospital
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GeneralLetterForm));
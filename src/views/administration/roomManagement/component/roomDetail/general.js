import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import { withStyles } from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import PhoneNumberField from '../phoneNumber';
import { PAGE_STATUS } from '../../../../../enums/administration/roomManagement/roomManagementEnum';
import { updateState } from '../../../../../store/actions/administration/roomManagement/roomManagementActions';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import DatePicker from '../../../../../components/FormValidator/DateFieldValidator';
import { isClinicalAdminSetting } from '../../../../../utilities/userUtilities';

const styles = () => ({
    form: {
        width: '100%'
    },
    formContainer: {
        width: '80%',
        paddingTop: 10
    },
    error: {
        color: 'red',
        fontSize: '0.75rem',
        marginLeft: 10
    },
    disabledTextFieldRoot: {
        backgroundColor: Colors.grey[200]
    },
    disabledTextFieldInput: {
        color: 'rgba(0, 0, 0, 0.54)'
    },
    disableTextFieldLabel: {
        '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
            // fontSize: '12px',
            // color:'#585858',
            // transform: 'translate(14px, -6px) scale(1)',
            backgroundColor: Colors.grey[200]
        }
    }
});

class General extends React.Component {
    handleChange = (name, value) => {
        let generalData = _.cloneDeep(this.props.roomGeneralData);
        generalData.changingInfo[name] = value;
        if (name === 'siteId') {
            let selSite = this.props.clinicList.find(item => item.siteId === value);
            if (selSite) {
                generalData.changingInfo.siteEngName = selSite.siteEngName;
            }
        }
        this.props.updateState({ roomGeneralData: generalData });
    }

    render() {
        const { id, classes, roomGeneralData, pageStatus, isClinicalAdmin, clinicList, assignedList } = this.props;
        const editMode = pageStatus === PAGE_STATUS.EDITING;
        const addMode = pageStatus === PAGE_STATUS.ADDING;
        const { changingInfo } = roomGeneralData;
        return (
            <Grid container>
                <Grid container justify={'center'}>
                    <Grid container spacing={3} className={classes.formContainer} direction={'row'}>
                        <Grid container item>
                            <Grid item xs={6}>
                                <SelectFieldValidator
                                    id={`${id}_site_english_name`}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Site English Name{editMode || isClinicalAdminSetting() ? null : <RequiredIcon />}</>,
                                        className: clsx({
                                            [classes.disabledTextFieldRoot]: editMode || isClinicalAdminSetting(),
                                            [classes.disabledTextFieldInput]: editMode || isClinicalAdminSetting()
                                        })
                                    }}
                                    value={changingInfo.siteId}
                                    isDisabled={editMode || isClinicalAdminSetting() || assignedList.length > 0}
                                    options={clinicList}
                                    onChange={(e) => { this.handleChange('siteId', e.value); }}
                                    validators={addMode ? [ValidatorEnum.required] : []}
                                    errorMessages={addMode ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                    validByBlur
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        <Grid container item>
                            <Grid item container xs={3}>
                                <FastTextFieldValidator
                                    id={`${id}_room_code`}
                                    label={<>Room Code{editMode ? null : <RequiredIcon />}</>}
                                    variant={'outlined'}
                                    value={changingInfo.rmCd}
                                    className={clsx({
                                        [classes.disabledTextFieldRoot]: editMode,
                                        [classes.disabledTextFieldInput]: editMode
                                    })}
                                    disabled={editMode}
                                    onBlur={(e) => { this.handleChange('rmCd', e.target.value); }}
                                    validators={addMode ? [ValidatorEnum.required] : []}
                                    errorMessages={addMode ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                    inputProps={{ maxLength: 10 }}
                                    validByBlur
                                    absoluteMessage
                                    calActualLength
                                />
                            </Grid>
                        </Grid>
                        <Grid container item>
                            <Grid item container xs={12}>
                                <FastTextFieldValidator
                                    id={`${id}_room_description`}
                                    variant={'outlined'}
                                    label={<>Room Description{editMode ? null : <RequiredIcon />}</>}
                                    value={changingInfo.rmDesc}
                                    className={clsx({
                                        [classes.disabledTextFieldRoot]: editMode,
                                        [classes.disabledTextFieldInput]: editMode
                                    })}
                                    disabled={editMode}
                                    onBlur={(e) => { this.handleChange('rmDesc', e.target.value); }}
                                    validators={addMode ? [ValidatorEnum.required] : []}
                                    errorMessages={addMode ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                    inputProps={{ maxLength: 100 }}
                                    validByBlur
                                    absoluteMessage
                                    calActualLength
                                />
                            </Grid>
                        </Grid>
                        <Grid container item>
                            <Grid item container xs={4}>
                                <PhoneNumberField
                                    id={`${id}`}
                                    phn={changingInfo.phn}
                                    phnExt={changingInfo.phnExt}
                                    updatePhone={this.handleChange}
                                />
                            </Grid>
                        </Grid>
                        <Grid container item>
                            <Grid item container xs={9}>
                                <FastTextFieldValidator
                                    id={`${id}_remark`}
                                    variant={'outlined'}
                                    label={'Remarks'}
                                    value={changingInfo.remark}
                                    onBlur={(e) => { this.handleChange('remark', e.target.value); }}
                                    inputProps={{ maxLength: 500 }}
                                    calActualLength
                                    multiline
                                    rows="8"
                                />
                            </Grid>
                        </Grid>
                        <Grid container item spacing={3}>
                            <Grid item container xs={3}>
                                <DatePicker
                                    id={`${id}_effStartDtm`}
                                    inputVariant="outlined"
                                    isRequired
                                    clearable
                                    absoluteMessage
                                    disabled={editMode}
                                    disablePast={addMode}
                                    label={<>Effective Start Date{editMode?null:<RequiredIcon />}</>}
                                    value={changingInfo.efftDate}
                                    onChange={e => this.handleChange('efftDate', e)}
                                    InputProps={{
                                        className: clsx({
                                            [classes.disabledTextFieldRoot]: editMode
                                        })
                                        // className: notice.isNew !== 1 ? classes.disabledTextFieldRoot : null
                                    }}
                                />
                            </Grid>
                            <Grid item container xs={3}>
                                <DatePicker
                                    id={`${id}_effEndDtm`}
                                    inputVariant="outlined"
                                    clearable
                                    absoluteMessage
                                    // disabled={editMode}
                                    disablePast={addMode}
                                    shouldDisableDate={(date) => {
                                        if (addMode || editMode) {
                                            if (moment(changingInfo.efftDate).isValid()) {
                                                return moment(date).isBefore(moment(changingInfo.efftDate), 'days');
                                            } else {
                                                return false;
                                            }
                                        }
                                    }}
                                    shouldDisableDateMessage={CommonMessage.VALIDATION_NOTE_DATE_NOT_EARLIER('Effective End Date', 'Effective Start Date')}
                                    label={<>Effective End Date</>}
                                    value={changingInfo.expyDate}
                                    onChange={e => this.handleChange('expyDate', e)}
                                />
                            </Grid>
                            <Grid item container xs={3}>
                                <FormControlLabel
                                    className={classes.formControlLabel}
                                    control={
                                        <Checkbox
                                            id={`${id}_status`}
                                            checked={changingInfo.status === 'A'}
                                            onChange={(e) => { this.handleChange('status', e.target.checked ? 'A' : 'I'); }}
                                            color="primary"
                                        />
                                    }
                                    label={'Is Active'}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        );
    }
}

const mapState = (state) => {
    return {
        roomGeneralData: state.roomManagement.roomGeneralData,
        pageStatus: state.roomManagement.pageStatus,
        assignedList: state.roomManagement.assignedList
    };
};

const dispatch = {
    updateState
};

export default connect(mapState, dispatch)(withStyles(styles)(General));
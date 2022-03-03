import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import RadioFieldValidator from '../../../components/FormValidator/RadioFieldValidator';
import CIMSFormLabel from '../../../components/InputLabel/CIMSFormLabel';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import {
    Grid
} from '@material-ui/core';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import { CommonUtil } from '../../../utilities';
import _ from 'lodash';
import { ACTION_ENUM, RECURRENCE_TABS, MULTIPLE_UPDATE_TYPE } from '../../../constants/appointment/editTimeSlot';

const ActionRender = React.forwardRef((props, refs) => {
    const {
        id,
        classes,
        multipleUpdateData,
        updateData,
        quotaConfig,
        type,
        unavailableReasons
    } = props;
    const {
        action,
        overallQt,
        unavailableReasonForAction,
        unavailableRemark
    } = multipleUpdateData;

    const quotaList = CommonUtil.quotaConfig(quotaConfig);
    const handleOnChange = (name, value) => {
        let obj = {[name]: value};
        if(name === 'action' && (value === ACTION_ENUM.UPDATE || value === ACTION_ENUM.DELETE)) {
            obj = {
                ...obj,
                multiUpTab: RECURRENCE_TABS.DAILY,
                weekDay: '0000000',
                monthRule: null,
                monthRepeatOn: null,
                monthOrdinal: null,
                monthWkDay: null,
                repeatEvery: 1,
                remark: null,
                duration: null,
                session: null,
                unavailableReasonForAction: null,
                unavailableRemark: null
            };
        }
        updateData(obj);
    };

    const actionList = React.useMemo(() => {
        if (type === MULTIPLE_UPDATE_TYPE.TimeSlotManagement) {
            return [
                { label: 'Insert / Update', value: ACTION_ENUM.INSERT_UPDATE },
                { label: 'Insert', value: ACTION_ENUM.INSERT },
                { label: 'Update', value: ACTION_ENUM.UPDATE },
                { label: 'Delete', value: ACTION_ENUM.DELETE }
            ];
        } else if(type === MULTIPLE_UPDATE_TYPE.UnavailablePeriod) {
            return [
                { label: 'Update', value: ACTION_ENUM.UPDATE },
                { label: 'Delete', value: ACTION_ENUM.DELETE }
            ];
        } else {
            return [];
        }
    }, [type]);
    return (
        <Grid container className={classes.root}>
            <CIMSFormLabel
                labelText={<>Action</>}
                className={classes.formLabel}
            >
                <Grid container spacing={1} alignItems="flex-start">
                    <Grid item xs={10}>
                        <RadioFieldValidator
                            id={`${id}_actionRadio`}
                            value={action}
                            onChange={e => handleOnChange('action', e.target.value)}
                            list={actionList}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            FormControlLabelProps={{
                                className: classes.actionControlLabel
                            }}
                        />
                    </Grid>
                    <Grid item container xs={2}></Grid>
                    {
                        type === MULTIPLE_UPDATE_TYPE.TimeSlotManagement ?
                            <>
                                <Grid item xs={2}>
                                    <FastTextFieldValidator
                                        id={`${id}_overallQt`}
                                        label={<>Overall Quota</>}
                                        variant="outlined"
                                        type="number"
                                        inputProps={{ maxLength: 4 }}
                                        disabled={action === ACTION_ENUM.DELETE}
                                        value={overallQt}
                                        onBlur={e => handleOnChange('overallQt', e.target.value)}
                                        validators={[ValidatorEnum.isPositiveInteger]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                    />
                                </Grid>
                                <Grid item xs={10}></Grid>
                                {
                                    quotaList.map((item, index) => {
                                        return (
                                            <Grid key={id + '_quota' + index} item xs={2}>
                                                <FastTextFieldValidator
                                                    id={id + _.toUpper(action) + '_quota' + index}
                                                    name={_.toLower(item.code)}
                                                    label={<Grid style={{ maxWidth: '11vw', textOverflow: 'ellipsis', overflow: 'hidden' }}>{quotaConfig[0][_.toLower(item.code) + 'Name']}</Grid>}
                                                    variant="outlined"
                                                    type="number"
                                                    disabled={action === ACTION_ENUM.DELETE}
                                                    inputProps={{ maxLength: 4 }}
                                                    value={multipleUpdateData[_.toLower(item.code)]}
                                                    onBlur={e => handleOnChange(_.toLower(item.code), e.target.value)}
                                                    validators={[ValidatorEnum.isPositiveInteger]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                />
                                            </Grid>
                                        );
                                    })
                                }
                            </>
                            : null
                    }
                    {
                        type === MULTIPLE_UPDATE_TYPE.UnavailablePeriod ?
                        <>
                                <Grid item xs={4}>
                                    <SelectFieldValidator
                                        id={`${id}_unavailableReasonForAction`}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Unavailable Reason{unavailableRemark ? null : <RequiredIcon />}</>
                                        }}
                                        options={unavailableReasons && unavailableReasons.map((item) => ({ value: item.unavailPerdRsnId, label: item.rsnDesc }))}
                                        value={unavailableReasonForAction}
                                        sortBy="label"
                                        onChange={e => handleOnChange('unavailableReasonForAction', e.value)}
                                        isDisabled={action === ACTION_ENUM.DELETE}
                                        validators={unavailableRemark ? [] : [ValidatorEnum.required]}
                                        errorMessages={unavailableRemark ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    />
                                </Grid>
                                <Grid item xs={8}></Grid>
                                <Grid item xs={4}>
                                    <FastTextFieldValidator
                                        id={`${id}_unavailableRemark`}
                                        label={<>Remark{unavailableReasonForAction ? null : <RequiredIcon />}</>}
                                        variant="outlined"
                                        calActualLength
                                        inputProps={{ maxLength: 500 }}
                                        value={unavailableRemark}
                                        onBlur={e => handleOnChange('unavailableRemark', e.target.value)}
                                        disabled={action === ACTION_ENUM.DELETE}
                                        validators={unavailableReasonForAction ? [] : [ValidatorEnum.required]}
                                        errorMessages={unavailableReasonForAction ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    />
                                </Grid>
                                <Grid item xs={8}></Grid>
                        </>
                        : null
                    }
                </Grid>
            </CIMSFormLabel>
        </Grid>
    );
});

const styles = theme => ({
    root: {
        marginTop: theme.spacing(2)
    },
    formLabel: {
        padding: theme.spacing(2),
        width: '100%'
    },
    actionControlLabel: {
        minWidth: '11vw'
    }
});
const mapState = state => ({
    quotaConfig: state.common.quotaConfig,
    unavailableReasons: state.unavailablePeriodManagement.unavailableReasons
});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(withStyles(styles)(ActionRender));
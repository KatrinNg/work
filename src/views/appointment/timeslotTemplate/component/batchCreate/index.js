import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import Dialog from '../../../../../components/Dialog/CIMSPromptDialog';
import Grid from '@material-ui/core/Grid';
import TimePicker from '../../../../../components/FormValidator/TimeFieldValidator';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import { updateState, batchCreate } from '../../../../../store/actions/appointment/timeslotTemplate';
import Enum from '../../../../../enums/enum';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import { initBatchCreate } from '../../../../../constants/appointment/timeslotTemplate/timeslotTemplateConstants';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import { auditAction } from '../../../../../store/actions/als/logAction';

const fm = Enum.TIME_FORMAT_24_HOUR_CLOCK;

const BatchCreate = React.forwardRef((props, ref) => {

    const { batchCreateDialog = {}, onSubmit, quotaConfig } = props;

    React.useEffect(() => {
        props.updateState({
            batchCreateDialog: _.cloneDeep(initBatchCreate)
        });
    }, []);

    const onChange = (obj) => {
        props.updateState({
            batchCreateDialog: {
                ...batchCreateDialog,
                ...obj
            }
        });
    };

    const onAcceptTime = (value, name) => {
        let stime = moment(batchCreateDialog.startTime, fm);
        let etime = moment(batchCreateDialog.endTime, fm);
        if (name === 'startTime') {
            stime = value;
        } else if (name === 'endTime') {
            etime = value;
        }
        if (stime && etime && stime.isValid() && etime.isValid()) {
            if (name === 'startTime' && stime.isAfter(etime)) {
                onChange({ endTime: null });
            }
            if (name === 'endTime' && etime.isBefore(stime)) {
                onChange({ startTime: null });
            }
        }
    };

    const quotaNames = CommonUtil.getQuotaConfigName(CommonUtil.getAvailableQuotaConfig(quotaConfig));

    const sametimeValid = (value, name) => {
        if (name === 'startTime') {
            return !CommonUtil.isSameTime(moment(value), moment(batchCreateDialog.endTime, fm));
        } else {
            return !CommonUtil.isSameTime(moment(batchCreateDialog.startTime, fm), moment(value));
        }
    };
    return (
        <Dialog
            open
            id="timeslot_template_batchCreate_dialog"
            FormControlProps={{
                style: {
                    width: '66vw'
                }
            }}
            DialogContentProps={{
                style: {
                    padding: 24
                }
            }}
            dialogTitle="Batch Create"
            draggable
            dialogContentText={
                <Grid container spacing={4}>
                    <Grid item container xs={3}>
                        <TimePicker
                            id="timeslot_template_batchCreate_startTime"
                            value={batchCreateDialog.startTime ? moment(batchCreateDialog.startTime, fm) : null}
                            onChange={e => {
                                onChange({ startTime: e ? moment(e).format(fm) : null });
                            }}
                            onBlur={e => onAcceptTime(e, 'startTime')}
                            onAccept={e => onAcceptTime(e, 'startTime')}
                            label={<>Start Time<RequiredIcon /></>}
                            isRequired
                            validators={[(value) => sametimeValid(value, 'startTime')]}
                            errorMessages={[CommonMessage.START_TIME_EARLIER()]}
                        />
                    </Grid>
                    <Grid item container xs={3}>
                        <TimePicker
                            id="timeslot_template_batchCreate_endTime"
                            value={batchCreateDialog.endTime ? moment(batchCreateDialog.endTime, fm) : null}
                            onChange={e => {
                                onChange({ endTime: e ? moment(e).format(fm) : null });
                            }}
                            onBlur={e => onAcceptTime(e, 'endTime')}
                            onAccept={e => onAcceptTime(e, 'endTime')}
                            label={<>End Time<RequiredIcon /></>}
                            isRequired
                            validators={[(value) => sametimeValid(value, 'endTime')]}
                            errorMessages={[CommonMessage.START_TIME_EARLIER()]}
                        />
                    </Grid>
                    <Grid item container xs={3}>
                        <FastTextFieldValidator
                            id={'timeslot_template_batchCreate_length'}
                            value={batchCreateDialog.timeLen}
                            onBlur={e => onChange({ timeLen: e.target.value })}
                            variant="outlined"
                            inputProps={{ maxLength: 3 }}
                            type="number"
                            label={<>Length(Minute)<RequiredIcon /></>}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        />
                    </Grid>
                    <Grid item container xs={3}>
                        <FastTextFieldValidator
                            id={'timeslot_template_batchCreate_overAllQuota'}
                            value={batchCreateDialog.overallQt}
                            onBlur={e => onChange({ overallQt: e.target.value })}
                            variant="outlined"
                            inputProps={{ maxLength: 4 }}
                            type="number"
                            label={<>Overall Quota</>}
                        />
                    </Grid>
                    {
                        quotaNames.map(item => (
                            <Grid item container xs={3} key={item.field}>
                                <FastTextFieldValidator
                                    id={`timeslot_template_batchCreate_qt${item.field}`}
                                    value={batchCreateDialog[_.toLower(item.field)]}
                                    onBlur={e => onChange({ [_.toLower(item.field)]: e.target.value })}
                                    label={item.name}
                                    inputProps={{ maxLength: 4 }}
                                    type="number"
                                />
                            </Grid>
                        ))
                    }
                </Grid>
            }
            buttonConfig={[
                {
                    id: 'timeslot_template_batchCreate_saveBtn',
                    name: 'Save',
                    onClick: () => {
                        const validCase = onSubmit();
                        validCase.then(result => {
                            if (result) {
                                props.auditAction('Batch Create', null, null, false, 'ana');
                                props.batchCreate();
                            }
                        });
                    }
                },
                {
                    id: 'timeslot_template_batchCreate_cancelBtn',
                    name: 'Cancel',
                    onClick: () => {
                        props.auditAction('Cancel Batch Create', null, null, false, 'ana');
                        props.updateState({ isOpenBatchCreate: false });
                    }
                }
            ]}
        />
    );
});

const mapState = state => ({
    batchCreateDialog: state.timeslotTemplate.batchCreateDialog,
    quotaConfig: state.common.quotaConfig
});

const mapDispatch = {
    updateState,
    batchCreate,
    auditAction
};

export default connect(mapState, mapDispatch)(BatchCreate);
import React from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import memoize from 'memoize-one';
import { Grid, Checkbox, Typography } from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import TimeFieldValidator from '../../../../components/FormValidator/TimeFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import CommonMessage from '../../../../constants/commonMessage';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CheckBoxAndDatePicker from './checkBoxAndDatePicker';
import UploadFile from '../component/uploadFile';
import { Dialog_Mode } from '../../../../enums/administration/noticeBoard';
import Enum from '../../../../enums/enum';
import { dtmIsDirty } from '../../../../utilities/noticeBoardUtilities';

const styles = () => ({
    disabledTextFieldRoot: {
        backgroundColor: Colors.grey[200]
    },
    disabledTextFieldInput: {
        color: 'rgba(0, 0, 0, 0.54)',
        readOnly: true
    },
    errMsg: {
        color: '#fd0000',
        padding: '2px 14px',
        fontSize: 12
        // position: 'absolute'
    }
});


class CreateUpdateNoticeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openUploadFileFlag: false
        };
    }

    loadAvailSvcList = memoize((svcList) => {
        let availList = svcList.filter(item => item.cims2Svc === 1);
        availList.sort((a, b) => {
            return a.svcName.localeCompare(b.svcName);
        });
        availList.unshift({ svcCd: 'all', svcName: 'All Services' });
        return availList;
    })

    handleNoticeOnChange = (value, name) => {
        const { notice, noticeBk, dialogMode } = this.props;
        let _notice = _.cloneDeep(notice);
        let pastEfftDate = this.props.pastEfftDate;
        let pastExpyDate = this.props.pastExpyDate;
        let efftDateSameOrGreater = this.props.efftDateSameOrGreater;
        let expyDateSameOrEarly = this.props.expyDateSameOrEarly;
        if (name === 'efftDate' || name === 'efftTime') {
            if (name === 'efftDate' && !_notice.efftTime) {
                _notice.efftTime = value && value.isValid() ? moment(value).startOf('day') : null;
            }
            this.iconGpRef.validateDateField();
        }
        if (name === 'expyDate' || name === 'expyTime') {
            if (name === 'expyDate' && !_notice.expyTime) {
                _notice.expyTime = value && value.isValid() ? moment(value).startOf('day') : null;
            }
        }
        if (name === 'isNew') {
            if (value !== 1) {
                if (_notice.newExpyDate) {
                    _notice.newExpyDate = null;
                }
            }
        }
        if (name === 'isUrg') {
            if (value !== 1) {
                if (_notice.urgExpyDate) {
                    _notice.urgExpyDate = null;
                }
            }
        }
        if (name === 'isImprtnt') {
            if (value !== 1) {
                if (_notice.imprtntExpyDate) {
                    _notice.imprtntExpyDate = null;
                }
            }
        }
        _notice[name] = value;
        const createMode = dialogMode === Dialog_Mode.CREATE;
        const efftDateIsDirty = dtmIsDirty(_notice.efftDate, noticeBk.efftDate);
        const efftTimeIsDirty = dtmIsDirty(_notice.efftTime, noticeBk.efftTime, Enum.TIME_FORMAT_24_HOUR_CLOCK);
        const expyDateIsDirty = dtmIsDirty(_notice.expyDate, noticeBk.expyDate);
        const expyTimeIsDirty = dtmIsDirty(_notice.expyTime, noticeBk.expyTime, Enum.TIME_FORMAT_24_HOUR_CLOCK);
        const current = moment().format(Enum.DATE_FORMAT_EDMY_VALUE);
        const efftDate = _notice.efftDate;
        const efftTime = _notice.efftTime;
        const expyDate = _notice.expyDate;
        const expyTime = _notice.expyTime;
        const efftDateStr = moment(efftDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
        const efftTimeStr = moment(efftTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
        const expyDateStr = moment(expyDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
        const expyTimeStr = moment(expyTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
        if (name === 'efftDate' || name === 'efftTime') {
            if (createMode || efftDateIsDirty || efftTimeIsDirty) {
                if (moment(_notice.efftDate).isValid() && moment(_notice.efftTime).isValid() && efftDate.isBefore(moment(current), 'day')) {
                    pastEfftDate = true;
                } else {
                    pastEfftDate = false;
                }
                if (efftDate && efftTime && expyDate && expyTime && efftDate.isValid() && efftTime.isValid() && expyDate.isValid() && expyTime.isValid()) {
                    if (moment(`${efftDateStr} ${efftTimeStr}`).isSameOrAfter(moment(`${expyDateStr} ${expyTimeStr}`), 'minute')) {
                        efftDateSameOrGreater = true;
                        expyDateSameOrEarly = false;
                    } else {
                        efftDateSameOrGreater = false;
                        expyDateSameOrEarly = false;
                    }
                } else {
                    efftDateSameOrGreater = false;
                    expyDateSameOrEarly = false;
                }
            }
        }
        if (name === 'expyDate' || name === 'expyTime') {
            if (createMode || expyDateIsDirty || expyTimeIsDirty) {
                if (moment(_notice.expyDate).isValid() && moment(_notice.expyTime).isValid() && moment(_notice.expyDate).isBefore(current, 'day')) {
                    pastExpyDate = true;
                }
                else {
                    pastExpyDate = false;
                }

                if (efftDate && efftTime && expyDate && expyTime && efftDate.isValid() && efftTime.isValid() && expyDate.isValid() && expyTime.isValid()) {
                    if (moment(`${efftDateStr} ${efftTimeStr}`).isSameOrAfter(moment(`${expyDateStr} ${expyTimeStr}`), 'minute')) {
                        efftDateSameOrGreater = false;
                        expyDateSameOrEarly = true;
                    } else {
                        efftDateSameOrGreater = false;
                        expyDateSameOrEarly = false;
                    }
                } else {
                    efftDateSameOrGreater = false;
                    expyDateSameOrEarly = false;
                }
            }
        }
        if (!createMode && !efftDateIsDirty && !efftTimeIsDirty && !expyDateIsDirty && !expyTimeIsDirty) {
            pastEfftDate = false;
            pastExpyDate = false;
            efftDateSameOrGreater = false;
            expyDateSameOrEarly = false;
        }

        this.props.updateField({
            curSelNotice: _notice,
            pastEfftDate,
            pastExpyDate,
            efftDateSameOrGreater,
            expyDateSameOrEarly
        });
    }

    handleCloseUploadDialog = () => {
        this.setState({ openUploadFileFlag: false });
    }


    render() {
        const { notice, serviceList, file, dialogMode, noticeBk, classes, pastEfftDate, pastExpyDate, efftDateSameOrGreater, expyDateSameOrEarly } = this.props;
        const svcList = this.loadAvailSvcList(serviceList);
        const opts = [
            { value: '1', label: 'Enable' },
            { value: '0', label: 'Disable' }
        ];
        const isDirty = !_.isEqual(notice, noticeBk);
        const requiredChecking = dialogMode === Dialog_Mode.CREATE ? true : isDirty;
        const createMode = dialogMode === Dialog_Mode.CREATE;
        return (
            <Grid>
                <Grid container style={{ paddingBottom: 16 }} item xs={12}>
                    <Grid item xs={6} style={{ paddingRight: 4 }}>
                        <CIMSFormLabel
                            labelText={<>Issuance Period (From)<RequiredIcon /></>}
                            style={{ padding: 16 }}
                            error={pastEfftDate || efftDateSameOrGreater}
                        >
                            <Grid container wrap="nowrap" spacing={1}>
                                <Grid item xs={7}>
                                    <DateFieldValidator
                                        id={'dateFrom_Iss_Period_Date'}
                                        value={notice.efftDate}
                                        inputVariant={'outlined'}
                                        placeholder={''}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        onChange={(e) => this.handleNoticeOnChange(e, 'efftDate')}
                                        shouldDisableDate={(date) => { return moment(date).isBefore(moment(), 'days'); }}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TimeFieldValidator
                                        id={'dateFrom_Iss_Period_Time'}
                                        value={notice.efftTime}
                                        inputVariant={'outlined'}
                                        placeholder={''}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        onChange={(e) => this.handleNoticeOnChange(e, 'efftTime')}
                                        absoluteMessage
                                    />
                                </Grid>
                            </Grid>
                        </CIMSFormLabel>
                        {pastEfftDate ?
                            <Grid item container id={'dateFrom_Iss_Period_Date_Time_Error_Message'} >
                                <Typography className={classes.errMsg}>
                                    {'Issuance Period (From) must be later or equal to Today\'s Date/Time'}
                                </Typography>
                            </Grid>
                            : efftDateSameOrGreater ?
                                <Grid item container id={'dateFrom_Iss_Period_Date_Time_Error_Message'}>
                                    <Typography className={classes.errMsg}>
                                        {'Issuance Period (From) should not be later or equal to Issuance Period (To)'}
                                    </Typography>
                                </Grid>
                                : null
                        }
                    </Grid>
                    <Grid item xs={6} style={{ paddingLeft: 4 }}>
                        <CIMSFormLabel
                            labelText={<>Issuance Period (To)</>}
                            style={{ padding: 16 }}
                            error={pastExpyDate || expyDateSameOrEarly}
                        >
                            <Grid container wrap="nowrap" spacing={1}>
                                <Grid item xs={7}>
                                    <DateFieldValidator
                                        id={'dateTo_Iss_Period_Date'}
                                        inputVariant={'outlined'}
                                        placeholder={''}
                                        value={notice.expyDate}
                                        onChange={(e) => this.handleNoticeOnChange(e, 'expyDate')}
                                        shouldDisableDate={(date) => { return moment(date).isBefore(moment(), 'days'); }}
                                        validators={moment(notice.expyTime).isValid() ? [ValidatorEnum.required] : []}
                                        errorMessages={moment(notice.expyTime).isValid() ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TimeFieldValidator
                                        id={'dateTo_Iss_Period_Time'}
                                        inputVariant={'outlined'}
                                        placeholder={''}
                                        validators={moment(notice.expyDate).isValid() ? [ValidatorEnum.required] : []}
                                        errorMessages={moment(notice.expyDate).isValid() ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                        value={notice.expyTime}
                                        onChange={(e) => this.handleNoticeOnChange(e, 'expyTime')}
                                        absoluteMessage
                                    />
                                </Grid>

                            </Grid>
                        </CIMSFormLabel>
                        {
                            pastExpyDate ?
                                <Grid item container id={'dateTo_Iss_Period_Date_Time_Error_Message'}>
                                    <Typography className={classes.errMsg}>
                                        {'Issuance Period (To) must be later or equal to Today\'s Date/Time'}
                                    </Typography>
                                </Grid>
                                : expyDateSameOrEarly ?
                                    <Grid item container id={'dateTo_Iss_Period_Date_Time_Error_Message'}>
                                        <Typography className={classes.errMsg}>
                                            {'Issuance Period (To) should not be earlier or equal to Issuance Period (From)'}
                                        </Typography>
                                    </Grid>
                                    : null
                        }
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <SelectFieldValidator
                            id="sltservice"
                            style={{ width: '100%' }}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Service<RequiredIcon /></>
                            }}
                            value={notice.svcCd}
                            options={svcList.map(item => (
                                { value: item.svcCd, label: item.svcName }
                            ))}
                            validators={[
                                ValidatorEnum.required
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_REQUIRED()
                            ]}
                            onChange={(e) => this.handleNoticeOnChange(e.value, 'svcCd')}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <FastTextFieldValidator
                            id="Recipient"
                            name="Recipient"
                            value={notice.recipient}
                            label={<>Recipient<RequiredIcon /></>}
                            variant="outlined"
                            validators={[
                                ValidatorEnum.required
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_REQUIRED()
                            ]}
                            onBlur={(e) => this.handleNoticeOnChange(e.target.value, 'recipient')}
                            inputProps={{ maxLength: 100 }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <FastTextFieldValidator
                            id="NoticeContent"
                            name="Notice Content"
                            value={notice.content}
                            label={<>Notice Content<RequiredIcon /></>}
                            variant="outlined"
                            multiline
                            rows={6}
                            validators={[
                                ValidatorEnum.required
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_REQUIRED()
                            ]}
                            onBlur={(e) => this.handleNoticeOnChange(e.target.value, 'content')}
                            inputProps={{ maxLength: 4000 }}
                            calActualLength
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <CIMSFormLabel
                            labelText="Icon"
                            style={{
                                paddingTop: 15,
                                paddingBottom: 15
                            }}
                        >
                            <CheckBoxAndDatePicker
                                ref={ref => this.iconGpRef = ref}
                                notice={notice}
                                noticeBk={noticeBk}
                                requiredChecking={requiredChecking}
                                createMode={createMode}
                                handleNoticeOnChange={this.handleNoticeOnChange}
                            />
                        </CIMSFormLabel>
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item xs={3}>
                        <FormControlLabel
                            checked={notice.isAlwaysOnTop === 1}
                            onChange={(e) => this.handleNoticeOnChange(e.target.checked ? 1 : 0, 'isAlwaysOnTop')}
                            control={<Checkbox
                                name="AlwaysOnTop"
                                color="primary"
                                     />}
                            label="Always on Top"
                            labelPlacement="end"
                        />
                    </Grid>
                    <Grid item xs={9}>
                        <SelectFieldValidator
                            id="sltEn_Dis_able"
                            style={{ width: '25%' }}
                            TextFieldProps={{
                                variant: 'outlined',
                                // disabled: true,
                                label: <>Enable/Disable<RequiredIcon /></>
                            }}
                            options={opts.map(item => ({ value: item.value, label: item.label }))}
                            // defaultValue={'0'}
                            value={notice.isEnable}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onChange={(e) => this.handleNoticeOnChange(e.value, 'isEnable')}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <CIMSButton
                            id="btnUploadFile"
                            color="primary"
                            style={{ marginLeft: '0' }}
                            onClick={() => {
                                this.props.auditAction('Click Upload Button',null,null,false,'cmn');
                                this.setState({ openUploadFileFlag: true });
                            }}
                        >
                            Upload File
                        </ CIMSButton>
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Typography>
                            {file ? file.name : notice.docName || ''}
                        </Typography>
                    </Grid>
                </Grid>
                <UploadFile
                    file={file}
                    openUploadFileFlag={this.state.openUploadFileFlag}
                    handleCloseUploadDialog={this.handleCloseUploadDialog}
                    uploadFile={this.props.uploadFile}
                    updateField={this.props.updateField}
                    auditAction={this.props.auditAction}
                />
            </Grid>
        );
    }
}


export default withStyles(styles)(CreateUpdateNoticeForm);
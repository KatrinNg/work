import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSDialog from '../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSInputLabel from '../../../components/InputLabel/CIMSInputLabel';
import CIMSFormLabel from '../../../components/InputLabel/CIMSFormLabel';
import {
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardHeader,
    CardContent,
    FormHelperText,
    FormGroup,
    FormControlLabel,
    //Checkbox,
    Radio
} from '@material-ui/core';
import TimeFieldValidator from '../../../components/FormValidator/TimeFieldValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import Enum from '../../../enums/enum';
import moment from 'moment';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import _ from 'lodash';
import {
    updateState,
    insertTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    multipleUpdate
} from '../../../store/actions/appointment/editTimeSlot/editTimeSlotAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CommonMessage from '../../../constants/commonMessage';
import CommonRegex from '../../../constants/commonRegex';
import ValidatorEnum from '../../../enums/validatorEnum';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
import NewOldQuotaPublic from '../../compontent/newOldQuotaPublic';
import { MessageUtil, EnctrAndRmUtil } from '../../../utilities';

const styles = theme => ({
    fieldMargin: {
        marginRight: '25px'
    },
    card: {
        width: '100%',
        marginTop: 8
    },
    cardHeaderRoot: {
        background: theme.palette.text.primary,
        padding: '8px'
    },
    cardHeaderTitle: {
        fontSize: theme.palette.textSize,
        color: theme.palette.background.default,
        fontWeight: 'bold'
    },
    buttonRoot: {
        minWidth: '150px'
    },
    multipleTipRoot: {
        color: theme.palette.primary.main
    },
    disableChangeTimeFromHelper: {
        paddingLeft: 5,
        color: theme.palette.primary.main
    },
    multipleUpdateForm: {
        width: 800,
        height: 550,
        paddingTop: 20
    },
    labelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    }
});

class EditTimeSlotDialog extends Component {

    state = {
        weekdayErrorMessage: '',
        weekday_sun: '0',
        weekday_mon: '0',
        weekday_tue: '0',
        weekday_wed: '0',
        weekday_thur: '0',
        weekday_fri: '0',
        weekday_sat: '0',
        multipleEditMode: 'exact',
        multipleDeleteSlot: false,
        multiple_dateFrom: moment(),
        multiple_dateTo: moment(),
        multiple_encounterCodeList: [],
        multiple_subEncounterCodeList: [],
        multiple_encounter: '',
        multiple_subEncounter: '',
        multiple_exactSlotTime: moment().set({ hour: 0, minute: 0, second: 0 }),
        slotDate: moment(),
        newStartTime: moment(),
        overallQuota: '',
        // newNormal: '',
        // newForce: '',
        // newPublic: '',
        // oldNormal: '',
        // oldForce: '',
        // oldPublic: '',
        multiple_fromTime: moment().set({ hour: 0, minute: 0, second: 0 }),
        multiple_toTime: moment().set({ hour: 23, minute: 59, second: 59 }),
        defaultQuotaDescValue: null
    }

    UNSAFE_componentWillMount() {
        const where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        // const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, this.props.clinicConfig, where);
        // const hardQuotaDesc = 'N:Normal|F:Force|P:Public|';
        // const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : hardQuotaDesc.split('|');
        // let newQuotaArr = CommonUtil.transformToMap(quotaArr);
        let newQuotaArr=this.props.loadQuotaType(where);
        // let newQuotaArr = this.loadQuotaType(where);
        this.setState({ defaultQuotaDescValue: newQuotaArr });
    }

    componentDidMount() {
        this.state.defaultQuotaDescValue.forEach((item) => {
            let params = {};
            params['new' + item.engDesc] = '';
            params['old' + item.engDesc] = '';
            this.setState({
                ...params
            });
        });

        if (_.toUpper(this.props.action) === 'EDIT' && this.props.selectedItems && this.props.selectedItems[0]) {
            const selected = this.props.selectedItems[0];
            this.state.defaultQuotaDescValue.forEach((item) => {
                let params = {};
                params['new' + item.engDesc] = selected['new' + item.engDesc];
                params['old' + item.engDesc] = selected['old' + item.engDesc];
                this.setState({
                    ...params
                });
            });
            this.setState({
                slotDate: moment(selected.slotDate),
                newStartTime: moment(selected.startTime, 'HH:mm'),
                overallQuota: selected.overallQuota
                // newNormal: selected.newNormal,
                // newForce: selected.newForce,
                // newPublic: selected.newPublic,
                // oldNormal: selected.oldNormal,
                // oldForce: selected.oldForce,
                // oldPublic: selected.oldPublic
            });
        } else if (_.toUpper(this.props.action) === 'MULTIPLE') {
            let {
                dateFrom,
                dateTo,
                encounterTypeCd,
                subEncounterTypeCd,
                encounterCodeList
            } = this.props;
            // if (moment(dateFrom).isBefore(moment())) {
            //     dateFrom = moment();
            // }
            // if (moment(dateTo).isBefore(moment())) {
            //     dateTo = moment();
            // }
            this.setState({
                newStartTime: null,
                multiple_dateFrom: dateFrom,
                multiple_dateTo: dateTo,
                multiple_encounter: encounterTypeCd,
                multiple_subEncounter: subEncounterTypeCd,
                multiple_encounterCodeList: _.cloneDeep(encounterCodeList),
                multiple_subEncounterCodeList: EnctrAndRmUtil.get_subEncounterTypeList_by_encounterTypeCd(encounterCodeList, encounterTypeCd)
            });
        } else if (_.toUpper(this.props.action) === 'ADD') {
            this.state.defaultQuotaDescValue.forEach((item) => {
                let params = {};
                params['new' + item.engDesc] = '0';
                params['old' + item.engDesc] = '0';
                this.setState({
                    ...params
                });
            });
            this.setState({
                overallQuota: '9999'
                // newNormal: '0',
                // newForce: '0',
                // newPublic: '0',
                // oldNormal: '0',
                // oldForce: '0',
                // oldPublic: '0'
            });
        }

        this.msg110211 = MessageUtil.getMessageDescriptionByMsgCode('110931');
        this.msg110223 = MessageUtil.getMessageDescriptionByMsgCode('110916');
        this.msg110287 = MessageUtil.getMessageDescriptionByMsgCode('110927');
    }

    handleClose = () => {
        this.props.updateState({ dialogOpen: false, dialogName: '' });
        this.props.clearSelect();
    }

    handleDateChange = (e, name) => {
        this.setState({ [name]: e });
    }

    handleTimeChange = (e, name) => {
        if (name === 'multiple_fromTime') {
            if (moment(e).isAfter(moment(this.state.multiple_toTime))) {
                this.setState({ multiple_toTime: e });
            }
        } else if (name === 'multiple_toTime') {
            if (moment(e).isBefore(moment(this.state.multiple_fromTime))) {
                this.setState({ multiple_fromTime: e });
            }
        }
        this.setState({ [name]: e });
    }

    handleTextChange = (e) => {
        const reg = new RegExp(CommonRegex.VALIDATION_REGEX_NOT_NUMBER);
        const name = e.target.name;
        let value = e.target.value;
        if (reg.test(value)) {
            return;
        }
        if (_.toUpper(this.props.action) === 'MULTIPLE' && name === 'overallQuota' && value && parseInt(value) === 0) {
            this.state.defaultQuotaDescValue.forEach((item) => {
                let params = {};
                params['new' + item.engDesc] = '';
                params['old' + item.engDesc] = '';
                this.setState({
                    ...params
                });
            });
            // this.setState({
            //     newNormal: '',
            //     newForce: '',
            //     newPublic: '',
            //     oldNormal: '',
            //     oldForce: '',
            //     oldPublic: ''
            // });
        }
        this.setState({ [name]: value });
    }

    handleSubmit = () => {
        this.refs.form.submit();
        // if (_.toUpper(this.props.action) === 'MULTIPLE') {
        //     this.validateWeekday();
        // }
    }

    handleSave = () => {
        const dialogStatus = _.toUpper(this.props.action);
        let updateParams = this.getUpdateParams();
        let searchParams = this.getSearchParams();
        if (dialogStatus === 'ADD') {
            const timeSlot = `${moment(this.state.slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE)} ${moment(this.state.newStartTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}`;
            if (moment(timeSlot).isBefore(moment())) {
                this.props.openCommonMessage({ msgCode: '110901' });
            } else {
                this.props.insertTimeSlot(updateParams, searchParams);
                this.handleClose();
            }
        } else if (dialogStatus === 'EDIT') {
            const selected = this.props.selectedItems[0];
            updateParams.slotId = selected.slotId;
            updateParams.version = selected.version;
            this.props.updateTimeSlot(updateParams, searchParams);
            this.handleClose();
        }
    }

    handleDelete = () => {
        const selected = this.props.selectedItems[0];
        let searchParams = this.getSearchParams();
        this.props.deleteTimeSlot({ slotId: selected.slotId }, searchParams);
        this.handleClose();
    }

    handleMultipleDateChange = (e, name) => {
        this.setState({ [name]: e });
        if (name === 'multiple_dateFrom' && moment(this.state.multiple_dateTo).isBefore(moment(e))) {
            this.setState({ 'multiple_dateTo': e });
        }
        if (name === 'multiple_dateTo' && moment(this.state.multiple_dateFrom).isAfter(moment(e))) {
            this.setState({ 'multiple_dateFrom': e });
        }
    }

    handleMultipleSelectChange = (value, name) => {
        this.setState({ [name]: value });
        if (name === 'multiple_encounter') {
            let subCodeList = EnctrAndRmUtil.get_subEncounterTypeList_by_encounterTypeCd(this.state.multiple_encounterCodeList, value);
            let subEncounter = subCodeList[0] ? subCodeList[0].subEncounterTypeCd : '';
            this.setState({
                multiple_subEncounter: subEncounter,
                multiple_subEncounterCodeList: subCodeList
            });
        }
    }

    handleWeekdayBlur = () => {
        this.validateWeekday();
    }

    validateWeekday = () => {
        if (this.combineWeek() === '0000000') {
            this.setState({ weekdayErrorMessage: this.msg110211 });
            return false;
        } else {
            this.setState({ weekdayErrorMessage: '' });
            return true;
        }
    }

    handleCbWeekChange = (e, checked) => {
        let name = e.target.name;
        if (checked) {
            this.setState({ [name]: '1', weekdayErrorMessage: '' });
        } else {
            this.setState({ [name]: '0' });
        }
    }

    handleRbChange = (e, checked) => {
        if (checked) {
            const name = e.target.name;
            this.setState({ multipleEditMode: name });
            if (name === 'all') {
                this.setState({ newStartTime: null });
            }
        }
    }

    handleCbChange = (e, checked) => {
        const name = e.target.name;
        this.setState({ [name]: checked });
        if (checked) {
            this.state.defaultQuotaDescValue.forEach((item) => {
                let params = {};
                params['new' + item.engDesc] = '';
                params['old' + item.engDesc] = '';
                this.setState({
                    ...params
                });
            });
            this.setState({
                newStartTime: null,
                overallQuota: ''
                // newNormal: '',
                // newForce: '',
                // newPublic: '',
                // oldNormal: '',
                // oldForce: '',
                // oldPublic: ''
            });
        }
    }

    handleMultipleSave = () => {
        if (!this.validateWeekday())
            return;
        const { encounterTypeCd, subEncounterTypeCd } = this.props;
        let weekArr = this.getWeekArray();
        let slotStr1 = this.state.multipleEditMode === 'exact' ?
            `Exact Slot Time [${moment(this.state.multiple_exactSlotTime).format('HH:mm')}]` :
            `Update all Slots From ${moment(this.state.multiple_fromTime).format('HH:mm')} To ${moment(this.state.multiple_toTime).format('HH:mm')}`;
        let slotStr2 = this.getSlotConfirmationDesc();
        this.props.openCommonMessage({
            msgCode: '110928',
            params: [
                { name: 'ACTION', value: this.state.multipleDeleteSlot ? 'Delete' : 'Update' },
                { name: 'ENCOUNTER', value: encounterTypeCd },
                { name: 'SUBENCOUNTER', value: subEncounterTypeCd },
                { name: 'FROMDATE', value: moment(this.state.multiple_dateFrom).format(Enum.DATE_FORMAT_EDMY_VALUE) },
                { name: 'TODATE', value: moment(this.state.multiple_dateTo).format(Enum.DATE_FORMAT_EDMY_VALUE) },
                { name: 'WEEKDAYS', value: weekArr.join(', ') },
                { name: 'SLOT_STR1', value: slotStr1 },
                { name: 'SLOT_STR2', value: slotStr2 }
            ],
            btnActions: {
                btn1Click: () => {
                    let updateParams = {
                        encounterTypeCd: encounterTypeCd,
                        subEncounterTypeCd: subEncounterTypeCd,
                        overallQuota: this.state.overallQuota,
                        // newNormal: this.state.newNormal,
                        // newForce: this.state.newForce,
                        // newPublic: this.state.newPublic,
                        // oldNormal: this.state.oldNormal,
                        // oldForce: this.state.oldForce,
                        // oldPublic: this.state.oldPublic,
                        dateFrom: moment(this.state.multiple_dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                        dateTo: moment(this.state.multiple_dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
                        delete: this.state.multipleDeleteSlot,
                        newStartTime: this.state.newStartTime ? moment(this.state.newStartTime).format('HH:mm') : '',
                        startTime: this.state.multipleEditMode === 'exact' ? moment(this.state.multiple_exactSlotTime).format('HH:mm') : moment(this.state.multiple_fromTime).format('HH:mm'),
                        endTime: this.state.multipleEditMode === 'exact' ? '' : moment(this.state.multiple_toTime).format('HH:mm'),
                        week: this.combineWeek()
                    };
                    this.state.defaultQuotaDescValue.forEach((item) => {
                        updateParams['new' + item.engDesc] = this.state['new' + item.engDesc];
                        updateParams['old' + item.engDesc] = this.state['old' + item.engDesc];
                    });
                    let searchParams = this.getSearchParams();
                    searchParams.dateFrom = updateParams.dateFrom;
                    searchParams.dateTo = updateParams.dateTo;
                    this.props.multipleUpdate(updateParams, searchParams, (isWarning) => {
                        if (!isWarning) {
                            this.props.updateState({ dateFrom: this.state.multiple_dateFrom, dateTo: this.state.multiple_dateTo });
                            this.handleClose();
                        }
                    });
                }
            }
        });
    }

    getSlotConfirmationDesc = () => {
        let str = '';
        if (this.state.overallQuota) {
            str += `-Set Overall Quota [${parseInt(this.state.overallQuota)}] `;
        }
        this.state.defaultQuotaDescValue.forEach((item) => {
            if (this.state['new' + item.engDesc]) {
                str += '-Set New ' + item.engDesc + ` Quota [${parseInt(this.state['new' + item.engDesc])}]`;
            }
        });
        this.state.defaultQuotaDescValue.forEach((item) => {
            if (this.state['old' + item.engDesc]) {
                str += '-Set Old ' + item.engDesc + ` Quota [${parseInt(this.state['old' + item.engDesc])}]`;
            }
        });
        // if (this.state.newNormal) {
        //     str += `-Set New Normal Quota [${parseInt(this.state.newNormal)}] `;
        // }
        // if (this.state.newForce) {
        //     str += `-Set New Force Quota [${parseInt(this.state.newForce)}] `;
        // }
        // if (this.state.newPublic) {
        //     str += `-Set New Public Quota [${parseInt(this.state.newPublic)}] `;
        // }
        // if (this.state.oldNormal) {
        //     str += `-Set Old Normal Quota [${parseInt(this.state.oldNormal)}] `;
        // }
        // if (this.state.oldForce) {
        //     str += `-Set Old Force Quota [${parseInt(this.state.oldForce)}] `;
        // }
        // if (this.state.oldPublic) {
        //     str += `-Set Old Public Quota [${parseInt(this.state.oldPublic)}] `;
        // }
        return str;
    }

    getWeekArray = () => {
        let arr = [];
        if (parseInt(this.state.weekday_sun)) { arr.push('Sun'); }
        if (parseInt(this.state.weekday_mon)) { arr.push('Mon'); }
        if (parseInt(this.state.weekday_tue)) { arr.push('Tue'); }
        if (parseInt(this.state.weekday_wed)) { arr.push('Wed'); }
        if (parseInt(this.state.weekday_thur)) { arr.push('Thur'); }
        if (parseInt(this.state.weekday_fri)) { arr.push('Fri'); }
        if (parseInt(this.state.weekday_sat)) { arr.push('Sat'); }
        return arr;
    }

    combineWeek = () => {
        return this.state.weekday_sun
            + this.state.weekday_mon
            + this.state.weekday_tue
            + this.state.weekday_wed
            + this.state.weekday_thur
            + this.state.weekday_fri
            + this.state.weekday_sat;
    }

    getUpdateParams = () => {
        let params = {};
        this.state.defaultQuotaDescValue.forEach((item) => {
            params['new' + item.engDesc] = this.state['new' + item.engDesc];
            params['old' + item.engDesc] = this.state['old' + item.engDesc];
        });
        return {
            encounterTypeCd: this.props.encounterTypeCd,
            subEncounterTypeCd: this.props.subEncounterTypeCd,
            // newNormal: this.state.newNormal,
            // newForce: this.state.newForce,
            // newPublic: this.state.newPublic,
            // oldNormal: this.state.oldNormal,
            // oldForce: this.state.oldForce,
            // oldPublic: this.state.oldPublic,
            ...params,
            overallQuota: this.state.overallQuota,
            slotDate: moment(this.state.slotDate, Enum.DATE_FORMAT_EDMY_VALUE).format(Enum.DATE_FORMAT_EYMD_VALUE),
            startTime: moment(this.state.newStartTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
        };
    }

    getSearchParams = () => {
        return {
            encounterTypeCd: this.props.encounterTypeCd,
            subEncounterTypeCd: this.props.subEncounterTypeCd,
            dateFrom: moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            page: this.props.page,
            pageSize: this.props.pageSize
        };
    }

    render() {
        const { classes, action, open, selectedItems } = this.props;
        const { defaultQuotaDescValue } = this.state;
        let quotaOption = {};
        defaultQuotaDescValue && defaultQuotaDescValue.forEach((item) => {
            quotaOption['new' + item.engDesc] = this.state['new' + item.engDesc];
            quotaOption['old' + item.engDesc] = this.state['old' + item.engDesc];
        });
        switch (_.toUpper(action)) {
            case 'ADD': {
                const idConstant = this.props.id + '_addTimeSlot';
                return (
                    <CIMSDialog id={idConstant} dialogTitle="Add Timeslot" open={open} >
                        <DialogContent>
                            <ValidatorForm ref="form" onSubmit={this.handleSave}>
                                <Grid container>
                                    <Grid item xs={4} className={classes.fieldMargin}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'standard',
                                                disabled: true
                                            }}
                                            isDisabled
                                            options={this.props.encounterCodeList && this.props.encounterCodeList.map((item) => ({ value: item.encounterTypeCd, label: item.encounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_encounterType'}
                                            labelText="Encounter"
                                            value={this.props.encounterTypeCd}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'standard',
                                                disabled: true
                                            }}
                                            isDisabled
                                            options={this.props.subEncounterCodeList && this.props.subEncounterCodeList.map((item) => ({ value: item.subEncounterTypeCd, label: item.subEncounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_subEncounterType'}
                                            labelText="Sub-encounter"
                                            value={this.props.subEncounterTypeCd}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <CIMSInputLabel>Time Slot<RequiredIcon /></CIMSInputLabel>
                                    <Grid item container>
                                        <Grid item xs={4} className={classes.fieldMargin}>
                                            <DateFieldValidator
                                                id={idConstant + '_date'}
                                                isRequired
                                                disablePast
                                                value={this.state.slotDate}
                                                onChange={e => this.handleDateChange(e, 'slotDate')}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TimeFieldValidator
                                                id={idConstant + '_time'}
                                                fullWidth
                                                value={this.state.newStartTime}
                                                isRequired
                                                onChange={e => this.handleTimeChange(e, 'newStartTime')}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Card className={classes.card}>
                                        <CardHeader
                                            classes={{
                                                root: classes.cardHeaderRoot,
                                                title: classes.cardHeaderTitle
                                            }}
                                            title="Detail"
                                        />
                                        <CardContent>
                                            <Grid container alignItems="center">
                                                <Grid item xs={4} className={classes.fieldMargin}>
                                                    <TextFieldValidator
                                                        id={idConstant + '_overallQuota'}
                                                        fullWidth
                                                        labelText="Overall Quota"
                                                        inputProps={{
                                                            maxLength: 4
                                                        }}
                                                        name="overallQuota"
                                                        isRequired
                                                        value={this.state.overallQuota}
                                                        onChange={this.handleTextChange}
                                                        validators={[ValidatorEnum.required, ValidatorEnum.isPositiveInteger]}
                                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <NewOldQuotaPublic
                                                        id={idConstant + '_newOldQuota'}
                                                        validators={[ValidatorEnum.required, ValidatorEnum.isPositiveInteger]}
                                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                        // newNormal={this.state.newNormal}
                                                        // newForce={this.state.newForce}
                                                        // newPublic={this.state.newPublic}
                                                        // oldNormal={this.state.oldNormal}
                                                        // oldForce={this.state.oldForce}
                                                        // oldPublic={this.state.oldPublic}
                                                        quotaOption={{ ...quotaOption }}
                                                        onChange={this.handleTextChange}
                                                        encounterTypeCd={this.props.encounterTypeCd}
                                                        subEncounterTypeCd={this.props.subEncounterTypeCd}
                                                        loadQuotaType={this.props.loadQuotaType}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </ValidatorForm>
                        </DialogContent>
                        <DialogActions>
                            <CIMSButton className={classes.buttonRoot} onClick={this.handleSubmit} id={idConstant + '_save'}>Save</CIMSButton>
                            <CIMSButton className={classes.buttonRoot} onClick={this.handleClose} id={idConstant + '_cancel'}>Cancel</CIMSButton>
                        </DialogActions>
                    </CIMSDialog>
                );
            }
            case 'EDIT': {
                const idConstant = this.props.id + '_editTimeSlot';
                const selected = selectedItems[0];
                if (!selected) {
                    return null;
                }
                // const disableChangeTime =
                // (selected.newNormalBook || selected.newPublicBook || selected.newForceBook ||
                //     selected.oldNormalBook || selected.oldPublicBook || selected.oldForceBook) > 0;
                let disableChangeTime = false;
                defaultQuotaDescValue && defaultQuotaDescValue.forEach((item) => {
                    if (selected['new' + item.engDesc + 'Book'] > 0) {
                        disableChangeTime = true;
                    }
                    if (selected['old' + item.engDesc + 'Book'] > 0) {
                        disableChangeTime = true;
                    }
                });
                return (
                    <CIMSDialog id={idConstant} dialogTitle="Edit Timeslot" open={open} >
                        <DialogContent>
                            <ValidatorForm ref="form" onSubmit={this.handleSave}>
                                <Grid container>
                                    <Grid item xs={4} className={classes.fieldMargin}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'standard',
                                                disabled: true
                                            }}
                                            isDisabled
                                            options={this.props.encounterCodeList && this.props.encounterCodeList.map((item) => ({ value: item.encounterTypeCd, label: item.encounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_encounterType'}
                                            labelText="Encounter"
                                            value={this.props.encounterTypeCd}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'standard',
                                                disabled: true
                                            }}
                                            isDisabled
                                            options={this.props.subEncounterCodeList && this.props.subEncounterCodeList.map((item) => ({ value: item.subEncounterTypeCd, label: item.subEncounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_subEncounterType'}
                                            labelText="Sub-encounter"
                                            value={this.props.subEncounterTypeCd}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <CIMSInputLabel>Time Slot</CIMSInputLabel>
                                    <Grid item container>
                                        <Grid item xs={4} className={classes.fieldMargin}>
                                            <DateFieldValidator
                                                id={idConstant + '_date'}
                                                value={moment(selected.slotDate)}
                                                variant="standard"
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TimeFieldValidator
                                                id={idConstant + '_time'}
                                                fullWidth
                                                variant="standard"
                                                disabled
                                                value={moment(selected.startTime, 'HH:mm')}
                                                onChange={() => { }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Card className={classes.card}>
                                        <CardHeader
                                            classes={{
                                                root: classes.cardHeaderRoot,
                                                title: classes.cardHeaderTitle
                                            }}
                                            title="Change"
                                        />
                                        <CardContent>
                                            <Grid container alignItems="flex-end">
                                                <Grid item xs={5} container direction="column" justify="space-between" className={classes.fieldMargin}>
                                                    <Grid item></Grid>
                                                    <Grid item container direction="column">
                                                        <Grid item container>
                                                            <CIMSInputLabel>Time Slot<RequiredIcon /></CIMSInputLabel>
                                                            {disableChangeTime ? <FormHelperText className={classes.disableChangeTimeFromHelper}>{MessageUtil.getMessageDescriptionByMsgCode('110912')}</FormHelperText> : null}
                                                        </Grid>
                                                        <Grid item container spacing={1}>
                                                            <Grid item xs={6}>
                                                                <DateFieldValidator
                                                                    id={idConstant + '_changeDate'}
                                                                    isRequired
                                                                    disablePast
                                                                    disabled={disableChangeTime}
                                                                    value={this.state.slotDate}
                                                                    onChange={e => this.handleDateChange(e, 'slotDate')}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <TimeFieldValidator
                                                                    id={idConstant + '_changeTime'}
                                                                    fullWidth
                                                                    value={this.state.newStartTime}
                                                                    disabled={disableChangeTime}
                                                                    onChange={e => this.handleTimeChange(e, 'newStartTime')}
                                                                    validators={[ValidatorEnum.required]}
                                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item container spacing={1}>
                                                        <Grid item xs={12}>
                                                            <TextFieldValidator
                                                                id={idConstant + '_overallQuota'}
                                                                fullWidth
                                                                labelText="Overall Quota"
                                                                inputProps={{
                                                                    maxLength: 4
                                                                }}
                                                                name="overallQuota"
                                                                isRequired
                                                                value={this.state.overallQuota}
                                                                onChange={this.handleTextChange}
                                                                validators={[ValidatorEnum.required, ValidatorEnum.isPositiveInteger]}
                                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={1}></Grid>
                                                <Grid item xs={4}>
                                                    <NewOldQuotaPublic
                                                        id={idConstant + '_newOldQuota'}
                                                        validators={[ValidatorEnum.required, ValidatorEnum.isPositiveInteger]}
                                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                        // newNormal={this.state.newNormal}
                                                        // newForce={this.state.newForce}
                                                        // newPublic={this.state.newPublic}
                                                        // oldNormal={this.state.oldNormal}
                                                        // oldForce={this.state.oldForce}
                                                        // oldPublic={this.state.oldPublic}
                                                        quotaOption={{ ...quotaOption }}
                                                        onChange={this.handleTextChange}
                                                        encounterTypeCd={this.props.encounterTypeCd}
                                                        subEncounterTypeCd={this.props.subEncounterTypeCd}
                                                        loadQuotaType={this.props.loadQuotaType}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </ValidatorForm>
                        </DialogContent>
                        <DialogActions>
                            <CIMSButton className={classes.buttonRoot} onClick={this.handleSubmit} id={idConstant + '_save'}>Save</CIMSButton>
                            <CIMSButton className={classes.buttonRoot} onClick={this.handleClose} id={idConstant + '_cancel'}>Cancel</CIMSButton>
                        </DialogActions>
                    </CIMSDialog>
                );
            }
            case 'DELETE': {
                const idConstant = this.props.id + '_deleteTimeSlot';
                const selected = selectedItems[0];
                if (!selected) {
                    return null;
                }
                // const disableDelete =
                //     (selected.newNormalBook || selected.newPublicBook || selected.newForceBook ||
                //         selected.oldNormalBook || selected.oldPublicBook || selected.oldForceBook) > 0;
                let quotaOptionForDelete = {};
                let disableDelete = false;
                defaultQuotaDescValue && defaultQuotaDescValue.forEach((item) => {
                    quotaOptionForDelete['new' + item.engDesc] = selected['new' + item.engDesc];
                    quotaOptionForDelete['old' + item.engDesc] = selected['old' + item.engDesc];
                    if (selected['new' + item.engDesc + 'Book'] > 0) {
                        disableDelete = true;
                    }
                    if (selected['old' + item.engDesc + 'Book'] > 0) {
                        disableDelete = true;
                    }
                });
                return (
                    <CIMSDialog id={idConstant} dialogTitle="Delete Timeslot" open={open} >
                        <DialogContent>
                            <ValidatorForm ref="form" onSubmit={this.handleDelete}>
                                <Grid container>
                                    <Grid item xs={4} className={classes.fieldMargin}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'standard',
                                                disabled: true
                                            }}
                                            isDisabled
                                            options={this.props.encounterCodeList && this.props.encounterCodeList.map((item) => ({ value: item.encounterTypeCd, label: item.encounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_encounterType'}
                                            labelText="Encounter"
                                            value={this.props.encounterTypeCd}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'standard',
                                                disabled: true
                                            }}
                                            isDisabled
                                            options={this.props.subEncounterCodeList && this.props.subEncounterCodeList.map((item) => ({ value: item.subEncounterTypeCd, label: item.subEncounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_subEncounterType'}
                                            labelText="Sub-encounter"
                                            value={this.props.subEncounterTypeCd}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <CIMSInputLabel>Time Slot</CIMSInputLabel>
                                    <Grid item container>
                                        <Grid item xs={4} className={classes.fieldMargin}>
                                            <DateFieldValidator
                                                id={idConstant + '_date'}
                                                disabled
                                                value={moment(selected.slotDate)}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TimeFieldValidator
                                                id={idConstant + '_time'}
                                                fullWidth
                                                variant="standard"
                                                disabled
                                                value={moment(selected.startTime, 'HH:mm')}
                                                onChange={() => { }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Card className={classes.card}>
                                        <CardHeader
                                            classes={{
                                                root: classes.cardHeaderRoot,
                                                title: classes.cardHeaderTitle
                                            }}
                                            title="Detail"
                                        />
                                        <CardContent>
                                            <Grid container alignItems="center">
                                                <Grid item xs={4} className={classes.fieldMargin}>
                                                    <TextFieldValidator
                                                        id={idConstant + '_overallQuota'}
                                                        fullWidth
                                                        labelText="Overall Quota"
                                                        disabled
                                                        value={selected.overallQuota}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <NewOldQuotaPublic
                                                        id={idConstant + '_newOldQuota'}
                                                        quotaOption={{ ...quotaOptionForDelete }}
                                                        // newNormal={selected.newNormal}
                                                        // newForce={selected.newForce}
                                                        // newPublic={selected.newPublic}
                                                        // oldNormal={selected.oldNormal}
                                                        // oldForce={selected.oldForce}
                                                        // oldPublic={selected.oldPublic}
                                                        comDisabled
                                                        encounterTypeCd={this.props.encounterTypeCd}
                                                        subEncounterTypeCd={this.props.subEncounterTypeCd}
                                                        loadQuotaType={this.props.loadQuotaType}
                                                    />
                                                </Grid>
                                            </Grid>
                                            {
                                                disableDelete ?
                                                    <Grid><FormHelperText className={classes.multipleTipRoot}>{MessageUtil.getMessageDescriptionByMsgCode('110914')}</FormHelperText></Grid>
                                                    : null
                                            }
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </ValidatorForm>
                        </DialogContent>
                        <DialogActions>
                            <CIMSButton disabled={disableDelete} className={classes.buttonRoot} onClick={this.handleSubmit} id={idConstant + '_delete'}>Delete</CIMSButton>
                            <CIMSButton className={classes.buttonRoot} onClick={this.handleClose} id={idConstant + '_cancel'}>Cancel</CIMSButton>
                        </DialogActions>
                    </CIMSDialog>
                );
            }
            case 'MULTIPLE': {
                const idConstant = this.props.id + '_multipleUpdateTimeSlot';
                return (
                    <CIMSPromptDialog
                        id={idConstant}
                        dialogTitle={'Multiple Timeslot Update'}
                        open={open}
                        dialogContentText={
                            <ValidatorForm
                                ref="form"
                                onSubmit={this.handleMultipleSave}
                                className={classes.multipleUpdateForm}
                            >
                                <Grid container spacing={4}>
                                    <Grid item xs={3}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Encounter<RequiredIcon /></>
                                            }}
                                            msgPosition="bottom"
                                            options={this.state.multiple_encounterCodeList.map((item) => ({ value: item.encounterTypeCd, label: item.encounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_encounterType'}
                                            value={this.state.multiple_encounter}
                                            validators={[ValidatorEnum.required]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED]}
                                            onChange={(e) => { this.handleMultipleSelectChange(e.value, 'multiple_encounter'); }}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <SelectFieldValidator
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Sub-encounter<RequiredIcon /></>
                                            }}
                                            msgPosition="bottom"
                                            options={this.state.multiple_subEncounterCodeList.map((item) => ({ value: item.subEncounterTypeCd, label: item.subEncounterTypeCd, shortName: item.shortName }))}
                                            id={idConstant + '_subEncounterType'}
                                            value={this.state.multiple_subEncounter}
                                            validators={[ValidatorEnum.required]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED]}
                                            onChange={(e) => { this.handleMultipleSelectChange(e.value, 'multiple_subEncounter'); }}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <DateFieldValidator
                                            id={idConstant + '_fromDate'}
                                            label={<>From Date<RequiredIcon /></>}
                                            isRequired
                                            value={this.state.multiple_dateFrom}
                                            onChange={e => this.handleMultipleDateChange(e, 'multiple_dateFrom')}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <DateFieldValidator
                                            id={idConstant + '_toDate'}
                                            label={<>To Date<RequiredIcon /></>}
                                            isRequired
                                            value={this.state.multiple_dateTo}
                                            onChange={e => this.handleMultipleDateChange(e, 'multiple_dateTo')}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <CIMSFormLabel
                                            labelText={<>Weekday<RequiredIcon /></>}
                                            className={classes.labelContainer}
                                        >
                                            <FormGroup
                                                row
                                                style={{ clear: 'both', justifyContent: 'space-around' }}
                                                onBlur={this.handleWeekdayBlur}
                                                id={idConstant + '_checkBoxGroup'}
                                            >
                                                <FormControlLabel
                                                    control={<CIMSCheckBox value={'1'} name={'weekday_sun'} id={idConstant + '_sun'} />}
                                                    label={'Sun'}
                                                    checked={this.state.weekday_sun === '1'}
                                                    onChange={this.handleCbWeekChange}
                                                    id={idConstant + '_sunLabel'}
                                                />
                                                <FormControlLabel
                                                    control={<CIMSCheckBox value={'1'} name={'weekday_mon'} id={idConstant + '_mon'} />}
                                                    label={'Mon'}
                                                    checked={this.state.weekday_mon === '1'}
                                                    onChange={this.handleCbWeekChange}
                                                    id={idConstant + '_monLabel'}
                                                />
                                                <FormControlLabel
                                                    control={<CIMSCheckBox value={'1'} name={'weekday_tue'} id={idConstant + '_tue'} />}
                                                    label={'Tue'}
                                                    checked={this.state.weekday_tue === '1'}
                                                    onChange={this.handleCbWeekChange}
                                                    id={idConstant + '_tueLabel'}
                                                />
                                                <FormControlLabel
                                                    control={<CIMSCheckBox value={'1'} name={'weekday_wed'} id={idConstant + '_wed'} />}
                                                    label={'Wed'}
                                                    checked={this.state.weekday_wed === '1'}
                                                    onChange={this.handleCbWeekChange}
                                                    id={idConstant + '_wedLabel'}
                                                />
                                                <FormControlLabel
                                                    control={<CIMSCheckBox value={'1'} name={'weekday_thur'} id={idConstant + '_thu'} />}
                                                    label={'Thur'}
                                                    checked={this.state.weekday_thur === '1'}
                                                    onChange={this.handleCbWeekChange}
                                                    id={idConstant + '_thuLabel'}
                                                />
                                                <FormControlLabel
                                                    control={<CIMSCheckBox value={'1'} name={'weekday_fri'} id={idConstant + '_fri'} />}
                                                    label={'Fri'}
                                                    checked={this.state.weekday_fri === '1'}
                                                    onChange={this.handleCbWeekChange}
                                                    id={idConstant + '_friLabel'}
                                                />
                                                <FormControlLabel
                                                    control={<CIMSCheckBox value={'1'} name={'weekday_sat'} id={idConstant + '_sat'} />}
                                                    label={'Sat'}
                                                    checked={this.state.weekday_sat === '1'}
                                                    onChange={this.handleCbWeekChange}
                                                    id={idConstant + '_satLabel'}
                                                />
                                            </FormGroup>
                                        </CIMSFormLabel>
                                        {
                                            this.state.weekdayErrorMessage ?
                                                <FormHelperText error style={{ paddingLeft: 5 }}>{this.state.weekdayErrorMessage}</FormHelperText> : null
                                        }
                                    </Grid>
                                    <Grid item container xs={4} wrap="nowrap" alignContent="center">
                                        <Radio
                                            value="exact"
                                            name="exact"
                                            id={idConstant + '_exact'}
                                            color={'primary'}
                                            onChange={this.handleRbChange}
                                            checked={this.state.multipleEditMode === 'exact'}
                                        />
                                        <CIMSFormLabel
                                            fullWidth
                                            labelText="Exact Slot Time"
                                            className={classes.labelContainer}
                                        >
                                            <TimeFieldValidator
                                                id={idConstant + '_exactTime'}
                                                isRequired
                                                label="Start Time"
                                                inputVariant="outlined"
                                                disabled={this.state.multipleEditMode === 'exact' ? false : true}
                                                value={this.state.multiple_exactSlotTime}
                                                onChange={e => this.handleTimeChange(e, 'multiple_exactSlotTime')}
                                            />
                                        </CIMSFormLabel>
                                    </Grid>
                                    <Grid item container xs={8} wrap="nowrap" alignContent="center">
                                        <Radio
                                            value="all"
                                            name="all"
                                            id={idConstant + '_allSlot'}
                                            color={'primary'}
                                            onChange={this.handleRbChange}
                                            checked={this.state.multipleEditMode === 'all'}
                                        />
                                        <CIMSFormLabel
                                            fullWidth
                                            labelText="Update all Slots(Not only at Exact Slot time)"
                                            className={classes.labelContainer}
                                        >
                                            <Grid item container spacing={2}>
                                                <Grid item xs={6}>
                                                    <TimeFieldValidator
                                                        id={idConstant + '_fromTime'}
                                                        isRequired
                                                        label="From"
                                                        inputVariant="outlined"
                                                        disabled={this.state.multipleEditMode === 'all' ? false : true}
                                                        value={this.state.multiple_fromTime}
                                                        onChange={e => this.handleTimeChange(e, 'multiple_fromTime')}
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TimeFieldValidator
                                                        id={idConstant + '_toTime'}
                                                        isRequired
                                                        label="To"
                                                        inputVariant="outlined"
                                                        disabled={this.state.multipleEditMode === 'all' ? false : true}
                                                        value={this.state.multiple_toTime}
                                                        onChange={e => this.handleTimeChange(e, 'multiple_toTime')}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CIMSFormLabel>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <CIMSFormLabel
                                            labelText="Slot Details"
                                            className={classes.labelContainer}
                                        >
                                            <Grid item container style={{ marginBottom: 20 }}>
                                                <Grid item container xs={4} alignContent="space-around" spacing={1}>
                                                    <Grid item xs={12}>
                                                        <FormControlLabel
                                                            control={<CIMSCheckBox id={idConstant + '_deleteSlot'} name="multipleDeleteSlot" />}
                                                            checked={this.state.multipleDeleteSlot}
                                                            onChange={this.handleCbChange}
                                                            label="Delete Slot"
                                                            id={idConstant + '_deleteSlotLabel'}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TimeFieldValidator
                                                            id={idConstant + '_changeTime'}
                                                            label="Time Block"
                                                            inputVariant="outlined"
                                                            disabled={(this.state.multipleDeleteSlot || this.state.multipleEditMode === 'all' || (this.state.overallQuota && parseInt(this.state.overallQuota) === 0)) ? true : false}
                                                            value={this.state.newStartTime}
                                                            onChange={e => this.handleTimeChange(e, 'newStartTime')}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextFieldValidator
                                                            id={idConstant + '_overallQuota'}
                                                            name="overallQuota"
                                                            label="Overall Quota"
                                                            variant="outlined"
                                                            inputProps={{
                                                                maxLength: 4
                                                            }}
                                                            disabled={this.state.multipleDeleteSlot}
                                                            value={this.state.overallQuota}
                                                            onChange={this.handleTextChange}
                                                            validators={[ValidatorEnum.isPositiveInteger]}
                                                            errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={1}></Grid>
                                                <Grid item container xs={6} alignContent="center">
                                                    <NewOldQuotaPublic
                                                        id={idConstant + '_newOldQuota'}
                                                        showRequiredIcon
                                                        validators={[ValidatorEnum.isPositiveInteger]}
                                                        errorMessages={[CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER()]}
                                                        quotaOption={{ ...quotaOption }}
                                                        onChange={this.handleTextChange}
                                                        comDisabled={this.state.multipleDeleteSlot || (this.state.overallQuota && parseInt(this.state.overallQuota) === 0)}
                                                        encounterTypeCd={this.props.encounterTypeCd}
                                                        subEncounterTypeCd={this.props.subEncounterTypeCd}
                                                        loadQuotaType={this.props.loadQuotaType}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <FormHelperText className={classes.multipleTipRoot}>{this.msg110223}</FormHelperText>
                                            <FormHelperText className={classes.multipleTipRoot}>{this.msg110287}</FormHelperText>
                                        </CIMSFormLabel>
                                    </Grid>
                                </Grid>
                            </ValidatorForm>
                        }
                        buttonConfig={
                            [
                                {
                                    id: idConstant + '_save',
                                    name: 'Save',
                                    onClick: this.handleSubmit
                                },
                                {
                                    id: idConstant + '_cancel',
                                    name: 'Cancel',
                                    onClick: this.handleClose
                                }
                            ]
                        }
                    />
                );
            }
            default: return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        encounterTypeCd: state.editTimeSlot.encounterTypeCd,
        subEncounterTypeCd: state.editTimeSlot.subEncounterTypeCd,
        encounterCodeList: state.editTimeSlot.encounterCodeList || [],
        subEncounterCodeList: state.editTimeSlot.subEncounterCodeList || [],
        selectedItems: state.editTimeSlot.selectedItems || [],
        dateFrom: state.editTimeSlot.dateFrom,
        dateTo: state.editTimeSlot.dateTo,
        page: state.editTimeSlot.page,
        pageSize: state.editTimeSlot.pageSize,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        commonMessageDetail: state.message.commonMessageDetail
    };
}

const mapDispatchToProps = {
    updateState,
    insertTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    multipleUpdate,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EditTimeSlotDialog));
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    FormControlLabel,
    IconButton,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails
} from '@material-ui/core';
import { Remove, Add } from '@material-ui/icons';
import { RemoveCircle, AddCircle } from '@material-ui/icons';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import Enum from '../../../../enums/enum';
import moment from 'moment';
import AutoScrollTable from '../../../../components/Table/AutoScrollTable';
import _ from 'lodash';
import * as RegUtil from '../../../../utilities/registrationUtilities';
import CommonMessage from '../../../../constants/commonMessage';
// import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import FastTextField from '../../../../components/TextField/FastTextField';
import CIMSSelect from '../../../../components/Select/CIMSSelect';
import {
    waiverInfoBasic
} from '../../../../constants/registration/registrationConstants';

const styles = () => ({
    contactRoot: {
        height: '33%'
    },
    iconButton: {
        padding: 0,
        borderRadius: '15%',
        width: 40,
        paddingBottom: 10
    },
    customTableContainer: {
        height: 190
    },
    close_icon: {
        padding: 0,
        marginRight: 10,
        borderRadius: '0%'
    },
    customBodyColum: {
        height: 80,
        overflowY: 'auto'
    },
    customCmp: {
        position: 'relative',
        height: 50,
        top: '50%',
        marginTop: '-20px' //it should be -25px
    },
    customErrorMsg: {
        // position: 'relative',
        // top: 30
        marginTop: 25,
        padding: '5px 14px'
    },
    errorFieldNameText: {
        fontSize: '12px',
        wordBreak: 'break-word',
        whiteSpace: 'pre-line',
        color: '#fd0000'
    }
});


class WaiverInformation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            tableRows: this.genTableRows(),
            errorMessageList: []
        };
    }

    handleExpanChange = (e, isExpanded) => {
        this.setState({
            expanded: isExpanded ? isExpanded : false
        });
    }

    genTableRows = () => {
        let rows = [
            { name: 'waiverTypeCd', label: 'Waiver Type', customBodyRender: (value, rowData) => this.customWaiverType('waiverTypeCd', value, rowData) },
            { name: 'waiverNum', label: 'Document Ref. No.', customBodyRender: (value, rowData) => this.customTextFieldBody('waiverNum', value, rowData) },
            { name: 'isOneoff', label: 'One Off Document', width: 80, customBodyRender: (value, rowData) => this.customOneOffDocument('isOneoff', value, rowData) },
            { name: 'waivePrcnt', label: 'Waived Percentage', width: 95, customBodyRender: (value, rowData) => this.customTextFieldBody('waivePrcnt', value, rowData) },
            { name: 'startDate', label: 'Waiver Start Date', width: 150, customBodyRender: (value, rowData) => this.customDateField('startDate', value, rowData) },
            { name: 'endDate', label: 'Waiver End Date', width: 150, customBodyRender: (value, rowData) => this.customDateField('endDate', value, rowData) },
            { name: 'issueBy', label: 'Waiver Issued By', width: 150, customBodyRender: (value, rowData) => this.customTextFieldBody('issueBy', value, rowData) },
            { name: 'issueDate', label: 'Waiver Issued Date', width: 150, customBodyRender: (value, rowData) => this.customDateField('issueDate', value, rowData) },
            { name: 'useSts', label: 'Waiver Status', width: 120, customBodyRender: this.customWaiverStatus },
            { name: 'checkedBy', label: 'Waiver Checked By', width: 120 },
            { name: 'action', label: 'Action', width: 110, align: 'center', customBodyRender: this.customAction }
        ];
        return rows;
    }

    getColIndex = (fieldName) => {
        let colIndex = 0;
        switch (fieldName) {
            case 'waiverTypeCd': colIndex = 1; break;
            case 'waiverNum': colIndex = 2; break;
            case 'isOneoff': colIndex = 3; break;
            case 'waivePrcnt': colIndex = 4; break;
            case 'startDate': colIndex = 5; break;
            case 'endDate': colIndex = 6; break;
            case 'issueBy': colIndex = 7; break;
            case 'issueDate': colIndex = 8; break;
        }
        return colIndex;
    }

    validAllInputs = () => {
        let { errorMessageList } = this.state;
        const { waiverList } = this.props;
        let newWaiverList = waiverList.filter(item => item.statusCd !== 'D');
        newWaiverList.forEach(rec => {
            const newWaiverInfo = _.clone(waiverInfoBasic);
            for (let fieldName in newWaiverInfo) {
                if (fieldName === 'waiverTypeCd' || fieldName === 'waiverNum' || fieldName === 'waivePrcnt') {
                    if (!rec[fieldName].toString()) {
                        let curColunmErrObjIdx = this.findCurColunmErrObjIdx(fieldName, rec.seq);
                        if (curColunmErrObjIdx === -1 && rec.isEmpty === false) {
                            const lastError = errorMessageList.slice(-1);
                            let idx = lastError[0] ? lastError[0].idx + 1 : 0;
                            errorMessageList.push({ name: fieldName, errMsg: CommonMessage.VALIDATION_NOTE_REQUIRED(), seq: rec.seq, idx: idx });
                        }
                    }
                }
                if (fieldName === 'startDate' || fieldName === 'endDate' || fieldName === 'issueDate') {
                    if (rec[fieldName] && !moment(rec[fieldName]).isValid()) {
                        let curColunmErrObjIdx = this.findCurColunmErrObjIdx(fieldName, rec.seq);
                        if (curColunmErrObjIdx === -1 && rec.isEmpty === false) {
                            const lastError = errorMessageList.slice(-1);
                            let idx = lastError[0] ? lastError[0].idx + 1 : 0;
                            errorMessageList.push({ name: fieldName, errMsg: CommonMessage.VALIDATION_NOTE_REQUIRED(), seq: rec.seq, idx: idx });
                        }
                    }
                }
            }
        });
        this.setState({ errorMessageList: errorMessageList });
        return errorMessageList.length === 0;
    }

    focusFirstFail = () => {
        if (this.state.errorMessageList && this.state.errorMessageList.length > 0) {
            let errList = _.cloneDeep(this.state.errorMessageList);
            errList.sort((a, b) => this.getColIndex(a.name) - this.getColIndex(b.name)).sort((a, b) => a.seq - b.seq);
            let name = errList[0].name;
            let seq = errList[0].seq;
            if (name === 'waiverTypeCd') {
                if (this[`${name}_${seq}`]) {
                    this[`${name}_${seq}`].select.focus();
                }
            }
            if (name === 'waiverNum' || name === 'waivePrcnt') {
                if (this[`${name}_${seq}`]) {
                    this[`${name}_${seq}`].focus();
                }
            }
            if (name === 'startDate' || name === 'endDate' || name === 'issueDate') {
                if (this[`${name}_${seq}`]) {
                    this[`${name}_${seq}`].focus();
                }
            }
        }
    }

    findCurColunmErrObjIdx = (name, seq, tempErrMsgList = []) => {
        const { errorMessageList } = this.state;
        let curColunmErrObjIdx = -1;
        let curFieldErrorMsgList = [];
        if (tempErrMsgList.length > 0) {
            curFieldErrorMsgList = tempErrMsgList.filter(item => item.name === name);
        }
        else {
            curFieldErrorMsgList = errorMessageList.filter(item => item.name === name);
        }

        if (curFieldErrorMsgList.length > 0) {
            let result = curFieldErrorMsgList.find(item => item.seq === seq);
            if (result) {
                curColunmErrObjIdx = result.idx;
            }
        }
        return curColunmErrObjIdx;
    }


    customWaiverType = (name, value, rowData) => {
        const { classes, comDisabled, codeList, id } = this.props;
        const seq = rowData.seq;
        const { errorMessageList } = this.state;
        const type = 'selectField';
        let disabled = comDisabled ? true : rowData.isReadOnly; //TEAMCDE4-329 To control the record cannot be update by user if it is Used/Cancel/Deleted
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);
        let curColumnObj = null;
        if (curColumnObjIdx > -1) {
            curColumnObj = errorMessageList.find(item => item.idx === curColumnObjIdx);
        }
        return (
            <Grid item container className={curColumnObj && curColumnObj != null ? classes.customBodyColum : null}>
                <Grid item container className={curColumnObj && curColumnObj != null ? classes.customCmp : null}>
                    {/* <SelectFieldValidator */}
                    <CIMSSelect
                        ref={ref => this[`${name}_${seq}`] = ref}
                        id={`${id}_waiver_type_select_field_${seq}`}
                        options={codeList && codeList.waiver &&
                            codeList.waiver.map((item) => (
                                { value: item.code, label: item.engDesc }
                            ))}
                        TextFieldProps={{
                            variant: 'outlined',
                            error: curColumnObj !== null
                            // label: 'Status'
                        }}
                        isDisabled={disabled}
                        onChange={(e) => this.handleChange(name, e.value, seq, type)}
                        value={value}
                        addNullOption={rowData.waiverNum
                            || rowData.isOneoff
                            || rowData.waivePrcnt
                            || rowData.startDate
                            || rowData.issueDate
                            || rowData.endDate
                            || rowData.issueBy ? false : true}
                    />
                </Grid>
                <Grid item container className={curColumnObj && curColumnObj != null ? classes.customErrorMsg : null}>
                    {
                        curColumnObj && curColumnObj != null ?
                            <Grid item container className={classes.errorFieldNameText}>
                                {curColumnObj.errMsg}
                            </Grid> : null
                    }
                </Grid>
            </Grid>
        );
    }

    customTextFieldBody = (name, value, rowData) => {
        const { comDisabled, id, classes } = this.props;
        const seq = rowData.seq;
        const { errorMessageList } = this.state;
        const type = 'textField';
        let disabled = comDisabled ? true : rowData.isReadOnly; //TEAMCDE4-329 To control the record cannot be update by user if it is Used/Cancel/Deleted
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);
        let curColumnObj = null;
        if (curColumnObjIdx > -1) {
            curColumnObj = errorMessageList.find(item => item.idx === curColumnObjIdx);
        }
        let maxLength = 100;
        if (name === 'waivePrcnt') {
            maxLength = 5;
        } else if (name === 'waiverNum') {
            maxLength = 50;
        }
        return (
            <Grid item container className={curColumnObj && curColumnObj != null ? classes.customBodyColum : null}>
                <Grid item container className={curColumnObj && curColumnObj != null ? classes.customCmp : null}>
                    {/* <TextFieldValidator */}
                    <FastTextField
                        id={`${id}_${name}_textField_${seq}`}
                        value={value}
                        disabled={disabled}
                        variant={'outlined'}
                        type={name === 'waivePrcnt' ? 'decimal' : null}
                        inputProps={{ maxLength: maxLength }}
                        inputRef={r => this[`${name}_${seq}`] = r}
                        key={this.state.isRefreshWaiverPrcnt ? moment().format() : undefined}
                        onChange={e => {
                            if (name === 'waivePrcnt') {
                                let _val = _.clone(e.target.value);
                                let reg = /^(0|[1-9]|[1-9]\d|100)(\.\d{0,2}|\.{0})$/;
                                if (!reg.test(_val) && _val !== '') {
                                    e.target.value = _val.substr(0, _val.length - 1);
                                }else if(parseFloat(_val)>100){
                                    e.target.value=100;
                                }
                            }
                        }}
                        onBlur={e => {
                            if (name === 'waivePrcnt') {
                                this.setState({ isRefreshWaiverPrcnt: true }, () => {
                                    this.setState({ isRefreshWaiverPrcnt: false });
                                });
                            }
                            this.handleChange(name, e.target.value, seq, type);
                            this.textFieldOnBlur(e.target.value, name, seq);
                        }}
                        noChinese={name === 'waivePrcnt'}
                        error={name !== 'issueBy' && curColumnObj !== null}
                    />
                </Grid>
                <Grid item container className={curColumnObj && curColumnObj != null ? classes.customErrorMsg : null}>
                    {
                        curColumnObj && curColumnObj != null ?
                            <Grid item container className={classes.errorFieldNameText}>
                                {curColumnObj.errMsg}
                            </Grid> : null
                    }
                </Grid>
            </Grid>

        );
    }

    customOneOffDocument = (name, value, rowData) => {
        const { comDisabled, id } = this.props;
        const seq = rowData.seq;
        const type = 'checkBox';
        let disabled = comDisabled ? true : rowData.isReadOnly; //TEAMCDE4-329 To control the record cannot be update by user if it is Used/Cancel/Deleted

        return (
            <Grid item container>
                <FormControlLabel
                    control={
                        <CIMSCheckBox
                            value={value}
                            disabled={disabled}
                        />
                    }
                    // label={'Mon'}
                    checked={value === 1}// eslint-disable-line
                    onChange={(...arg) => this.handleChangeOneOffDocument(...arg, name, seq, type)}
                    id={`${id}_${name}_checkBox_${seq}`}
                />
            </Grid>
        );
    }


    customDisableDate = (date, name, seq) => {
        const { waiverList } = this.props;
        let targetDate = moment();
        if (name === 'issueDate') {
            targetDate = waiverList[seq]['endDate'];
            return moment(date).isAfter(moment(targetDate), 'days');
        }
        if (name === 'endDate') {
            targetDate = waiverList[seq]['startDate'];
            return moment(date).isBefore(moment(targetDate), 'days');
        }
    }

    customDateField = (name, value, rowData) => {
        const { comDisabled, id, classes } = this.props;
        const seq = rowData.seq;
        const { errorMessageList } = this.state;
        const type = 'dateField';
        let disabled = comDisabled ? true : rowData.isReadOnly; //TEAMCDE4-329 To control the record cannot be update by user if it is Used/Cancel/Deleted
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);
        let curColumnObj = null;
        if (curColumnObjIdx > -1) {
            curColumnObj = errorMessageList.find(item => item.idx === curColumnObjIdx);
        }
        return (
            <Grid item container className={curColumnObj && curColumnObj != null ? classes.customBodyColum : null}>
                <Grid item container className={curColumnObj && curColumnObj != null ? classes.customCmp : null}>
                    <DateFieldValidator
                        // <CIMSDatePicker
                        id={`${id}_${name}_datePicker_${seq}`}
                        disabled={disabled}
                        value={value}
                        inputVariant={'outlined'}
                        onChange={(dateVal) => this.handleChange(name, dateVal, seq, type)}
                        placeholder={''}
                        notShowMsg
                        onBlur={(dateVal) => this.handleDateAccept(name, dateVal, seq)}
                        onAccept={(dateVal) => this.handleDateAccept(name, dateVal, seq)}
                        error={curColumnObj !== null}
                        shouldDisableDate={(date) => this.customDisableDate(date, name, seq)}
                        ref={ref => this[`${name}_${seq}`] = ref}
                        ignorePresetValidators={curColumnObjIdx === -1}
                    />
                </Grid>
                <Grid item container className={curColumnObj && curColumnObj != null ? classes.customErrorMsg : null}>
                    {
                        curColumnObj && curColumnObj != null ?
                            <Grid item container className={classes.errorFieldNameText}>
                                {curColumnObj.errMsg}
                            </Grid> : null
                    }
                </Grid>
            </Grid>

        );
    }

    customWaiverStatus = (value, rowData) => {
        // let statusDes='';
        switch (value) {
            case Enum.WAIVER_STATUS.NEVER_USED: {
                return Enum.WAIVER_STATUS_CODELIST[0].engDesc;
            }
            case Enum.WAIVER_STATUS.USED: {
                return Enum.WAIVER_STATUS_CODELIST[1].engDesc;
            }
            case Enum.WAIVER_STATUS.INVALID: {
                return Enum.WAIVER_STATUS_CODELIST[2].engDesc;
            }
            case Enum.WAIVER_STATUS.DELETE: {
                return Enum.WAIVER_STATUS_CODELIST[3].engDesc;
            }
            default: {
                return Enum.WAIVER_STATUS_CODELIST[0].engDesc;
            }
        }
    }

    disableRemoveWaiveInfoBtn = (waiverList) => {
        if (waiverList.length === 1) {
            let waiveInfo = waiverList[0];
            if (!waiveInfo.waiverTypeCd && !waiveInfo.waiverNum &&
                (waiveInfo.isOneoff === 0) && !_.isNumber(waiveInfo.waivePrcnt )&&
                !waiveInfo.startDate && !waiveInfo.endDate && !waiveInfo.issueBy && !waiveInfo.issueDate) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    customAction = (value, rowData) => {
        // let isFutureAppt = AppointmentUtilties.isFutureAppointment(rowData);
        const { classes, comDisabled, id, waiverList } = this.props;
        const seq = rowData.seq;
        let isLastRec = false;
        let disabled = comDisabled ? true : rowData.isReadOnly;  //TEAMCDE4-329 To control the record cannot be update by user if it is Used/Cancel/Deleted
        if (rowData.seq === waiverList.length - 1) {
            isLastRec = true;
        }
        return (
            <Grid item container direction={'row'} style={{ margin: 'auto 10px' }}>
                {
                    <Grid item>
                        <IconButton
                            id={`${id}_remove_waiveInfo_button_${seq}`}
                            className={classes.iconButton}
                            disabled={disabled || this.disableRemoveWaiveInfoBtn(waiverList)}
                            // color="primary"
                            onClick={e => this.openDialog(e, rowData.seq)}
                            color="secondary"
                        // disabled={comDisabled === false ? contactPersonList.length === 0 : true}
                        >
                            <RemoveCircle />
                        </IconButton>
                    </Grid>
                }
                {
                    isLastRec ?
                        <Grid item>
                            <IconButton
                                id={`${id}_add_waiveInfo_button_${seq}`}
                                className={classes.iconButton}
                                color="primary"
                                onClick={this.addWaiverRec}
                                disabled={comDisabled}
                                title={'Add'}
                            >
                                <AddCircle color={comDisabled ? 'disabled' : 'primary'} />
                                {/* <b>ADD MORE CONTACT PERSON</b> */}
                            </IconButton>
                        </Grid>
                        : null
                }
            </Grid>
        );
    }

    validateAllDate = (name, value, seq, waiverList) => {
        let startDate = waiverList[seq]['startDate'] ? waiverList[seq]['startDate'].format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
        let endDate = waiverList[seq]['endDate'] ? waiverList[seq]['endDate'].format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
        let issueDate = waiverList[seq]['issueDate'] ? waiverList[seq]['issueDate'].format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
        let tempErrMsgList = this.state.errorMessageList;
        if (name === 'startDate') {
            if (value && value.isValid() && endDate !== null && waiverList[seq]['endDate'].isValid()) {
                if (!moment(startDate).isAfter(moment(endDate))) {

                    let startDateErrIdx = this.findCurColunmErrObjIdx('startDate', seq);

                    if (startDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(startDateErrIdx, tempErrMsgList);
                    }
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList, 'startEndDate');
                    }
                } else {
                    let startDateErrIdx = this.findCurColunmErrObjIdx('startDate', seq);
                    if (startDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(startDateErrIdx, tempErrMsgList);
                    }
                }
            } else {
                //if (value&&value.isValid()) {
                    let startDateErrIdx = this.findCurColunmErrObjIdx('startDate', seq);
                    if (startDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(startDateErrIdx, tempErrMsgList);
                    }
                //}
            }
        } else if (name === 'endDate') {
            if (value && value.isValid() && startDate !== null && waiverList[seq]['startDate'].isValid()) {
                if (!moment(startDate).isAfter(moment(endDate))) {

                    let startDateErrIdx = this.findCurColunmErrObjIdx('startDate', seq);

                    if (startDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(startDateErrIdx, tempErrMsgList, 'startEndDate');
                    }
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList);
                    }
                } else {
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList);
                    }
                }
            } else {
                //if (value&&value.isValid()) {
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList);
                    }
                //}
            }
            if (value && value.isValid() && issueDate != null && waiverList[seq]['issueDate'].isValid()) {
                if (!moment(endDate).isBefore(moment(issueDate))) {
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList);
                    }

                    let issueDateErrIdx = this.findCurColunmErrObjIdx('issueDate', seq, tempErrMsgList);
                    if (issueDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(issueDateErrIdx, tempErrMsgList, 'issueDate');
                    }
                } else {
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList);
                    }
                }
            } else {
                //if (value&&value.isValid()) {
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList);
                    }
                //}
            }
        } else if (name === 'issueDate') {
            if (value && value.isValid() && endDate !== null && waiverList[seq]['endDate'].isValid()) {
                if (!moment(endDate).isBefore(moment(issueDate))) {
                    let endDateErrIdx = this.findCurColunmErrObjIdx('endDate', seq, tempErrMsgList);
                    if (endDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(endDateErrIdx, tempErrMsgList, 'issueDate');
                    }

                    let issueDateErrIdx = this.findCurColunmErrObjIdx('issueDate', seq, tempErrMsgList);
                    if (issueDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(issueDateErrIdx, tempErrMsgList);
                    }
                } else {
                    let issueDateErrIdx = this.findCurColunmErrObjIdx('issueDate', seq, tempErrMsgList);
                    if (issueDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(issueDateErrIdx, tempErrMsgList);
                    }
                }
            } else {
                //if (value&&value.isValid()) {
                    let issueDateErrIdx = this.findCurColunmErrObjIdx('issueDate', seq, tempErrMsgList);
                    if (issueDateErrIdx > -1) {
                        tempErrMsgList = this.popErrMsgByIdx(issueDateErrIdx, tempErrMsgList);
                    }
                //}
            }
        }


        this.setState({ errorMessageList: tempErrMsgList });
    }

    handleChange = (name, value, seq, type) => {
        let newWaiverList = _.cloneDeep(this.props.waiverList);
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);

        if (type === 'selectField') {
            if (curColumnObjIdx > -1) {
                let tempErrMsgList = this.state.errorMessageList.filter(item => item.idx !== curColumnObjIdx);
                tempErrMsgList.forEach(errMsg => {
                    if (errMsg.idx > curColumnObjIdx) {
                        errMsg.idx -= 1;
                    }
                });
                this.setState({ errorMessageList: tempErrMsgList });
            }
        }
        // if (name === 'waivePrcnt') {
        //     let reg = /^(0|[1-9]|[1-9]\d|100)(\.\d{0,2}|\.{0})$/;
        //     // let reg = /^([1-9]\d|0|100)(\.\d{1,2})$/;
        //     // let reg = /^(0|[1-9]|[1-9]\d|100)(\.\d{1,2})$/;
        //     // let reg = /^(([1-9]{1}\d*)|(0{1}))(\.[1-9]{0,1}|\.\d{0,1}[1-9]{0,1})?$/;
        //     // let reg = /^[0-9]+([.]{1}[0-9]{1,2})?$/;
        //     if (!reg.test(value) && value !== '') {
        //         return;
        //     }
        // }

        newWaiverList[seq][name] = value;

        let filledCount = this.countFilledInput(newWaiverList[seq]);
        if (filledCount > 0) {
            newWaiverList[seq]['isEmpty'] = false;
        }
        else {
            newWaiverList[seq]['isEmpty'] = true;
            // this.popErrMsg(seq, false);
            let newErrMsgList = this.state.errorMessageList.filter(item => item.seq !== seq);
            this.setState({ errorMessageList: newErrMsgList });
        }
        this.props.handleChangeWiaverList(newWaiverList);

        if (name === 'startDate' || name === 'endDate' || name === 'issueDate') {
            // value = moment(value.format(Enum.DATE_FORMAT_EDMY_VALUE), Enum.DATE_FORMAT_EDMY_VALUE);
            this.validateAllDate(name, value, seq, newWaiverList);
        }
    }

    handleChangeOneOffDocument = (e, checked, name, seq, type) => {
        let value = checked ? 1 : 0;
        this.handleChange(name, value, seq, type);
    }

    addWaiverRec = () => {
        const { loginName } = this.props;
        let newWaiverRec = RegUtil.initNewWaiverRec(loginName);
        let newWaiverList = _.cloneDeep(this.props.waiverList);
        const lastRec = newWaiverList.slice(-1);
        // let lastSeq= newPaperBasedRecList.lastIndex
        // newPaperBasedRec.serviceCd = service.serviceCd;
        newWaiverRec.seq = lastRec[0].seq + 1;
        newWaiverRec.recPos = lastRec[0].recPos + 1;
        newWaiverList.push(newWaiverRec);
        this.props.handleChangeWiaverList(newWaiverList);
    }

    openDialog = (e, seq) => {
        const { waiverList } = this.props;
        this.props.openCommonMessage({
            msgCode: '110105',
            btnActions: {
                btn1Click: () => {
                    if (waiverList.length > 1) {
                        this.removeWaiverRec(seq);
                    } else {
                        this.clearWaiverRec(seq);
                    }
                }
            }
        });
    }

    clearWaiverRec = (seq) => {
        let newWaiverList = [];
        const { loginName } = this.props;
        this.popErrMsg(seq);
        let newWaiverRec = RegUtil.initNewWaiverRec(loginName);
        newWaiverList.push(_.cloneDeep(newWaiverRec));
        this.props.handleChangeWiaverList(newWaiverList);
    }

    removeWaiverRec = (seq) => {
        let newWaiverList = _.cloneDeep(this.props.waiverList);

        this.popErrMsg(seq);
        newWaiverList.splice(seq, 1);
        for (let idx = seq; idx < newWaiverList.length; idx++) {
            newWaiverList[idx].seq--;
        }
        this.props.handleChangeWiaverList(newWaiverList);
    }

    textFieldOnBlur = (value, name, seq) => {
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);
        if (curColumnObjIdx > -1) {
            let tempErrMsgList = this.state.errorMessageList.filter(item => item.idx !== curColumnObjIdx);
            tempErrMsgList.forEach(errMsg => {
                if (errMsg.idx > curColumnObjIdx) {
                    errMsg.idx -= 1;
                }
            });
            this.setState({ errorMessageList: tempErrMsgList });
        }
        if (name === 'waivePrcnt') {
            let newWaiverList = _.cloneDeep(this.props.waiverList);
            //let splitStr = value.split('.');
            // if (splitStr.length === 2) {
            //     if (splitStr[1].length < 2) {
            //         if (splitStr[1] === '0' || splitStr[1] === '') {
            //             value = splitStr[0];
            //         }
            //     }
            //     else {
            //         let lastChar = splitStr[1].substring(1, 2);
            //         if (lastChar === '0') {
            //             //value = `${splitStr[0]}.${splitStr[1].substring(0, 1)}`;
            //             value = splitStr[0];
            //         }
            //     }
            // }
            //let _val=parseFloat(value);
            if(value){
                value=parseFloat(value);
            }
            newWaiverList[seq][name] = value;
            if(_.isNumber(value)){
                newWaiverList[seq]['isEmpty']=false;
            }
            this.props.handleChangeWiaverList(newWaiverList);
        }
    }

    handleDateAccept = (name, value, seq) => {
        let newWaiverList = _.cloneDeep(this.props.waiverList);
        let { errorMessageList } = this.state;
        newWaiverList[seq][name] = value;
        if (value !== null && !value.isValid()) {
            let curColunmErrObjIdx = this.findCurColunmErrObjIdx(name, seq);
            if (curColunmErrObjIdx === -1) {
                let idx = errorMessageList.length;
                errorMessageList.push({ name: name, errMsg: CommonMessage.VALIDATION_NOTE_INVALID_MOMENT(), seq: seq, idx: idx, value: value });
                this.setState({ errorMessageList });
            }
        }
        else {
            let startDate = newWaiverList[seq]['startDate'] ? newWaiverList[seq]['startDate'].format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
            let endDate = newWaiverList[seq]['endDate'] ? newWaiverList[seq]['endDate'].format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
            let issueDate = newWaiverList[seq]['issueDate'] ? newWaiverList[seq]['issueDate'].format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
            if (name === 'startDate') {
                if (moment(startDate).isAfter(moment(endDate))) {
                    let message = CommonMessage.VALIDATION_NOTE_DATE_MUST_LATER('Waiver End Date', 'Waiver Start Date');
                    this.pushErrMsg(name, seq, value, message, 'startEndDate');
                }
            }
            if (name === 'endDate') {
                if (moment(endDate).isBefore(moment(startDate))) {
                    let message = CommonMessage.VALIDATION_NOTE_DATE_MUST_LATER('Waiver End Date', 'Waiver Start Date');
                    this.pushErrMsg(name, seq, value, message, 'startEndDate');
                }
                if (moment(issueDate).isAfter(moment(endDate))) {
                    let message = CommonMessage.VALIDATION_NOTE_DATE_MUST_EARLIER('Waiver Issued Date', 'Waiver End Date');
                    this.pushErrMsg(name, seq, value, message, 'issueDate');
                }
            }

            if (name === 'issueDate') {
                if (moment(issueDate).isAfter(moment(endDate))) {
                    let message = CommonMessage.VALIDATION_NOTE_DATE_MUST_EARLIER('Waiver Issued Date', 'Waiver End Date');
                    this.pushErrMsg(name, seq, value, message, 'issueDate');
                }
            }

            let filledCount = this.countFilledInput(newWaiverList[seq]);
            if (filledCount > 0) {
                newWaiverList[seq]['isEmpty'] = false;
            }
            else {
                newWaiverList[seq]['isEmpty'] = true;
                let newErrMsgList = this.state.errorMessageList.filter(item => item.seq !== seq);
                this.setState({ errorMessageList: newErrMsgList });
            }
            this.props.handleChangeWiaverList(newWaiverList);
        }
        //this.validateAllDate(name,value,seq,newWaiverList);

    }

    clearErrorMsg = () => {
        this.setState({ errorMessageList: [] });
    }

    countFilledInput = (waiverInput) => {
        let filledCount = 0;
        for (let p in waiverInput) {
            if (p === 'waiverTypeCd' || p === 'waiverNum' || p === 'waivePrcnt' || p === 'issueBy') {
                if (waiverInput[p]) {
                    filledCount++;
                }
            }
            if (p === 'startDate' || p === 'endDate' || p === 'issueDate') {
                if (waiverInput[p] !== null) {
                    filledCount++;
                }
            }
            if (p === 'isOneoff') {
                if (waiverInput[p] !== 0) {
                    filledCount++;
                }
            }
        }

        return filledCount;
    }

    pushErrMsg = (name, seq, value, message, spec = null) => {
        let curColunmErrObjIdx = this.findCurColunmErrObjIdx(name, seq);
        let { errorMessageList } = this.state;
        if (curColunmErrObjIdx === -1) {
            let idx = errorMessageList.length;
            errorMessageList.push({ name: name, errMsg: message, seq: seq, idx: idx, value: value, spec: spec });
            this.setState({ errorMessageList });
        }
    }

    popErrMsg = (seq) => {
        let removeCount = this.state.errorMessageList.filter(item => item.seq === seq);
        let newErrMsgList = this.state.errorMessageList.filter(item => item.seq !== seq);

        if (newErrMsgList.length > 0) {
            newErrMsgList.forEach(errMsg => {
                if (errMsg.seq > seq) {
                    errMsg.seq -= 1;
                }
                if (errMsg.idx >= removeCount.length) {
                    errMsg.idx = errMsg.idx - removeCount.length;
                }
            });
        }
        this.setState({ errorMessageList: newErrMsgList });
    }

    popErrMsgByIdx = (idx, tempErrMsgList, spec = null) => {
        let newErrMsgList = tempErrMsgList;
        if (idx > -1) {
            // newErrMsgList = tempErrMsgList.filter(item => item.idx !== idx);
            // newErrMsgList.forEach(errMsg => {
            //     if (errMsg.idx > idx) {
            //         errMsg.idx -= 1;
            //     }
            // });
            let popIdx = newErrMsgList.findIndex(item => item.idx === idx);
            if (!spec) {
                newErrMsgList.splice(popIdx, 1);
                newErrMsgList.forEach(errMsg => {
                    if (errMsg.idx > idx) {
                        errMsg.idx -= 1;
                    }
                });
            } else {
                if (newErrMsgList[popIdx].spec === spec) {
                    newErrMsgList.splice(popIdx, 1);
                    newErrMsgList.forEach(errMsg => {
                        if (errMsg.idx > idx) {
                            errMsg.idx -= 1;
                        }
                    });
                }

            }
        }
        return newErrMsgList;
    }

    render() {
        const { classes, id, waiverList } = this.props;
        return (
            <Grid item xs={12}>
                <ExpansionPanel
                    square
                    expanded={this.state.expanded}
                    onChange={(...args) => this.handleExpanChange(...args)}
                >
                    <ExpansionPanelSummary
                        aria-controls="panel1d-content"
                    // id={id + 'panel1d-header'}
                    >
                        <IconButton
                            className={classes.close_icon}
                            color={'primary'}
                            fontSize="small"
                        >
                            {this.state.expanded ? <Remove /> : <Add />}
                            <b>Waiver Information</b>
                        </IconButton>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <AutoScrollTable
                            id={`${id}_waiver_information_table`}
                            columns={this.state.tableRows}
                            store={waiverList}
                            classes={{
                                container: classes.customTableContainer
                            }}
                            hasCustomKey
                            customKeyName={'recPos'}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>

        );
    }
}

export default withStyles(styles)(WaiverInformation);
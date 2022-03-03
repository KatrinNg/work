import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    IconButton,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails
} from '@material-ui/core';
import { Remove, Add } from '@material-ui/icons';
import { RemoveCircle, AddCircle } from '@material-ui/icons';
import AutoScrollTable from '../../../../components/Table/AutoScrollTable';
import _ from 'lodash';
import * as RegUtil from '../../../../utilities/registrationUtilities';
import Enum from '../../../../enums/enum';
import CommonMessage from '../../../../constants/commonMessage';
// import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import FastTextField from '../../../../components/TextField/FastTextField';
import CIMSSelect from '../../../../components/Select/CIMSSelect';
import {
    patientReminderBasic
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

class PatientReminder extends Component {
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
            { name: 'scope', label: 'Reminder Share With', width: 250, customBodyRender: (value, rowData) => this.customShareWith('scope', value, rowData) },
            { name: 'remark', label: 'Details', customBodyRender: (value, rowData) => this.customDetails('remark', value, rowData) },
            { name: 'action', label: 'Action', width: 110, align: 'center', customBodyRender: this.customAction }
        ];
        return rows;
    }

    findCurColunmErrObjIdx = (name, seq) => {
        const { errorMessageList } = this.state;
        let curColunmErrObjIdx = -1;
        let curFieldErrorMsgList = errorMessageList.filter(item => item.name === name);
        if (curFieldErrorMsgList.length > 0) {
            let result = curFieldErrorMsgList.find(item => item.seq === seq);
            if (result) {
                curColunmErrObjIdx = result.idx;
            }
        }
        return curColunmErrObjIdx;
    }

    textFieldOnBlur = (name, seq) => {
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
    }

    removeErrMsg = (name, seq) => {
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);
        let tempErrMsgList = this.state.errorMessageList;
        if (curColumnObjIdx > -1) {
            tempErrMsgList.splice(curColumnObjIdx, 1);
            this.setState({ errorMessageList: tempErrMsgList });
        }
    }

    validAllInputs = () => {
        let { errorMessageList } = this.state;
        const { patientReminderList } = this.props;
        let newpatientReminderList = patientReminderList.filter(item => item.statusCd !== 'D');
        newpatientReminderList.forEach(rec => {
                const newPatientReminder=_.cloneDeep(patientReminderBasic);
                for(let fieldName in newPatientReminder){
                if (fieldName === 'scope' || fieldName === 'remark') {
                    // if (rec[fieldName] === ''||rec[fieldName] === null||!rec[fieldName]) {
                        if(!rec[fieldName]){
                        let curColunmErrObjIdx = this.findCurColunmErrObjIdx(fieldName, rec.seq);
                        if (curColunmErrObjIdx === -1 && rec.isEmpty === false) {
                            // let idx = errorMessageList.length;
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
            errList.sort((a, b) => a.seq - b.seq);
            let name = errList[0].name;
            let seq = errList[0].seq;
            if (name === 'scope') {
                if (this[`${name}_${seq}`]){
                    this[`${name}_${seq}`].select.focus();
                }
            }
            if (name === 'remark') {
                if (this[`${name}_${seq}`]) {
                    this[`${name}_${seq}`].focus();
                }
            }
        }
    }

    customShareWith = (name, value, rowData) => {
        const { classes, comDisabled, id } = this.props;
        const seq = rowData.seq;
        const { errorMessageList } = this.state;
        const type = 'selectField';

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
                        id={`${id}_share_with_select_field_${seq}`}
                        // id={'b'}
                        options={Enum.SHARE_WITH_LIST &&
                            Enum.SHARE_WITH_LIST.map((item) => (
                                { value: item.code, label: item.label }
                            ))}
                        TextFieldProps={{
                            variant: 'outlined',
                            // label: 'Status'
                            error: curColumnObj !== null
                        }}
                        isDisabled={comDisabled || rowData.codMsgTypeId}
                        onChange={(e) => this.handleChange(name, e.value, seq, type)}
                        value={value}
                        addNullOption={rowData.remark ? false : true}
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

    customDetails = (name, value, rowData) => {
        const { comDisabled, id, classes } = this.props;
        const seq = rowData.seq;
        const { errorMessageList } = this.state;
        const type = 'textField';
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);
        let curColumnObj = null;
        if (curColumnObjIdx > -1) {
            curColumnObj = errorMessageList.find(item => item.idx === curColumnObjIdx);
        }
        return (
            <Grid item container className={curColumnObj && curColumnObj != null ? classes.customBodyColum : null}>
                <Grid item container className={curColumnObj && curColumnObj != null ? classes.customCmp : null}>
                    <FastTextField
                        id={`${id}_details_textField_${seq}`}
                        value={value}
                        disabled={comDisabled || rowData.codMsgTypeId}
                        variant={'outlined'}
                        inputProps={{ maxLength: 500 }}
                        inputRef={r => this[`${name}_${seq}`] = r}
                        // onChange={(e) => this.handleChange(name, e.target.value, seq, type)}
                        onBlur={e => {
                            this.handleChange(name, e.target.value, seq, type);
                            this.textFieldOnBlur(name, seq);
                        }}
                        error={curColumnObj !== null}
                        calActualLength
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

    disableRemoveReminderBtn = (patientReminderList) => {
        if (patientReminderList.length === 1) {
            let reminder = patientReminderList[0];
            if (reminder.scope === Enum.SHARE_WITH_LIST[0].code) {
                if (!reminder.remark) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    customAction = (value, rowData) => {
        // let isFutureAppt = AppointmentUtilties.isFutureAppointment(rowData);
        const { classes, comDisabled, id, patientReminderList } = this.props;
        const seq = rowData.seq;
        let isLastRec = false;
        if (rowData.seq === patientReminderList.length - 1) {
            isLastRec = true;
        }
        return (
            <Grid item container direction={'row'} style={{ margin: 'auto 10px' }}>
                {
                    <Grid item>
                        <IconButton
                            id={`${id}_remove_remind_rec_button_${seq}`}
                            className={classes.iconButton}
                            // color="primary"
                            onClick={e => this.openDialog(e, seq)}
                            // disabled={comDisabled === false ? contactPersonList.length === 0 : true}
                            color="secondary"
                            disabled={comDisabled || rowData.codMsgTypeId || this.disableRemoveReminderBtn(patientReminderList)}
                        >
                            <RemoveCircle />
                        </IconButton>
                    </Grid>
                }

                {
                    isLastRec ? <Grid item>
                        <IconButton
                            id={`${id}_add_reminder_rec_button_${seq}`}
                            className={classes.iconButton}
                            color="primary"
                            onClick={this.addReminderRec}
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

    handleChange = (name, value, seq, type) => {
        let newReminderList = _.cloneDeep(this.props.patientReminderList);
        let curColumnObjIdx = this.findCurColunmErrObjIdx(name, seq);

        if (type !== 'textField') {
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

        newReminderList[seq][name] = value;
        // if (newReminderList[seq]['scope'] === 'A' && newReminderList[seq]['remark'] === '') {
        if(!newReminderList[seq]['scope']&&!newReminderList[seq]['remark']){
            newReminderList[seq]['isEmpty'] = true;
            let newErrMsgList = this.state.errorMessageList.filter(item => item.seq !== seq);
            this.setState({ errorMessageList: newErrMsgList });
        }
        else {
            newReminderList[seq]['isEmpty'] = false;
        }
        this.props.handleChangeReminderList(newReminderList);

    }

    addReminderRec = () => {
        let newReminderList = _.cloneDeep(this.props.patientReminderList);
        let newReminderRec = RegUtil.initNewPatientReminderRec();
        const lastRec = newReminderList.slice(-1);
        newReminderRec.seq = lastRec[0].seq + 1;
        newReminderList.push(newReminderRec);
        this.props.handleChangeReminderList(newReminderList);
    }

    openDialog = (e, seq) => {
        const { patientReminderList } = this.props;
        this.props.openCommonMessage({
            msgCode: '110105',
            btnActions: {
                btn1Click: () => {
                    if (patientReminderList.length > 1) {
                        this.removeReminderRec(seq);
                    } else {
                        this.clearReminderRec();
                    }
                }
            }
        });
    }

    clearReminderRec = () => {
        let newReminderList = [];
        let newReminderRec = RegUtil.initNewPatientReminderRec();
        newReminderList.push(_.cloneDeep(newReminderRec));
        this.props.handleChangeReminderList(newReminderList);
    }

    removeReminderRec = (seq) => {
        let newReminderList = _.cloneDeep(this.props.patientReminderList);
        for (let idx = seq; idx < newReminderList.length; idx++) {
            newReminderList[idx].seq--;
        }
        this.popErrMsg(seq, false);
        newReminderList.splice(seq, 1);
        this.props.handleChangeReminderList(newReminderList);
    }

    clearErrorMsg = () => {
        this.setState({ errorMessageList: [] });
    }

    popErrMsg = (seq) => {
        let removeCount = this.state.errorMessageList.filter(item => item.seq === seq);
        let newErrMsgList = this.state.errorMessageList.filter(item => item.seq !== seq);

        if (newErrMsgList.length > 0) {
            newErrMsgList.forEach(errMsg => {
                if (errMsg.seq > seq) {
                    // errMsg.seq -= 1;
                    errMsg.idx = errMsg.idx - removeCount.length;

                    errMsg.seq -= 1;

                }
            });
        }
        this.setState({ errorMessageList: newErrMsgList });
    }

    render() {
        const { classes, id, patientReminderList } = this.props;
        return (
            <Grid item xs={12}>
                <ExpansionPanel
                    square
                    expanded={this.state.expanded}
                    onChange={(...args) => this.handleExpanChange(...args)}
                >
                    <ExpansionPanelSummary
                        aria-controls="panel1d-content"
                        id={`${id}_panel1d-header`}
                    >
                        <IconButton
                            // id={id + '_correspondenceAddress_btn'}
                            id={`${id}_expansion_panel_expand_collpase_button`}
                            className={classes.close_icon}
                            color={'primary'}
                            fontSize="small"
                        >
                            {this.state.expanded ? <Remove /> : <Add />}
                            <b>Patient Reminder</b>
                        </IconButton>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <AutoScrollTable
                            id={`${id}_patient_reminder_table`}
                            columns={this.state.tableRows}
                            // store={dummyData}
                            store={patientReminderList}
                            // store={newPatientRemindList}
                            classes={{
                                container: classes.customTableContainer
                            }}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>

        );
    }
}

export default withStyles(styles)(PatientReminder);
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
import * as CommmonUtilities from '../../../../utilities/commonUtilities';
import _ from 'lodash';
import * as RegUtil from '../../../../utilities/registrationUtilities';
import CommonMessage from '../../../../constants/commonMessage';
import FastTextField from '../../../../components/TextField/FastTextField';
import CIMSSelect from '../../../../components/Select/CIMSSelect';
import {
    paperBasedRecordBasic
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
    errorFieldNameText: {
        fontSize: '12px',
        wordBreak: 'break-word',
        whiteSpace: 'pre-line',
        color: '#fd0000'
    },
    customBodyColum: {
        height: 80,
        overflowY: 'auto'
    },
    customCmp: {
        position: 'relative',
        height: 50,
        top: '50%',
        marginTop: '-20px' //it should be -25px,

    },
    customErrorBorder: {
        borderColor: '#fd0000'
    },
    customErrorMsg: {
        // position: 'relative',
        // top: 30
        marginTop: 25,
        padding: '5px 14px'
    }
});

class PaperBasedRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            tableRows: this.genTableRows(),
            errorMessageList: [],
            removedSeq: -1
        };
    }

    handleExpanChange = (e, isExpanded) => {
        this.setState({
            expanded: isExpanded ? isExpanded : false
        });
    }

    handleChange = (name, value, seq, type) => {
        let newPaperBasedRecList = _.cloneDeep(this.props.paperBasedRecordList);
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
        newPaperBasedRecList[seq][name] = value;

        let fieldCount = 0;
        for (let p in newPaperBasedRecList[seq]) {
            if (p === 'clinicCd' || p === 'recId') {
                if(newPaperBasedRecList[seq][p]){
                    fieldCount++;
                }
            }
        }
        if (fieldCount > 0) {
            newPaperBasedRecList[seq]['isEmpty'] = false;
        }
        else {
            newPaperBasedRecList[seq]['isEmpty'] = true;
            // this.popErrMsg(seq, false);
            let newErrMsgList = this.state.errorMessageList.filter(item => item.seq !== seq);
            this.setState({ errorMessageList: newErrMsgList });
        }
        this.props.handleChangePaperBasedRec(newPaperBasedRecList);

    }

    genTableRows = () => {
        let customService = (value, rowData) => {
            const { serviceList } = this.props;
            return CommmonUtilities.getServiceNameByServiceCd(value, serviceList);
        };

        let rows = [
            { name: 'serviceCd', label: 'Service', fontSize: '12pt', customBodyRender: customService },
            { name: 'clinicCd', label: 'Clinic', customBodyRender: (value, rowData) => this.customClinc('clinicCd', value, rowData) },
            { name: 'recId', label: 'Record ID', customBodyRender: (value, rowData) => this.customRecordId('recId', value, rowData) },
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
        const { paperBasedRecordList } = this.props;
        let newPaperBasedRecList = paperBasedRecordList.filter(item => item.statusCd !== 'D');

        newPaperBasedRecList.forEach(rec => {
            const newPaperBasedRec = _.cloneDeep(paperBasedRecordBasic);
            for (let fieldName in newPaperBasedRec) {
                if (fieldName === 'clinicCd' || fieldName === 'recId') {
                    if (!rec[fieldName]) {
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
            if (name === 'clinicCd') {
                if (this[`${name}_${seq}`]) {
                    this[`${name}_${seq}`].select.focus();
                }
            }
            if (name === 'recId') {
                if (this[`${name}_${seq}`]) {
                    this[`${name}_${seq}`].focus();
                }
            }
        }
    }

    customClinc = (name, value, rowData) => {
        const { id, comDisabled, clinicList, classes } = this.props;
        const seq = rowData.seq;
        const { errorMessageList } = this.state;
        const type = 'selectField';
        let avaliClinicList = clinicList && clinicList.filter(item => item.serviceCd === rowData.serviceCd);
        avaliClinicList.sort((a, b) => {
            return a.clinicName.localeCompare(b.clinicName);
        });
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
                        id={`${id}_clinic_textField_${seq}`}
                        options={avaliClinicList &&
                            avaliClinicList.map((item) => (
                                { value: item.clinicCd, label: item.clinicName }
                            ))}
                        TextFieldProps={{
                            variant: 'outlined',
                            error: curColumnObj !== null
                            // label: 'Status'
                        }}
                        isDisabled={comDisabled}
                        onChange={(e) => this.handleChange(name, e.value, seq, type)}
                        value={value}
                        addNullOption={rowData.recId ? false : true}
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
    };

    customRecordId = (name, value, rowData) => {

        const { id, comDisabled, classes } = this.props;
        const { errorMessageList } = this.state;
        const seq = rowData.seq;
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
                        id={`${id}_record_id_textField_${seq}`}
                        value={rowData.recId}
                        disabled={comDisabled}
                        variant={'outlined'}
                        inputProps={{
                            maxLength: 50
                        }}
                        inputRef={r => this[`${name}_${seq}`] = r}
                        error={curColumnObj !== null}
                        // onChange={(e) => this.handleChange('recId', e.target.value, seq, type)}
                        onBlur={e => {
                            this.handleChange('recId', e.target.value, seq, type);
                            this.textFieldOnBlur(name, seq);
                        }}
                        noChinese
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

    disableRemovePaperBasedRecBtn = (paperBasedRecordList) => {
        if (paperBasedRecordList.length === 1) {
            let paperBasedRec = paperBasedRecordList[0];
            if (!paperBasedRec.clinicCd && !paperBasedRec.recId) {
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

        const { classes, comDisabled, id, paperBasedRecordList } = this.props;
        const seq = rowData.seq;
        let isLastRec = false;
        if (rowData.seq === paperBasedRecordList.length - 1) {
            isLastRec = true;
        }
        return (
            <Grid item container direction={'row'} style={{ margin: 'auto 10px' }}>
                {
                    <Grid item>
                        <IconButton
                            id={`${id}_remove_paper_based_record_button_${seq}`}
                            className={classes.iconButton}
                            // color="primary"
                            onClick={e => this.openDialog(e, seq)}
                            // disabled={comDisabled === false ? contactPersonList.length === 0 : true}
                            color="secondary"
                            disabled={comDisabled || this.disableRemovePaperBasedRecBtn(paperBasedRecordList)}
                        >
                            <RemoveCircle />
                        </IconButton>
                    </Grid>
                }
                {
                    isLastRec ?
                        <Grid item>
                            <IconButton
                                id={`${id}_add_paper_based_record_button_${seq}`}
                                className={classes.iconButton}
                                color="primary"
                                onClick={this.addPaperBasedRec}
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

    addPaperBasedRec = () => {
        const { service } = this.props;
        let newPaperBasedRecList = _.cloneDeep(this.props.paperBasedRecordList);
        let newPaperBasedRec = RegUtil.initNewPaperBasedRec(service.serviceCd);
        const lastRec = newPaperBasedRecList.slice(-1);
        newPaperBasedRec.seq = lastRec[0].seq + 1;
        newPaperBasedRecList.push(newPaperBasedRec);
        this.props.handleChangePaperBasedRec(newPaperBasedRecList);
    }
    openDialog = (e, seq) => {
        const { paperBasedRecordList } = this.props;
        this.props.openCommonMessage({
            msgCode: '110105',
            btnActions: {
                btn1Click: () => {
                    if (paperBasedRecordList.length > 1) {
                        this.removePaperBasedRec(seq);
                    } else {
                        this.clearPaperBasedRec();
                    }
                }
            }
        });
    }

    clearPaperBasedRec = () => {
        let newPaperBasedRecList = [];
        const { service } = this.props;
        let newPaperBasedRec = RegUtil.initNewPaperBasedRec(service.serviceCd);
        newPaperBasedRecList.push(_.cloneDeep(newPaperBasedRec));
        this.props.handleChangePaperBasedRec(newPaperBasedRecList);
    }

    removePaperBasedRec = (seq) => {
        // this.props.openCommonCircular();
        let removeCount = this.state.errorMessageList.filter(item => item.seq === seq);
        let newPaperBasedRecList = _.cloneDeep(this.props.paperBasedRecordList);
        // let removedErrMsg=newPaperBasedRecList.find(item=>item)

        let newErrMsgList = this.state.errorMessageList.filter(item => item.seq !== seq);


        for (let idx = seq; idx < newPaperBasedRecList.length; idx++) {
            newPaperBasedRecList[idx].seq--;
        }

        newPaperBasedRecList.splice(seq, 1);


        this.props.handleChangePaperBasedRec(newPaperBasedRecList);

        if (newErrMsgList.length > 0) {
            newErrMsgList.forEach(errMsg => {
                if (errMsg.seq > seq) {
                    errMsg.seq -= 1;
                    errMsg.idx = errMsg.idx - removeCount.length;
                }
            });
        }
        this.setState({ errorMessageList: newErrMsgList });
    }

    clearErrorMsg = () => {
        this.setState({ errorMessageList: [] });
    }

    render() {
        const { classes, id, paperBasedRecordList } = this.props;
        return (
            <Grid item xs={12}>
                <ExpansionPanel
                    square
                    expanded={this.state.expanded}
                    onChange={(...args) => this.handleExpanChange(...args)}
                >
                    <ExpansionPanelSummary
                        aria-controls="panel1d-content"
                        id={`${id}_expansion_panel_summary`}
                    >
                        <IconButton
                            id={`${id}_expansion_panel_expand_collpase_button`}
                            className={classes.close_icon}
                            color={'primary'}
                            fontSize="small"
                        >
                            {this.state.expanded ? <Remove /> : <Add />}
                            <b>Paper-Based Record</b>
                        </IconButton>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <AutoScrollTable
                            id={`${id}_paper_based_record_table`}
                            columns={this.state.tableRows}
                            // store={newPaperBasedRecList}
                            store={paperBasedRecordList}
                            // store={dummyData}
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

export default withStyles(styles)(PaperBasedRecord);
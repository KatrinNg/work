import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import _ from 'lodash';

import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';

import 'date-fns';

import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import TimeFieldValidator from '../../../../components/FormValidator/TimeFieldValidator';
import RadioFieldValidator from '../../../../components/FormValidator/RadioFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import DelayInput from '../../../compontent/delayInput';

import Enum from '../../../../enums/enum';
import { contactHistoryAction as contactHistoryActionEnum } from '../../../../enums/dts/appointment/contactHistoryActionEnum';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = ({
    root: {
        margin: '1px auto auto auto',
        width: '100%',
        'border-radius': '0px',
        border: '0px'
    },
    label: {
        marginTop: '0px',
        marginLeft: '0px',
        paddingTop: '5px',
        width: '30%',
        fontWeight: '600',
        fontSize: '10pt',
        position: 'relative',
        backgroundColor: '#ffffff',
        boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)'
    },
    option: {
        width: '100%'
    },
    colTitle: {
        textAlign: 'left',
        borderStyle: 'none',
        fontWeight: 'bold',
        padding: '10px'
    }, colLabel: {
        textAlign: 'left',
        fontWeight: 'bold'
    },
    colDetailLabel: {
        textAlign: 'left',
        padding: '10px 10px 10px 0px'

    },
    session: {
        width: '90%',
        margin: 'auto',
        'box-shadow': 'none'
    },
    row: {
        padding: 4,
        height: 45
    },
    row2: {
        width: '100%',
        height: '55px'
    },
    tableBreak: {
        borderBottom: '4px solid black'
    },
    optionRoot: {
    },
    phonelistRoot:{
    },
    optionLabel: {
        //        fontSize: '10pt'
    },
    radioButton: {
        padding: '2px'
    },
    radioGroup: {
        display: 'flex'
    },
    contactTime: {
        width: '80px'
    },
    link: {
        marginRight: '8px'
    },
    invisible: {
        display: 'none'
    },
    paper: {
        height: '30px',
        width: '300px'
    },
    divRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 40
    }
});

class DtsContactHistoryTel extends Component {

    state = {
        selectedPhoneNo: '',
        status: '',
        note: ''
    };

    componentDidUpdate = (preProps) => {
        console.log(this.props);
        // console.log(contactHistoryInfo);
        if (this.props.contactHistoryInfo) {
            if (preProps.contactHistoryInfo != this.props.contactHistoryInfo) {
                this.setState({
                    selectedPhoneNo: this.props.contactHistoryInfo.tel
                });
            }
        }
    }
    phoneNumberOnClick = tel => {
        this.props.updateContHistState({ tel }, true);
    }

    onPhoneChange = e => {
        this.props.updateContHistState({ tel: e.target.value }, true);
        this.setState({ selectedPhoneNo: e.target.value });
    }

    handleContactDateFieldChange = NotificationDate => {
        this.props.updateContHistState({ NotificationDate }, true);
    }

    handleContactTimeChange = NotificationTime => {
        this.props.updateContHistState({ NotificationTime }, true);
    }

    handleContactStatusChange = e => {
        if (!this.props.contactHistoryInfo.id) {
            const note = (e.target.value == 'S' ? this.props.contactHistoryTelNotesListSucceed : this.props.contactHistoryTelNotesListFailed)?.[0]?.remark;
            this.props.updateContHistState({ status: e.target.value, note }, true);
        } else {
            this.props.updateContHistState({ status: e.target.value }, true);
        }
    }

    onNoteChange = e => {
        this.props.updateContHistState({ note: e.target.value }, true);
        this.setState({ note: e.target.value });
    }

    noteOnClick = note => {
        this.props.updateContHistState({ note }, true);
    }

    returnContactHistoryStatus = (status) => {
        let contactHistoryStatus;

        if (status == 'S') {
            contactHistoryStatus = 'Succeed';
        } else {
            contactHistoryStatus = 'Failed';
        }

        return contactHistoryStatus;
    }

    getPatientPhoneList = (phoneList) => {
        let tempPhoneList = [];
        phoneList.map(
            (phoneListItem, index) => {
                let displayPhoneNumber = phoneListItem.phoneNumber;
                tempPhoneList.push({ 'label': displayPhoneNumber, 'value': displayPhoneNumber });
                return (
                    tempPhoneList
                );
            }
        );
        return tempPhoneList;
    }

    getNoteList = (contactHistoryInfo) => {
        let tempNoteList = [];
        (contactHistoryInfo.status == 'S' ? this.props.contactHistoryTelNotesListSucceed : this.props.contactHistoryTelNotesListFailed)
            .map(
                (contactHistoryTelNotesItem, index) => {
                    tempNoteList.push({ 'label': contactHistoryTelNotesItem.remark, 'value': contactHistoryTelNotesItem.remark });
                    return (
                        // <Link style={{ display: 'inline' }} key={'notesLink' + index} className={classes.link}
                        //     onClick={() => this.noteOnClick(contactHistoryTelNotesItem.remark)}
                        // >
                        //     {contactHistoryTelNotesItem.remark}
                        // </Link>
                        tempNoteList
                    );
                }
            );
        return tempNoteList;
    }
    render() {
        const { classes, contactHistoryTelNotesListSucceed, contactHistoryTelNotesListFailed, appointment, contactHistoryInfo, contactHistoryAction } = this.props;

        return (
            <Grid container className={classes.root}>
                <Grid container spacing={0}>
                    <div className={contactHistoryAction == contactHistoryActionEnum.VIEW ? classes.invisible : classes.divRow}>
                        {/* 1st row */}
                        {/* <Grid item xs={2}>
                            &nbsp;
                        </Grid> */}
                        <Grid item xs={2} className={classes.row}>
                            <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Phone List:</Paper>
                        </Grid>
                        <Grid item xs={10} style={{paddingLeft:1}}>

                            {(!_.isEmpty(appointment.patientDto.phoneList)) ? (
                                <RadioFieldValidator
                                    isRequired
                                    value={this.state.selectedPhoneNo}
                                    onChange={this.onPhoneChange}
                                    list={this.getPatientPhoneList(appointment.patientDto.phoneList)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{ className: classes.radioGroup }}
                                    RadioProps={{ classes: { root: classes.phonelistRoot } }}
                                />
                                // appointment.patientDto.phoneList.map(
                                //     (phoneListItem, index) => {
                                //         let displayPhoneNumber = phoneListItem.phoneNumber;
                                //         let tempPhoneList = [];
                                //         tempPhoneList.push({ 'label': displayPhoneNumber, 'value': displayPhoneNumber });
                                //         return (
                                //             // <Link  key={'telLink'+index} className={classes.link}
                                //             //     onClick={() => {this.phoneNumberOnClick(displayPhoneNumber);}}
                                //             // >{displayPhoneNumber}
                                //             // </Link>
                                //             tempPhoneList
                                //         );
                                //     }
                                // )
                            ) : (
                                    <Paper elevation={0} className={classes.colDetailLabel}>This patient has no phone number in record.</Paper>
                                )
                            }
                        </Grid>
                    </div>
                    {/* 2nd row */}
                    <Grid item xs={2} className={classes.row}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Contact:</Paper>
                        {/* &nbsp; */}
                    </Grid>

                    <Grid item xs={10} className={classes.row}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper elevation={0} className={classes.colDetailLabel}>{this.props.contactHistoryInfo.tel}</Paper> :
                            <DelayInput
                                id={'phoneNumberInput'}
                                variant="outlined"
                                InputProps={{
                                    style: {
                                        width: '277px'
                                    }
                                }}
                                value={contactHistoryInfo.tel}
                                onChange={this.onPhoneChange}
                                isRequired
                                label={<>Selected Phone No.<RequiredIcon /></>}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                msgPosition="bottom"
                            />
                        }
                    </Grid>

                    {/* 3rd row */}
                    <Grid item xs={2} className={classes.row}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Contact Time:</Paper>
                    </Grid>
                    <Grid item xs={2} className={classes.row}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper elevation={0} className={classes.colDetailLabel}>{(this.props.contactHistoryInfo.NotificationDate ? this.props.contactHistoryInfo.NotificationDate.format('YYYY-MM-DD HH:mm') : '')}</Paper> :
                            <DateFieldValidator
                                label={<>{DTS_DATE_DISPLAY_FORMAT}<RequiredIcon /></>}
                                isRequired
                                style={{ width: 'inherit' }}
                                id={'dtsContactHistoryTel_notificationDate'}
                                format={DTS_DATE_DISPLAY_FORMAT}
                                value={contactHistoryInfo.NotificationDate}
                                placeholder=""
                                onChange={this.handleContactDateFieldChange}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                msgPosition="bottom"
                            />
                        }
                    </Grid>
                    <Grid item xs={2} className={classes.row}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? '' :
                            <TimeFieldValidator
                                label={<>HH:mm<RequiredIcon /></>}
                                isRequired
                                id={'dtsContactHistoryTel_notificationTime'}
                                helperText=""
                                format={'HH:mm'}
                                value={contactHistoryInfo.NotificationTime}
                                placeholder=""
                                onChange={this.handleContactTimeChange}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                msgPosition="bottom"
                            //                                disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                            />
                        }
                    </Grid>
                    <Grid item xs={6}>
                        &nbsp;
                    </Grid>
                    <Grid item xs={2} className={classes.row}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Caller Name:</Paper>
                    </Grid>
                    <Grid item xs={4} className={classes.row}>
                        <Paper elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.callerName}</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        &nbsp;
                    </Grid>
                    {/* 4th row */}
                    <Grid item xs={2} className={classes.row}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Contact Status:</Paper>
                    </Grid>
                    <Grid item xs={10} className={classes.row}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo.status == '' ? '' : this.returnContactHistoryStatus(contactHistoryInfo.status))}</Paper> :
                            <RadioFieldValidator
                                isRequired
                                value={contactHistoryInfo.status === 'S' ? 'S' : 'F'}
                                onChange={this.handleContactStatusChange}
                                list={[
                                    { label: <>Success<RequiredIcon/></>, value: 'S' },
                                    { label: <>Failed<RequiredIcon/></>, value: 'F' }
                                ]}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                RadioGroupProps={{ className: classes.radioGroup }}
                                RadioProps={{ classes: { root: classes.optionRoot } }}
                            />
                        }
                    </Grid>
                    {/* <Grid item xs={8}>
                        &nbsp;
                    </Grid> */}
                    {/* 5th row */}
                    {/* <div className={contactHistoryAction == contactHistoryActionEnum.VIEW ? classes.invisible : classes.divRow}> */}
                    <Grid item xs={2} className={contactHistoryAction == contactHistoryActionEnum.VIEW ? classes.invisible : classes.row}>
                        <Paper elevation={0} className={classes.colTitle + ' ' + classes.colLabel}>Notes:</Paper>
                    </Grid>
                    <Grid item xs={10} className={contactHistoryAction == contactHistoryActionEnum.VIEW ? classes.invisible : classes.row}>
                        <RadioFieldValidator
                            isRequired
                            value={this.state.note}
                            onChange={this.onNoteChange}
                            list={this.getNoteList(this.props.contactHistoryInfo)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            RadioGroupProps={{ className: classes.radioGroup }}
                            RadioProps={{ classes: { root: classes.optionRoot } }}
                        />
                        {/* {(contactHistoryInfo.status == 'S' ? contactHistoryTelNotesListSucceed : contactHistoryTelNotesListFailed)
                                .map(
                                    (contactHistoryTelNotesItem, index) => {
                                        return (
                                            <Link style={{ display: 'inline' }} key={'notesLink' + index} className={classes.link}
                                                onClick={() => this.noteOnClick(contactHistoryTelNotesItem.remark)}
                                            >
                                                {contactHistoryTelNotesItem.remark}
                                            </Link>
                                        );
                                    }
                                )
                            } */}
                    </Grid>
                    {/* </div> */}
                    {/* 6th row */}
                    <Grid item xs={2}>
                        &nbsp;
                    </Grid>
                    <Grid item xs={10} style={{padding:4}}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper elevation={0} className={classes.colDetailLabel}>{this.props.contactHistoryInfo.note}</Paper> :
                            <DelayInput
                                id={'notesTextField'}
                                label={'Notes'}
                                multiline
                                rows={3}
                                value={contactHistoryInfo.note}
                                onChange={this.onNoteChange}
                            />
                        }
                    </Grid>

                </Grid>

            </Grid>
        );
    }
}

export default withStyles(styles)(DtsContactHistoryTel);

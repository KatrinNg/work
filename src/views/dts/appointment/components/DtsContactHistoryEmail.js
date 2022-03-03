import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';

import { FormControl, Grid, Paper } from '@material-ui/core';

// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import DelayInput from '../../../compontent/delayInput';

import moment from 'moment';
import { connect } from 'react-redux';
import Enum from '../../../../enums/enum';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { contactHistoryAction as contactHistoryActionEnum } from '../../../../enums/dts/appointment/contactHistoryActionEnum';
import { contactHistoryStatus as contactHistoryStatusList } from '../../../../enums/dts/appointment/contactHistoryStatusEnum';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = ({
    root: {
        margin: '1px auto auto auto',
        width: '100%',
        border: '0px',
        padding: 4
    },
    label:{
        marginTop:'0px',
        marginLeft:'0px',
        paddingTop:'5px',
        width: '30%',
        fontWeight: '600',
        fontSize: '10pt',
        position: 'relative',
        backgroundColor:'#ffffff',
        boxShadow:'0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)'
    },
    option:{
        width: '100%'
    },
    colTitle:{
        textAlign: 'left',
        borderStyle: 'none',
        fontWeight: 'bold',
        padding: '10px'
    },
    colLabel:{
        textAlign: 'left',
        fontWeight: 'bold'
    },
    colDetailLabel: {
        textAlign: 'left',
        padding: '10px 10px 10px 0px'
    },
    row:{
        width:'100%'
    },
    applDatePicker:{
        width: '20%'
        // margin: '8px'
    },
    subjectTextField:{
        width: '70%'
    },
    contentTextField:{
        width: '70%',
        marginBottom: '10px'
    },
    notesTextField:{
        readonly: false,
        width: '70%'
    }
});

class DtsContactHistoryEmail extends Component {

    state = {
        selectedEmailTemplate: null
    };

    static getDerivedStateFromProps(props, state) {
        if(!props.contactHistoryInfo?.hasEdit) {
          return { selectedEmailTemplate: null };
        }
    }


    handleDateChange = (value) => {
        this.props.updateContHistState({ NotificationDate: moment(value) }, true);
    };

    handleEmailTemplateOnChange =(value, patientName) =>{
        this.setState({selectedEmailTemplate: value});
        this.props.updateContHistState(
            {
                subject: value.tmplSubj,
                message: this.convertTemplateSub(value.tmplMsg, dtsUtilities.getPatientName(patientName))
            }, true
        );
    }

    convertTemplateSub = (templateMsg, patientName) => {
        let siteEmailAddr =this.props.selectedClinic.emailAddr;
        if(siteEmailAddr){
            templateMsg = templateMsg.replace('{clinic_email_info}', '電郵 Email : ' + siteEmailAddr + ' "\n" 請注意 : 電郵將於五個工作天內回覆。 (只供預約或更改排期使用) "\n" Note : Email will be replied within 5 working days. (For booking or rescheduling appointments only) "\n"');
        }else{
            templateMsg = templateMsg.replace('{clinic_email_info}', '');
        }
        templateMsg = templateMsg.replace('{rmnd_chi_name} {rmnd_eng_name}', patientName);
        return templateMsg;
    }

    onNoteChange = (e) =>{
        this.props.updateContHistState({ note: e.target.value }, true);
    }

    onSubjectChange = (e) =>{
        this.props.updateContHistState({ subject: e.target.value }, true);
    }

    onContentChange = (e) =>{
        this.props.updateContHistState({ message: e.target.value }, true);
    }

    render(){
        const { classes, appointment, contactHistoryAction, reminderTemplateEmail, contactHistoryInfo } = this.props;

        return(
            <Grid container className={classes.root}>
                <Grid container spacing={0}>
                        <Grid item xs={2}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Email Address:</Paper>
                        </Grid>
                        <Grid item xs={10}>
                            <Paper  elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.email}</Paper>
                        </Grid>

                        <Grid item xs={2}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Schedule Date:</Paper>
                        </Grid>
                        <Grid item xs={10}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo.NotificationDate ? this.props.contactHistoryInfo.NotificationDate.format(DTS_DATE_DISPLAY_FORMAT) : '')}</Paper> :
                                    <FormControl className={classes.applDatePicker}>
                                        <DateFieldValidator
                                            id={'calendarDetailDate'}
                                            label={<>{DTS_DATE_DISPLAY_FORMAT}<RequiredIcon /></>}
                                            format={DTS_DATE_DISPLAY_FORMAT}
                                            inputVariant="outlined"
                                            disabled={false}
                                            value={contactHistoryInfo.NotificationDate}
                                            onChange={this.handleDateChange}
                                            isRequired
                                            validByBlur
                                            errorMessages={['Date is required']}
                                        />
                                    </FormControl>
                            }
                        </Grid>

                        <Grid item xs={2}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Sent Date {'&'} Time:</Paper>
                        </Grid>
                        <Grid item xs={4}>
                            {contactHistoryInfo.status == 'P' ? <Paper  elevation={0} className={classes.colDetailLabel}>{contactHistoryStatusList.filter((s) => s.code == 'P')[0].disp}</Paper>:<Paper  elevation={0} className={classes.colDetailLabel}>{moment().format('YYYY-MM-DD HH:mm')}</Paper>}
                        </Grid>

                        <Grid item xs={2}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Contact Status:</Paper>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper  elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.status== 'P'? 'Pending': ''}</Paper>
                        </Grid>

                        <Grid item xs={2}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ?'': <Paper  elevation={0} className={classes.colTitle+' '+classes.colL1bel}>Email Template:</Paper>}
                        </Grid>
                        <Grid item xs={10}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ?
                                <div className={classes.paperGroupItem +' '+classes.selectedEmailTemplate}></div>
                                :
                                <div className={classes.paperGroupItem +' '+classes.selectedEmailTemplate}>
                                    <DtsSelectFieldValidator
                                        id={'selectedEmailTemplate'}
                                        isDisabled={false}
                                        isRequired
                                        TextFieldProps={{
                                                    variant: 'outlined',
                                                    style: { width: '40%' },
                                                    label: <>Email Template </>
                                                }}
                                        options={reminderTemplateEmail && reminderTemplateEmail.map((item) => ({value:item, label:item.name}))}
                                        value={this.state.selectedEmailTemplate}
                                        msgPosition="bottom"
                                        onChange={e => this.handleEmailTemplateOnChange(e.value, appointment.patientDto)}
                                    />
                                </div>
                            }
                        </Grid>

                        <Grid item xs={2}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Subject:
                            {/* {contactHistoryAction == contactHistoryActionEnum.VIEW || <RequiredIcon />} */}
                            </Paper>
                        </Grid>
                        <Grid item xs={10}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo ? contactHistoryInfo.subject: '')}</Paper> :
                                <div className={classes.paperGroupItem +' '+classes.subjectTextField}>
                                    <DelayInput
                                        id="subjectTextField"
                                        label={<>Subject<RequiredIcon/></>}
                                        variant="outlined"
                                        value={contactHistoryInfo.subject}
                                        onChange={this.onSubjectChange}
                                        isRequired
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        msgPosition="bottom"
                                    />
                                </div>
                            }
                        </Grid>

                        <Grid item xs={2}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{}</Paper>:
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Content:
                            {/* {contactHistoryAction == contactHistoryActionEnum.VIEW || <RequiredIcon />} */}
                            </Paper>
                        }
                        </Grid>
                        <Grid item xs={10}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{}</Paper> :
                                <div className={classes.paperGroupItem +' '+classes.contentTextField}>
                                    <DelayInput
                                        id={'contentTextField'}
                                        label={<>Content<RequiredIcon/></>}
                                        disabled={false}
                                        rows={2}
                                        value={contactHistoryInfo.message}
                                        onChange={this.onContentChange}
                                        multiline
                                        isRequired
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        msgPosition="bottom"
                                    />
                                </div>
                            }
                        </Grid>

                        <Grid item xs={2}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Notes:</Paper>
                        </Grid>
                        <Grid item xs={10}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo ? contactHistoryInfo.note: '')}</Paper> :
                                <div className={classes.paperGroupItem +' '+classes.notesTextField}>
                                    <DelayInput
                                        id={'notesTextField'}
                                        label={'Notes'}
                                        disabled={false}
                                        multiline
                                        rows={2}
                                        value={contactHistoryInfo.note}
                                        onChange={this.onNoteChange}
                                    />
                                </div>
                            }
                        </Grid>
                    </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        selectedClinic: state.dtsRemindAppointment.selectedClinic
    };
};

export default connect(mapStateToProps)(withStyles(styles)(DtsContactHistoryEmail));
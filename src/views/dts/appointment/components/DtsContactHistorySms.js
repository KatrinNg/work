import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import _ from 'lodash';

import { FormControl, Paper } from '@material-ui/core';

// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import DelayInput from '../../../compontent/delayInput';

import moment from 'moment';
import { contactHistoryStatus as contactHistoryStatusList } from '../../../../enums/dts/appointment/contactHistoryStatusEnum';
import ValidatorEnum from '../../../../enums/validatorEnum';
import Enum from '../../../../enums/enum';
import CommonMessage from '../../../../constants/commonMessage';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { contactHistoryAction as contactHistoryActionEnum } from '../../../../enums/dts/appointment/contactHistoryActionEnum';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = ({
    root: {
        margin: '1px auto auto auto',
        width: '100%',
        border: '0px'
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
        width:'100%',
        padding:4,
        height:45
    },
    applDatePicker:{
        width: '20%'
        // margin: '8px'
    }
});

class DtsContactHistorySms extends Component {

    state = {
        selectedSMSTemplate: null
    };

    static getDerivedStateFromProps(props, state) {
        if(!props.contactHistoryInfo?.hasEdit) {
          return { selectedSMSTemplate: null };
        }
    }

    showStatusDisp = (status) => {
        let contactHistoryStatus = contactHistoryStatusList.filter((e) => (e.code == status));
        if (contactHistoryStatus && contactHistoryStatus.length > 0){
            return contactHistoryStatus[0].disp;
        }
        else {
            return '';
        }
    }

    handleContactDateFieldChange = (name, value) => {
        let stateData = { ...this.props.contactHistoryInfo };
        stateData[name] = value;
        this.props.updateContHistState({ ...stateData }, true);
    }

    handleSMSTemplateOnChange = (value) =>{
        this.setState({selectedSMSTemplate: value});

        this.updateSMSMessage(value.name, value.tmplMsg);
    }

    updateSMSMessage = (templateName, templateMessage) => {
        let { appointment } = this.props;

        let reminderName = dtsUtilities.getInitial(appointment.patientDto.engGivename) + ' ' + appointment.patientDto.engSurname;
        let appointmentDate = moment(appointment).format('DD/MM/YYYY HH:mm');

        let message = templateMessage;
        message = message.replace('{0}', appointmentDate);
        message = message.replace('{rmnd_name}', reminderName);

        this.props.updateContHistState({ message, note:templateName }, true);
    }

    onNoteChange = (e) => {
        this.props.updateContHistState({ note: e.target.value }, true);
    }

    render(){
        const { classes, contactHistoryAction, reminderTemplateSms, contactHistoryInfo } = this.props;
        return(
            <Grid container className={classes.root}>
                    <Grid container spacing={0}>
                        <Grid item xs={2} className={classes.row}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>SMS Phone No.:</Paper>
                        </Grid>
                        <Grid item xs={10} className={classes.row}>
                            <Paper  elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.tel}</Paper>
                        </Grid>
                        <Grid item xs={2} className={classes.row}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Schedule Date:</Paper>
                        </Grid>
                        <Grid item xs={10} className={classes.row}>
                        {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo.NotificationDate ? this.props.contactHistoryInfo.NotificationDate.format('YYYY-MM-DD HH:mm') : '')}</Paper> :
                            <FormControl className={classes.applDatePicker}>
                                <DateFieldValidator
                                    label={<>{DTS_DATE_DISPLAY_FORMAT}<RequiredIcon /></>}
                                    format={DTS_DATE_DISPLAY_FORMAT}
                                    isRequired
                                    style={{ width: 'inherit' }}
                                    id={'dtsContactHistorySms_notificationDate'}
                                    value={contactHistoryInfo.NotificationDate}
                                    placeholder=""
                                    onChange={e => this.handleContactDateFieldChange('NotificationDate', e)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    msgPosition="bottom"
                                    //disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                />
                            </FormControl>
                        }
                        </Grid>

                        <Grid item xs={2} className={classes.row}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Sent Date &amp; Time:</Paper>
                        </Grid>
                        <Grid item xs={4} className={classes.row}>
                            {contactHistoryInfo.status == 'P' ? <Paper  elevation={0} className={classes.colDetailLabel}>{contactHistoryStatusList.filter((s) => s.code == 'P')[0].disp}</Paper>:<Paper  elevation={0} className={classes.colDetailLabel}>{moment().format('YYYY-MM-DD HH:mm')}</Paper>}
                        </Grid>
                        <Grid item xs={2} className={classes.row}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Contact Status:</Paper>
                        </Grid>
                        <Grid item xs={4} className={classes.row}>
                            {<Paper  elevation={0} className={classes.colDetailLabel}>{(contactHistoryInfo.status == '' ? '' : this.showStatusDisp(contactHistoryInfo.status))}</Paper>}
                        </Grid>
                        <Grid item xs={2} className={classes.row}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>SMS Template:</Paper>
                        </Grid>
                        <Grid item xs={4} className={classes.row}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.note}</Paper>:
                                <DtsSelectFieldValidator
                                    id={'smsTemplateSelect'}
                                    isDisabled={false}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>SMS Template<RequiredIcon /></>
                                    }}
                                    options={reminderTemplateSms && reminderTemplateSms.map((item) => ({value:item, label:item.name}))}
                                    value={this.state.selectedSMSTemplate}
                                    onChange={e => this.handleSMSTemplateOnChange(e.value)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    msgPosition="bottom"
                                />
                            }
                        </Grid>
                        <Grid item xs={6}>&nbsp;</Grid>
                        <Grid item xs={2} className={classes.row}>
                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Note:</Paper>
                        </Grid>
                        <Grid item xs={10} style={{padding:4}}>
                            {contactHistoryAction == contactHistoryActionEnum.VIEW ? <Paper  elevation={0} className={classes.colDetailLabel}>{contactHistoryInfo.message}</Paper>:
                                <DelayInput
                                    className={classes.dailyNoteTextField}
                                    id={'smsNoteTextField'}
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

export default withStyles(styles)(DtsContactHistorySms);
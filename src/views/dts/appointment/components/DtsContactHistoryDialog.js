import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Paper,
    Box,
    Card,
    IconButton,
    DialogContent,
    DialogActions
} from '@material-ui/core';
import {
    ExpandMore,
    Add,
    Remove
} from '@material-ui/icons';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import DtsContactHistoryTel from './DtsContactHistoryTel';
import DtsContactHistorySms from './DtsContactHistorySms';
import DtsContactHistoryEmail from './DtsContactHistoryEmail';
import DtsContactHistoryMail from './DtsContactHistoryMail';
import _ from 'lodash';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';

import {
    getContactHistoryList,
    getReminderTemplate,
    insertContactHistory,
    updateContactHistory,
    //getContactHistoryTelNotesCode,
    resetContactHistory,
    deleteContactHistory
} from '../../../../store/actions/dts/appointment/remindAppointmentAction';

import {
    getAnaCode
} from '../../../../store/actions/dts/dtsCommonAction';

import { contactHistoryAction } from '../../../../enums/dts/appointment/contactHistoryActionEnum';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import Enum from '../../../../enums/enum';
import { contactHistoryType } from '../../../../enums/dts/appointment/contactHistoryTypeEnum';
import {
    DTS_APPT_TEL_CNTCT_HX_NOTES,
    DTS_APPT_MAIL_CNTCT_HX_NOTES
} from '../../../../constants/dts/appointment/DtsContactHistoryConstant';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = {
    root: {
        width: '1400px'
    },

    label: {
        textAlign: 'right',
        fontWeight: 'bold'
    },title: {
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#ccc',
        fontWeight: 'bold',
        borderStyle: 'none'

    },colTitle:{
        textAlign: 'left',
        borderStyle: 'none',
        fontWeight: 'bold',
        padding: '10px'
    },colLabel:{
        textAlign: 'left',
        fontWeight: 'bold'
    },
    colDetailLabel: {
        textAlign: 'left',
        padding: '10px'

    },colDetailLabel2: {
        textAlign: 'left',
        padding: '10px 0px'

    },
    tableCell:{
        //borderStyle: 'none',
        textAlign: 'left',
        fontWeight: 'bold',
        borderStyle: 'none',
        borderBottom: '1px solid rgba(224, 224, 224, 1)'
    },
    textField:{
        width: 150,
        height: 5,
        top: '5px'

    },
    textField2:{
        width: '45px',
        height: '39px',
        top: '5px',
        backgroundColor: '#ccc'
    },paperContainer:{
        //border:'1px solid lightgrey'
        marginBottom:'20px'
    },
    attendanceLabel:{
        color: 'black'
    },
    basicHeader: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        padding:'0px 8px!important'
    },
    basicCell: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        borderStyle: 'none!important',
        borderBottom: '1px solid rgba(224, 224, 224, 1)!important',
        padding:'0px 8px!important'
    },
    funcButton:{
        color:'#5b9bd5',
        cursor:'pointer',
        transform: 'scale(1.5)'
    },
    funcButtonDim:{
        cursor:'default',
        color:'#ccc!important'
    },
    detailTab: {
        marginTop: 8,
        padding:5
    },
    funcIcon:{
        display:'inline-block',
        marginRight: '15px'
    },
    dialogPaper: {
        // maxWidth: '70% !important'
        maxWidth:'1400px'
        // height:'1200px'
    },
    tabLabel:{
        '&:hover':{
            color:'#ffffff'
        }
    },
    contactHistoryTel:{
        padding:5
    }
};

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </Typography>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired
};

const contactHistoryColumnDefs = classes => [
    {
        headerName: 'Type',
        valueGetter: (params) => {
            console.log('params.data.type:' + params.data.type);
            let contactType = Object.values(contactHistoryType).filter(e => e.code === params.data.type);
            if (contactType.length > 0){
                return contactType[0].disp;
            }
            else {
                return '';
            }
        },
        cellClass: classes.basicCell,
        headerClass: classes.basicHeader,
        width: 80
    },
    {
        headerName: 'Contact',
        valueGetter: (params) => (params.data.contact),
        cellClass: classes.basicCell,
        headerClass: classes.basicHeader,
        width: 140
    },
    {
        headerName: 'Contact Date / Time',
        valueGetter: (params) => (moment(params.data.contactDtm).format('YYYY-MM-DD [(]ddd[)] HH:mm')),
        cellClass: classes.basicCell,
        headerClass: classes.basicHeader,
        width: 220
    },
    {
        headerName: 'Caller Name',
        valueGetter: (params) => (params.data.caller ? params.data.caller.engSurname + ' ' + params.data.caller.engGivenName : ''),
        cellClass: classes.basicCell,
        headerClass: classes.basicHeader,
        width: 280
    },
    {
        headerName: 'Notes',
        valueGetter: (params) => (params.data.note),
        cellClass: classes.basicCell,
        headerClass: classes.basicHeader,
        width: 280
    },
    {
        headerName: 'Status',
        valueGetter: (params) => (params.data.status),
        cellClass: classes.basicCell,
        headerClass: classes.basicHeader,
        width: 110
    },
    {
        headerName: 'Schedule Date',
        valueGetter: (params) => (moment(params.data.scheduleDtm).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)),
        cellClass: classes.basicCell,
        headerClass: classes.basicHeader,
        width: 200
    }
];

class DtsContactHistoryDialog extends Component {

    state = {
        contactHistoryListLoaded: false,
        contactHistoryAction: this.props.contactHistoryAction,
        contactHistoryInfo: {},
        contactDetailsTabVal: 0
    };

    componentDidMount(){
        if (this.props.appointment) {
            this.loadContactHistoryList();
        }
        //getAnaCode
        this.props.getAnaCode([{category:DTS_APPT_TEL_CNTCT_HX_NOTES},{category:DTS_APPT_MAIL_CNTCT_HX_NOTES}]);
    }

    contactHistoryColumnDefs = contactHistoryColumnDefs(this.props.classes);

    loadContactHistoryList = () => {
        this.props.getContactHistoryList({appointmentId: this.props.appointment.appointmentId});
        this.setState({contactHistoryListLoaded: true});
    }

    setContactDetailsTabVal = value => {
        if (!this.props.reminderTemplate){
            if (value == 1 // 1: SMS, 2: Email
                || value == 2){
                this.props.getReminderTemplate(this.props.currentClinic.siteId);
            }
        }
        this.setState({ contactDetailsTabVal: value });
    }

    updateContHistState = (updateData, hasEdit = updateData.hasEdit) => {
        this.setState(state => ({ contactHistoryInfo: {...state.contactHistoryInfo, ...updateData, hasEdit} }));
    }

    handleTabChange = (event, newValue) => {
        if (this.state.contactHistoryAction == contactHistoryAction.VIEW || this.state.contactHistoryAction == contactHistoryAction.EDIT){
            return;
        }

        const switchTabAction = () => {
            if (this.state.contactHistoryAction == contactHistoryAction.INSERT){
                switch (newValue) {
                    case 0:{
                        if (!this.initCreateTel(this.props.appointment)){
                            return;
                        }
                        break;
                    }
                    case 1:{
                        if (!this.initCreateSMS(this.props.appointment)){
                            return;
                        }
                        break;
                    }
                    case 2:{
                        if(!this.initCreateEmail(this.props.appointment)){
                            return;
                        }
                        break;
                    }
                    case 3:{
                        if(!this.initCreateMail(this.props.appointment)){
                            return;
                        }
                    }
                }
            }
            this.setContactDetailsTabVal(newValue);
        };

        if (this.state.contactHistoryInfo.hasEdit){
            this.props.openCommonMessage({
                msgCode: '140006',
                btnActions: {
                    btn1Click: () => {
                        switchTabAction();
                    }
                }
            });
        }
        else {
            switchTabAction();
        }
    }
/*
    handleContactHistoryUpdate = () => {
        let { currentSelectedContactInfo, rowData, callerName, NotificationDate,
            NotificationTime, contactType, tel, fax, email, note
        } = this.props.contactHistoryInfo;
        let params = {
            appointmentId: rowData.appointmentId,
            callerName: callerName,
            contactDesc: contactType == 'Tel' ? tel : contactType == 'Fax' ? fax : email,
            contactHistoryId: currentSelectedContactInfo ? currentSelectedContactInfo.contactHistoryId : 0,
            contactType: contactType,
            notes: note,
            notificationDtm: NotificationDate.set({
                hour: NotificationTime.hour(),
                minute: NotificationTime.minute(),
                second: NotificationTime.second()
            }).format(Enum.DATE_FORMAT_EYMMMD_VALUE_24_HOUR),
            statusCd: 'A'
//            ,version: currentSelectedContactInfo ? currentSelectedContactInfo.version : undefined
        };
        const callback = () => {
            this.props.listContatHistory(rowData.appointmentId, () => {
                this.clearContactListSelected();
            });
        };
//        if (currentSelectedContactInfo) {
//            this.props.updateContactHistory(params, callback);
//        } else {
            this.props.insertContactHistory(params, callback);
//        }
    }
*/
    handleOnSubmit = () => {
        let { contactType } = this.state.contactHistoryInfo;
        let reminder = this.convertContactHistoryInfoToApiParams(this.state.contactHistoryInfo, contactType);
        if (this.state.contactHistoryAction === contactHistoryAction.INSERT){
            //console.log('submitzzz:', JSON.stringify(this.props.contactHistoryInfo));
            this.props.insertContactHistory({appointmentId: this.props.appointment.appointmentId, data: reminder}, this.successSubmit);
        }
        else {
            this.props.updateContactHistory({appointmentId: this.props.appointment.appointmentId, data: reminder, contactHistoryId: this.state.contactHistoryInfo.id}, this.successSubmit);
        }
    }

    handleSubmitError = () => {

    }

    successSubmit = () => {
        this.props.resetContactHistory();
        this.loadContactHistoryList();
        this.setState({contactHistoryAction: contactHistoryAction.VIEW});
    }


    handleClose = () => {
/*
        this.props.setPatientKey({patientKey: ''});
        this.props.setSelectedAppointmntTask({selectedAppointmentTask: null});
*/
        if (this.state.contactHistoryInfo.hasEdit){
            this.props.openCommonMessage({
                msgCode: '140008',
                btnActions: {
                    btn1Click: () => {
                        this.props.resetContactHistory();
                        this.props.closeContactHistoryDialog();
                    }
                }
            });
        }
        else {
            this.props.resetContactHistory();
            this.props.closeContactHistoryDialog();
        }

    }

    convertContactHistoryInfoToApiParams = (contactHistoryInfo, contactType) => {
        console.log('submit contactHistoryInfo: ' + JSON.stringify(contactHistoryInfo));
        if (contactType == contactHistoryType.SMS.code || contactType == contactHistoryType.EMAIL.code) {
            return {
                apptRmndId: contactHistoryInfo.id,
	            commMeansCd: contactType,
                schDtm: dtsUtilities.formatDateParameter(contactHistoryInfo.NotificationDate.set({hour: contactHistoryInfo.NotificationTime.get('hour'), minute: contactHistoryInfo.NotificationTime.get('minute')}), 'YYYY-MM-DD HH:mm'),
	            subj: contactHistoryInfo.subject,
	            msg: contactHistoryInfo.message,
	            rqstBy: contactHistoryInfo.callerName,
	            sentBy: contactHistoryInfo.sentBy,
	            sentDtm: dtsUtilities.formatDateParameter(contactHistoryInfo.sentDateTime, 'YYYY-MM-DD HH:mm'),
	            rslt: contactHistoryInfo.result,
	            remark: contactHistoryInfo.note,
	            version: contactHistoryInfo.version,
	            cntctInfo: contactType == contactHistoryType.SMS.code ? contactHistoryInfo.tel : contactHistoryInfo.email,
                apptDtm: dtsUtilities.formatDateParameter(this.props.appointment.appointmentDateTime, 'YYYY-MM-DD HH:mm'),
	            isAdHoc: 1,
	            smsLogId: contactHistoryInfo.smsLogId,
	            status: contactHistoryInfo.status
            };
        }
         else{ //contact type = T or M
             return {
                 contactHistoryId: contactHistoryInfo.id,
                 appointmentId: this.props.appointment.appointmentId,
                 contactType: contactType,
                 contactDesc: contactType == contactHistoryType.TEL.code ? contactHistoryInfo.tel : contactHistoryInfo.address,
                 notificationDtm: dtsUtilities.formatDateParameter(contactHistoryInfo.NotificationDate.set({hour: contactHistoryInfo.NotificationTime.get('hour'), minute: contactHistoryInfo.NotificationTime.get('minute')}), 'YYYY-MMM-DD HH:mm'),
                 //notificationDtm: dtsUtilities.formatDateParameter(contactHistoryInfo.NotificationTime, 'YYYY-MMM-DD HH:mm'),
                 notes: contactHistoryInfo.note,
                 statusCd: contactHistoryInfo.status,
                 version:contactHistoryInfo.version
            };
         }
    }

    initCreateSMS = (appointment) => {
        //console.log('phone list: ' + JSON.stringify(appointment.patientDto.phoneList));
        let mobilePhoneList = appointment.patientDto.phoneList.filter((phn) => (phn.phoneTypeCode == 'M'));
        if (mobilePhoneList && mobilePhoneList.length > 0){
            let updateInfo = {
                id: null,
                hasEdit: false,
                callerName: this.props.loginName,
                NotificationDate: moment(),
                NotificationTime: moment(),
                tel: mobilePhoneList[0].phoneNumber,
                email: '',
                fax: '',
                note: '',
                contactType: contactHistoryType.SMS.code,
                appointmentDate: appointment.appointmentDateTime,
                sentDateTime: null,
                status: 'P'
            };

            this.updateContHistState(updateInfo);

        }
        else {
            this.props.openCommonMessage({ msgCode: '140021', showSnackbar: true });
            return false;
        }

        return true;
    }

    initCreateEmail = (appointment) => {
            let updateInfo = {
                id: null,
                hasEdit: false,
                callerName: '',
                NotificationDate: moment(),
                NotificationTime: moment(),
                tel: '',
                email: appointment.patientDto.emailAddress,
                fax: '',
                subject: '',
                note: '',
                message: '',
                contactType: contactHistoryType.EMAIL.code,
                appointmentDate: appointment.appointmentDateTime,
                sentDateTime: null,
                status: 'P'
            };
            this.updateContHistState(updateInfo);
        return true;
    }

    initCreateTel = (appointment) =>{

        let updateInfo = {
            id: null,
            hasEdit: false,
            callerName: this.props.loginName,
            NotificationDate: moment(),
            NotificationTime: moment(),
            //tel: appointment.patientDto.phoneList.length > 0 ? appointment.patientDto.phoneList[0].phoneNumber: '',
            //email: appointment.patientDto.emailAddress,
             tel: '',
             email: '',
            fax: '',
            note: '',
            contactType: contactHistoryType.TEL.code,
            appointmentDate: appointment.appointmentDateTime,
            //appointmentDate: '',
            sentDateTime: moment(),
            status: ''
        };
        this.updateContHistState(updateInfo);
        return true;
    }


    initCreateMail = (appointment) => {
        let updateInfo = {
            id: null,
            hasEdit: false,
            callerName: this.props.loginName,
            NotificationDate: moment(),
            NotificationTime: moment(),
            address: '',
            tel: '',
            email: appointment.patientDto.emailAddress,
            fax: '',
            note: '',
            contactType: contactHistoryType.MAIL.code,
            appointmentDate: appointment.appointmentDateTime,
            sentDateTime: moment(),
            status: 'A'
        };
        this.updateContHistState(updateInfo);
        return true;
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    handleRowClick = (param) => {
        let contactHistory = param.data;

        this.setState({contactHistoryAction: contactHistoryAction.EDIT});
        switch (contactHistory.type) {
            case contactHistoryType.TEL.code:{
                this.setContactDetailsTabVal(0);
                let updateInfo = {
                    hasEdit: false,
                    id: -contactHistory.id,
                    callerName: contactHistory.caller.loginName,
                    NotificationDate: moment(contactHistory.contactDtm),
                    NotificationTime: moment(contactHistory.contactDtm),
                    tel: contactHistory.contact,
                    email: '',
                    address: '',
                    note: contactHistory.note,
                    contactType: contactHistory.type,
                    message: '',
                    subject: '',
                    appointmentDate: null, //appointment.appointmentDateTime,
                    sentDateTime: moment(),
                    status: contactHistory.status,
                    version: contactHistory.version
                };
                //this.props.getContactHistoryList(contactHistory.caller.userId);
                this.updateContHistState(updateInfo);

                break;
            }
            case contactHistoryType.SMS.code:{
                this.setContactDetailsTabVal(1);
                console.log(contactHistory);
                let updateInfo = {
                    hasEdit: false,
                    id: contactHistory.id,
                    callerName: '',
                    NotificationDate: moment(contactHistory.scheduleDtm),
                    NotificationTime: moment(contactHistory.scheduleDtm),
                    tel: contactHistory.contact,
                    email: '',
                    address: '',
                    note: contactHistory.note,
                    contactType: contactHistory.type,
                    message: contactHistory.message,
                    subject: '',
                    appointmentDate: moment(contactHistory.contactDtm), //appointment.appointmentDateTime,
                    sentDateTime: moment(contactHistory.sentDtm),
                    status: contactHistory.status,
                    version: contactHistory.version
                };
                console.log(updateInfo);
                //this.props.getContactHistoryList(updateInfo);
                if (contactHistory.status == 'S') {
                    this.setState({contactHistoryAction: contactHistoryAction.VIEW});
                }
                this.updateContHistState(updateInfo);
                break;
            }
            case contactHistoryType.EMAIL.code:{
                this.setContactDetailsTabVal(2);
                let updateInfo = {
                    hasEdit: false,
                    id: contactHistory.id,
                    callerName: '',
                    NotificationDate: moment(contactHistory.scheduleDtm),
                    NotificationTime: moment(contactHistory.scheduleDtm),
                    tel: '',
                    email: contactHistory.contact,
                    address: '',
                    note: contactHistory.note,
                    contactType: contactHistory.type,
                    message: contactHistory.message,
                    subject: contactHistory.subject,
                    appointmentDate: moment(contactHistory.contactDtm), //appointment.appointmentDateTime,
                    sentDateTime: moment(),
                    status: contactHistory.status,
                    version: contactHistory.version
                };
                this.updateContHistState(updateInfo);
                //this.props.getContactHistoryList(updateInfo);
                if (contactHistory.status == 'S') {
                    this.setState({contactHistoryAction: contactHistoryAction.VIEW});
                }
                break;
            }
            case contactHistoryType.MAIL.code:{
                this.setContactDetailsTabVal(3);
                let updateInfo = {
                    hasEdit: false,
                    id: -contactHistory.id,
                    callerName: contactHistory.caller.loginName,
                    NotificationDate: moment(contactHistory.contactDtm),
                    NotificationTime: moment(contactHistory.contactDtm),
                    tel: '',
                    email: '',
                    address:contactHistory.contact,
                    note: contactHistory.note,
                    contactType: contactHistory.type,
                    message: '',
                    subject: '',
                    appointmentDate: null,
                    sentDateTime: moment(contactHistory.sentDtm),
                    status: contactHistory.status,
                    version: contactHistory.version
                };
                this.updateContHistState(updateInfo);
                //this.props.getContactHistoryList(updateInfo);
                break;
            }
        }
    }

    canRemoveHistory = () => {
        return this.state.contactHistoryInfo.id && this.canEditHistory();
    }

    canEditHistory = () => {
        if (this.state.contactHistoryInfo.contactType == contactHistoryType.SMS.code || this.state.contactHistoryInfo.contactType == contactHistoryType.EMAIL.code){
            if (this.state.contactHistoryInfo.status != 'P'){
                return false;
            }
        }
        return true;
    }

    switchAddMode = () =>{
        this.gridApi.deselectAll();
        this.setState({contactHistoryAction: contactHistoryAction.INSERT});
        this.setContactDetailsTabVal(0);
        this.initCreateTel(this.props.appointment);
    }

    deleteHistory = () => {
        if (this.canEditHistory()) {
            this.props.openCommonMessage({
                msgCode: '140007',
                btnActions: {
                    btn1Click: () => {
                        if (this.state.contactHistoryInfo.contactType == contactHistoryType.TEL.code || this.state.contactHistoryInfo.contactType == contactHistoryType.MAIL.code) {
                            let deleteData = {
                                contactHistoryId: this.state.contactHistoryInfo.id,
                                statusCd: 'D',
                                contactType: this.props.contactType,
                                version: this.state.contactHistoryInfo.version
                            };
                            this.props.updateContactHistory({appointmentId: this.props.appointment.appointmentId, data: deleteData, contactHistoryId: this.state.contactHistoryInfo.id}, this.successSubmit);
                        }
                        else {
                            let deleteData = {version: this.state.contactHistoryInfo.version};
                            this.props.deleteContactHistory({appointmentId: this.props.appointment.appointmentId, data: deleteData, contactHistoryId: this.state.contactHistoryInfo.id}, this.successSubmit);
                        }
                    }
                }
            });
        }
    }

    render(){
        const { contactDetailsTabVal, contactHistoryInfo } = this.state;
        const { classes,
            openContactHistoryDialog,
            contactHistoryTelNotesListSucceed, contactHistoryTelNotesListFailed,
            appointment, selectedAppointmentTask, reminderTemplate,  ...rest } = this.props;

        return(

            <div className={classes.root}>
            {
//            patientInfo && patientInfo.documentPairList &&
            <CIMSDialog
//            id="dtsContactHistoryDialog"
                dialogTitle="Contact History"
                open={openContactHistoryDialog}
                classes={{
                    paper: classes.dialogPaper
                }}
            >
            {
            // _.isArray(selectedAppointmentTask.appointmentTask) &&
            !_.isEmpty(appointment) ? (
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError} >
                    <DialogContent id={'dtsContactHistoryDialogContent'} style={{height:880}}>
                    <div>
                        <Grid container spacing={0}>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Patient:</Paper>
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colDetailLabel}>{dtsUtilities.getPatientName(appointment.patientDto)}</Paper>
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>PMI No.:</Paper>
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colDetailLabel}>{appointment.patientKey}</Paper>
                            </Grid>
                            <Grid item xs={4}>
                                &nbsp;
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Appt Date / Time:</Paper>
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colDetailLabel}>{dtsUtilities.getAppointmentStartTime(appointment).format('DD-MM-YYYY HH:mm')}</Paper>
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Duration:</Paper>
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colDetailLabel}>{dtsUtilities.getAppointmentDuration(appointment)} mins</Paper>
                            </Grid>
                            <Grid item xs={4}>
                                &nbsp;
                            </Grid>
                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Remind Status:</Paper>
                            </Grid>
                            <Grid item xs={10}>
                                <Paper  elevation={0} className={classes.colDetailLabel}>{appointment.specialReminderList}</Paper>
                            </Grid>

                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Spec. Req.:</Paper>
                            </Grid>
                            <Grid item xs={10}>
                                <Paper  elevation={0} className={classes.colDetailLabel}>
                                    {(appointment.appointmentSpecialRequestVo) ?
                                        appointment.appointmentSpecialRequestVo.remark : ''}</Paper>
                            </Grid>

                            <Grid item xs={2}>
                                <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Patient Reminder:</Paper>
                            </Grid>
                            <Grid item xs={10}>
                                <Paper  elevation={0} className={classes.colDetailLabel}>The patient reminder...</Paper>
                            </Grid>
                        </Grid>

                    </div>

                    <Grid>
                        <Grid className={classes.funcIcon}>
                            <Add onClick={this.switchAddMode} className={classes.funcButton + ' ' + (this.state.contactHistoryAction == contactHistoryAction.INSERT ? classes.funcButtonDim : '')}/>
                        </Grid>
                        <Grid className={classes.funcIcon}>
                            <Remove className={classes.funcButton + ' ' + (!this.canRemoveHistory() ? classes.funcButtonDim : '')} onClick={this.canRemoveHistory() && this.deleteHistory}/>
                        </Grid>
                    </Grid>

                    <Grid container spacing={0}>
                        {this.state.contactHistoryListLoaded ? <CIMSDataGrid
                            disableAutoSize
                            suppressGoToRow
                            suppressDisplayTotal
                            gridTheme="ag-theme-balham"
                            divStyle={{
                                            width: '100%',
                                            height: '200px',
                                            display: 'block'
                                        }}
                            gridOptions={{
                                            columnDefs: this.contactHistoryColumnDefs,
                                            rowData: this.props.contactHistoryList,
                                            suppressRowClickSelection: false,
                                            rowMultiSelectWithClick: false,
                                            rowSelection: 'single',
                                            onGridReady: this.onGridReady,
                                            getRowHeight: () => 32,
                                            getRowNodeId: item => item.id,
                                            // frameworkComponents: {
                                            //     notificationRenderer: NotificationRenderer,
                                            //     durationRenderer: DurationRenderer,
                                            //     reminderIconRenderer: ReminderIconRenderer,
                                            //     exactActionRenderer: ExactActionRenderer
                                            // },
                                            onRowClicked: params => {
                                                this.handleRowClick(params);
                                            },
                                            onRowDoubleClicked: params => {
                                                //this.handleRowClick(params, true);
                                            },
                                            postSort: rowNodes => {
                                                let rowNode = rowNodes[0];
                                                if (rowNode) {
                                                    setTimeout(
                                                        rowNode => {
                                                            rowNode.gridApi.refreshCells();
                                                        },
                                                        100,
                                                        rowNode
                                                    );
                                                }
                                            }
                                            //pagination: true,
                                            //paginationPageSize: 28
                                        }}
                                    />
                                    : <ExpandMore onClick={this.loadContactHistoryList}/>
                                    }
                    </Grid>
                    <Paper square className={classes.detailTab}>
                        <Tabs
    //                        variant="fullWidth"
                            selectionFollowsFocus
                            value={contactDetailsTabVal}
                            indicatorColor="primary"
                            textColor="primary"
                            onChange={this.handleTabChange}
                            aria-label="Contact Details"
                        >
{//                            <Tab label="Tel" {...a11yProps(0)}>
}
                            <Tab label={contactHistoryType.TEL.disp} className={classes.tabLabel}>
                            </Tab>
                            <Tab label={contactHistoryType.SMS.disp} className={classes.tabLabel}>
                            </Tab>
                            <Tab label={contactHistoryType.EMAIL.disp} className={classes.tabLabel}>
                            </Tab>
                            <Tab label={contactHistoryType.MAIL.disp} className={classes.tabLabel}>
                            </Tab>
                        </Tabs>

                        <TabPanel value={contactDetailsTabVal} index={0}>
                            <DtsContactHistoryTel id={'dtsContactHistoryTel'}
                                className={classes.contactHistoryTel}
                                contactHistoryInfo={contactHistoryInfo} updateContHistState={this.updateContHistState}
                                appointment={appointment} contactHistoryAction={this.state.contactHistoryAction}
                                contactHistoryTelNotesListSucceed={contactHistoryTelNotesListSucceed} contactHistoryTelNotesListFailed={contactHistoryTelNotesListFailed}
                            />
                        </TabPanel>
                        <TabPanel value={contactDetailsTabVal} index={1}>
                            <DtsContactHistorySms
                                contactHistoryInfo={contactHistoryInfo} updateContHistState={this.updateContHistState}
                                appointment={appointment} contactHistoryAction={this.state.contactHistoryAction}
                                reminderTemplateSms={reminderTemplate ? reminderTemplate.filter(e => e.commMeansCd == contactHistoryType.SMS.code) : []}
                            />
                        </TabPanel>
                        <TabPanel value={contactDetailsTabVal} index={2}>
                            <DtsContactHistoryEmail
                                contactHistoryInfo={contactHistoryInfo} updateContHistState={this.updateContHistState}
                                appointment={appointment} contactHistoryAction={this.state.contactHistoryAction}
                                reminderTemplateEmail={reminderTemplate ? reminderTemplate.filter(e => e.commMeansCd == contactHistoryType.EMAIL.code) : []}
                            />
                        </TabPanel>
                        <TabPanel value={contactDetailsTabVal} index={3}>
                            <DtsContactHistoryMail
                                contactHistoryInfo={contactHistoryInfo} updateContHistState={this.updateContHistState}
                                appointment={appointment} contactHistoryAction={this.state.contactHistoryAction}
                            />
                        </TabPanel>
                    </Paper>

                    </DialogContent>

                    <DialogActions className={classes.dialogAction}>
                        <CIMSButton
                            onClick={() => this.refs.form.submit()}
                            id={'attendance_confirm'}
                            color="primary"
                            disabled={this.state.contactHistoryAction == contactHistoryAction.VIEW}
                        >Confirm</CIMSButton>
                        <CIMSButton
                            onClick={this.handleClose}
                            color="primary"
                            id={'attendance_cancel'}
                        >Cancel</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            ) : (
                <ValidatorForm ref="form2" onError={this.handleSubmitError} >
                    <DialogContent id={'dtsContactHistoryDialogContentErr'}>
                        Appointment Not found.
                    </DialogContent>
                    <DialogActions className={classes.dialogAction}>
                            <CIMSButton
                                onClick={this.handleClose}
                                color="primary"
                                id={'attendance_cancel'}
                            >Close</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            )

            }
            </CIMSDialog>}
            </div>

        );
    }
}

const mapStateToProps = (state) => {
    return {
        contactHistoryList: state.dtsRemindAppointment.contactHistoryList,
        reminderTemplate: state.dtsRemindAppointment.reminderTemplate,
        currentClinic: state.login.clinic,
        loginName: state.login.loginInfo.loginName,
        contactHistoryTelNotesListSucceed: state.dtsRemindAppointment.contactHistoryTelNotesListSucceed,
        contactHistoryTelNotesListFailed: state.dtsRemindAppointment.contactHistoryTelNotesListFailed
    };
};

const mapDispatchToProps = {
    getContactHistoryList,
    getReminderTemplate,
    insertContactHistory,
    updateContactHistory,
    //getContactHistoryTelNotesCode,
    resetContactHistory,
    getAnaCode,
    openCommonMessage,
    deleteContactHistory
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsContactHistoryDialog));

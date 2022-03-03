import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';

import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Paper,
    DialogContent,
    DialogActions
} from '@material-ui/core';

import _ from 'lodash';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import { getGdDefaultRoom } from '../../../../store/actions/dts/patient/DtsDefaultRoomAction';
import {
    deleteAppointment,
    getDailyView
} from '../../../../store/actions/dts/appointment/bookingAction';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';

const styles = {
    root: {
        width: '550px'
    },

    table: {
        paddingTop: '10px',
        width: '100%'
    },
    paperGroup:{
        padding: '0px',
        height: '270'
    },
    confirmPanel: {
        padding: 0,
        width: 500
    },
    paper: {
        padding: '10px',
        textAlign: 'left'
        // color: 'black'
    },

    label: {
        fontWeight: 'bold'
    },title: {
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#ccc',
        fontWeight: 'bold',
        borderStyle: 'none'

    },
    optionRoot:{
        marginLeft: '0px'
    },
    dialogHeadLabel:{
        color: 'black',
        textAlign: 'left'
    },
    requireResonIcon:{
        color:'red'
    },
    cellBigResize:{
        'flex-basis':'75% !important',
        'max-width': '100% !important'
    },cellResize:{
        maxWidth:'25% !important'
    },header:{
        marginBottom: '10px'
    },reasonSelection:{
        width: '300px'
    }, selectorDiv:{
        display: 'flex'
    },paperGroupItem:{
        padding: '10px'
    },
    info:{
        textAlign: 'left',
        fontSize: '15.5px'
    },remarksTextField:{
        width:'350px'
    },otherReasonTextField:{
        width:'350px'
    },    timeSelection:{
        width: '150px'
    },
    headerTableCell:{
        backgroundColor: '#48aeca',
        color: '#ffffff',
        fontSize:'13px',
        borderStyle: 'none',
        textAlign:'left',
        'max-width': '100% !important'
    },
    diabledTextField:{
        'background-color': 'lightgrey'
    }

};

class DtsDeleteAppointmentDialog extends Component {

    constructor(props){
        super(props);
        this.state = {
            selectedAppointmetId: null,
            selectedReasonId: null,
            selectedReasonName: null,
            isReadOnly: true,
            remarks: '',
            otherReason: null,
            version: null,
            isUpdated:false
        };
    }

    componentDidMount(){

    }

    componentDidUpdate(prevState, prevProps){

    }



    handleOnSubmit = () => {
        this.props.confirmDeleteAppointment(this.state.otherReason, this.state.selectedReasonId, this.state.remarks);
    }


    handleCancel = () => {
        if(this.state.isUpdated) {
            this.props.openCommonMessage({
                msgCode: '110018',
                btnActions: {
                    btn1Click: () => {
                        this.props.closeConfirmDialog();
                    }
                }
            });
        } else {
            this.props.closeConfirmDialog();
        }
    }

    handleRemarkOnChange = (value) => {
        if(value!=this.state.remarks) {
            this.setState({remarks: value});
            this.setIsUpdated();
        }
    }

    handleReasonOnChange = (value) => {
        if(value != this.state.selectedReasonId){
            //console.log('value: ' + value);
            this.setState({isReadOnly: true});
            this.setState({otherReason: ''});
            let otherReasonName = this.props.deleteReasonsList.find(item => item.rsnTypeId === value);

            //console.log('code: ' + otherReasonName.rsnName);
            this.setState({selectedReasonId: value});
            this.setState({selectedReasonName: otherReasonName.rsnName});
            this.setIsUpdated();

            if(otherReasonName.rsnName == 'OTH'){
                this.setState({isReadOnly: false});
            }
        }
    }
    handleOtherReasonOnChange = (value) => {
        if(value!=this.state.otherReason) {
            this.setState({otherReason: value});
            this.setIsUpdated();
        }
    }

    setIsUpdated = () => {
        // console.log('isUpdated:',this.state.isUpdated.toString());
        !this.state.isUpdated && this.setState({isUpdated:true});
    }

    getValidator = (name) => {
        let validators = [];

        if (name === 'reasonSelector') {
            validators.push('required');
            return validators;
        }
        if (name === 'otherReasonSelector') {
            validators.push('required');
            return validators;
        }
        if (name === 'remarksText') {
            validators.push('required');
            return validators;
        }

    }

    getErrorMessage = (name) => {
        let errorMessages = [];

        if (name === 'reasonSelector') {
            errorMessages.push(dtsUtilities.emptyInputMessage(dtsBookingConstant.DTS_APPOINTMENT_REASON_TYPE));
            return errorMessages;
        }
        if (name === 'otherReasonSelector') {
            errorMessages.push(dtsUtilities.emptyInputMessage(dtsBookingConstant.DTS_APPOINTMENT_OTHER_REASON));
            return errorMessages;
        }
        if (name === 'startTimeSelector') {
            errorMessages.push('Start Time cannot be null');
            return errorMessages;
        }
        if (name === 'endTimeSelector') {
            errorMessages.push('End Time cannot be null');
            return errorMessages;
        }
    }


    render(){
        const { classes, openConfirmDialog, calendarDetailDate, deleteReasonsList, ...rest } = this.props;


        let date = '';

        if(calendarDetailDate)
        date = moment(this.props.calendarDetailDate).format(DTS_DATE_DISPLAY_FORMAT);



        return(

            <div>

            <CIMSDialog id="dtsDeleteAppointmentDialog" dialogTitle="Delete Appointment" open={openConfirmDialog} dialogContentProps={{ style: { width: '100%' } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError} >
                    <DialogContent id={'dtsDeleteAppointmentDialog'}  style={{ padding: 0 }}>
                        <div className={classes.root}>

                            <Grid container spacing={0}>
                                <Grid item xs={12} className={classes.header}>
                                    <label className={classes.dialogHeadLabel}>Please enter the reason for deleting the appointment and confirm. </label>
                                </Grid>
                                <Grid item xs={3}>
                                    <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Reason</Paper>
                                </Grid>
                                <Grid item xs={9}>
                                <Paper square className={classes.paperGroup}>
                                    <Grid className={classes.selectorDiv}>
                                            <div className={classes.paperGroupItem +' '+classes.reasonSelection}>
                                                <DtsSelectFieldValidator
                                                    id={'reasonSelect'}
                                                    isDisabled={false}
                                                    isRequired
                                                    TextFieldProps={{
                                                        variant: 'outlined',
                                                        style: { width: 350 },
                                                        label: <>Select a reason <RequiredIcon /></>

                                                    }}
                                                    options={deleteReasonsList && deleteReasonsList.map(item => (
                                                        { value: item.rsnTypeId, label: `${item.rsnDesc}` }
                                                    ))}
                                                    value={this.state.selectedReasonId}
                                                    msgPosition="bottom"
                                                    validators={this.getValidator('reasonSelector')}
                                                    errorMessages={this.getErrorMessage('reasonSelector')}
                                                    onChange={e => this.handleReasonOnChange(e.value)}

                                                />
                                            </div>
                                        </Grid>
                                    </Paper>
                                </Grid>
                                <Grid item xs={3} className={classes.cellResize}>
                                        <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Other Reason</Paper>
                                </Grid>

                                <Grid item xs={9}>
                                    <Paper square className={classes.paperGroup}>
                                        <Grid className={classes.selectorDiv}>
                                            <div className={classes.paperGroupItem+' '+classes.info}>
                                                <TextFieldValidator
                                                    className={(this.state.isReadOnly? (classes.diabledTextField + ' ' + classes.otherReasonTextField): classes.otherReasonTextField)}
                                                    id={'otherReasonTextField'}
                                                    //disabled={this.state.selectedReasonName == 'OTH'? false: true}
                                                    //variant={this.props.disabled ? 'outlined' : 'outlined'}
                                                    inputProps={{ maxLength: 250 }}
                                                    disabled={this.state.isReadOnly}
                                                    variant={this.props.disabled ? 'standard' : 'outlined'}
                                                    label={<>Other Reason </>}
                                                    value={this.state.otherReason}
                                                    validators={this.getValidator('otherReasonSelector')}
                                                    errorMessages={this.getErrorMessage('otherReasonSelector')}
                                                    onChange={e => this.handleOtherReasonOnChange(e.target.value)}
                                                >
                                                </TextFieldValidator>
                                            </div>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                <Grid item xs={3} className={classes.cellResize}>
                                        <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Remarks</Paper>
                                </Grid>

                                <Grid item xs={9}>
                                    <Paper square className={classes.paperGroup}>
                                        <Grid className={classes.selectorDiv}>
                                            <div className={classes.paperGroupItem+' '+classes.info}>
                                                <CIMSMultiTextField
                                                    className={classes.remarksTextField}
                                                    id={'remarksTextField'}
                                                    label={<>Remarks </>}
                                                    value={this.state.remarks}
                                                    onChange={e => this.handleRemarkOnChange(e.target.value)}
                                                >
                                                </CIMSMultiTextField>
                                            </div>
                                        </Grid>
                                    </Paper>
                                </Grid>

                            </Grid>

                        </div>
                    </DialogContent>

                    <DialogActions className={classes.dialogAction}>
                        <CIMSButton
                            onClick={() => this.refs.form.submit()}
                            id={'open_delete_appointment_confirm'}
                            color="primary"
                        >Confirm</CIMSButton>
                        <CIMSButton
                            onClick={this.handleCancel}
                            color="primary"
                            id={'open_delete_appointment_cancel'}
                        >Cancel</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
        </CIMSDialog>
            </div>

        );
    }
}

const mapStateToProps = (state) => {
    return {
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        calendarDetailDate: state.dtsAppointmentBooking.pageLevelState.calendarDetailDate,
        deleteReasonsList: state.common.deleteReasonsList,
        patientInfo: state.patient.patientInfo
    };
};

const mapDispatchToProps = {
    deleteAppointment,
    getDailyView,
    getGdDefaultRoom,
    openCommonMessage
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDeleteAppointmentDialog));

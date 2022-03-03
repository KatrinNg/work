import React, { Component } from 'react';
import { connect } from 'react-redux';

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
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import {
    saveToReserveList
} from '../../../../store/actions/dts/appointment/bookingAction';

const styles = {
    root: {
        width: '100%'
    },
    paperGroup:{
        padding: '0px',
        height: '270',
        width: '100%'
    },
    paper: {
        padding: '10px',
        textAlign: 'left'
    },
    label: {
        fontWeight: 'bold'
    },
    selectorDiv:{
        display: 'flex'
    },
    paperGroupItem:{
        padding: '10px'
    },
    info:{
        textAlign: 'left',
        fontSize: '15.5px'
    },
    remarksTextField:{
        width:'500px'
    }
};

class DtsReserveAppointmentDialog extends Component {

    constructor(props){
        super(props);
        this.state = {
            priority: this.props.appointment.reserve? this.props.appointment.reserve.priority : 1,
            remarks: this.props.appointment.reserve? this.props.appointment.reserve.remarks : null
        };
    }

    componentDidMount(prevProps, pervState){}

    componentDidUpdate(prevProps){}

    handleOnSubmit = () => {
        this.props.saveToReserveList({
            reserveListId: this.props.appointment.reserve?.reserveListId,
            appointmentId: this.props.appointment.appointmentId,
            priority: this.state.priority,
            appointmentDetailId: this.props.appointment.appointmentDetlBaseVoList[0].appointmentDetailId,
            remarks: this.state.remarks,
            version: this.props.appointment.reserve?.version
         }, this.props.closeConfirmDialog);
    }

    handleCancel = () => {
        this.props.closeConfirmDialog();
    }

    handleOnChangePriority = (value) => {
        this.setState({priority: value});
    }


    handleOnChangeRemarks = (value) => {
        this.setState({remarks: value});
    }

    getValidator = (name) => {
        let validators = [];

        if (name === 'prioritySelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];

        if (name === 'prioritySelector') {
            errorMessages.push('Please select priority.');
            return errorMessages;
        }
    }


    render(){
        const { classes, openConfirmDialog, ...rest } = this.props;
        const siteName = this.props.clinicList.find(c => c.siteId == this.props.appointment.siteId).siteName;
        return(

            <div>

            <CIMSDialog id="dtsReserveAppointmentDialog" dialogTitle="Reserve List" open={openConfirmDialog} dialogContentProps={{ style: { width: '100%' } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError} >
                    <DialogContent id={'dtsReserveAppointmentDialog'}  style={{ padding: 0 }}>
                        <div className={classes.root}>

                            <Grid container spacing={0}>
                                <Grid item xs={3}>
                                    <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Clinic</Paper>
                                </Grid>
                                <Grid item xs={9}>
                                    <Paper square  className={classes.paper} elevation={1}>{siteName}</Paper>
                                </Grid>
                                <Grid item xs={3}>
                                    <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Surgery</Paper>
                                </Grid>
                                <Grid item xs={9}>
                                    <Paper square  className={classes.paper} elevation={1}>{this.props.appointment.roomCode}</Paper>
                                </Grid>
                                <Grid item xs={3}>
                                    <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Priority</Paper>
                                </Grid>
                                <Grid item xs={9}>
                                <Paper square className={classes.paperGroup}>
                                    <Grid className={classes.selectorDiv}>
                                            <div className={classes.paperGroupItem}>
                                                <DtsSelectFieldValidator
                                                    id={'prioritySelect'}
                                                    isRequired
                                                    TextFieldProps={{
                                                        style: { width: 100 },
                                                        label: <>Priority<RequiredIcon /></>

                                                    }}
                                                    options={[
                                                        {value: 1, label: '1'},
                                                        {value: 2, label: '2'},
                                                        {value: 3, label: '3'}
                                                    ]}
                                                    value={this.state.priority}
                                                    msgPosition="bottom"
                                                    validators={this.getValidator('prioritySelector')}
                                                    errorMessages={this.getErrorMessage('prioritySelector')}
                                                    onChange={e => this.handleOnChangePriority(e.value)}
                                                />
                                            </div>
                                        </Grid>
                                    </Paper>
                                </Grid>
                                <Grid item xs={3}>
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
                                                    onChange={e => this.handleOnChangeRemarks(e.target.value)}
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
                            id={'proceed'}
                            color="primary"
                        >Proceed</CIMSButton>
                        <CIMSButton
                            onClick={this.handleCancel}
                            color="primary"
                            id={'cancel'}
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
        clinicList: state.common.clinicList
    };
};

const mapDispatchToProps = {
    saveToReserveList
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsReserveAppointmentDialog));








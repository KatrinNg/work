import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Paper,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography
} from '@material-ui/core';

import _ from 'lodash';

import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import RadioFieldValidator from '../../../../components/FormValidator/RadioFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';


import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';

import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import {
 getRoomList,
 getEncounterTypeList,
 setSelectedEncounterType,
 resetDirectEncounterDialog,
 insertEncounter,
 getLatestEncounter

} from '../../../../store/actions/dts/clinicalContent/encounterAction';

const styles = () => ({
    root: {
        flexGrow: 1,
        fontFamily:'Microsoft JhengHei, Calibri',
        overflow: 'auto',
        height: '100%'
    },
    paper: {
        marginTop: '30px',
        textAlign: 'center',
        height: '60px'
        // color: 'black'
    },
    paperGroup:{

        height: '90px'
    },
    paperGroupItem:{
        marginLeft: '10px',
        marginTop: '20px'
    },
    paperDefaultRoomLabel:{
        padding: '20px 10px 0px 10px',
        textAlign: 'center',
        height: '50px'
    },
    paperDefaultRoom:{
        padding: '0px',
        height: '50px'
    },
    dateListItem:{
        textAlign: 'right',
        '&.rescheduleDateHasDifference' :{
            color:'#ff0000'
        }
    },
    dateListItemSelect:{
        backgroundColor: 'aliceblue'
    },
    errorIcon:{
        color: 'red'
    },
    selectorDiv:{
        display: 'flex'
    },
    surgerySelection:{
        width: '150px'
    },
    encounterTypeSelection:{
        width: '350px'
    },
    label: {
        // textAlign: 'right',
        fontWeight: 'bold'
    },
    info:{
        textAlign: 'left',
        fontSize: '15.5px'
    },
    textArea:{
        height: '75px'
    },
    cellResize:{
        maxWidth:'25% !important'
    },
    cellBigResize:{
        'flex-basis':'75% !important',
        'max-width': '100% !important'
    },
    errMsg:{
        color:'red'
    },
    invisible:{
        display: 'none'
    }

});

class DtsDirectEncounterDialog extends Component {

    constructor(props){
        super(props);
        this.state = {
            openConfirmDialog: false,
            selaectedSurgeryRoom: null,
            selectedEncounterType: null,
            selaectedSurgeryRoomId: null,
            selectedEncounterTypeId: null,
            selectedSiteId: null,
            selectedSSpecId: null,
            selectedServiceCd: null


        };
    }

    componentDidMount(){
        let curClinic = this.props.clinicList.find(clinic => clinic.siteId == this.props.defaultClinic.siteId);
        this.props.getRoomList({siteId:curClinic.siteId});

    }

    componentDidUpdate(prevProps, pvState) {



    }


    componentWillUnmount() {

        //  this.props.getLatestEncounter({
        //     patientKey: this.props.patientInfo.patientKey
        // });

    }

    handleOnSubmit = () => {

        const { currentEncounter} = this.props;

        this.props.insertEncounter({
                patientKey: this.props.patientInfo.patientKey,
                rmId: this.state.selaectedSurgeryRoomId,
                encntrTypeId: this.state.selectedEncounterTypeId,
                encntrSts: 'N',
                svcCd: 'DTS',
                isRealtime: true,
                siteId: this.state.selectedSiteId,
                sspecId: this.state.selectedSSpecId,

                sdt: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
                edt: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z'

            },((patientKey) => {
                      return () => {
                          this.props.getLatestEncounter({patientKey: patientKey});
                      };
                  })(this.props.patientInfo.patientKey));



            this.props.closeConfirmDialog();
    }

    // closeDialog =()=> {
    //     console.log('Hin 1 closeDialog');
    //     this.props.closeConfirmDialog,
    //     this.props.refreshEncounter();

    // }


    getValidator = (name) => {
        let validators = [];


    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'encounterTypeSelector') {
            errorMessages.push('Encounter Type cannot be null');
            return errorMessages;
        }if (name === 'surgerySelector') {
            errorMessages.push('Surgery Room cannot be null');
            return errorMessages;
        }

    }

    handleSurgeryRoomChange = (value) => {
        this.setState({selaectedSurgeryRoom: value.rmCd});
        //this.setState({selaectedSurgeryRoom: value});
        this.setState({selaectedSurgeryRoomId: value.rmId});
        this.setState({selectedSiteId: value.siteId});
        this.setState({selectedSSpecId: value.sspecId});
        this.setState({selectedServiceCd: this.props.clinicList.find(clinic => clinic.siteId == value.siteId).svcCd});

        this.props.getEncounterTypeList({roomIdList: [value.rmId]});

    }

    handleEncounterTypeChange = (value) => {

        this.setState({selectedEncounterType: value.encntrTypeDesc});
        this.setState({selectedEncounterTypeId: value.encntrTypeId});
        //this.props.setSelectedEncounterType({encounterType:value});
    }

    handleCancel = () => {

        this.props.resetDirectEncounterDialog();
        this.props.closeConfirmDialog();
    }




    render(){
        const { classes, openConfirmDialog,  roomList, encounterTypeList, patientDefaultRoomId, ...rest } = this.props;

        return (
            <CIMSDialog id="dtsDirectEncounterDialog" dialogTitle={'Create Encounter'} open={openConfirmDialog} dialogContentProps={{ style: { width: 700 } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    <DialogContent id={'dtsDirectEncounterDialog'}  style={{ padding: 0 }}>
                        <div className={classes.root}>
                            <Grid container spacing={0}>
                                <Grid item xs={3}>
                                    <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Surgery</Paper>
                                </Grid>
                                <Grid item xs={9}>
                                    <Paper square className={classes.paperGroup}>
                                        <Grid className={classes.selectorDiv}>
                                            <div className={classes.paperGroupItem +' '+classes.surgerySelection}>

                                                <DtsSelectFieldValidator
                                                    id={'surgerySelect'}
                                                    isDisabled={false}
                                                    isRequired
                                                    TextFieldProps={{
                                                                    variant: 'outlined',
                                                                    label: <>Surgery<RequiredIcon /></>
                                                    }}
                                                    options={roomList && roomList.map((item) => ({value:item, label:item.rmCd}))}

                                                    value={this.state.selaectedSurgeryRoom}
                                                    msgPosition="bottom"
                                                    validators={this.getValidator('startTimeSelector')}
                                                    errorMessages={this.getErrorMessage('startTimeSelector')}
                                                    onChange={e => this.handleSurgeryRoomChange(e.value)}
                                                />
                                            </div>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                <Grid item xs={3}>
                                    <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Encounter Type</Paper>
                                </Grid>
                                <Grid item xs={9}>
                                    <Paper square className={classes.paperGroup}>
                                        <Grid className={classes.selectorDiv}>
                                            <div className={classes.paperGroupItem +' '+classes.encounterTypeSelection}>
                                                <DtsSelectFieldValidator
                                                    id={'encounterSelect'}
                                                    //isDisabled={this.state.selectedSurgeryRoom == null ? true: false}
                                                    isRequired
                                                    TextFieldProps={{
                                                                    variant: 'outlined',
                                                                    width: 300,
                                                                    label: <>Encounter Type<RequiredIcon /></>
                                                    }}
                                                    options={
                                                        roomList && encounterTypeList && (patientDefaultRoomId != null) ?
                                                        ( encounterTypeList.filter(x => !x.blockWithDfltRm).map((item) => (
                                                            { value: item, label: item.encntrTypeDesc })) ) :
                                                        ( encounterTypeList.map((item) => (
                                                            { value: item, label: item.encntrTypeDesc })) )
                                                    }
                                                    value={this.state.selectedEncounterType}
                                                    msgPosition="bottom"
                                                    validators={this.getValidator('encounterSelector')}
                                                    errorMessages={this.getErrorMessage('encounterSelector')}
                                                    onChange={e => this.handleEncounterTypeChange(e.value)}
                                                />
                                            </div>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </div>

                    </DialogContent>

                    <DialogActions className={classes.dialogAction}>
                        <CIMSButton
                            //className={(this.props.bookingMode == DTS_BOOKING_MODE_UPDATE_APPT) ? classes.invisible : ''}
                            onClick={() => this.refs.form.submit()}
                            id={'create_encounter'}
                            color="primary"
                            disabled={(this.state.selectedEncounterType == null? true: false)}
                        >Create Encounter
                        </CIMSButton>
                        <CIMSButton
                            onClick={this.handleCancel}
                            color="primary"
                            id={'create_cancel'}
                        >Cancel</CIMSButton>
                    </DialogActions>

                </ValidatorForm>
            </CIMSDialog>
        );
    }
}


const mapStateToProps = (state) => {

    return {
        roomList: state.clinicalContentEncounter.roomList,
        clinicList: state.common.clinicList,
        defaultClinic: state.login.clinic,
        encounterTypeList: state.clinicalContentEncounter.encounterTypeList,
        patientDefaultRoomId: state.patient.defaultRoomId,
        latestEncounter: state.clinicalContentEncounter.latestEncounter,
        patientInfo: state.patient.patientInfo

    };
};

const mapDispatchToProps = {
    getRoomList,
    getEncounterTypeList,
    setSelectedEncounterType,
    resetDirectEncounterDialog,
    insertEncounter,
    getLatestEncounter
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDirectEncounterDialog));

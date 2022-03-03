import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';

import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Switch from '@material-ui/core/Switch';

import 'date-fns';

import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';

import {
    setSelectedFilterClinicalStatus,
    setSelectedFilterEncounterTypeCd,
    setSelectedFilterInfectionControlDisplay,
    setSelectedAttendanceStatus,
    resetAttendanceFilter
} from '../../../../store/actions/dts/appointment/attendanceAction';

import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    attendanceStatus, clinicalStatus
} from '../../../../enums/dts/attendance/attendanceFilterEnum';

const styles = ({
    // root: {
    //     width: '250px',
    //     marginTop:'10px'
    // }
    root: {
        margin: 'auto',
        width: '90%',
        padding: '10px',
        'border-radius': '0px',
        border: '0px',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        'text-align':'center'
    },
    label: {
        padding:'10px 0px',
        fontStyle: 'italic',
        fontWeight:'bold'
        //top: '10px'
    },
    option:{
        width: 250,
        padding:'5px 0px'
    },
    formControl:{
        width: '100%'
    },
    session:{
        width: 130
    },
    groupSplitBtn:{
        width: '40%',
        display: 'inline-flex',
        margin: '8px'
    },
    optionRoot:{
        marginLeft: '0px'
    },
    optionLabel:{
        fontSize: '10pt'
    },
    radioButton:{
        padding: '2px'
    },
    radioGroup:{
        display: 'block'
    }
});


class DtsAttendanceFilter extends Component {

    constructor(props){
        super(props);
        this.state = {
        };
    }

    // componentWillMount() {

    // }

    componentDidMount(){
    }


    componentDidUpdate(pervProps, prevState){
    }

    componentWillUnmount() {
        this.props.resetAttendanceFilter();
    }



    handleSelectedFilterClinicalStatusChange = (e) => {
        console.log('dailyView:'+JSON.stringify(this.props.dailyView));
        this.props.setSelectedFilterClinicalStatus({filterClinicalStatus:e.target.value});
    }

    handleSelectedEncounterTypeChange = (e) => {
        this.props.setSelectedFilterEncounterTypeCd({filterEncounterTypeCd:e.value});
    }

    handlesetSelectedAttendanceStatusChange = (e) => {
        this.props.setSelectedAttendanceStatus({filterAttendanceStatus:e.target.value});
    }

    handleSelectedInfectionControlDisplay = (e) => {
        this.props.setSelectedFilterInfectionControlDisplay({filterInfectionControlDisplay:!this.props.selectedFilterInfectionControlDisplay});
    }


    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'SessionSelector') {
            errorMessages.push('testing');
            return errorMessages;
        }
    }

    showFilterCount(filterAttendanceStatus, filterEncounterType, filterClinicalStatus) {
        const {filterLogic, dailyView} = this.props;

        if (!filterAttendanceStatus) {
            filterAttendanceStatus = attendanceStatus.ALL.statusCd;
        }
        if (!filterClinicalStatus) {
            filterClinicalStatus = clinicalStatus.ALL.statusCd;
        }

        return dailyView.filter(
            (e) => (e.type == 'A' && filterLogic(e, filterClinicalStatus, filterEncounterType, filterAttendanceStatus))
        ).length;

    }

    render(){
        const { classes, className, dailyView, ...rest } = this.props;
        return(
            <Paper className={classes.root +' ' +className}>
                <ValidatorForm ref="AttendanceFilterForm">
                    <Grid className={classes.option}>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormLabel className={classes.label}>Status</FormLabel>
                            <RadioGroup aria-label="setSelectedAttendanceStatus" defaultValue={attendanceStatus.ALL.statusCd}  name="setSelectedAttendanceStatus"  onChange={this.handlesetSelectedAttendanceStatusChange}>
                                {
                                    Object.keys(attendanceStatus).map((key) => {
                                        let item = attendanceStatus[key];
                                        return (
                                            <FormControlLabel key={'attendanceFilter_' + item.statusCd} classes={{root: classes.optionRoot, label:classes.optionLabel}} value={item.statusCd} control={<Radio classes={{root: classes.radioButton}} />} label={item.statusDsp + ' ('+this.showFilterCount(item.statusCd, null, null)+')'} />
                                        );
                                    })
                                }
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    {/* <Grid className={classes.option}>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormLabel className={classes.label}>Encounter Type</FormLabel>
                                <DtsSelectFieldValidator
                                    id={'encounterTypeSelect'}
                                    isDisabled={false}
                                    options={
                                        _.uniqWith(
                                            dailyView.filter(item => item.type == 'A').map((item) => ({value:item.appointment.encounterTypeCd, label:item.appointment.encounterTypeDescription}))
                                            ,  _.isEqual)}
                                    // value={this.props.selectedSession}
                                    value={this.props.selectedFilterEncounterTypeCd}
                                    msgPosition="bottom"
                                    //validators={this.getValidator('SessionSelector')}
                                    //errorMessages={this.getErrorMessage('SessionSelector')}
                                    onChange={this.handleSelectedEncounterTypeChange}
                                />
                        </FormControl>
                    </Grid> */}
                    {this.props.isShowEncounter ?
                        <Grid className={classes.option}>
                            <FormControl component="fieldset" className={classes.formControl}>
                            <FormLabel className={classes.label}>Clinical Status</FormLabel>
                                <RadioGroup aria-label="selectedFilterClinicalStatus" defaultValue={clinicalStatus.ALL.statusCd} name="selectedFilterClinicalStatus"  onChange={this.handleSelectedFilterClinicalStatusChange}>
                                    {
                                        Object.keys(clinicalStatus).map((key) => {
                                            let item = clinicalStatus[key];
                                            return (
                                                <FormControlLabel key={'clinicalFilter_' + item.statusCd} classes={{root: classes.optionRoot, label:classes.optionLabel}} value={item.statusCd} control={<Radio classes={{root: classes.radioButton}} />} label={item.statusDsp + ' ('+this.showFilterCount(null, null, item.statusCd)+')'} />
                                            );
                                        })
                                    }
                                </RadioGroup>
                            </FormControl>
                        </Grid> : null
                    }
                    {/*  */}
                    {
                        <Grid className={classes.option}>
                            <FormControl component="fieldset" className={classes.formControl}>
                                <FormLabel className={classes.label}>Unavailable Period</FormLabel>
                                <FormControlLabel
                                    control={<Switch checked={this.props.selectedFilterInfectionControlDisplay} onChange={this.handleSelectedInfectionControlDisplay} />}
                                    label="Show Infection Control"
                                />
                            </FormControl>
                        </Grid>
                    }
                </ValidatorForm>
            </Paper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        selectedFilterClinicalStatus: state.dtsAppointmentAttendance.selectedFilterClinicalStatus,
        selectedFilterEncounterTypeCd: state.dtsAppointmentAttendance.selectedFilterEncounterTypeCd,
        selectedFilterAttendanceStatus: state.dtsAppointmentAttendance.selectedFilterAttendanceStatus,
        selectedFilterInfectionControlDisplay: state.dtsAppointmentAttendance.selectedFilterInfectionControlDisplay,
        dailyView: state.dtsAppointmentAttendance.dailyView
    };
};

const mapDispatchToProps = {
    setSelectedFilterClinicalStatus,
    setSelectedFilterEncounterTypeCd,
    setSelectedFilterInfectionControlDisplay,
    setSelectedAttendanceStatus,
    resetAttendanceFilter
};

// export default withStyles(styles)(DtsAppointmentSearchGroup);
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAttendanceFilter));

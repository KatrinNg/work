import React, { Component } from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import _ from 'lodash';

// import CIMSButton from '../../../../components/Buttons/CIMSButton';

import DtsEmptyTimeslotPatientGroup from './DtsEmptyTimeslotPatientGroup';
import DtsPatientAppointmentList from './DtsPatientAppointmentList';
import DtsBookingAlert from './DtsBookingAlert';
import DtsReferralList from './DtsReferralList';
import accessRightEnum from '../../../../enums/accessRightEnum';

const styles = ({
    fontFamily: 'Microsoft JhengHei, Calibri',
    padding: 0,
    margin:0,
    width: '100%'
});

const nonPatientFunctionCd = accessRightEnum.DtsBookingNonPatient;

class DtsRightPanel extends Component {

    constructor(props){
        super(props);
    }

    render(){
        const { classes, functionCd, emptyTimeslotDateList, ...rest } = this.props;

        return (
            <Grid container direction="column" className={classes.root}>
                <Grid item>
                    {functionCd === nonPatientFunctionCd && _.isEmpty(emptyTimeslotDateList) &&
                        <DtsReferralList
                            style={{margin:0}}
                            addToGeneralAppointmentObjList={this.props.addToGeneralAppointmentObjList}
                            appointmentAction={this.props.appointmentAction}
                            openDeleteAppointmentAction={this.props.openDeleteAppointmentAction}
                            setBookingMode={this.props.setBookingMode}
                            setBookingModeAsync={this.props.setBookingModeAsync}
                            showAppointment={this.props.showAppointment}
                        />
                    }
                    {functionCd === nonPatientFunctionCd && !_.isEmpty(emptyTimeslotDateList) &&
                        <DtsEmptyTimeslotPatientGroup style={{margin:0}} setBookingMode={this.props.setBookingMode}/>
                    }
                    {functionCd === nonPatientFunctionCd || <DtsBookingAlert/>}
                    {functionCd === nonPatientFunctionCd ? null :
                        (
                            <DtsPatientAppointmentList
                                appointmentAction={this.props.appointmentAction}
                                openDeleteAppointmentAction={this.props.openDeleteAppointmentAction}
                                openReserveListDialogAction={this.props.openReserveListDialogAction}
                                bookingMode={this.props.bookingMode}
                                setBookingMode={this.props.setBookingMode}
                                setBookingModeAsync={this.props.setBookingModeAsync}
                                openTimeslotLogDialogAction={this.props.openTimeslotLogDialogAction}
                                addToGeneralAppointmentObjList={this.props.addToGeneralAppointmentObjList}
                                openContactHistoryDialogAction={this.props.openContactHistoryDialogAction}
                            />
                        )
                    }
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        emptyTimeslotDateList: state.dtsAppointmentBooking.emptyTimeslotDateList
    };
};

export default connect(mapStateToProps)(withStyles(styles)(DtsRightPanel));
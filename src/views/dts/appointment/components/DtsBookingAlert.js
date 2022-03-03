import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

import Grid from '@material-ui/core/Grid';

import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import 'font-awesome/css/font-awesome.css';
import { connect } from 'react-redux';

import { getBookingAlert } from '../../../../store/actions/dts/appointment/bookingAction';

const styles = {
    root:{
        width:'95%',
        margin:'10px auto auto auto',
        boxShadow:'0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        textAlign:'center'
    },
    container:{
        padding:'6px 5px 5px 5px',
        backgroundColor: '#4ea93b87',
        '&.alert':{
            backgroundColor: '#ff4835'
        }
    },
    title:{
        color: '#fff',
        fontWeight:'bold'
    },
    body:{

    }
};

class DtsBookingAlert extends Component {

    constructor(props){
        super(props);
        this.state = {
            bookingAlert: []
        };
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate() {
        // if (this.props.patient && this.props.patient.patientKey){
        //     this.props.getPatientBookingAlert({patientKey:this.props.patient.patientKey});
        // }
    }

    loadData = () =>  {
        if (this.props.patient && this.props.patient.patientKey) {
            this.props.getBookingAlert(
                {
                    patientKey: this.props.patient.patientKey
                },this.setBookingAlert);
        }
    }

    setBookingAlert = (bookingAlert) => {
        if(bookingAlert.length) {
            this.setState((prevState) => ({ bookingAlert : bookingAlert}));
        }
    }

    getBookingAlertIcon = (bookingAlertCode) => {
        switch (bookingAlertCode) {
            case 'BLEEDING_TENDENCY':
                return(<Icon className="fa fa-tint" style={{ color: '#ff4835', fontSize: 20, marginRight: 10 }} />);
            case 'REQUIRE_ANTIBIOTIC_COVER':
                return(<Icon className="fa fa-flask" style={{ color: '#ff4835', fontSize: 20, marginRight: 10 }} />);
            case 'MEDICAL_ALERT':
                return(<Icon className="fa fa-plus-circle" style={{ color: '#ff4835', fontSize: 20, marginRight: 10 }} />);
            default:
                return(null);
        }
    }

    render(){
        const { classes, className, bookingAlert, ...rest } = this.props;

        if (this.props.patient && this.props.patient.patientKey){
            return (
                <Grid className={classes.root}>
                    <Paper variant="outlined" square className={classes.container + (this.state.bookingAlert.length == 0 ? '' : ' alert')}>
                    {/* <Paper variant="outlined" square className={classes.container + (bookingAlert.trim() === '' ? '' : ' alert')}> */}
                        <Typography className={classes.title}>Booking Alert</Typography>

                        {this.state.bookingAlert.map((value, index) => {
                            return value.alertEnabled ?
                            (<Card style={{margin:5, display:'inline-block', width:'30%', minHeight:58}} key={value.alertCode}>
                                <CardContent style={{display: 'flex', alignItems: 'center', padding: 10, height:40}}>
                                    {this.getBookingAlertIcon(value.alertCode)}
                                    <Typography className={classes.body} align="left" style={{fontSize:13}}>{value.alertContent}</Typography>
                                </CardContent>
                            </Card>) : null;
                        })}

                        {this.state.bookingAlert.length == 0 &&
                            <Card style={{marginTop:5}}>
                                <CardContent>
                                    <Typography className={classes.body}>{'No booking alert!'}</Typography>
                                </CardContent>
                            </Card>}

                        {/* <Card style={{marginTop:5}}><CardContent><Typography className={classes.body}>{bookingAlert.trim() === '' ? 'No booking alert!' : bookingAlert.trim()}</Typography></CardContent></Card> */}
                    </Paper>
                </Grid>
            );
        }
        else {
            return (null);
        }
    }

}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo
    };
};

const mapDispatchToProps = {
    getBookingAlert
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsBookingAlert));
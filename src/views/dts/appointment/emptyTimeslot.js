import React, { Component } from 'react';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import _ from 'lodash';
import DtsEmptyTimeslotSearchPanel from './components/DtsEmptyTimeslotSearchPanel';
import DtsEmptyTimeslotList from './components/DtsEmptyTimeslotList';
import { contactHistoryAction } from '../../../enums/dts/appointment/contactHistoryActionEnum';
import dtstheme from '../theme';
import {
    resetAll,
    setSelectedEmptyTimeslotList
} from '../../../store/actions/dts/appointment/emptyTimeslotAction';

import DtsButton from '../components/DtsButton';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

// import {
//     resetAll
// } from '../../../store/actions/dts/appointment/appointmentAction';

import Enum from '../../../enums/enum';

// const defaultTheme = createMuiTheme();

const styles = (theme) => ({
    root: {
        width: '100%',
        overflow: 'initial'
    },
    container: {
        flexWrap: 'wrap'
    },
    searchBoxBtn:{
        width: '15%',
        marginTop:'0px'
    },
    leftPanel: {
        width: '350px',
        margin: '0px 5px'
    },
    rightPanel: {
        width: '1540px',
        margin: '0px 5px'
    }
});


class EmptyTimeslot extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openContactHistoryDialog: false,
            contactHistoryAction: null,
            contactHistoryAppointmentId: null,
            openInsertAppointmentDialog: false,
            left: false //Miki
        };
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    openSearchBox = (anchor, classes) => (
        <Grid item container aligItems="center" className={classes.leftPanel}>
            <Grid className={classes.leftPanelItme} item>
                <h4 style={{textAlign:'center'}}>Search Empty Timeslot</h4>
                <DtsEmptyTimeslotSearchPanel
                    onClose={this.toggleDrawer(anchor, false)}
                />
            </Grid>
        </Grid>
    );
    toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.setState({[anchor]: open });
    };
    render() {
        const { classes } = this.props;

        return (
            <MuiThemeProvider theme={dtstheme}>
                {/* <MuiThemeProvider theme={defaultTheme}> */}
                <Grid container className={classes.root}>
                    <div className={classes.root}>
                        <Grid container className={classes.container}>
                            <Grid item xs={12}>
                            {['right'].map((anchor) => (
                                <React.Fragment key={anchor}>
                                    <DtsButton className={classes.searchBoxBtn} iconType={'SEARCH'} onClick={this.toggleDrawer(anchor, true)}>Search Empty Timeslot</DtsButton>
                                    <SwipeableDrawer
                                        anchor={anchor}
                                        open={this.state[anchor]}
                                        onClose={this.toggleDrawer(anchor, false)}
                                        onOpen={this.toggleDrawer(anchor, true)}
                                        keepMounted
                                    >
                                        {this.openSearchBox(anchor, classes)}
                                    </SwipeableDrawer>
                                </React.Fragment>
                            ))}
                            </Grid>
                            {/* <Grid item container direction="column" aligItems="center" className={classes.leftPanel}>
                                <Grid className={classes.leftPanelItme} item><DtsEmptyTimeslotSearchPanel /></Grid>
                            </Grid> */}
                            <Grid item xs={12} className={classes.rightPanel}>
                                <Grid item>
                                    <DtsEmptyTimeslotList />
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>

                </Grid>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo
    };
};

const mapDispatchToProps = {
    setSelectedEmptyTimeslotList,
    resetAll

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EmptyTimeslot));

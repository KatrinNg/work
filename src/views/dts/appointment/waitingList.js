import React, { Component } from 'react';
import { withStyles , MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import _ from 'lodash';
import DtsWaitingList from './components/DtsWaitingList';
import DtsWaitingListDetailDialog from './components/DtsWaitingListDetailDialog';

import dtstheme from '../theme';
import {
    resetAll
} from '../../../store/actions/dts/appointment/waitingListAction';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {
    CREATE_MODE,
    VIEW_MODE,
    UPDATE_MODE,
    DISCONTINUE_MODE
} from '../../../constants/dts/appointment/DtsWaitingListConstant';


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
        flexWrap: 'nowrap'
    },
    gridPanel: {
        width:'1890px'
    }
});


class WaitingList extends Component {

    constructor(props){
        super(props);
        this.state = {
            openWaitingListDialog:false,
            editMode:null,
            selectedWaitingList:null
        };
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    handleCloseWaitingDialog = () => {
        this.setState({openWaitingListDialog:false});
    }

    handleOpenWaitingListDialog = (editMode, selectedWaitingList=null) => {
        //console.log('handleopenWaitingListDialog-selectedWaitingList:' + JSON.stringify(selectedWaitingList));
        this.setState({
            editMode:editMode,
            selectedWaitingList:selectedWaitingList,
            openWaitingListDialog:true
        });
    }

    render() {
        const { classes, waitingList } = this.props;

        return (
            <MuiThemeProvider theme={dtstheme}>
                {/* <MuiThemeProvider theme={defaultTheme}> */}
                <Grid container className={classes.root}>

                    <div className={classes.root}>
                        <Grid container className={classes.container}>
                            <Grid item className={classes.gridPanel}><DtsWaitingList openWaitingListDialog={(e) => this.handleOpenWaitingListDialog(VIEW_MODE,e)} /></Grid>

                            {this.state.openWaitingListDialog && <DtsWaitingListDetailDialog
                                openWaitingListDialog={this.state.openWaitingListDialog}
                                closeWaitingDialog={this.handleCloseWaitingDialog}
                                waitingList={waitingList}
                                editMode={this.state.editMode}
                                selectedWaitingList={this.state.selectedWaitingList}
                                                                 />}

                        </Grid>
                    <CIMSButton onClick={() => this.handleOpenWaitingListDialog(CREATE_MODE)} color="primary">Create</CIMSButton>
                    </div>

                </Grid>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        //patient: state.patient.patientInfo,
        //appointmentListReport: state.dtsSearchAppointment.appointmentListReport
        //waitingList
    };
};

const mapDispatchToProps = {
    resetAll

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(WaitingList));

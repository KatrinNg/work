import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid
} from '@material-ui/core';
import PaperBasedRecord from './component/miscellaneous/paperBasedRecord';
import PatientReminder from './component/miscellaneous/patientReminder';
import WaiverInformation from './component/miscellaneous/waiverInfomation';
import {
    updateState
} from '../../store/actions/registration/registrationAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import {
    openCommonCircularDialog,
    closeCommonCircularDialog
} from '../../store/actions/common/commonAction';

const style = () => ({

    root: {
        paddingTop: 10
    },
    grid: {
        justifyContent: 'center',
        // padding: '5px 10px 5px 5px'
        padding: '5px 27px'
    }
});

class Miscellaneous extends Component {

    handleChangePaperBasedRec = (newPaperBaseRecList) => {
        this.props.updateState({ paperBasedRecordList: newPaperBaseRecList });
    }

    handleChangeReminderList = (newReminderList) => {
        this.props.updateState({ patientReminderList: newReminderList });
    }

    handlerChangeWaiverList = (newWaiverList) => {
        this.props.updateState({ waiverList: newWaiverList });
    }
    clearAllErrMsg = () => {
        this.paperBasedRecRef.clearErrorMsg();
        this.patientReminderRef.clearErrorMsg();
        this.waiverInfoRef.clearErrorMsg();
    }

    validPaperBasedRec = () => {
        return new Promise(resolve => {
            resolve(this.paperBasedRecRef.validAllInputs());
        });
    }

    validPatientReminder = () => {
        return new Promise(resolve => {
            resolve(this.patientReminderRef.validAllInputs());
        });
    }

    validWaiverInfo = () => {
        return new Promise(resolve => {
            resolve(this.waiverInfoRef.validAllInputs());
        });
    }

    focusPaperBasedFail = () => {
        this.paperBasedRecRef.focusFirstFail();
    }

    focusPatientReminderFail = () => {
        this.patientReminderRef.focusFirstFail();
    }

    focusWaiverInfoFail = () => {
        this.waiverInfoRef.focusFirstFail();
    }

    render() {
        const {
            classes,
            comDisabled,
            registerCodeList,
            serviceList,
            clinicList,
            paperBasedRecordList,
            patientReminderList,
            waiverList,
            service,
            loginName
        } = this.props;
        const id = 'registration_miscellaneous';
        return (
            <Grid container className={classes.root} direction={'column'}>
                <Grid container className={classes.grid}>
                    <PaperBasedRecord
                        id={`${id}_paper_based_record`}
                        innerRef={ref => this.paperBasedRecRef = ref}
                        codeList={registerCodeList}
                        serviceList={serviceList}
                        clinicList={clinicList}
                        comDisabled={comDisabled}
                        paperBasedRecordList={paperBasedRecordList}
                        service={service}
                        handleChangePaperBasedRec={this.handleChangePaperBasedRec}
                        openCommonMessage={this.props.openCommonMessage}
                    />
                </Grid>
                <Grid container className={classes.grid}>
                    <PatientReminder
                        id={`${id}_patient_reminder`}
                        innerRef={ref => this.patientReminderRef = ref}
                        comDisabled={comDisabled}
                        patientReminderList={patientReminderList}
                        handleChangeReminderList={this.handleChangeReminderList}
                        openCommonMessage={this.props.openCommonMessage}
                    />
                </Grid>
                <Grid container className={classes.grid}>
                    <WaiverInformation
                        id={`${id}_waiver_information`}
                        innerRef={ref => this.waiverInfoRef = ref}
                        codeList={registerCodeList}
                        comDisabled={comDisabled}
                        waiverList={waiverList}
                        handleChangeWiaverList={this.handlerChangeWaiverList}
                        openCommonMessage={this.props.openCommonMessage}
                        loginName={loginName}
                    />
                </Grid>
            </Grid>
        );
    }
}

function mapStateToProps(state) {
    return {
        registerCodeList: state.registration.codeList,
        serviceList: state.common.serviceList,
        clinicList: state.common.clinicList,
        paperBasedRecordList: state.registration.paperBasedRecordList,
        patientReminderList: state.registration.patientReminderList,
        waiverList: state.registration.waiverList,
        service: state.login.service,
        loginName: state.login.loginInfo.loginName
    };
}
const dispatchProps = {
    updateState,
    openCommonMessage,
    openCommonCircularDialog,
    closeCommonCircularDialog
};

export default connect(mapStateToProps, dispatchProps)(withStyles(style)(Miscellaneous));